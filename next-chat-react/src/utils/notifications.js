const STORAGE_KEY = "nc_notifications_v1";

export function loadNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNotifications(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []));
  } catch {
    // ignore
  }
}

export function pushNotification(notification) {
  const next = [notification, ...loadNotifications()].slice(0, 30);
  saveNotifications(next);
  window.dispatchEvent(new CustomEvent("nc:notifications", { detail: next }));
  return next;
}

export function clearNotifications() {
  saveNotifications([]);
  window.dispatchEvent(new CustomEvent("nc:notifications", { detail: [] }));
}

