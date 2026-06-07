import { FaArrowUp, FaReact, FaJs } from "react-icons/fa";
import { SiVite, SiDotnet } from "react-icons/si";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../data/translations";

const STACK = [
  { icon: FaReact,  label: "React 19",     color: "#61DAFB" },
  { icon: SiVite,   label: "Vite 8",       color: "#646CFF" },
  { icon: FaJs,     label: "JavaScript",   color: "#F7DF1E" },
  { icon: SiDotnet, label: "ASP.NET Core", color: "#7B5EA7" },
];

function Footer() {
  const { language } = useLanguage();
  const f = t.footer;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Izquierda: nombre y tagline */}
        <div className="footer-brand">
          <span className="footer-name">Constanza Carnet</span>
          <span className="footer-tagline">{f.tagline[language]}</span>
        </div>

        {/* Centro: stack tecnológico */}
        <div className="footer-stack">
          <span className="footer-stack-label">{f.builtWith[language]}</span>
          <div className="footer-stack-pills">
            {STACK.map(({ icon: Icon, label, color }) => (
              <span key={label} className="footer-pill">
                <Icon color={color} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="footer-bottom">
        <span>{f.copyright[language]}</span>
        <button className="back-to-top" onClick={scrollToTop} title={f.backToTop[language]}>
          <FaArrowUp /> {f.backToTop[language]}
        </button>
      </div>
    </footer>
  );
}

export default Footer;
