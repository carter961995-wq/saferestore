export const EVIDENCE_TEMPLATES = [
  {
    id: "incident_response",
    name: "Incident Response",
    requiredFields: ["operatorName", "evidenceSource", "incidentDate"],
    checklist: [
      "Document acquisition start/end timestamps",
      "Record source identifiers and environment details",
      "Capture integrity hash values at acquisition",
      "Log every export event in custody records",
    ],
  },
  {
    id: "legal_hold",
    name: "Legal Hold / Litigation",
    requiredFields: [
      "operatorName",
      "reviewerName",
      "evidenceSource",
      "incidentDate",
      "jurisdiction",
    ],
    checklist: [
      "Confirm legal hold scope and case identifier",
      "Preserve read-only handling notes",
      "Record chain-of-custody handoffs with actor identity",
      "Validate post-acquisition hash comparison",
    ],
  },
  {
    id: "internal_investigation",
    name: "Internal Investigation",
    requiredFields: ["operatorName", "evidenceSource", "incidentDate"],
    checklist: [
      "Document authorization for evidence handling",
      "Capture source condition and imaging method",
      "Store notes on verification outcomes",
      "Finalize signoff before export",
    ],
  },
];

export const FIELD_LABELS = {
  operatorName: "Operator Name",
  reviewerName: "Reviewer Name",
  evidenceSource: "Evidence Source",
  incidentDate: "Incident Date",
  jurisdiction: "Jurisdiction / Matter",
};
