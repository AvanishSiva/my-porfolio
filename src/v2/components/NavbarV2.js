import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const links = [
    { label: 'About', id: 'v2-about' },
    { label: 'Experience', id: 'v2-experience' },
    { label: 'Projects', id: 'v2-projects' },
    { label: 'Education', id: 'v2-education' },
];

export default function NavbarV2() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const go = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileOpen(false);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                    background: scrolled ? 'rgba(250,250,250,0.92)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(12px)' : 'none',
                    borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
                    transition: 'all 0.4s ease',
                    padding: scrolled ? '0.75rem 0' : '1.25rem 0',
                }}
            >
                <div className="v2-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Logo */}
                    <a
                        href="#v2-hero"
                        onClick={e => { e.preventDefault(); go('v2-hero'); }}
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            textDecoration: 'none',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Sivaavanish<span style={{ color: '#f97316' }}>.</span>
                    </a>

                    {/* Desktop links */}
                    <ul className="hidden md:flex" style={{ display: 'flex', gap: '2rem', listStyle: 'none', alignItems: 'center' }}>
                        {links.map(({ label, id }) => (
                            <li key={id}>
                                <a
                                    href={`#${id}`}
                                    onClick={e => { e.preventDefault(); go(id); }}
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#64748b',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s ease',
                                    }}
                                    onMouseEnter={e => e.target.style.color = '#0f172a'}
                                    onMouseLeave={e => e.target.style.color = '#64748b'}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <a
                        href="#v2-contact"
                        onClick={e => { e.preventDefault(); go('v2-contact'); }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.85rem', fontWeight: 600,
                            color: 'white', background: '#f97316',
                            padding: '0.55rem 1.25rem', borderRadius: '8px',
                            textDecoration: 'none',
                            transition: 'background 0.2s ease, transform 0.2s ease',
                            boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ea6c10'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Hire Me →
                    </a>
                </div>
            </motion.nav>
        </>
    );
}
