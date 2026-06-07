import { apiFetch } from "./apiService";

const LOAD_TIMEOUT = 60_000;

// Dollar exchange rates, already filtered to the displayed types and normalized
// (MEP/bolsa) by the backend. Throws on failure → UI shows empty state.
export const fetchDolarPrices = () =>
  apiFetch("/api/currency/dolar", { timeout: LOAD_TIMEOUT });

export default fetchDolarPrices;
