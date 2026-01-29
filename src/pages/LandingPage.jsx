import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="space-y-12">
      <div className="rounded-3xl bg-white p-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-calm">
          SafeRestore Concierge
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate">
          Calm, consent-based guidance for recovering the data that matters.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-calm">
          SafeRestore is an AI-powered recovery concierge for personal devices.
          We guide you through official recovery steps, clarify next actions,
          and keep everything transparent. No bypasses. No guesswork.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            to="/recovery"
            className="rounded-full bg-ocean px-6 py-3 text-sm font-semibold text-white shadow-sm"
          >
            Start a recovery plan
          </Link>
          <Link
            to="/concierge"
            className="rounded-full border border-sky px-6 py-3 text-sm font-semibold text-slate"
          >
            Talk to the concierge
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Official recovery steps",
            description:
              "We only recommend Apple-approved recovery paths so you always stay within policy.",
          },
          {
            title: "Owner-first verification",
            description:
              "Every workflow starts with consent and ownership clarity. Your data stays in your control.",
          },
          {
            title: "Clear, steady guidance",
            description:
              "Calm instructions, progress tracking, and helpful context when the situation is stressful.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate">{item.title}</h3>
            <p className="mt-2 text-sm text-calm">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-sky bg-white p-8">
        <h2 className="text-lg font-semibold text-slate">What we never do</h2>
        <p className="mt-2 text-sm text-calm">
          SafeRestore does not bypass passcodes, encryption, or device security.
          If a device cannot be unlocked by the owner, we direct you to official
          recovery and authorized repair options.
        </p>
      </div>
    </section>
  );
}
