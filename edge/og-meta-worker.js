/**
 * Attach this Worker to thebidboard.lol (frontend hostname, not the API).
 *
 * Crawlers of https://thebidboard.lol/ get og:image?v=<live board fingerprint>.
 * Always share the base URL. Do not increment ?v=3, ?v=4, … on the page.
 *
 * One-time unstick if X still shows the old “defender #1” card:
 *   1. Purge Cloudflare for https://api.thebidboard.lol/api/og-image.png
 *   2. Paste https://thebidboard.lol/ in a new X draft; use ?v=2 only if that preview is still stale
 *
 * Deploy: cd edge && wrangler deploy
 */

const CRAWLER_UA = /Twitterbot|facebookexternalhit|Slackbot|Discordbot|LinkedInBot|WhatsApp/i;
const STATIC_EXT = /\.(?:js|css|png|jpe?g|gif|svg|ico|webp|woff2?|ttf|json|map|txt|xml)$/i;
const DEFAULT_API_BASE = "https://api.thebidboard.lol";

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return fetch(request);
    }

    const ua = request.headers.get("user-agent") || "";
    const url = new URL(request.url);

    if (!CRAWLER_UA.test(ua) || STATIC_EXT.test(url.pathname)) {
      return fetch(request);
    }

    const apiBase = (env?.API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");
    const originResponse = await fetch(request);
    const contentType = originResponse.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return originResponse;
    }

    let fingerprint = "2";
    try {
      const fpResponse = await fetch(`${apiBase}/api/og-fingerprint`, {
        headers: { accept: "application/json" },
      });
      if (fpResponse.ok) {
        const data = await fpResponse.json();
        if (data && typeof data.v === "string" && data.v.length > 0) {
          fingerprint = data.v;
        }
      }
    } catch {
      // Fall back to the static ?v=2 bust in index.html
    }

    const imageUrl = `${apiBase}/api/og-image.png?v=${encodeURIComponent(fingerprint)}`;
    const headers = new Headers(originResponse.headers);
    headers.set("Cache-Control", "no-store");

    const htmlResponse = new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers,
    });

    return new HTMLRewriter()
      .on('meta[property="og:image"]', {
        element(el) {
          el.setAttribute("content", imageUrl);
        },
      })
      .on('meta[name="twitter:image"]', {
        element(el) {
          el.setAttribute("content", imageUrl);
        },
      })
      .transform(htmlResponse);
  },
};
