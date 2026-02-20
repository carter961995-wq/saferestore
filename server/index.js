import express from "express";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import dotenv from "dotenv";
import Stripe from "stripe";
import fs from "node:fs";
import path from "node:path";
import {
  claimGiveawayKey,
  exportGiveawayClaimsCsv,
  getAdminGiveawaySnapshot,
  getGiveawayStatus,
  listGiveawayKeys,
  uploadGiveawayKeys,
} from "./giveawayStore.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "10kb" }));

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

const PRICE_IDS = {
  quick9: "price_1Sv8FNRzCu2QTLbmn3hNmFxb",
  guided19: "price_1Sv8HVRzCu2QTLbmXrHqHuA4",
  concierge29: "price_1Sv8S9RzCu2QTLbm0tWmlXHe",
};

const ROLE_LEVEL = {
  user: 1,
  analyst: 2,
  admin: 3,
};

const auditEvents = [];
const MAX_AUDIT_EVENTS = 500;
const auditLogPath = path.resolve("server", "audit.log.jsonl");

const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many requests." });
  },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const giveawayClaimLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many claim attempts. Try again later." });
  },
});

app.use(globalLimiter);

function sendError(res, status, message) {
  res.status(status).json({ error: message });
}

function getRole(req) {
  const raw = String(req.header("x-sr-role") || "user").toLowerCase();
  return Object.prototype.hasOwnProperty.call(ROLE_LEVEL, raw) ? raw : "user";
}

function getActor(req) {
  return String(req.header("x-sr-actor") || "anonymous");
}

function createAuditEvent(req, event, details = {}, status = "ok") {
  const entry = {
    ts: new Date().toISOString(),
    event,
    status,
    role: getRole(req),
    actor: getActor(req),
    ip: req.ip,
    method: req.method,
    path: req.path,
    details,
  };

  auditEvents.push(entry);
  if (auditEvents.length > MAX_AUDIT_EVENTS) {
    auditEvents.splice(0, auditEvents.length - MAX_AUDIT_EVENTS);
  }

  try {
    fs.appendFileSync(auditLogPath, `${JSON.stringify(entry)}\n`, "utf8");
  } catch {
    // Avoid failing request flow if local audit file write fails.
  }

  return entry;
}

function requireRole(minRole) {
  return (req, res, next) => {
    const role = getRole(req);
    if (ROLE_LEVEL[role] < ROLE_LEVEL[minRole]) {
      createAuditEvent(
        req,
        "rbac_denied",
        {
          requiredRole: minRole,
          actualRole: role,
        },
        "denied"
      );
      return sendError(res, 403, "Insufficient role.");
    }
    return next();
  };
}

function extractAdminToken(req) {
  const auth = String(req.header("authorization") || "");
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return String(req.query?.token || "").trim();
}

function requireAdminToken(req, res, next) {
  if (!ADMIN_TOKEN) {
    return sendError(res, 503, "Admin token not configured.");
  }
  const token = extractAdminToken(req);
  if (!token || token !== ADMIN_TOKEN) {
    return sendError(res, 403, "Invalid admin token.");
  }
  return next();
}

function logClaimAttempt({ status, reason, tier, ip, keyId = null, keyLast4 = null }) {
  const payload = {
    event: "giveaway_claim_attempt",
    status,
    reason,
    tier,
    ip,
    keyId,
    keyLast4,
    ts: new Date().toISOString(),
  };
  console.log(JSON.stringify(payload));
}

const systemPrompt = `You are the SafeRestore concierge. Provide calm, reassuring, plain-English guidance.
Only recommend official Apple recovery paths. Never bypass device security, passcodes, or encryption.
Never suggest unauthorized access. Focus on clear, step-by-step guidance.`;

app.use("/api/chat", chatLimiter);
app.use("/api/checkout", checkoutLimiter);
app.use("/api/giveaway/claim", giveawayClaimLimiter);

app.post("/api/chat", async (req, res) => {
  if (!OPENAI_API_KEY) {
    createAuditEvent(req, "chat_failed", { reason: "missing_openai_api_key" }, "error");
    return sendError(res, 500, "Server not configured.");
  }

  const { messages, caseDataSummary } = req.body || {};
  if (!Array.isArray(messages)) {
    createAuditEvent(req, "chat_failed", { reason: "invalid_message_format" }, "error");
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
    createAuditEvent(req, "chat_failed", { reason: "empty_messages" }, "error");
    return sendError(res, 400, "No messages provided.");
  }

  const client = new OpenAI({ apiKey: OPENAI_API_KEY });

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
      createAuditEvent(req, "chat_failed", { reason: "empty_model_reply" }, "error");
      return sendError(res, 502, "No response from model.");
    }

    createAuditEvent(req, "chat_success", { messageCount: safeMessages.length });
    return res.json({ message: reply });
  } catch {
    createAuditEvent(req, "chat_failed", { reason: "upstream_ai_error" }, "error");
    return sendError(res, 502, "Upstream AI error.");
  }
});

app.post("/api/checkout", async (req, res) => {
  if (!STRIPE_SECRET_KEY) {
    createAuditEvent(req, "checkout_failed", { reason: "missing_stripe_key" }, "error");
    return sendError(res, 500, "Checkout is not configured.");
  }

  try {
    const { tier } = req.body || {};
    const price = PRICE_IDS[tier] || null;

    if (!price) {
      createAuditEvent(req, "checkout_failed", { reason: "invalid_tier", tier }, "error");
      return sendError(res, 400, "Invalid tier.");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${CLIENT_URL}/chat?paid=1&tier=${tier}`,
      cancel_url: `${CLIENT_URL}/pricing?canceled=1`,
      allow_promotion_codes: true,
    });

    createAuditEvent(req, "checkout_session_created", {
      tier,
      price,
      hasUrl: Boolean(session.url),
    });

    return res.json({ url: session.url });
  } catch {
    createAuditEvent(req, "checkout_failed", { reason: "stripe_error" }, "error");
    return sendError(res, 500, "Checkout failed.");
  }
});

app.get("/api/giveaway/status", async (_req, res) => {
  const status = await getGiveawayStatus();
  res.json(status);
});

app.post("/api/giveaway/claim", async (req, res) => {
  const { tier, email, hp = "" } = req.body || {};
  const result = await claimGiveawayKey({
    tier,
    email,
    hp,
    ip: req.ip,
    userAgent: req.header("user-agent") || "",
  });

  if (!result.ok) {
    logClaimAttempt({
      status: "failed",
      reason: result.reason || "claim_failed",
      tier,
      ip: req.ip,
    });
    return sendError(res, result.status || 400, result.error || "Claim failed.");
  }

  logClaimAttempt({
    status: "success",
    reason: "claimed",
    tier: result.claim.tier,
    ip: req.ip,
    keyId: result.claim.keyId,
    keyLast4: result.claim.keyLast4,
  });

  return res.json({
    tier: result.claim.tier,
    licenseKey: result.claim.licenseKey,
    remainingCounts: result.remainingCounts,
  });
});

app.post("/api/admin/giveaway/upload", requireAdminToken, async (req, res) => {
  const { tier, keys } = req.body || {};
  const result = await uploadGiveawayKeys({ tier, keys });
  if (!result.ok) {
    return sendError(res, result.status || 400, result.error || "Upload failed.");
  }

  return res.json({
    insertedCount: result.insertedCount,
    skippedCount: result.skippedCount,
  });
});

app.get("/api/admin/giveaway/export-claims", requireAdminToken, async (req, res) => {
  const csv = await exportGiveawayClaimsCsv();
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="giveaway-claims-${Date.now()}.csv"`
  );
  res.send(csv);
});

app.get("/api/admin/giveaway/keys", requireAdminToken, async (req, res) => {
  const { tier = "" } = req.query || {};
  const result = await listGiveawayKeys({ tier });
  if (!result.ok) {
    return sendError(res, result.status || 400, result.error || "Unable to list keys.");
  }
  res.json(result);
});

app.get("/api/admin/giveaway/snapshot", requireAdminToken, async (_req, res) => {
  const snapshot = await getAdminGiveawaySnapshot();
  res.json(snapshot);
});

app.get("/api/admin/rbac/check", requireRole("analyst"), (req, res) => {
  const role = getRole(req);
  const capabilities = {
    canViewAudit: ROLE_LEVEL[role] >= ROLE_LEVEL.analyst,
    canExportAudit: ROLE_LEVEL[role] >= ROLE_LEVEL.analyst,
    canAdminControls: ROLE_LEVEL[role] >= ROLE_LEVEL.admin,
  };
  createAuditEvent(req, "rbac_check", { capabilities });
  res.json({ role, capabilities });
});

app.get("/api/admin/audit/events", requireRole("admin"), (_req, res) => {
  res.json({ events: auditEvents.slice(-200) });
});

app.get("/api/admin/audit/export", requireRole("analyst"), (req, res) => {
  createAuditEvent(req, "audit_exported", { count: auditEvents.length });
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="audit-export-${Date.now()}.json"`);
  res.send(JSON.stringify({ exportedAt: new Date().toISOString(), events: auditEvents }, null, 2));
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`SafeRestore server listening on ${port}`);
});
