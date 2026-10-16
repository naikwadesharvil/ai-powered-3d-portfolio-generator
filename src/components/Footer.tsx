import React from 'react';
import { ArrowUp, ArrowRight } from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from './Icons';
import type { PortfolioData } from '../types/portfolio';
import { sanitizeUrl } from '../utils/sanitize';
import { useReveal } from '../hooks/useReveal';

interface FooterProps {
  portfolio: PortfolioData;
}

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC<FooterProps> = ({ portfolio }) => {
  const footerRef = useReveal<HTMLElement>();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      ref={footerRef}
      style={{
        width: '100%',
        padding: '80px 24px 40px',
        background: '#020306',
        borderTop: '1px solid rgba(0, 242, 254, 0.15)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        className="reveal reveal-up"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '48px',
            marginBottom: '64px',
          }}
        >
          {/* Column 1: Brand & Philosophy */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.05em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {(portfolio.name || 'Portfolio').split(' ')[0]}
              <span style={{ color: 'var(--accent-cyan)' }}>.</span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                maxWidth: '320px',
                marginBottom: '24px',
              }}
            >
              ARCHITECTURE AND INTERACTION DESIGN FOR NEXT-GENERATION DIGITAL EXPERIENCES AND PRODUCTION-GRADE AI SYSTEMS.
            </p>
            <div className="badge-neon" style={{ fontSize: '0.68rem' }}>
              <span>PROD_VERSION_2.6 // AGY_COMPLIANT</span>
            </div>
          </div>

          {/* Column 2: Quick Jump Directory */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--accent-cyan)',
                marginBottom: '20px',
              }}
            >
              DIRECTORY // NAVIGATION
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'HOME', href: '#hero' },
                { label: 'ABOUT', href: '#about' },
                { label: 'PROJECTS', href: '#projects' },
                { label: 'EXPERIENCE', href: '#experience' },
                { label: 'CONTACT', href: '#contact' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-cyan)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  &gt; {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Social Network Handles */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--accent-magenta)',
                marginBottom: '20px',
              }}
            >
              SOCIAL NETWORKS // HANDLES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {portfolio.github && portfolio.github.trim() && (
                <a
                  href={sanitizeUrl(portfolio.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <GithubIcon size={14} />
                  <span>GITHUB // {portfolio.github.replace(/^https?:\/\/(www\.)?github\.com\/?/i, '').replace(/\/$/, '') || 'PROFILE'}</span>
                </a>
              )}
              {portfolio.linkedin && portfolio.linkedin.trim() && (
                <a
                  href={sanitizeUrl(portfolio.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <LinkedinIcon size={14} />
                  <span>LINKEDIN // {portfolio.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/)?/i, '').replace(/\/$/, '') || 'PROFILE'}</span>
                </a>
              )}
              {portfolio.twitter && portfolio.twitter.trim() && (
                <a
                  href={sanitizeUrl(portfolio.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <TwitterIcon size={14} />
                  <span>X // {portfolio.twitter.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\/?/i, '').replace(/\/$/, '') || 'TRANSMISSIONS'}</span>
                </a>
              )}
              {!portfolio.github?.trim() && !portfolio.linkedin?.trim() && !portfolio.twitter?.trim() && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                  }}
                >
                  NO PUBLIC SOCIAL LINKS CONNECTED
                </span>
              )}
            </div>
          </div>

          {/* Column 4: Broadcast Transmission Input */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: '#ffffff',
                marginBottom: '16px',
              }}
            >
              BROADCAST_LINK // SUBSCRIBE
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
              }}
            >
              Receive updates on newly published AI prototypes and 3D web graphics experiments.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="YOUR_EMAIL@DOMAIN.COM"
                aria-label="Email address for broadcast newsletter"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  outline: 'none',
                }}
              />
              <button
                className="btn-primary"
                style={{ padding: '10px 14px', borderRadius: '6px' }}
                title="Send"
                aria-label="Subscribe to broadcast updates"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div
          style={{
            paddingTop: '32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
            }}
          >
            © {CURRENT_YEAR} {(portfolio.name || 'YOUR NAME').toUpperCase()}. BUILT WITH AI // ALL RIGHTS RESERVED.
          </div>

          <button
            onClick={scrollToTop}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#ffffff',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.color = 'var(--accent-cyan)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#ffffff';
            }}
          >
            <span>BACK TO TOP</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};
