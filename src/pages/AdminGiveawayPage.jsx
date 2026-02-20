import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/apiClient.js";

const TIERS = ["consumer", "advanced", "pro", "account_recovery"];

export default function AdminGiveawayPage() {
  const [token, setToken] = useState("");
  const [tier, setTier] = useState("consumer");
  const [keysText, setKeysText] = useState("");
  const [keysData, setKeysData] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  const authHeaders = useMemo(
    () => (token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {}),
    [token]
  );

  const loadSnapshot = async () => {
    if (!token.trim()) return;
    try {
      const res = await apiFetch("/api/admin/giveaway/snapshot", {
        method: "GET",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMsg(data.error || "Failed to load snapshot.");
        return;
      }
      setSnapshot(data);
    } catch {
      setStatusMsg("Failed to load snapshot.");
    }
  };

  const loadKeys = async (nextTier = tier) => {
    if (!token.trim()) return;
    try {
      const res = await apiFetch(`/api/admin/giveaway/keys?tier=${encodeURIComponent(nextTier)}`, {
        method: "GET",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMsg(data.error || "Failed to load keys.");
        return;
      }
      setKeysData(Array.isArray(data.keys) ? data.keys : []);
    } catch {
      setStatusMsg("Failed to load keys.");
    }
  };

  useEffect(() => {
    loadSnapshot();
    loadKeys();
  }, [token, tier]);

  const uploadKeys = async () => {
    const keys = keysText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!token.trim()) {
      setStatusMsg("Admin token is required.");
      return;
    }

    try {
      const res = await apiFetch("/api/admin/giveaway/upload", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ tier, keys }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMsg(data.error || "Upload failed.");
        return;
      }

      setStatusMsg(`Uploaded. Inserted ${data.insertedCount}, skipped ${data.skippedCount}.`);
      setKeysText("");
      await loadSnapshot();
      await loadKeys(tier);
    } catch {
      setStatusMsg("Upload failed.");
    }
  };

  const exportClaims = () => {
    if (!token.trim()) {
      setStatusMsg("Admin token is required.");
      return;
    }
    const url = `/api/admin/giveaway/export-claims?token=${encodeURIComponent(token.trim())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">Admin Giveaway</h1>
        <p className="text-base text-slate-600">Upload keys, inspect inventory, and export claims.</p>
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <label className="grid gap-1 text-sm text-slate-600">
          Admin Token
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate"
            placeholder="Paste ADMIN_TOKEN"
          />
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Upload Keys</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm text-slate-600">
            Tier
            <select
              value={tier}
              onChange={(event) => setTier(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate"
            >
              {TIERS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-1 text-sm text-slate-600">
          Keys (one per line)
          <textarea
            value={keysText}
            onChange={(event) => setKeysText(event.target.value)}
            className="min-h-[160px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate"
            placeholder="KEY-ONE\nKEY-TWO"
          />
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={uploadKeys}
            className="rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white"
          >
            Upload
          </button>
          <button
            type="button"
            onClick={exportClaims}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate"
          >
            Export Claims CSV
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Counts + Last 20 Claims</h2>
        {snapshot?.status?.tiers ? (
          <div className="grid gap-2 md:grid-cols-2">
            {Object.entries(snapshot.status.tiers).map(([tierName, row]) => (
              <div key={tierName} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <div className="font-semibold">{tierName}</div>
                <div>Total: {row.total}</div>
                <div>Claimed: {row.claimed}</div>
                <div>Remaining: {row.remaining}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">Enter token to load snapshot.</div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate">
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 pr-3">Tier</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">License</th>
                <th className="py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {(snapshot?.lastClaims || []).map((claim) => (
                <tr key={claim.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">{claim.createdAt}</td>
                  <td className="py-2 pr-3">{claim.tier}</td>
                  <td className="py-2 pr-3">{claim.email}</td>
                  <td className="py-2 pr-3">{claim.licenseKey}</td>
                  <td className="py-2">{claim.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Keys by Tier</h2>
        <div className="text-xs text-slate-500">Showing tier: {tier}</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate">
                <th className="py-2 pr-3">Key</th>
                <th className="py-2 pr-3">Claimed</th>
                <th className="py-2">Claimed At</th>
              </tr>
            </thead>
            <tbody>
              {keysData.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">{row.licenseKey}</td>
                  <td className="py-2 pr-3">{row.isClaimed ? "yes" : "no"}</td>
                  <td className="py-2">{row.claimedAt || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {statusMsg ? <p className="text-sm font-semibold text-slate-600">{statusMsg}</p> : null}
    </section>
  );
}
