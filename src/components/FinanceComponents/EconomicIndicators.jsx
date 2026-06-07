import { useState, useEffect, useCallback } from "react";
import { fetchEconomicIndicators } from "../../services/economicIndicatorsService";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../data/translations";

// Metadata for each indicator: how to label, format and colour it.
const INDICATORS = [
  {
    id: "riesgoPais", labelKey: "indRiesgoPais", hintKey: "indHintRiesgo",
    unit: "pb", color: "#fbbf24",
    format: (v) => Math.round(v).toLocaleString("es-AR"),
  },
  {
    id: "inflacion", labelKey: "indInflacion", hintKey: "indHintMensual",
    unit: "%", color: "#f87171",
    format: (v) => v.toFixed(1),
  },
  {
    id: "interanual", labelKey: "indInteranual", hintKey: "indHintAnual",
    unit: "%", color: "#fb923c",
    format: (v) => v.toFixed(1),
  },
  {
    id: "uva", labelKey: "indUva", hintKey: "indHintUva",
    unit: "ARS", color: "#60a5fa",
    format: (v) => `$${v.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`,
  },
  {
    id: "plazoFijo", labelKey: "indPlazoFijo", hintKey: "indHintTna",
    unit: "TNA", color: "#34d399",
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    id: "mejorPlazo", labelKey: "indMejorPlazo", hintKey: null,
    unit: "TNA", color: "#10b981",
    format: (v) => `${v.toFixed(1)}%`,
  },
];

const mono = { fontFamily: '"JetBrains Mono", monospace' };

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
};

export const EconomicIndicators = () => {
  const [data, setData]   = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const { language } = useLanguage();
  const f = t.finance;

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setData(await fetchEconomicIndicators());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  if (status === "loading") {
    return <div style={{ color: "#94a3b8", padding: "20px" }}>{f.indicatorsLoading[language]}</div>;
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
    <div style={{ background: "#1e293b", padding: "24px", borderRadius: "12px", color: "#fff" }}>
      <h3 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 700 }}>
        {f.indicatorsTitle[language]}
      </h3>
      <p style={{ color: "#64748b", fontSize: "0.82rem", margin: "0 0 20px" }}>
        {f.indicatorsSubtitle[language]}
      </p>

      <div className="indicators-grid">
        {INDICATORS.map((ind) => {
          const entry = data?.[ind.id];
          if (!entry) return null;
          const hint = ind.id === "mejorPlazo" && entry.entidad
            ? entry.entidad
            : ind.hintKey ? f[ind.hintKey][language] : "";

          return (
            <div key={ind.id} className="indicator-card">
              <div className="indicator-label">{f[ind.labelKey][language]}</div>
              <div className="indicator-value" style={{ color: ind.color }}>
                {ind.format(entry.value)}
                <span className="indicator-unit">{ind.unit}</span>
              </div>
              <div className="indicator-foot">
                {hint && <span className="indicator-hint">{hint}</span>}
                <span style={{ ...mono }}>{formatDate(entry.fecha)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="provider-badge" style={{ marginTop: "16px" }}>
        <span className="provider-dot"></span>
        PROVEEDOR: ARGENTINADATOS
      </div>

      <p className="finance-disclaimer">
        {f.indicatorsSource[language]}{" "}
        <a href="https://www.bcra.gob.ar/" target="_blank" rel="noopener noreferrer" className="source-link">BCRA</a>
        {" · "}
        <a href="https://www.indec.gob.ar/" target="_blank" rel="noopener noreferrer" className="source-link">INDEC</a>
      </p>
    </div>
  );
};

export default EconomicIndicators;
