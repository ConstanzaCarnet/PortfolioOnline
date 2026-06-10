import { useState, useEffect, useCallback } from "react";
import { fetchDolarPrices } from "../../services/currencyService";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../data/translations";

const CARD_ORDER = ["oficial", "tarjeta", "mep", "cripto"];

const mono = { fontFamily: '"JetBrains Mono", monospace' };

export const CurrencyConverter = () => {
  const [rates, setRates]           = useState([]);
  const [status, setStatus]         = useState("loading"); // loading | ready | error
  const [amount, setAmount]         = useState("");
  const [selectedCasa, setSelectedCasa] = useState("oficial");
  const [direction, setDirection]   = useState("USD_TO_ARS");
  const { language } = useLanguage();
  const f = t.finance;

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await fetchDolarPrices();
      setRates(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  const sortedRates = [...rates].sort(
    (a, b) => CARD_ORDER.indexOf(a.casa) - CARD_ORDER.indexOf(b.casa)
  );

  const currentRate = rates.find((r) => r.casa === selectedCasa) || { compra: 0, venta: 0, fecha: "" };

  const formatDateTime = (iso) => {
    if (!iso) return "--";
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })} · ${d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })} hs`;
    } catch { return "S/D"; }
  };

  const calculateResult = () => {
    const v = parseFloat(amount) || 0;
    return direction === "USD_TO_ARS"
      ? (v * currentRate.compra).toLocaleString("es-AR", { minimumFractionDigits: 2 })
      : (v / currentRate.venta).toFixed(2);
  };

  if (status === "loading") {
    return <div style={{ color: "#94a3b8", padding: "20px" }}>{f.converterLoading[language]}</div>;
  }

  if (status === "error") {
    return (
      <div className="market-empty-state">
        <p className="market-error-msg">⚠️ {f.unavailable[language]}</p>
        <button onClick={load} className="refresh-market-btn">{f.retry[language]}</button>
      </div>
    );
  }

  return (
    <div className="currency-converter-card">
      <h3 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 700 }}>
        {f.converterTitle[language]}
      </h3>
      <p style={{ color: "#64748b", fontSize: "0.82rem", margin: "0 0 20px" }}>
        {f.converterSubtitle[language]}
      </p>

      {/* ── Rate cards ──────────────────────────────────────────────────── */}
      <div className="currency-rate-cards">
        {sortedRates.map((r) => {
          const active = selectedCasa === r.casa;
          return (
            <div
              key={r.casa}
              onClick={() => setSelectedCasa(r.casa)}
              style={{
                background: active ? "rgba(30,64,175,0.45)" : "rgba(15,23,42,0.7)",
                border: active ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "14px 14px 10px",
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              {/* Name */}
              <div style={{ ...mono, fontSize: "0.68rem", color: active ? "#93c5fd" : "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                Dólar {r.nombre}
              </div>

              {/* Compra / Venta side by side */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: "4px" }}>
                <div>
                  <div style={{ ...mono, fontSize: "0.64rem", color: active ? "#93c5fd" : "#94a3b8", marginBottom: "3px" }}>
                    {f.buy[language]}
                  </div>
                  <div style={{ ...mono, fontSize: "0.95rem", fontWeight: 700, color: "#34d399" }}>
                    ${r.compra.toLocaleString("es-AR")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ ...mono, fontSize: "0.64rem", color: active ? "#93c5fd" : "#94a3b8", marginBottom: "3px" }}>
                    {f.sell[language]}
                  </div>
                  <div style={{ ...mono, fontSize: "0.95rem", fontWeight: 700, color: "#60a5fa" }}>
                    ${r.venta.toLocaleString("es-AR")}
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div style={{ ...mono, fontSize: "0.66rem", color: active ? "#bfdbfe" : "#94a3b8", marginTop: "10px", paddingTop: "8px", borderTop: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.08)" }}>
                {formatDateTime(r.fecha)}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Calculator ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "140px" }}>
            <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "6px" }}>
              {f.amountLabel[language]}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              placeholder={f.amountPlaceholder[language]}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 12px", borderRadius: "6px",
                border: "1px solid #334155", background: "#0f172a",
                color: "#fff", fontSize: "0.95rem",
              }}
            />
          </div>

          <div style={{ flex: 2, minWidth: "180px" }}>
            <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "6px" }}>
              {f.operationLabel[language]}
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 12px", borderRadius: "6px",
                border: "1px solid #334155", background: "#1e293b",
                color: "#fff", fontSize: "0.95rem", cursor: "pointer",
              }}
            >
              <option value="USD_TO_ARS">{f.optUsdToArs[language]}</option>
              <option value="ARS_TO_USD">{f.optArsToUsd[language]}</option>
            </select>
          </div>
        </div>

        {/* Result */}
        <div className="currency-result">
          <div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
              {f.estimatedTotal[language]}
            </div>
            <div style={{ ...mono, fontSize: "1.6rem", fontWeight: 700, color: "#10b981" }}>
              {direction === "USD_TO_ARS" ? `ARS $${calculateResult()}` : `USD $${calculateResult()}`}
            </div>
          </div>
          <div className="currency-result-meta" style={{ fontSize: "0.73rem", color: "#475569", flexShrink: 0 }}>
            <span style={{ color: "#94a3b8" }}>
              {f.rate[language]} 1 USD = ${direction === "USD_TO_ARS" ? currentRate.compra : currentRate.venta} ARS
            </span>
            <br />
            {f.updated[language]} {formatDateTime(currentRate.fecha)}
          </div>
        </div>
      </div>

      <div className="provider-badge" style={{ marginTop: "16px" }}>
        <span className="provider-dot"></span>
        PROVEEDOR: DOLARAPI
      </div>
    </div>
  );
};

export default CurrencyConverter;
