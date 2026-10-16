import React from 'react';
import { BookOpen, ShieldCheck, Trophy, Terminal, ExternalLink } from 'lucide-react';
import type { PortfolioData } from '../types/portfolio';
import { sanitizeUrl } from '../utils/sanitize';
import { useReveal } from '../hooks/useReveal';

interface CertificationsPublicationsProps {
  portfolio: PortfolioData;
}

export const CertificationsPublications: React.FC<CertificationsPublicationsProps> = ({
  portfolio,
}) => {
  const sectionRef = useReveal<HTMLElement>();
  const hasPublications =
    portfolio.sectionVisibility.publications && portfolio.publications.length > 0;
  const hasCertifications =
    portfolio.sectionVisibility.certifications && portfolio.certifications.length > 0;

  if (!hasPublications && !hasCertifications) return null;

  return (
    <section
      id="credentials"
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '120px 24px',
        background: '#040609',
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
        <div className="reveal reveal-up" style={{ marginBottom: '56px', textAlign: 'left' }}>
          <div className="badge-neon" style={{ marginBottom: '14px' }}>
            <Terminal size={14} />
            <span>CREDENTIALS // ACADEMIC & PROFESSIONAL RECOGNITION</span>
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
            RESEARCH & <span style={{ color: 'var(--accent-cyan)' }}>CREDENTIALS.</span>
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Research & Publications Column */}
          {hasPublications && (
            <div className="reveal reveal-up stagger-1">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '24px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                  color: 'var(--accent-cyan)',
                }}
              >
                <BookOpen size={18} />
                <span>PEER-REVIEWED PUBLICATIONS</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {portfolio.publications.map((pub, pIdx) => (
                  <div
                    key={pub.id}
                    className={`glass-panel reveal reveal-up stagger-${(pIdx % 6) + 1}`}
                    style={{
                      padding: '28px',
                      borderLeft: pub.award
                        ? '4px solid #f59e0b'
                        : '4px solid var(--accent-cyan)',
                    }}
                  >
                    {pub.award && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid #f59e0b',
                          borderRadius: '9999px',
                          padding: '4px 12px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          color: '#fbbf24',
                          fontWeight: 600,
                          marginBottom: '12px',
                        }}
                      >
                        <Trophy size={12} />
                        <span>{pub.award}</span>
                      </div>
                    )}
                    <h3
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        lineHeight: 1.4,
                        marginBottom: '10px',
                      }}
                    >
                      {pub.link ? (
                        <a
                          href={sanitizeUrl(pub.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#ffffff',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>{pub.title}</span>
                          <ExternalLink size={13} style={{ color: 'var(--accent-cyan)' }} />
                        </a>
                      ) : (
                        pub.title
                      )}
                    </h3>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {pub.publisher} • {pub.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Column */}
          {hasCertifications && (
            <div className="reveal reveal-up stagger-2">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '24px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                  color: 'var(--accent-magenta)',
                }}
              >
                <ShieldCheck size={18} />
                <span>INDUSTRY CERTIFICATIONS</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {portfolio.certifications.map((cert, cIdx) => (
                  <div
                    key={cert.id}
                    className={`glass-panel reveal reveal-up stagger-${(cIdx % 6) + 1}`}
                    style={{
                      padding: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderLeft: '4px solid var(--accent-magenta)',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          marginBottom: '6px',
                        }}
                      >
                        {cert.credentialUrl ? (
                          <a
                            href={sanitizeUrl(cert.credentialUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#ffffff',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>{cert.name}</span>
                            <ExternalLink size={13} style={{ color: 'var(--accent-magenta)' }} />
                          </a>
                        ) : (
                          cert.name
                        )}
                      </h3>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {cert.issuer} {cert.date ? `• ${cert.date}` : ''}
                      </div>
                    </div>
                    <span className="badge-magenta" style={{ fontSize: '0.65rem' }}>
                      VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
