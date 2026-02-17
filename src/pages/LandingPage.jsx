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
          SafeRestore provides structured recovery and forensic workflows focused
          on read-only acquisition, verified outputs, and documented handling.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link to="/recovery" className={`${primaryButton} shadow-sm`}>
            Start Recovery
          </Link>
          <Link to="/forensic" className={secondaryButton}>
            Explore Forensic Suite
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          "Read-only imaging workflows",
          "E01 export + post-acquisition verification",
          "Chain-of-custody logging",
          "Clear forensic vs recovery tiers",
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
        <h2 className="text-xl font-semibold text-slate">Operational Approach</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Read-only first",
              description:
                "Acquisition workflows are designed to reduce source modifications and preserve original media state.",
            },
            {
              title: "Verify outputs",
              description:
                "E01 and related outputs include hash and post-acquisition verification checkpoints for consistency.",
            },
            {
              title: "Match the right tier",
              description:
                "Recovery mode targets standard restoration; forensic mode targets evidence-sensitive handling and reporting.",
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
        SafeRestore does not bypass encryption or passcodes. Outcomes depend on
        media condition, tooling setup, and operator procedure.
      </div>
    </section>
  );
}
