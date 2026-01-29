export default function PrivacyPolicy() {
  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold text-slate">Privacy Policy</h1>

      <p className="text-sm leading-relaxed text-slate-600">
        SafeRestore is a guidance-only service. We take privacy seriously and
        collect as little information as possible.
      </p>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">What we collect</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          SafeRestore may temporarily store information you voluntarily enter,
          such as device details and recovery notes, in your browser to help
          generate guidance and summaries.
        </p>
        <p className="text-sm leading-relaxed text-slate-600">
          We do not require account creation to use the service.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">
          What we do not collect
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>We do not access your device or your data.</li>
          <li>We do not bypass security, passcodes, or encryption.</li>
          <li>We do not sell or share personal data.</li>
          <li>We do not track you across websites.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">
          How your information is used
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Any information you enter is used solely to provide recovery guidance
          and generate summaries you can copy or save.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">Your control</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          You can clear your information at any time by using the “Clear Case”
          option or by clearing your browser storage.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">Contact</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          If you have questions about privacy, contact us at:
        </p>
        <p className="text-sm font-semibold text-slate-600">
          support@saferestore.app
        </p>
      </div>

      <div className="text-sm text-slate-500">
        Your data. Your control. Official paths only.
      </div>
    </section>
  );
}
