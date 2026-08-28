import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { Font as SatoriFont, FontWeight } from "satori";

const WIDTH = 1200;
const HEIGHT = 630;
const LEGACY_UA =
  "Mozilla/5.0 (Linux; U; Android 2.3.6; en-us; Nexus S Build/GRK39F) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1";

const FONT_SPECS: Array<{ family: string; weight: FontWeight }> = [
  { family: "Fraunces", weight: 600 },
  { family: "Sora", weight: 500 },
  { family: "Sora", weight: 700 },
  { family: "JetBrains Mono", weight: 700 },
];

async function loadFonts(): Promise<SatoriFont[]> {
  return Promise.all(
    FONT_SPECS.map(async ({ family, weight }) => {
      const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
      const cssRes = await fetch(cssUrl, { headers: { "User-Agent": LEGACY_UA } });
      if (!cssRes.ok) throw new Error(`Font CSS ${family} ${weight}: ${cssRes.status}`);
      const css = await cssRes.text();
      const match = css.match(/src: url\(([^)]+)\)/);
      if (!match) throw new Error(`No font file for ${family} ${weight}`);
      const fileRes = await fetch(match[1]);
      return { name: family, data: await fileRes.arrayBuffer(), weight, style: "normal" as const };
    })
  );
}

function rankCard(rank: 1 | 2 | 3) {
  const meta = {
    1: { label: "TOP SPOT", amount: "$99+", border: "#caa23a", bg: "#fffdf8", width: 280, height: 196 },
    2: { label: "CHASING", amount: "OUTBID", border: "#9aa0ac", bg: "#ffffff", width: 200, height: 148 },
    3: { label: "CLIMBING", amount: "BID UP", border: "#bf7f4f", bg: "#ffffff", width: 200, height: 148 },
  }[rank];

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: meta.width,
        height: meta.height,
        backgroundColor: meta.bg,
        border: `2px solid ${meta.border}`,
        borderRadius: 22,
        padding: rank === 1 ? "22px 24px" : "16px 18px",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: rank === 1 ? 18 : 14,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: rank === 1 ? "#8a5709" : "#8b869a",
            },
            children: `#${rank}`,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: 6,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontFamily: "Fraunces",
                    fontSize: rank === 1 ? 28 : 20,
                    fontWeight: 600,
                    color: "#171522",
                  },
                  children: meta.label,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontFamily: "JetBrains Mono",
                    fontSize: rank === 1 ? 22 : 16,
                    fontWeight: 700,
                    color: "#b3730f",
                  },
                  children: meta.amount,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

const tree = {
  type: "div",
  props: {
    style: {
      width: WIDTH,
      height: HEIGHT,
      display: "flex",
      position: "relative",
      overflow: "hidden",
      backgroundColor: "#faf8f4",
      fontFamily: "Sora",
    },
    children: [
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(to right, rgba(23,21,34,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,21,34,0.05) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            display: "flex",
            width: 540,
            height: 540,
            borderRadius: 999,
            backgroundColor: "rgba(139, 92, 246, 0.3)",
            top: -190,
            left: -120,
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            display: "flex",
            width: 580,
            height: 580,
            borderRadius: 999,
            backgroundColor: "rgba(179, 115, 15, 0.34)",
            bottom: -220,
            right: -80,
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            display: "flex",
            width: 280,
            height: 280,
            borderRadius: 999,
            backgroundColor: "rgba(139, 92, 246, 0.18)",
            bottom: 40,
            left: 420,
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
          },
          children: [
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  width: 560,
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        fontFamily: "Fraunces",
                        fontSize: 42,
                        fontWeight: 600,
                        color: "#171522",
                        letterSpacing: "-0.03em",
                      },
                      children: "TheBidBoard",
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", flexDirection: "column", gap: 18 },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: {
                              display: "flex",
                              fontFamily: "Fraunces",
                              fontSize: 58,
                              fontWeight: 600,
                              color: "#171522",
                              lineHeight: 1.05,
                              letterSpacing: "-0.03em",
                            },
                            children: "Pay to own #1.",
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: {
                              display: "flex",
                              fontSize: 26,
                              fontWeight: 500,
                              color: "#656074",
                              lineHeight: 1.35,
                              maxWidth: 480,
                            },
                            children: "The public product leaderboard. Highest bid keeps the crown.",
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
                        fontFamily: "JetBrains Mono",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#8a5709",
                      },
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
                  alignItems: "flex-end",
                  gap: 16,
                },
                children: [
                  rankCard(1),
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", flexDirection: "row", gap: 14 },
                      children: [rankCard(2), rankCard(3)],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
};

const here = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(here, "../../app/public/og.png");

const fonts = await loadFonts();
const svg = await satori(tree as Parameters<typeof satori>[0], { width: WIDTH, height: HEIGHT, fonts });
const png = new Resvg(svg, {
  fitTo: { mode: "width", value: WIDTH },
  font: { loadSystemFonts: false },
}).render().asPng();

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, png);
console.log(`Wrote ${outPath} (${png.byteLength} bytes)`);
