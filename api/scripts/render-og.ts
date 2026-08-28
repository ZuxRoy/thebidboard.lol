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

function node(style: Record<string, unknown>, children?: unknown) {
  return { type: "div", props: { style: { display: "flex", ...style }, children } };
}

function text(style: Record<string, unknown>, children: string) {
  return node(style, children);
}

function podiumBar(rank: string, height: number, width: number, border: string, fill: string, ink: string) {
  return node(
    {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      width,
      height,
      backgroundColor: fill,
      border: `2px solid ${border}`,
      borderRadius: 20,
      paddingBottom: 18,
    },
    [
      text(
        {
          fontFamily: "Fraunces",
          fontSize: rank === "1" ? 52 : 34,
          fontWeight: 600,
          color: ink,
          letterSpacing: "-0.04em",
        },
        `#${rank}`
      ),
    ]
  );
}

const tree = node(
  {
    width: WIDTH,
    height: HEIGHT,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#faf8f4",
    fontFamily: "Sora",
  },
  [
    node({
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage:
        "linear-gradient(to right, rgba(23,21,34,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,21,34,0.045) 1px, transparent 1px)",
      backgroundSize: "34px 34px",
    }),
    node({
      position: "absolute",
      width: 560,
      height: 560,
      borderRadius: 999,
      backgroundColor: "rgba(139, 92, 246, 0.28)",
      top: -200,
      left: -140,
    }),
    node({
      position: "absolute",
      width: 620,
      height: 620,
      borderRadius: 999,
      backgroundColor: "rgba(179, 115, 15, 0.32)",
      bottom: -260,
      right: -160,
    }),
    node({
      position: "absolute",
      width: 260,
      height: 260,
      borderRadius: 999,
      backgroundColor: "rgba(139, 92, 246, 0.16)",
      top: 220,
      left: 520,
    }),
    node(
      {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        alignItems: "center",
        paddingLeft: 40,
        paddingRight: 40,
        backgroundColor: "#171522",
        gap: 22,
      },
      [
        node({ alignItems: "center", gap: 10 }, [
          node({
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: "#b3730f",
          }),
          text(
            {
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#ffffff",
            },
            "Live board"
          ),
        ]),
        text({ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.72)" }, "Pay to claim #1"),
        text({ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.72)" }, "Highest bid keeps the spot"),
        text({ fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 700, color: "#fbeed7" }, "thebidboard.lol"),
      ]
    ),
    node(
      {
        position: "relative",
        width: "100%",
        height: "100%",
        paddingTop: 52,
        paddingLeft: 72,
        paddingRight: 64,
        paddingBottom: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      [
        node(
          {
            flexDirection: "column",
            justifyContent: "center",
            width: 620,
            gap: 28,
          },
          [
            text(
              {
                fontFamily: "Fraunces",
                fontSize: 78,
                fontWeight: 600,
                color: "#171522",
                letterSpacing: "-0.035em",
                lineHeight: 1,
              },
              "TheBidBoard"
            ),
            text(
              {
                fontSize: 28,
                fontWeight: 500,
                color: "#656074",
                lineHeight: 1.4,
                maxWidth: 560,
              },
              "A public leaderboard where products bid to sit at #1. Highest bid keeps the crown."
            ),
          ]
        ),
        node(
          {
            width: 380,
            height: 430,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#ffffff",
            border: "1px solid #e6e1d5",
            borderRadius: 28,
            paddingTop: 36,
            paddingBottom: 28,
            paddingLeft: 28,
            paddingRight: 28,
          },
          [
            node({ flexDirection: "column", alignItems: "center", gap: 8 }, [
              text(
                {
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#8b869a",
                },
                "Top of the board"
              ),
              text(
                {
                  fontFamily: "Fraunces",
                  fontSize: 118,
                  fontWeight: 600,
                  color: "#8a5709",
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                },
                "#1"
              ),
            ]),
            node({ flexDirection: "row", alignItems: "flex-end", gap: 14 }, [
              podiumBar("2", 118, 92, "#9aa0ac", "#ffffff", "#656074"),
              podiumBar("1", 168, 112, "#caa23a", "#fffdf8", "#8a5709"),
              podiumBar("3", 96, 92, "#bf7f4f", "#ffffff", "#bf7f4f"),
            ]),
          ]
        ),
      ]
    ),
  ]
);

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
