export default function TrustCenter() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">Trust Center</h1>
        <p className="text-base leading-relaxed text-slate-600">
          SafeRestore documents evidence-handling practices in clear operational
          terms for technical, legal, and compliance review.
        </p>
      </div>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Read-only acquisition design</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Acquisition workflows are designed to avoid writes to source media
          during capture steps.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Preserves source state when procedure is followed correctly.</li>
          <li>Reduces accidental evidence modification risk.</li>
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Hardware write blocker recommendation</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Hardware write blockers are recommended for physical media workflows.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Supports compatibility with standard forensic blocker workflows.</li>
          <li>Operators should validate blocker state before acquisition.</li>
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Imaging formats (RAW/DD, E01)</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Imaging workflows support common forensic formats used in downstream tools.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>RAW/DD</li>
          <li>E01</li>
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Hashing (MD5, SHA256)</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Hashes provide a digital fingerprint to verify evidence consistency.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>MD5 hash record</li>
          <li>SHA256 hash record</li>
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Post-acquisition verification</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Re-hashing completed images and comparing to acquisition values is used
          to confirm consistency after capture.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Chain-of-custody logging</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Case logs track evidence lifecycle events.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Case identifiers</li>
          <li>Operator identity</li>
          <li>Timestamps</li>
          <li>Device identifiers and hashes</li>
          <li>Export and handoff events</li>
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Security and privacy</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          SafeRestore does not bypass passcodes or encryption controls.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Local-first handling where possible.</li>
          <li>Controlled transmission only for explicitly invoked services.</li>
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Limitations</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Results depend on media condition.</li>
          <li>Operator procedure quality affects outcomes.</li>
          <li>No blanket guarantee of courtroom admissibility.</li>
        </ul>
      </section>
    </section>
  );
}
