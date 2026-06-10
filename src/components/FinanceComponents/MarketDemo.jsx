import { useState, useEffect, useCallback } from "react";
import { fetchDefaultAssets, refreshMarket } from "../../services/marketService";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../data/translations";

const fmtPrice = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Upstream quote timestamp (ISO-8601 from the backend) → short local date/time.
const fmtDate = (iso, language) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(language === "es" ? "es-AR" : "en-US", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
};

export const MarketDemo = () => {
  const [assets, setAssets]         = useState([]);              // all default assets from backend
  const [selected, setSelected]     = useState(() => new Set()); // symbols currently shown in the table
  const [status, setStatus]         = useState("loading");       // loading | ready | error
  const [refreshing, setRefreshing] = useState(false);
  const { language } = useLanguage();
  const f = t.finance;

  const translateAlertLevel = (level) => {
    if (level === "high")     return f.alertHigh[language];
    if (level === "moderate") return f.alertModerate[language];
    return f.alertNormal[language];
  };

  // Loads every default asset once from the backend's warm cache. Toggling
  // checkboxes afterwards is purely local — no further network calls.
  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await fetchDefaultAssets();
      setAssets(data);
      setSelected((prev) => {
        if (prev.size > 0) return prev; // preserve the user's selection
        const firstCrypto = data.find((a) => a.type === "crypto");
        const firstStock  = data.find((a) => a.type === "stock");
        return new Set([firstCrypto?.symbol, firstStock?.symbol].filter(Boolean));
      });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      setAssets(await refreshMarket());
    } catch {
      // Keep showing the last good data; the refresh simply had no effect.
    } finally {
      setRefreshing(false);
    }
  };

  const toggle = (symbol) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });

  if (status === "loading") {
    return <div style={{ color: "#94a3b8", padding: "20px" }}>{f.marketLoading[language]}</div>;
  }

  if (status === "error") {
    return (
      <div className="market-empty-state">
        <p className="market-error-msg">⚠️ {f.unavailable[language]}</p>
        <button onClick={load} className="refresh-market-btn">{f.retry[language]}</button>
      </div>
    );
  }

  const cryptos = assets.filter((a) => a.type === "crypto");
  const stocks  = assets.filter((a) => a.type === "stock");
  const rows    = assets.filter((a) => selected.has(a.symbol));

  const renderGroup = (list, labelClass, label, inputClass) => (
    <div className="asset-group">
      <span className={`asset-group-label ${labelClass}`}>{label}</span>
      <div className="checkboxes-wrap">
        {list.map((a) => (
          <label key={a.symbol} className={`asset-checkbox-label${refreshing ? " is-loading" : ""}`}>
            <input
              type="checkbox"
              checked={selected.has(a.symbol)}
              onChange={() => toggle(a.symbol)}
              disabled={refreshing}
              className={inputClass}
            />
            {a.name}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="market-demo-container">
      {/* Quick monitor panel */}
      <div className="default-assets-panel">
        <h4 className="panel-section-title">{f.quickMonitor[language]}</h4>
        <div className="assets-grid-layout">
          {renderGroup(cryptos, "crypto-label", f.cryptos[language], "crypto-input")}
          {renderGroup(stocks,  "stock-label",  f.stocks[language],  "stock-input")}
        </div>
      </div>

      {/* Refresh button */}
      <div className="market-actions-row">
        <button onClick={handleRefresh} className="refresh-market-btn" disabled={refreshing || rows.length === 0}>
          {refreshing ? f.refreshing[language] : f.refresh[language]}
        </button>
      </div>

      {/* Table */}
      <div className="market-table-container">
        <table className="market-table">
          <thead>
            <tr>
              <th>{f.colSource[language]}</th>
              <th>{f.colSymbol[language]}</th>
              <th>{f.colName[language]}</th>
              <th>{f.colPrice[language]}</th>
              <th>{f.colUpdated[language]}</th>
              <th>{f.colChange[language]}</th>
              <th>{f.colTrend[language]}</th>
              <th>{f.colVolatility[language]}</th>
              <th>{f.colRisk[language]} *</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((asset) => {
              const isStock = asset.type === "stock";
              const up = asset.dailyChange >= 0;
              return (
                <tr key={asset.symbol}>
                  <td>
                    <span className={`origin-badge ${isStock ? "badge-stock" : "badge-crypto"}`}>
                      {isStock ? f.badgeStock[language] : f.badgeCrypto[language]}
                    </span>
                  </td>
                  <td className={`symbol-cell ${isStock ? "text-stock" : "text-crypto"}`}>
                    {asset.symbol.toUpperCase()}
                  </td>
                  <td className="text-muted">{asset.name || f.generalAsset[language]}</td>
                  <td className="font-semibold">${fmtPrice(asset.currentPrice)} USD</td>
                  <td className="text-muted">{fmtDate(asset.lastUpdated, language)}</td>
                  <td className="font-semibold" style={{ color: up ? "#10b981" : "#ef4444" }}>
                    {up ? `+${asset.dailyChange}` : asset.dailyChange}%
                  </td>
                  <td>
                    <svg width="60" height="20" className="sparkline-svg">
                      <polyline
                        fill="none"
                        stroke={up ? "#10b981" : "#ef4444"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={up ? "0,15 20,12 40,8 60,3" : "0,5 20,8 40,12 60,17"}
                      />
                    </svg>
                  </td>
                  <td>{asset.volatility}%</td>
                  <td>
                    <span
                      className="crypto-badge"
                      style={{
                        background:
                          asset.alertLevel === "high"       ? "#7f1d1d"
                          : asset.alertLevel === "moderate" ? "#78350f"
                          : "#064e3b",
                        color:
                          asset.alertLevel === "high"       ? "#fca5a5"
                          : asset.alertLevel === "moderate" ? "#fde68a"
                          : "#a7f3d0",
                      }}
                    >
                      {translateAlertLevel(asset.alertLevel)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan="9" className="empty-table-msg">
                  {f.emptyTable[language]}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="table-footnote">{f.riskFootnote[language]}</p>

      <div className="provider-badge">
        <span className="provider-dot"></span>
        PROVEEDORES: COINGECKO · YAHOO FINANCE
      </div>

      <p className="finance-disclaimer">{f.disclaimer[language]}</p>
    </div>
  );
};

export default MarketDemo;
