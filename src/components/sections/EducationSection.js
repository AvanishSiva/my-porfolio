import React, { useState, useEffect, useRef } from 'react';
import './EducationSection.css';

const educationData = [
  {
    degree: "MSc in Artificial Intelligence",
    school: "National College of Ireland",
    date: "2025 - Present",
    location: "Dublin, UK",
    coordinates: { lat: 53.3492, lng: -6.2433 },
    description:[
      "Developing expertise in machine learning, deep learning, and intelligent automation. Combining strong software engineering fundamentals with a curiosity for solving complex problems through data and AI.",
      "Relevant Coursework: Advanced Machine Learning, Natural Language Processing, Programming in Artificial Intelligence, AI Ethics,Data Analytics."
    ]
  },
  {
    degree: "BSc in Computer Science",
    school: "Sri Krishna College of Engineering and Technology",
    date: "2019 - 2023",
    location: "Tamilnadu, India",
    coordinates: { lat: 10.9390, lng: 76.9522 },
    description: [
        "GPA: 9.16/10. ",
        "Gained a solid foundation in computer science principles, programming languages, and software development methodologies. Completed projects in web development, mobile applications, and database management.",
        "Relevant Coursework: Data Structures and Algorithms, Database Management Systems, Operating Systems, Computer Networks, Software Engineering, Web Technologies, Mobile Application Development."]
  },
  {
    degree: "Higher Secondary Education",
    school: "SRV Matriculation Higher Secondary School",
    date: "2018 - 2019",
    location: "Tamilnadu, India",
    coordinates: { lat: 10.933896, lng: 78.7467 },
    description: "Completed higher secondary education with a focus on science subjects, achieving a score of 90%. Developed strong analytical and problem-solving skills, laying the groundwork for future studies in computer science."
  }
];

export default function EducationSection() {
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
        
        const newIndex = Math.floor(progress * educationData.length);
        const clampedIndex = Math.min(newIndex, educationData.length - 1);
        
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

  const currentEdu = educationData[currentIndex];

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
        Education
        <div className="education-title-underline" />
      </div>

      {/* Progress indicator */}
      <div className="progress-indicator">
        {educationData.map((_, i) => (
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
        {educationData.map((edu, index) => {
          const cardProgress = scrollProgress * educationData.length - index;
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

                {/* Map inside card */}
                <div className={`card-map ${isActive ? 'active' : ''}`}>
                  <iframe
                    title={`${edu.school} Location`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${edu.coordinates.lng - 0.1},${edu.coordinates.lat - 0.1},${edu.coordinates.lng + 0.1},${edu.coordinates.lat + 0.1}&layer=mapnik&marker=${edu.coordinates.lat},${edu.coordinates.lng}`}
                    allowFullScreen
                  />
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