import { apiFetch } from "./apiService";

const LOAD_TIMEOUT = 60_000;

// Argentine economic indicators (riesgo país, inflación, UVA, plazo fijo),
// parsed and aggregated by the backend. Each field may be null if its upstream
// failed and no cached value exists; the component skips those. Throws only if
// the whole request fails → UI shows empty state.
export const fetchEconomicIndicators = () =>
  apiFetch("/api/indicators/economic", { timeout: LOAD_TIMEOUT });

export default fetchEconomicIndicators;
