import React from 'react';
import { CheckCircle2, MessageSquare, Terminal, Building2, Calendar } from 'lucide-react';
import type { PortfolioData } from '../types/portfolio';
import { sanitizeUrl } from '../utils/sanitize';
import { useReveal } from '../hooks/useReveal';

interface ExperienceServicesProps {
  portfolio: PortfolioData;
}

export const ExperienceServices: React.FC<ExperienceServicesProps> = ({ portfolio }) => {
  const isFreelancer = portfolio.role === 'freelancer';
  const sectionRef = useReveal<HTMLElement>();

  return (
    <section
      id={isFreelancer ? 'services' : 'experience'}
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '120px 24px',
        background: 'radial-gradient(ellipse at 50% 50%, #070d18 0%, #030508 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Anchor alias so both #services and #experience work smoothly */}
      <div id={isFreelancer ? 'experience' : 'services'} style={{ position: 'absolute', top: 0, left: 0 }} />

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Section Header */}
        <div className="reveal reveal-up" style={{ marginBottom: '56px', textAlign: 'left' }}>
          <div className="badge-neon" style={{ marginBottom: '14px' }}>
            <Terminal size={14} />
            <span>
              {isFreelancer ? 'SERVICES & PACKAGES // BOOKINGS' : 'TRACK RECORD // CAREER HISTORY'}
            </span>
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
            {isFreelancer ? (
              <>
                SERVICES & <span style={{ color: 'var(--accent-cyan)' }}>OFFERINGS.</span>
              </>
            ) : (
              <>
                EXPERIENCE & <span style={{ color: 'var(--accent-cyan)' }}>TIMELINE.</span>
              </>
            )}
          </h2>
        </div>

        {/* FREELANCER: Services & Pricing Packages */}
        {isFreelancer && portfolio.services.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '24px',
              marginBottom: '64px',
            }}
          >
            {portfolio.services.map((service, sIdx) => (
              <div
                key={service.id}
                className={`glass-panel reveal reveal-up stagger-${(sIdx % 6) + 1}`}
                style={{
                  padding: '36px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: '3px solid var(--accent-cyan)',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: '12px',
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.92rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      marginBottom: '24px',
                    }}
                  >
                    {service.description}
                  </p>

                  <div style={{ marginBottom: '24px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--accent-cyan)',
                        marginBottom: '10px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      KEY DELIVERABLES:
                    </div>
                    {service.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.85rem',
                          color: '#e2e8f0',
                          marginBottom: '8px',
                        }}
                      >
                        <CheckCircle2 size={14} color="var(--accent-cyan)" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    {service.startingPrice || 'Custom Quote'}
                  </span>
                  <a
                    href="#contact"
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none' }}
                  >
                    INQUIRE
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NON-FREELANCER: Career / Internship Timeline */}
        {(() => {
          const experienceList = (portfolio.experience && portfolio.experience.length > 0)
            ? portfolio.experience
            : (portfolio.experiences || []);

          if (isFreelancer || experienceList.length === 0) return null;

          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                marginBottom: '64px',
              }}
            >
              {experienceList.map((exp, eIdx) => {
                const bulletsList = (exp.bullets && exp.bullets.length > 0)
                  ? exp.bullets
                  : (exp.points || []);

                return (
                  <div
                    key={exp.id}
                    className={`glass-panel reveal reveal-up stagger-${(eIdx % 6) + 1}`}
                    style={{
                      padding: '32px',
                      borderLeft: '4px solid var(--accent-cyan)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <span>{exp.role}</span>
                          <span className="badge-neon" style={{ fontSize: '0.65rem' }}>
                            VERIFIED
                          </span>
                        </h3>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            color: 'var(--accent-cyan)',
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Building2 size={14} />
                          {(exp as any).companyUrl || (exp as any).link ? (
                            <a
                              href={sanitizeUrl((exp as any).companyUrl || (exp as any).link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                            >
                              {exp.company}
                            </a>
                          ) : (
                            <span>{exp.company}</span>
                          )}
                          {exp.location && <span>• {exp.location}</span>}
                        </div>
                      </div>

                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Calendar size={14} />
                        <span>{exp.period}</span>
                      </div>
                    </div>

                    {bulletsList.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        {bulletsList.map((pt, pIdx) => (
                          <div
                            key={pIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              marginBottom: '8px',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.92rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.6,
                            }}
                          >
                            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>&gt;</span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* FREELANCER: Client Testimonials */}
        {isFreelancer && portfolio.testimonials.length > 0 && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <div className="badge-magenta" style={{ marginBottom: '10px' }}>
                <MessageSquare size={14} />
                <span>CLIENT ENDORSEMENTS</span>
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                WHAT CLIENTS <span style={{ color: 'var(--accent-magenta)' }}>SAY.</span>
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '24px',
              }}
            >
              {portfolio.testimonials.map((test) => (
                <div
                  key={test.id}
                  className="glass-panel"
                  style={{
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      color: '#e2e8f0',
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                      marginBottom: '24px',
                    }}
                  >
                    "{test.feedback}"
                  </p>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#ffffff',
                      }}
                    >
                      {test.clientName}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: 'var(--accent-magenta)',
                      }}
                    >
                      {test.clientRole} • {test.company}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
