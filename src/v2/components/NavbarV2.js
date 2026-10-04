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
        // capture phase: the page scrolls inside a wrapper div, so window scroll never fires
        const onScroll = (e) => {
            const y = e.target === document
                ? (window.scrollY || document.documentElement.scrollTop)
                : (e.target.scrollTop ?? 0);
            setScrolled(y > 40);
        };
        document.addEventListener('scroll', onScroll, { capture: true, passive: true });
        return () => document.removeEventListener('scroll', onScroll, { capture: true });
    }, []);

    const go = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileOpen(false);
    };

    // Lock background scroll while the mobile menu is open. The page's real
    // scroll container is `.app` (App.css sets overflow-x: hidden with no
    // overflow-y, which computes overflow-y to auto per the CSS spec) — the
    // window/body never actually scrolls, so locking body alone wouldn't work.
    useEffect(() => {
        const appEl = document.querySelector('.app');
        if (mobileOpen) {
            if (appEl) appEl.style.overflowY = 'hidden';
            document.body.style.overflow = 'hidden';
        }
        return () => {
            if (appEl) appEl.style.overflowY = '';
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

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
                    <ul className="v2-nav-links" style={{ display: 'flex', gap: '2rem', listStyle: 'none', alignItems: 'center' }}>
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

                    {/* CTA + mobile toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <a
                            className="v2-nav-cta"
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
                        <button
                            className="v2-nav-toggle"
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            onClick={() => setMobileOpen(o => !o)}
                            style={{
                                alignItems: 'center', justifyContent: 'center',
                                background: 'white', border: '1px solid #e2e8f0',
                                borderRadius: '8px', padding: '0.45rem',
                                cursor: 'pointer', color: '#0f172a',
                            }}
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Tap-outside-to-close overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        key="mobile-overlay"
                        className="v2-nav-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setMobileOpen(false)}
                        style={{ position: 'fixed', inset: 0, top: '58px', zIndex: 1000 }}
                    />
                )}
            </AnimatePresence>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="v2-nav-mobile"
                        key="mobile-menu"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        style={{
                            position: 'fixed', top: '58px', left: 0, right: 0, zIndex: 1001,
                            background: '#fafafa',
                            borderBottom: '1px solid #e2e8f0',
                            boxShadow: '0 12px 32px rgba(15,23,42,0.10)',
                            padding: '0.5rem 1.25rem 1rem',
                        }}
                    >
                        {links.map(({ label, id }) => (
                            <a
                                key={id}
                                href={`#${id}`}
                                onClick={e => { e.preventDefault(); go(id); }}
                                style={{
                                    display: 'block',
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '1rem', fontWeight: 500,
                                    color: '#0f172a', textDecoration: 'none',
                                    padding: '0.75rem 0.25rem',
                                    borderBottom: '1px solid #f1f5f9',
                                }}
                            >
                                {label}
                            </a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
