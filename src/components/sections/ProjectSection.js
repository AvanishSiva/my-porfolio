import React, { useState, useEffect, useRef } from 'react';

const projectsData = [
  {
    name: "BayMax Chatbot, an AI-powered eCommerce shopping assistant",
    description: "Built an intelligent eCommerce chatbot using Python, Django, and Rasa NLP, with automated data scraping from Amazon and Flipkart for real-time, context-aware assistance.",
    techStack: [
      { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg", color: "#3776ab" },
      { name: "Django", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg", color: "#092e20" },
      { name: "Rasa", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg", color: "#5a17ee" },
      { name: "NLP", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg", color: "#ff6f00" }
    ],
    githubLink: "https://github.com/AvanishSiva/DeepVisionTech-Octave",
    featured: true
  },
  {
    name: "Go-Safe, Safety Management App",
    description: "Developed a cross-platform mobile app using Flutter and Firebase with real-time data sync, secure authentication, and interactive satellite mapping via Google Maps API.",
    techStack: [
      { name: "Flutter", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg", color: "#02569B" },
      { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-plain.svg", color: "#FFCA28" },
      { name: "Google Maps", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg", color: "#4285F4" },
      { name: "Dart", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg", color: "#0175C2" }
    ],
    githubLink: "https://github.com/AvanishSiva/Go-Safe",
    featured: true
  },
  {
    name: "Deep Learning-Based Image Encryption and Decryption for Medical Data",
    description: "Developed a CNN-based encryption model integrated with RSA algorithms to securely protect medical images while preserving visual quality.",
    techStack: [
      { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg", color: "#3776ab" },
      { name: "TensorFlow", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg", color: "#ff6f00" },
      { name: "OpenCV", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/opencv/opencv-original.svg", color: "#5C3EE8" },
      { name: "CNN", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg", color: "#FF6F00" }
    ],
    featured: false
  },
  {
    name: "Product Integration Framework – Zoho ManageEngine ServiceDesk Plus",
    description: "Built a Product Integration Framework for Zoho ManageEngine’s ServiceDesk Plus using Java and REST APIs, enabling seamless communication and data exchange between multiple enterprise applications.",
    techStack: [
      { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg", color: "#f89820" },
      { name: "Spring Boot", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg", color: "#6db33f" },
      { name: "Postman", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg", color: "#ff6c37" }
    ],
    featured: false
  }
];

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const cards = document.querySelectorAll('.project-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0) scale(1)';
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px) scale(0.95)';
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const handleProjectSelect = (index) => {
    if (index === selectedProject || isAnimating) return;
    
    setIsAnimating(true);
    setSelectedProject(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const containerStyle = {
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#E8E8E3',
    padding: '4rem 2rem',
    position: 'relative',
    overflow: 'hidden',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '4rem',
    animation: 'fadeInDown 0.8s ease-out',
  };

  const titleStyle = {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: '900',
    color: '#181818',
    textTransform: 'uppercase',
    letterSpacing: '-1px',
    marginBottom: '1rem',
  };

  const subtitleStyle = {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    color: '#6B645C',
    maxWidth: '600px',
    margin: '0 auto',
  };

  const contentWrapperStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    gap: '3rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const projectListStyle = {
    flex: '0 0 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const projectItemStyle = (index) => ({
    padding: '1.5rem',
    background: selectedProject === index ? 'white' : '#F9F9F4',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: selectedProject === index ? '2px solid #667eea' : '2px solid transparent',
    boxShadow: selectedProject === index 
      ? '0 8px 24px rgba(102, 126, 234, 0.2)' 
      : '0 2px 8px rgba(0, 0, 0, 0.05)',
    transform: selectedProject === index ? 'translateX(8px)' : 'translateX(0)',
  });

  const projectNameStyle = (index) => ({
    fontSize: '1.1rem',
    fontWeight: '700',
    color: selectedProject === index ? '#667eea' : '#181818',
    marginBottom: '0.5rem',
    transition: 'color 0.3s ease',
  });

  const projectNumberStyle = {
    fontSize: '0.85rem',
    color: '#6B645C',
    fontWeight: '600',
  };

  const detailPanelStyle = {
    flex: '1 1 600px',
    minWidth: '300px',
    background: 'white',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    opacity: isAnimating ? 0 : 1,
    transform: isAnimating ? 'translateY(20px) scale(0.98)' : 'translateY(0) scale(1)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const detailHeaderStyle = {
    marginBottom: '2rem',
  };

  const detailTitleStyle = {
    fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
    fontWeight: '800',
    color: '#181818',
    marginBottom: '1rem',
    background: '#555',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const featuredBadgeStyle = {
    display: 'inline-block',
    padding: '0.4rem 0.8rem',
    background: '#898986',
    color: 'white',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '1rem',
  };

  const descriptionStyle = {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#555',
    marginBottom: '2rem',
  };

  const techStackSectionStyle = {
    marginBottom: '2rem',
    width: '100%',
  };

  const sectionTitleStyle = {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#181818',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '1.5rem',
  };

  const techGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '1rem',
    width: '100%',
  };

  const techBadgeStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.25rem 1rem',
    background: '#F9F9F4',
    borderRadius: '10px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    border: '2px solid transparent',
    minHeight: '120px',
  };

  const techIconStyle = {
    width: '48px',
    height: '48px',
    marginBottom: '0.75rem',
    transition: 'transform 0.3s ease',
    objectFit: 'contain',
  };

  const techNameStyle = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  };

  const buttonStyle = (hasLink) => ({
    flex: 1,
    padding: '1rem 2rem',
    background: hasLink 
      ? '#555' 
      : '#E8E8E3',
    color: hasLink ? 'white' : '#999',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: hasLink ? 'pointer' : 'not-allowed',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    opacity: hasLink ? 1 : 0.5,
  });

  const hoverStyles = `
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .project-item:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }

    .tech-badge-item:hover {
      transform: translateY(-4px);
      border-color: var(--tech-color);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      background: white;
    }

    .tech-badge-item:hover img {
      transform: scale(1.15) rotate(5deg);
    }

    .github-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }

    .github-button:disabled:hover {
      transform: none;
      box-shadow: none;
    }

    @media (max-width: 768px) {
      .content-wrapper {
        flex-direction: column;
      }
      
      .project-list {
        flex: 1 1 100%;
        order: 2;
      }
      
      .detail-panel {
        order: 1;
      }
    }
  `;

  const currentProject = projectsData[selectedProject];

  return (
    <div style={containerStyle} ref={sectionRef}>
      <style>{hoverStyles}</style>
      
      <div style={headerStyle}>
        <h1 style={titleStyle}>Featured Projects</h1>
        <p style={subtitleStyle}>
          Explore my recent work and side projects that showcase my skills and passion for development
        </p>
      </div>

      <div style={contentWrapperStyle} className="content-wrapper">
        <div style={projectListStyle} className="project-list">
          {projectsData.map((project, index) => (
            <div
              key={index}
              className="project-item project-card"
              style={{
                ...projectItemStyle(index),
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => handleProjectSelect(index)}
            >
              <div style={projectNumberStyle}>PROJECT {String(index + 1).padStart(2, '0')}</div>
              <div style={projectNameStyle(index)}>{project.name}</div>
            </div>
          ))}
        </div>

        <div style={detailPanelStyle} className="detail-panel">
          <div style={detailHeaderStyle}>
            {currentProject.featured && (
              <div style={featuredBadgeStyle}>⭐ Featured Project</div>
            )}
            <h2 style={detailTitleStyle}>{currentProject.name}</h2>
          </div>

          <p style={descriptionStyle}>{currentProject.description}</p>

          <div style={techStackSectionStyle}>
            <h3 style={sectionTitleStyle}>Tech Stack</h3>
            <div style={techGridStyle}>
              {currentProject.techStack.map((tech, index) => (
                <div
                  key={index}
                  className="tech-badge-item"
                  style={{
                    ...techBadgeStyle,
                    '--tech-color': tech.color,
                  }}
                >
                  <img src={tech.icon} alt={tech.name} style={techIconStyle} />
                  <span style={techNameStyle}>{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={buttonContainerStyle}>
            <a
              href={currentProject.githubLink || '#'}
              target={currentProject.githubLink ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="github-button"
              style={buttonStyle(currentProject.githubLink)}
              onClick={(e) => !currentProject.githubLink && e.preventDefault()}
            >
              <span style={{ fontSize: '1.2rem' }}>→</span>
              {currentProject.githubLink ? 'View on GitHub' : 'Private Repository'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}