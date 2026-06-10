import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../data/translations";

function Navbar() {
  const { language, toggle } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <h2 className="logo">Carnet<span>Constanza</span></h2>

      <button
        className="nav-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <a href="#about" onClick={closeMenu}>{t.navbar.about[language]}</a>
        <a href="#financeDashboard" onClick={closeMenu}>{t.navbar.demo[language]}</a>
        <a href="#skills" onClick={closeMenu}>{t.navbar.skills[language]}</a>
        <a href="#projects" onClick={closeMenu}>{t.navbar.projects[language]}</a>
        <a href="#experience" onClick={closeMenu}>{t.navbar.experience[language]}</a>
        <a href="#contact" onClick={closeMenu}>{t.navbar.contact[language]}</a>
        <button className="lang-toggle" onClick={toggle}>
          {language === "es" ? "EN" : "ES"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
