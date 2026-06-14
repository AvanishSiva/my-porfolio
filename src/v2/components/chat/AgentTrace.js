import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOOL_LABELS = {
    search_projects: 'Searching projects',
    get_profile:     'Reading profile data',
    notify_siva:     'Notifying Siva',
    get_resume:      'Fetching resume',
    get_live_github: 'Fetching GitHub stats',
};

function friendlyLabel(tool) {
    return TOOL_LABELS[tool] ?? tool.replace(/_/g, ' ');
}

function buildSteps(traceEvents) {
    const steps = [];
    for (const ev of traceEvents) {
        if (ev.type === 'tool_call') {
            steps.push({ tool: ev.tool, status: 'running', ms: null });
        } else if (ev.type === 'tool_result') {
            const s = [...steps].reverse().find(s => s.tool === ev.tool && s.status === 'running');
            if (s) { s.status = 'done'; s.ms = ev.ms; }
        } else if (ev.type === 'tool_error') {
            const s = [...steps].reverse().find(s => s.tool === ev.tool && s.status === 'running');
            if (s) { s.status = 'error'; }
        }
    }
    return steps;
}

function StepIcon({ status }) {
    if (status === 'done') return (
        <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: '#f0fdf4', border: '1.5px solid #86efac',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6rem', fontWeight: 800, color: '#16a34a',
        }}>✓</div>
    );
    if (status === 'error') return (
        <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: '#fef2f2', border: '1.5px solid #fca5a5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 800, color: '#ef4444',
        }}>✗</div>
    );
    if (status === 'running') return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
            style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                border: '2.5px solid #fed7aa', borderTopColor: '#f97316',
            }}
        />
    );
    return (
        <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: 'white', border: '1.5px solid #e2e8f0',
        }} />
    );
}

export function ExecutionTimeline({ traceEvents = [], isRunning }) {
    const steps = buildSteps(traceEvents);
    const allDone = steps.length > 0 && steps.every(s => s.status !== 'running');
    const showSynthesizing = isRunning && allDone;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: '14px', padding: '0.85rem 1rem', textAlign: 'left',
            }}
        >
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                marginBottom: steps.length ? '0.75rem' : 0,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.61rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#94a3b8',
            }}>
                {steps.length === 0 ? 'Thinking' : 'Agent is reasoning'}
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {steps.length === 0 && isRunning && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                    style={{
                        width: 20, height: 20, borderRadius: '50%',
                        border: '2.5px solid #fed7aa', borderTopColor: '#f97316',
                    }}
                />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {steps.map((step, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.06 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                    >
                        <StepIcon status={step.status} />
                        <span style={{
                            flex: 1, fontFamily: "'Inter', sans-serif", fontSize: '0.79rem',
                            color: step.status === 'running' ? '#0f172a' : step.status === 'error' ? '#991b1b' : '#334155',
                            fontWeight: step.status === 'running' ? 500 : 400,
                        }}>
                            {friendlyLabel(step.tool)}{step.status === 'running' ? '…' : ''}
                        </span>
                        {step.ms != null && (
                            <span style={{
                                fontSize: '0.68rem', color: '#94a3b8',
                                fontVariantNumeric: 'tabular-nums',
                                fontFamily: "'Inter', sans-serif",
                            }}>
                                {step.ms}ms
                            </span>
                        )}
                    </motion.div>
                ))}

                {/* Synthesizing step — appears after all tools complete while still loading */}
                <AnimatePresence>
                    {showSynthesizing && (
                        <motion.div
                            key="synthesizing"
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                                style={{
                                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                    border: '2.5px solid #fed7aa', borderTopColor: '#f97316',
                                }}
                            />
                            <span style={{
                                flex: 1, fontFamily: "'Inter', sans-serif", fontSize: '0.79rem',
                                color: '#0f172a', fontWeight: 500,
                            }}>
                                Synthesizing response…
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export function ReasoningToggle({ traceEvents = [] }) {
    const [open, setOpen] = useState(false);
    if (traceEvents.length === 0) return null;

    const steps    = buildSteps(traceEvents);
    const totalMs  = steps.reduce((s, t) => s + (t.ms || 0), 0);
    const count    = steps.filter(s => s.status !== 'running').length;

    return (
        <div style={{ marginTop: '0.4rem' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                    fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 500,
                    color: '#94a3b8', cursor: 'pointer', border: 'none', background: 'none',
                    padding: '0.25rem 0', transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#64748b'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
                <motion.span
                    animate={{ rotate: open ? 90 : 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ fontSize: '0.6rem', display: 'inline-block' }}
                >▸</motion.span>
                {count} tool call{count !== 1 ? 's' : ''}{totalMs > 0 ? ` · ${totalMs}ms` : ''}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            marginTop: '0.45rem', background: '#f8fafc',
                            border: '1px solid #e2e8f0', borderRadius: '10px',
                            padding: '0.6rem 0.8rem',
                            display: 'flex', flexWrap: 'wrap', gap: '0.35rem',
                        }}>
                            {steps.map((step, i) => (
                                <div key={i} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                    background: 'white', border: '1px solid #e2e8f0',
                                    borderRadius: '9999px', padding: '0.22rem 0.6rem',
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '0.68rem', fontWeight: 600, whiteSpace: 'nowrap',
                                }}>
                                    <div style={{
                                        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                                        background: step.status === 'error' ? '#ef4444' : '#22c55e',
                                    }} />
                                    <span style={{ color: step.status === 'error' ? '#991b1b' : '#14532d' }}>
                                        {friendlyLabel(step.tool)}{step.ms != null ? ` · ${step.ms}ms` : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ExecutionTimeline;
