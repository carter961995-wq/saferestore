export default function TermsOfService() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">Terms of Service</h1>
        <p className="text-base leading-relaxed text-slate-600">
          SafeRestore assists with analysis and workflow guidance. You are
          responsible for procedure quality, legal compliance, and authorization
          for any device or data you process.
        </p>
      </div>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Use and responsibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>
            SafeRestore provides software guidance and analysis support, not
            legal advice.
          </li>
          <li>
            You are responsible for lawful authorization, chain-of-custody
            procedure, and jurisdictional compliance.
          </li>
        </ul>
      </article>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Admissibility and outcome limitations</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>
            No guarantee is made that output will be admissible in court.
          </li>
          <li>
            Results depend on device condition, media state, and operator
            procedure.
          </li>
        </ul>
      </article>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Warranty disclaimer and limitation of liability</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>
            The software is provided "AS IS" and "AS AVAILABLE" without
            warranties of any kind.
          </li>
          <li>
            To the maximum extent permitted by law, SafeRestore is not liable
            for indirect, incidental, special, consequential, or punitive
            damages, including data loss, business interruption, or lost
            profits.
          </li>
        </ul>
      </article>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Acceptable use</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>No illegal access or unauthorized data acquisition.</li>
          <li>No attempts to bypass encryption, passcodes, or platform controls.</li>
          <li>No use that violates contractual, regulatory, or criminal law.</li>
        </ul>
      </article>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Contact</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Terms and legal requests: legal@saferestorehelp.com
        </p>
      </article>

      <p className="text-sm text-slate-500">
        Continued use of SafeRestore means you accept these terms.
      </p>
    </section>
  );
}
