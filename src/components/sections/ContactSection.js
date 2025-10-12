import React, { useState, useEffect, useRef } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter, FaPhone, FaMapMarkerAlt, FaCopy, FaCheck } from 'react-icons/fa';

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
      url: "www.linkedin.com/in/sivaavanish-k",
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

  const styles = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(60px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-100px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(100px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      50% { transform: translateY(-15px) translateX(8px); }
    }

    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }

    .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
    .slide-in-left { animation: slideInLeft 0.8s ease-out forwards; }
    .slide-in-right { animation: slideInRight 0.8s ease-out forwards; }

    .info-card {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .info-card:hover {
      transform: translateX(8px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .social-card {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .social-card:hover {
      transform: translateY(-8px) scale(1.05);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
    }

    .social-card:hover .social-icon {
      transform: scale(1.2) rotate(8deg);
    }

    .cta-button {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cta-button:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
    }

    .particle {
      position: absolute;
      border-radius: 50%;
      background: rgba(102, 126, 234, 0.3);
      animation: float ease-in-out infinite;
      pointer-events: none;
    }

    .copy-button {
      transition: all 0.3s ease;
    }

    .copy-button:hover {
      background: rgba(102, 126, 234, 0.1);
    }

    .shimmer-line {
      background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.4), transparent);
      background-size: 1000px 100%;
      animation: shimmer 3s infinite;
    }
  `;

  return (
    <div 
      ref={sectionRef}
      style={{
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#E8E8E3',
        padding: '4rem 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{styles}</style>

      {/* Background Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        opacity: 0.2,
        pointerEvents: 'none',
      }}>
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

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div 
          data-animate-id="header"
          className={isVisible.header ? 'fade-in-up' : ''}
          style={{
            textAlign: 'center',
            marginBottom: '4rem',
            opacity: isVisible.header ? 1 : 0,
          }}
        >
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '900',
            color: '#181818',
            textTransform: 'uppercase',
            letterSpacing: '-1px',
            marginBottom: '1rem',
          }}>
            Get In Touch
          </h1>
          <div className="shimmer-line" style={{
            width: '80px',
            height: '4px',
            margin: '0 auto 1.5rem',
            borderRadius: '2px',
          }} />
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#6B645C',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Feel free to reach out for collaborations, opportunities, or just a friendly chat!
          </p>
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3rem',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>
          {/* Contact Info Cards */}
          <div style={{
            flex: '1 1 400px',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
            {/* Email Card */}
            <div 
              data-animate-id="email"
              className={`info-card ${isVisible.email ? 'slide-in-left' : ''}`}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                opacity: isVisible.email ? 1 : 0,
              }}
            >
              <div style={{
                fontSize: '1.5rem',
                color: '#667eea',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                padding: '1rem',
                borderRadius: '10px',
              }}>
                <FaEnvelope />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#6B645C',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '0.25rem',
                }}>
                  Email
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#181818',
                }}>
                  {contactData.email}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleCopyEmail}
                  className="copy-button"
                  style={{
                    padding: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: copiedEmail ? '#10b981' : '#6B645C',
                  }}
                >
                  {copiedEmail ? <FaCheck /> : <FaCopy />}
                </button>
                <a
                  href={`mailto:${contactData.email}`}
                  className="copy-button"
                  style={{
                    padding: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: '#667eea',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FaEnvelope />
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div 
              data-animate-id="phone"
              className={`info-card ${isVisible.phone ? 'slide-in-left' : ''}`}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                opacity: isVisible.phone ? 1 : 0,
                animationDelay: '0.1s',
              }}
            >
              <div style={{
                fontSize: '1.5rem',
                color: '#667eea',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                padding: '1rem',
                borderRadius: '10px',
              }}>
                <FaPhone />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#6B645C',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '0.25rem',
                }}>
                  Phone
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#181818',
                }}>
                  {contactData.phone}
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div 
              data-animate-id="location"
              className={`info-card ${isVisible.location ? 'slide-in-left' : ''}`}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                opacity: isVisible.location ? 1 : 0,
                animationDelay: '0.2s',
              }}
            >
              <div style={{
                fontSize: '1.5rem',
                color: '#667eea',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                padding: '1rem',
                borderRadius: '10px',
              }}>
                <FaMapMarkerAlt />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#6B645C',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '0.25rem',
                }}>
                  Location
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#181818',
                }}>
                  {contactData.location}
                </div>
              </div>
            </div>
          </div>

          {/* Socials Section */}
          <div 
            data-animate-id="socials"
            className={isVisible.socials ? 'slide-in-right' : ''}
            style={{
              flex: '1 1 400px',
              maxWidth: '500px',
              opacity: isVisible.socials ? 1 : 0,
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
            }}>
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
                    background: 'white',
                    padding: '2rem 1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textAlign: 'center',
                    border: hoveredCard === index ? `2px solid ${social.color}` : '2px solid transparent',
                  }}
                >
                  <div 
                    className="social-icon"
                    style={{
                      fontSize: '2.5rem',
                      color: social.color,
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    {social.icon}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#181818',
                      marginBottom: '0.25rem',
                    }}>
                      {social.name}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#6B645C',
                    }}>
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