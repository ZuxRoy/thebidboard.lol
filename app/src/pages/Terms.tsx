import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-6 py-10 sm:py-14 max-w-3xl mx-auto w-full">
        <h1 className="display text-3xl font-semibold text-ink mb-2">Terms of Service</h1>
        <p className="text-sm text-ink-faint mb-8">Last updated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="flex flex-col gap-6 text-sm sm:text-[15px] text-ink-soft leading-relaxed">
          <p>
            These Terms of Service ("Terms") govern your use of TheBidBoard (the "Service"). By
            submitting a listing, making a payment, or otherwise using the Service, you agree to
            these Terms.
          </p>

          <Section title="1. What the Service does">
            TheBidBoard is a public leaderboard. Anyone can submit a product listing consisting of
            a URL, a short description, a category, and optional social links, and pay to rank that
            listing higher on the board. Ranking is determined solely by the total amount paid for
            a listing.
          </Section>

          <Section title="2. Payments">
            Payments are processed by our payment provider. All payments are for placement on the
            board and are non-refundable once a listing becomes active, except where required by
            law or at our discretion.
          </Section>

          <Section title="3. Acceptable listings">
            You may not submit listings that are illegal, fraudulent, infringe on intellectual
            property, contain malware, or link to content that is deceptive or harmful. We reserve
            the right to remove any listing at any time, for any reason, without a refund.
          </Section>

          <Section title="4. No guarantee of results">
            We do not guarantee traffic, clicks, sales, or any other outcome from a listing on the
            board. The Service is provided "as is" without warranties of any kind.
          </Section>

          <Section title="5. Limitation of liability">
            To the maximum extent permitted by law, TheBidBoard and its operators are not liable
            for any indirect, incidental, or consequential damages arising from your use of the
            Service.
          </Section>

          <Section title="6. Changes to these Terms">
            We may update these Terms from time to time. Continued use of the Service after changes
            take effect constitutes acceptance of the revised Terms.
          </Section>

          <Section title="7. Contact">
            Questions about these Terms can be sent to the contact address listed on the site.
          </Section>

          <p className="text-xs text-ink-faint pt-4 border-t border-border">
            This page is a general starting template and is not a substitute for legal advice.
            Replace it with Terms reviewed for your jurisdiction before relying on it.
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
