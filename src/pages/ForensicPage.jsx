import { Link } from "react-router-dom";

const featureGroups = [
  {
    heading: "Acquisition and Imaging",
    items: [
      "Read-only acquisition workflow design",
      "E01 export for evidence packaging",
      "RAW/DD imaging for broad tool compatibility",
      "Network imaging for remote or segmented environments",
      "RAID rebuild support for degraded storage scenarios",
    ],
  },
  {
    heading: "Integrity and Verification",
    items: [
      "MD5 and SHA256 hash generation",
      "Post-acquisition hash verification",
      "Verification result logging (MATCH / mismatch alerts)",
      "Exportable evidence summaries for review",
    ],
  },
  {
    heading: "Documentation and Legal Workflow",
    items: [
      "Chain-of-custody event logging",
      "Case identifiers, operator, and timestamp fields",
      "Device identifier and acquisition metadata capture",
      "Structured reporting for investigative and legal teams",
    ],
  },
];

const audiences = [
  "Digital investigators and forensic examiners",
  "Small agencies and public-sector technical units",
  "Legal teams managing evidence-related matters",
  "Incident response teams handling compromised systems",
  "Repair shops handling devices tied to investigations",
];

export default function ForensicPage() {
  return (
    <section className="space-y-8">
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-ocean">
          SafeRestore Forensic Suite
        </p>
        <h1 className="text-3xl font-semibold text-slate">
          Affordable forensic-grade recovery for investigative and legal workflows
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          SafeRestore Forensic Suite is built for evidence-sensitive recovery,
          digital forensic imaging, and documentation workflows where integrity
          and traceability matter.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="/support"
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

      <section className="grid gap-6 md:grid-cols-3">
        {featureGroups.map((group) => (
          <article
            key={group.heading}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h2 className="text-base font-semibold text-slate">{group.heading}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Who it&apos;s for</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          {audiences.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Recovery vs Forensic use cases</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate">
                <th className="py-2 pr-4">Track</th>
                <th className="py-2 pr-4">Primary scope</th>
                <th className="py-2">Typical output</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-semibold text-slate">Recovery</td>
                <td className="py-2 pr-4">Standard restoration and continuity support</td>
                <td className="py-2">Guided recovery actions and summaries</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-semibold text-slate">Forensic</td>
                <td className="py-2 pr-4">Evidence-sensitive acquisition and validation</td>
                <td className="py-2">Images, hashes, verification logs, custody events</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Related resources</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Review governance details in the <Link to="/trust" className="font-semibold text-ocean underline">Trust Center</Link> and legal boundaries in the <Link to="/terms" className="font-semibold text-ocean underline">Terms of Service</Link>.
        </p>
      </section>
    </section>
  );
}
