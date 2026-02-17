export default function PrivacyPolicy() {
  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold text-slate">Privacy Policy</h1>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Data collected</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Depending on features in use, SafeRestore may process account details,
          payment processor records, basic operational analytics, and crash logs.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Data not collected</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Recovered file content is not collected by default. Device contents are
          not collected unless you explicitly opt in to a workflow that requires
          data transfer.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Telemetry</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          We do not collect telemetry by default. Exceptions can include
          security logs, crash diagnostics, and billing metadata needed for
          operation and support.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Retention policy</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Logs and account records are retained only for operational, support,
          and legal obligations, then deleted or rotated on schedule.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Security practices</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Access controls, encrypted transport, and operational audit logging are
          used to protect service data.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Contact</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Privacy contact placeholder: privacy@saferestorehelp.com
        </p>
      </section>
    </section>
  );
}
