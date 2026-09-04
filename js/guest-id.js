// A guest (not signed in) still needs a stable identity for their message
// thread to persist across visits. This generates one ID the first time,
// stores it in localStorage, and reuses it forever after — so a guest's
// conversation survives closing the tab, restarting the browser, etc.,
// without requiring an account. Clearing browser data resets it (expected
// tradeoff of not requiring sign-in).
const KEY = "asante_guest_id";

export function getGuestId() {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = "g" + (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "") : Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem(KEY, id);
  }
  return id;
}
