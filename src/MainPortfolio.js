import React, { useState } from "react";
import Hero from "./components/Hero";
import "./App.css"; // Reuse App.css for now
import Dock from "./components/Docker/Dock";
import AboutMeSection from "./components/sections/AboutMeSection";
import EducationSection from "./components/sections/EducationSection";
import ProjectSection from "./components/sections/ProjectSection";
import ContactSection from "./components/sections/ContactSection";
import ExperienceSection from "./components/sections/ExperienceSection";

export default function MainPortfolio() {

    const [currentSection, setCurrentSection] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleNavigate = (sectionId) => {
        console.log("Navigating to:", sectionId);
        if (sectionId === currentSection) return;

        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentSection(sectionId);
            setTimeout(() => setIsTransitioning(false), 50);
        }, 300);
    }

    const renderSection = () => {
        switch (currentSection) {
            case 1: return <Hero />;
            case 2: return <AboutMeSection />;
            case 3: return <EducationSection />;
            case 4: return <ExperienceSection />;
            case 5: return <ProjectSection />;
            case 6: return <ContactSection />;
            default: return <Hero />;
        }
    }

    return (
        <div className="app">
            <div style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
                transition: 'opacity 300ms ease, transform 300ms ease',
            }}>
                {renderSection()}
            </div>
            <Dock onNavigate={handleNavigate} currentSection={currentSection} />
        </div>
    );
}
