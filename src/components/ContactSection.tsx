import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Terminal, PhoneCall } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from './Icons';
import type { PortfolioData } from '../types/portfolio';
import { FrameScrubber } from './FrameScrubber';
import { ThreeDImageStage } from './ThreeDImageStage';

interface ContactSectionProps {
  portfolio: PortfolioData;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ portfolio }) => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.name && formState.email && formState.message) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormState({ name: '', email: '', message: '' });
      }, 5000);
    }
  };

  return (
    <section
      id="contact"
      style={{
        position: 'relative',
        width: '100%',
        padding: '120px 24px',
        background: 'linear-gradient(180deg, #040609 0%, #080d16 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Section Header */}
        <div style={{ marginBottom: '56px', textAlign: 'left' }}>
          <div className="badge-neon" style={{ marginBottom: '14px' }}>
            <Terminal size={14} />
            <span>COMMUNICATION // DIRECT TRANSMISSION</span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: 0,
            }}
          >
            LET'S <span style={{ color: 'var(--accent-cyan)' }}>CONNECT.</span>
          </h2>
        </div>

        {/* 3D Cinematic Telephone Interactive Stage */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '920px',
            margin: '0 auto 64px auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <ThreeDImageStage
            perspective={1200}
            maxTilt={8}
            glowColor="var(--glow-color)"
            showGlare={true}
            showFloorShadow={true}
            floatingIdle={true}
            borderRadius="24px"
          >
            <div style={{ width: '100%', height: '420px', position: 'relative' }}>
              <FrameScrubber
                folderPath="/assets/image_2"
                totalFrames={36}
                fallbackImage="/assets/image_2/telephone_smoke.jpg"
                mode="cursor"
                fit="cover"
                overlayTelemetry={true}
                telemetryLabel="TRANSMISSION // DIRECT DIAL INTERFACE"
              />
            </div>

            {/* Overlay Telemetry Caption */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px 28px',
                background: 'linear-gradient(to top, rgba(3, 5, 8, 0.95) 0%, rgba(3, 5, 8, 0.4) 60%, transparent 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                transform: 'translateZ(30px)',
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PhoneCall size={18} color="var(--accent-cyan)" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '0.05em',
                  }}
                >
                  DIAL: DIRECT TRANSMISSION TERMINAL
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <span>STATUS: FREQUENCY ACTIVE</span>
              </div>
            </div>
          </ThreeDImageStage>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '36px',
          }}
        >
          {/* Left Column: Coordinates & Channel Metadata */}
          <div
            className="glass-panel"
            style={{
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderLeft: '4px solid var(--accent-cyan)',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '16px',
                }}
              >
                Direct Coordinates
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '36px',
                }}
              >
                Whether you're looking to discuss AI systems engineering, recruit for open engineering positions, explore research collaboration, or commission custom creative development, transmission channels are open.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <a
                  href={`mailto:${portfolio.email}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-cyan)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(0, 242, 254, 0.1)',
                      border: '1px solid rgba(0, 242, 254, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Mail size={18} color="var(--accent-cyan)" />
                  </div>
                  <span>{portfolio.email}</span>
                </a>

                {portfolio.phone && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(255, 0, 85, 0.1)',
                        border: '1px solid rgba(255, 0, 85, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Phone size={18} color="var(--accent-magenta)" />
                    </div>
                    <span>{portfolio.phone}</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MapPin size={18} />
                  </div>
                  <span>{portfolio.location}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '40px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                gap: '16px',
              }}
            >
              {portfolio.linkedin && (
                <a
                  href={portfolio.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ padding: '10px 18px', fontSize: '0.8rem', textDecoration: 'none' }}
                >
                  <LinkedinIcon size={16} />
                  <span>LINKEDIN</span>
                </a>
              )}
              {portfolio.github && (
                <a
                  href={portfolio.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ padding: '10px 18px', fontSize: '0.8rem', textDecoration: 'none' }}
                >
                  <GithubIcon size={16} />
                  <span>GITHUB</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Direct Transmission Form */}
          <div
            className="glass-panel"
            style={{
              padding: '40px',
              borderTop: '4px solid var(--accent-cyan)',
            }}
          >
            {submitted ? (
              <div
                style={{
                  height: '100%',
                  minHeight: '340px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(0, 242, 254, 0.15)',
                    border: '2px solid var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px var(--glow-color)',
                  }}
                >
                  <CheckCircle2 size={32} color="var(--accent-cyan)" />
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    color: '#ffffff',
                  }}
                >
                  TRANSMISSION RECEIVED
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '400px',
                  }}
                >
                  Your message has been logged to the personal terminal. You will receive a direct reply shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label
                    htmlFor="contact-name"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    SENDER NAME // IDENTITY
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins (Recruiter / Lead Engineer)"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(5, 7, 11, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    ELECTRONIC MAIL // COORDINATE
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="sarah@organization.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(5, 7, 11, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    TRANSMISSION MESSAGE // DETAILS
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="Provide inquiry details, job specifications, or project scope..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(5, 7, 11, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitted}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '14px',
                    marginTop: '8px',
                    opacity: submitted ? 0.6 : 1,
                    cursor: submitted ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Send size={16} />
                  <span>{submitted ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
