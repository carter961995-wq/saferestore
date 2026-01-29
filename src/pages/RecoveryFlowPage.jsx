const steps = [
  {
    title: "Confirm ownership and consent",
    description:
      "We begin with clear ownership confirmation so every step is authorized and safe.",
  },
  {
    title: "Check Apple ID access",
    description:
      "We guide you through official Apple account recovery and access verification.",
  },
  {
    title: "Restore from backup or sync",
    description:
      "We help identify what is already synced or backed up and how to restore it.",
  },
  {
    title: "Route to authorized service",
    description:
      "If hardware repair is needed, we point you to authorized repair providers.",
  },
];

export default function RecoveryFlowPage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate">
          Recovery flow, step by step
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-calm">
          SafeRestore keeps the process simple and calm. These steps are
          designed to mirror official recovery guidance without shortcuts.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex gap-4 rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky text-sm font-semibold text-slate">
              {index + 1}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate">
                {step.title}
              </h2>
              <p className="mt-1 text-sm text-calm">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-sky bg-white p-6 text-sm text-calm">
        Need personalized guidance? The concierge can help you choose the right
        official path based on your device and account status.
      </div>
    </section>
  );
}
