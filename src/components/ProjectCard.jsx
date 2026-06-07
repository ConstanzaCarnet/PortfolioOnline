import { useLanguage } from "../context/LanguageContext";
import { t } from "../data/translations";

function ProjectCard({ title, description, highlights, stack, link, featured }) {
  const { language } = useLanguage();
  const p = t.projects;

  return (
    <div className="project-card reveal-item">
      <div>
        <div className="project-header">
          <h3>{title}</h3>
          {featured && (
            <span className="project-tag project-featured-badge">
              {p.featured[language]}
            </span>
          )}
        </div>
        <p>{description}</p>
        {highlights && (
          <ul className="project-highlights">
            {highlights.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="stack">{stack}</p>
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="project-github-link"
        >
          {p.github[language]}
        </a>
      </div>
    </div>
  );
}
export default ProjectCard;
