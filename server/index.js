import express from "express";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Price IDs (confirmed order: 29 -> 19 -> 9)
const PRICE_IDS = {
  quick9: "price_1Sv8FNRzCu2QTLbmn3hNmFxb",
  guided19: "price_1Sv8HVRzCu2QTLbmXrHqHuA4",
  concierge29: "price_1Sv8S9RzCu2QTLbm0tWmlXHe",
};

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

dotenv.config();

const app = express();
app.set("trust proxy", 1);


app.use(express.json({ limit: "10kb" }));

app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: "Too many requests." });
    },
  })
);

const sendError = (res, status, message) => {
  res.status(status).json({ error: message });
};

const systemPrompt = `You are the SafeRestore concierge. Provide calm, reassuring, plain-English guidance.
Only recommend official Apple recovery paths. Never bypass device security, passcodes, or encryption.
Never suggest unauthorized access. Focus on clear, step-by-step guidance.`;

app.use("/api/chat", chatLimiter);
app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return sendError(res, 500, "Server not configured.");
  }

  const { messages, caseDataSummary } = req.body || {};
  if (!Array.isArray(messages)) {
    return sendError(res, 400, "Invalid message format.");
  }

  const safeMessages = messages
    .filter((message) => message && ["user", "assistant"].includes(message.role))
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: String(message.content || ""),
    }))
    .filter((message) => message.content.trim().length > 0);

  if (safeMessages.length === 0) {
    return sendError(res, 400, "No messages provided.");
  }

  const client = new OpenAI({ apiKey });

  try {
    const contextMessage = caseDataSummary
      ? { role: "system", content: String(caseDataSummary) }
      : null;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...(contextMessage ? [contextMessage] : []),
        ...safeMessages,
      ],
      temperature: 0.2,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return sendError(res, 502, "No response from model.");
    }

    return res.json({ message: reply });
  } catch (error) {
    return sendError(res, 502, "Upstream AI error.");
  }
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`SafeRestore server listening on ${port}`);
});
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.post("/api/checkout", async (req, res) => {
  try {
    const { tier } = req.body;

    const price =
      tier === "quick9"
        ? PRICE_IDS.quick9
        : tier === "guided19"
        ? PRICE_IDS.guided19
        : tier === "concierge29"
        ? PRICE_IDS.concierge29
        : null;

    if (!price) {
      return res.status(400).json({ error: "Invalid tier" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${CLIENT_URL}/chat?paid=1&tier=${tier}`,
      cancel_url: `${CLIENT_URL}/pricing?canceled=1`,
      allow_promotion_codes: true,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

