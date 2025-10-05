import React, { useState, useEffect, useRef } from 'react';
import './EducationSection.css';

const experienceData = [
  {
    degree: "Member Technical Staff",
    school: "Zoho Corporation Private Limited",
    date: "2023 - 2025",
    location: "Chennai, India", 
    techStack: [
      { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg", iconType : "img", color: "#f89820" },
      { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",iconType : "img", color: "#f7df1e" },
      { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",iconType : "img", color: "#61dafb" },
      { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-plain.svg", iconType : "img", color: "#336791" },
      { name: "Mercurial", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mercurial/mercurial-plain.svg", iconType : "img", color: "#9F9F9E" },
      { name: "Ember.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ember/ember-original-wordmark.svg", iconType : "img", color: "#E25A46" }
    ],
    description:[
      "Worked on Zoho Manage Engine, AssetExplorer, and ServiceDesk Plus. Developed features, fixed bugs, and improved performance for IT management software used by businesses worldwide.",
    ]
  },
  {
    degree: "Project Trainee",
    school: "Zoho Corporation Private Limited",
    date: "2022 - 2023",
    location: "Chennai, India",
    techStack: [
      { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg", iconType : "img", color: "#f89820" },
      { name: "Spring", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg", color: "#6db33f" },
      { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",iconType : "img", color: "#f7df1e" },
      { name: "HTML/CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-plain.svg", color: "#e34c26" },
      { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg", iconType : "img", color: "#f05032" },
    ],
    description: [
        "Developed and implemented security features for Zoho ManageEngine AssetExplorer, enhancing data protection and user authentication.",
        "Collaborated with cross-functional teams to design, develop, and test new features, ensuring high-quality software delivery.",
        "Gained hands-on experience in full-stack development, working with technologies such as Java, JavaScript, HTML/CSS, and SQL."
    ]
  },
  {
    degree: "Summer Intern",
    school: "Zoho Corporation Private Limited",
    date: "2022",
    location: "Chennai, India",
    techStack: [
      { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg", iconType : "img", color: "#f89820" },
      { name: "OOP", icon: "https://upload.wikimedia.org/wikipedia/commons/b/bd/OOP.svg", color: "#5382a1" },
      { name: "DSA", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/thealgorithms/thealgorithms-plain.svg", color: "#667eea" }
    ],
    description: "Explored Java and OOP concepts, contributing to the development of internal tools and gaining practical experience in software engineering."
  }
];

export default function ExperienceSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNumberChanging, setIsNumberChanging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = (e) => {
      if (containerRef.current) {
        const container = containerRef.current;
        const maxScroll = container.scrollHeight - container.clientHeight;
        const currentScroll = container.scrollTop;
        const progress = currentScroll / maxScroll;
        setScrollProgress(progress);
        
        const newIndex = Math.floor(progress * experienceData.length);
        const clampedIndex = Math.min(newIndex, experienceData.length - 1);
        
        if (clampedIndex !== currentIndex) {
          setIsNumberChanging(true);
          setTimeout(() => {
            setCurrentIndex(clampedIndex);
            setTimeout(() => setIsNumberChanging(false), 100);
          }, 200);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex]);

  const currentExp = experienceData[currentIndex];

  return (
    <div className="education-parallax-container">
      {/* Animated background particles */}
      <div className="background-particles">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 15}s`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`
            }}
          />
        ))}
      </div>

      {/* Static Education Title */}
      <div className="education-static-title">
        Experience
        <div className="education-title-underline" />
      </div>

      {/* Progress indicator */}
      <div className="progress-indicator">
        {experienceData.map((_, i) => (
          <div
            key={i}
            className={`progress-bar ${currentIndex === i ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Animated Sticky Number */}
      <div className="sticky-number">
        <span className="number-zero">0</span>
        <span className={`number-digit ${isNumberChanging ? 'changing' : ''}`}>
          {currentIndex + 1}
        </span>
      </div>

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        className="scrollable-container"
      >
        {/* Initial spacing with animated hint */}
        <div className="initial-spacing">
          <div className="scroll-hint">
            <div>Scroll to explore</div>
            <div className="scroll-arrow">↓</div>
          </div>
        </div>

        {/* Education Cards */}
        {experienceData.map((edu, index) => {
          const cardProgress = scrollProgress * experienceData.length - index;
          const isActive = Math.abs(cardProgress - 0.5) < 0.5;
          
          return (
            <div
              key={index}
              className="education-card-wrapper"
            >
              <div 
                className={`education-card ${isActive ? 'active' : ''}`}
                style={{
                  transform: `translateY(${Math.max(0, cardProgress * 20)}px) scale(${isActive ? 1 : 0.96})`,
                  opacity: Math.max(0.4, 1 - Math.abs(cardProgress - 0.5) * 0.7)
                }}
              >
                {/* Card shine effect */}
                <div className={`card-shine ${isActive ? 'active' : ''}`} />

                <div className="card-header">
                  <div>
                    <h3 className={`card-degree ${isActive ? 'active' : ''}`}>
                      {edu.degree}
                    </h3>
                    <p className={`card-school ${isActive ? 'active' : ''}`}>
                      {edu.school}
                    </p>
                  </div>
                  <div className="card-date-badge">
                    {edu.date}
                  </div>
                </div>

                <div className="card-location">
                  <span className="location-icon">📍</span>
                  {edu.location}
                </div>

                {/* Tech Stack instead of Map */}
                <div className={`tech-stack-container ${isActive ? 'active' : ''}`}>
                  <div className="tech-stack-grid">
                    {edu.techStack.map((tech, techIndex) => (
                      <div 
                        key={techIndex}
                        className="tech-badge"
                        style={{
                          animationDelay: `${techIndex * 0.1}s`,
                          '--tech-color': tech.color
                        }}
                      >
                        <img className="tech-icon" src={tech.icon}></img>
                        <div className="tech-name">{tech.name}</div>
                        <div className="tech-glow" style={{ background: tech.color }}></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`card-description ${isActive ? 'active' : ''}`}>
                    {Array.isArray(edu.description)
                        ? edu.description.map((line, index) => (
                            <p key={index}>{line}</p>
                        ))
                        : <p>{edu.description}</p>}
                </div>

              </div>
            </div>
          );
        })}

        {/* End spacing */}
        <div className="end-spacing" />
      </div>
    </div>
  );
}