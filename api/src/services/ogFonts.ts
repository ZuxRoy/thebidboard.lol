import type { Font as SatoriFont, FontWeight } from "satori";

// Google Fonts' css2 endpoint serves woff2/woff to modern user agents, but satori
// needs raw TTF/OTF bytes. An old browser user agent (pre-WOFF support) makes it
// fall back to serving plain .ttf files.
const LEGACY_USER_AGENT =
  "Mozilla/5.0 (Linux; U; Android 2.3.6; en-us; Nexus S Build/GRK39F) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1";

const FONT_SPECS: Array<{ family: string; weight: FontWeight }> = [
  { family: "Playfair Display", weight: 900 },
  { family: "Playfair Display", weight: 700 },
  { family: "JetBrains Mono", weight: 700 },
];

let cachedFonts: SatoriFont[] | null = null;
let loadingPromise: Promise<SatoriFont[]> | null = null;

async function fetchFontFileUrl(family: string, weight: FontWeight): Promise<string> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  const res = await fetch(cssUrl, { headers: { "User-Agent": LEGACY_USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Failed to fetch font CSS for ${family} ${weight}: ${res.status}`);
  }
  const css = await res.text();
  const match = css.match(/src: url\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Could not find a font file URL for ${family} ${weight}`);
  }
  return match[1];
}

async function loadFonts(): Promise<SatoriFont[]> {
  return Promise.all(
    FONT_SPECS.map(async ({ family, weight }) => {
      const fileUrl = await fetchFontFileUrl(family, weight);
      const fileRes = await fetch(fileUrl);
      const data = await fileRes.arrayBuffer();
      return { name: family, data, weight, style: "normal" as const };
    })
  );
}

export function getOgFonts(): Promise<SatoriFont[]> {
  if (cachedFonts) {
    return Promise.resolve(cachedFonts);
  }
  if (!loadingPromise) {
    loadingPromise = loadFonts()
      .then((fonts) => {
        cachedFonts = fonts;
        return fonts;
      })
      .catch((err) => {
        loadingPromise = null;
        throw err;
      });
  }
  return loadingPromise;
}
