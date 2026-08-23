import { FaInstagram, FaLinkedin, FaTiktok, FaXTwitter } from "react-icons/fa6";
import type { SocialPlatform } from "../lib/validators";

const ICONS: Record<SocialPlatform, typeof FaInstagram> = {
  instagram: FaInstagram,
  twitter: FaXTwitter,
  linkedin: FaLinkedin,
  tiktok: FaTiktok,
};

interface SocialIconsRowProps {
  socials: Partial<Record<SocialPlatform, string>>;
  size?: "sm" | "md" | "lg";
}

export default function SocialIconsRow({ socials, size = "sm" }: SocialIconsRowProps) {
  const entries = (Object.entries(socials) as Array<[SocialPlatform, string | undefined]>).filter(
    ([, url]) => !!url
  );

  if (entries.length === 0) return null;

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : size === "md" ? "w-4 h-4" : "w-5 h-5";
  const boxSize = size === "sm" ? "w-6 h-6" : size === "md" ? "w-7 h-7" : "w-9 h-9";

  return (
    <div className="flex items-center gap-1.5">
      {entries.map(([platform, url]) => {
        const Icon = ICONS[platform];
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label={platform}
            className={`${boxSize} flex items-center justify-center rounded-full border border-ink/40 text-ink-soft hover:bg-ink hover:text-paper hover:border-ink transition-colors`}
          >
            <Icon className={iconSize} />
          </a>
        );
      })}
    </div>
  );
}
