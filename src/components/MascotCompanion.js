import { useEffect, useRef, useState } from 'react';

const SIZE              = 110;
const GREETING_DURATION = 1500;
const WALK_SPEED        = 60;
const SLEEP_AFTER       = 45000; // ms of zero user activity before nodding off

// Scene per page section — first match crossing mid-viewport wins
const SECTION_STATE = [
  ['v2-about',      'poster'],
  ['v2-experience', 'experience'],
  ['v2-projects',   'program'],
  ['v2-education',  'graduation'],
  ['v2-contact',    'phone'],
];

const C = {
  body:      '#DD6B35',
  stroke:    '#B8501F',
  dark:      '#232B3D',
  navy:      '#2C3550',
  highlight: '#FBF8F2',
  shadow:    '#DED7C9',
  note:      '#f97316',
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function MascotCompanion({ forceStatus = null }) {
  // Behavior layers (highest priority first: dev panel → agent → hello flash → sleep → section → ambient)
  const [agentState,   setAgentState]   = useState(null);   // { status, tool } while the chat agent is busy
  const [greetFlash,   setGreetFlash]   = useState(false);  // short hello on wake-up or poke
  const [asleep,       setAsleep]       = useState(false);  // nods off after SLEEP_AFTER of inactivity
  const [sectionState, setSectionState] = useState(null);   // scene for the section in view
  const [ambient,      setAmbient]      = useState('idle'); // idle ↔ walk wander cycle
  const [xPos,         setXPos]         = useState(28);
  const [facing,       setFacing]       = useState('right');
  const [dashing,      setDashing]      = useState(false);

  const xPosRef    = useRef(28);
  const rafRef     = useRef(null);
  const greetTimer = useRef(null);
  const flashTimer = useRef(null);
  const asleepRef  = useRef(false);
  const lastActRef = useRef(Date.now());
  const svgRef     = useRef(null);
  const facingRef  = useRef('right');
  const mouseRef   = useRef({ x: 0, y: 0, t: 0, has: false });

  // Fake-3D physics state — pupils, face parallax, highlight, tilt, antenna spring, squash spring
  const phys = useRef({
    px: 0, py: 0,          // pupil offset
    fx: 0, fy: 0,          // face parallax offset
    hx: 0, hy: 0,          // specular highlight counter-offset
    ps: 1,                 // pupil dilation scale
    tilt: 0,               // body lean (deg, visual space)
    ant: 0, antV: 0,       // antenna spring angle + velocity
    sq: 0, sqV: 0,         // squash scalar + velocity
    vel: 0, lastX: 28,     // smoothed horizontal velocity
    sacX: 0, sacY: 0, sacT: 0, // idle-gaze saccade target
  });

  facingRef.current = facing;

  // Resolve the active layer into a single state
  let derived = ambient, derivedTool = null;
  if      (agentState)   { derived = agentState.status; derivedTool = agentState.tool; }
  else if (greetFlash)   derived = 'greeting';
  else if (asleep)       derived = 'sleep';
  else if (sectionState) derived = sectionState;

  const [forceBase, forceTool] = (forceStatus || '').split(':');
  const status        = forceStatus ? forceBase : derived;
  const effectiveTool = forceStatus ? (forceTool || null) : derivedTool;

  const statusRef = useRef('idle');
  const toolRef   = useRef(null);
  statusRef.current = status;
  toolRef.current   = effectiveTool;

  // ── Fake-3D loop: eye tracking, sphere parallax, lean, antenna spring, jelly squash ──
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const m = mouseRef.current;
    const onMove = (e) => {
      m.x = e.clientX; m.y = e.clientY;
      m.t = performance.now(); m.has = true;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let raf, last = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const svg = svgRef.current;
      if (!svg || dt <= 0) return;
      const p = phys.current;

      // Smoothed horizontal velocity (screen px/s)
      const x = xPosRef.current;
      const instV = clamp((x - p.lastX) / Math.max(dt, 1e-4), -900, 900);
      p.lastX = x;
      p.vel += (instV - p.vel) * Math.min(1, dt * 12);

      // Vector from body center (on screen) to cursor
      const cx = x + SIZE * 0.5;
      const cy = window.innerHeight - 24 - SIZE + 108 * (SIZE / 240);
      let dx = m.has ? m.x - cx : 0;
      let dy = m.has ? m.y - cy : -40;
      const dist = Math.hypot(dx, dy);

      // Idle gaze: cursor still for a while → look around on its own
      if (now - m.t > 2500) {
        if (now - p.sacT > 1700 + Math.random() * 600) {
          p.sacT = now;
          p.sacX = (Math.random() * 2 - 1) * 160;
          p.sacY = (Math.random() * 2 - 1) * 70 - 20;
        }
        dx = p.sacX; dy = p.sacY;
      }

      // State gaze acting — overrides cursor tracking with in-scene focus
      const st  = statusRef.current;
      const gd  = facingRef.current === 'left' ? -1 : 1;
      if      (st === 'think')      { dx = -70 + Math.sin(now / 650) * 25; dy = -150; }
      else if (st === 'program') {
        if (toolRef.current) { dx = 150 * gd; dy = 10; }                       // study the held prop
        else                 { dx = Math.sin(now / 480) * 45 * gd; dy = 175; } // eyes scan the laptop screen
      }
      else if (st === 'writing')    { dx = (10 + Math.sin(now / 500) * 35) * gd; dy = 175; } // eyes follow the pen
      else if (st === 'phone')      { dx = 150 * gd; dy = 25;   }
      else if (st === 'graduation') { dx = 45  * gd; dy = -160; }
      else if (st === 'poster')     { dx = 0;        dy = -25;  }

      // Soft-normalized direction (-1..1, eases off with distance)
      const nx = dx / (Math.abs(dx) + 170);
      const ny = dy / (Math.abs(dy) + 170);

      const lerp = Math.min(1, dt * 9);
      p.px += (nx * 4.5 - p.px) * lerp;
      p.py += (ny * 3.4 - p.py) * lerp;
      p.fx += (nx * 6.0 - p.fx) * lerp;
      p.fy += (ny * 4.2 - p.fy) * lerp;
      p.hx += (nx * -8.0 - p.hx) * lerp;
      p.hy += (ny * -5.5 - p.hy) * lerp;
      p.ps += ((dist < 140 && m.has ? 1.14 : 1) - p.ps) * lerp;

      // Body lean: toward cursor + into direction of travel (visual space)
      const tiltT = nx * 4 + clamp(p.vel * 0.06, -8, 8);
      p.tilt += (tiltT - p.tilt) * Math.min(1, dt * 7);

      // Antenna: damped spring lagging behind motion & lean
      const antT = clamp(-p.vel * 0.22, -28, 28) - p.tilt * 0.9;
      p.antV += ((antT - p.ant) * 65 - p.antV * 7.5) * dt;
      p.ant  += p.antV * dt;

      // Jelly squash spring (impulses added on dash-land / click)
      p.sqV += (-p.sq * 95 - p.sqV * 8.5) * dt;
      p.sq  += p.sqV * dt;
      const sq = clamp(p.sq, -0.16, 0.2);

      // Mirror x-axis values when the svg is flipped
      const dir = facingRef.current === 'left' ? -1 : 1;
      const s = svg.style;
      s.setProperty('--m-px',  (p.px * dir).toFixed(2) + 'px');
      s.setProperty('--m-py',  p.py.toFixed(2) + 'px');
      s.setProperty('--m-fx',  (p.fx * dir).toFixed(2) + 'px');
      s.setProperty('--m-fy',  p.fy.toFixed(2) + 'px');
      s.setProperty('--m-hx',  (p.hx * dir).toFixed(2) + 'px');
      s.setProperty('--m-hy',  p.hy.toFixed(2) + 'px');
      s.setProperty('--m-gx',  (p.px * dir * -0.55).toFixed(2) + 'px');
      s.setProperty('--m-gy',  (p.py * -0.55).toFixed(2) + 'px');
      s.setProperty('--m-ps',  p.ps.toFixed(3));
      s.setProperty('--m-tilt', (p.tilt * dir).toFixed(2) + 'deg');
      s.setProperty('--m-ant', (clamp(p.ant, -34, 34) * dir).toFixed(2) + 'deg');
      s.setProperty('--m-sx',  (1 + sq).toFixed(3));
      s.setProperty('--m-sy',  (1 - sq).toFixed(3));
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  // ── Ambient wander: idle a while, stroll a while ──
  useEffect(() => {
    let alive = true, t;
    const loop = (mode) => {
      if (!alive) return;
      setAmbient(mode);
      const dur = mode === 'idle' ? 9000 + Math.random() * 6000 : 7000 + Math.random() * 5000;
      t = setTimeout(() => loop(mode === 'idle' ? 'walk' : 'idle'), dur);
    };
    loop('idle');
    return () => { alive = false; clearTimeout(t); };
  }, []);

  // ── Section watcher: play the scene of whichever section crosses mid-viewport ──
  useEffect(() => {
    const compute = () => {
      const mid = window.innerHeight * 0.5;
      let found = null;
      for (const [id, scene] of SECTION_STATE) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) { found = scene; break; }
      }
      setSectionState(found);
    };
    // capture phase: the page scrolls inside a wrapper div, and scroll events don't bubble
    document.addEventListener('scroll', compute, { capture: true, passive: true });
    window.addEventListener('resize', compute);
    compute();
    return () => {
      document.removeEventListener('scroll', compute, { capture: true });
      window.removeEventListener('resize', compute);
    };
  }, []);

  // ── Sleep after prolonged inactivity; wake with a hello hop ──
  useEffect(() => {
    const act = () => {
      lastActRef.current = Date.now();
      if (asleepRef.current) {
        asleepRef.current = false;
        setAsleep(false);
        phys.current.sqV -= 1.4;
        setGreetFlash(true);
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setGreetFlash(false), GREETING_DURATION);
      }
    };
    const events = ['mousemove', 'scroll', 'keydown', 'pointerdown', 'touchstart'];
    events.forEach(ev => document.addEventListener(ev, act, { capture: true, passive: true }));
    const iv = setInterval(() => {
      if (!asleepRef.current && Date.now() - lastActRef.current > SLEEP_AFTER) {
        asleepRef.current = true;
        setAsleep(true);
      }
    }, 3000);
    return () => {
      events.forEach(ev => document.removeEventListener(ev, act, { capture: true }));
      clearInterval(iv);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  // Walk RAF loop
  useEffect(() => {
    if (status !== 'walk') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setFacing('right'); // never leave the mirror flip on — prop text would render backwards
      return;
    }
    let target = pickTarget(), lastTime = null, paused = false, pauseTimer = null;

    function pickTarget() {
      const max = Math.max(window.innerWidth - SIZE - 40, 100);
      const t   = 40 + Math.random() * (max - 40);
      setFacing(t > xPosRef.current ? 'right' : 'left');
      return t;
    }
    function step(time) {
      if (paused) return;
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const cur = xPosRef.current, dx = target - cur;
      if (Math.abs(dx) < 4) {
        paused = true;
        phys.current.sqV += 1.1; // settle bounce on arrival
        pauseTimer = setTimeout(() => {
          target = pickTarget(); paused = false; lastTime = null;
          rafRef.current = requestAnimationFrame(step);
        }, 700 + Math.random() * 1000);
        return;
      }
      const move = Math.min(WALK_SPEED * dt, Math.abs(dx)) * Math.sign(dx);
      xPosRef.current = cur + move;
      setXPos(cur + move);
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (pauseTimer)     clearTimeout(pauseTimer);
    };
  }, [status]);

  // Scroll → dash back to origin
  useEffect(() => {
    let dashTimer = null;
    const handleScroll = () => {
      if (Math.abs(xPosRef.current - 28) < 2) return;
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      setDashing(true);
      setFacing('right');
      phys.current.sqV += 2.0; // speed-stretch as the dash launches
      xPosRef.current = 28;
      setXPos(28);
      if (dashTimer) clearTimeout(dashTimer);
      dashTimer = setTimeout(() => {
        setDashing(false);
        phys.current.sqV += 2.4; // landing squash
      }, 350);
    };
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true });
      if (dashTimer) clearTimeout(dashTimer);
    };
  }, []);

  // ── Chat agent layer: listen / think / program+tool / greeting, released by 'idle' ──
  useEffect(() => {
    const handle = (e) => {
      const { status, tool } = e.detail;
      if (greetTimer.current) clearTimeout(greetTimer.current);
      if (status === 'idle') {
        setAgentState(null);
      } else if (status === 'greeting') {
        setAgentState({ status: 'greeting', tool: null });
        phys.current.sqV -= 1.4;
        greetTimer.current = setTimeout(() => setAgentState(null), GREETING_DURATION);
      } else if (status === 'program') {
        setAgentState({ status: 'program', tool: (tool || '').replace(/_/g, '-') });
      } else {
        setAgentState({ status, tool: null }); // think, listen, …
      }
    };
    window.addEventListener('mascot-agent', handle);
    return () => window.removeEventListener('mascot-agent', handle);
  }, []);

  const handleClick = () => {
    phys.current.sqV -= 1.6; // tactile stretch-then-wobble on poke
    if (forceStatus || agentState) return;
    setGreetFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setGreetFlash(false), GREETING_DURATION);
  };

  return (
    <div className="mascot-root" style={{
      position: 'fixed', bottom: 24, left: xPos,
      width: SIZE, height: SIZE, zIndex: 9999, pointerEvents: 'none',
      transition: dashing ? 'left 0.28s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
    }}>
      <svg
        ref={svgRef}
        viewBox="0 0 200 240"
        width={SIZE} height={SIZE}
        onClick={handleClick}
        role="img" aria-label="Siva's mascot"
        className={`mascot-svg mascot-${status}${effectiveTool && status === 'program' ? ` mascot-tool-${effectiveTool}` : ''}`}
        style={{
          cursor: 'pointer', pointerEvents: 'auto',
          transform: facing === 'left' ? 'scaleX(-1)' : 'none',
          display: 'block', overflow: 'visible',
        }}
      >
        <defs>
          {/* Body — warm sphere lit from top-left */}
          <radialGradient id="m3dBody" cx="0.34" cy="0.27" r="0.9">
            <stop offset="0"    stopColor="#FFB067"/>
            <stop offset="0.35" stopColor="#F58A3C"/>
            <stop offset="0.72" stopColor="#E06F2E"/>
            <stop offset="1"    stopColor="#BE551E"/>
          </radialGradient>
          {/* Inner rim shading — darkens the sphere's far edge */}
          <radialGradient id="m3dRim" cx="0.42" cy="0.36" r="0.74">
            <stop offset="0.70" stopColor="rgba(0,0,0,0)"/>
            <stop offset="0.94" stopColor="rgba(140,58,8,0.26)"/>
            <stop offset="1"    stopColor="rgba(100,38,4,0.45)"/>
          </radialGradient>
          {/* Deep glossy eyes */}
          <radialGradient id="m3dEye" cx="0.35" cy="0.28" r="0.95">
            <stop offset="0"    stopColor="#4A5570"/>
            <stop offset="0.55" stopColor="#232B3D"/>
            <stop offset="1"    stopColor="#131A28"/>
          </radialGradient>
          {/* Antenna ball */}
          <radialGradient id="m3dAntBall" cx="0.35" cy="0.3" r="0.95">
            <stop offset="0"   stopColor="#FFC08A"/>
            <stop offset="0.5" stopColor="#F58A3C"/>
            <stop offset="1"   stopColor="#BE551E"/>
          </radialGradient>
          {/* Antenna glow halo */}
          <radialGradient id="m3dGlow">
            <stop offset="0"   stopColor="rgba(255,164,82,0.85)"/>
            <stop offset="1"   stopColor="rgba(255,164,82,0)"/>
          </radialGradient>
          {/* Soft contact shadow */}
          <radialGradient id="m3dShadowG">
            <stop offset="0"   stopColor="rgba(35,43,61,0.32)"/>
            <stop offset="0.7" stopColor="rgba(35,43,61,0.13)"/>
            <stop offset="1"   stopColor="rgba(35,43,61,0)"/>
          </radialGradient>
          <filter id="m3dSoft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4"/>
          </filter>

          {/* ── Prop materials ── */}
          <linearGradient id="m3dMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0"   stopColor="#4A5160"/>
            <stop offset="0.5" stopColor="#343B49"/>
            <stop offset="1"   stopColor="#22272F"/>
          </linearGradient>
          <linearGradient id="m3dMetalLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5A6270"/>
            <stop offset="1" stopColor="#3A404C"/>
          </linearGradient>
          <linearGradient id="m3dNavyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3B4763"/>
            <stop offset="1" stopColor="#1C2333"/>
          </linearGradient>
          <linearGradient id="m3dGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F0BC58"/>
            <stop offset="1" stopColor="#C08A2E"/>
          </linearGradient>
          <linearGradient id="m3dPaper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF"/>
            <stop offset="1" stopColor="#E9E4D9"/>
          </linearGradient>
          <linearGradient id="m3dParch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FAF2DC"/>
            <stop offset="1" stopColor="#E6D3A4"/>
          </linearGradient>
          <linearGradient id="m3dParchRoll" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0"   stopColor="#DEC895"/>
            <stop offset="0.5" stopColor="#F7EDD2"/>
            <stop offset="1"   stopColor="#D9C08C"/>
          </linearGradient>
          <linearGradient id="m3dScreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1A2536"/>
            <stop offset="1" stopColor="#0B111C"/>
          </linearGradient>
          <radialGradient id="m3dGlass" cx="0.35" cy="0.3" r="0.95">
            <stop offset="0"   stopColor="rgba(225,242,255,0.95)"/>
            <stop offset="0.6" stopColor="rgba(170,200,230,0.6)"/>
            <stop offset="1"   stopColor="rgba(120,155,195,0.4)"/>
          </radialGradient>
          <linearGradient id="m3dWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A97C4F"/>
            <stop offset="1" stopColor="#6E4E2C"/>
          </linearGradient>
          <linearGradient id="m3dPlaneW" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF"/>
            <stop offset="1" stopColor="#D5DAE1"/>
          </linearGradient>
        </defs>

        {/* Ground shadow — stays flat on the floor, outside the tilt/squash rig */}
        <ellipse className="mascot-shadow" cx="100" cy="196" rx="38" ry="6.5" fill="url(#m3dShadowG)" />

        {/* ── Ambient overlays — float free of body physics ── */}
        <g className="mascot-zzz">
          <text x="138" y="95"  fontSize="13" fill={C.body} fontWeight="bold" fontFamily="sans-serif" opacity="0">z</text>
          <text x="152" y="76"  fontSize="17" fill={C.body} fontWeight="bold" fontFamily="sans-serif" opacity="0">z</text>
          <text x="166" y="54"  fontSize="22" fill={C.body} fontWeight="bold" fontFamily="sans-serif" opacity="0">Z</text>
        </g>
        <g className="mascot-thought" opacity="0">
          <circle cx="166" cy="48" r="20" fill="#B9A88F" opacity="0.3" filter="url(#m3dSoft)"/>
          <circle cx="126" cy="92" r="5.5"  fill="url(#m3dPaper)" stroke="#E4D8C2" strokeWidth="1"/>
          <circle cx="142" cy="75" r="9"    fill="url(#m3dPaper)" stroke="#E4D8C2" strokeWidth="1"/>
          <circle cx="165" cy="47" r="19"   fill="url(#m3dPaper)" stroke="#E4D8C2" strokeWidth="1"/>
          {/* typing-indicator dots inside the bubble */}
          <circle className="m-think-dot" cx="155" cy="47" r="3" fill={C.body}/>
          <circle className="m-think-dot" cx="165" cy="47" r="3" fill={C.body}/>
          <circle className="m-think-dot" cx="175" cy="47" r="3" fill={C.body}/>
        </g>
        <g className="mascot-notes" opacity="0">
          <text x="148" y="88" fontSize="15" fill={C.note} fontFamily="sans-serif">♪</text>
          <text x="160" y="64" fontSize="19" fill={C.note} fontFamily="sans-serif">♫</text>
        </g>
        {/* Dance sparkles */}
        <g className="mascot-sparkles" fontFamily="sans-serif">
          <text x="38"  y="86"  fontSize="15" fill="#F59E0B" opacity="0">✦</text>
          <text x="156" y="58"  fontSize="12" fill="#F472B6" opacity="0">✦</text>
          <text x="168" y="118" fontSize="16" fill="#60A5FA" opacity="0">✦</text>
        </g>
        {/* Paper-plane wind streaks */}
        <g className="mascot-wind">
          <line x1="4"  y1="108" x2="34" y2="108" stroke="#9AA5B5" strokeWidth="3" strokeLinecap="round" opacity="0"/>
          <line x1="-2" y1="138" x2="26" y2="138" stroke="#9AA5B5" strokeWidth="3" strokeLinecap="round" opacity="0"/>
          <line x1="8"  y1="168" x2="36" y2="168" stroke="#9AA5B5" strokeWidth="3" strokeLinecap="round" opacity="0"/>
        </g>
        {/* Graduation confetti rain */}
        <g className="mascot-confetti">
          <rect x="48"  y="26" width="5" height="8" rx="1" fill="#F58A3C" opacity="0"/>
          <rect x="82"  y="18" width="5" height="8" rx="1" fill="#34D399" opacity="0"/>
          <rect x="118" y="24" width="5" height="8" rx="1" fill="#60A5FA" opacity="0"/>
          <rect x="148" y="16" width="5" height="8" rx="1" fill="#F472B6" opacity="0"/>
          <rect x="66"  y="14" width="5" height="8" rx="1" fill="#FBBF24" opacity="0"/>
          <rect x="134" y="30" width="5" height="8" rx="1" fill="#818CF8" opacity="0"/>
        </g>
        {/* Phone chat bubbles */}
        <g className="mascot-chat-bubbles">
          <g opacity="0">
            <rect x="150" y="98" width="26" height="17" rx="8.5" fill={C.body}/>
            <text x="163" y="110.5" fontSize="10" textAnchor="middle" fill="white" fontFamily="sans-serif">♥</text>
          </g>
          <g opacity="0">
            <rect x="160" y="76" width="24" height="15" rx="7.5" fill={C.navy}/>
            <circle cx="167" cy="83.5" r="1.6" fill="white"/>
            <circle cx="172" cy="83.5" r="1.6" fill="white"/>
            <circle cx="177" cy="83.5" r="1.6" fill="white"/>
          </g>
        </g>
        {/* Program code glyphs */}
        <g className="mascot-code-float" fontFamily="monospace" fontWeight="bold">
          <text x="52"  y="142" fontSize="12" fill="#F58A3C" opacity="0">{'{ }'}</text>
          <text x="128" y="130" fontSize="11" fill="#64748B" opacity="0">{'</>'}</text>
          <text x="86"  y="122" fontSize="10" fill="#34D399" opacity="0">{'fn()'}</text>
        </g>

        {/* ── Physics rig: everything below tilts + jelly-squashes together ── */}
        <g className="m3d-rig">

          {/* Paper plane — shaded folds with a crease highlight */}
          <g className="mascot-plane-prop" opacity="0">
            <path d="M8 210 L170 152 L105 218 Z"  fill="url(#m3dPlaneW)" stroke="#C4CAD3" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M8 210 L105 182 L170 152 Z"  fill="#FFFFFF" stroke="#C4CAD3" strokeWidth="1" strokeLinejoin="round"/>
            <path d="M105 182 L105 218 L72 208 Z" fill="#C9CFD8"/>
            <path d="M8 210 L170 152" stroke="white" strokeWidth="1.2" opacity="0.7"/>
          </g>

          {/* Arms — before body so body covers them when opacity:0 */}
          <g className="mascot-arm-left">
            <line x1="64" y1="126" x2="28" y2="154" stroke={C.dark} strokeWidth="10" strokeLinecap="round"/>
            <circle cx="24" cy="158" r="8" fill={C.dark}/>
            <circle cx="21.5" cy="155.5" r="2.2" fill="rgba(255,255,255,0.22)"/>
          </g>
          <g className="mascot-arm-right">
            <line x1="136" y1="126" x2="172" y2="154" stroke={C.dark} strokeWidth="10" strokeLinecap="round"/>
            <circle cx="176" cy="158" r="8" fill={C.dark}/>
            <circle cx="173.5" cy="155.5" r="2.2" fill="rgba(255,255,255,0.22)"/>
          </g>

          {/* Main character */}
          <g className="mascot-character">
            {/* Antenna — outer group carries the physics spring lag */}
            <g className="m3d-ant">
              <g className="mascot-antenna">
                <line x1="100" y1="60" x2="100" y2="34" stroke={C.dark} strokeWidth="5" strokeLinecap="round"/>
                <circle className="m3d-antglow" cx="100" cy="24" r="15" fill="url(#m3dGlow)" opacity="0"/>
                <circle cx="100" cy="24" r="8.5" fill="url(#m3dAntBall)"/>
                <circle cx="97" cy="21" r="2.6" fill="white" opacity="0.85"/>
              </g>
            </g>

            {/* Stubby legs */}
            <g className="mascot-leg-left">
              <line x1="88" y1="160" x2="86" y2="182" stroke={C.dark} strokeWidth="8.5" strokeLinecap="round"/>
              <ellipse cx="86" cy="185" rx="10.5" ry="5.5" fill={C.dark}/>
              <ellipse cx="83" cy="182.5" rx="3.5" ry="1.4" fill="rgba(255,255,255,0.16)"/>
            </g>
            <g className="mascot-leg-right">
              <line x1="112" y1="160" x2="114" y2="182" stroke={C.dark} strokeWidth="8.5" strokeLinecap="round"/>
              <ellipse cx="114" cy="185" rx="10.5" ry="5.5" fill={C.dark}/>
              <ellipse cx="111" cy="182.5" rx="3.5" ry="1.4" fill="rgba(255,255,255,0.16)"/>
            </g>

            {/* Body sphere: gradient fill + rim shade + bounce light + specular */}
            <circle cx="100" cy="115" r="55" fill="url(#m3dBody)"/>
            <circle cx="100" cy="115" r="55" fill="url(#m3dRim)"/>
            <ellipse cx="100" cy="153" rx="33" ry="13" fill="#FFB27A" opacity="0.16" filter="url(#m3dSoft)"/>
            <g className="m3d-hl">
              <ellipse cx="79" cy="90" rx="17" ry="11" fill="white" opacity="0.34"
                       filter="url(#m3dSoft)" transform="rotate(-25 79 90)"/>
              <circle cx="72" cy="85" r="4.5" fill="white" opacity="0.75"/>
            </g>

            {/* Face — parallax group shifts across the sphere toward the cursor */}
            <g className="m3d-face">
              <g className="mascot-eyes">
                <g className="m3d-pupils">
                  <ellipse cx="85"  cy="108" rx="8" ry="9.2" fill="url(#m3dEye)"/>
                  <ellipse cx="115" cy="108" rx="8" ry="9.2" fill="url(#m3dEye)"/>
                  <g className="m3d-glints">
                    <circle cx="82"    cy="104"   r="2.7" fill="white" opacity="0.95"/>
                    <circle cx="112"   cy="104"   r="2.7" fill="white" opacity="0.95"/>
                    <circle cx="88.5"  cy="112.5" r="1.3" fill="white" opacity="0.4"/>
                    <circle cx="118.5" cy="112.5" r="1.3" fill="white" opacity="0.4"/>
                  </g>
                </g>
              </g>
            </g>

            {/* Nightcap — sleep accessory, rides the body squash */}
            <g className="mascot-nightcap" opacity="0">
              <path d="M64 84 Q100 28 136 80 Q100 60 64 84 Z" fill="url(#m3dNavyGrad)"/>
              <path d="M74 70 Q100 42 126 66" stroke="rgba(255,255,255,0.10)" strokeWidth="4" fill="none" strokeLinecap="round"/>
              <path d="M64 84 Q100 60 136 80" stroke="#161C2B" strokeWidth="7" fill="none" strokeLinecap="round"/>
              <path d="M108 50 Q128 38 140 50" stroke="#28304A" strokeWidth="10" fill="none" strokeLinecap="round"/>
              <circle cx="144" cy="52" r="6.5" fill="#F5EDE0"/>
              <circle cx="142" cy="50" r="2"   fill="white" opacity="0.8"/>
            </g>

            {/* Headphones — listen accessory */}
            <g className="mascot-headphones" opacity="0">
              <path d="M58 98 Q100 40 142 98" stroke="#161C2B" strokeWidth="7.5" fill="none" strokeLinecap="round"/>
              <path d="M62 92 Q100 44 138 92" stroke="rgba(255,255,255,0.14)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <rect x="42"  y="92" width="16" height="30" rx="8" fill="url(#m3dNavyGrad)"/>
              <rect x="142" y="92" width="16" height="30" rx="8" fill="url(#m3dNavyGrad)"/>
              <rect x="45"  y="95" width="4.5" height="13" rx="2.25" fill="rgba(255,255,255,0.22)"/>
              <rect x="145" y="95" width="4.5" height="13" rx="2.25" fill="rgba(255,255,255,0.22)"/>
              <ellipse cx="50"  cy="118" rx="6" ry="3" fill="rgba(0,0,0,0.25)"/>
              <ellipse cx="150" cy="118" rx="6" ry="3" fill="rgba(0,0,0,0.25)"/>
            </g>

            {/* Bow tie — visible in experience state */}
            <g className="mascot-bowtie" opacity="0">
              <path d="M84 130 Q96 133 96 138 Q96 143 84 146 Q80 138 84 130 Z" fill="url(#m3dNavyGrad)"/>
              <path d="M116 130 Q104 133 104 138 Q104 143 116 146 Q120 138 116 130 Z" fill="url(#m3dNavyGrad)"/>
              <circle cx="100" cy="138" r="5" fill="url(#m3dNavyGrad)"/>
              <circle cx="98.5" cy="136.5" r="1.5" fill="rgba(255,255,255,0.4)"/>
              <path d="M85 132 Q93 134.5 94 137" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M115 132 Q107 134.5 106 137" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </g>
          </g>

          {/* Graduation hat — shaded navy with a gold button and tassel */}
          <g className="mascot-grad-hat" opacity="0">
            <ellipse cx="100" cy="64" rx="36" ry="9.5" fill="url(#m3dNavyGrad)"/>
            <ellipse cx="100" cy="62.5" rx="33" ry="7.5" fill="rgba(255,255,255,0.06)"/>
            <rect x="63" y="44" width="74" height="12" rx="3" fill="url(#m3dNavyGrad)"/>
            <path d="M66 46 L112 46 L100 50 L66 50 Z" fill="rgba(255,255,255,0.12)"/>
            <circle cx="100" cy="50" r="3" fill="url(#m3dGold)"/>
            <g className="mascot-tassel">
              <path d="M137 50 Q145 60 148 72" stroke="#D9A441" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <circle cx="148" cy="77" r="5" fill="url(#m3dGold)"/>
              <circle cx="146.4" cy="75.4" r="1.5" fill="rgba(255,255,255,0.5)"/>
            </g>
          </g>

          {/* Laptop — back of a metal lid with a mini mascot logo + screen light leaking out */}
          <g className="mascot-laptop" opacity="0">
            {/* screen glow spilling around the lid */}
            <rect x="54" y="147" width="92" height="42" rx="9" fill="#7FB4FF" opacity="0.22" filter="url(#m3dSoft)"/>
            {/* lid */}
            <rect x="56" y="150" width="88" height="38" rx="7" fill="url(#m3dMetal)"/>
            <rect x="56.5" y="150.5" width="87" height="37" rx="6.5" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
            <rect x="61" y="153" width="78" height="3" rx="1.5" fill="rgba(255,255,255,0.13)"/>
            {/* light leak at the lid's top edge (flickers while coding) */}
            <rect className="mascot-laptop-glass" x="60" y="148.5" width="80" height="2.5" rx="1.25" fill="#8FC1FF" opacity="0.5"/>
            {/* mini mascot logo */}
            <circle cx="100" cy="172" r="8" fill="url(#m3dAntBall)"/>
            <circle cx="97" cy="169" r="2" fill="white" opacity="0.7"/>
            <line x1="100" y1="164.5" x2="100" y2="160.5" stroke="#FBF8F2" strokeWidth="2" strokeLinecap="round" opacity="0.85"/>
            <circle cx="100" cy="158.5" r="2" fill="#FBF8F2" opacity="0.85"/>
            {/* hinge */}
            <rect x="58" y="186" width="84" height="3" rx="1.5" fill="#15181E"/>
            {/* keyboard deck */}
            <rect x="50" y="188" width="100" height="13" rx="5.5" fill="url(#m3dMetalLight)"/>
            <rect x="52" y="189" width="96" height="4" rx="2" fill="rgba(255,255,255,0.10)"/>
            <rect x="54" y="198" width="92" height="3.5" rx="1.75" fill="#191D24"/>
          </g>

          {/* Notepad + magic pencil — the writing state: the reply drafts itself */}
          <g className="mascot-pad-prop" opacity="0">
            <rect x="56" y="152" width="88" height="44" rx="6" fill="url(#m3dPaper)" stroke="#DCD8CE" strokeWidth="1"/>
            {/* spiral binding */}
            <circle cx="68"  cy="152" r="2.4" fill="none" stroke="#8B96AC" strokeWidth="1.6"/>
            <circle cx="84"  cy="152" r="2.4" fill="none" stroke="#8B96AC" strokeWidth="1.6"/>
            <circle cx="100" cy="152" r="2.4" fill="none" stroke="#8B96AC" strokeWidth="1.6"/>
            <circle cx="116" cy="152" r="2.4" fill="none" stroke="#8B96AC" strokeWidth="1.6"/>
            <circle cx="132" cy="152" r="2.4" fill="none" stroke="#8B96AC" strokeWidth="1.6"/>
            {/* already-written lines + the one being inked */}
            <rect x="64" y="163" width="52" height="3" rx="1.5" fill="#B9C0CE"/>
            <rect x="64" y="171" width="64" height="3" rx="1.5" fill="#B9C0CE"/>
            <rect className="mascot-ink-line" x="64" y="179" width="54" height="3" rx="1.5" fill="#F58A3C"/>
            <rect x="64" y="187" width="42" height="3" rx="1.5" fill="#E2E6ED"/>
          </g>
          <g className="mascot-pencil-prop" opacity="0">
            <g className="mascot-pencil-carriage">
              <g className="mascot-pencil">
                {/* body */}
                <line x1="122" y1="169" x2="134" y2="148" stroke="#F58A3C" strokeWidth="7" strokeLinecap="round"/>
                <line x1="124.5" y1="165.5" x2="132.5" y2="151.5" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"/>
                {/* wood taper + graphite tip */}
                <path d="M117.5 176.5 L120.8 168 L126 171 Z" fill="#E8C89A"/>
                <circle cx="118" cy="175.8" r="1.7" fill={C.dark}/>
                {/* metal band + eraser */}
                <line x1="132.6" y1="150.4" x2="134.3" y2="147.4" stroke="#C9CFD8" strokeWidth="7.4" strokeLinecap="butt"/>
                <line x1="134.8" y1="146.6" x2="136.4" y2="143.8" stroke="#F27FA5" strokeWidth="7" strokeLinecap="round"/>
              </g>
            </g>
          </g>

          {/* Poster sign — notice-board card on a wooden stake, planted for peek-a-boo */}
          <g className="mascot-poster-prop" opacity="0">
            <rect x="96.5" y="198" width="7" height="20" rx="3" fill="url(#m3dWood)"/>
            <rect x="47" y="140" width="112" height="68" rx="8" fill="#B9A88F" opacity="0.35" filter="url(#m3dSoft)"/>
            <rect x="44" y="136" width="112" height="68" rx="8" fill="url(#m3dPaper)" stroke="#E0D9CC" strokeWidth="1"/>
            {/* orange header band */}
            <path d="M44 144 Q44 136 52 136 L148 136 Q156 136 156 144 L156 151 L44 151 Z" fill="url(#m3dAntBall)"/>
            <circle cx="53"  cy="143.5" r="2.5" fill="#FBF8F2" opacity="0.85"/>
            <circle cx="147" cy="143.5" r="2.5" fill="#FBF8F2" opacity="0.85"/>
            <text x="100" y="172" fontSize="13" textAnchor="middle" fill={C.dark}
                  fontFamily="sans-serif" fontWeight="bold">That's</text>
            <text x="100" y="190" fontSize="13" textAnchor="middle" fill={C.body}
                  fontFamily="sans-serif" fontWeight="bold">me! 👋</text>
          </g>

          {/* Briefcase — navy leather with stitching and gold hardware */}
          <g className="mascot-briefcase-prop" opacity="0">
            <path d="M149 162 Q161 149 173 162" stroke="#151B29" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
            <path d="M150 162 Q161 151 172 162" stroke="#3D4A6B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <rect x="136" y="161" width="50" height="38" rx="6" fill="url(#m3dNavyGrad)"/>
            <rect x="138" y="163" width="46" height="4" rx="2" fill="rgba(255,255,255,0.12)"/>
            {/* flap seam + stitches */}
            <line x1="136" y1="177" x2="186" y2="177" stroke="#141A28" strokeWidth="2"/>
            <line x1="140" y1="173.5" x2="182" y2="173.5" stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeDasharray="3 2.5"/>
            {/* gold clasps + lock */}
            <rect x="145" y="173" width="9"  height="8"  rx="2" fill="url(#m3dGold)"/>
            <rect x="168" y="173" width="9"  height="8"  rx="2" fill="url(#m3dGold)"/>
            <rect x="157" y="172" width="8"  height="10" rx="2" fill="url(#m3dGold)"/>
            <circle cx="161" cy="177" r="1.5" fill="#7A5A1E"/>
            {/* bottom shade */}
            <path d="M136 192 L186 192 L186 193 Q186 199 180 199 L142 199 Q136 199 136 193 Z" fill="rgba(0,0,0,0.28)"/>
          </g>

          {/* Scroll diploma — shaded parchment with a wax seal */}
          <g className="mascot-scroll-prop" opacity="0">
            <rect x="142" y="144" width="32" height="48" rx="2" fill="url(#m3dParch)"/>
            <rect x="142" y="144" width="5"  height="48" fill="rgba(140,110,60,0.18)"/>
            <rect x="169" y="144" width="5"  height="48" fill="rgba(140,110,60,0.18)"/>
            <ellipse cx="158" cy="144" rx="17" ry="6" fill="url(#m3dParchRoll)" stroke="#C8A96A" strokeWidth="1"/>
            <ellipse cx="158" cy="192" rx="17" ry="6" fill="url(#m3dParchRoll)" stroke="#C8A96A" strokeWidth="1"/>
            <line x1="149" y1="158" x2="167" y2="158" stroke="#C8A96A" strokeWidth="1.5"/>
            <line x1="149" y1="166" x2="167" y2="166" stroke="#C8A96A" strokeWidth="1.5"/>
            <line x1="149" y1="174" x2="163" y2="174" stroke="#C8A96A" strokeWidth="1.5"/>
            {/* red wax seal */}
            <circle cx="166" cy="184" r="5.5" fill="#C0392B"/>
            <circle cx="166" cy="184" r="3.2" fill="none" stroke="#8E2B20" strokeWidth="1"/>
            <circle cx="164.3" cy="182.3" r="1.6" fill="rgba(255,255,255,0.4)"/>
          </g>

          {/* Phone — gradient body with a live chat conversation on screen */}
          <g className="mascot-phone-prop" opacity="0">
            <rect x="140" y="134" width="30" height="54" rx="8" fill="url(#m3dNavyGrad)"/>
            <rect x="140.8" y="134.8" width="28.4" height="52.4" rx="7.4" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1"/>
            <rect x="143" y="140" width="24" height="42" rx="4" fill="url(#m3dScreen)"/>
            {/* camera dot */}
            <circle cx="155" cy="137.3" r="1.3" fill="#0B0F17"/>
            <circle cx="155.4" cy="136.9" r="0.4" fill="#4A6FA5"/>
            {/* chat: incoming / outgoing / incoming */}
            <rect x="145" y="144" width="14" height="7" rx="3.5" fill="#33415C"/>
            <rect x="151" y="154" width="14" height="7" rx="3.5" fill="url(#m3dAntBall)"/>
            <rect x="145" y="164" width="11" height="7" rx="3.5" fill="#33415C"/>
            {/* input bar with send dot */}
            <rect x="145" y="174" width="20" height="5" rx="2.5" fill="#22304A"/>
            <circle cx="162.5" cy="176.5" r="1.7" fill="#F58A3C"/>
            {/* edge shine */}
            <rect x="141.4" y="141" width="1.4" height="28" rx="0.7" fill="rgba(255,255,255,0.25)"/>
          </g>

          {/* ── Agent tool props (visible only when mascot-tool-* class is set) ── */}

          {/* Magnifying glass — metal rim, real glass lens with shine */}
          <g className="mascot-search-prop" opacity="0">
            <line x1="173" y1="115" x2="190" y2="132" stroke="#151B29" strokeWidth="6.5" strokeLinecap="round"/>
            <line x1="174" y1="116" x2="189" y2="131" stroke="#3D4A6B" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="161" cy="103" r="15" fill="url(#m3dGlass)"/>
            <circle cx="161" cy="103" r="17.5" fill="none" stroke="#151B29" strokeWidth="5.5"/>
            <circle cx="161" cy="103" r="15.5" fill="none" stroke="#3D4A6B" strokeWidth="1.5"/>
            <path d="M152 97 L157 91" stroke="white" strokeWidth="3"   strokeLinecap="round" opacity="0.8"/>
            <path d="M151 104 L161 93" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.45"/>
          </g>

          {/* Clipboard — wooden board, metal clip, profile card with avatar + verified badge */}
          <g className="mascot-doc-prop" opacity="0">
            <rect x="141" y="105" width="50" height="60" rx="5" fill="url(#m3dWood)"/>
            <rect x="145" y="112" width="42" height="49" rx="3" fill="url(#m3dPaper)"/>
            <rect x="153" y="100" width="26" height="10" rx="4" fill="url(#m3dMetalLight)"/>
            <rect x="157" y="103" width="18" height="4"  rx="2" fill="rgba(0,0,0,0.3)"/>
            {/* mini profile: avatar, name, role */}
            <circle cx="154" cy="122" r="5.5" fill="url(#m3dAntBall)"/>
            <circle cx="152.3" cy="120.3" r="1.4" fill="white" opacity="0.7"/>
            <rect x="163" y="117" width="20" height="3.5" rx="1.75" fill="#33415C"/>
            <rect x="163" y="123.5" width="14" height="3" rx="1.5" fill="#C4CBD8"/>
            <rect x="149" y="134" width="34" height="3" rx="1.5" fill="#D8DCE4"/>
            <rect x="149" y="141" width="28" height="3" rx="1.5" fill="#D8DCE4"/>
            <rect x="149" y="148" width="32" height="3" rx="1.5" fill="#D8DCE4"/>
            {/* verified badge */}
            <circle cx="181" cy="154" r="4.5" fill="#34D399"/>
            <path d="M179 154 L180.5 155.7 L183.3 152.4" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          </g>

          {/* Envelope — shaded paper with a glossy orange wax seal */}
          <g className="mascot-envelope-prop" opacity="0">
            <rect x="136" y="114" width="54" height="40" rx="6" fill="url(#m3dPaper)" stroke="#DCD4C4" strokeWidth="1"/>
            <path d="M136 121 L163 141 L190 121 L190 118 Q190 114 184 114 L142 114 Q136 114 136 118 Z" fill="rgba(160,140,110,0.18)"/>
            <path d="M137 119 L163 139 L189 119" fill="none" stroke="#C9BFA9" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="163" cy="137" r="7" fill="url(#m3dAntBall)"/>
            <circle cx="160.6" cy="134.6" r="2" fill="white" opacity="0.6"/>
          </g>

          {/* Terminal window — titlebar, traffic lights, syntax-colored code */}
          <g className="mascot-code-prop" opacity="0">
            <rect x="139" y="111" width="56" height="46" rx="8" fill="#2F3A4E" opacity="0.45" filter="url(#m3dSoft)"/>
            <rect x="137" y="108" width="56" height="46" rx="8" fill="url(#m3dScreen)"/>
            <path d="M137 119 L137 116 Q137 108 145 108 L185 108 Q193 108 193 116 L193 119 Z" fill="#243048"/>
            <circle cx="145" cy="113.5" r="2.2" fill="#EF4444"/>
            <circle cx="152" cy="113.5" r="2.2" fill="#F59E0B"/>
            <circle cx="159" cy="113.5" r="2.2" fill="#22C55E"/>
            {/* code lines */}
            <rect x="143" y="125" width="17" height="3" rx="1.5" fill="#F58A3C"/>
            <rect x="163" y="125" width="12" height="3" rx="1.5" fill="#60A5FA"/>
            <rect x="148" y="132" width="22" height="3" rx="1.5" fill="#34D399"/>
            <rect x="148" y="139" width="15" height="3" rx="1.5" fill="#8B96AC"/>
            <rect x="143" y="146" width="10" height="3" rx="1.5" fill="#F472B6"/>
            <rect x="156" y="145.5" width="5" height="4" rx="1" fill="#F58A3C" opacity="0.9"/>
          </g>

          {/* Tour map — folded parchment with a river, dashed route and destination pin */}
          <g className="mascot-map-prop" opacity="0">
            <rect x="136" y="106" width="56" height="50" rx="4" fill="url(#m3dParch)" stroke="#D3B984" strokeWidth="1.5"/>
            <rect x="154" y="106" width="19" height="50" fill="rgba(140,110,60,0.10)"/>
            {/* river */}
            <path d="M138 148 Q147 139 154 145 Q161 151 168 143" stroke="#8FBFE8" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
            {/* route */}
            <path d="M144 149 Q151 128 165 132 Q179 136 181 120" stroke="#F58A3C" strokeWidth="2.5" strokeDasharray="4 3" fill="none" strokeLinecap="round"/>
            <circle cx="144" cy="149" r="3" fill="#33415C"/>
            {/* destination pin */}
            <path d="M182 117 L182 124" stroke="#BE551E" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="182" cy="113" r="5.5" fill="url(#m3dAntBall)"/>
            <circle cx="180.2" cy="111.2" r="1.6" fill="white" opacity="0.7"/>
          </g>

          {/* Resume — designed CV: folded corner, avatar header, accent divider, skill pills */}
          <g className="mascot-resume-prop" opacity="0">
            <rect x="142" y="106" width="46" height="58" rx="4" fill="url(#m3dPaper)" stroke="#DCD8CE" strokeWidth="1"/>
            <path d="M178 106 L188 116 L178 116 Z" fill="#E2DDD2"/>
            <path d="M178 106 L188 116" stroke="#CFC9BC" strokeWidth="1"/>
            {/* header */}
            <circle cx="152" cy="118" r="6" fill="url(#m3dAntBall)"/>
            <circle cx="150.2" cy="116.2" r="1.5" fill="white" opacity="0.7"/>
            <rect x="161" y="113" width="18" height="4" rx="2" fill="#33415C"/>
            <rect x="161" y="120" width="12" height="3" rx="1.5" fill="#B9C0CE"/>
            {/* accent divider */}
            <rect x="148" y="130" width="34" height="2.5" rx="1.25" fill="#F58A3C"/>
            {/* body lines */}
            <rect x="148" y="137" width="32" height="3" rx="1.5" fill="#D8DCE4"/>
            <rect x="148" y="143" width="26" height="3" rx="1.5" fill="#D8DCE4"/>
            <rect x="148" y="149" width="30" height="3" rx="1.5" fill="#D8DCE4"/>
            {/* skill pills */}
            <rect x="148" y="156" width="13" height="5" rx="2.5" fill="#FBE3D2"/>
            <rect x="163" y="156" width="13" height="5" rx="2.5" fill="#DCE8FB"/>
          </g>

        </g>{/* /m3d-rig */}

      </svg>

      <style>{`
        /* ── Fake-3D layers (driven by CSS vars from the physics loop) ── */
        .m3d-rig {
          transform-box: view-box;
          transform-origin: 100px 190px;
          transform: rotate(var(--m-tilt, 0deg)) scale(var(--m-sx, 1), var(--m-sy, 1));
        }
        .m3d-ant {
          transform-box: view-box;
          transform-origin: 100px 60px;
          transform: rotate(var(--m-ant, 0deg));
          transition: opacity 0.35s ease;
        }
        .m3d-face   { transform: translate(var(--m-fx, 0px), var(--m-fy, 0px)); }
        .m3d-pupils {
          transform-box: fill-box; transform-origin: 50% 50%;
          transform: translate(var(--m-px, 0px), var(--m-py, 0px)) scale(var(--m-ps, 1));
        }
        .m3d-glints { transform: translate(var(--m-gx, 0px), var(--m-gy, 0px)); }
        .m3d-hl     { transform: translate(var(--m-hx, 0px), var(--m-hy, 0px)); }
        .m3d-antglow{ transform-box: fill-box; transform-origin: 50% 50%; }

        /* ── Transform origins ── */
        .mascot-character { transform-box:fill-box; transform-origin:50% 100%; }
        .mascot-antenna   { transform-box:fill-box; transform-origin:50% 100%; }
        .mascot-leg-left  { transform-box:fill-box; transform-origin:50%  0%;  }
        .mascot-leg-right { transform-box:fill-box; transform-origin:50%  0%;  }
        .mascot-eyes      { transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-shadow    { transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-zzz text  { transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-thought   { transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-notes text{ transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-sparkles text    { transform-box:fill-box; transform-origin:50% 50%; }
        .mascot-wind line        { transform-box:fill-box; transform-origin:50% 50%; }
        .mascot-confetti rect    { transform-box:fill-box; transform-origin:50% 50%; }
        .mascot-chat-bubbles g   { transform-box:fill-box; transform-origin:50% 50%; }
        .mascot-code-float text  { transform-box:fill-box; transform-origin:50% 50%; }
        .mascot-laptop    { transform-box:fill-box; transform-origin:50% 0%;   }
        .mascot-pad-prop  { transform-box:fill-box; transform-origin:50% 0%;   }
        .mascot-pencil-prop { transform-box:fill-box; transform-origin:50% 100%; }
        .mascot-pencil    { transform-box:view-box; transform-origin:118px 176px; }
        .mascot-ink-line  { transform-box:fill-box; transform-origin:0% 50%;   }
        .m-think-dot      { transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-grad-hat  { transform-box:fill-box; transform-origin:50% 100%; }
        .mascot-tassel    { transform-box:view-box; transform-origin:137px 50px; }
        .mascot-bowtie    { transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-nightcap  { transform-box:fill-box; transform-origin:50% 100%; }
        .mascot-headphones{ transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-poster-prop    { transform-box:fill-box; transform-origin:50% 100%; }
        .mascot-briefcase-prop { transform-box:fill-box; transform-origin:50% 6%;  }
        .mascot-plane-prop     { transform-box:fill-box; transform-origin:50% 100%; }
        .mascot-scroll-prop    { transform-box:fill-box; transform-origin:0%  0%; }
        .mascot-phone-prop     { transform-box:fill-box; transform-origin:0%  0%; }

        /*
          Arms: invisible by default, at natural hanging position.
          opacity and transform kept on SEPARATE animations — no property conflict.
        */
        .mascot-arm-left {
          transform-box:fill-box; transform-origin:100% 0%;
          opacity:0; transition:opacity 0.3s ease-out;
        }
        .mascot-arm-right {
          transform-box:fill-box; transform-origin:0% 0%;
          opacity:0; transition:opacity 0.3s ease-out;
        }

        .mascot-eyes { animation:mascotBlink 4.5s ease-in-out infinite; }

        /* ══════════════ STATES ══════════════ */

        /* ── IDLE — breathing, weight shifts, a curious little pop ── */
        .mascot-idle .mascot-character { animation:mascotIdleLife   5.6s ease-in-out infinite; }
        .mascot-idle .mascot-antenna   { animation:mascotAntCurious 5.6s ease-in-out infinite; }

        /* ── WALK — scampering jelly trot ── */
        .mascot-walk .mascot-character { animation:mascotScamper 0.5s  ease-in-out infinite; }
        .mascot-walk .mascot-antenna   { animation:mascotAntWalk 0.5s  ease-in-out infinite; }
        .mascot-walk .mascot-leg-left  { animation:mascotLegRun  0.25s ease-in-out infinite; }
        .mascot-walk .mascot-leg-right { animation:mascotLegRun  0.25s ease-in-out infinite reverse; }
        .mascot-walk .mascot-shadow    { animation:mascotShadowW 0.5s  ease-in-out infinite; }

        /* ── WAVE — both arms, whole-body enthusiasm ── */
        .mascot-wave .mascot-character { animation:mascotWaveBounce 0.75s ease-in-out infinite; }
        .mascot-wave .mascot-antenna   { animation:mascotAntExcited 0.75s ease-in-out infinite; }
        .mascot-wave .mascot-arm-right {
          animation:
            mascotFadeIn 0.25s ease-out    0s    1 forwards,
            mascotWaveR  1.5s  ease-in-out 0.1s  infinite;
        }
        .mascot-wave .mascot-arm-left {
          animation:
            mascotFadeIn 0.25s ease-out    0s    1 forwards,
            mascotWaveL  1.5s  ease-in-out 0.85s infinite;
        }

        /* ── SLEEP — melts into a puddle, nightcap on, antenna tucked ── */
        .mascot-sleep .mascot-character { animation:mascotSlBreath 4.4s ease-in-out infinite; }
        .mascot-sleep .m3d-ant          { opacity:0; }
        .mascot-sleep .mascot-eyes      { animation:mascotEyeClose 0.5s ease-out forwards; }
        .mascot-sleep .mascot-nightcap  { animation:mascotFadeIn   0.5s ease-out 0.15s 1 forwards; }
        .mascot-sleep .mascot-zzz text:nth-child(1){ animation:mascotZzz 3s ease-in-out 0.0s infinite; }
        .mascot-sleep .mascot-zzz text:nth-child(2){ animation:mascotZzz 3s ease-in-out 0.8s infinite; }
        .mascot-sleep .mascot-zzz text:nth-child(3){ animation:mascotZzz 3s ease-in-out 1.6s infinite; }

        /* ── THINK — hand on chin, focused eyes, big typing-dots thought bubble ── */
        .mascot-think .mascot-character { animation:mascotPonderBob 2.4s ease-in-out infinite; }
        .mascot-think .mascot-antenna   { animation:mascotAntTap    1.1s ease-in-out infinite; }
        .mascot-think .mascot-eyes      { animation:mascotFocusEyes 4.5s ease-in-out infinite; }
        .mascot-think .m3d-antglow      { animation:mascotGlowPulse 1.1s ease-in-out infinite; }
        .mascot-think .mascot-thought {
          animation:
            mascotThoughtIn    0.35s ease-out    0s   1 forwards,
            mascotThoughtFloat 2.6s  ease-in-out 0.4s infinite;
        }
        .mascot-think .m-think-dot              { animation:mascotDotPulse 1.2s ease-in-out infinite; }
        .mascot-think .m-think-dot:nth-child(6) { animation-delay:0.2s; }
        .mascot-think .m-think-dot:nth-child(7) { animation-delay:0.4s; }
        .mascot-think .mascot-arm-left {
          animation:
            mascotFadeIn    0.3s  ease-out    0s   1 forwards,
            mascotChinRaise 0.5s  ease-out    0.1s 1 forwards,
            mascotChinTap   1.8s  ease-in-out 0.7s infinite;
        }

        /* ── WRITING — the reply drafts itself on a notepad with a magic pencil ── */
        .mascot-writing .mascot-character { animation:mascotProgLean  0.8s ease-in-out infinite; }
        .mascot-writing .mascot-antenna   { animation:mascotAntTap    1.1s ease-in-out infinite; }
        .mascot-writing .m3d-antglow      { animation:mascotGlowPulse 0.9s ease-in-out infinite; }
        .mascot-writing .mascot-pad-prop    { animation:mascotLaptopIn 0.4s ease-out 0s   1 forwards; }
        .mascot-writing .mascot-pencil-prop { animation:mascotPropIn   0.5s ease-out 0.2s 1 forwards; }
        .mascot-writing .mascot-pencil-carriage { animation:mascotPenCarriage 1.6s  linear      0.7s infinite; }
        .mascot-writing .mascot-pencil          { animation:mascotPenWiggle   0.16s ease-in-out 0.7s infinite; }
        .mascot-writing .mascot-ink-line        { animation:mascotInkGrow     1.6s  linear      0.7s infinite; }
        .mascot-writing .mascot-sparkles text:nth-child(1){ animation:mascotSparkle 2.2s ease-in-out 0.8s infinite; }
        .mascot-writing .mascot-sparkles text:nth-child(3){ animation:mascotSparkle 2.2s ease-in-out 1.9s infinite; }

        /* ── LISTEN — headphones on, DJ groove ── */
        .mascot-listen .mascot-character  { animation:mascotGroove    1.2s ease-in-out infinite; }
        .mascot-listen .mascot-antenna    { animation:mascotAntListen 0.6s ease-in-out infinite; }
        .mascot-listen .mascot-headphones { animation:mascotFadeIn    0.35s ease-out 1 forwards; }
        .mascot-listen .m3d-antglow       { animation:mascotGlowPulse 1.2s ease-in-out infinite; }
        .mascot-listen .mascot-notes text:nth-child(1){ animation:mascotNote 2.4s ease-in-out 0.0s infinite; }
        .mascot-listen .mascot-notes text:nth-child(2){ animation:mascotNote 2.4s ease-in-out 1.2s infinite; }

        /* ── DANCE — 4-beat routine with a big finale jump ── */
        .mascot-dance .mascot-character  { animation:mascotDanceJam  2.2s ease-in-out infinite; }
        .mascot-dance .mascot-antenna    { animation:mascotAntDance  0.55s ease-in-out infinite; }
        .mascot-dance .mascot-leg-left   { animation:mascotLeg       0.55s ease-in-out infinite; }
        .mascot-dance .mascot-leg-right  { animation:mascotLeg       0.55s ease-in-out infinite reverse; }
        .mascot-dance .mascot-shadow     { animation:mascotShadowJam 2.2s ease-in-out infinite; }
        .mascot-dance .m3d-antglow       { animation:mascotGlowPulse 0.55s ease-in-out infinite; }
        .mascot-dance .mascot-arm-left {
          animation:
            mascotFadeIn     0.35s ease-out    0s   1 forwards,
            mascotDanceLoopL 0.55s ease-in-out 0.1s infinite;
        }
        .mascot-dance .mascot-arm-right {
          animation:
            mascotFadeIn     0.35s ease-out    0s    1 forwards,
            mascotDanceLoopR 0.55s ease-in-out 0.375s infinite;
        }
        .mascot-dance .mascot-sparkles text:nth-child(1){ animation:mascotSparkle 1.5s ease-in-out 0.0s infinite; }
        .mascot-dance .mascot-sparkles text:nth-child(2){ animation:mascotSparkle 1.5s ease-in-out 0.5s infinite; }
        .mascot-dance .mascot-sparkles text:nth-child(3){ animation:mascotSparkle 1.5s ease-in-out 1.0s infinite; }

        /* ── PROGRAM — hunched typing, code floating off the screen ── */
        .mascot-program .mascot-character { animation:mascotProgLean 0.6s ease-in-out infinite; }
        .mascot-program .mascot-antenna   { animation:mascotAntIdle  3.2s ease-in-out infinite; }
        .mascot-program .m3d-antglow      { animation:mascotGlowPulse 1.1s ease-in-out infinite; }
        .mascot-program .mascot-arm-left {
          animation:
            mascotFadeIn       0.3s  ease-out   0s    1 forwards,
            mascotProgDeployL  0.55s ease-out   0.3s  1 forwards,
            mascotTypeLoopL    0.45s ease-in-out 0.85s infinite;
        }
        .mascot-program .mascot-arm-right {
          animation:
            mascotFadeIn       0.3s  ease-out   0s    1 forwards,
            mascotProgDeployR  0.55s ease-out   0.3s  1 forwards,
            mascotTypeLoopR    0.45s ease-in-out 0.85s infinite;
        }
        .mascot-program .mascot-laptop       { animation:mascotLaptopIn   0.4s ease-out 0s forwards; }
        .mascot-program .mascot-laptop-glass { animation:mascotScreenGlow 1.6s ease-in-out infinite; }
        .mascot-program .mascot-code-float text:nth-child(1){ animation:mascotCodeUp 2.2s ease-out 0.6s infinite; }
        .mascot-program .mascot-code-float text:nth-child(2){ animation:mascotCodeUp 2.2s ease-out 1.3s infinite; }
        .mascot-program .mascot-code-float text:nth-child(3){ animation:mascotCodeUp 2.2s ease-out 2.0s infinite; }

        /* ── GREETING — anticipation hop, double-arm hello, happy squint ── */
        .mascot-greeting .mascot-character { animation:mascotHop         1s   ease-in-out 1; }
        .mascot-greeting .mascot-antenna   { animation:mascotAntGreet    1s   ease-in-out 1; }
        .mascot-greeting .mascot-shadow    { animation:mascotShadowHop   1s   ease-in-out 1; }
        .mascot-greeting .mascot-eyes      { animation:mascotHappySquint 1.4s ease-in-out 1; }
        .mascot-greeting .mascot-arm-right {
          animation:
            mascotFadeIn    0.2s ease-out    0s   1 forwards,
            mascotGreetWave 1.3s ease-in-out 0.1s 1 forwards;
        }
        .mascot-greeting .mascot-arm-left {
          animation:
            mascotFadeIn    0.2s ease-out    0s   1 forwards,
            mascotGreetLift 1.3s ease-in-out 0.1s 1 forwards;
        }

        /* ── POSTER — sign planted, peek-a-boo from behind it ── */
        .mascot-poster .mascot-character   { animation:mascotPeek       4.6s ease-in-out infinite; }
        .mascot-poster .mascot-shadow      { animation:mascotPeekShadow 4.6s ease-in-out infinite; }
        .mascot-poster .mascot-antenna     { animation:mascotAntExcited 0.8s ease-in-out infinite; }
        .mascot-poster .mascot-poster-prop { animation:mascotPropIn     0.5s ease-out 0.1s 1 forwards; }

        /* ── EXPERIENCE — proud strut, swinging briefcase, bow tie pop ── */
        .mascot-experience .mascot-character { animation:mascotStrut    2.4s ease-in-out infinite; }
        .mascot-experience .mascot-antenna   { animation:mascotAntProud 3.6s ease-in-out infinite; }
        .mascot-experience .mascot-arm-right {
          animation:
            mascotFadeIn        0.3s  ease-out 0s   1 forwards,
            mascotBriefcaseHold 0.45s ease-out 0.2s 1 forwards;
        }
        .mascot-experience .mascot-briefcase-prop {
          animation:
            mascotPropIn    0.5s ease-out     0.3s 1 forwards,
            mascotCaseSwing 2.4s ease-in-out  0.9s infinite;
        }
        .mascot-experience .mascot-bowtie { animation:mascotBowtiePop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s 1 forwards; }

        /* ── PAPERPLANE — surfing the plane through the wind ── */
        .mascot-paperplane .mascot-character { animation:mascotSoar    3.2s ease-in-out 0.5s infinite; }
        .mascot-paperplane .mascot-antenna   { animation:mascotAntWave 2s   ease-in-out infinite; }
        .mascot-paperplane .mascot-arm-left {
          animation:
            mascotFadeIn    0.35s ease-out 0s   1 forwards,
            mascotPlaneArmL 0.5s  ease-out 0.2s 1 forwards;
        }
        .mascot-paperplane .mascot-arm-right {
          animation:
            mascotFadeIn    0.35s ease-out 0s   1 forwards,
            mascotPlaneArmR 0.5s  ease-out 0.2s 1 forwards;
        }
        .mascot-paperplane .mascot-plane-prop {
          animation:
            mascotPlaneIn 0.5s ease-out     0s   1 forwards,
            mascotSoar    3.2s ease-in-out  0.5s infinite;
        }
        .mascot-paperplane .mascot-shadow { animation:mascotShadowFly 3.2s ease-in-out 0.5s infinite; }
        .mascot-paperplane .mascot-wind line:nth-child(1){ animation:mascotWind 1.2s linear 0.0s infinite; }
        .mascot-paperplane .mascot-wind line:nth-child(2){ animation:mascotWind 1.2s linear 0.4s infinite; }
        .mascot-paperplane .mascot-wind line:nth-child(3){ animation:mascotWind 1.2s linear 0.8s infinite; }

        /* ── GRADUATION — confetti, swinging tassel, proud chest-up ── */
        .mascot-graduation .mascot-character { animation:mascotProudRise 3s   ease-in-out infinite; }
        .mascot-graduation .mascot-antenna   { animation:mascotAntProud  3.6s ease-in-out infinite; }
        .mascot-graduation .mascot-arm-right {
          animation:
            mascotFadeIn     0.3s  ease-out 0s    1 forwards,
            mascotScrollHold 0.45s ease-out 0.25s 1 forwards;
        }
        .mascot-graduation .mascot-grad-hat    { animation:mascotHatIn       0.55s ease-out 0.1s 1 forwards; }
        .mascot-graduation .mascot-tassel      { animation:mascotTasselSwing 1.8s  ease-in-out 0.7s infinite; }
        .mascot-graduation .mascot-scroll-prop { animation:mascotPropIn      0.5s  ease-out 0.3s 1 forwards; }
        .mascot-graduation .mascot-confetti rect:nth-child(1){ animation:mascotConfettiFall 2.4s linear 0.0s infinite; }
        .mascot-graduation .mascot-confetti rect:nth-child(2){ animation:mascotConfettiFall 2.4s linear 0.4s infinite; }
        .mascot-graduation .mascot-confetti rect:nth-child(3){ animation:mascotConfettiFall 2.4s linear 0.8s infinite; }
        .mascot-graduation .mascot-confetti rect:nth-child(4){ animation:mascotConfettiFall 2.4s linear 1.2s infinite; }
        .mascot-graduation .mascot-confetti rect:nth-child(5){ animation:mascotConfettiFall 2.4s linear 1.6s infinite; }
        .mascot-graduation .mascot-confetti rect:nth-child(6){ animation:mascotConfettiFall 2.4s linear 2.0s infinite; }

        /* ── PHONE — texting: thumb taps, chat bubbles, antenna ping ── */
        .mascot-phone .mascot-character { animation:mascotBreath   2.6s ease-in-out infinite; }
        .mascot-phone .mascot-antenna   { animation:mascotAntIdle  3.2s ease-in-out infinite; }
        .mascot-phone .m3d-antglow      { animation:mascotGlowPing 2.2s ease-out 0.8s infinite; }
        .mascot-phone .mascot-arm-right {
          animation:
            mascotFadeIn    0.3s  ease-out 0s   1 forwards,
            mascotPhoneHold 0.45s ease-out 0.2s 1 forwards;
        }
        .mascot-phone .mascot-phone-prop {
          animation:
            mascotPropIn   0.5s ease-out    0.25s 1 forwards,
            mascotPhoneTap 2.2s ease-in-out 0.9s  infinite;
        }
        .mascot-phone .mascot-chat-bubbles g:nth-child(1){ animation:mascotBubbleUp 2.6s ease-out 1.0s infinite; }
        .mascot-phone .mascot-chat-bubbles g:nth-child(2){ animation:mascotBubbleUp 2.6s ease-out 2.3s infinite; }

        /* ══════════════ KEYFRAMES ══════════════ */

        @keyframes mascotFadeIn { from{opacity:0;} to{opacity:1;} }

        @keyframes mascotBlink {
          0%,16%,28%,100%{transform:scaleY(1);}
          20%            {transform:scaleY(0.08);}
        }
        @keyframes mascotHappySquint {
          0%,100%  {transform:scaleY(1);}
          25%,75%  {transform:scaleY(0.25);}
        }
        @keyframes mascotEyeClose { to{transform:scaleY(0.08);} }

        @keyframes mascotGlowPulse {
          0%,100% {opacity:0.12; transform:scale(0.85);}
          50%     {opacity:0.7;  transform:scale(1.18);}
        }
        @keyframes mascotGlowPing {
          0%      {opacity:0;    transform:scale(0.6);}
          12%     {opacity:0.75; transform:scale(1.25);}
          30%,100%{opacity:0;    transform:scale(0.8);}
        }

        /* Idle: two breaths → weight shift left/right → excited little pop */
        @keyframes mascotIdleLife {
          0%,100% {transform:translateY(0)     rotate(0deg)    scale(1,1);}
          12%     {transform:translateY(1.5px) rotate(0deg)    scale(1.03,0.97);}
          24%     {transform:translateY(0)     rotate(0deg)    scale(1,1);}
          36%     {transform:translateY(1.5px) rotate(0deg)    scale(1.03,0.97);}
          48%     {transform:translateY(0)     rotate(0deg)    scale(1,1);}
          58%     {transform:translateY(1px)   rotate(-2.5deg) scale(1.02,0.98);}
          70%     {transform:translateY(1px)   rotate(2.5deg)  scale(1.02,0.98);}
          80%     {transform:translateY(0)     rotate(0deg)    scale(1,1);}
          86%     {transform:translateY(-5px)  rotate(0deg)    scale(0.97,1.04);}
          92%     {transform:translateY(0.5px) rotate(0deg)    scale(1.05,0.96);}
          96%     {transform:translateY(0)     rotate(0deg)    scale(1,1);}
        }
        @keyframes mascotAntCurious {
          0%,100% {transform:rotate(0deg);}
          20%     {transform:rotate(5deg);}
          40%     {transform:rotate(-4deg);}
          60%     {transform:rotate(4deg);}
          80%     {transform:rotate(0deg);}
          85%     {transform:rotate(-20deg);}
          90%     {transform:rotate(12deg);}
          95%     {transform:rotate(-5deg);}
        }

        @keyframes mascotBreath {
          0%,100%{transform:translateY(0)     scale(1,1);}
          50%    {transform:translateY(1.5px) scale(1.025,0.975);}
        }
        @keyframes mascotAntIdle { 0%,100%{transform:rotate(0deg);} 50%{transform:rotate(6deg);} }

        /* Walk: scamper — squash on contact, stretch in the air, legs scurrying double-time */
        @keyframes mascotScamper {
          0%,100%{transform:translateY(0)    scale(1.07,0.92);}
          38%    {transform:translateY(-8px) scale(0.94,1.08);}
          70%    {transform:translateY(-3px) scale(0.99,1.03);}
        }
        @keyframes mascotAntWalk { 0%,100%{transform:rotate(-12deg);} 50%{transform:rotate(12deg);} }
        @keyframes mascotLegRun  { 0%,100%{transform:rotate(-22deg);} 50%{transform:rotate(22deg);} }
        @keyframes mascotLeg     { 0%,100%{transform:rotate(-16deg);} 50%{transform:rotate(16deg);} }
        @keyframes mascotShadowW { 0%,100%{transform:scale(1);opacity:.55;} 50%{transform:scale(.85);opacity:.4;} }

        /* Wave: bouncing + alternating arms */
        @keyframes mascotWaveBounce {
          0%,100%{transform:translateY(0)    scale(1.05,0.95);}
          50%    {transform:translateY(-5px) scale(0.97,1.04);}
        }
        @keyframes mascotWaveR {
          0%,100%{transform:rotate(0deg);}
          20%    {transform:rotate(-72deg);}
          40%    {transform:rotate(-44deg);}
          60%    {transform:rotate(-72deg);}
          80%    {transform:rotate(-40deg);}
        }
        @keyframes mascotWaveL {
          0%,100%{transform:rotate(0deg);}
          20%    {transform:rotate(72deg);}
          40%    {transform:rotate(44deg);}
          60%    {transform:rotate(72deg);}
          80%    {transform:rotate(40deg);}
        }
        @keyframes mascotAntExcited {
          0%,100%{transform:rotate(-7deg);} 25%{transform:rotate(9deg);}
          50%    {transform:rotate(-9deg);} 75%{transform:rotate(7deg);}
        }

        /* Sleep: slumped puddle breathing */
        @keyframes mascotSlBreath {
          0%,100%{transform:translateY(4px) scale(1.07,0.93);}
          50%    {transform:translateY(3px) scale(1.045,0.955);}
        }
        @keyframes mascotZzz {
          0%  {opacity:0;transform:translateY(0) scale(.6);}
          15% {opacity:1;}
          80% {opacity:.8;}
          100%{opacity:0;transform:translateY(-38px) scale(1);}
        }

        /* Think: pondering rock + chin-tap arm + animated thought bubble */
        @keyframes mascotPonderBob {
          0%,100%{transform:rotate(-1.5deg) translateY(0)    scale(1.015,0.985);}
          50%    {transform:rotate(1.2deg)  translateY(-3px) scale(0.99,1.015);}
        }
        @keyframes mascotAntTap {
          0%,100%{transform:rotate(0deg);} 40%{transform:rotate(-22deg);} 70%{transform:rotate(12deg);}
        }
        /* Focused squint, blink, then a wide-eyed "idea!" moment */
        @keyframes mascotFocusEyes {
          0%,55%,100%{transform:scaleY(0.72);}
          20%        {transform:scaleY(0.08);}
          70%,82%    {transform:scaleY(1.05);}
        }
        @keyframes mascotThoughtFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
        @keyframes mascotDotPulse {
          0%,60%,100%{opacity:0.25; transform:scale(0.8);}
          30%        {opacity:1;    transform:scale(1.25);}
        }

        /* Writing: pencil scribbles across the line, resets, ink grows with it */
        @keyframes mascotPenCarriage { 0%{transform:translateX(0);} 88%{transform:translateX(15px);} 100%{transform:translateX(0);} }
        @keyframes mascotPenWiggle   { 0%,100%{transform:rotate(-4deg);} 50%{transform:rotate(4deg);} }
        @keyframes mascotInkGrow     { 0%{transform:scaleX(0.12);} 88%,100%{transform:scaleX(1);} }
        /* -72deg parks the hand just below the body edge — any further and the body hides it */
        @keyframes mascotChinRaise { from{transform:rotate(0deg);} to{transform:rotate(-72deg);} }
        @keyframes mascotChinTap   { 0%,100%{transform:rotate(-72deg);} 50%{transform:rotate(-65deg);} }
        @keyframes mascotThoughtIn { from{opacity:0;transform:scale(.4);} to{opacity:1;transform:scale(1);} }

        /* Listen: head-bob groove */
        @keyframes mascotGroove {
          0%,100%{transform:rotate(-4deg) translateY(0)    scale(1.03,0.97);}
          25%    {transform:rotate(0deg)  translateY(-3px) scale(0.99,1.01);}
          50%    {transform:rotate(4deg)  translateY(0)    scale(1.03,0.97);}
          75%    {transform:rotate(0deg)  translateY(-3px) scale(0.99,1.01);}
        }
        @keyframes mascotAntListen { 0%,100%{transform:rotate(-9deg);} 50%{transform:rotate(9deg);} }
        @keyframes mascotNote {
          0%  {opacity:0;transform:translateY(0) scale(.7);}
          18% {opacity:1;}
          80% {opacity:.8;}
          100%{opacity:0;transform:translateY(-42px) scale(1.1);}
        }

        /* Dance: two side-bounces, anticipation, finale jump, splat, wobble out */
        @keyframes mascotDanceJam {
          0%   {transform:translateY(0)     rotate(-9deg) scale(1.07,0.93);}
          12%  {transform:translateY(-13px) rotate(0deg)  scale(0.94,1.07);}
          24%  {transform:translateY(0)     rotate(9deg)  scale(1.07,0.93);}
          36%  {transform:translateY(-13px) rotate(0deg)  scale(0.94,1.07);}
          48%  {transform:translateY(0)     rotate(-9deg) scale(1.07,0.93);}
          54%  {transform:translateY(2px)   rotate(0deg)  scale(1.12,0.86);}
          64%  {transform:translateY(-26px) rotate(0deg)  scale(0.9,1.12);}
          74%  {transform:translateY(2px)   rotate(0deg)  scale(1.14,0.85);}
          82%  {transform:translateY(-4px)  rotate(0deg)  scale(0.97,1.04);}
          90%  {transform:translateY(0)     rotate(0deg)  scale(1.04,0.97);}
          100% {transform:translateY(0)     rotate(-9deg) scale(1.07,0.93);}
        }
        @keyframes mascotShadowJam {
          0%,24%,48%,74%,100% {transform:scale(1);    opacity:0.6;}
          12%,36%             {transform:scale(0.82); opacity:0.4;}
          64%                 {transform:scale(0.6);  opacity:0.3;}
        }
        @keyframes mascotAntDance   { 0%,100%{transform:rotate(-22deg);} 50%{transform:rotate(22deg);} }
        @keyframes mascotDanceLoopL { 0%,100%{transform:rotate(0deg);}   50%{transform:rotate(-50deg);} }
        @keyframes mascotDanceLoopR { 0%,100%{transform:rotate(0deg);}   50%{transform:rotate(50deg);}  }
        @keyframes mascotSparkle {
          0%,100% {opacity:0;   transform:translateY(4px)   scale(0.4);}
          40%     {opacity:1;   transform:translateY(-6px)  scale(1.15);}
          70%     {opacity:0.6; transform:translateY(-12px) scale(0.9);}
        }

        /* Program: hunched over the keyboard, busy little bob */
        @keyframes mascotProgLean {
          0%,100%{transform:translateY(2px) scale(1.03,0.965);}
          50%    {transform:translateY(3px) scale(1.045,0.955);}
        }
        @keyframes mascotProgDeployL { from{transform:rotate(0deg);} to{transform:rotate(-70deg);} }
        @keyframes mascotProgDeployR { from{transform:rotate(0deg);} to{transform:rotate(70deg);}  }
        @keyframes mascotTypeLoopL   { 0%,100%{transform:rotate(-70deg);} 50%{transform:rotate(-62deg);} }
        @keyframes mascotTypeLoopR   { 0%,100%{transform:rotate(62deg);}  50%{transform:rotate(70deg);}  }
        @keyframes mascotLaptopIn    { from{opacity:0;transform:translateY(5px);} to{opacity:1;transform:translateY(0);} }
        @keyframes mascotScreenGlow  { 0%,100%{opacity:0.65;} 50%{opacity:0.3;} }
        @keyframes mascotCodeUp {
          0%  {opacity:0;   transform:translateY(0)     scale(0.7);}
          20% {opacity:0.9; transform:translateY(-8px)  scale(1);}
          100%{opacity:0;   transform:translateY(-36px) scale(1);}
        }

        /* Greeting: anticipation hop with air-stretch, splat, jiggle out */
        @keyframes mascotHop {
          0%     {transform:translateY(0)     scale(1,1);}
          8%     {transform:translateY(4px)   scale(1.12,.86);}
          18%,28%{transform:translateY(-24px) scale(.92,1.1);}
          38%    {transform:translateY(2px)   scale(1.1,.88);}
          48%    {transform:translateY(-4px)  scale(.98,1.03);}
          56%    {transform:translateY(0)     scale(1.03,.99);}
          64%,100%{transform:translateY(0)    scale(1,1);}
        }
        @keyframes mascotAntGreet {
          0%,100%{transform:rotate(0);}
          10%{transform:rotate(-24deg);}  22%{transform:rotate(16deg);}
          34%{transform:rotate(-13deg);} 44%{transform:rotate(8deg);}
          54%{transform:rotate(-4deg);}  62%{transform:rotate(0);}
        }
        @keyframes mascotShadowHop {
          0%,100%{transform:scale(1);opacity:.6;}
          18%,30%{transform:scale(.7);opacity:.35;}
        }
        @keyframes mascotGreetWave {
          0%   {transform:rotate(0deg);}
          22%  {transform:rotate(-65deg);}
          44%  {transform:rotate(-42deg);}
          66%  {transform:rotate(-65deg);}
          84%  {transform:rotate(-36deg);}
          100% {transform:rotate(0deg);}
        }
        @keyframes mascotGreetLift {
          0%  {transform:rotate(0deg);}
          25% {transform:rotate(42deg);}
          65% {transform:rotate(34deg);}
          100%{transform:rotate(0deg);}
        }

        /* Poster: peek-a-boo left and right from behind the planted sign */
        @keyframes mascotPeek {
          0%,10%  {transform:translateX(0);}
          18%     {transform:translateX(-36px) scale(0.98,1.02);}
          22%,36% {transform:translateX(-36px) scale(1,1);}
          44%,52% {transform:translateX(0);}
          60%     {transform:translateX(36px)  scale(0.98,1.02);}
          64%,78% {transform:translateX(36px)  scale(1,1);}
          86%,100%{transform:translateX(0);}
        }
        @keyframes mascotPeekShadow {
          0%,10%  {transform:translateX(0);}
          22%,36% {transform:translateX(-36px);}
          44%,52% {transform:translateX(0);}
          64%,78% {transform:translateX(36px);}
          86%,100%{transform:translateX(0);}
        }

        /* Experience: confident strut + pendulum briefcase */
        @keyframes mascotStrut {
          0%,100%{transform:scale(1.025,0.975);}
          30%    {transform:translateY(-2px) scale(0.985,1.02);}
          60%    {transform:scale(1.01,0.99);}
        }
        @keyframes mascotAntProud       { 0%,100%{transform:rotate(-3deg);} 50%{transform:rotate(3deg);} }
        @keyframes mascotBriefcaseHold  { from{transform:rotate(0deg);} to{transform:rotate(40deg);} }
        @keyframes mascotCaseSwing      { 0%,100%{transform:rotate(-4deg);} 50%{transform:rotate(4deg);} }
        @keyframes mascotBowtiePop      { from{opacity:0;transform:scale(0.3);} to{opacity:1;transform:scale(1);} }

        /* Paper plane: mascot + plane bob together, wind rushes past */
        @keyframes mascotSoar     { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-11px);} }
        @keyframes mascotPlaneArmL{ from{transform:rotate(0deg);} to{transform:rotate(-38deg);} }
        @keyframes mascotPlaneArmR{ from{transform:rotate(0deg);} to{transform:rotate(38deg);}  }
        @keyframes mascotPlaneIn {
          from{opacity:0;transform:translateX(-30px) translateY(10px);}
          to  {opacity:1;transform:translateX(0)     translateY(0);}
        }
        @keyframes mascotShadowFly {
          0%,100%{transform:scale(1.1);opacity:.4;}
          50%    {transform:scale(0.7);opacity:.25;}
        }
        @keyframes mascotWind {
          0%  {opacity:0;    transform:translateX(30px);}
          30% {opacity:0.55;}
          100%{opacity:0;    transform:translateX(-36px);}
        }

        /* Graduation: proud rise + swinging tassel + confetti */
        @keyframes mascotProudRise {
          0%,100%{transform:scale(1.015,0.99);}
          50%    {transform:translateY(-2.5px) scale(0.99,1.02);}
        }
        @keyframes mascotHatIn {
          0%  {opacity:0;transform:translateY(-26px) scale(0.8)  rotate(-8deg);}
          70% {opacity:1;transform:translateY(3px)   scale(1.04) rotate(2deg);}
          100%{opacity:1;transform:translateY(0)     scale(1)    rotate(0deg);}
        }
        @keyframes mascotTasselSwing { 0%,100%{transform:rotate(-14deg);} 50%{transform:rotate(10deg);} }
        @keyframes mascotScrollHold  { from{transform:rotate(0deg);} to{transform:rotate(48deg);} }
        @keyframes mascotConfettiFall {
          0%  {opacity:0; transform:translateY(-20px) rotate(0deg);}
          12% {opacity:1;}
          85% {opacity:1;}
          100%{opacity:0; transform:translateY(150px) rotate(240deg);}
        }

        /* Phone: hold + thumb-tap wiggle + rising chat bubbles */
        @keyframes mascotPhoneHold { from{transform:rotate(0deg);} to{transform:rotate(-40deg);} }
        @keyframes mascotPhoneTap {
          0%,32%,100%{transform:rotate(0deg)   translateY(0);}
          8%         {transform:rotate(2deg)   translateY(-1px);}
          16%        {transform:rotate(0deg)   translateY(0);}
          24%        {transform:rotate(2deg)   translateY(-1px);}
        }
        @keyframes mascotBubbleUp {
          0%  {opacity:0;   transform:translateY(6px)   scale(0.6);}
          20% {opacity:1;   transform:translateY(0)     scale(1);}
          75% {opacity:0.9;}
          100%{opacity:0;   transform:translateY(-30px) scale(1);}
        }

        /* Props pop in with a springy overshoot + settle */
        @keyframes mascotPropIn {
          0%  { opacity:0; transform:scale(0.5)  translateY(10px) rotate(-6deg); }
          60% { opacity:1; transform:scale(1.08) translateY(-2px) rotate(2deg);  }
          80% { transform:scale(0.97) translateY(1px) rotate(-1deg); }
          100%{ opacity:1; transform:scale(1)    translateY(0)    rotate(0deg);  }
        }

        /* ── TOOL PROPS — transform origins ── */
        .mascot-search-prop   { transform-box:fill-box; transform-origin:50% 100%; }
        .mascot-doc-prop      { transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-envelope-prop { transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-code-prop     { transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-map-prop      { transform-box:fill-box; transform-origin:50% 50%;  }
        .mascot-resume-prop   { transform-box:fill-box; transform-origin:50% 50%;  }

        /* When any agent tool is active: right arm raises to hold prop, laptop hides, curious lean */
        .mascot-program[class*="mascot-tool-"] .mascot-arm-left  { animation: none; opacity: 0; }
        .mascot-program[class*="mascot-tool-"] .mascot-laptop    { animation: none; opacity: 0; }
        .mascot-program[class*="mascot-tool-"] .mascot-code-float text { animation: none; opacity: 0; }
        .mascot-program[class*="mascot-tool-"] .mascot-character { animation: mascotToolCurious 2.8s ease-in-out infinite; }
        .mascot-program[class*="mascot-tool-"] .mascot-arm-right {
          animation:
            mascotFadeIn       0.15s ease-out                        0s   1 forwards,
            mascotArmRaiseTool 0.70s cubic-bezier(0.34,1.4,0.64,1)  0.1s 1 forwards,
            mascotToolHover    2.8s  ease-in-out                     0.8s infinite;
        }

        /* Per-tool prop animations */
        .mascot-tool-search-projects .mascot-search-prop {
          animation:
            mascotPropIn     0.5s  ease-out                       0.5s  1       forwards,
            mascotSearchScan 2.4s  ease-in-out                     1.0s  infinite;
        }
        .mascot-tool-get-profile .mascot-doc-prop {
          animation:
            mascotPropIn    0.5s  ease-out                       0.5s  1       forwards,
            mascotPropFloat 2.8s  ease-in-out                     1.0s  infinite;
        }
        .mascot-tool-notify-siva .mascot-envelope-prop {
          animation:
            mascotPropIn       0.5s  ease-out                       0.5s  1       forwards,
            mascotEnvelopeBeat 1.6s  ease-in-out                     1.0s  infinite;
        }
        .mascot-tool-get-live-github .mascot-code-prop {
          animation:
            mascotPropIn    0.5s  ease-out                       0.5s  1       forwards,
            mascotPropFloat 2.8s  ease-in-out                     1.0s  infinite;
        }
        .mascot-tool-personalized-tour .mascot-map-prop {
          animation:
            mascotPropIn    0.5s  ease-out                       0.5s  1       forwards,
            mascotPropFloat 2.8s  ease-in-out                     1.0s  infinite;
        }
        .mascot-tool-get-resume .mascot-resume-prop {
          animation:
            mascotPropIn    0.5s  ease-out                       0.5s  1       forwards,
            mascotPropFloat 2.8s  ease-in-out                     1.0s  infinite;
        }

        @keyframes mascotToolCurious {
          0%,100%{transform:rotate(3.5deg) translateY(1px) scale(1.015,0.985);}
          50%    {transform:rotate(5.5deg) translateY(0)   scale(1,1);}
        }
        @keyframes mascotArmRaiseTool {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(-40deg); }
        }
        @keyframes mascotToolHover {
          0%,100% { transform: rotate(-40deg); }
          50%     { transform: rotate(-32deg); }
        }
        @keyframes mascotPropFloat {
          0%,100% { transform: scale(1) translateY(0px);  }
          50%     { transform: scale(1) translateY(-3px); }
        }
        @keyframes mascotSearchScan {
          0%,100% { transform: rotate(-8deg)  translateX(-2px); }
          25%     { transform: rotate(10deg)  translateX(4px);  }
          50%     { transform: rotate(-4deg)  translateX(0px);  }
          75%     { transform: rotate(8deg)   translateX(3px);  }
        }
        @keyframes mascotEnvelopeBeat {
          0%,100% { transform: scale(1);    }
          20%     { transform: scale(1.08); }
          35%     { transform: scale(1.02); }
          50%     { transform: scale(1.07); }
          65%     { transform: scale(0.97); }
        }

        @media (prefers-reduced-motion:reduce) {
          .mascot-svg,.mascot-svg *{animation:none !important;}
        }
      `}</style>
    </div>
  );
}
