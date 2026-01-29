const STORAGE_KEY = "saferestore_events";
const MAX_EVENTS = 100;

const isBrowser = typeof window !== "undefined";

export function getEvents() {
  if (!isBrowser) return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function logEvent(event, data) {
  if (!isBrowser) return;
  const entry = {
    event,
    ts: new Date().toISOString(),
    ...(data ? { data } : {}),
  };
  const events = [...getEvents(), entry].slice(-MAX_EVENTS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function clearEvents() {
  if (!isBrowser) return;
  localStorage.removeItem(STORAGE_KEY);
}
