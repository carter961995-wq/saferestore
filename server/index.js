import express from "express";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const devOrigin =
  process.env.NODE_ENV === "development" ? "http://localhost:5173" : null;
const allowedOrigin = process.env.ALLOWED_ORIGIN || null;
const allowedOrigins = [devOrigin, allowedOrigin].filter(Boolean);

app.use((req, res, next) => {
  if (req.headers.origin && allowedOrigins.includes(req.headers.origin)) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

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

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

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

app.use("/api", (_req, res) => {
  return sendError(res, 404, "Not found.");
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`SafeRestore server listening on ${port}`);
});
