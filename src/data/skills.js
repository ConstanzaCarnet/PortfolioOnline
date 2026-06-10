import { FaDocker, FaReact, FaGitAlt, FaJs, FaAngular, FaNodeJs } from "react-icons/fa";
import { FaPhp } from "react-icons/fa6";
import { TbSql, TbBrandCSharp } from "react-icons/tb";
import { GrServices } from "react-icons/gr";
import {
  SiLaravel,
  SiExpress,
  SiMysql,
  SiMongodb,
  SiPostman,
  SiTailwindcss,
  SiBootstrap,
  SiDotnet,
  SiPostgresql,
  SiRabbitmq,
} from "react-icons/si";

export const skillCategories = [
  {
    title: { es: "Backend & Core", en: "Backend & Core" },
    skills: [
      { name: "C#",        icon: TbBrandCSharp, color: "#9B59D0" },
      { name: ".NET Core", icon: SiDotnet,       color: "#512BD4" },
      { name: "PHP",       icon: FaPhp,          color: "#777BB4" },
      { name: "Laravel",   icon: SiLaravel,      color: "#FF2D20" },
      { name: "Node.js",   icon: FaNodeJs,       color: "#5FA04E" },
      { name: "Express",   icon: SiExpress,      color: "#94a3b8" },
      { name: "Docker",    icon: FaDocker,       color: "#2496ED" },
    ],
  },
  {
    title: { es: "Frontend & UI", en: "Frontend & UI" },
    skills: [
      { name: "React",       icon: FaReact,       color: "#61DAFB" },
      { name: "Angular",     icon: FaAngular,     color: "#DD0031" },
      { name: "JavaScript",  icon: FaJs,          color: "#F7DF1E" },
      { name: "TailwindCSS", icon: SiTailwindcss, color: "#06B6D4" },
      { name: "Bootstrap",   icon: SiBootstrap,   color: "#7952B3" },
    ],
  },
  {
    title: { es: "Bases de Datos & Herramientas", en: "Databases & Tools" },
    skills: [
      { name: "MySQL",       icon: SiMysql,    color: "#4479A1" },
      { name: "PostgreSQL",  icon: SiPostgresql, color: "#336791" },
      { name: "MongoDB",     icon: SiMongodb,  color: "#47A248" },
      { name: "Git & GitHub", icon: FaGitAlt,  color: "#F05032" },
      { name: "Postman",     icon: SiPostman,  color: "#FF6C37" },
      { name: "SQL",         icon: TbSql,      color: "#94a3b8" },
    ],
  },
  {
    title: { es: "Event Driven Development", en: "Event Driven Development" },
    skills: [
      { name: "RabbitMQ",      icon: SiRabbitmq,  color: "#FF6600" },
      { name: "Microservices", icon: GrServices,  color: "#94a3b8" },
    ],
  },
  {
    title: { es: "Idiomas", en: "Languages" },
    skills: [
      { name: { es: "Inglés (Conversacional Intermedio)", en: "English (Intermediate Conversational)" } },
      { name: { es: "Español (Nativo)",            en: "Spanish (Native)" },             badge: "LM" },
    ],
  },
];
