const STATES = [
  { id: 'idle',       label: 'Idle' },
  { id: 'walk',       label: 'Walk' },
  { id: 'wave',       label: 'Wave' },
  { id: 'sleep',      label: 'Sleep' },
  { id: 'think',      label: 'Think' },
  { id: 'writing',    label: 'Write' },
  { id: 'listen',     label: 'Listen' },
  { id: 'dance',      label: 'Dance' },
  { id: 'greeting',   label: 'Greet' },
  { id: 'poster',     label: 'Poster' },
  { id: 'experience', label: 'Xp / BCase' },
  { id: 'paperplane', label: 'Plane' },
  { id: 'graduation', label: 'Grad' },
  { id: 'phone',      label: 'Phone' },
];

const TOOL_STATES = [
  { id: 'program',                      label: 'Laptop' },
  { id: 'program:search-projects',      label: 'Search' },
  { id: 'program:get-profile',          label: 'Profile' },
  { id: 'program:notify-siva',          label: 'Notify' },
  { id: 'program:get-live-github',      label: 'GitHub' },
  { id: 'program:personalized-tour',    label: 'Tour' },
  { id: 'program:get-resume',           label: 'Resume' },
];

export default function MascotDevPanel({ active, onChange }) {
  return (
    <div className="mascot-dev-panel" style={{
      position:        'fixed',
      bottom:          160,
      left:            16,
      background:      '#1a1a2e',
      border:          '1px solid #333',
      borderRadius:    10,
      padding:         '10px 12px',
      zIndex:          10000,
      boxShadow:       '0 4px 20px rgba(0,0,0,.5)',
      userSelect:      'none',
      minWidth:        160,
    }}>
      <div style={{ color: '#888', fontSize: 10, fontFamily: 'monospace', marginBottom: 8, letterSpacing: 1 }}>
        MASCOT DEV
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {STATES.map(s => (
          <button
            key={s.id}
            onClick={() => onChange(active === s.id ? null : s.id)}
            style={{
              background:   active === s.id ? '#f97316' : '#2a2a3e',
              color:        active === s.id ? '#fff' : '#aaa',
              border:       'none',
              borderRadius: 5,
              padding:      '5px 6px',
              fontSize:     11,
              fontFamily:   'monospace',
              cursor:       'pointer',
              transition:   'background .15s, color .15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div style={{ color: '#555', fontSize: 9, fontFamily: 'monospace', margin: '10px 0 5px', letterSpacing: 1 }}>
        AGENT TOOLS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {TOOL_STATES.map(s => (
          <button
            key={s.id}
            onClick={() => onChange(active === s.id ? null : s.id)}
            style={{
              background:   active === s.id ? '#7c3aed' : '#1e1e30',
              color:        active === s.id ? '#fff' : '#888',
              border:       '1px solid #333',
              borderRadius: 5,
              padding:      '5px 6px',
              fontSize:     11,
              fontFamily:   'monospace',
              cursor:       'pointer',
              transition:   'background .15s, color .15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      {active && (
        <button
          onClick={() => onChange(null)}
          style={{
            marginTop:    7,
            width:        '100%',
            background:   'transparent',
            color:        '#666',
            border:       '1px solid #333',
            borderRadius: 5,
            padding:      '4px 0',
            fontSize:     10,
            fontFamily:   'monospace',
            cursor:       'pointer',
          }}
        >
          reset to auto
        </button>
      )}
    </div>
  );
}
