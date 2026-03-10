import React from 'react';
import './v2.css';
import NavbarV2 from './components/NavbarV2';
import HeroV2 from './sections/HeroV2';
import AboutV2 from './sections/AboutV2';
import ExperienceV2 from './sections/ExperienceV2';
import ProjectsV2 from './sections/ProjectsV2';
import EducationV2 from './sections/EducationV2';
import ContactV2 from './sections/ContactV2';

export default function V2Portfolio() {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#fafafa',
            backgroundImage: 'radial-gradient(circle, #b8bfca 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
        }}>
            <NavbarV2 />
            <main>
                <HeroV2 />
                <AboutV2 />
                <ExperienceV2 />
                <ProjectsV2 />
                <EducationV2 />
                <ContactV2 />
            </main>
        </div>
    );
}
