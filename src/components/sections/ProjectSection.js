import React, { useState, useEffect, useRef } from 'react';
import './ProjectSection.css';

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

  const currentProject = projectsData[selectedProject];

  return (
    <div className="project-container" ref={sectionRef}>
      <div className="project-header">
        <h1 className="project-title">Featured Projects</h1>
        <p className="project-subtitle">
          Explore my recent work and side projects that showcase my skills and passion for development
        </p>
      </div>

      <div className="project-content-wrapper">
        <div className="project-list">
          {projectsData.map((project, index) => (
            <div
              key={index}
              className={`project-item project-card ${selectedProject === index ? 'selected' : ''}`}
              onClick={() => handleProjectSelect(index)}
            >
              <div className="project-number">PROJECT {String(index + 1).padStart(2, '0')}</div>
              <div className="project-name">{project.name}</div>
            </div>
          ))}
        </div>

        <div className={`detail-panel ${isAnimating ? 'animating' : ''}`}>
          <div className="detail-header">
            {currentProject.featured && (
              <div className="featured-badge">⭐ Featured Project</div>
            )}
            <h2 className="detail-title">{currentProject.name}</h2>
          </div>

          <p className="project-description">{currentProject.description}</p>

          <div className="tech-stack-section">
            <h3 className="section-title">Tech Stack</h3>
            <div className="tech-grid">
              {currentProject.techStack.map((tech, index) => (
                <div
                  key={index}
                  className="tech-badge-item"
                  style={{
                    '--tech-color': tech.color,
                  }}
                >
                  <img src={tech.icon} alt={tech.name} className="tech-icon" />
                  <span className="tech-name">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="button-container">
            <a
              href={currentProject.githubLink || '#'}
              target={currentProject.githubLink ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className={`github-button ${currentProject.githubLink ? 'enabled' : 'disabled'}`}
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