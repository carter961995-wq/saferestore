const messages = [
  {
    role: "assistant",
    text: "Hi, I’m SafeRestore. I can guide you through official recovery steps. What happened to your device?",
  },
  {
    role: "user",
    text: "My iPhone screen is broken, but it still turns on.",
  },
  {
    role: "assistant",
    text: "Thanks for sharing. If you can unlock the device, we’ll prioritize a Quick Start transfer and confirm your latest iCloud backup.",
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
                className={`max-w-md rounded-2xl px-4 py-3 text-sm ${
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
