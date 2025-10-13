import React, { useEffect, useRef } from "react";

// --- SKILL LIST ---
const skills = [
  { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg", color: "#f89820" },
  { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg", color: "#f7df1e" },
  { name: "HTML/CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg", color: "#e34c26" },
  { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg", color: "#3776ab" },
  { name: "TensorFlow", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg", color: "#ff6f00" },
  { name: "Scikit Learn", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg", color: "#ff6f00" },
  { name: "Django", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg", color: "#092e20" },
  { name: "Flask", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original-wordmark.svg", color: "#092e20" },
  { name: "REST API", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swagger/swagger-original.svg", color: "#85EA2D" },
  { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-plain.svg", color: "#336791" },
  { name: "SQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg", color: "#00758F" },
  { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg", color: "#47A248" },
  { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-plain.svg", color: "#FFCA28" },
  { name: "Flutter", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg", color: "#02569B" },
  { name: "Linux", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg", color: "#FCC624" },
  { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg", color: "#61DAFB" },
  { name: "Node", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-plain.svg", color: "#339933" },
  { name: "Express", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg", color: "#000000" },
  { name: "Ember", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ember/ember-original-wordmark.svg", color: "#E04E39" },
  { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-plain-wordmark.svg", color: "#2496ED" },
];

export default function AboutSection() {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll('.skill-card');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = `all 0.6s ease ${index * 0.05}s`;
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const containerStyle = {
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#E8E8E3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    position: 'relative',
    overflow: 'hidden',
  };

  const contentWrapperStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '4rem',
    alignItems: 'flex-start',
    maxWidth: '1400px',
    width: '100%',
    padding: '0 2rem',
    flexWrap: 'wrap',
  };

  const textSectionStyle = {
    flex: '1 1 400px',
    maxWidth: '550px',
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
    marginBottom: '2rem',
  };

  const highlightListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    listStyle: 'none',
    padding: 0,
    marginTop: '2rem',
  };

  const highlightItemStyle = {
    fontSize: '1rem',
    color: '#6B645C',
    padding: '1rem 1.5rem',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    position: 'relative',
    paddingLeft: '2.5rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const bulletStyle = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  const skillsSectionStyle = {
    flex: '1 1 500px',
    maxWidth: '700px',
  };

  const skillsHeaderStyle = {
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: '700',
    color: '#181818',
    marginBottom: '2rem',
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  const skillsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '1.5rem',
    padding: '2rem',
    background: '#F9F9F4',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  };

  const skillCardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem 1rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  };

  const skillImgStyle = {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
    marginBottom: '0.75rem',
    transition: 'transform 0.4s ease',
  };

  const skillNameStyle = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    transition: 'color 0.3s ease',
  };

  const hoverStyles = `
    .skill-card:hover {
      transform: translateY(-8px) scale(1.05);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }
    
    .skill-card:hover img {
      transform: scale(1.1) rotate(5deg);
    }
    
    .skill-card:hover .skill-name {
      color: #667eea;
    }
    
    .skill-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
      transition: left 0.5s ease;
    }
    
    .skill-card:hover::before {
      left: 100%;
    }

    .highlight-item:hover {
      transform: translateX(8px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
  `;

  return (
    <div style={containerStyle}>
      <style>{hoverStyles}</style>
      
      <div style={contentWrapperStyle}>
        <div style={textSectionStyle}>
          <h1 style={titleStyle}>About Me</h1>
          <p style={descriptionStyle}>
            I'm a passionate software developer with 3 years of experience building scalable applications 
            and exploring the exciting world of AI/ML. I love turning complex problems into elegant solutions.
          </p>
          
          <ul style={highlightListStyle}>
            <li style={highlightItemStyle} className="highlight-item">
              <span style={bulletStyle}></span>
              Currently pursuing MSc in Artificial Intelligence
            </li>
            <li style={highlightItemStyle} className="highlight-item">
              <span style={bulletStyle}></span>
              3+ years of professional development experience
            </li>
            <li style={highlightItemStyle} className="highlight-item">
              <span style={bulletStyle}></span>
              Full-stack developer with a focus on modern web technologies
            </li>
            <li style={highlightItemStyle} className="highlight-item">
              <span style={bulletStyle}></span>
              Passionate about clean code and continuous learning
            </li>
          </ul>
        </div>

        <div style={skillsSectionStyle}>
          <div style={skillsGridStyle} ref={gridRef}>
            {skills.map((skill, index) => (
              <div 
                key={skill.name}
                className="skill-card"
                style={skillCardStyle}
              >
                <img 
                  src={skill.icon} 
                  alt={skill.name} 
                  style={skillImgStyle}
                />
                <span style={skillNameStyle} className="skill-name">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}