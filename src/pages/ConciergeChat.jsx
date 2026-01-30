import { useEffect, useRef, useState } from "react";

export default function ConciergeChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        text:
          "Hi 👋 I’m SafeRestore Concierge. Tell me what happened to your device and I’ll guide you through Apple-approved recovery options.",
      },
    ]);
  }, []);

  // Unlock after Stripe success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      setIsPaid(true);
      localStorage.setItem("saferestore_paid", "1");
    } else if (localStorage.getItem("saferestore_paid") === "1") {
      setIsPaid(true);
    }
  }, []);

  const handleRetry = () => setError(false);

  const startCheckout = async (tier) => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const sendMessage = async (userMessage) => {
    setLoading(true);
    setIsThinking(true);
    setError(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply || "No response received." },
      ]);
    } catch (err) {
      setError(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setIsThinking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (input.length > 2000) {
      alert("Please keep messages under 2000 characters.");
      return;
    }

    const userMessage = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    await sendMessage(userMessage);
  };

  const showPaywall = !isPaid && messages.length >= 3;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">
        SafeRestore Concierge
      </h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {messages.map((message, index) => (
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

          {isThinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <button
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600"
                type="button"
                onClick={handleRetry}
              >
                Error. Tap to retry.
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {showPaywall && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-800">
              Continue with SafeRestore
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Choose a one-time plan to continue your guided recovery session.
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm hover:bg-slate-100"
                onClick={() => startCheckout("quick9")}
              >
                <div className="font-semibold">$9.99</div>
                <div className="text-xs text-slate-500">Quick Recovery</div>
              </button>

              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm hover:bg-slate-100"
                onClick={() => startCheckout("guided19")}
              >
                <div className="font-semibold">$19.99</div>
                <div className="text-xs text-slate-500">Guided Recovery</div>
              </button>

              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm hover:bg-slate-100"
                onClick={() => startCheckout("concierge29")}
              >
                <div className="font-semibold">$29.99</div>
                <div className="text-xs text-slate-500">Concierge Recovery</div>
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
        >
          <input
            className="flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              showPaywall
                ? "Choose a plan to continue…"
                : "Type your question…"
            }
            disabled={loading || showPaywall}
          />

          <button
            className="rounded-full bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-300 disabled:opacity-50"
            type="submit"
            disabled={loading || showPaywall || !input.trim()}
          >
            {l
