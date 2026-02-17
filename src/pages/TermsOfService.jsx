export default function TermsOfService() {
  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold text-slate">Terms of Service</h1>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Analysis assistance and user responsibility</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          SafeRestore assists analysis and workflow execution. You are
          responsible for procedure quality, authorization, and compliance with
          applicable laws and policies.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">No guarantee of courtroom admissibility</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          SafeRestore does not guarantee courtroom admissibility. Admissibility
          depends on operator procedure, documentation, jurisdiction, and case
          circumstances.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Limitation of liability and warranty disclaimer</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          The software is provided "AS IS" and "AS AVAILABLE" without
          warranties. To the extent permitted by law, SafeRestore is not liable
          for indirect, incidental, consequential, special, or punitive damages.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Acceptable use restrictions</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>No illegal access or unauthorized evidence handling.</li>
          <li>No bypassing encryption, passcodes, or security controls.</li>
          <li>No use that violates legal, contractual, or regulatory duties.</li>
        </ul>
      </section>
    </section>
  );
}
