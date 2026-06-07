import { skillCategories } from "../data/skills";
import { certificates } from "../data/certificates";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../data/translations";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

function Skills() {
  const { language } = useLanguage();
  const s = t.skills;
  const ref = useScrollAnimation();

  return (
    <section ref={ref} id="skills" className="skills reveal">
      <h2 className="section-title">{s.title[language]}</h2>
      <p className="section-desc">{s.desc[language]}</p>

      <div className="skills-grid-layout">

        {/* Panel izquierdo: categorías */}
        <div className="tech-categories-panel">
          {skillCategories.map((category, catIndex) => (
            <div key={catIndex} className="category-box">
              <h3 className="category-box-title">{category.title[language]}</h3>
              <div className="category-tags-container">
                {category.skills.map((skill, index) => (
                  <div key={index} className="skill-tag-pill">
                    {skill.icon ? (
                      <span className="skill-pill-icon">
                        <skill.icon size={14} color={skill.color || "#94a3b8"} />
                      </span>
                    ) : skill.badge ? (
                      <span className="skill-lang-badge">{skill.badge}</span>
                    ) : null}
                    <span>{typeof skill.name === "object" ? skill.name[language] : skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Panel derecho: certificaciones */}
        <div className="certifications-panel">
          <h3 className="sub-panel-title">{s.certsTitle[language]}</h3>
          <p className="certs-panel-desc">{s.certsDesc[language]}</p>
          <div className="certs-list-wrapper">
            {certificates.map((cert, index) => (
              <div key={index} className="cert-item">
                <div className="cert-info">
                  <div className="cert-header">
                    <h4>{typeof cert.title === "object" ? cert.title[language] : cert.title}</h4>
                    <span className="cert-badge">{cert.badge}</span>
                  </div>
                  <p className="cert-issuer">
                    {cert.issuer} · <span className="cert-date">{cert.date}</span>
                  </p>
                  <p className="cert-details">
                    {typeof cert.description === "object" ? cert.description[language] : cert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default Skills;
