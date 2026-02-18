import { useMemo, useState } from "react";
import { apiFetch, getSecurityContext, setSecurityContext } from "../lib/apiClient.js";

const ROLE_OPTIONS = ["user", "analyst", "admin"];
const CONTROL_STATUS_OPTIONS = [
  { value: "implemented", label: "Implemented" },
  { value: "partial", label: "Partial" },
  { value: "missing", label: "Missing" },
  { value: "na", label: "Not Applicable" },
];
const REMEDIATION_STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

const SOC2_CONTROLS = [
  {
    id: "cc6_1",
    category: "Access Control",
    title: "Logical access by role",
    description: "Access to privileged actions is restricted by role and reviewed periodically.",
  },
  {
    id: "cc6_2",
    category: "Authentication",
    title: "Unique user identity",
    description: "Each operator account is unique and attributable to an individual.",
  },
  {
    id: "cc7_2",
    category: "Monitoring",
    title: "Security event logging",
    description: "Security-relevant events are logged with actor, timestamp, and status.",
  },
  {
    id: "cc7_3",
    category: "Change Management",
    title: "Controlled release process",
    description: "Code changes are reviewed and released through a documented workflow.",
  },
  {
    id: "a1_2",
    category: "Availability",
    title: "Operational resilience",
    description: "Backups, recovery process, and incident response are documented and tested.",
  },
  {
    id: "c1_1",
    category: "Confidentiality",
    title: "Data handling safeguards",
    description: "Sensitive data is handled using least privilege and secure transport/storage controls.",
  },
  {
    id: "pi1_1",
    category: "Processing Integrity",
    title: "Integrity validation",
    description: "Critical workflows include validation checks and auditable integrity results.",
  },
];

function toInitialStatusMap() {
  return SOC2_CONTROLS.reduce((acc, control) => {
    acc[control.id] = "missing";
    return acc;
  }, {});
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

function nextDateISO(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function getPriority(control) {
  const highImpactCategories = ["Access Control", "Authentication", "Confidentiality"];
  if (control.status === "missing" && highImpactCategories.includes(control.category)) {
    return "High";
  }
  if (control.status === "missing") {
    return "Medium";
  }
  return "Low";
}

function getTargetDays(priority) {
  if (priority === "High") return 30;
  if (priority === "Medium") return 60;
  return 90;
}

function getActionHint(control) {
  if (control.id === "cc6_1") return "Define role matrix and enforce least privilege checks.";
  if (control.id === "cc6_2") return "Require named identities and remove shared accounts.";
  if (control.id === "cc7_2") return "Standardize security logging fields and retention policy.";
  if (control.id === "cc7_3") return "Document release approvals and evidence of change review.";
  if (control.id === "a1_2") return "Test incident response and backup recovery runbooks.";
  if (control.id === "c1_1") return "Apply data classification and access boundaries for sensitive data.";
  if (control.id === "pi1_1") return "Add integrity checks and signed validation records.";
  return "Document remediation steps and evidence owner.";
}

export default function SecurityConsolePage() {
  const initial = getSecurityContext();
  const [role, setRole] = useState(initial.role);
  const [actor, setActor] = useState(initial.actor);
  const [status, setStatus] = useState("");
  const [capabilities, setCapabilities] = useState(null);
  const [events, setEvents] = useState([]);
  const [controlStatus, setControlStatus] = useState(toInitialStatusMap);
  const [controlNotes, setControlNotes] = useState({});
  const [remediationOwners, setRemediationOwners] = useState({});
  const [remediationProgress, setRemediationProgress] = useState({});

  const summary = useMemo(() => {
    const controls = SOC2_CONTROLS.map((control) => ({
      ...control,
      status: controlStatus[control.id] || "missing",
      note: controlNotes[control.id] || "",
    }));

    const totals = controls.reduce(
      (acc, control) => {
        acc[control.status] = (acc[control.status] || 0) + 1;
        return acc;
      },
      { implemented: 0, partial: 0, missing: 0, na: 0 }
    );

    const applicable = controls.filter((control) => control.status !== "na");
    const weightedScore = applicable.reduce((total, control) => {
      if (control.status === "implemented") return total + 1;
      if (control.status === "partial") return total + 0.5;
      return total;
    }, 0);

    const readinessScore =
      applicable.length === 0 ? 0 : Math.round((weightedScore / applicable.length) * 100);

    const openGaps = controls.filter(
      (control) => control.status === "missing" || control.status === "partial"
    );

    return {
      controls,
      totals,
      readinessScore,
      openGaps,
    };
  }, [controlNotes, controlStatus]);

  const remediationPlan = useMemo(
    () =>
      summary.openGaps.map((control) => {
        const priority = getPriority(control);
        const owner = remediationOwners[control.id] || actor || "unassigned";
        const progress = remediationProgress[control.id] || "not_started";
        return {
          id: control.id,
          category: control.category,
          title: control.title,
          gapStatus: control.status,
          priority,
          targetDate: nextDateISO(getTargetDays(priority)),
          owner,
          progress,
          actionHint: getActionHint(control),
          note: control.note || "",
        };
      }),
    [actor, remediationOwners, remediationProgress, summary.openGaps]
  );

  const saveContext = () => {
    setSecurityContext({ role, actor });
    setStatus("Security context saved.");
  };

  const setControlValue = (controlId, value) => {
    setControlStatus((prev) => ({ ...prev, [controlId]: value }));
  };

  const setControlNote = (controlId, value) => {
    setControlNotes((prev) => ({ ...prev, [controlId]: value }));
  };

  const setRemediationOwner = (controlId, value) => {
    setRemediationOwners((prev) => ({ ...prev, [controlId]: value }));
  };

  const setRemediationState = (controlId, value) => {
    setRemediationProgress((prev) => ({ ...prev, [controlId]: value }));
  };

  const exportSoc2Snapshot = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      actor,
      role,
      readinessScore: summary.readinessScore,
      totals: summary.totals,
      controls: summary.controls,
      openGaps: summary.openGaps.map((gap) => ({
        id: gap.id,
        category: gap.category,
        title: gap.title,
        status: gap.status,
        note: gap.note,
      })),
      disclaimer:
        "This snapshot supports internal control tracking and does not itself certify SOC 2 compliance.",
    };

    downloadJson(`soc2-readiness-${Date.now()}.json`, payload);
    setStatus("SOC 2 readiness snapshot downloaded.");
  };

  const exportRemediationPlan = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      actor,
      role,
      readinessScore: summary.readinessScore,
      totalGaps: remediationPlan.length,
      remediationPlan,
      disclaimer:
        "Remediation plan is an operational tracker. Final control effectiveness requires evidence and review.",
    };

    downloadJson(`soc2-remediation-plan-${Date.now()}.json`, payload);
    setStatus("SOC 2 remediation plan downloaded.");
  };

  const checkAccess = async () => {
    setStatus("Checking RBAC...");
    const res = await apiFetch("/api/admin/rbac/check");
    const data = await res.json();
    if (!res.ok) {
      setCapabilities(null);
      setStatus(data.error || "Access check failed.");
      return;
    }
    setCapabilities(data);
    setStatus("RBAC check complete.");
  };

  const loadAuditEvents = async () => {
    setStatus("Loading audit events...");
    const res = await apiFetch("/api/admin/audit/events");
    const data = await res.json();
    if (!res.ok) {
      setEvents([]);
      setStatus(data.error || "Failed to load audit events.");
      return;
    }
    setEvents(Array.isArray(data.events) ? data.events : []);
    setStatus("Audit events loaded.");
  };

  const exportAudit = async () => {
    setStatus("Exporting audit file...");
    const res = await apiFetch("/api/admin/audit/export", { method: "GET" });
    if (!res.ok) {
      const data = await res.json();
      setStatus(data.error || "Failed to export audit file.");
      return;
    }

    const text = await res.text();
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `audit-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(href);
    setStatus("Audit export downloaded.");
  };

  const primaryButton =
    "rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90";
  const secondaryButton =
    "rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate transition hover:border-slate-300";

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">Security Console</h1>
        <p className="text-base leading-relaxed text-slate-600">
          Configure role context, track SOC 2 readiness controls, generate remediation plans, and verify RBAC/audit behavior.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Role and actor context</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-600">
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-600">
            Actor
            <input
              value={actor}
              onChange={(event) => setActor(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate"
              placeholder="e.g., investigator-01"
            />
          </label>
        </div>
        <button type="button" onClick={saveContext} className={primaryButton}>
          Save Context
        </button>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate">SOC 2 control readiness</h2>
          <button type="button" onClick={exportSoc2Snapshot} className={secondaryButton}>
            Export SOC 2 Snapshot
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <div className="text-xs uppercase tracking-wide text-slate-500">Readiness score</div>
            <div className="text-xl font-semibold text-slate">{summary.readinessScore}%</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <div className="text-xs uppercase tracking-wide text-slate-500">Implemented</div>
            <div className="text-xl font-semibold text-slate">{summary.totals.implemented}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <div className="text-xs uppercase tracking-wide text-slate-500">Partial</div>
            <div className="text-xl font-semibold text-slate">{summary.totals.partial}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <div className="text-xs uppercase tracking-wide text-slate-500">Missing</div>
            <div className="text-xl font-semibold text-slate">{summary.totals.missing}</div>
          </div>
        </div>

        <div className="space-y-3">
          {summary.controls.map((control) => (
            <div key={control.id} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate">{control.title}</div>
                  <div className="text-xs text-slate-500">
                    {control.category} • {control.id}
                  </div>
                </div>
                <select
                  value={control.status}
                  onChange={(event) => setControlValue(control.id, event.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate"
                >
                  {CONTROL_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mb-2 text-sm text-slate-600">{control.description}</p>
              <input
                value={control.note}
                onChange={(event) => setControlNote(control.id, event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate"
                placeholder="Control note: evidence, owner, or remediation next step"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate">Stage 8 remediation planner</h2>
          <button type="button" onClick={exportRemediationPlan} className={secondaryButton}>
            Export Remediation Plan
          </button>
        </div>

        {remediationPlan.length === 0 ? (
          <p className="text-sm text-emerald-700">No open control gaps. Remediation plan is clear.</p>
        ) : (
          <div className="space-y-3">
            {remediationPlan.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate">{item.id} {item.title}</div>
                    <div className="text-xs text-slate-500">{item.category} • {item.gapStatus}</div>
                  </div>
                  <div className={`rounded-full px-2 py-1 text-xs font-semibold ${item.priority === "High" ? "bg-red-100 text-red-700" : item.priority === "Medium" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}>
                    {item.priority} Priority
                  </div>
                </div>
                <p className="mb-3 text-sm text-slate-600">{item.actionHint}</p>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="grid gap-1 text-xs text-slate-600">
                    Owner
                    <input
                      value={item.owner}
                      onChange={(event) => setRemediationOwner(item.id, event.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate"
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-slate-600">
                    Progress
                    <select
                      value={item.progress}
                      onChange={(event) => setRemediationState(item.id, event.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate"
                    >
                      {REMEDIATION_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-1 text-xs text-slate-600">
                    <span>Target Date</span>
                    <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate">
                      {item.targetDate}
                    </span>
                  </div>
                </div>
                {item.note ? (
                  <p className="mt-2 text-xs text-slate-500">Control note: {item.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">RBAC checks and audit</h2>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={checkAccess} className={secondaryButton}>
            Check RBAC
          </button>
          <button type="button" onClick={loadAuditEvents} className={secondaryButton}>
            Load Audit Events
          </button>
          <button type="button" onClick={exportAudit} className={secondaryButton}>
            Export Audit JSON
          </button>
        </div>
        {status ? <p className="text-sm font-semibold text-slate-600">{status}</p> : null}
      </section>

      {capabilities ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate">Current capabilities</h2>
          <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
{JSON.stringify(capabilities, null, 2)}
          </pre>
        </section>
      ) : null}

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Recent audit events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No events loaded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-slate">
                  <th className="py-2 pr-3">Timestamp</th>
                  <th className="py-2 pr-3">Event</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.slice().reverse().map((event, idx) => (
                  <tr key={`${event.ts}-${idx}`} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{event.ts}</td>
                    <td className="py-2 pr-3">{event.event}</td>
                    <td className="py-2 pr-3">{event.role}</td>
                    <td className="py-2">{event.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
