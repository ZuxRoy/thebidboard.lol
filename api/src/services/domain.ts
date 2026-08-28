export class InvalidUrlError extends Error {}

const X_HOSTS = new Set(["x.com", "twitter.com"]);
const X_HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
const X_PROFILE_HINT = "Enter a profile URL like https://x.com/yourhandle";
const X_RESERVED_PATHS = new Set([
  "about",
  "account",
  "ads",
  "analytics",
  "bookmark",
  "bookmarks",
  "business",
  "communities",
  "community",
  "communitynotes",
  "compose",
  "developers",
  "download",
  "embed",
  "explore",
  "flow",
  "follow",
  "followers",
  "following",
  "grok",
  "hashtag",
  "help",
  "home",
  "i",
  "intent",
  "jobs",
  "lists",
  "login",
  "logout",
  "messages",
  "moments",
  "notifications",
  "oauth",
  "premium",
  "privacy",
  "rules",
  "safety",
  "search",
  "settings",
  "share",
  "signin",
  "signup",
  "status",
  "tos",
  "tweet",
  "tweets",
  "welcome",
  "widgets",
]);

function hostnameOf(parsed: URL): string {
  return parsed.hostname.toLowerCase().replace(/^www\./, "");
}

function parseXProfileHandle(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (!segment) return null;
  if (X_RESERVED_PATHS.has(segment.toLowerCase())) return null;
  if (!X_HANDLE_RE.test(segment)) return null;
  return segment;
}

export function listingDisplayName(url: string, domain: string): string {
  try {
    const parsed = new URL(url);
    if (X_HOSTS.has(hostnameOf(parsed))) {
      const handle = parseXProfileHandle(parsed.pathname);
      if (handle) return handle;
    }
  } catch {
    // fall through to stored domain
  }

  if (domain.startsWith("x.com/")) {
    return domain.slice("x.com/".length);
  }

  return domain;
}

export type NormalizedListing = {
  url: string;
  domain: string;
  displayName: string;
};

/**
 * Normalizes a submitted product URL into a unique listing key.
 * Regular sites use hostname (without "www."). X/Twitter profile URLs use x.com/{handle}.
 */
export function normalizeDomain(rawUrl: string): NormalizedListing {
  let candidate = rawUrl.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new InvalidUrlError("Enter a valid URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new InvalidUrlError("URL must use http or https");
  }

  const hostname = hostnameOf(parsed);
  if (!hostname.includes(".") || hostname.length < 3) {
    throw new InvalidUrlError("Enter a valid URL");
  }

  if (X_HOSTS.has(hostname)) {
    const handle = parseXProfileHandle(parsed.pathname);
    if (!handle) {
      throw new InvalidUrlError(X_PROFILE_HINT);
    }
    return {
      url: `https://x.com/${handle}`,
      domain: `x.com/${handle.toLowerCase()}`,
      displayName: handle,
    };
  }

  return { url: parsed.toString(), domain: hostname, displayName: hostname };
}

const SOCIAL_PATTERNS: Record<string, RegExp> = {
  instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i,
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@?.+/i,
};

export type SocialPlatform = keyof typeof SOCIAL_PATTERNS;

export function isValidSocialUrl(platform: SocialPlatform, url: string): boolean {
  const pattern = SOCIAL_PATTERNS[platform];
  if (!pattern) return false;
  return pattern.test(url.trim());
}
