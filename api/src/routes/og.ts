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

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function buildCardElement(topDomain: string | null, topAmountCents: number, nextAmountCents: number) {
  const label = topDomain ? "Currently defending #1" : "Position #1 is open";
  const headline = topDomain ?? "Nothing is listed yet";
  const priceLine = topDomain
    ? `${formatAmount(topAmountCents)} paid — next bid ${formatAmount(nextAmountCents)}`
    : `Claim it for ${formatAmount(nextAmountCents)}`;

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
        {
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
        },
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
                    fontFamily: "JetBrains Mono",
                    fontSize: 16,
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    color: INK_SOFT,
                  },
                  children: label,
                },
              },
              {
                type: "div",
                props: {
                  style: { fontSize: 64, fontWeight: 900, color: INK, lineHeight: 1.15 },
                  children: headline,
                },
              },
              {
                type: "div",
                props: {
                  style: { fontFamily: "JetBrains Mono", fontSize: 34, fontWeight: 700, color: ACCENT },
                  children: priceLine,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              fontSize: 20,
              color: INK,
            },
            children: [{ type: "div", props: { children: "Fight for the Top Spot" } }],
          },
        },
      ],
    },
  };
}

async function renderOgImage(): Promise<Buffer> {
  const top = await Listing.findOne({ status: "active" }).sort({ totalPaid: -1 }).lean();
  const topAmountCents = top?.totalPaid ?? 0;
  const nextAmountCents = topAmountCents + 100;

  const [fonts, element] = await Promise.all([
    getOgFonts(),
    Promise.resolve(buildCardElement(top?.domain ?? null, topAmountCents, nextAmountCents)),
  ]);

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
