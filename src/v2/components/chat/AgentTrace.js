import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS = { tool_call: '⚙', tool_result: '✓', tool_error: '✗' };
const COLORS = {
  tool_call:   { color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
  tool_result: { color: '#14532d', bg: '#dcfce7', dot: '#22c55e' },
  tool_error:  { color: '#991b1b', bg: '#fee2e2', dot: '#ef4444' },
};

function EventPill({ event, index }) {
  const c = COLORS[event.type] ?? COLORS.tool_call;
  const label = event.type === 'tool_call'
    ? `${event.tool}`
    : event.type === 'tool_result'
      ? `${event.tool} · ${event.ms}ms`
      : `${event.tool} failed`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        background: c.bg, borderRadius: '9999px',
        padding: '0.25rem 0.6rem',
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.7rem', fontWeight: 600,
        color: c.color,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {ICONS[event.type]} {label}
    </motion.div>
  );
}

export default function AgentTrace({ traceEvents = [], isRunning = false }) {
  if (!isRunning && traceEvents.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.25rem' }}>
      <AnimatePresence>
        {traceEvents.map((event, i) => (
          <EventPill key={i} event={event} index={i} />
        ))}
        {isRunning && traceEvents.length === 0 && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.7rem', fontWeight: 500,
              color: '#94a3b8',
            }}
          >
            thinking…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
