export type SocialPlatform = "instagram" | "twitter" | "linkedin" | "tiktok";

const SOCIAL_PATTERNS: Record<SocialPlatform, RegExp> = {
  instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i,
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@?.+/i,
};

export const SOCIAL_PLACEHOLDERS: Record<SocialPlatform, string> = {
  instagram: "https://instagram.com/yourhandle",
  twitter: "https://x.com/yourhandle",
  linkedin: "https://linkedin.com/company/yourcompany",
  tiktok: "https://tiktok.com/@yourhandle",
};

export function isValidSocialUrl(platform: SocialPlatform, url: string): boolean {
  if (!url.trim()) return false;
  return SOCIAL_PATTERNS[platform].test(url.trim());
}

const X_HOSTS = new Set(["x.com", "twitter.com"]);
const X_HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
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

export const X_PROFILE_URL_HINT = "Enter a profile URL like https://x.com/yourhandle";

function parseXProfileHandle(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (!segment) return null;
  if (X_RESERVED_PATHS.has(segment.toLowerCase())) return null;
  if (!X_HANDLE_RE.test(segment)) return null;
  return segment;
}

function parseProductUrl(value: string): URL | null {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

export function xProfileHandleFromUrl(value: string): string | null {
  const parsed = parseProductUrl(value);
  if (!parsed) return null;
  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!X_HOSTS.has(hostname)) return null;
  return parseXProfileHandle(parsed.pathname);
}

export function xProfileHandleFromDomain(domain: string): string | null {
  if (!domain.startsWith("x.com/")) return null;
  const handle = domain.slice("x.com/".length);
  return parseXProfileHandle(`/${handle}`);
}

export function listingIconSrc(url: string, domain: string, size: number): string | null {
  const handle = xProfileHandleFromUrl(url) ?? xProfileHandleFromDomain(domain);
  if (handle) {
    return `https://unavatar.io/x/${encodeURIComponent(handle)}?fallback=false`;
  }
  const hostname = domain.split("/")[0];
  if (hostname === "x.com" || hostname === "twitter.com") {
    return null;
  }
  return `https://www.google.com/s2/favicons?sz=${size}&domain=${encodeURIComponent(hostname)}`;
}

export function isXProductUrlMissingHandle(value: string): boolean {
  const parsed = parseProductUrl(value);
  if (!parsed) return false;
  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!X_HOSTS.has(hostname)) return false;
  return parseXProfileHandle(parsed.pathname) === null;
}

export function isLikelyUrl(value: string): boolean {
  const parsed = parseProductUrl(value);
  return Boolean(parsed?.hostname.includes("."));
}

export function extractDomain(value: string): string {
  const parsed = parseProductUrl(value);
  if (!parsed) return value;
  return parsed.hostname.replace(/^www\./, "");
}

export function formatAmount(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function formatTimeAgo(isoDate: string | Date): string {
  const date = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}
