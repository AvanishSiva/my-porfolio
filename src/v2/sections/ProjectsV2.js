import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ExternalLink, Lock } from 'lucide-react';

const projects = [
    {
        name: 'LayaForesight',
        subtitle: 'Laya × NCI Hackathon — Escalation Prevention AI Agent',
        description: 'Leading a team building a proactive customer care system that predicts claim escalation risk using an XGBoost classifier. A LangChain agent autonomously interprets predictions and selects appropriate actions — alerts, auto-replies, or human escalation — with chain-of-thought reasoning for full auditability.',
        stack: ['Python', 'XGBoost', 'LangChain', 'LLM'],
        github: "https://github.com/Laya-hackathon/laya-foresight",
        featured: true,
        emoji: '🛡️',
    },
    {
        name: 'UniFund',
        subtitle: 'Citi Upstart — AI-Powered Student Finance Assistant',
        description: 'Co-leading a full-stack AI finance assistant for students powered by a locally-hosted LLM. A LangGraph conversational agent auto-categorises transactions, tracks spending patterns, delivers personalised saving advice, and predicts financial runway based on spending trajectory.',
        stack: ['React', 'Next.js', 'TypeScript', 'Python', 'LangGraph'],
        github: "null",
        featured: true,
        emoji: '💰',
        inProgress: true,
    },
    {
        name: 'Job Tracker',
        subtitle: 'AI Agent-based Job Application Tracker',
        description: 'AI-agent–driven job tracking system that autonomously reads Gmail application emails and updates job status (Applied, Interview, Rejected, Offer) using Google Gemini. Serverless event-driven architecture on AWS with idempotent DynamoDB writes and TTL-based deduplication to prevent hallucinated updates.',
        stack: ['Python', 'Google Gemini', 'AWS Lambda', 'DynamoDB', 'EventBridge'],
        github: "https://github.com/AvanishSiva/job_tracker",
        featured: true,
        emoji: '📋',
    },
    {
        name: 'Silicon Feed',
        subtitle: 'AI-Powered Tech News Summarizer',
        description: 'AI-powered engine that collects tech news from multiple RSS feeds, clusters articles using TF-IDF + K-Means, and generates concise summaries with FLAN-T5. Built on a scalable Python-MongoDB data pipeline with a REST backend serving summarised content to a web frontend.',
        stack: ['Python', 'MongoDB', 'TF-IDF', 'K-Means', 'FLAN-T5'],
        github: "https://github.com/AvanishSiva/silicon-feed",
        featured: true,
        emoji: '📰',
    },
    {
        name: 'BayMax Chatbot',
        subtitle: 'AI-Powered eCommerce Shopping Assistant',
        description: 'Intelligent eCommerce chatbot built with a Python/Django backend and the open-source Rasa NLP framework, enabling context-aware, accurate responses to user shopping queries.',
        stack: ['Python', 'Django', 'Rasa NLP', 'NLP'],
        github: 'https://github.com/AvanishSiva/DeepVisionTech-Octave',
        featured: false,
        emoji: '🤖',
    },
    {
        name: 'Go-Safe',
        subtitle: 'Safety Management Mobile App',
        description: 'Cross-platform mobile safety app using Flutter and Firebase — real-time data sync, secure authentication, and satellite mapping via Google Maps API.',
        stack: ['Flutter', 'Firebase', 'Dart', 'Google Maps'],
        github: 'https://github.com/AvanishSiva/Go-Safe',
        featured: false,
        emoji: '📍',
    },
    {
        name: 'Medical Image Encryption',
        subtitle: 'Deep Learning Security System',
        description: 'CNN-based encryption model integrated with RSA algorithms to protect medical images while preserving visual quality for clinical review.',
        stack: ['Python', 'TensorFlow', 'OpenCV', 'CNN', 'RSA'],
        github: null,
        featured: false,
        emoji: '🔐',
    },
    {
        name: 'ServiceDesk Integration',
        subtitle: 'Product Integration Framework',
        description: 'Enterprise-grade Product Integration Framework for Zoho ManageEngine ServiceDesk Plus — Java and REST APIs enabling seamless multi-system communication.',
        stack: ['Java', 'Spring Boot', 'REST APIs', 'Postman'],
        github: null,
        featured: false,
        emoji: '🔧',
    },
];

function ProjectCard({ proj, index }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
            <motion.div
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                    background: 'white',
                    border: `1px solid ${proj.featured ? '#fed7aa' : '#e2e8f0'}`,
                    borderRadius: '18px',
                    padding: '1.75rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: proj.featured ? '0 4px 16px rgba(249,115,22,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Featured / In Progress badge */}
                {proj.inProgress ? (
                    <span style={{
                        position: 'absolute', top: '1.25rem', right: '1.25rem',
                        fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        color: '#7c3aed', background: '#f5f3ff',
                        border: '1px solid #ddd6fe',
                        padding: '0.2rem 0.6rem', borderRadius: '9999px',
                    }}>In Progress</span>
                ) : proj.featured && (
                    <span style={{
                        position: 'absolute', top: '1.25rem', right: '1.25rem',
                        fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        color: '#ea580c', background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        padding: '0.2rem 0.6rem', borderRadius: '9999px',
                    }}>Featured</span>
                )}

                {/* Emoji icon */}
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1 }}>{proj.emoji}</div>

                <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.3rem', fontWeight: 700, color: '#0f172a',
                    marginBottom: '0.25rem', lineHeight: 1.2,
                }}>{proj.name}</h3>
                <p style={{
                    fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 600,
                    color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.06em',
                    marginBottom: '0.85rem',
                }}>{proj.subtitle}</p>
                <p style={{
                    fontFamily: "'Inter', sans-serif", fontSize: '0.9rem',
                    color: '#64748b', lineHeight: 1.7, marginBottom: '1.25rem', flex: 1,
                }}>{proj.description}</p>

                {/* Stack pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                    {proj.stack.map(t => (
                        <span key={t} style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 500,
                            color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0',
                            padding: '0.2rem 0.6rem', borderRadius: '6px',
                        }}>{t}</span>
                    ))}
                </div>

                {/* Link */}
                {proj.github ? (
                    <a href={proj.github} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600,
                        color: '#f97316', textDecoration: 'none',
                        borderBottom: '1px solid #fed7aa', paddingBottom: '2px',
                        width: 'fit-content',
                    }}>
                        View on GitHub <ExternalLink size={13} />
                    </a>
                ) : (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        fontFamily: "'Inter', sans-serif", fontSize: '0.82rem',
                        color: '#94a3b8', fontStyle: 'italic',
                    }}>
                        <Lock size={12} /> Private Repository
                    </span>
                )}
            </motion.div>
        </motion.div>
    );
}

export default function ProjectsV2() {
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

    return (
        <section id="v2-projects" className="v2-section" style={{ borderTop: '1px solid #e2e8f0' }}>
            <div className="v2-container">
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: 24 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: '3.5rem' }}
                >
                    <span className="v2-label">Selected Works</span>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                        fontWeight: 700, color: '#0f172a',
                        lineHeight: 1.15, letterSpacing: '-0.02em',
                        maxWidth: '600px',
                    }}>
                        Things I've built that{' '}
                        <span style={{ fontStyle: 'italic', color: '#f97316' }}>I'm proud of.</span>
                    </h2>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {projects.map((proj, i) => (
                        <ProjectCard key={i} proj={proj} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
