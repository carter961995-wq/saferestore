import { useEffect, useState } from "react";
import { logEvent } from "../lib/analytics.js";

const initialMessages = [
  {
    role: "assistant",
    text: "Hi — I’m your SafeRestore concierge.\n\nI’m here to help you recover your data using the safest official options available. We’ll take this one step at a time.",
  },
];

const assistantReplies = [
  "You’re not alone in this — we’ll figure out the best path forward together.",
  "Based on what you’ve shared, there are still approved recovery options available. I’ll explain each step clearly so you know exactly what to expect.",
  "I can’t help with bypassing device security or accessing data without authorization, but I can guide you through every approved recovery option available to you.",
  "Whenever you’re ready, we can move forward together.",
];

export default function ConciergeChat() {
  const [input, setInput] = useState("");
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(false);
  const [caseDataSummary, setCaseDataSummary] = useState("");
  const [lastPayload, setLastPayload] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("saferestore_caseData");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      const summaryLines = [
        `What happened: ${parsed.incident || "-"}`,
        `iPhone model: ${parsed.deviceModel || "-"}`,
        `iOS version: ${parsed.iosVersion || "-"}`,
        `Does it power on: ${parsed.powersOn || "-"}`,
        `Apple ID / iCloud access status: ${parsed.accessStatus || "-"}`,
      ];
      setCaseDataSummary(summaryLines.join("\n"));
    } catch {
      // ignore invalid stored data
    }
  }, []);

  const sendRequest = async (payload) => {
    setIsThinking(true);
    setError(false);
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 25000);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.message },
      ]);
      logEvent("concierge_ai_response_received");
    } catch (err) {
      setError(true);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const nextMessages = [...chatMessages, { role: "user", text: trimmed }];
    setChatMessages(nextMessages);
    setInput("");
    logEvent("concierge_message_sent");

    const payload = {
      messages: nextMessages
        .filter((message) => ["user", "assistant"].includes(message.role))
        .slice(-10)
        .map((message) => ({
          role: message.role,
          content: message.text,
        })),
    };
    if (caseDataSummary) {
      payload.caseDataSummary = caseDataSummary;
    }

    setLastPayload(payload);
    sendRequest(payload);
  };

  const handleRetry = () => {
    if (!lastPayload) return;
    sendRequest(lastPayload);
  };

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate">Concierge Chat</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          A calm, consent-first chat experience. Responses below are placeholders
          until live AI is connected.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-md whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-ocean text-white shadow-sm"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isThinking ? (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          ) : null}
          {error ? (
            <div className="flex justify-start">
              <button
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600"
                type="button"
                onClick={handleRetry}
              >
                Error. Tap to retry.
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Important: SafeRestore provides guidance based on official Apple
          recovery options. We can’t guarantee data recovery results, and we
          never bypass device security.
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
          <input
            className="flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none"
            placeholder="Type your question… (chat input coming soon)"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSend();
              }
            }}
          />
          <button
            className="rounded-full bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            type="button"
            onClick={handleSend}
            disabled={isThinking}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
