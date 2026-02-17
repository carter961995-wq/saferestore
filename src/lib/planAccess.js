const PLAN_STORAGE_KEY = "saferestore_plan";

export const PLAN_ORDER = ["starter", "advanced", "pro", "enterprise"];

export const PLAN_LABELS = {
  starter: "Starter Recovery",
  advanced: "Advanced Recovery",
  pro: "Pro Subscription",
  enterprise: "Enterprise",
};

export const FEATURE_REQUIREMENTS = {
  readOnlyAcquisition: "starter",
  rawDdImaging: "advanced",
  e01Export: "advanced",
  hashVerification: "advanced",
  postAcquisitionVerification: "advanced",
  chainOfCustody: "advanced",
  raidRebuild: "pro",
  networkImaging: "pro",
  governanceControls: "enterprise",
};

function planRank(plan) {
  const idx = PLAN_ORDER.indexOf(plan);
  return idx === -1 ? 0 : idx;
}

export function getCurrentPlan() {
  if (typeof window === "undefined") return "starter";
  const stored = window.localStorage.getItem(PLAN_STORAGE_KEY);
  return PLAN_ORDER.includes(stored) ? stored : "starter";
}

export function setCurrentPlan(plan) {
  if (typeof window === "undefined") return;
  if (!PLAN_ORDER.includes(plan)) return;
  window.localStorage.setItem(PLAN_STORAGE_KEY, plan);
}

export function isFeatureEnabled(plan, featureKey) {
  const requiredPlan = FEATURE_REQUIREMENTS[featureKey] || "starter";
  return planRank(plan) >= planRank(requiredPlan);
}

export function requiredPlanForFeature(featureKey) {
  return FEATURE_REQUIREMENTS[featureKey] || "starter";
}
