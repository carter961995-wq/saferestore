import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function CaseSummary() {
  const [whatHappened, setWhatHappened] = useState("");
  const [iphoneModel, setIphoneModel] = useState("");
  const [iosVersion, setIosVersion] = useState("");
  const [powersOn, setPowersOn] = useState("");
  const [accessStatus, setAccessStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("saferestore_caseData");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      setWhatHappened(parsed.incident || "");
      setIphoneModel(parsed.deviceModel || "");
      setIosVersion(parsed.iosVersion || "");
      setPowersOn(parsed.powersOn || "");
      setAccessStatus(parsed.accessStatus || "");
    } catch {
      // ignore invalid stored data
    }
  }, []);

  const summaryText = [
    "SafeRestore — Case Summary",
    "",
    "Your Details",
    `What happened?: ${whatHappened || "-"}`,
    `iPhone model: ${iphoneModel || "-"}`,
    `iOS version (optional): ${iosVersion || "-"}`,
    `Does the old device power on?: ${powersOn || "-"}`,
    `Apple ID / iCloud access status: ${accessStatus || "-"}`,
    "",
    "Recommended Official Path",
    "Based on your details, SafeRestore recommends using official Apple recovery and restore tools as the safest next step.",
    "",
    "Notes for Support",
    notes || "-",
  ].join("\n");

  const handleCopy = async () => {
    if (!navigator?.clipboard?.writeText) return;
    await navigator.clipboard.writeText(summaryText);
  };

  const handleClear = () => {
    localStorage.removeItem("saferestore_caseData");
    setWhatHappened("");
    setIphoneModel("");
    setIosVersion("");
    setPowersOn("");
    setAccessStatus("");
    setNotes("");
  };

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">Case Summary</h1>
        <p className="text-base leading-relaxed text-slate-600">
          This summary is designed to help you stay organized and communicate
          clearly with Apple Support or an authorized repair provider.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Your Details</h2>
        <div className="grid gap-4 text-sm text-slate-600">
          <label className="grid gap-2">
            What happened?
            <input
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate focus:border-ocean focus:outline-none"
              value={whatHappened}
              onChange={(event) => setWhatHappened(event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            iPhone model
            <input
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate focus:border-ocean focus:outline-none"
              value={iphoneModel}
              onChange={(event) => setIphoneModel(event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            iOS version (optional)
            <input
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate focus:border-ocean focus:outline-none"
              value={iosVersion}
              onChange={(event) => setIosVersion(event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            Does the old device power on?
            <input
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate focus:border-ocean focus:outline-none"
              value={powersOn}
              onChange={(event) => setPowersOn(event.target.value)}
              placeholder="Yes / No"
            />
          </label>
          <label className="grid gap-2">
            Apple ID / iCloud access status
            <input
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate focus:border-ocean focus:outline-none"
              value={accessStatus}
              onChange={(event) => setAccessStatus(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">
          Recommended Official Path
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Based on your details, SafeRestore recommends using official Apple
          recovery and restore tools as the safest next step.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Notes for Support</h2>
        <textarea
          className="min-h-[120px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate focus:border-ocean focus:outline-none"
          placeholder="Add any extra details you want to remember (dates, what you tried, error messages, store visits, etc.)."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          className="rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          type="button"
          onClick={handleCopy}
        >
          Copy Summary
        </button>
        <Link
          to="/recovery"
          className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate transition hover:border-slate-300"
        >
          Back to Recovery
        </Link>
        <button
          className="text-sm font-semibold text-slate-500 underline transition hover:text-slate-700"
          type="button"
          onClick={handleClear}
        >
          Clear Case
        </button>
      </div>
    </section>
  );
}
