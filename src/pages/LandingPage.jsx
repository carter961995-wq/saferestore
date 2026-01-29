import { Link } from "react-router-dom";

export default function LandingPage() {
  const primaryButton =
    "rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/40";
  const secondaryButton =
    "rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300";

  return (
    <section className="space-y-10">
      <div className="rounded-3xl bg-white px-8 py-12 text-center shadow-sm">
        <p className="text-base font-semibold text-slate-600">
          SafeRestore Concierge
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate">
          Recover what you thought was gone.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          SafeRestore is an AI-powered data recovery concierge that guides you
          through the safest, official ways to recover photos, messages, and
          files from your iPhone.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link to="/recovery" className={`${primaryButton} shadow-sm`}>
            Start Recovery
          </Link>
          <Link to="/concierge" className={secondaryButton}>
            Talk to the Concierge
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          "Privacy-first",
          "Read-only guidance",
          "Official recovery paths",
          "You stay in control",
        ].map((item) => (
          <span
            key={item}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="space-y-6 text-left">
        <h2 className="text-xl font-semibold text-slate">How it Works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Tell us what happened",
              description:
                "Whether your phone was damaged, data went missing after an upgrade, or files were deleted by mistake, we’ll understand your situation first.",
            },
            {
              title: "Get a clear recovery plan",
              description:
                "Our AI concierge determines the safest official recovery path based on your device, iOS version, and what access you still have.",
            },
            {
              title: "Follow guided steps",
              description:
                "No guessing and no panic. Just calm, step-by-step guidance using approved Apple recovery tools and processes.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate">
                {item.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm leading-relaxed text-slate-600">
        SafeRestore never bypasses device security or accesses data without your
        consent. We guide you — you authorize every step.
      </div>
    </section>
  );
}
