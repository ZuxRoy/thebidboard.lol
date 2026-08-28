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
