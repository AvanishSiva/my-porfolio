import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoveRight, ArrowUp } from 'lucide-react';
import { ResolveChatComponent } from '../components/chat/ChatComponents';

const titles = ['Software Engineer', 'AI Enthusiast', 'Full-Stack Dev', 'Problem Solver', 'Open to Work'];

const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api/chat'
    : '/api/chat';

const SUGGESTIONS = [
    { label: 'About Siva',        text: 'Tell me about Siva' },
    { label: 'Experience',        text: 'What is his work experience?' },
    { label: 'Projects',          text: 'What projects has he built?' },
    { label: 'Skills & stack',    text: 'What are his skills and tech stack?' },
    { label: 'How to hire?',      text: 'How do I hire or contact Siva?' },
];

const bubbleSpring = { type: 'spring', stiffness: 420, damping: 28, mass: 0.7 };

// Format messages into Claude-compatible history (last 6 messages = 3 turns)
function buildHistory(messages) {
    return messages
        .slice(-6)
        .map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.role === 'user'
                ? m.text
                : JSON.stringify({ component: m.component, props: m.props }),
        }));
}

export default function HeroV2() {
    const [titleIdx, setTitleIdx]     = useState(0);
    const [chatActive, setChatActive]   = useState(false);
    const [messages, setMessages]       = useState([]); // full history for API context
    const [activeIdx, setActiveIdx]     = useState(0);  // key for AnimatePresence transition
    const [currentPair, setCurrentPair] = useState(null); // { userText, botComponent, botProps }
    const [input, setInput]             = useState('');
    const [loading, setLoading]         = useState(false);
    const chatWrapRef                   = useRef(null);

    const hasMessages = currentPair !== null;

    // Cycle subtitle when idle
    useEffect(() => {
        if (chatActive) return;
        const t = setTimeout(() => setTitleIdx(i => (i + 1) % titles.length), 2200);
        return () => clearTimeout(t);
    }, [titleIdx, chatActive]);


    // Close chat on outside click (only if no messages yet)
    useEffect(() => {
        if (!chatActive || hasMessages) return;
        const handler = (e) => {
            if (chatWrapRef.current && !chatWrapRef.current.contains(e.target))
                setChatActive(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [chatActive, hasMessages]);

    const send = async (text) => {
        const query = (text || input).trim();
        if (!query || loading) return;

        setInput('');
        setChatActive(true);

        const history = buildHistory(messages);
        const nextMessages = [...messages, { role: 'user', text: query }];
        setMessages(nextMessages);

        // Show user bubble immediately, transition to new exchange
        setActiveIdx(i => i + 1);
        setCurrentPair({ userText: query, botComponent: null, botProps: null });

        fetchReply(query, history);
    };

    const fetchReply = async (query, history) => {
        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, history }),
            });

            if (!res.ok) throw new Error('API error');

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'bot', component: data.component, props: data.props }]);
            setCurrentPair(prev => ({ ...prev, botComponent: data.component, botProps: data.props }));
        } catch {
            setMessages(prev => [...prev, { role: 'bot', component: 'TextResponse', props: { text: "Something went wrong. Try again in a moment." } }]);
            setCurrentPair(prev => ({ ...prev, botComponent: 'TextResponse', botProps: { text: "Something went wrong. Try again in a moment." } }));
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
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

                {/* ── Name — shrinks gently when chat opens ── */}
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
                    {/* Live label */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.5rem', marginBottom: '1.1rem',
                    }}>
                        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.span
                                animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                                style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}
                            />
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', position: 'relative' }} />
                        </span>
                        <span style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
                            fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#94a3b8',
                        }}>
                            Chat with my Clone
                        </span>
                    </div>

                    {/* ── Latest exchange only — transitions on each new message ── */}
                    <AnimatePresence mode="wait">
                        {hasMessages && (
                            <motion.div
                                key={activeIdx}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingBottom: '1.25rem' }}
                            >
                                {/* User bubble */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: '15%' }}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.88, y: 6 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={bubbleSpring}
                                        style={{
                                            background: 'linear-gradient(160deg,#f97316,#ea580c)',
                                            borderRadius: '18px 18px 5px 18px',
                                            padding: '0.65rem 0.95rem',
                                            fontFamily: "'Inter',sans-serif",
                                            fontSize: '0.88rem', lineHeight: 1.5, color: 'white',
                                        }}
                                    >
                                        {currentPair.userText}
                                    </motion.div>
                                </div>

                                {/* Bot response */}
                                {loading ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={bubbleSpring}
                                        style={{ display: 'flex', justifyContent: 'flex-start' }}
                                    >
                                        <div style={{ background: '#e9e9eb', borderRadius: '18px', padding: '0.65rem 0.95rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            {[0, 1, 2].map(j => (
                                                <motion.span key={j}
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{ repeat: Infinity, duration: 0.6, delay: j * 0.15, ease: 'easeInOut' }}
                                                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8e8e93', display: 'inline-block' }}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : currentPair.botComponent && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.92, y: 8 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ ...bubbleSpring, delay: 0.05 }}
                                        style={{ width: '100%' }}
                                    >
                                        {currentPair.botComponent === 'TextResponse' ? (
                                            <div style={{ background: '#e9e9eb', borderRadius: '18px 18px 18px 5px', padding: '0.65rem 0.95rem', fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', lineHeight: 1.5, color: '#1c1c1e', textAlign: 'left' }}>
                                                {currentPair.botProps?.text}
                                            </div>
                                        ) : (
                                            <ResolveChatComponent component={currentPair.botComponent} props={currentPair.botProps} />
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Input pill ── */}
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
                            disabled={loading}
                            style={{
                                flex: 1,
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.95rem', color: '#0f172a',
                                background: 'transparent', border: 'none', outline: 'none',
                                padding: '0.25rem 0', caretColor: '#f97316',
                            }}
                        />
                        <motion.button
                            onClick={() => send()}
                            whileHover={input.trim() && !loading ? { scale: 1.1 } : {}}
                            whileTap={input.trim() && !loading ? { scale: 0.9 } : {}}
                            disabled={!input.trim() || loading}
                            style={{
                                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                background: input.trim() && !loading ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'transparent',
                                border: input.trim() && !loading ? 'none' : '1.5px solid #d1d5db',
                                cursor: input.trim() && !loading ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.2s, border 0.2s',
                            }}
                        >
                            <ArrowUp size={15} strokeWidth={2.5} color={input.trim() && !loading ? 'white' : '#d1d5db'} />
                        </motion.button>
                    </div>

                    {/* ── Suggestion chips — disappear once conversation starts ── */}
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
                                {SUGGESTIONS.map(({ label, text }) => (
                                    <motion.button
                                        key={label}
                                        whileHover={{ y: -2, scale: 1.02 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => send(text)}
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '0.75rem', fontWeight: 500,
                                            color: '#64748b', background: 'white',
                                            border: '1px solid #e2e8f0', borderRadius: '9999px',
                                            padding: '0.35rem 0.85rem', cursor: 'pointer',
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
                                    display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                                    color: '#94a3b8', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif",
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
