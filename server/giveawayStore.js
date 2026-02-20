import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { ALLOWED_TIERS, CLAIMS_PER_IP_24H, DISPOSABLE_EMAIL_DOMAINS, TIER_TOTALS } from "./giveawayConfig.js";

const DEFAULT_STORE_PATH = path.resolve("server", "data", "giveaway-store.json");
const STORE_PATH = process.env.GIVEAWAY_STORE_PATH
  ? path.resolve(process.env.GIVEAWAY_STORE_PATH)
  : DEFAULT_STORE_PATH;

const DEFAULT_STORE = {
  giveaway_license_keys: [],
  giveaway_claims: [],
};

let queue = Promise.resolve();

function withLock(operation) {
  const next = queue.then(() => operation());
  queue = next.catch(() => {});
  return next;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isDisposableDomain(email) {
  const domain = email.split("@")[1] || "";
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain.toLowerCase());
}

function safeText(value, fallback = "") {
  const cleaned = String(value || "").trim();
  return cleaned.length ? cleaned : fallback;
}

function readStore() {
  if (!fs.existsSync(STORE_PATH)) {
    return structuredClone(DEFAULT_STORE);
  }
  const raw = fs.readFileSync(STORE_PATH, "utf8");
  if (!raw.trim()) {
    return structuredClone(DEFAULT_STORE);
  }
  const parsed = JSON.parse(raw);
  return {
    giveaway_license_keys: Array.isArray(parsed.giveaway_license_keys)
      ? parsed.giveaway_license_keys
      : [],
    giveaway_claims: Array.isArray(parsed.giveaway_claims) ? parsed.giveaway_claims : [],
  };
}

function writeStoreAtomic(data) {
  const dir = path.dirname(STORE_PATH);
  fs.mkdirSync(dir, { recursive: true });
  const tempPath = `${STORE_PATH}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, STORE_PATH);
}

function toRemainingCounts(store) {
  const counts = {};
  for (const tier of ALLOWED_TIERS) {
    const total = Number(TIER_TOTALS[tier] || 0);
    const claimed = store.giveaway_license_keys.filter(
      (key) => key.tier === tier && key.isClaimed
    ).length;
    counts[tier] = {
      total,
      claimed,
      remaining: Math.max(0, total - claimed),
    };
  }
  return counts;
}

function normalizeTier(value) {
  return String(value || "").trim();
}

function keyLast4(licenseKey) {
  const normalized = String(licenseKey || "");
  return normalized.length <= 4 ? normalized : normalized.slice(-4);
}

export async function getGiveawayStatus() {
  return withLock(async () => {
    const store = readStore();
    return {
      tiers: toRemainingCounts(store),
      updatedAt: nowIso(),
    };
  });
}

export async function claimGiveawayKey({ tier, email, hp, ip, userAgent }) {
  return withLock(async () => {
    const normalizedTier = normalizeTier(tier);
    const normalizedEmail = normalizeEmail(email);
    const normalizedHp = safeText(hp);
    const safeIp = safeText(ip, "unknown");
    const safeUA = safeText(userAgent, "unknown");

    if (!ALLOWED_TIERS.includes(normalizedTier)) {
      return { ok: false, status: 400, error: "Invalid tier.", reason: "invalid_tier" };
    }

    if (!validateEmail(normalizedEmail)) {
      return { ok: false, status: 400, error: "Valid email required.", reason: "invalid_email" };
    }

    if (normalizedHp.length > 0) {
      return { ok: false, status: 400, error: "Invalid request.", reason: "honeypot" };
    }

    if (isDisposableDomain(normalizedEmail)) {
      return {
        ok: false,
        status: 400,
        error: "Disposable email domains are not allowed.",
        reason: "disposable_email",
      };
    }

    const store = readStore();

    const alreadyClaimed = store.giveaway_claims.some(
      (claim) => claim.tier === normalizedTier && claim.email === normalizedEmail
    );
    if (alreadyClaimed) {
      return {
        ok: false,
        status: 409,
        error: "This email already claimed this tier.",
        reason: "duplicate_email_tier",
      };
    }

    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const ipClaims24h = store.giveaway_claims.filter((claim) => {
      return claim.ip === safeIp && new Date(claim.createdAt).getTime() >= cutoff;
    }).length;

    if (ipClaims24h >= CLAIMS_PER_IP_24H) {
      return {
        ok: false,
        status: 429,
        error: "Too many claims from this IP in 24 hours.",
        reason: "ip_rate_limit",
      };
    }

    const keyIdx = store.giveaway_license_keys.findIndex(
      (row) => row.tier === normalizedTier && !row.isClaimed
    );

    if (keyIdx === -1) {
      return {
        ok: false,
        status: 409,
        error: "This tier is sold out.",
        reason: "sold_out",
      };
    }

    const now = nowIso();
    const selected = store.giveaway_license_keys[keyIdx];
    const claimId = crypto.randomUUID();

    store.giveaway_license_keys[keyIdx] = {
      ...selected,
      isClaimed: true,
      claimedAt: now,
      claimedEmail: normalizedEmail,
      claimedIp: safeIp,
      claimedUserAgent: safeUA,
    };

    store.giveaway_claims.push({
      id: claimId,
      tier: normalizedTier,
      email: normalizedEmail,
      ip: safeIp,
      userAgent: safeUA,
      createdAt: now,
      licenseKeyId: selected.id,
    });

    writeStoreAtomic(store);

    return {
      ok: true,
      claim: {
        tier: normalizedTier,
        licenseKey: selected.licenseKey,
        keyId: selected.id,
        keyLast4: keyLast4(selected.licenseKey),
      },
      remainingCounts: toRemainingCounts(store),
    };
  });
}

export async function uploadGiveawayKeys({ tier, keys }) {
  return withLock(async () => {
    const normalizedTier = normalizeTier(tier);
    if (!ALLOWED_TIERS.includes(normalizedTier)) {
      return { ok: false, status: 400, error: "Invalid tier." };
    }

    if (!Array.isArray(keys)) {
      return { ok: false, status: 400, error: "keys array required." };
    }

    const store = readStore();
    const existing = new Set(
      store.giveaway_license_keys.map((row) => String(row.licenseKey || "").toUpperCase())
    );

    let insertedCount = 0;
    let skippedCount = 0;

    for (const raw of keys) {
      const licenseKey = String(raw || "").trim().toUpperCase();
      if (!licenseKey || existing.has(licenseKey)) {
        skippedCount += 1;
        continue;
      }

      store.giveaway_license_keys.push({
        id: crypto.randomUUID(),
        tier: normalizedTier,
        licenseKey,
        isClaimed: false,
        claimedAt: null,
        claimedEmail: null,
        claimedIp: null,
        claimedUserAgent: null,
        createdAt: nowIso(),
      });
      existing.add(licenseKey);
      insertedCount += 1;
    }

    writeStoreAtomic(store);

    return {
      ok: true,
      insertedCount,
      skippedCount,
    };
  });
}

export async function listGiveawayKeys({ tier }) {
  return withLock(async () => {
    const normalizedTier = normalizeTier(tier);
    const store = readStore();
    const rows = store.giveaway_license_keys
      .filter((row) => (normalizedTier ? row.tier === normalizedTier : true))
      .map((row) => ({
        id: row.id,
        tier: row.tier,
        licenseKey: row.licenseKey,
        isClaimed: Boolean(row.isClaimed),
        claimedAt: row.claimedAt,
        claimedEmail: row.claimedEmail,
      }));
    return { ok: true, keys: rows };
  });
}

export async function getAdminGiveawaySnapshot() {
  return withLock(async () => {
    const store = readStore();
    const status = {
      tiers: toRemainingCounts(store),
      updatedAt: nowIso(),
    };

    const keysById = new Map(store.giveaway_license_keys.map((key) => [key.id, key]));

    const lastClaims = store.giveaway_claims
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
      .map((claim) => ({
        ...claim,
        licenseKey: keysById.get(claim.licenseKeyId)?.licenseKey || "unknown",
      }));

    return { status, lastClaims };
  });
}

export async function exportGiveawayClaimsCsv() {
  return withLock(async () => {
    const store = readStore();
    const keysById = new Map(store.giveaway_license_keys.map((row) => [row.id, row]));

    const rows = ["tier,email,license_key,claimed_at,ip,user_agent"];
    for (const claim of store.giveaway_claims) {
      const key = keysById.get(claim.licenseKeyId);
      const license = key?.licenseKey || "";
      const line = [
        claim.tier,
        claim.email,
        license,
        claim.createdAt,
        claim.ip,
        claim.userAgent || "",
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",");
      rows.push(line);
    }

    return rows.join("\n");
  });
}

export async function resetGiveawayStoreForTests(seed) {
  return withLock(async () => {
    const next = seed || structuredClone(DEFAULT_STORE);
    writeStoreAtomic(next);
  });
}
