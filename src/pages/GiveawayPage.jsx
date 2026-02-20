import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/apiClient.js";

const TIERS = [
  { key: "consumer", label: "Consumer" },
  { key: "advanced", label: "Advanced" },
  { key: "pro", label: "Pro" },
  { key: "account_recovery", label: "Account Recovery" },
];

function formatTierLine(tierKey, tiers) {
  const row = tiers?.[tierKey];
  if (!row) return "Loading...";
  return `${row.remaining}/${row.total} left`;
}

export default function GiveawayPage() {
  const [status, setStatus] = useState(null);
  const [tier, setTier] = useState("consumer");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [licenseKey, setLicenseKey] = useState("");

  const refreshStatus = async () => {
    try {
      const res = await apiFetch("/api/giveaway/status", { method: "GET" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load giveaway status.");
        return;
      }
      setStatus(data);
    } catch {
      setError("Could not load giveaway status.");
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = window.setInterval(refreshStatus, 30_000);
    const onFocus = () => refreshStatus();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const selectedTierStatus = useMemo(() => status?.tiers?.[tier] || null, [status, tier]);
  const soldOut = selectedTierStatus ? selectedTierStatus.remaining <= 0 : false;

  const claimKey = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLicenseKey("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/giveaway/claim", {
        method: "POST",
        body: JSON.stringify({ tier, email, hp }),
      });
      const data = await res.json();

      if (!res.ok) {
        const message = String(data.error || "Claim failed.").toLowerCase();
        if (message.includes("already claimed")) {
          setError("This email already claimed this tier.");
        } else if (message.includes("too many claims") || res.status === 429) {
          setError("Rate limit reached. Try again in 24 hours.");
        } else if (message.includes("sold out") || res.status === 409) {
          setError("This tier is sold out.");
        } else {
          setError(data.error || "Claim failed.");
        }
        return;
      }

      setLicenseKey(data.licenseKey || "");
      setSuccess("Claim successful. Save this key now. It is shown once.");
      setStatus((prev) => {
        if (!prev) return prev;
        return { ...prev, tiers: data.remainingCounts || prev.tiers, updatedAt: new Date().toISOString() };
      });
      setEmail("");
      setHp("");
      await refreshStatus();
    } catch {
      setError("Claim failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyKey = async () => {
    if (!licenseKey) return;
    try {
      await navigator.clipboard.writeText(licenseKey);
      setSuccess("License key copied. Save it in a secure place.");
    } catch {
      setError("Unable to copy key automatically.");
    }
  };

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">100-User Giveaway</h1>
        <p className="text-base leading-relaxed text-slate-600">
          Select your tier and claim a key while inventory lasts.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-base font-semibold text-slate">Live Tier Inventory</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {TIERS.map((item) => {
            const row = status?.tiers?.[item.key];
            const remaining = row?.remaining ?? 0;
            const total = row?.total ?? 0;
            return (
              <div key={item.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <div className="font-semibold">{item.label}</div>
                <div>
                  {item.label} ({remaining}/{total} left)
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Last updated: {status?.updatedAt ? new Date(status.updatedAt).toLocaleString() : "Loading..."}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-base font-semibold text-slate">Claim Form</h2>
        <form onSubmit={claimKey} className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm text-slate-600">
            Tier
            <select
              value={tier}
              onChange={(event) => setTier(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate"
            >
              {TIERS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label} ({formatTierLine(item.key, status?.tiers)})
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm text-slate-600">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate"
              placeholder="you@example.com"
            />
          </label>

          <div style={{ display: "none" }} aria-hidden="true">
            <label>
              Leave this empty
              <input
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(event) => setHp(event.target.value)}
                name="company"
              />
            </label>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading || soldOut}
              className="rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {soldOut ? "SOLD OUT" : loading ? "Claiming..." : "Claim Key"}
            </button>
          </div>
        </form>

        {error ? <div className="mt-3 text-sm font-semibold text-red-600">{error}</div> : null}
        {success ? <div className="mt-3 text-sm font-semibold text-emerald-700">{success}</div> : null}

        {licenseKey ? (
          <div className="mt-4 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-sm font-semibold text-slate-700">Your license key (shown once)</div>
            <code className="block rounded bg-white px-3 py-2 text-xs text-slate-700">{licenseKey}</code>
            <div className="text-xs text-slate-600">
              Save this key now. You may not be able to retrieve it later.
            </div>
            <button
              type="button"
              onClick={copyKey}
              className="rounded-full border border-slate-300 px-4 py-1 text-xs font-semibold text-slate"
            >
              Copy
            </button>
          </div>
        ) : null}
      </section>
    </section>
  );
}
