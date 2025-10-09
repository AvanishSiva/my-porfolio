import React, { useState, useEffect, useRef } from "react";

const skills = [
  { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg", color: "#61dafb" },
  { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg", color: "#f7df1e" },
  { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg", color: "#3776ab" },
  { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg", color: "#f89820" },
  { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg", color: "#68a063" },
  { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-plain.svg", color: "#336791" },
  { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg", color: "#f05032" },
  { name: "TensorFlow", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg", color: "#ff6f00" },
];

export default function AboutSection() {
  const [skillPositions, setSkillPositions] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize random positions for each skill
    const initialPositions = skills.map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
    }));
    setSkillPositions(initialPositions);

    const animationInterval = setInterval(() => {
      setSkillPositions(prev => 
        prev.map(pos => {
          let newX = pos.x + pos.vx;
          let newY = pos.y + pos.vy;
          let newVx = pos.vx;
          let newVy = pos.vy;

          // Bounce off edges
          if (newX < 5 || newX > 95) {
            newVx = -pos.vx;
            newX = newX < 5 ? 5 : 95;
          }
          if (newY < 5 || newY > 95) {
            newVy = -pos.vy;
            newY = newY < 5 ? 5 : 95;
          }

          return {
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: (pos.rotation + pos.rotationSpeed) % 360,
            rotationSpeed: pos.rotationSpeed,
          };
        })
      );
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

  const containerStyle = {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#E8E8E3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  };

  const contentWrapperStyle = {
    display: 'flex',
    gap: '4rem',
    alignItems: 'center',
    maxWidth: '1400px',
    width: '100%',
    padding: '0 2rem',
  };

  const textSectionStyle = {
    flex: 1,
    maxWidth: '600px',
    zIndex: 10,
  };

  const titleStyle = {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: '900',
    color: '#181818',
    marginBottom: '1.5rem',
    textTransform: 'uppercase',
    letterSpacing: '-1px',
  };

  const descriptionStyle = {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    lineHeight: '1.8',
    color: '#6B645C',
    marginBottom: '1.5rem',
  };

  const animationContainerStyle = {
    position: 'relative',
    width: '600px',
    height: '600px',
    flex: 'none',
  };

  const skillIconStyle = (index) => {
    if (!skillPositions[index]) return {};
    const pos = skillPositions[index];
    return {
      position: 'absolute',
      left: `${pos.x}%`,
      top: `${pos.y}%`,
      transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
      width: '60px',
      height: '60px',
      background: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      border: '3px solid ' + skills[index].color,
      transition: 'transform 0.3s ease',
      cursor: 'pointer',
      zIndex: 5,
    };
  };

  const skillImgStyle = {
    width: '35px',
    height: '35px',
    objectFit: 'contain',
  };

  const highlightListStyle = {
    listStyle: 'none',
    padding: 0,
    marginTop: '1rem',
  };

  const highlightItemStyle = {
    fontSize: '1rem',
    color: '#6B645C',
    marginBottom: '0.75rem',
    paddingLeft: '1.5rem',
    position: 'relative',
  };

  const bulletStyle = {
    position: 'absolute',
    left: 0,
    top: '0.4rem',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  return (
    <div style={containerStyle}>
      <div style={contentWrapperStyle}>
        <div style={textSectionStyle}>
          <h1 style={titleStyle}>About Me</h1>
          <p style={descriptionStyle}>
            I'm a passionate software developer with 3 years of experience building scalable applications 
            and exploring the exciting world of AI/ML. I love turning complex problems into elegant solutions.
          </p>
          <ul style={highlightListStyle}>
            <li style={highlightItemStyle}>
              <span style={bulletStyle}></span>
              3+ years of professional development experience
            </li>
            <li style={highlightItemStyle}>
              <span style={bulletStyle}></span>
              Full-stack developer with a focus on modern web technologies
            </li>
            <li style={highlightItemStyle}>
              <span style={bulletStyle}></span>
              Currently pursuing MSc in Artificial Intelligence
            </li>
            <li style={highlightItemStyle}>
              <span style={bulletStyle}></span>
              Passionate about clean code and continuous learning
            </li>
          </ul> 
        </div>

        <div ref={containerRef} style={animationContainerStyle}>
          {/* Your Character Image - Replace the src with your image path */}
          <img 
            src="assets/me.png" 
            alt="Character"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '350px',
              height: '350px',
              objectFit: 'contain',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />

          {/* Floating Skills */}
          {skills.map((skill, index) => (
            <div
              key={skill.name}
              style={skillIconStyle(index)}
              title={skill.name}
            >
              <img src={skill.icon} alt={skill.name} style={skillImgStyle} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}