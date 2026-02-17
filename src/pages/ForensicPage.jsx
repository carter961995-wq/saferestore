export default function ForensicPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">Forensic Recovery</h1>
        <p className="text-base leading-relaxed text-slate-600">
          SafeRestore forensic workflows are designed for structured evidence
          handling, repeatable analysis, and clear reporting across incident,
          legal, and compliance teams.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate">Acquisition and integrity</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Read-oriented workflows for source preservation.</li>
            <li>Support for RAW/DD and E01 evidence formats.</li>
            <li>Hash workflows with MD5 and SHA-256.</li>
          </ul>
        </article>

        <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate">Documentation and evidence flow</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Case-centric event logging and timestamps.</li>
            <li>Operator and device attribution records.</li>
            <li>Export tracking for downstream review.</li>
          </ul>
        </article>
      </div>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Boundaries</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>SafeRestore does not bypass encryption or passcodes.</li>
          <li>Outcomes depend on media condition and operator procedure.</li>
          <li>
            For legal matters, validation by qualified personnel remains
            essential.
          </li>
        </ul>
      </article>
    </section>
  );
}
