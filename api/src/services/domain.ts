export class InvalidUrlError extends Error {}

/**
 * Normalizes a submitted product URL into a lowercase hostname (without "www.")
 * so the same product can't be listed twice under slightly different URLs.
 */
export function normalizeDomain(rawUrl: string): { url: string; domain: string } {
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

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!hostname.includes(".") || hostname.length < 3) {
    throw new InvalidUrlError("Enter a valid URL");
  }

  return { url: parsed.toString(), domain: hostname };
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
