import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — Caronomist Values",
  description:
    "What Caronomist Values does with an email address entered to view the full ranking.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0B1F3B", color: "#f1f5f9" }}>
      <header className="border-b" style={{ borderColor: "rgba(247,201,72,0.15)", background: "#091829" }}>
        <nav aria-label="Primary" className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 text-sm">
          <Link href="/" className="font-bold tracking-wide text-white">
            THE CARONOMIST
          </Link>
          <div className="flex gap-4 text-slate-400">
            <Link href="/" className="hover:text-white">Rankings</Link>
            <Link href="/methodology" className="hover:text-white">Methodology</Link>
            <Link href="/privacy" className="text-yellow-400">Privacy</Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black tracking-tight text-white">Privacy</h1>
        <h2 className="mt-8 text-xl font-bold text-white">What information does the ranking form collect?</h2>
        <p className="mt-3 text-slate-300">
          The full ranking stays blurred until you submit an email address. That address is saved in this browser and sent to the site&apos;s subscribe endpoint. The endpoint stores the address on the server. If a mailing-list provider is configured for that endpoint, the address is forwarded there as well.
        </p>
        <p className="mt-3 text-slate-300">
          The form does not ask for a name, a phone number, or a payment method. Vehicle pages and the ranking itself can be read without an account.
        </p>
        <h2 className="mt-8 text-xl font-bold text-white">How can I ask about an address I submitted?</h2>
        <p className="mt-3 text-slate-300">
          Write to <a className="text-yellow-400 hover:text-yellow-300" href="mailto:hello@caronomist.com">hello@caronomist.com</a>.
        </p>
      </main>
      <footer className="border-t py-8 text-xs text-slate-500" style={{ borderColor: "rgba(247,201,72,0.15)" }}>
        <div className="mx-auto flex max-w-3xl flex-wrap gap-4 px-4">
          <span>© 2026 Caronomist</span>
          <Link href="/" className="hover:text-white">Rankings</Link>
          <Link href="/methodology" className="hover:text-white">Methodology</Link>
        </div>
      </footer>
    </div>
  );
}
