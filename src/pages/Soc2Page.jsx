const trustPrinciples = [
  {
    title: "Security",
    body: "Role-based access, MFA enforcement, secure SDLC controls, and monitored production boundaries.",
  },
  {
    title: "Availability",
    body: "Service monitoring, incident runbooks, and tested recovery procedures to reduce downtime risk.",
  },
  {
    title: "Confidentiality",
    body: "Least-privilege data access, encryption in transit, and access review workflows for sensitive artifacts.",
  },
  {
    title: "Processing Integrity",
    body: "Change controls, validation checks, and audit trails for recovery workflows and evidence exports.",
  },
  {
    title: "Privacy",
    body: "Consent-first operations, retention limits, and transparency around data handling boundaries.",
  },
];

const controlHighlights = [
  "Formal access provisioning and deprovisioning process",
  "MFA required for privileged systems",
  "Quarterly access review evidence and approvals",
  "Vulnerability scans and patch tracking with remediation SLAs",
  "Incident response plan with documented tabletop exercises",
  "Backup and restore validation with runbook sign-off",
  "Audit logging for production changes and support actions",
  "Vendor security review process for critical subprocessors",
];

export default function Soc2Page() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">SOC 2 Program</h1>
        <p className="text-base leading-relaxed text-slate-600">
          SafeRestore is building and operating a SOC 2-aligned control program
          focused on security, availability, confidentiality, processing
          integrity, and privacy.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Current Status</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We are actively maintaining control evidence across engineering,
          operations, and support workflows. This page summarizes program
          commitments and control domains for customers evaluating trust and
          compliance readiness.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {trustPrinciples.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-base font-semibold text-slate">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {item.body}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Control Highlights</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          {controlHighlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Request Security Documentation</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Need a trust packet, architecture overview, or security questionnaire
          response? Contact support and we will route your request to the
          compliance workflow.
        </p>
        <a
          href="/support"
          className="mt-4 inline-flex rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Contact Support
        </a>
      </div>
    </section>
  );
}
