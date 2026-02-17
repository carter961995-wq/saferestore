export default function ForensicPage() {
  return (
    <section className="space-y-8">
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-3xl font-semibold text-slate">
          Affordable forensic-grade recovery
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          Practical forensic workflows for evidence-sensitive work without
          enterprise-only pricing structures.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="#"
            className="inline-flex rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Request Demo
          </a>
          <a
            href="/assets/reports/sample-forensic-report.pdf"
            download
            className="inline-flex rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate transition hover:border-slate-400"
          >
            Download Sample Report
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Key features</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>E01 export workflows</li>
          <li>RAW/DD imaging</li>
          <li>Hash validation (MD5 and SHA256)</li>
          <li>Post-acquisition verification</li>
          <li>Chain-of-custody logging</li>
          <li>RAID rebuild support</li>
          <li>Network imaging workflows</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Who it&apos;s for</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>Investigators</li>
          <li>Small agencies</li>
          <li>Legal teams</li>
          <li>Incident response teams</li>
          <li>Repair shops handling evidence-related cases</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Recovery vs forensic</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate">
                <th className="py-2 pr-4">Track</th>
                <th className="py-2 pr-4">Primary use case</th>
                <th className="py-2">Typical output</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-semibold text-slate">Recovery</td>
                <td className="py-2 pr-4">Standard device and account restoration</td>
                <td className="py-2">Guided recovery actions</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-semibold text-slate">Forensic</td>
                <td className="py-2 pr-4">Evidence-sensitive investigations</td>
                <td className="py-2">Images, hashes, verification, custody records</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
