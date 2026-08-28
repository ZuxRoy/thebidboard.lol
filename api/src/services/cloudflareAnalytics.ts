import { env } from "../config/env.js";

const GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql";
const CACHE_TTL_MS = 10 * 60 * 1000;

export interface CloudflareClickPoint {
  date: string;
  clicks: number;
}

export interface CloudflareTraffic {
  clicks: number;
  series: CloudflareClickPoint[];
}

interface CacheEntry {
  value: CloudflareTraffic;
  expiresAt: number;
}

let cache: CacheEntry | null = null;
let inFlight: Promise<CloudflareTraffic | null> | null = null;

function dateStamp(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isConfigured(): boolean {
  return Boolean(env.CLOUDFLARE_API_TOKEN?.trim() && env.CLOUDFLARE_ZONE_ID?.trim());
}

const TRAFFIC_QUERY = `
query ZoneClicks($zoneTag: string!, $date_geq: Date!, $date_lt: Date!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequests1dGroups(
        limit: 5000
        filter: { date_geq: $date_geq, date_lt: $date_lt }
        orderBy: [date_ASC]
      ) {
        dimensions {
          date
        }
        sum {
          requests
        }
      }
    }
  }
}
`;

interface GraphQLGroup {
  dimensions?: { date?: string };
  sum?: { requests?: number };
}

interface GraphQLBody {
  data?: {
    viewer?: {
      zones?: Array<{
        httpRequests1dGroups?: GraphQLGroup[];
      }>;
    };
  };
  errors?: Array<{ message?: string }>;
}

async function fetchTraffic(): Promise<CloudflareTraffic | null> {
  const token = env.CLOUDFLARE_API_TOKEN?.trim();
  const zoneId = env.CLOUDFLARE_ZONE_ID?.trim();
  if (!token || !zoneId) return null;

  const until = new Date();
  until.setUTCDate(until.getUTCDate() + 1);
  const since = new Date(Date.UTC(2018, 0, 1));

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: TRAFFIC_QUERY,
      variables: {
        zoneTag: zoneId,
        date_geq: dateStamp(since),
        date_lt: dateStamp(until),
      },
    }),
  });

  const body = (await response.json()) as GraphQLBody;
  if (!response.ok || body.errors?.length) {
    const message = body.errors?.map((err) => err.message).filter(Boolean).join("; ") || `HTTP ${response.status}`;
    throw new Error(message);
  }

  const zones = body.data?.viewer?.zones ?? [];
  if (zones.length === 0) {
    throw new Error("Cloudflare zone not found or token lacks Analytics access");
  }

  const series = (zones[0]?.httpRequests1dGroups ?? [])
    .map((group) => ({
      date: group.dimensions?.date ?? "",
      clicks: group.sum?.requests ?? 0,
    }))
    .filter((point) => point.date);

  const clicks = series.reduce((total, point) => total + point.clicks, 0);
  return { clicks, series };
}

export async function getCloudflareTraffic(log?: { error: (obj: unknown, msg: string) => void }): Promise<CloudflareTraffic | null> {
  if (!isConfigured()) return null;

  if (cache && cache.expiresAt > Date.now()) {
    return cache.value;
  }

  if (inFlight) return inFlight;

  inFlight = fetchTraffic()
    .then((value) => {
      if (value) {
        cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      }
      return value;
    })
    .catch((err) => {
      log?.error({ err }, "Cloudflare analytics query failed");
      return cache?.value ?? null;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
