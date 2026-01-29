import express from "express";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json({ limit: "10kb" }));

app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const systemPrompt = `You are the SafeRestore concierge. Provide calm, reassuring, plain-English guidance.
Only recommend official Apple recovery paths. Never bypass device security, passcodes, or encryption.
Never suggest unauthorized access. Focus on clear, step-by-step guidance.`;

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server not configured." });
  }

  const { messages, caseDataSummary } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid message format." });
  }

  const safeMessages = messages
    .filter((message) => message && ["user", "assistant"].includes(message.role))
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: String(message.content || ""),
    }))
    .filter((message) => message.content.trim().length > 0);

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
      return res.status(502).json({ error: "No response from model." });
    }

    return res.json({ message: reply });
  } catch (error) {
    return res.status(502).json({ error: "Upstream AI error." });
  }
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`SafeRestore server listening on ${port}`);
});
