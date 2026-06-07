import { useLanguage } from "../context/LanguageContext";
import { t } from "../data/translations";

function Navbar() {
  const { language, toggle } = useLanguage();

  return (
    <nav className="navbar">
      <h2 className="logo">Carnet<span>Constanza</span></h2>
      <div className="nav-links">
        <a href="#about">{t.navbar.about[language]}</a>
        <a href="#financeDashboard">{t.navbar.demo[language]}</a>
        <a href="#skills">{t.navbar.skills[language]}</a>
        <a href="#projects">{t.navbar.projects[language]}</a>
        <a href="#experience">{t.navbar.experience[language]}</a>
        <a href="#contact">{t.navbar.contact[language]}</a>
        <button className="lang-toggle" onClick={toggle}>
          {language === "es" ? "EN" : "ES"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
