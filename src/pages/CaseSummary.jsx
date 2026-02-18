import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { logEvent } from "../lib/analytics.js";
import { EVIDENCE_TEMPLATES, FIELD_LABELS } from "../lib/evidenceTemplates.js";

function timestampIso() {
  return new Date().toISOString();
}

function caseIdFromTimestamp() {
  const now = new Date();
  const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getUTCDate()).padStart(2, "0")}`;
  const randPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SR-${datePart}-${randPart}`;
}

function downloadBlob(filename, text, type = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

async function sha256Hex(input) {
  if (!window.crypto?.subtle) {
    return "unavailable";
  }
  const data = new TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function CaseSummary() {
  const [whatHappened, setWhatHappened] = useState("");
  const [iphoneModel, setIphoneModel] = useState("");
  const [iosVersion, setIosVersion] = useState("");
  const [powersOn, setPowersOn] = useState("");
  const [accessStatus, setAccessStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [packStatus, setPackStatus] = useState("");
  const [currentCaseId] = useState(caseIdFromTimestamp);

  const [templateId, setTemplateId] = useState(EVIDENCE_TEMPLATES[0].id);
  const [operatorName, setOperatorName] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [evidenceSource, setEvidenceSource] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [operatorSignoff, setOperatorSignoff] = useState(false);
  const [reviewSignoff, setReviewSignoff] = useState(false);

  const activeTemplate = useMemo(
    () => EVIDENCE_TEMPLATES.find((template) => template.id === templateId) || EVIDENCE_TEMPLATES[0],
    [templateId]
  );

  const inputBase =
    "rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate focus:border-ocean focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
  const primaryButton =
    "rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/40";
  const secondaryButton =
    "rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300";

  const isWhatHappenedValid = whatHappened.trim().length > 0;
  const isIphoneModelValid = iphoneModel.trim().length > 0;

  const fieldValueMap = {
    operatorName,
    reviewerName,
    evidenceSource,
    incidentDate,
    jurisdiction,
  };

  const missingTemplateFields = activeTemplate.requiredFields.filter(
    (field) => !String(fieldValueMap[field] || "").trim()
  );

  const isSignoffValid = operatorSignoff && reviewSignoff;
  const hasCustodyIdentifiers = Boolean(
    operatorName.trim() && evidenceSource.trim() && incidentDate.trim()
  );

  const qualityChecks = useMemo(
    () => [
      {
        key: "base_details",
        label: "Required case details captured",
        weight: 20,
        passed: isWhatHappenedValid && isIphoneModelValid,
      },
      {
        key: "template_fields",
        label: "Template-required fields completed",
        weight: 30,
        passed: missingTemplateFields.length === 0,
      },
      {
        key: "signoff",
        label: "Operator and reviewer signoff completed",
        weight: 25,
        passed: isSignoffValid,
      },
      {
        key: "custody_ids",
        label: "Chain-of-custody identifiers present",
        weight: 15,
        passed: hasCustodyIdentifiers,
      },
      {
        key: "reviewer_assigned",
        label: "Reviewer identity recorded",
        weight: 10,
        passed: Boolean(reviewerName.trim()),
      },
    ],
    [
      hasCustodyIdentifiers,
      isIphoneModelValid,
      isSignoffValid,
      isWhatHappenedValid,
      missingTemplateFields.length,
      reviewerName,
    ]
  );

  const qualityScore = qualityChecks.reduce(
    (total, check) => total + (check.passed ? check.weight : 0),
    0
  );

  const missingControls = qualityChecks
    .filter((check) => !check.passed)
    .map((check) => check.label);

  const readinessStatus = useMemo(() => {
    const hasBlockingIssues =
      !isWhatHappenedValid ||
      !isIphoneModelValid ||
      missingTemplateFields.length > 0 ||
      !isSignoffValid;

    if (hasBlockingIssues) {
      return "No-Go";
    }
    if (qualityScore < 85) {
      return "Conditional";
    }
    return "Go";
  }, [
    isIphoneModelValid,
    isSignoffValid,
    isWhatHappenedValid,
    missingTemplateFields.length,
    qualityScore,
  ]);

  const readinessToneClass =
    readinessStatus === "Go"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : readinessStatus === "Conditional"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-red-700 bg-red-50 border-red-200";

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

  const summaryText = useMemo(
    () =>
      [
        "SafeRestore — Case Summary",
        "",
        `Case ID: ${currentCaseId}`,
        `Template: ${activeTemplate.name}`,
        `Generated At (UTC): ${timestampIso()}`,
        "",
        "Evidence Workflow Context",
        `• Operator: ${operatorName || "-"}`,
        `• Reviewer: ${reviewerName || "-"}`,
        `• Evidence Source: ${evidenceSource || "-"}`,
        `• Incident Date: ${incidentDate || "-"}`,
        `• Jurisdiction / Matter: ${jurisdiction || "-"}`,
        `• Evidence Quality Score: ${qualityScore}/100`,
        `• Readiness Status: ${readinessStatus}`,
        "",
        "Your Details",
        `• What happened?: ${whatHappened || "-"}`,
        `• iPhone model: ${iphoneModel || "-"}`,
        `• iOS version (optional): ${iosVersion || "-"}`,
        `• Does the old device power on?: ${powersOn || "-"}`,
        `• Apple ID / iCloud access status: ${accessStatus || "-"}`,
        "",
        "Recommended Official Path",
        "Based on your details, SafeRestore recommends using official Apple recovery and restore tools as the safest next step.",
        "",
        "Notes for Support",
        notes || "-",
      ].join("\n"),
    [
      accessStatus,
      activeTemplate.name,
      currentCaseId,
      evidenceSource,
      incidentDate,
      iosVersion,
      iphoneModel,
      jurisdiction,
      notes,
      operatorName,
      powersOn,
      reviewerName,
      whatHappened,
      qualityScore,
      readinessStatus,
    ]
  );

  const validateRequired = () => {
    const baseValid = isWhatHappenedValid && isIphoneModelValid;
    const templateValid = missingTemplateFields.length === 0;
    const signoffValid = isSignoffValid;
    return baseValid && templateValid && signoffValid;
  };

  const handleCopy = async () => {
    if (!validateRequired()) {
      setShowValidation(true);
      return;
    }
    let copiedOk = false;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(summaryText);
        copiedOk = true;
      } catch {
        copiedOk = false;
      }
    }
    if (!copiedOk) {
      const textarea = document.createElement("textarea");
      textarea.value = summaryText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      copiedOk = document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    if (!copiedOk) return;
    logEvent("case_summary_copied");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const exportLegalPack = async () => {
    if (!validateRequired()) {
      setShowValidation(true);
      return;
    }

    setPackStatus("Generating legal pack...");

    const generatedAt = timestampIso();
    const casePayload = {
      caseId: currentCaseId,
      generatedAt,
      workflowTemplate: activeTemplate.id,
      operator: operatorName,
      reviewer: reviewerName,
      evidenceSource,
      incidentDate,
      jurisdiction,
      sourceDevice: {
        model: iphoneModel || "unknown",
        iosVersion: iosVersion || "unknown",
        powersOn: powersOn || "unknown",
        accessStatus: accessStatus || "unknown",
      },
      incident: whatHappened || "unknown",
      notes: notes || "",
      recommendedPath:
        "Use official Apple recovery and restore tools; no bypassing passcodes or encryption.",
      signoff: {
        operatorSignoff,
        reviewSignoff,
      },
      quality: {
        score: qualityScore,
        readiness: readinessStatus,
        missingControls,
      },
    };

    const reportText = summaryText;
    const reportHash = await sha256Hex(reportText);
    const payloadHash = await sha256Hex(JSON.stringify(casePayload));

    const chainOfCustody = [
      {
        event: "Case Intake",
        timestamp: generatedAt,
        actor: operatorName || "Operator",
        detail: "Case summary assembled from workflow template inputs.",
      },
      {
        event: "Template Validation",
        timestamp: timestampIso(),
        actor: reviewerName || "Reviewer",
        detail: `Required template fields validated for ${activeTemplate.name}.`,
      },
      {
        event: "Legal Pack Export",
        timestamp: timestampIso(),
        actor: operatorName || "Operator",
        detail: "Report, custody log, and manifest exported.",
      },
    ];

    const manifest = {
      files: [
        { name: `report-${currentCaseId}.txt`, sha256: reportHash },
        { name: `custody-${currentCaseId}.csv`, sha256: "generated-at-export" },
        { name: `legal-pack-${currentCaseId}.json`, sha256: "self-referential" },
      ],
      template: activeTemplate.id,
      requiredFieldsSatisfied: activeTemplate.requiredFields,
      quality: {
        score: qualityScore,
        readiness: readinessStatus,
      },
      disclaimers: [
        "Tool assists analysis; operator procedure determines evidentiary reliability.",
        "No bypassing encryption, passcodes, or unauthorized access.",
      ],
    };

    const legalPack = {
      reportVersion: "1.0",
      case: casePayload,
      integrity: {
        summarySha256: reportHash,
        casePayloadSha256: payloadHash,
      },
      chainOfCustody,
      manifest,
    };

    const csvRows = [
      ["event", "timestamp", "actor", "detail"],
      ...chainOfCustody.map((row) => [
        row.event,
        row.timestamp,
        row.actor,
        row.detail,
      ]),
    ];

    const custodyCsv = csvRows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    downloadBlob(`report-${currentCaseId}.txt`, reportText);
    downloadBlob(`custody-${currentCaseId}.csv`, custodyCsv, "text/csv;charset=utf-8");
    downloadBlob(
      `legal-pack-${currentCaseId}.json`,
      JSON.stringify(legalPack, null, 2),
      "application/json;charset=utf-8"
    );

    logEvent("legal_pack_exported", {
      caseId: currentCaseId,
      template: activeTemplate.id,
      readinessStatus,
      qualityScore,
    });
    setPackStatus("Legal pack downloaded.");
    window.setTimeout(() => setPackStatus(""), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem("saferestore_caseData");
    logEvent("case_cleared");
    setWhatHappened("");
    setIphoneModel("");
    setIosVersion("");
    setPowersOn("");
    setAccessStatus("");
    setNotes("");
    setOperatorName("");
    setReviewerName("");
    setEvidenceSource("");
    setIncidentDate("");
    setJurisdiction("");
    setOperatorSignoff(false);
    setReviewSignoff(false);
    setPackStatus("");
    setShowValidation(false);
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
        <h2 className="text-base font-semibold text-slate">Evidence Workflow Template</h2>
        <label className="grid gap-2 text-sm text-slate-600">
          Template
          <select
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
            className={`${inputBase} border-slate-200`}
          >
            {EVIDENCE_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-600">
          <label className="grid gap-2">
            Operator Name
            <input
              className={`${inputBase} ${showValidation && missingTemplateFields.includes("operatorName") ? "border-red-300" : "border-slate-200"}`}
              value={operatorName}
              onChange={(event) => setOperatorName(event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            Reviewer Name
            <input
              className={`${inputBase} ${showValidation && missingTemplateFields.includes("reviewerName") ? "border-red-300" : "border-slate-200"}`}
              value={reviewerName}
              onChange={(event) => setReviewerName(event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            Evidence Source
            <input
              className={`${inputBase} ${showValidation && missingTemplateFields.includes("evidenceSource") ? "border-red-300" : "border-slate-200"}`}
              value={evidenceSource}
              onChange={(event) => setEvidenceSource(event.target.value)}
              placeholder="e.g., iPhone 14 Pro serial XXXX"
            />
          </label>
          <label className="grid gap-2">
            Incident Date
            <input
              type="date"
              className={`${inputBase} ${showValidation && missingTemplateFields.includes("incidentDate") ? "border-red-300" : "border-slate-200"}`}
              value={incidentDate}
              onChange={(event) => setIncidentDate(event.target.value)}
            />
          </label>
          <label className="grid gap-2 md:col-span-2">
            Jurisdiction / Matter
            <input
              className={`${inputBase} ${showValidation && missingTemplateFields.includes("jurisdiction") ? "border-red-300" : "border-slate-200"}`}
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value)}
              placeholder="Optional unless required by template"
            />
          </label>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <div className="font-semibold mb-1">Template checklist</div>
          <ul className="list-disc pl-5 space-y-1">
            {activeTemplate.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {showValidation && missingTemplateFields.length > 0 ? (
          <div className="text-xs text-red-500">
            Missing required template fields: {missingTemplateFields.map((field) => FIELD_LABELS[field]).join(", ")}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Your Details</h2>
        <div className="grid gap-4 text-sm text-slate-600">
          <label className="grid gap-2">
            What happened?
            <input
              className={`${inputBase} ${
                showValidation && !isWhatHappenedValid
                  ? "border-red-300"
                  : "border-slate-200"
              }`}
              value={whatHappened}
              onChange={(event) => setWhatHappened(event.target.value)}
            />
            {showValidation && !isWhatHappenedValid ? (
              <span className="text-xs text-red-500">Required</span>
            ) : null}
          </label>
          <label className="grid gap-2">
            iPhone model
            <input
              className={`${inputBase} ${
                showValidation && !isIphoneModelValid
                  ? "border-red-300"
                  : "border-slate-200"
              }`}
              value={iphoneModel}
              onChange={(event) => setIphoneModel(event.target.value)}
            />
            {showValidation && !isIphoneModelValid ? (
              <span className="text-xs text-red-500">Required</span>
            ) : null}
          </label>
          <label className="grid gap-2">
            iOS version (optional)
            <input
              className={`${inputBase} border-slate-200`}
              value={iosVersion}
              onChange={(event) => setIosVersion(event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            Does the old device power on?
            <input
              className={`${inputBase} border-slate-200`}
              value={powersOn}
              onChange={(event) => setPowersOn(event.target.value)}
              placeholder="Yes / No"
            />
          </label>
          <label className="grid gap-2">
            Apple ID / iCloud access status
            <input
              className={`${inputBase} border-slate-200`}
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
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Important: SafeRestore provides guidance based on official Apple
          recovery options. We can’t guarantee data recovery results, and we
          never bypass device security.
        </div>
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

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Signoff Checkpoint</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Exports are enabled only after operator and review signoff.
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={operatorSignoff}
            onChange={(event) => setOperatorSignoff(event.target.checked)}
          />
          Operator confirms workflow steps were followed.
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={reviewSignoff}
            onChange={(event) => setReviewSignoff(event.target.checked)}
          />
          Reviewer confirms required fields and integrity notes are complete.
        </label>
        {showValidation && !isSignoffValid ? (
          <div className="text-xs text-red-500">Both signoff checks are required.</div>
        ) : null}
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Evidence Quality and Readiness</h2>
        <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${readinessToneClass}`}>
          {readinessStatus}
        </div>
        <div className="text-sm text-slate-700">
          Quality score: <span className="font-semibold">{qualityScore}/100</span>
        </div>
        <ul className="space-y-2 text-sm text-slate-600">
          {qualityChecks.map((check) => (
            <li
              key={check.key}
              className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <span>{check.label}</span>
              <span className={check.passed ? "text-emerald-700 font-semibold" : "text-slate-500"}>
                {check.passed ? "Pass" : "Missing"}
              </span>
            </li>
          ))}
        </ul>
        {missingControls.length > 0 ? (
          <div className="text-xs text-slate-500">
            Missing controls: {missingControls.join(", ")}
          </div>
        ) : (
          <div className="text-xs text-emerald-700">No missing controls detected.</div>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Legal Pack Export</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Generate a court-review-ready starter pack with report text, SHA-256
          integrity hashes, chain-of-custody CSV, and a manifest JSON.
        </p>
        <div className="text-xs text-slate-500">Case ID: {currentCaseId}</div>
        {packStatus ? (
          <div className="text-xs font-semibold text-ocean">{packStatus}</div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button className={primaryButton} type="button" onClick={handleCopy}>
            Copy Summary
          </button>
          {copied ? (
            <span className="text-sm font-semibold text-slate-500">Copied</span>
          ) : null}
        </div>
        <button className={secondaryButton} type="button" onClick={exportLegalPack}>
          Export Legal Pack
        </button>
        <Link to="/recovery" className={secondaryButton}>
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
