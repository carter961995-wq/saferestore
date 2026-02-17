import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PLAN_LABELS,
  PLAN_ORDER,
  getCurrentPlan,
  isFeatureEnabled,
  requiredPlanForFeature,
  setCurrentPlan,
} from "../lib/planAccess.js";

const gatedFeatures = [
  {
    key: "readOnlyAcquisition",
    title: "Read-only acquisition workflow design",
  },
  {
    key: "rawDdImaging",
    title: "RAW/DD imaging",
  },
  {
    key: "e01Export",
    title: "E01 export",
  },
  {
    key: "hashVerification",
    title: "Hash verification (MD5 and SHA256)",
  },
  {
    key: "postAcquisitionVerification",
    title: "Post-acquisition verification",
  },
  {
    key: "chainOfCustody",
    title: "Chain-of-custody logging",
  },
  {
    key: "raidRebuild",
    title: "RAID rebuild support",
  },
  {
    key: "networkImaging",
    title: "Network imaging workflows",
  },
  {
    key: "governanceControls",
    title: "Governance controls and audit export",
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
  const [selectedPlan, setSelectedPlanState] = useState(getCurrentPlan());

  const activePlanLabel = useMemo(() => PLAN_LABELS[selectedPlan], [selectedPlan]);

  const featureRows = useMemo(
    () =>
      gatedFeatures.map((feature) => {
        const enabled = isFeatureEnabled(selectedPlan, feature.key);
        const requiredPlan = requiredPlanForFeature(feature.key);
        return {
          ...feature,
          enabled,
          requiredPlan,
        };
      }),
    [selectedPlan]
  );

  const handlePlanSelect = (plan) => {
    setCurrentPlan(plan);
    setSelectedPlanState(plan);
  };

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

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Forensic mode onboarding</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Select the plan to preview what forensic capabilities are unlocked in
          your current workflow.
        </p>
        <div className="flex flex-wrap gap-2">
          {PLAN_ORDER.map((plan) => (
            <button
              key={plan}
              type="button"
              onClick={() => handlePlanSelect(plan)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                plan === selectedPlan
                  ? "bg-ocean text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              {PLAN_LABELS[plan]}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500">Active plan: {activePlanLabel}</div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Plan-based forensic capabilities</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
          {featureRows.map((feature) => (
            <li
              key={feature.key}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
            >
              <span>{feature.title}</span>
              {feature.enabled ? (
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  Enabled
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                  Upgrade to {PLAN_LABELS[feature.requiredPlan]}
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 text-sm">
          <Link to="/pricing" className="font-semibold text-ocean underline">
            View pricing and upgrade path
          </Link>
        </div>
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
