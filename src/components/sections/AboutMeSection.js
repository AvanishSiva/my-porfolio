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

  const styles = `
    .about-container {
      width: 100vw;
      min-height: 100vh;
      background-color: #E8E8E3;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      position: relative;
      overflow-y: auto; /* Allow scrolling */
      box-sizing: border-box;
    }

    .about-content-wrapper {
      display: flex;
      flex-direction: row;
      gap: 4rem;
      align-items: flex-start;
      max-width: 1400px;
      width: 100%;
      padding: 0 2rem;
      flex-wrap: wrap;
    }

    .about-text-section {
      flex: 1 1 400px;
      max-width: 550px;
      z-index: 10;
    }

    .about-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 900;
      color: #181818;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      letter-spacing: -1px;
    }

    .about-description {
      font-size: clamp(1rem, 2vw, 1.25rem);
      line-height: 1.8;
      color: #6B645C;
      margin-bottom: 2rem;
    }

    .highlight-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      list-style: none;
      padding: 0;
      margin-top: 2rem;
    }

    .highlight-item {
      font-size: 1rem;
      color: #6B645C;
      padding: 1rem 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: relative;
      padding-left: 2.5rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .highlight-item:hover {
      transform: translateX(8px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .bullet {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .about-skills-section {
      flex: 1 1 500px;
      max-width: 700px;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
      background: #F9F9F4;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .skill-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .skill-card:hover {
      transform: translateY(-8px) scale(1.05);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }
    
    .skill-img {
      width: 48px;
      height: 48px;
      object-fit: contain;
      margin-bottom: 0.75rem;
      transition: transform 0.4s ease;
    }

    .skill-card:hover .skill-img {
      transform: scale(1.1) rotate(5deg);
    }
    
    .skill-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
      text-align: center;
      transition: color 0.3s ease;
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

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .about-container {
        padding: 2rem 1rem;
        height: auto;
        min-height: 100vh;
        display: block; /* Allow natural flow */
      }

      .about-content-wrapper {
        flex-direction: column;
        gap: 2rem;
        padding: 0;
      }

      .about-text-section, .about-skills-section {
        flex: 1 1 auto;
        max-width: 100%;
        width: 100%;
      }

      .skills-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); /* Smaller cards */
        gap: 1rem;
        padding: 1rem;
      }

      .skill-card {
        padding: 1rem 0.5rem;
      }

      .skill-img {
        width: 36px;
        height: 36px;
      }

      .skill-name {
        font-size: 0.8rem;
      }
    }
  `;

  return (
    <div className="about-container">
      <style>{styles}</style>

      <div className="about-content-wrapper">
        <div className="about-text-section">
          <h1 className="about-title">About Me</h1>
          <p className="about-description">
            I'm a passionate software developer with 3 years of experience building scalable applications
            and exploring the exciting world of AI/ML. I love turning complex problems into elegant solutions.
          </p>

          <ul className="highlight-list">
            <li className="highlight-item">
              <span className="bullet"></span>
              Currently pursuing MSc in Artificial Intelligence
            </li>
            <li className="highlight-item">
              <span className="bullet"></span>
              3+ years of professional development experience
            </li>
            <li className="highlight-item">
              <span className="bullet"></span>
              Full-stack developer with a focus on modern web technologies
            </li>
            <li className="highlight-item">
              <span className="bullet"></span>
              Passionate about clean code and continuous learning
            </li>
          </ul>
        </div>

        <div className="about-skills-section">
          <div className="skills-grid" ref={gridRef}>
            {skills.map((skill, index) => (
              <div
                key={skill.name}
                className="skill-card"
              >
                <img
                  src={skill.icon}
                  alt={skill.name}
                  className="skill-img"
                />
                <span className="skill-name">
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