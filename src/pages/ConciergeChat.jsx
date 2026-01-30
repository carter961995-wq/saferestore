<<<<<<< HEAD
import { useEffect, useState } from "react";
import { logEvent } from "../lib/analytics.js";

const initialMessages = [
  {
    role: "assistant",
    text: "Hi — I’m your SafeRestore concierge.\n\nI’m here to help you recover your data using the safest official options available. We’ll take this one step at a time.",
  },
];

export default function ConciergeChat() {
  const [input, setInput] = useState("");
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(false);
  const [caseDataSummary, setCaseDataSummary] = useState("");
  const [lastPayload, setLastPayload] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const apiUrl = apiBaseUrl
    ? `${apiBaseUrl.replace(/\/$/, "")}/api/chat`
    : "/api/chat";

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
=======
import { useEffect, useMemo, useState } from "react";

export default function ConciergeChat() {
  const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi — I’m SafeRestore. Tell me what happened and I’ll help you next-step it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [apiOk, setApiOk] = useState(true);
  const [error, setError] = useState("");

  const chatEndpoint = useMemo(() => {
    // If VITE_API_URL is set, use Render (or your backend). Otherwise fallback to relative.
    return API_BASE ? `${API_BASE}/api/chat` : `/api/chat`;
  }, [API_BASE]);

  const checkoutEndpoint = useMemo(() => {
    return API_BASE ? `${API_BASE}/api/checkout` : `/api/checkout`;
  }, [API_BASE]);

  // Optional: quick health check so UI can warn you if backend is down
  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      if (!API_BASE) {
        // If you forgot VITE_API_URL, we can’t verify backend
        setApiOk(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/health`, { method: "GET" });
        if (!cancelled) setApiOk(res.ok);
      } catch {
        if (!cancelled) setApiOk(false);
      }
>>>>>>> cfc48ba (Fix API routing to backend)
    }

<<<<<<< HEAD
  const sendRequest = async (payload) => {
    setIsThinking(true);
    setError(false);
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 25000);
      const response = await fetch(apiUrl, {
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
=======
    checkHealth();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  async function sendMessage() {
    setError("");
    const text = input.trim();
    if (!text || isSending) return;

    // Add user message immediately
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // This shape is flexible. Your backend can read `message` or `messages`.
        body: JSON.stringify({ message: text, messages: nextMessages }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Chat request failed (${res.status}). ${body}`);
      }

      const data = await res.json().catch(() => ({}));

      // Support common response shapes:
      const assistantText =
        data.reply ||
        data.message ||
        data.response ||
        data.output ||
        (typeof data === "string" ? data : "");

      if (!assistantText) {
        throw new Error(
          "Chat response came back empty. Check your /api/chat response format."
        );
      }

      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
      setApiOk(true);
    } catch (e) {
      setApiOk(false);
      setError(e?.message || "Chat failed. Check backend logs.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn’t reach the server. If this keeps happening, the backend may be down or misconfigured.",
        },
      ]);
    } finally {
      setIsSending(false);
>>>>>>> cfc48ba (Fix API routing to backend)
    }
  }

<<<<<<< HEAD
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
=======
  async function startCheckout() {
    setError("");
    try {
      const res = await fetch(checkoutEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Adjust these fields if your backend expects something else
        body: JSON.stringify({ plan: "pro" }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Checkout failed (${res.status}). ${body}`);
      }

      const data = await res.json().catch(() => ({}));

      // Common patterns:
      // - { url: "https://checkout.stripe.com/..." }
      // - { checkoutUrl: "..." }
      const url = data.url || data.checkoutUrl;

      if (!url) {
        throw new Error(
          "Checkout response missing URL. Your /api/checkout should return { url: '...' }"
        );
      }

      window.location.href = url;
    } catch (e) {
      setError(e?.message || "Checkout failed. Check backend logs.");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>SafeRestore Concierge</h1>
        <span
          style={{
            fontSize: 12,
            padding: "4px 8px",
            borderRadius: 999,
            border: "1px solid #ddd",
          }}
          title={API_BASE ? `Backend: ${API_BASE}` : "Backend not configured"}
        >
          {apiOk ? "Backend: OK" : "Backend: NOT REACHABLE"}
        </span>
      </div>

      {!API_BASE && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #f2c94c",
            background: "#fff7db",
            borderRadius: 10,
          }}
        >
          <strong>Heads up:</strong> VITE_API_URL is not set. In Vercel, add
          <code style={{ marginLeft: 6 }}>VITE_API_URL</code> pointing to your
          Render backend (example: <code>https://saferestore.onrender.com</code>)
          and redeploy.
>>>>>>> cfc48ba (Fix API routing to backend)
        </div>
      )}

<<<<<<< HEAD
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
=======
      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #ff6b6b",
            background: "#fff0f0",
            borderRadius: 10,
            whiteSpace: "pre-wrap",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: 16,
          minHeight: 360,
          maxHeight: 520,
          overflowY: "auto",
          background: "white",
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 12,
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #eee",
                background: m.role === "user" ? "#f5f5f5" : "#ffffff",
                whiteSpace: "pre-wrap",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
                {m.role === "user" ? "You" : "SafeRestore"}
              </div>
              <div>{m.content}</div>
            </div>
          </div>
        ))}
        {isSending && (
          <div style={{ fontSize: 13, opacity: 0.7 }}>Thinking…</div>
        )}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type what happened…"
          style={{
            flex: 1,
            padding: "12px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            outline: "none",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          disabled={isSending}
        />

        <button
          onClick={sendMessage}
          disabled={isSending || !input.trim()}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: isSending ? "#f5f5f5" : "white",
            cursor: isSending ? "not-allowed" : "pointer",
          }}
        >
          Send
        </button>

        <button
          onClick={startCheckout}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "white",
            cursor: "pointer",
          }}
        >
          Go Pro
        </button>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        If chat doesn’t respond, check Render logs and confirm the backend is up.
      </div>
    </div>
>>>>>>> cfc48ba (Fix API routing to backend)
  );
}
