import { useState, type ComponentType } from "react";
import { isValidSocialUrl, SOCIAL_PLACEHOLDERS, type SocialPlatform } from "../lib/validators";

interface SocialLinkButtonProps {
  platform: SocialPlatform;
  label: string;
  icon: ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
}

export default function SocialLinkButton({ platform, label, icon: Icon, value, onChange }: SocialLinkButtonProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const isLinked = value.trim().length > 0;

  function toggleOpen() {
    setOpen((prev) => !prev);
    setError(null);
  }

  function triggerShake() {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  }

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      onChange("");
      setError(null);
      setOpen(false);
      return;
    }
    if (!isValidSocialUrl(platform, trimmed)) {
      setError(`That doesn't look like a valid ${label} link`);
      triggerShake();
      return;
    }
    onChange(trimmed);
    setError(null);
    setOpen(false);
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={toggleOpen}
        aria-pressed={open}
        aria-label={label}
        className={`w-11 h-11 flex items-center justify-center border-2 rounded-full transition-colors ${
          isLinked
            ? "bg-ink text-paper border-ink"
            : open
              ? "border-accent text-accent"
              : "border-ink text-ink hover:bg-ink hover:text-paper"
        }`}
      >
        <Icon className="w-5 h-5" />
      </button>
      <span className="text-[11px] uppercase tracking-wide text-ink-soft">{label}</span>

      {open ? (
        <div className="fixed inset-x-4 top-1/3 z-30 mx-auto max-w-sm sm:absolute sm:inset-auto sm:top-full sm:mt-2 sm:left-1/2 sm:-translate-x-1/2 sm:w-64">
          <div className={`newsprint-card p-3 ${shake ? "animate-shake" : ""}`}>
            <label className="text-[11px] uppercase tracking-wide text-ink-soft mb-1 block">
              {label} link
            </label>
            <input
              autoFocus
              type="text"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commit();
                }
                if (event.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder={SOCIAL_PLACEHOLDERS[platform]}
              className={`w-full border-2 px-2 py-1.5 text-sm font-body bg-paper focus:outline-none ${
                error ? "border-accent" : "border-ink"
              }`}
            />
            {error ? <p className="text-accent text-xs mt-1">{error}</p> : null}
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs uppercase tracking-wide text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commit}
                className="text-xs uppercase tracking-wide bg-ink text-paper px-3 py-1"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
