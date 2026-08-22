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

export function isLikelyUrl(value: string): boolean {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function extractDomain(value: string): string {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export function formatAmount(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
