export function getApiOrigin() {
  // Allow override for mobile/LAN testing, e.g. VITE_API_ORIGIN="http://192.168.1.10:5000"
  const fromEnv = import.meta.env.VITE_API_ORIGIN;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  // Default: same host as the frontend, backend on :5000
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${host}:5000`;
}

export function getApiBaseUrl() {
  return `${getApiOrigin()}/api`;
}

export function getSocketUrl() {
  // socket.io server is the same as API origin
  const fromEnv = import.meta.env.VITE_SOCKET_ORIGIN;
  return (fromEnv ? fromEnv.replace(/\/$/, "") : getApiOrigin());
}

