import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Calendar, BookOpen } from 'lucide-react';

const education = [
    {
        degree: 'MSc in Artificial Intelligence',
        school: 'National College of Ireland',
        period: '2025 – Present',
        location: 'Dublin, Ireland',
        highlight: 'Current',
        emoji: '🎓',
        description: [
            'Machine Learning, Deep Learning, and Intelligent Automation.',
            'Advanced ML, NLP, Programming in AI, AI Ethics, Data Analytics.',
        ],
    },
    {
        degree: 'BSc in Computer Science',
        school: 'Sri Krishna College of Engineering and Technology',
        period: '2019 – 2023',
        location: 'Tamilnadu, India',
        highlight: '9.16 GPA',
        emoji: '💻',
        description: [
            'Strong foundation in CS: algorithms, software engineering, and system design.',
            'DSA, DBMS, OS, Computer Networks, Web & Mobile Technologies.',
        ],
    },
    {
        degree: 'Higher Secondary Education',
        school: 'SRV Matriculation Higher Secondary School',
        period: '2018 – 2019',
        location: 'Tamilnadu, India',
        highlight: '90%',
        emoji: '📚',
        description: ['Science stream with strong analytical and problem-solving foundations.'],
    },
];

// Extracted into its own component so hooks are valid at top level
function EducationCard({ edu, index }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
            <motion.div
                whileHover={{ x: 6, borderColor: '#fed7aa' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.75rem 2rem',
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'flex-start',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'box-shadow 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
            >
                {/* Emoji icon */}
                <div style={{
                    fontSize: '2.2rem', flexShrink: 0, lineHeight: 1,
                    width: '52px', height: '52px',
                    background: '#fff7ed', border: '1px solid #fed7aa',
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {edu.emoji}
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.15rem' }}>
                                {edu.degree}
                            </h3>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
                                {edu.school}
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                            <span style={{
                                fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 700,
                                color: '#f97316', background: '#fff7ed', border: '1px solid #fed7aa',
                                padding: '0.2rem 0.65rem', borderRadius: '9999px',
                            }}>
                                {edu.highlight}
                            </span>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Calendar size={10} /> {edu.period}
                            </span>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={10} /> {edu.location}
                            </span>
                        </div>
                    </div>

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.75rem' }}>
                        {edu.description.map((d, di) => (
                            <li key={di} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <BookOpen size={13} style={{ color: '#f97316', marginTop: '0.2rem', flexShrink: 0 }} />
                                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>{d}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function EducationV2() {
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

    return (
        <section id="v2-education" className="v2-section" style={{ borderTop: '1px solid #e2e8f0' }}>
            <div className="v2-container">
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: 24 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: '3.5rem' }}
                >
                    <span className="v2-label">Academic Background</span>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                        fontWeight: 700, color: '#0f172a',
                        lineHeight: 1.15, letterSpacing: '-0.02em',
                    }}>
                        Education
                    </h2>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {education.map((edu, i) => (
                        <EducationCard key={i} edu={edu} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
