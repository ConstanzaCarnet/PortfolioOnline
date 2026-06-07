import { apiFetch } from "./apiService";

// A longer timeout tolerates a cold-started backend (e.g. Render free tier,
// where the first request can take tens of seconds to wake the instance).
const LOAD_TIMEOUT = 60_000;

// Default watchlist assets (crypto + stocks), already computed and cached by the
// backend. Served instantly from the backend's warm cache; the client never
// touches CoinGecko or Yahoo directly. Throws on failure → UI shows empty state.
export const fetchDefaultAssets = () =>
  apiFetch("/api/market/defaults", { timeout: LOAD_TIMEOUT });

// Forces the backend to refresh its market cache and returns the fresh data.
// Backed by the "Actualizar" button.
export const refreshMarket = () =>
  apiFetch("/api/market/refresh", { timeout: LOAD_TIMEOUT });
