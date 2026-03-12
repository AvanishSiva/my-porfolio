import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Mail, Github, Linkedin, Briefcase, GraduationCap, Zap } from 'lucide-react';

const fadeUp = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function Tag({ children, variant = 'default' }) {
    const styles = {
        default: { background: '#f1f5f9', color: '#475569' },
        orange:  { background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' },
        green:   { background: '#f0fdf4', color: '#16a34a' },
        blue:    { background: '#eff6ff', color: '#2563eb' },
    };
    return (
        <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.68rem', fontWeight: 600,
            borderRadius: '6px', padding: '0.2rem 0.55rem',
            display: 'inline-block',
            ...styles[variant],
        }}>
            {children}
        </span>
    );
}

function Label({ children }) {
    return (
        <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.62rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#94a3b8', marginBottom: '0.5rem',
        }}>
            {children}
        </p>
    );
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────

export function ProjectCard({ title, description, stack = [], highlight, url }) {
    return (
        <motion.div {...fadeUp} style={{ width: '100%' }}>
            <div style={{
                background: 'white', borderRadius: '16px',
                padding: '1.1rem 1.25rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                border: '1px solid #f1f5f9',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0f172a', lineHeight: 1.2, flex: 1 }}>
                        {title}
                    </p>
                    {url && (
                        <a href={url} target="_blank" rel="noreferrer"
                            style={{ color: '#94a3b8', flexShrink: 0, marginLeft: '0.5rem' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
                            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                        >
                            <ExternalLink size={14} />
                        </a>
                    )}
                </div>

                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, marginBottom: '0.8rem' }}>
                    {description}
                </p>

                {stack.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: highlight ? '0.8rem' : 0 }}>
                        {stack.map(s => <Tag key={s} variant="orange">{s}</Tag>)}
                    </div>
                )}

                {highlight && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        background: '#fffbeb', borderRadius: '10px',
                        padding: '0.5rem 0.75rem', border: '1px solid #fef3c7',
                    }}>
                        <Zap size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.78rem', fontWeight: 600, color: '#92400e' }}>
                            {highlight}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── ProjectList ──────────────────────────────────────────────────────────────

export function ProjectList({ intro, projects = [] }) {
    return (
        <motion.div {...fadeUp} style={{ width: '100%' }}>
            {intro && (
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {intro}
                </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {projects.map((p, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.07 }}
                        style={{
                            background: 'white', borderRadius: '14px',
                            padding: '0.85rem 1rem',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                            border: '1px solid #f1f5f9',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{p.name}</p>
                            {p.stack?.[0] && <Tag variant="orange">{p.stack[0]}</Tag>}
                        </div>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, marginBottom: p.stack?.length > 1 ? '0.45rem' : 0 }}>
                            {p.one_line}
                        </p>
                        {p.stack?.length > 1 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                {p.stack.slice(1).map(s => <Tag key={s}>{s}</Tag>)}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

// ─── SkillList ────────────────────────────────────────────────────────────────

export function SkillList({ intro, skills = [] }) {
    const strong   = skills.filter(s => s.level === 'strong');
    const familiar = skills.filter(s => s.level === 'familiar');

    return (
        <motion.div {...fadeUp} style={{ width: '100%' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
                {intro && (
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
                        {intro}
                    </p>
                )}

                {strong.length > 0 && (
                    <>
                        <Label>Strong</Label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: familiar.length ? '1rem' : 0 }}>
                            {strong.map((s, i) => (
                                <motion.div
                                    key={s.name}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '8px 1fr',
                                        gap: '0.6rem',
                                        alignItems: 'start',
                                        padding: '0.45rem 0.6rem',
                                        borderRadius: '8px',
                                        background: '#fafafa',
                                        border: '1px solid #f1f5f9',
                                    }}
                                >
                                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f97316', flexShrink: 0, marginTop: '0.3rem' }} />
                                    <div>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                                            {s.name}
                                        </p>
                                        {s.context && (
                                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4, marginTop: '0.1rem' }}>
                                                {s.context}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {familiar.length > 0 && (
                    <>
                        <Label>Familiar</Label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {familiar.map(s => <Tag key={s.name}>{s.name}</Tag>)}
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}

// ─── AboutCard ────────────────────────────────────────────────────────────────

export function AboutCard({ summary, highlights = [] }) {
    return (
        <motion.div {...fadeUp} style={{ width: '100%' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                        background: 'linear-gradient(135deg,#f97316,#ea580c)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                    }}>👨‍💻</div>
                    <div>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Sivaavanish K.</p>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.72rem', color: '#94a3b8' }}>MSc AI · Dublin, Ireland</p>
                    </div>
                </div>
                {summary && (
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6, marginBottom: highlights.length ? '0.85rem' : 0 }}>
                        {summary}
                    </p>
                )}
                {highlights.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {highlights.map((h, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f97316', flexShrink: 0, marginTop: '0.38rem' }} />
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>{h}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function detectIcon(entry) {
    const text = (entry.title + ' ' + (entry.detail || '')).toLowerCase();
    if (text.includes('msc') || text.includes('bsc') || text.includes('be ') || text.includes('university') || text.includes('college') || text.includes('degree')) return GraduationCap;
    return Briefcase;
}

// Split detail into sentences for better readability
function splitDetail(detail) {
    if (!detail) return [];
    return detail.split(/(?<=[.!?])\s+/).filter(Boolean);
}

export function Timeline({ entries = [] }) {
    return (
        <motion.div {...fadeUp} style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {entries.map((entry, i) => {
                    const Icon    = detectIcon(entry);
                    const bullets = splitDetail(entry.detail);
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: i * 0.08 }}
                            style={{
                                background: 'white',
                                borderRadius: '14px',
                                padding: '0.9rem 1rem',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                gap: '0.85rem',
                                alignItems: 'flex-start',
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                                background: 'linear-gradient(135deg,#f97316,#ea580c)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginTop: '2px',
                            }}>
                                <Icon size={15} color="white" />
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Period */}
                                <p style={{
                                    fontFamily: "'Inter',sans-serif",
                                    fontSize: '0.63rem', fontWeight: 700,
                                    letterSpacing: '0.08em', textTransform: 'uppercase',
                                    color: '#f97316', marginBottom: '0.2rem',
                                }}>
                                    {entry.period}
                                </p>

                                {/* Title */}
                                <p style={{
                                    fontFamily: "'Inter',sans-serif",
                                    fontWeight: 700, fontSize: '0.87rem',
                                    color: '#0f172a', lineHeight: 1.35,
                                    marginBottom: bullets.length ? '0.55rem' : 0,
                                }}>
                                    {entry.title}
                                </p>

                                {/* Detail as bullets */}
                                {bullets.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        {bullets.map((sentence, j) => (
                                            <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                <span style={{
                                                    width: '5px', height: '5px', borderRadius: '50%',
                                                    background: '#cbd5e1', flexShrink: 0, marginTop: '0.38rem',
                                                }} />
                                                <p style={{
                                                    fontFamily: "'Inter',sans-serif",
                                                    fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5,
                                                }}>
                                                    {sentence}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// ─── ContactCard ──────────────────────────────────────────────────────────────

export function ContactCard({ message, email, availability }) {
    const links = [
        { icon: <Mail size={14} />,     text: email || 'sivaavanishk@gmail.com', href: `mailto:${email || 'sivaavanishk@gmail.com'}` },
        { icon: <MapPin size={14} />,   text: 'Dublin, Ireland',                 href: null },
        { icon: <Linkedin size={14} />, text: 'linkedin.com/in/sivaavanish-k',   href: 'https://linkedin.com/in/sivaavanish-k' },
        { icon: <Github size={14} />,   text: 'github.com/AvanishSiva',          href: 'https://github.com/AvanishSiva' },
    ];
    return (
        <motion.div {...fadeUp} style={{ width: '100%' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
                {availability && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '9999px', padding: '0.25rem 0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.7rem', fontWeight: 600, color: '#15803d' }}>{availability}</span>
                    </div>
                )}
                {message && (
                    <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '1rem', color: '#0f172a', lineHeight: 1.3, marginBottom: '0.85rem' }}>
                        {message}
                    </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {links.map(item => (
                        <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ color: '#f97316', flexShrink: 0 }}>{item.icon}</span>
                            {item.href ? (
                                <a href={item.href} target="_blank" rel="noreferrer"
                                    style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.8rem', color: '#334155', textDecoration: 'none' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#334155'}
                                >{item.text}</a>
                            ) : (
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.8rem', color: '#64748b' }}>{item.text}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// ─── TextResponse ─────────────────────────────────────────────────────────────

export function TextResponse({ text }) {
    return (
        <motion.div {...fadeUp}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', color: '#1c1c1e', lineHeight: 1.6 }}>
                {text}
            </p>
        </motion.div>
    );
}

// ─── Resolver ─────────────────────────────────────────────────────────────────

const COMPONENT_MAP = { ProjectCard, ProjectList, SkillList, AboutCard, Timeline, ContactCard, TextResponse };

export function ResolveChatComponent({ component, props }) {
    const Comp = COMPONENT_MAP[component];
    if (!Comp) return <TextResponse text={props?.text || 'Something went wrong.'} />;
    return <Comp {...props} />;
}
