import { Crown } from "@phosphor-icons/react";
import { FaInstagram, FaLinkedin, FaTiktok, FaXTwitter } from "react-icons/fa6";
import { useRef, useState } from "react";
import SocialLinkButton from "./SocialLinkButton";
import ListingRow from "./ListingRow";
import { ListingRowSkeleton } from "./Skeleton";
import { CATEGORY_FORM_OPTIONS, type CategoryId } from "../lib/categories";
import { isLikelyUrl, formatAmount, type SocialPlatform } from "../lib/validators";
import { useCreateListing, useListings, useTopListing } from "../lib/api";

const DESCRIPTION_LIMIT = 100;
const MIN_AMOUNT_DOLLARS = 1;

const SOCIAL_BUTTONS: Array<{ platform: SocialPlatform; label: string; icon: typeof FaInstagram }> = [
  { platform: "instagram", label: "Instagram", icon: FaInstagram },
  { platform: "twitter", label: "X", icon: FaXTwitter },
  { platform: "linkedin", label: "LinkedIn", icon: FaLinkedin },
  { platform: "tiktok", label: "TikTok", icon: FaTiktok },
];

export default function EntrySection() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryId>(CATEGORY_FORM_OPTIONS[0].id);
  const [socials, setSocials] = useState<Partial<Record<SocialPlatform, string>>>({});
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const createListing = useCreateListing();
  const { data: topListing, isLoading: topLoading } = useTopListing();
  const { data: allTimeTop, isLoading: leadersLoading } = useListings("all", 1, 3);
  const nextAmountCents = topListing?.nextAmountCents ?? 100;
  const allTimeLeaders = allTimeTop?.items ?? [];

  function pickAmount(cents: number) {
    setAmount((cents / 100).toString());
    urlInputRef.current?.focus();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!isLikelyUrl(url)) {
      setFormError("Enter a valid product URL");
      return;
    }
    if (!description.trim()) {
      setFormError("Add a short description");
      return;
    }
    const amountNumber = Number(amount);
    if (!amountNumber || amountNumber < MIN_AMOUNT_DOLLARS) {
      setFormError(`Minimum amount is $${MIN_AMOUNT_DOLLARS}`);
      return;
    }

    try {
      const result = await createListing.mutateAsync({
        url,
        description: description.trim(),
        category,
        socials,
        amountCents: Math.round(amountNumber * 100),
      });
      window.location.href = result.checkoutUrl;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <section id="claim" className="px-4 sm:px-6 pt-4 sm:pt-5 pb-5 max-w-6xl mx-auto w-full">
      <div className="text-center mb-4 sm:mb-5">
        <h1 className="display text-2xl sm:text-[2.15rem] leading-[1.1] font-semibold text-ink">
          Claim #1 for{" "}
          <button
            type="button"
            onClick={() => pickAmount(nextAmountCents)}
            className="amount text-accent-dark hover:text-accent transition-colors"
          >
            {topLoading ? (
              <span className="inline-block align-middle">
                <span className="inline-block h-8 w-20 rounded-md bg-black/[0.06] animate-pulse" />
              </span>
            ) : (
              formatAmount(nextAmountCents)
            )}
          </button>
        </h1>
      </div>

      <div className="claim-surface holo-glow holo-glow-fixed p-4 sm:p-5">
        <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-border gap-6 lg:gap-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:pr-6">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1.5 block">
                  Product URL
                </label>
                <input
                  ref={urlInputRef}
                  type="text"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://yourproduct.com"
                  className="w-full rounded-xl border border-border bg-white/70 px-3.5 py-2 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1.5 block">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as CategoryId)}
                  className="w-full rounded-xl border border-border bg-white/70 px-3.5 py-2 text-sm focus:outline-none focus:border-accent"
                >
                  {CATEGORY_FORM_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                  Description
                </label>
                <span className="text-[11px] text-ink-faint amount">
                  {description.length}/{DESCRIPTION_LIMIT}
                </span>
              </div>
              <textarea
                value={description}
                maxLength={DESCRIPTION_LIMIT}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What does your product do?"
                rows={1}
                className="w-full rounded-xl border border-border bg-white/70 px-3.5 py-2 text-sm resize-none focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {SOCIAL_BUTTONS.map(({ platform, label, icon }) => (
                  <SocialLinkButton
                    key={platform}
                    platform={platform}
                    label={label}
                    icon={icon}
                    value={socials[platform] ?? ""}
                    onChange={(value) =>
                      setSocials((prev) => ({ ...prev, [platform]: value || undefined }))
                    }
                  />
                ))}
              </div>
              <div className="flex items-end gap-3 flex-1 min-w-[220px] justify-end">
                <div className="w-28">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1.5 block">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    min={MIN_AMOUNT_DOLLARS}
                    step="1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder={String(nextAmountCents / 100)}
                    className="w-full rounded-xl border border-border bg-white/70 px-3.5 py-2 text-sm amount focus:outline-none focus:border-accent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={createListing.isPending}
                  className="bg-ink text-surface font-medium text-sm px-5 py-2 rounded-xl hover:bg-accent-dark transition-colors disabled:opacity-60"
                >
                  {createListing.isPending ? "Redirecting..." : "Claim your spot"}
                </button>
              </div>
            </div>

            {formError ? <p className="text-accent-dark text-sm text-center">{formError}</p> : null}
          </form>

          <aside className="flex flex-col gap-2 min-w-0 pt-5 lg:pt-0 lg:pl-6 border-t border-border lg:border-t-0">
            <div className="flex items-center gap-2">
              <Crown size={14} weight="fill" className="text-rank-gold" />
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">All-time top 3</p>
            </div>
            {leadersLoading ? (
              <div className="flex flex-col gap-2">
                <ListingRowSkeleton compact />
                <ListingRowSkeleton compact />
                <ListingRowSkeleton compact />
              </div>
            ) : allTimeLeaders.length > 0 ? (
              <div className="flex flex-col gap-2">
                {allTimeLeaders.map((item) => {
                  const highlight = item.rank <= 3 ? (item.rank as 1 | 2 | 3) : undefined;
                  return (
                    <ListingRow
                      key={item.id}
                      item={item}
                      size="default"
                      highlight={highlight}
                      compact
                      embedded
                    />
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-white/70 flex items-center justify-center p-5 text-sm text-ink-faint">
                No listings yet. Claim the top spot.
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
