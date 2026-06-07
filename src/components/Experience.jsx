import { experiences } from "../data/experience";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../data/translations";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

function Experience() {
  const { language } = useLanguage();
  const e = t.experience;
  const ref = useScrollAnimation();

  return (
    <section ref={ref} id="experience" className="experience reveal">
      <h2 className="section-title">{e.title[language]}</h2>
      <p className="section-desc">{e.desc[language]}</p>

      <div className="timeline-container">
        {experiences.map((exp, index) => (
          <div key={index} className="timeline-item reveal-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-header">
                <h3>{exp.role[language]}</h3>
                <span className="timeline-date">{exp.period[language]}</span>
              </div>
              <h4 className="timeline-company">{exp.company[language]}</h4>
              <p className="timeline-body">{exp.description[language]}</p>
              <div className="timeline-skills">
                <strong>{e.skillsLabel[language]}</strong> {exp.skills}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Experience;
