import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { FaInstagram, FaLinkedin, FaTiktok, FaXTwitter } from "react-icons/fa6";
import SocialLinkButton from "./SocialLinkButton";
import { CATEGORY_FORM_OPTIONS, type CategoryId } from "../lib/categories";
import { isLikelyUrl, type SocialPlatform } from "../lib/validators";
import { useCreateListing } from "../lib/api";

export interface HeroClaimFormHandle {
  prefillAmount: (amountCents: number) => void;
}

const DESCRIPTION_LIMIT = 100;
const MIN_AMOUNT_DOLLARS = 1;

const SOCIAL_BUTTONS: Array<{ platform: SocialPlatform; label: string; icon: typeof FaInstagram }> = [
  { platform: "instagram", label: "Instagram", icon: FaInstagram },
  { platform: "twitter", label: "X", icon: FaXTwitter },
  { platform: "linkedin", label: "LinkedIn", icon: FaLinkedin },
  { platform: "tiktok", label: "TikTok", icon: FaTiktok },
];

const HeroClaimForm = forwardRef<HeroClaimFormHandle>(function HeroClaimForm(_props, ref) {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryId>(CATEGORY_FORM_OPTIONS[0].id);
  const [socials, setSocials] = useState<Partial<Record<SocialPlatform, string>>>({});
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const createListing = useCreateListing();

  useImperativeHandle(ref, () => ({
    prefillAmount(amountCents: number) {
      setAmount((amountCents / 100).toString());
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => urlInputRef.current?.focus(), 400);
    },
  }));

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
    <div ref={formRef} className="newsprint-card p-5 sm:p-7 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-[11px] uppercase tracking-wide text-ink-soft mb-1 block">
            Product URL
          </label>
          <input
            ref={urlInputRef}
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://yourproduct.com"
            className="w-full border-2 border-ink bg-paper px-3 py-2 font-body focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-1">
            <label className="text-[11px] uppercase tracking-wide text-ink-soft">Description</label>
            <span className="text-[11px] text-ink-soft amount">
              {description.length}/{DESCRIPTION_LIMIT}
            </span>
          </div>
          <textarea
            value={description}
            maxLength={DESCRIPTION_LIMIT}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What does your product do?"
            rows={2}
            className="w-full border-2 border-ink bg-paper px-3 py-2 font-body resize-none focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-wide text-ink-soft mb-1 block">
            Choose category
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as CategoryId)}
            className="w-full border-2 border-ink bg-paper px-3 py-2 font-body focus:outline-none focus:border-accent"
          >
            {CATEGORY_FORM_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center gap-4 py-1">
          {SOCIAL_BUTTONS.map(({ platform, label, icon }) => (
            <div key={platform} className="relative">
              <SocialLinkButton
                platform={platform}
                label={label}
                icon={icon}
                value={socials[platform] ?? ""}
                onChange={(value) =>
                  setSocials((prev) => ({ ...prev, [platform]: value || undefined }))
                }
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-[11px] uppercase tracking-wide text-ink-soft mb-1 block">
              Amount ($)
            </label>
            <input
              type="number"
              min={MIN_AMOUNT_DOLLARS}
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="5"
              className="w-full border-2 border-ink bg-paper px-3 py-2 font-body amount focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={createListing.isPending}
            className="self-end bg-accent text-paper uppercase tracking-wide font-semibold px-6 py-2.5 border-2 border-ink hover:bg-accent-dark transition-colors disabled:opacity-60"
          >
            {createListing.isPending ? "Redirecting…" : "Claim Your Spot"}
          </button>
        </div>

        {formError ? <p className="text-accent text-sm text-center">{formError}</p> : null}

        <p className="text-center text-[11px] text-ink-soft">
          Already on the board? Enter the same URL to add to your spot.
        </p>
      </form>
    </div>
  );
});

export default HeroClaimForm;
