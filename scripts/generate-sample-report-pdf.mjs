import fs from "node:fs";
import path from "node:path";

const lines = [
  "SafeRestore Sample Forensic Report",
  "",
  "Case ID: CASE-2026-0001",
  "Examiner/Operator: Jordan Smith",
  "Timestamp (UTC): 2026-02-17T18:00:00Z",
  "Source Device Identifier: SERIAL-PLACEHOLDER / MODEL-PLACEHOLDER",
  "Imaging Format: E01",
  "Acquisition Method: Read-only",
  "MD5: 8f14e45fceea167a5a36dedd4bea2543",
  "SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "",
  "Verification Result: MATCH",
  "Post-acquisition Verification: Completed; image hash matches acquisition hash records.",
  "",
  "Chain-of-Custody Events:",
  "1) 2026-02-17T18:00:00Z - Intake recorded (Operator: Jordan Smith)",
  "2) 2026-02-17T18:20:00Z - Acquisition started (Read-only mode)",
  "3) 2026-02-17T19:05:00Z - Acquisition completed (E01)",
  "4) 2026-02-17T19:15:00Z - Hash verification completed (MATCH)",
  "5) 2026-02-17T19:25:00Z - Report export generated",
  "",
  "Disclaimer: This tool assists analysis. Operator procedure and documentation",
  "quality determine evidentiary reliability and legal outcomes.",
];

function escapePdfText(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

const textOps = ["BT", "/F1 11 Tf", "50 780 Td", "14 TL"];
for (const line of lines) {
  textOps.push(`(${escapePdfText(line)}) Tj`);
  textOps.push("T*");
}
textOps.push("ET");
const stream = textOps.join("\n") + "\n";

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}endstream`,
];

let pdf = "%PDF-1.4\n";
const offsets = [0];
for (let i = 0; i < objects.length; i += 1) {
  offsets.push(Buffer.byteLength(pdf, "utf8"));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf, "utf8");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";
for (let i = 1; i <= objects.length; i += 1) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

const outA = path.resolve("assets/reports/sample-forensic-report.pdf");
const outB = path.resolve("public/assets/reports/sample-forensic-report.pdf");

fs.mkdirSync(path.dirname(outA), { recursive: true });
fs.mkdirSync(path.dirname(outB), { recursive: true });
fs.writeFileSync(outA, pdf, "binary");
fs.writeFileSync(outB, pdf, "binary");

console.log(`Generated ${outA}`);
console.log(`Generated ${outB}`);
