export default function Support() {
  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold text-slate">Support</h1>

      <p className="text-sm leading-relaxed text-slate-600">
        If you need help using SafeRestore or you’re preparing to contact Apple
        Support, we’re here to help.
      </p>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">Contact us</h2>
        <p className="text-sm leading-relaxed text-slate-600">Email:</p>
        <p className="text-sm font-semibold text-slate-600">
          support@saferestore.app
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">What to include</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>iPhone model and iOS version (if known)</li>
          <li>What happened (damage, missing data, deletion, upgrade)</li>
          <li>What access you still have (Apple ID / iCloud)</li>
          <li>Any error messages you saw</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate">Emergency note</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          If your device contains sensitive information and you believe it may
          be compromised, contact Apple Support directly as soon as possible.
        </p>
      </div>

      <div className="text-sm text-slate-500">
        Your data. Your control. Official paths only.
      </div>
    </section>
  );
}
