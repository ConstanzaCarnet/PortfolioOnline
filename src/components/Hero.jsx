import {
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaFileDownload,
  FaCode,
  FaCheck,
} from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../data/translations";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

const CONTACT_EMAIL = "carnetconstanza@gmail.com";

function Hero() {
  const { language } = useLanguage();
  const h = t.hero;
  const { copied, copy } = useCopyToClipboard();

  const handleEmailClick = (e) => {
    e.preventDefault();
    copy(CONTACT_EMAIL);
  };
  const handleDownloadCV = async () => {
    try {
      const res = await fetch("/cv.pdf");
      if (!res.ok) throw new Error("not found");
      // Use arrayBuffer + explicit MIME type so the file is always
      // recognised as PDF regardless of the server's Content-Type header.
      const buffer = await res.arrayBuffer();
      const blob   = new Blob([buffer], { type: "application/pdf" });
      const url    = URL.createObjectURL(blob);
      const link   = document.createElement("a");
      link.href     = url;
      link.download = "Constanza_Carnet_CV.pdf";
      // Must be in the DOM before .click() (required by Firefox).
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Delay revocation so the browser has time to start the download.
      setTimeout(() => URL.revokeObjectURL(url), 300);
    } catch {
      console.warn("CV no disponible.");
    }
  };

  return (
    <section id="home" className="hero-container">
      <div className="hero-layout">
        {/* COLUMNA IZQUIERDA: TEXTO Y ACCIONES */}
        <div className="hero-left-content">
          {/* Badge de disponibilidad */}
          <div className="availability-wrapper">
            <span className="availability-badge">
              <span className="availability-dot"></span>
              {h.badge[language]}
            </span>
          </div>

          {/* Nombre y Título */}
          <div className="hero-title-group">
            <h1 className="hero-title">
              Constanza <span>Carnet</span>
            </h1>
            <h2 className="hero-subtitle">{h.subtitle[language]}</h2>
          </div>

          {/* Descripción */}
          <p className="hero-description">{h.description[language]}</p>

          {/* Botones de Acción Principal */}
          <div className="hero-actions">
            <a href="#projects" className="btn-primary">
              <FaCode /> {h.btnProjects[language]}
            </a>
            <button onClick={handleDownloadCV} className="btn-secondary">
              <FaFileDownload /> {h.btnCV[language]}
            </button>
          </div>

          {/* Enlaces a Redes Sociales */}
          <div className="hero-socials">
            <a
              href="https://linkedin.com/in/constanza-desiree-carnet"
              target="_blank"
              rel="noreferrer"
              className="social-link"
              title="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://github.com/ConstanzaCarnet"
              target="_blank"
              rel="noreferrer"
              className="social-link"
              title="GitHub"
            >
              <FaGithub />
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              onClick={handleEmailClick}
              className={`social-link${copied ? " is-copied" : ""}`}
              title={copied ? h.emailCopied[language] : CONTACT_EMAIL}
            >
              {copied ? <FaCheck /> : <FaEnvelope />}
            </a>
          </div>
        </div>

        {/* COLUMNA DERECHA: FOTO DE PERFIL */}
        <div className="hero-right-content">
          <div className="profile-img-wrapper">
            <img
              src="/profile.jpg"
              alt="Constanza Carnet"
              className="profile-img"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
