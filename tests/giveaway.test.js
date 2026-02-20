import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

async function loadStoreModule(tempFile) {
  process.env.GIVEAWAY_STORE_PATH = tempFile;
  return import(`../server/giveawayStore.js?ts=${Date.now()}-${Math.random()}`);
}

function seedKeys(tier, count, prefix) {
  return Array.from({ length: count }, (_, idx) => ({
    id: `${prefix}-${idx + 1}`,
    tier,
    licenseKey: `${prefix}-KEY-${idx + 1}`,
    isClaimed: false,
    claimedAt: null,
    claimedEmail: null,
    claimedIp: null,
    claimedUserAgent: null,
    createdAt: new Date().toISOString(),
  }));
}

test("valid claim returns a key", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sr-giveaway-"));
  const tempFile = path.join(tempDir, "store.json");
  const mod = await loadStoreModule(tempFile);

  await mod.resetGiveawayStoreForTests({
    giveaway_license_keys: [...seedKeys("consumer", 1, "C")],
    giveaway_claims: [],
  });

  const result = await mod.claimGiveawayKey({
    tier: "consumer",
    email: "user@example.com",
    hp: "",
    ip: "1.1.1.1",
    userAgent: "test",
  });

  assert.equal(result.ok, true);
  assert.equal(result.claim.tier, "consumer");
  assert.match(result.claim.licenseKey, /^C-KEY-/);
});

test("same email+tier cannot claim twice", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sr-giveaway-"));
  const tempFile = path.join(tempDir, "store.json");
  const mod = await loadStoreModule(tempFile);

  await mod.resetGiveawayStoreForTests({
    giveaway_license_keys: [...seedKeys("consumer", 2, "C")],
    giveaway_claims: [],
  });

  const first = await mod.claimGiveawayKey({
    tier: "consumer",
    email: "user@example.com",
    hp: "",
    ip: "1.1.1.1",
    userAgent: "test",
  });
  assert.equal(first.ok, true);

  const second = await mod.claimGiveawayKey({
    tier: "consumer",
    email: "user@example.com",
    hp: "",
    ip: "1.1.1.2",
    userAgent: "test",
  });
  assert.equal(second.ok, false);
  assert.equal(second.status, 409);
});

test("rate limit: 4th claim from same IP in 24h rejected", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sr-giveaway-"));
  const tempFile = path.join(tempDir, "store.json");
  const mod = await loadStoreModule(tempFile);

  await mod.resetGiveawayStoreForTests({
    giveaway_license_keys: [
      ...seedKeys("consumer", 2, "C"),
      ...seedKeys("advanced", 2, "A"),
      ...seedKeys("pro", 2, "P"),
    ],
    giveaway_claims: [],
  });

  const ip = "2.2.2.2";
  const first = await mod.claimGiveawayKey({ tier: "consumer", email: "a@x.com", hp: "", ip, userAgent: "t" });
  const second = await mod.claimGiveawayKey({ tier: "advanced", email: "b@x.com", hp: "", ip, userAgent: "t" });
  const third = await mod.claimGiveawayKey({ tier: "pro", email: "c@x.com", hp: "", ip, userAgent: "t" });
  const fourth = await mod.claimGiveawayKey({ tier: "consumer", email: "d@x.com", hp: "", ip, userAgent: "t" });

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(third.ok, true);
  assert.equal(fourth.ok, false);
  assert.equal(fourth.status, 429);
});

test("sold-out tier returns 409", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sr-giveaway-"));
  const tempFile = path.join(tempDir, "store.json");
  const mod = await loadStoreModule(tempFile);

  await mod.resetGiveawayStoreForTests({
    giveaway_license_keys: [],
    giveaway_claims: [],
  });

  const result = await mod.claimGiveawayKey({
    tier: "consumer",
    email: "soldout@example.com",
    hp: "",
    ip: "3.3.3.3",
    userAgent: "test",
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 409);
});

test("honeypot filled rejects", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sr-giveaway-"));
  const tempFile = path.join(tempDir, "store.json");
  const mod = await loadStoreModule(tempFile);

  await mod.resetGiveawayStoreForTests({
    giveaway_license_keys: [...seedKeys("consumer", 1, "C")],
    giveaway_claims: [],
  });

  const result = await mod.claimGiveawayKey({
    tier: "consumer",
    email: "bot@example.com",
    hp: "I am a bot",
    ip: "4.4.4.4",
    userAgent: "test",
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("concurrency: 10 parallel claims with 5 keys issues exactly 5 unique keys", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sr-giveaway-"));
  const tempFile = path.join(tempDir, "store.json");
  const mod = await loadStoreModule(tempFile);

  await mod.resetGiveawayStoreForTests({
    giveaway_license_keys: [...seedKeys("consumer", 5, "C")],
    giveaway_claims: [],
  });

  const jobs = Array.from({ length: 10 }, (_, idx) =>
    mod.claimGiveawayKey({
      tier: "consumer",
      email: `user${idx + 1}@example.com`,
      hp: "",
      ip: `5.5.5.${(idx % 3) + 1}`,
      userAgent: "test",
    })
  );

  const results = await Promise.all(jobs);
  const successes = results.filter((row) => row.ok);
  const keys = successes.map((row) => row.claim.licenseKey);
  const uniqueKeys = new Set(keys);

  assert.equal(successes.length, 5);
  assert.equal(uniqueKeys.size, 5);
});
