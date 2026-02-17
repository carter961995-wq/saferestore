export default function TrustCenter() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">Trust Center</h1>
        <p className="text-base leading-relaxed text-slate-600">
          SafeRestore is designed for recovery teams, forensic practitioners,
          and legal stakeholders who need transparent, defensible workflows.
        </p>
      </div>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">1) Read-only acquisition design</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>
            SafeRestore acquisition workflows are designed to avoid writing to
            source media during acquisition steps.
          </li>
          <li>
            This helps preserve original evidence state and reduce risk of
            accidental modification.
          </li>
          <li>
            Operators should still validate hardware and OS mount behavior
            before each case.
          </li>
        </ul>
      </article>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">2) Hardware write blocker recommendation</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>
            Best practice is to use a hardware write blocker for physical media
            acquisition when available.
          </li>
          <li>
            SafeRestore is designed to be compatible with industry-standard
            write blocker workflows.
          </li>
          <li>
            Confirm firmware, cabling, and device recognition as part of your
            intake checklist.
          </li>
        </ul>
      </article>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">3) Imaging formats supported</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>
            RAW/DD: sector-level image format commonly used for portability and
            tooling compatibility.
          </li>
          <li>
            E01: segmented, metadata-friendly evidence format used in many
            forensic workflows.
          </li>
        </ul>
      </article>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">4) Hashing and integrity (MD5 and SHA-256)</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>
            A hash is a digital fingerprint of evidence data at a point in time.
          </li>
          <li>
            SafeRestore workflows support MD5 and SHA-256 integrity records.
          </li>
          <li>
            Matching hashes help show that an image has not changed after
            acquisition.
          </li>
        </ul>
      </article>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">5) Post-acquisition verification</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>
            After imaging completes, re-hash the finished image file.
          </li>
          <li>
            Compare that hash to the acquisition hash values recorded at capture
            time.
          </li>
          <li>
            A match indicates the stored image is consistent with what was
            acquired.
          </li>
        </ul>
      </article>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">6) Chain of custody logging</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Case records should include structured chain-of-custody entries for
          each handoff and processing event.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>Case ID</li>
          <li>Operator identity</li>
          <li>Timestamps</li>
          <li>Device identifiers</li>
          <li>Acquisition and verification hashes</li>
          <li>Export events and recipients</li>
        </ul>
      </article>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">7) Security and privacy</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>
            Case artifacts and logs are designed for controlled local handling.
          </li>
          <li>
            Network transmission should be limited to explicitly configured
            service operations.
          </li>
          <li>
            SafeRestore does not bypass encryption, passcodes, or platform
            security controls.
          </li>
        </ul>
      </article>

      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">8) Limitations</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>Recovery and extraction results depend on media condition.</li>
          <li>
            Operator procedure, tooling configuration, and documentation quality
            directly affect outcomes.
          </li>
          <li>
            SafeRestore does not guarantee courtroom admissibility in every
            matter.
          </li>
        </ul>
      </article>

      <p className="text-sm text-slate-500">
        SafeRestore focuses on reproducible process design, integrity checks,
        and transparent operator workflows.
      </p>
    </section>
  );
}
