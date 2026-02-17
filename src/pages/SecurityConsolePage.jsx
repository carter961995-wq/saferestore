import { useState } from "react";
import { apiFetch, getSecurityContext, setSecurityContext } from "../lib/apiClient.js";

const ROLE_OPTIONS = ["user", "analyst", "admin"];

export default function SecurityConsolePage() {
  const initial = getSecurityContext();
  const [role, setRole] = useState(initial.role);
  const [actor, setActor] = useState(initial.actor);
  const [status, setStatus] = useState("");
  const [capabilities, setCapabilities] = useState(null);
  const [events, setEvents] = useState([]);

  const saveContext = () => {
    setSecurityContext({ role, actor });
    setStatus("Security context saved.");
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
          Configure role context and verify RBAC/audit behavior for enterprise workflows.
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
