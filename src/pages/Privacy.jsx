export default function Privacy() {
  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold text-slate">Privacy & Data Use</h1>

      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p>SafeRestore is designed to respect your privacy.</p>

        <div className="space-y-2">
          <p className="font-semibold text-slate">What we store:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Recovery details you enter are stored locally in your browser.</li>
            <li>
              Case summaries and notes remain on your device unless you choose to
              copy or share them.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-slate">AI usage:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              If you use concierge chat, messages may be sent to an AI service
              to generate responses.
            </li>
            <li>We do not train models on your data.</li>
            <li>We do not store chat content on our servers.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-slate">What we never do:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Access your device or data directly</li>
            <li>Bypass security, passcodes, or encryption</li>
            <li>Claim guaranteed recovery results</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-slate">You stay in control:</p>
          <p>You can clear your case data at any time.</p>
        </div>
      </div>
    </section>
  );
}
