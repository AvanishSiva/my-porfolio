import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const skills = [
    'Java', 'JavaScript', 'Python', 'React', 'Node.js', 'Django',
    'TensorFlow', 'Flutter', 'PostgreSQL', 'MongoDB', 'Docker', 'Firebase',
    'Flask', 'Linux', 'Express', 'Git', 'Scikit-Learn', 'REST APIs',
];

const stats = [
    { value: '3+', label: 'Years Experience' },
    { value: '10+', label: 'Projects Built' },
    { value: '2', label: 'Degrees' },
    { value: '∞', label: 'Bugs Fixed' },
];

function AnimatedSection({ children, delay = 0 }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

export default function AboutV2() {
    return (
        <section id="v2-about" className="v2-section" style={{ borderTop: '1px solid #e2e8f0' }}>
            <div className="v2-container">
                {/* Header */}
                <AnimatedSection>
                    <span className="v2-label">About Me</span>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                        marginBottom: '1.25rem',
                    }}>
                        Building at the intersection of
                        <br />
                        <span style={{ fontStyle: 'italic', color: '#f97316' }}>engineering & intelligence.</span>
                    </h2>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '1.05rem',
                        color: '#64748b',
                        lineHeight: 1.8,
                        maxWidth: '640px',
                        marginBottom: '3.5rem',
                    }}>
                        I'm a software engineer with 3+ years of professional experience building full-stack
                        applications, enterprise tools, and AI-powered products. Currently pursuing my MSc in
                        Artificial Intelligence at National College of Ireland, Dublin.
                    </p>
                </AnimatedSection>

                {/* Stats row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '4rem',
                }}>
                    {stats.map((s, i) => (
                        <AnimatedSection key={s.label} delay={i * 0.08}>
                            <div style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '14px',
                                padding: '1.5rem',
                                textAlign: 'center',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                transition: 'box-shadow 0.3s, transform 0.3s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '2.2rem',
                                    fontWeight: 700,
                                    color: '#f97316',
                                    lineHeight: 1,
                                    marginBottom: '0.4rem',
                                }}>{s.value}</div>
                                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.825rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>

                {/* Skills */}
                <AnimatedSection delay={0.2}>
                    <h3 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        marginBottom: '1rem',
                    }}>
                        Tech Stack
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {skills.map((skill, i) => (
                            <motion.span
                                key={skill}
                                initial={{ opacity: 0, scale: 0.85 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.03, duration: 0.3 }}
                                whileHover={{ scale: 1.07, backgroundColor: '#fff7ed', borderColor: '#f97316', color: '#ea580c' }}
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '0.82rem',
                                    fontWeight: 500,
                                    color: '#475569',
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    padding: '0.4rem 0.9rem',
                                    borderRadius: '8px',
                                    cursor: 'default',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                }}
                            >
                                {skill}
                            </motion.span>
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
