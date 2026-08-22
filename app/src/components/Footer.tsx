export default function Footer() {
  return (
    <footer className="border-t-2 border-ink mt-16 py-4 text-center">
      <p className="text-xs uppercase tracking-widest text-ink-soft">
        TheBidBoard © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
