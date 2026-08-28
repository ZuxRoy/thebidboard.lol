import { env } from "../config/env.js";

const GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql";
const CACHE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_LOOKBACK_DAYS = 31;

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

type AnalyticsLog = {
  error: (obj: unknown, msg: string) => void;
  warn?: (obj: unknown, msg: string) => void;
  info?: (obj: unknown, msg: string) => void;
};

let cache: CacheEntry | null = null;
let inFlight: Promise<CloudflareTraffic | null> | null = null;

function dateStamp(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isConfigured(): boolean {
  return Boolean(env.CLOUDFLARE_API_TOKEN?.trim() && env.CLOUDFLARE_ZONE_ID?.trim());
}

function utcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function lookbackRange(days: number): { since: string; until: string } {
  const until = utcDay(new Date());
  until.setUTCDate(until.getUTCDate() + 1);
  const since = new Date(until);
  since.setUTCDate(since.getUTCDate() - days);
  return { since: dateStamp(since), until: dateStamp(until) };
}

const SETTINGS_QUERY = `
query ZoneClickSettings($zoneTag: string!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      settings {
        httpRequests1dGroups {
          enabled
          maxDuration
          notOlderThan
        }
      }
    }
  }
}
`;

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

interface DatasetSettings {
  enabled?: boolean;
  maxDuration?: number;
  notOlderThan?: number;
}

interface GraphQLBody {
  data?: {
    viewer?: {
      zones?: Array<{
        httpRequests1dGroups?: GraphQLGroup[];
        settings?: { httpRequests1dGroups?: DatasetSettings };
      }>;
    };
  };
  errors?: Array<{ message?: string; path?: Array<string | number> }>;
}

function graphqlErrorMessage(body: GraphQLBody, fallback: string): string {
  const parts = body.errors
    ?.map((err) => {
      const path = err.path?.length ? ` (${err.path.join(".")})` : "";
      return err.message ? `${err.message}${path}` : null;
    })
    .filter(Boolean);
  return parts?.length ? parts.join("; ") : fallback;
}

async function graphqlRequest(token: string, query: string, variables: Record<string, string>): Promise<GraphQLBody> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = (await response.json()) as GraphQLBody;
  if (!response.ok || body.errors?.length) {
    throw new Error(graphqlErrorMessage(body, `HTTP ${response.status}`));
  }
  return body;
}

function zonesFrom(body: GraphQLBody) {
  return body.data?.viewer?.zones ?? [];
}

async function resolveLookbackDays(token: string, zoneId: string): Promise<number> {
  const body = await graphqlRequest(token, SETTINGS_QUERY, { zoneTag: zoneId });
  const zones = zonesFrom(body);
  if (zones.length === 0) {
    throw new Error("Cloudflare zone not found or token lacks Analytics access");
  }

  const settings = zones[0]?.settings?.httpRequests1dGroups;
  if (settings?.enabled === false) {
    throw new Error("Cloudflare httpRequests1dGroups is not enabled for this zone");
  }

  const maxDays = [
    settings?.notOlderThan,
    settings?.maxDuration,
  ]
    .filter((seconds): seconds is number => typeof seconds === "number" && seconds > 0)
    .map((seconds) => Math.max(1, Math.floor(seconds / 86400)));

  if (maxDays.length === 0) return DEFAULT_LOOKBACK_DAYS;
  return Math.min(DEFAULT_LOOKBACK_DAYS, ...maxDays);
}

async function fetchTraffic(): Promise<CloudflareTraffic> {
  const token = env.CLOUDFLARE_API_TOKEN?.trim();
  const zoneId = env.CLOUDFLARE_ZONE_ID?.trim();
  if (!token || !zoneId) {
    throw new Error("Cloudflare analytics is not configured");
  }

  const days = await resolveLookbackDays(token, zoneId);
  const { since, until } = lookbackRange(days);

  const body = await graphqlRequest(token, TRAFFIC_QUERY, {
    zoneTag: zoneId,
    date_geq: since,
    date_lt: until,
  });

  const zones = zonesFrom(body);
  if (zones.length === 0) {
    throw new Error("Cloudflare zone not found or token lacks Analytics access");
  }

  const points = (zones[0]?.httpRequests1dGroups ?? [])
    .map((group) => ({
      date: group.dimensions?.date ?? "",
      clicks: group.sum?.requests ?? 0,
    }))
    .filter((point) => point.date);

  const series = fillDailySeries(since, until, points);
  const clicks = series.reduce((total, point) => total + point.clicks, 0);
  return { clicks, series };
}

function fillDailySeries(since: string, until: string, points: CloudflareClickPoint[]): CloudflareClickPoint[] {
  const byDate = new Map(points.map((point) => [point.date, point.clicks]));
  const series: CloudflareClickPoint[] = [];
  const cursor = new Date(`${since}T00:00:00.000Z`);
  const end = new Date(`${until}T00:00:00.000Z`);
  while (cursor < end) {
    const date = dateStamp(cursor);
    series.push({ date, clicks: byDate.get(date) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return series;
}

export async function getCloudflareTraffic(log?: AnalyticsLog): Promise<CloudflareTraffic | null> {
  if (!isConfigured()) {
    log?.warn?.({}, "Cloudflare analytics skipped: CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID is missing");
    return null;
  }

  if (cache && cache.expiresAt > Date.now()) {
    return cache.value;
  }

  if (inFlight) return inFlight;

  inFlight = fetchTraffic()
    .then((value) => {
      if (value.series.length > 0 || value.clicks > 0) {
        cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      }
      log?.info?.({ clicks: value.clicks, days: value.series.length }, "Cloudflare analytics loaded");
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
