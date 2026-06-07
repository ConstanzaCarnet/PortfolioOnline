import { useState, useEffect } from "react";
import { apiFetch, hasBackend } from "../services/apiService";
import { projects as staticProjects } from "../data/projects";
import { experiences as staticExperiences } from "../data/experience";

const CACHE_KEY = "portfolio-backend-data";
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

// Carga los datos del portfolio desde el backend.
// Si el backend no está disponible, usa los datos estáticos como fallback.
export function usePortfolioData() {
  const [projects, setProjects]     = useState(staticProjects);
  const [experiences, setExperiences] = useState(staticExperiences);
  const [fromBackend, setFromBackend] = useState(false);

  useEffect(() => {
    if (!hasBackend()) return;

    // Revisar sessionStorage primero
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          /* eslint-disable react-hooks/set-state-in-effect */
          setProjects(data.projects ?? staticProjects);
          setExperiences(data.experiences ?? staticExperiences);
          setFromBackend(true);
          /* eslint-enable react-hooks/set-state-in-effect */
          return;
        }
      } catch {
        sessionStorage.removeItem(CACHE_KEY);
      }
    }

    // Fetch desde el backend
    apiFetch("/api/portfolio/data")
      .then((data) => {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        setProjects(data.projects ?? staticProjects);
        setExperiences(data.experiences ?? staticExperiences);
        setFromBackend(true);
      })
      .catch(() => {
        // Backend no disponible — los datos estáticos ya están cargados
      });
  }, []);

  return { projects, experiences, fromBackend };
}
