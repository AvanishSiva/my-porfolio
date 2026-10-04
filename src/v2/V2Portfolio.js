import React, { useState } from 'react';
import './v2.css';
import NavbarV2 from './components/NavbarV2';
import HeroV2 from './sections/HeroV2';
import AboutV2 from './sections/AboutV2';
import ExperienceV2 from './sections/ExperienceV2';
import ProjectsV2 from './sections/ProjectsV2';
import EducationV2 from './sections/EducationV2';
import ContactV2 from './sections/ContactV2';
import MascotCompanion from '../components/MascotCompanion';
import MascotDevPanel from '../components/MascotDevPanel';

// Tied to NODE_ENV rather than a hardcoded flag — `npm run build` always sets
// production, so the dev panel can't accidentally ship again on a future deploy.
const DEV_PREVIEW = process.env.NODE_ENV === 'development';

export default function V2Portfolio() {
    const [previewStatus, setPreviewStatus] = useState(null);

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
            <MascotCompanion forceStatus={previewStatus} />
            {DEV_PREVIEW && (
                <MascotDevPanel active={previewStatus} onChange={setPreviewStatus} />
            )}
        </div>
    );
}
