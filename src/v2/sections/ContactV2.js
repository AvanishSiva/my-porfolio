import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';

const EMAIL = 'sivaavanishk@gmail.com';

export default function ContactV2() {
    const [copied, setCopied] = useState(false);
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

    const handleCopy = async () => {
        await navigator.clipboard.writeText(EMAIL).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    };

    return (
        <section id="v2-contact" className="v2-section" style={{ borderTop: '1px solid #e2e8f0' }}>
            <div className="v2-container">
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: 24 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: '3.5rem' }}
                >
                    <span className="v2-label">Get In Touch</span>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                        fontWeight: 700, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em',
                        maxWidth: '640px', marginBottom: '1rem',
                    }}>
                        Let's build something{' '}
                        <span style={{ fontStyle: 'italic', color: '#f97316' }}>extraordinary.</span>
                    </h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: '#64748b', lineHeight: 1.7, maxWidth: '480px' }}>
                        Open to full-time roles, collaborations, and freelance projects. I respond within 24 hours.
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {/* Contact info cards */}
                    {[
                        { icon: <Mail size={20} />, label: 'Email', value: EMAIL, action: handleCopy, actionLabel: copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</> },
                        { icon: <Phone size={20} />, label: 'Phone', value: '+353 (089) 206 6418' },
                        { icon: <MapPin size={20} />, label: 'Location', value: 'Dublin, Ireland' },
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -4 }}
                        >
                            <div style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '14px',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '10px',
                                        background: '#fff7ed', border: '1px solid #fed7aa',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#f97316', flexShrink: 0,
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.1rem' }}>
                                            {item.label}
                                        </p>
                                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#0f172a', fontWeight: 500 }}>
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                                {item.action && (
                                    <button
                                        onClick={item.action}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 600,
                                            color: copied ? '#16a34a' : '#f97316',
                                            background: copied ? '#f0fdf4' : '#fff7ed',
                                            border: `1px solid ${copied ? '#bbf7d0' : '#fed7aa'}`,
                                            padding: '0.35rem 0.75rem', borderRadius: '8px',
                                            cursor: 'pointer', transition: 'all 0.25s ease', flexShrink: 0,
                                        }}
                                    >
                                        {item.actionLabel}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Social links */}
                    {[
                        { icon: <Github size={20} />, label: 'GitHub', handle: '@AvanishSiva', url: 'https://github.com/AvanishSiva' },
                        { icon: <Linkedin size={20} />, label: 'LinkedIn', handle: 'in/sivaavanish-k', url: 'https://www.linkedin.com/in/sivaavanish-k/' },
                    ].map((s, i) => (
                        <motion.a
                            key={s.label}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ delay: (i + 3) * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -4, borderColor: '#fed7aa' }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.85rem',
                                background: 'white', border: '1px solid #e2e8f0',
                                borderRadius: '14px', padding: '1.5rem',
                                textDecoration: 'none',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                transition: 'box-shadow 0.3s, border-color 0.3s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
                        >
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '10px',
                                background: '#fff7ed', border: '1px solid #fed7aa',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#f97316', flexShrink: 0,
                            }}>
                                {s.icon}
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.1rem' }}>
                                    {s.label}
                                </p>
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#0f172a', fontWeight: 500 }}>
                                    {s.handle}
                                </p>
                            </div>
                        </motion.a>
                    ))}
                </div>

                {/* Footer watermark */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={{ marginTop: '5rem', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}
                >
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(2.5rem, 7vw, 6rem)',
                        fontWeight: 700, color: '#f1f5f9',
                        lineHeight: 0.9, letterSpacing: '-0.02em',
                        userSelect: 'none',
                    }}>
                        SIVAAVANISH.
                    </h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#94a3b8' }}>
                        © 2026 Sivaavanish. All rights reserved.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
