export default function TrustCenter() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">Trust Center</h1>
        <p className="text-base leading-relaxed text-slate-600">
          SafeRestore is built for one thing: helping you recover your data
          using safe, official options — with complete respect for your privacy.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">
          What SafeRestore does
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Guides you through official Apple recovery paths.</li>
          <li>Helps you choose the safest next step based on your situation.</li>
          <li>Explains each step in plain English, without pressure.</li>
        </ul>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">
          What SafeRestore will never do
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Bypass device security, passcodes, or encryption.</li>
          <li>Access data without your authorization.</li>
          <li>Claim guaranteed recovery when it isn’t possible.</li>
        </ul>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Privacy and consent</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          SafeRestore is guidance-first. You stay in control. You authorize every
          step you take, and you can stop at any time.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Official paths only</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          We guide recovery through approved Apple tools and processes such as
          iCloud restore, Apple account recovery, and device-to-device transfer
          when available.
        </p>
      </div>

      <div className="text-sm text-slate-500">
        Your data. Your control. Official paths only.
      </div>
    </section>
  );
}
