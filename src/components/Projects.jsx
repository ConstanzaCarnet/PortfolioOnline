import { FaCode } from "react-icons/fa";
import ProjectCard from "./ProjectCard";
import { projects } from "../data/projects";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../data/translations";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

function Projects() {
  const { language } = useLanguage();
  const ref = useScrollAnimation();
  return (
    <section ref={ref} id="projects" className="projects reveal">
      <h2 className="section-title">
        <FaCode className="section-icon" />
        {t.projects.title[language]}
      </h2>
      <div className="projects-container">
        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            title={project.title}
            description={project.description[language]}
            highlights={project.highlights[language]}
            stack={project.stack}
            link={project.link}
            featured={project.featured}
          />
        ))}
      </div>
    </section>
  );
}
export default Projects;
