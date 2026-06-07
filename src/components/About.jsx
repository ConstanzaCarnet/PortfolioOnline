import { useLanguage } from "../context/LanguageContext";
import { t } from "../data/translations";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

function About() {
  const { language } = useLanguage();
  const a = t.about;
  const ref = useScrollAnimation();

  return (
    <section ref={ref} id="about" className="about reveal">
      <h2 className="section-title">{a.title[language]}</h2>
      <div className="about-card">
        <p dangerouslySetInnerHTML={{ __html: a.p1[language] }} />
        <p dangerouslySetInnerHTML={{ __html: a.p2[language] }} />
        <p dangerouslySetInnerHTML={{ __html: a.p3[language] }} />
      </div>
    </section>
  );
}

export default About;
