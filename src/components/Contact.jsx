import { FaGithub, FaLinkedin, FaEnvelope, FaCheck } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../data/translations";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

const CONTACT_EMAIL = "carnetconstanza@gmail.com";

function Contact() {
  const { language } = useLanguage();
  const c = t.contact;
  const ref = useScrollAnimation();
  const { copied, copy } = useCopyToClipboard();

  const handleEmailClick = (e) => {
    e.preventDefault();
    copy(CONTACT_EMAIL);
  };

  const cards = [
    {
      icon: FaEnvelope,
      label: "Email",
      value: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
      color: "#3b82f6",
      isEmail: true,
    },
    {
      icon: FaGithub,
      label: "GitHub",
      value: "ConstanzaCarnet",
      href: "https://github.com/ConstanzaCarnet",
      color: "#94a3b8",
    },
    {
      icon: FaLinkedin,
      label: "LinkedIn",
      value: "constanza-desiree-carnet",
      href: "https://www.linkedin.com/in/constanza-desiree-carnet/",
      color: "#0ea5e9",
    },
  ];

  return (
    <section ref={ref} id="contact" className="contact reveal">
      <h2 className="section-title">{c.title[language]}</h2>
      <p className="section-desc">{c.desc[language]}</p>

      <div className="contact-cards">
        {cards.map(({ icon: Icon, label, value, href, color, isEmail }) => {
          const showCopied = isEmail && copied;
          return (
            <a
              key={label}
              href={href}
              onClick={isEmail ? handleEmailClick : undefined}
              target={isEmail ? "_self" : "_blank"}
              rel={isEmail ? undefined : "noopener noreferrer"}
              className={`contact-card reveal-item${showCopied ? " is-copied" : ""}`}
            >
              <div className="contact-card-icon" style={{ color: showCopied ? "#10b981" : color }}>
                {showCopied ? <FaCheck /> : <Icon />}
              </div>
              <div className="contact-card-body">
                <span className="contact-card-label">
                  {showCopied ? c.emailCopied[language] : label}
                </span>
                <span className="contact-card-value">{value}</span>
              </div>
              <span className="contact-card-arrow">{showCopied ? "✓" : "→"}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export default Contact;
