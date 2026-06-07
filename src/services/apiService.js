export const API_URL = import.meta.env.VITE_API_URL || "";

export const hasBackend = () => !!API_URL;

// Fetch JSON from the backend with a configurable timeout (default 10s).
// Throws a generic Error on any failure (network, timeout or non-2xx) — the
// backend is the only data source, so callers turn a failure into a neutral
// "data unavailable" state and never expose response bodies.
export async function apiFetch(path, { timeout = 10_000, ...options } = {}) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
