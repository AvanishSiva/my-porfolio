import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoveRight, ArrowUp } from 'lucide-react';
import { ResolveChatComponent } from '../components/chat/ChatComponents';
import { ExecutionTimeline, ReasoningToggle } from '../components/chat/AgentTrace';

const titles = ['Software Engineer', 'AI Enthusiast', 'Full-Stack Dev', 'Problem Solver', 'Open to Work'];

const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api/agent'
    : '/api/agent';

const SUGGESTIONS = [
    { label: 'About Siva',     text: 'Tell me about Siva' },
    { label: 'Experience',     text: 'What is his work experience?' },
    { label: 'Projects',       text: 'What projects has he built?' },
    { label: 'Skills & stack', text: 'What are his skills and tech stack?' },
    { label: 'How to hire?',   text: 'How do I hire or contact Siva?' },
];

const bubbleSpring = { type: 'spring', stiffness: 420, damping: 28, mass: 0.7 };

function summarizeBot(component, props, reply) {
    if (reply) return reply;
    if (!component) return '[responded]';
    switch (component) {
        case 'ProjectCard':  return `Showed project: ${props?.title ?? ''}`;
        case 'ProjectList':  return `Showed projects: ${(props?.projects ?? []).map(p => p.name).slice(0, 3).join(', ')}`;
        case 'SkillList':    return 'Showed skills overview';
        case 'AboutCard':    return `About: ${(props?.summary ?? '').slice(0, 80)}`;
        case 'Timeline':     return 'Showed career timeline';
        case 'ContactCard':  return 'Showed contact info';
        case 'TextResponse': return (props?.text ?? '').slice(0, 120);
        default:             return `[${component}]`;
    }
}

function buildHistory(messages) {
    return messages
        .slice(-6)
        .map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.role === 'user'
                ? m.text
                : summarizeBot(m.component, m.props, m.reply),
        }));
}

export default function HeroV2() {
    const [titleIdx, setTitleIdx]     = useState(0);
    const [chatActive, setChatActive]   = useState(false);
    const [messages, setMessages]       = useState([]);
    const [activeIdx, setActiveIdx]     = useState(0);
    const [currentPair, setCurrentPair] = useState(null);
    const [input, setInput]             = useState('');
    const [loading, setLoading]         = useState(false);
    const [traceEvents, setTraceEvents] = useState([]);
    const [thinking, setThinking]       = useState('');
    const [streamText, setStreamText]   = useState('');
    const [reply, setReply]             = useState('');
    const [followups, setFollowups]     = useState([]);
    const chatWrapRef                   = useRef(null);

    const hasMessages = currentPair !== null;

    useEffect(() => {
        if (chatActive) return;
        const t = setTimeout(() => setTitleIdx(i => (i + 1) % titles.length), 2200);
        return () => clearTimeout(t);
    }, [titleIdx, chatActive]);

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

        setActiveIdx(i => i + 1);
        setCurrentPair({ userText: query, botComponent: null, botProps: null });

        fetchReply(query, history);
    };

    const fetchReply = async (query, history) => {
        setLoading(true);
        setTraceEvents([]);
        setThinking('');
        setStreamText('');
        setReply('');
        setFollowups([]);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, history }),
            });

            if (!res.ok) throw new Error('API error');

            const reader  = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split('\n');
                buffer = lines.pop();

                let eventType = null;
                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        eventType = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        const payload = JSON.parse(line.slice(5).trim());
                        if (eventType === 'thinking') {
                            setThinking(payload.text);
                        } else if (eventType === 'stream') {
                            setStreamText(prev => prev + payload.text);
                        } else if (eventType === 'trace') {
                            setTraceEvents(prev => [...prev, payload]);
                        } else if (eventType === 'done') {
                            setReply(payload.reply ?? '');
                            setFollowups(payload.followups ?? []);
                            setMessages(prev => [...prev, {
                                role: 'bot',
                                component: payload.component?.component,
                                props: payload.component?.props,
                                reply: payload.reply ?? '',
                            }]);
                            setCurrentPair(prev => ({
                                ...prev,
                                botComponent: payload.component?.component,
                                botProps: payload.component?.props,
                            }));
                        }
                        eventType = null;
                    }
                }
            }
        } catch {
            setMessages(prev => [...prev, { role: 'bot', component: 'TextResponse', props: { text: 'Something went wrong. Try again in a moment.' } }]);
            setCurrentPair(prev => ({ ...prev, botComponent: 'TextResponse', botProps: { text: 'Something went wrong. Try again in a moment.' } }));
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                paddingTop: '5rem', paddingBottom: '3rem', position: 'relative',
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

                {/* ── Name ── */}
                <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: chatActive ? '2rem' : 'clamp(2.8rem, 7vw, 5.5rem)',
                    fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em',
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
                    {/* ── Agent panel (appears on first message) ── */}
                    <AnimatePresence>
                        {hasMessages && (
                            <motion.div
                                key="agent-panel"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    background: 'white',
                                    border: `1px solid ${loading ? 'rgba(249,115,22,0.25)' : '#e2e8f0'}`,
                                    borderRadius: '20px', overflow: 'hidden',
                                    boxShadow: loading
                                        ? '0 4px 24px rgba(249,115,22,0.09), 0 0 0 1px rgba(249,115,22,0.12)'
                                        : '0 4px 24px rgba(0,0,0,0.07)',
                                    marginBottom: '0.85rem',
                                    transition: 'border-color 0.4s, box-shadow 0.4s',
                                }}
                            >
                                {/* Agent header */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.7rem 1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                                        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '8px', height: '8px', flexShrink: 0 }}>
                                            <motion.span
                                                animate={{ scale: [1, 2.4, 1], opacity: [0.5, 0, 0.5] }}
                                                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                                                style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}
                                            />
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', position: 'relative' }} />
                                        </span>
                                        <span style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '0.64rem', fontWeight: 700,
                                            letterSpacing: '0.13em', textTransform: 'uppercase', color: '#64748b',
                                        }}>
                                            Siva's AI Agent
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                        background: 'white', border: '1px solid #e2e8f0',
                                        borderRadius: '6px', padding: '0.22rem 0.6rem',
                                    }}>
                                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
                                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.62rem', fontWeight: 600, color: '#94a3b8' }}>
                                            claude-sonnet-4-6
                                        </span>
                                    </div>
                                </div>

                                {/* Messages */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIdx}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -14 }}
                                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                        style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                                    >
                                        {/* User bubble */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: '18%' }}>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.88, y: 6 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={bubbleSpring}
                                                style={{
                                                    background: 'linear-gradient(160deg,#f97316,#ea580c)',
                                                    borderRadius: '18px 18px 5px 18px',
                                                    padding: '0.65rem 0.95rem',
                                                    fontFamily: "'Inter',sans-serif",
                                                    fontSize: '0.88rem', lineHeight: 1.5, color: 'white', textAlign: 'left',
                                                }}
                                            >
                                                {currentPair.userText}
                                            </motion.div>
                                        </div>

                                        {/* Loading: execution timeline + streaming reply */}
                                        {loading && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.97 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={bubbleSpring}
                                                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                                            >
                                                <ExecutionTimeline traceEvents={traceEvents} isRunning={!streamText} />

                                                <AnimatePresence>
                                                    {streamText && (
                                                        <motion.div
                                                            key="stream-text"
                                                            initial={{ opacity: 0, y: 4 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}
                                                        >
                                                            <AgentAvatar />
                                                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', lineHeight: 1.65, color: '#334155', paddingTop: '0.05rem' }}>
                                                                {streamText}
                                                                <motion.span
                                                                    animate={{ opacity: [1, 0, 1] }}
                                                                    transition={{ repeat: Infinity, duration: 0.9 }}
                                                                    style={{ display: 'inline-block', marginLeft: '1px', fontWeight: 300, color: '#f97316' }}
                                                                >▋</motion.span>
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )}

                                        {/* Response */}
                                        {!loading && currentPair.botComponent && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ ...bubbleSpring, delay: 0.05 }}
                                                style={{ textAlign: 'left' }}
                                            >
                                                {/* SA avatar + reply text */}
                                                {currentPair.botComponent === 'TextResponse' ? (
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                                                        <AgentAvatar />
                                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', lineHeight: 1.65, color: '#334155', paddingTop: '0.05rem' }}>
                                                            {reply || currentPair.botProps?.text}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {reply && (
                                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.7rem' }}>
                                                                <AgentAvatar />
                                                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', lineHeight: 1.65, color: '#334155', paddingTop: '0.05rem' }}>
                                                                    {reply}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <ResolveChatComponent component={currentPair.botComponent} props={currentPair.botProps} />
                                                    </>
                                                )}

                                                {/* Reasoning toggle */}
                                                <ReasoningToggle traceEvents={traceEvents} />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Followup chips ── */}
                    <AnimatePresence>
                        {!loading && followups.length > 0 && (
                            <motion.div
                                key="followups"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.3 }}
                                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.9rem' }}
                            >
                                {followups.map((q) => (
                                    <motion.button
                                        key={q}
                                        whileHover={{ y: -2, scale: 1.02 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => send(q)}
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '0.75rem', fontWeight: 500,
                                            color: '#ea580c', background: '#fff7ed',
                                            border: '1px solid #fed7aa', borderRadius: '9999px',
                                            padding: '0.35rem 0.85rem', cursor: 'pointer',
                                        }}
                                    >
                                        {q}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Input pill ── */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'white', borderRadius: '999px',
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
                            placeholder={hasMessages ? 'Ask a follow-up…' : 'Ask about Siva…'}
                            disabled={loading}
                            style={{
                                flex: 1, fontFamily: "'Inter', sans-serif",
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

                    {/* ── Suggestion chips ── */}
                    <AnimatePresence>
                        {!hasMessages && (
                            <motion.div
                                key="chips"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.3, delay: chatActive ? 0 : 0.85 }}
                                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '0.9rem' }}
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

function AgentAvatar() {
    return (
        <div style={{
            width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
            background: 'linear-gradient(135deg,#f97316,#ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.58rem', fontWeight: 800, color: 'white',
            fontFamily: "'Inter',sans-serif", letterSpacing: 0, marginTop: '2px',
        }}>SA</div>
    );
}
