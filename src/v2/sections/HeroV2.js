import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoveRight, ArrowUp, MapPin, Mail, Github, Linkedin } from 'lucide-react';

const titles = ['Software Engineer', 'AI Enthusiast', 'Full-Stack Dev', 'Problem Solver', 'Open to Work'];

// ─── Predefined rich replies ─────────────────────────────────────────────────

function ExperienceReply() {
    const items = [
        {
            logo: '🏢', org: 'Zoho Corporation', role: 'Member Technical Staff',
            period: '2021 – 2024', location: 'Chennai, India',
            tags: ['Java', 'Python', 'JavaScript', 'PostgreSQL'],
        },
        {
            logo: '🎓', org: 'NCI Dublin', role: 'MSc Artificial Intelligence',
            period: '2024 – Present', location: 'Dublin, Ireland',
            tags: ['ML', 'NLP', 'Deep Learning'],
        },
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '230px', maxWidth: '280px' }}>
            {items.map(it => (
                <div key={it.org} style={{
                    background: 'white', borderRadius: '14px',
                    padding: '0.85rem 1rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{it.logo}</span>
                        <div>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', marginBottom: '0.1rem' }}>{it.org}</p>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.75rem', color: '#64748b', marginBottom: '0.1rem' }}>{it.role}</p>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.7rem', color: '#94a3b8' }}>{it.period} · {it.location}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.6rem' }}>
                        {it.tags.map(t => (
                            <span key={t} style={{
                                fontFamily: "'Inter',sans-serif", fontSize: '0.65rem', fontWeight: 600,
                                background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa',
                                borderRadius: '99px', padding: '0.15rem 0.5rem',
                            }}>{t}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ProjectsReply() {
    const projects = [
        { emoji: '🤖', name: 'BayMax Chatbot', stack: 'Rasa · Django', color: '#eff6ff', dot: '#3b82f6' },
        { emoji: '📍', name: 'Go-Safe', stack: 'Flutter · Firebase', color: '#f0fdf4', dot: '#22c55e' },
        { emoji: '🔐', name: 'Medical Encryption', stack: 'CNN · RSA', color: '#fdf4ff', dot: '#a855f7' },
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', minWidth: '230px', maxWidth: '280px' }}>
            {projects.map(p => (
                <div key={p.name} style={{
                    background: 'white', borderRadius: '12px',
                    padding: '0.7rem 0.9rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', flexShrink: 0,
                    }}>{p.emoji}</div>
                    <div>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>{p.name}</p>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.1rem' }}>{p.stack}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', width: '7px', height: '7px', borderRadius: '50%', background: p.dot, flexShrink: 0 }} />
                </div>
            ))}
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.2rem' }}>↓ Scroll to see all projects</p>
        </div>
    );
}

function SkillsReply() {
    const groups = [
        { label: 'Languages', tags: ['Java', 'Python', 'JavaScript', 'Dart'] },
        { label: 'Frontend', tags: ['React', 'Flutter', 'HTML/CSS'] },
        { label: 'Backend', tags: ['Django', 'Spring', 'Node.js'] },
        { label: 'AI / Data', tags: ['TensorFlow', 'Rasa', 'NLP', 'CNN'] },
        { label: 'Infra', tags: ['PostgreSQL', 'Firebase', 'Docker'] },
    ];
    return (
        <div style={{ minWidth: '230px', maxWidth: '290px' }}>
            {groups.map(g => (
                <div key={g.label} style={{ marginBottom: '0.5rem' }}>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{g.label}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {g.tags.map(t => (
                            <span key={t} style={{
                                fontFamily: "'Inter',sans-serif", fontSize: '0.72rem', fontWeight: 500,
                                background: '#f1f5f9', color: '#334155',
                                borderRadius: '6px', padding: '0.2rem 0.55rem',
                            }}>{t}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ContactReply() {
    return (
        <div style={{ minWidth: '220px', maxWidth: '270px' }}>
            <div style={{ background: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.75rem' }}>Let's work together ✦</p>
                {[
                    { icon: <Mail size={13} />, text: 'sivaavanishk@gmail.com', href: 'mailto:sivaavanishk@gmail.com' },
                    { icon: <MapPin size={13} />, text: 'Dublin, Ireland', href: null },
                    { icon: <Linkedin size={13} />, text: 'linkedin.com/in/sivaavanish-k', href: 'https://linkedin.com/in/sivaavanish-k' },
                    { icon: <Github size={13} />, text: 'github.com/AvanishSiva', href: 'https://github.com/AvanishSiva' },
                ].map(item => (
                    <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                        <span style={{ color: '#f97316', flexShrink: 0 }}>{item.icon}</span>
                        {item.href ? (
                            <a href={item.href} style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.75rem', color: '#334155', textDecoration: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
                                onMouseLeave={e => e.currentTarget.style.color = '#334155'}
                            >{item.text}</a>
                        ) : (
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.75rem', color: '#334155' }}>{item.text}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

const REPLY_MAP = {
    experience: ExperienceReply,
    projects: ProjectsReply,
    skills: SkillsReply,
    contact: ContactReply,
};

const SUGGESTIONS = [
    { label: '3+ years at Zoho?', key: 'experience', text: '3+ years at Zoho?' },
    { label: 'What have you built?', key: 'projects', text: 'What have you built?' },
    { label: 'Skills & stack', key: 'skills', text: 'Skills & stack' },
    { label: 'How to hire you?', key: 'contact', text: 'How to hire you?' },
];

// ─── Apple-style bubble spring ───────────────────────────────────────────────
const bubbleSpring = { type: 'spring', stiffness: 420, damping: 28, mass: 0.7 };

export default function HeroV2() {
    const [titleIdx, setTitleIdx] = useState(0);
    const [chatActive, setChatActive] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const chatWrapRef = useRef(null);

    const hasMessages = messages.length > 0;

    useEffect(() => {
        if (chatActive) return;
        const t = setTimeout(() => setTitleIdx(i => (i + 1) % titles.length), 2200);
        return () => clearTimeout(t);
    }, [titleIdx, chatActive]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messages, typing]);

    useEffect(() => {
        if (!chatActive || hasMessages) return;
        const handler = (e) => {
            if (chatWrapRef.current && !chatWrapRef.current.contains(e.target)) {
                setChatActive(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [chatActive, hasMessages]);

    const send = (text, replyKey) => {
        const t = (text || input).trim();
        if (!t) return;
        setInput('');
        setChatActive(true);

        setMessages(prev => [...prev, { role: 'user', text: t }]);
        setTyping(true);

        setTimeout(() => {
            setTyping(false);
            setMessages(prev => [...prev, { role: 'bot', replyKey: replyKey || null, text: !replyKey ? "Great question! Feel free to email Siva directly at sivaavanishk@gmail.com or explore the sections below. 🚀" : null }]);
        }, 800 + Math.random() * 500);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input, null); }
    };

    return (
        <section
            id="v2-hero"
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '5rem',
                paddingBottom: '3rem',
                position: 'relative',
            }}
        >
            <div className="v2-container" style={{ width: '100%', textAlign: 'center' }}>

                {/* ── Badge ── */}
                <AnimatePresence>
                    {!chatActive && (
                        <motion.div
                            key="badge"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35 }}
                            style={{ marginBottom: '2rem' }}
                        >
                            <a
                                href="#v2-projects"
                                onClick={e => { e.preventDefault(); document.getElementById('v2-projects')?.scrollIntoView({ behavior: 'smooth' }); }}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c',
                                    fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 1rem',
                                    borderRadius: '9999px', textDecoration: 'none', transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff7ed'}
                            >
                                ✦ Check out my latest projects <MoveRight size={14} />
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Name — shrinks gently, never tiny ── */}
                <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: chatActive ? '2rem' : 'clamp(2.8rem, 7vw, 5.5rem)',
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: '-0.025em',
                    color: '#0f172a',
                    marginBottom: chatActive ? '1.25rem' : '0.35rem',
                    opacity: chatActive ? 0.45 : 1,
                    transition: 'font-size 0.55s cubic-bezier(0.4,0,0.2,1), margin-bottom 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease',
                }}>
                    Hi, I'm Sivaavanish.
                </div>

                {/* ── Subtitle + Description ── */}
                <AnimatePresence>
                    {!chatActive && (
                        <motion.div
                            key="hero-sub"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -14 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{
                                height: 'clamp(3rem, 8vw, 6rem)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', position: 'relative', marginBottom: '0.5rem',
                            }}>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={titleIdx}
                                        initial={{ y: 60, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -60, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 60, damping: 14 }}
                                        style={{
                                            fontFamily: "'Playfair Display', serif",
                                            fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
                                            fontWeight: 600, fontStyle: 'italic', color: '#f97316',
                                            position: 'absolute', whiteSpace: 'nowrap', letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {titles[titleIdx]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.45 }}
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#64748b',
                                    maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: 1.75,
                                }}
                            >
                                I write code, break it, fix it, and repeat — turning complex problems into
                                elegant software. 3+ years building full-stack apps and exploring AI/ML.
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Chat widget ── */}
                <motion.div
                    ref={chatWrapRef}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    style={{ maxWidth: '580px', margin: '0 auto', position: 'relative' }}
                >
                    {/* Live indicator */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.5rem', marginBottom: '1.1rem',
                    }}>
                        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.span
                                animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                                style={{
                                    position: 'absolute', width: '8px', height: '8px',
                                    borderRadius: '50%', background: '#f97316',
                                }}
                            />
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', position: 'relative' }} />
                        </span>
                        <span style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
                            fontWeight: 600, letterSpacing: '0.13em',
                            textTransform: 'uppercase', color: '#94a3b8',
                        }}>
                            Chat with my Clone
                        </span>
                    </div>

                    {/* ── Messages — Apple iMessage style ── */}
                    <AnimatePresence>
                        {hasMessages && (
                            <motion.div
                                key="messages"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto', maxHeight: '380px' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                style={{
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '3px',
                                    padding: '0.5rem 0 1.25rem',
                                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
                                }}
                            >
                                {messages.map((msg, i) => {
                                    const prevSame = i > 0 && messages[i - 1].role === msg.role;
                                    const nextSame = i < messages.length - 1 && messages[i + 1].role === msg.role;
                                    const isUser = msg.role === 'user';

                                    // Apple-style radius: tail only on last of a group
                                    const radius = isUser
                                        ? `18px 18px ${nextSame ? '18px' : '5px'} 18px`
                                        : `18px 18px 18px ${nextSame ? '18px' : '5px'}`;

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.85, y: 8 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ ...bubbleSpring, delay: 0.03 }}
                                            style={{
                                                display: 'flex',
                                                justifyContent: isUser ? 'flex-end' : 'flex-start',
                                                marginTop: prevSame ? '0' : '0.55rem',
                                                paddingLeft: isUser ? '20%' : '0',
                                                paddingRight: isUser ? '0' : '20%',
                                            }}
                                        >
                                            {/* Bot: rich component or text */}
                                            {!isUser && (
                                                msg.replyKey && REPLY_MAP[msg.replyKey] ? (
                                                    <div style={{ textAlign: 'left' }}>
                                                        {React.createElement(REPLY_MAP[msg.replyKey])}
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        background: '#e9e9eb',
                                                        borderRadius: radius,
                                                        padding: '0.6rem 0.85rem',
                                                        fontFamily: "'Inter', sans-serif",
                                                        fontSize: '0.88rem',
                                                        lineHeight: 1.5,
                                                        color: '#1c1c1e',
                                                        textAlign: 'left',
                                                        maxWidth: '100%',
                                                    }}>
                                                        {msg.text}
                                                    </div>
                                                )
                                            )}

                                            {/* User: orange bubble */}
                                            {isUser && (
                                                <div style={{
                                                    background: 'linear-gradient(160deg, #f97316 0%, #ea580c 100%)',
                                                    borderRadius: radius,
                                                    padding: '0.6rem 0.85rem',
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontSize: '0.88rem',
                                                    lineHeight: 1.5,
                                                    color: 'white',
                                                    textAlign: 'left',
                                                }}>
                                                    {msg.text}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}

                                {/* Apple-style typing dots */}
                                {typing && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.7 }}
                                        transition={bubbleSpring}
                                        style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.55rem' }}
                                    >
                                        <div style={{
                                            background: '#e9e9eb',
                                            borderRadius: '18px',
                                            padding: '0.6rem 0.9rem',
                                            display: 'flex', gap: '4px', alignItems: 'center',
                                        }}>
                                            {[0, 1, 2].map(j => (
                                                <motion.span
                                                    key={j}
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{ repeat: Infinity, duration: 0.6, delay: j * 0.15, ease: 'easeInOut' }}
                                                    style={{
                                                        width: '6px', height: '6px', borderRadius: '50%',
                                                        background: '#8e8e93', display: 'inline-block',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Input ── */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'white',
                        borderRadius: '999px',
                        padding: '0.55rem 0.6rem 0.55rem 1.25rem',
                        boxShadow: chatActive
                            ? '0 0 0 1.5px #f97316, 0 4px 20px rgba(249,115,22,0.12)'
                            : '0 0 0 1px #e2e8f0, 0 4px 16px rgba(0,0,0,0.07)',
                        transition: 'box-shadow 0.3s ease',
                    }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            onFocus={() => setChatActive(true)}
                            placeholder="Ask me anything…"
                            style={{
                                flex: 1,
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.95rem',
                                color: '#0f172a',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                padding: '0.3rem 0',
                                caretColor: '#f97316',
                            }}
                        />
                        <motion.button
                            onClick={() => send(input, null)}
                            whileHover={input.trim() ? { scale: 1.1 } : {}}
                            whileTap={input.trim() ? { scale: 0.9 } : {}}
                            style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: input.trim() ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'transparent',
                                border: input.trim() ? 'none' : '1.5px solid #d1d5db',
                                cursor: input.trim() ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'background 0.2s, border 0.2s',
                            }}
                        >
                            <ArrowUp size={14} strokeWidth={2.5} color={input.trim() ? 'white' : '#d1d5db'} />
                        </motion.button>
                    </div>

                    {/* ── Suggestion chips ── */}
                    <AnimatePresence>
                        {!hasMessages && (
                            <motion.div
                                key="chips"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.3, delay: chatActive ? 0 : 0.85 }}
                                style={{
                                    display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                                    justifyContent: 'center', marginTop: '0.9rem',
                                }}
                            >
                                {SUGGESTIONS.map(({ label, key, text }) => (
                                    <motion.button
                                        key={label}
                                        whileHover={{ y: -2, scale: 1.02 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => send(text, key)}
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '0.75rem', fontWeight: 500,
                                            color: '#64748b', background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '9999px',
                                            padding: '0.35rem 0.85rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                            transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#ea580c'; e.currentTarget.style.background = '#fff7ed'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'white'; }}
                                    >
                                        {label}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── Scroll hint ── */}
                <AnimatePresence>
                    {!chatActive && (
                        <motion.div
                            key="scroll"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 1.4, duration: 0.4 }}
                            style={{ marginTop: '3.5rem' }}
                        >
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ repeat: Infinity, duration: 1.6 }}
                                style={{
                                    display: 'inline-flex', flexDirection: 'column',
                                    alignItems: 'center', gap: '0.3rem',
                                    color: '#94a3b8', fontSize: '0.75rem',
                                    fontFamily: "'Inter', sans-serif",
                                    letterSpacing: '0.1em', textTransform: 'uppercase',
                                }}
                            >
                                <span>Scroll</span>
                                <span style={{ fontSize: '1.2rem' }}>↓</span>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </section>
    );
}
