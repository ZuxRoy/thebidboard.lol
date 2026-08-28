import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-6 py-10 sm:py-14 max-w-3xl mx-auto w-full">
        <h1 className="display text-3xl font-semibold text-ink mb-2">Privacy Policy</h1>
        <p className="text-sm text-ink-faint mb-8">Last updated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="flex flex-col gap-6 text-sm sm:text-[15px] text-ink-soft leading-relaxed">
          <p>
            This Privacy Policy explains what information TheBidBoard collects and how it is used.
          </p>

          <Section title="1. Information you provide">
            When you submit a listing, we collect the product URL, description, category, any
            social links you add, and payment information (handled by our payment provider, not
            stored on our servers).
          </Section>

          <Section title="2. Anonymous usage data">
            To power the "online now" and "total visitors" counters, we generate a random,
            anonymous identifier stored in your browser's local storage. It is not linked to your
            name, email, or IP address, and is used only to count active sessions and unique
            visits.
          </Section>

          <Section title="3. Cookies">
            We do not use tracking or advertising cookies. The anonymous visitor identifier
            described above is stored in local storage, not a cookie, and can be cleared at any
            time from your browser settings.
          </Section>

          <Section title="4. Third parties">
            Payments are processed by a third-party payment provider under its own privacy policy.
            We do not sell personal data to third parties.
          </Section>

          <Section title="5. Data retention">
            Listing data is retained for as long as a listing remains on the board. Anonymous
            visitor records are retained to compute aggregate statistics and may be periodically
            cleaned up.
          </Section>

          <Section title="6. Your choices">
            You can clear your browser's local storage at any time to reset your anonymous visitor
            identifier. Contact us if you would like a listing removed.
          </Section>

          <Section title="7. Contact">
            Questions about this policy can be sent to the contact address listed on the site.
          </Section>

          <p className="text-xs text-ink-faint pt-4 border-t border-border">
            This page is a general starting template and is not a substitute for legal advice.
            Replace it with a policy reviewed for your jurisdiction before relying on it.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-ink mb-1.5">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
