import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Calendar, ChevronDown } from 'lucide-react';

const experiences = [
    {
        role: 'Member Technical Staff',
        company: 'Zoho Corporation',
        period: '2023 – 2025',
        location: 'Chennai, India',
        stack: ['Java', 'JavaScript', 'Python', 'PostgreSQL', 'Ember.js', 'Mercurial'],
        bullets: [
            'Worked on Zoho ManageEngine AssetExplorer and ServiceDesk Plus — IT management software used by enterprises worldwide.',
            'Delivered features, resolved critical production bugs, and improved performance across full-stack layers.',
            'Collaborated across product, QA, and design teams in an agile environment.',
        ],
    },
    {
        role: 'Project Trainee',
        company: 'Zoho Corporation',
        period: '2022 – 2023',
        location: 'Chennai, India',
        stack: ['Java', 'Spring', 'JavaScript', 'HTML/CSS', 'Git'],
        bullets: [
            'Implemented security features for AssetExplorer including enhanced authentication flows.',
            'Designed and tested new product features in full-stack environment.',
            'Gained production experience across Java, JavaScript, HTML/CSS, and SQL.',
        ],
    },
    {
        role: 'Summer Intern',
        company: 'Zoho Corporation',
        period: '2022',
        location: 'Chennai, India',
        stack: ['Java', 'OOP', 'DSA'],
        bullets: [
            'Explored core Java OOP concepts and contributed to internal tooling.',
            'Gained practical software engineering experience in a professional setting.',
        ],
    },
];

function ExperienceCard({ exp, index }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative', paddingLeft: '2rem' }}
        >
            {/* Timeline dot */}
            <div style={{
                position: 'absolute', left: 0, top: '1.75rem',
                width: '12px', height: '12px', borderRadius: '50%',
                background: index === 0 ? '#f97316' : 'white',
                border: '2px solid #f97316',
                transform: 'translateX(-5px)',
                zIndex: 2,
            }} />

            <div
                style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.75rem 2rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'box-shadow 0.3s, transform 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateX(6px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>
                            {exp.role}
                        </h3>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                            {exp.company}
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                        <span style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 600,
                            color: '#f97316', background: '#fff7ed',
                            border: '1px solid #fed7aa', padding: '0.25rem 0.75rem', borderRadius: '9999px',
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                        }}>
                            <Calendar size={11} /> {exp.period}
                        </span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MapPin size={11} /> {exp.location}
                        </span>
                    </div>
                </div>

                {/* Stack pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                    {exp.stack.map(t => (
                        <span key={t} style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 500,
                            color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0',
                            padding: '0.2rem 0.6rem', borderRadius: '6px',
                        }}>{t}</span>
                    ))}
                </div>

                {/* Bullets */}
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {exp.bullets.map((b, bi) => (
                        <li key={bi} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                            <span style={{ color: '#f97316', fontWeight: 700, marginTop: '0.1rem', flexShrink: 0 }}>—</span>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>{b}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

export default function ExperienceV2() {
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

    return (
        <section id="v2-experience" className="v2-section" style={{ borderTop: '1px solid #e2e8f0' }}>
            <div className="v2-container">
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: 24 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: '3.5rem' }}
                >
                    <span className="v2-label">Work History</span>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                        fontWeight: 700, color: '#0f172a',
                        lineHeight: 1.15, letterSpacing: '-0.02em',
                    }}>
                        Experience
                    </h2>
                </motion.div>

                {/* Timeline container */}
                <div style={{ position: 'relative' }}>
                    {/* Vertical line */}
                    <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: '2px',
                        background: 'linear-gradient(to bottom, #f97316, #fed7aa, transparent)',
                    }} />

                    {experiences.map((exp, i) => (
                        <ExperienceCard key={i} exp={exp} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
