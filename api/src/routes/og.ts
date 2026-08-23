import type { FastifyInstance } from "fastify";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { Listing } from "../models/Listing.js";
import { getOgFonts } from "../services/ogFonts.js";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

const PAPER = "#f4ecd8";
const INK = "#1a1512";
const INK_SOFT = "#4a4038";
const ACCENT = "#b7291e";

type ScaleKey = "single" | "double" | "triple";

interface TopListing {
  domain: string;
  totalPaid: number;
}

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function faviconUrl(domain: string, size: number): string {
  return `https://www.google.com/s2/favicons?sz=${size}&domain=${encodeURIComponent(domain)}`;
}

function buildHeader() {
  return {
    type: "div",
    props: {
      style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", fontSize: 40, fontWeight: 900, color: INK },
            children: [
              "The",
              { type: "span", props: { style: { color: ACCENT }, children: "Bid" } },
              "Board",
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { fontSize: 20, color: INK_SOFT },
            children: "thebidboard.lol",
          },
        },
      ],
    },
  };
}

function buildFooter() {
  return {
    type: "div",
    props: {
      style: { display: "flex", justifyContent: "space-between", fontSize: 20, color: INK },
      children: [{ type: "div", props: { children: "Fight for the Top Spot" } }],
    },
  };
}

const COLUMN_SCALE: Record<
  ScaleKey,
  { favicon: number; name: number; amount: number; badge: number; gap: number; padding: string }
> = {
  single: { favicon: 140, name: 70, amount: 42, badge: 30, gap: 34, padding: "64px" },
  double: { favicon: 104, name: 52, amount: 36, badge: 26, gap: 22, padding: "48px" },
  triple: { favicon: 80, name: 38, amount: 28, badge: 22, gap: 18, padding: "40px" },
};

function buildListingColumn(listing: TopListing, rank: number, scale: ScaleKey) {
  const s = COLUMN_SCALE[scale];
  const isTop = rank === 1;

  return {
    type: "div",
    props: {
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: `${s.gap}px`,
        border: `3px solid ${isTop ? ACCENT : INK}`,
        padding: s.padding,
        textAlign: "center",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: s.badge,
              fontWeight: 700,
              letterSpacing: "2px",
              color: isTop ? ACCENT : INK_SOFT,
            },
            children: `#${rank}`,
          },
        },
        {
          type: "img",
          props: {
            src: faviconUrl(listing.domain, 128),
            width: s.favicon,
            height: s.favicon,
            style: { border: `2px solid ${INK}`, borderRadius: "10px", backgroundColor: PAPER },
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: s.name,
              fontWeight: 900,
              color: INK,
              lineHeight: 1.1,
              maxWidth: "100%",
            },
            children: listing.domain,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: s.amount,
              fontWeight: 700,
              color: ACCENT,
            },
            children: formatAmount(listing.totalPaid),
          },
        },
      ],
    },
  };
}

function buildEmptyCard(nextAmountCents: number) {
  return {
    type: "div",
    props: {
      style: {
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: PAPER,
        padding: "56px",
        fontFamily: "Playfair Display",
      },
      children: [
        buildHeader(),
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "20px",
              border: `3px solid ${INK}`,
              padding: "48px 56px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontFamily: "JetBrains Mono",
                    fontSize: 16,
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    color: INK_SOFT,
                  },
                  children: "Position #1 is open",
                },
              },
              {
                type: "div",
                props: {
                  style: { display: "flex", fontSize: 64, fontWeight: 900, color: INK, lineHeight: 1.15 },
                  children: "Nothing is listed yet",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontFamily: "JetBrains Mono",
                    fontSize: 34,
                    fontWeight: 700,
                    color: ACCENT,
                  },
                  children: `Claim it for ${formatAmount(nextAmountCents)}`,
                },
              },
            ],
          },
        },
        buildFooter(),
      ],
    },
  };
}

function buildPopulatedCard(listings: TopListing[]) {
  const scale: ScaleKey =
    listings.length === 1 ? "single" : listings.length === 2 ? "double" : "triple";

  return {
    type: "div",
    props: {
      style: {
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: PAPER,
        padding: "56px",
        fontFamily: "Playfair Display",
      },
      children: [
        buildHeader(),
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "row", gap: "28px", flex: 1, alignItems: "stretch" },
            children: listings.map((listing, index) =>
              buildListingColumn(listing, index + 1, scale)
            ),
          },
        },
        buildFooter(),
      ],
    },
  };
}

async function renderOgImage(): Promise<Buffer> {
  const topListings = await Listing.find({ status: "active" })
    .sort({ totalPaid: -1 })
    .limit(3)
    .lean();

  const nextAmountCents = (topListings[0]?.totalPaid ?? 0) + 100;

  const element =
    topListings.length > 0
      ? buildPopulatedCard(topListings.map((l) => ({ domain: l.domain, totalPaid: l.totalPaid })))
      : buildEmptyCard(nextAmountCents);

  const fonts = await getOgFonts();

  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: CARD_WIDTH },
    font: { loadSystemFonts: false },
  });
  return resvg.render().asPng();
}

export default async function ogRoutes(fastify: FastifyInstance) {
  fastify.get("/og-image.png", async (_request, reply) => {
    try {
      const png = await renderOgImage();
      reply.header("Content-Type", "image/png").header("Cache-Control", "public, max-age=60").send(png);
    } catch (err) {
      fastify.log.error(err, "Failed to render OG image");
      reply.status(500).send({ error: "Failed to render preview image" });
    }
  });
}
