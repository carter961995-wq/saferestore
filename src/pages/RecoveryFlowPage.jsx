import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecoveryFlowPage() {
  const navigate = useNavigate();
  const [incident, setIncident] = useState("My iPhone was damaged");
  const [deviceModel, setDeviceModel] = useState("");
  const [iosVersion, setIosVersion] = useState("");
  const [powersOn, setPowersOn] = useState("Yes");
  const [accessOptions, setAccessOptions] = useState({
    appleId: false,
    icloud: false,
    unsure: false,
  });

  const toggleAccess = (key) => {
    setAccessOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const accessStatus = [
    accessOptions.appleId ? "I know my Apple ID" : null,
    accessOptions.icloud ? "I can access iCloud" : null,
    accessOptions.unsure ? "I’m not sure" : null,
  ]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    const caseData = {
      incident,
      deviceModel,
      iosVersion,
      powersOn,
      accessStatus,
    };
    localStorage.setItem("saferestore_caseData", JSON.stringify(caseData));
  }, [incident, deviceModel, iosVersion, powersOn, accessStatus]);

  const handleCaseSummary = () => {
    const caseData = {
      incident,
      deviceModel,
      iosVersion,
      powersOn,
      accessStatus,
    };
    localStorage.setItem("saferestore_caseData", JSON.stringify(caseData));
    navigate("/case-summary");
  };

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Step 1 of 4</span>
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === 0 ? "bg-ocean" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-slate">
          Recovery flow, step by step
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          SafeRestore keeps the process simple and calm. These steps are
          designed to mirror official recovery guidance without shortcuts.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate">What happened?</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {[
              "My iPhone was damaged",
              "I upgraded and data is missing",
              "I deleted files by mistake",
              "Something else",
            ].map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <input
                  type="radio"
                  name="incident"
                  value={option}
                  checked={incident === option}
                  onChange={(event) => setIncident(event.target.value)}
                />
                {option}
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            This helps us recommend the safest recovery path for your situation.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate">Your device</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-600">
            <label className="grid gap-2">
              iPhone model
              <input
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate focus:border-ocean focus:outline-none"
                value={deviceModel}
                onChange={(event) => setDeviceModel(event.target.value)}
                placeholder="e.g., iPhone 14 Pro"
              />
            </label>
            <label className="grid gap-2">
              iOS version (optional)
              <input
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate focus:border-ocean focus:outline-none"
                value={iosVersion}
                onChange={(event) => setIosVersion(event.target.value)}
                placeholder="e.g., iOS 17.3"
              />
            </label>
            <label className="grid gap-2">
              Does the old device power on? (Yes / No)
              <select
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate focus:border-ocean focus:outline-none"
                value={powersOn}
                onChange={(event) => setPowersOn(event.target.value)}
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </label>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Device details help us narrow down the most reliable recovery
            options.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate">
            What access do you still have?
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {[
              { key: "appleId", label: "I know my Apple ID" },
              { key: "icloud", label: "I can access iCloud" },
              { key: "unsure", label: "I’m not sure" },
            ].map((option) => (
              <label
                key={option.key}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={accessOptions[option.key]}
                  onChange={() => toggleAccess(option.key)}
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Don’t worry — we’ll adjust the plan based on what you still have
            access to.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Your Recovery Plan</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Based on your device and access, the safest recovery path is to use
          official Apple recovery and restore tools.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We’ll guide you step by step so you can move forward with confidence.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            type="button"
          >
            Continue with Concierge
          </button>
          <button
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate transition hover:border-slate-300"
            type="button"
            onClick={handleCaseSummary}
          >
            View Case Summary
          </button>
        </div>
      </div>
    </section>
  );
}
