const messages = [
  {
    role: "assistant",
    text: "Hi — I’m your SafeRestore concierge.\n\nI’m here to help you recover your data using the safest official options available. We’ll take this one step at a time.",
  },
  {
    role: "user",
    text: "My iPhone was damaged and I’m worried about my photos.",
  },
  {
    role: "assistant",
    text: "You’re not alone in this — we’ll figure out the best path forward together.",
  },
  {
    role: "assistant",
    text: "Based on what you’ve shared, there are still approved recovery options available. I’ll explain each step clearly so you know exactly what to expect.",
  },
  {
    role: "assistant",
    text: "I can’t help with bypassing device security or accessing data without authorization, but I can guide you through every approved recovery option available to you.",
  },
  {
    role: "assistant",
    text: "Whenever you’re ready, we can move forward together.",
  },
];

export default function ConciergeChat() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate">Concierge Chat</h1>
        <p className="mt-2 text-sm text-calm">
          A calm, consent-first chat experience. Responses below are placeholders
          until live AI is connected.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-md whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "bg-ocean text-white"
                    : "bg-sky text-slate"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-sky px-4 py-2 text-sm text-calm">
          <span className="flex-1">
            Type your question… (chat input coming soon)
          </span>
          <button
            className="rounded-full bg-sky px-4 py-2 text-xs font-semibold text-slate"
            type="button"
            disabled
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
