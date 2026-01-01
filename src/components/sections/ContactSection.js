import React, { useState, useEffect, useRef } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter, FaPhone, FaMapMarkerAlt, FaCopy, FaCheck } from 'react-icons/fa';
import './ContactSection.css';

const contactData = {
  email: "sivaavanishk@gmail.com",
  phone: "+353 (089) 206 6418",
  location: "Dublin, Ireland",
  socials: [
    {
      name: "GitHub",
      icon: <FaGithub />,
      url: "https://github.com/AvanishSiva",
      color: "#181717",
      handle: "@AvanishSiva"
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin />,
      url: "https://www.linkedin.com/in/sivaavanish-k/",
      color: "#0077B5",
      handle: "in/sivaavanish-k"
    }
  ]
};

export default function ContactSection() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.animateId;
            setIsVisible(prev => ({ ...prev, [id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('[data-animate-id]');
    elements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleCopyEmail = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(contactData.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <div className="contact-container" ref={sectionRef}>
      {/* Background Particles */}
      <div className="contact-background">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDuration: `${Math.random() * 10 + 15}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="contact-content">
        {/* Header */}
        <div
          data-animate-id="header"
          className={`contact-header ${isVisible.header ? 'visible' : ''}`}
        >
          <h1 className="contact-title">
            Get In Touch
          </h1>
          <div className="shimmer-line" />
          <p className="contact-subtitle">
            Feel free to reach out for collaborations, opportunities, or just a friendly chat!
          </p>
        </div>

        {/* Content Grid */}
        <div className="contact-grid">
          {/* Contact Info Cards */}
          <div className="contact-info-column">
            {/* Email Card */}
            <div
              data-animate-id="email"
              className={`info-card ${isVisible.email ? 'visible' : ''}`}
            >
              <div className="info-icon-wrapper">
                <FaEnvelope />
              </div>
              <div className="info-content">
                <div className="info-label">
                  Email
                </div>
                <div className="info-value">
                  {contactData.email}
                </div>
              </div>
              <div className="copy-actions">
                <button
                  onClick={handleCopyEmail}
                  className={`copy-button ${copiedEmail ? 'success' : ''}`}
                >
                  {copiedEmail ? <FaCheck /> : <FaCopy />}
                </button>
                <a
                  href={`mailto:${contactData.email}`}
                  className="copy-button link"
                >
                  <FaEnvelope />
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div
              data-animate-id="phone"
              className={`info-card ${isVisible.phone ? 'visible' : ''}`}
              style={{ animationDelay: '0.1s' }}
            >
              <div className="info-icon-wrapper">
                <FaPhone />
              </div>
              <div className="info-content">
                <div className="info-label">
                  Phone
                </div>
                <div className="info-value">
                  {contactData.phone}
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div
              data-animate-id="location"
              className={`info-card ${isVisible.location ? 'visible' : ''}`}
              style={{ animationDelay: '0.2s' }}
            >
              <div className="info-icon-wrapper">
                <FaMapMarkerAlt />
              </div>
              <div className="info-content">
                <div className="info-label">
                  Location
                </div>
                <div className="info-value">
                  {contactData.location}
                </div>
              </div>
            </div>
          </div>

          {/* Socials Section */}
          <div
            data-animate-id="socials"
            className={`socials-column ${isVisible.socials ? 'visible' : ''}`}
          >
            <div className="socials-grid">
              {contactData.socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-card"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    borderColor: hoveredCard === index ? social.color : 'transparent',
                  }}
                >
                  <div
                    className="social-icon"
                    style={{
                      color: social.color,
                    }}
                  >
                    {social.icon}
                  </div>
                  <div>
                    <div className="social-name">
                      {social.name}
                    </div>
                    <div className="social-handle">
                      {social.handle}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}