// src/App.jsx
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FinanceDashboard from "./components/FinanceComponents/FinanceDashboard";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import About from "./components/About";
import Contact from "./components/Contact";
import Experience from "./components/Experience";
import Footer from "./components/Footer";
import { LanguageProvider } from "./context/LanguageContext";
import "./styles.css";

function App() {
  return (
    <LanguageProvider>
    <div className="portfolio-app">
      <div className="bg-glow-top"></div>

      <Navbar />
      <Hero />

      <main>
        <About />
        <FinanceDashboard />
        <Projects />
        <Skills />
        <Experience />
      </main>

      <Contact />
      <Footer />
    </div>
    </LanguageProvider>
  );
}

export default App;
