import { useState } from "react";
import { FaChartLine } from "react-icons/fa";
import MarketDemo from "./MarketDemo";
import CurrencyConverter from "./CurrencyConverter";
import EconomicIndicators from "./EconomicIndicators";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../data/translations";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const TABS = {
  converter:  CurrencyConverter,
  market:     MarketDemo,
  indicators: EconomicIndicators,
};

export const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState("converter");
  const { language } = useLanguage();
  const f = t.finance;
  const ref = useScrollAnimation();
  const ActiveTab = TABS[activeTab];

  return (
    <section ref={ref} id="financeDashboard" className="dashboard-section reveal">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          <FaChartLine className="section-icon" />
          {f.dashboardTitle[language]}
        </h2>
        <p className="dashboard-subtitle">{f.dashboardSubtitle[language]}</p>
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "converter" ? "active" : ""}`}
            onClick={() => setActiveTab("converter")}
          >
            {f.tabConverter[language]}
          </button>
          <button
            className={`tab-btn ${activeTab === "market" ? "active" : ""}`}
            onClick={() => setActiveTab("market")}
          >
            {f.tabMarket[language]}
          </button>
          <button
            className={`tab-btn ${activeTab === "indicators" ? "active" : ""}`}
            onClick={() => setActiveTab("indicators")}
          >
            {f.tabIndicators[language]}
          </button>
        </div>

        <div className="dashboard-content-area">
          <ActiveTab />
        </div>
      </div>
    </section>
  );
};

export default FinanceDashboard;
