const ROLE_KEY = "saferestore_role";
const ACTOR_KEY = "saferestore_actor";

export function getSecurityContext() {
  if (typeof window === "undefined") {
    return { role: "user", actor: "anonymous" };
  }
  const role = window.localStorage.getItem(ROLE_KEY) || "user";
  const actor = window.localStorage.getItem(ACTOR_KEY) || "anonymous";
  return { role, actor };
}

export function setSecurityContext({ role, actor }) {
  if (typeof window === "undefined") return;
  if (role) window.localStorage.setItem(ROLE_KEY, role);
  if (actor) window.localStorage.setItem(ACTOR_KEY, actor);
}

export async function apiFetch(url, options = {}) {
  const { role, actor } = getSecurityContext();
  const headers = {
    "Content-Type": "application/json",
    "x-sr-role": role,
    "x-sr-actor": actor,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
