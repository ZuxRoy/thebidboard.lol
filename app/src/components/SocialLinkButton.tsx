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
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={toggleOpen}
        aria-pressed={open}
        aria-label={label}
        className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${
          isLinked
            ? "bg-ink text-surface border-ink"
            : open
              ? "border-accent text-accent"
              : "border-border text-ink-soft hover:border-ink-faint hover:text-ink"
        }`}
      >
        <Icon className="w-4.5 h-4.5" />
      </button>
      <span className="sr-only">{label}</span>

      {open ? (
        <div className="fixed inset-x-4 top-1/3 z-30 mx-auto max-w-sm sm:absolute sm:inset-auto sm:top-full sm:mt-2 sm:left-1/2 sm:-translate-x-1/2 sm:w-64">
          <div className={`surface-card p-3 shadow-lg ${shake ? "animate-shake" : ""}`}>
            <label className="text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1 block">
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
              className={`w-full rounded-lg border px-2.5 py-1.5 text-sm bg-bg focus:outline-none ${
                error ? "border-accent" : "border-border"
              }`}
            />
            {error ? <p className="text-accent-dark text-xs mt-1">{error}</p> : null}
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-ink-faint hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commit}
                className="text-xs font-medium rounded-lg bg-ink text-surface px-3 py-1"
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
