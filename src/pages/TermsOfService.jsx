export default function TermsOfService() {
  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold text-slate">Terms of Service</h1>

      <p className="text-sm leading-relaxed text-slate-600">
        SafeRestore provides guidance to help you recover data using official,
        approved options. We do not perform data extraction and we do not bypass
        device security.
      </p>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">
          What SafeRestore is
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          SafeRestore is a guidance-only service. We provide step-by-step
          recommendations based on the information you choose to share.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">
          What SafeRestore is not
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>A data extraction tool</li>
          <li>A device unlocking service</li>
          <li>A guaranteed recovery solution</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">No guarantees</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Recovery outcomes depend on your device condition, your account access,
          and Apple’s systems. SafeRestore cannot guarantee recovery.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">
          User responsibility
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          You are responsible for confirming that you own the device and have
          authorization to perform recovery actions. You authorize every step
          you take.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">Acceptable use</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          You may not use SafeRestore to attempt to access data without
          authorization or to bypass security controls.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">Contact</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Questions about these terms can be sent to:
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
