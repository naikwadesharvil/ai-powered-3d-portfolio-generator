import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Mail,
  MapPin,
  Sparkles,
  Phone,
} from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { themeTokensToCssVars } from '../types/themeTokens';

export const LivePortfolioPreview: React.FC = () => {
  const { portfolio, themeTokens } = usePortfolioStore();
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const cssVars = themeTokensToCssVars(themeTokens);

  const isVisible = (id: string) => {
    return portfolio.sectionVisibility?.[id] ?? true;
  };

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '360px',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#020306',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Top Preview Controls Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'rgba(5, 7, 12, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00ff88',
              boxShadow: '0 0 8px #00ff88',
            }}
          />
          <span style={{ fontSize: '0.78rem', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            LIVE PREVIEW (REAL-TIME REACTIVE)
          </span>
        </div>

        {/* Viewport Simulation Switches */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setViewportMode('desktop')}
            style={{
              background: viewportMode === 'desktop' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              border: viewportMode === 'desktop' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              color: viewportMode === 'desktop' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.5)',
              padding: '4px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
            }}
            title="Desktop 1280px"
          >
            <Monitor size={14} />
            <span className="hide-mobile">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('tablet')}
            style={{
              background: viewportMode === 'tablet' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              border: viewportMode === 'tablet' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              color: viewportMode === 'tablet' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.5)',
              padding: '4px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
            }}
            title="Tablet 768px"
          >
            <Tablet size={14} />
            <span className="hide-mobile">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('mobile')}
            style={{
              background: viewportMode === 'mobile' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              border: viewportMode === 'mobile' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              color: viewportMode === 'mobile' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.5)',
              padding: '4px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
            }}
            title="Mobile 360px"
          >
            <Smartphone size={14} />
            <span className="hide-mobile">Mobile</span>
          </button>
        </div>
      </div>

      {/* Scrollable Container with Simulated Viewport */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          padding: viewportMode === 'desktop' ? '0' : '20px',
          background: '#010204',
        }}
      >
        <div
          style={{
            ...cssVars as React.CSSProperties,
            width: viewportWidths[viewportMode],
            maxWidth: '100%',
            background: 'var(--bg-primary, #030508)',
            color: 'var(--text-primary, #ffffff)',
            fontFamily: 'var(--font-body, "Inter", sans-serif)',
            borderRadius: viewportMode === 'desktop' ? '0' : 'var(--border-radius, 12px)',
            border: viewportMode === 'desktop' ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: viewportMode === 'desktop' ? 'none' : '0 12px 40px rgba(0, 0, 0, 0.8)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '36px',
            transition: 'width 0.3s ease, border-radius 0.2s ease',
          }}
        >
          {/* Hero & Banner Section */}
          {isVisible('hero') && (
            <div
              style={{
                textAlign: 'center',
                padding: '36px 16px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)',
                borderRadius: 'var(--border-radius, 12px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  background: 'rgba(0, 242, 254, 0.1)',
                  border: '1px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.72rem',
                  marginBottom: '14px',
                }}
              >
                <Sparkles size={12} />
                <span>{portfolio.disciplineName || portfolio.branchName || 'ENGINEERING EXCELLENCE'}</span>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                  fontSize: viewportMode === 'mobile' ? '1.8rem' : '2.5rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '10px',
                  letterSpacing: '-0.02em',
                }}
              >
                {portfolio.name}
              </h1>

              <p
                style={{
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                  fontSize: viewportMode === 'mobile' ? '0.95rem' : '1.15rem',
                  fontWeight: 600,
                  maxWidth: '540px',
                  margin: '0 auto 16px',
                  lineHeight: 1.4,
                }}
              >
                {portfolio.tagline}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {portfolio.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="var(--accent-cyan)" />
                    {portfolio.location}
                  </span>
                )}
                {portfolio.email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={14} color="var(--accent-cyan)" />
                    {portfolio.email}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Bento High-Level Stats */}
          {isVisible('about') && portfolio.bentoStats && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: viewportMode === 'mobile' ? '1fr' : 'repeat(3, 1fr)',
                gap: '12px',
              }}
            >
              {[portfolio.bentoStats.stat1, portfolio.bentoStats.stat2, portfolio.bentoStats.stat3].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--border-radius, 12px)',
                    background: 'var(--card-surface, rgba(255, 255, 255, 0.04))',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-secondary)' }}>
                    {stat.title}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '4px 0' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                    {stat.subtext}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* About / Bio Section */}
          {isVisible('about') && (
            <div
              style={{
                padding: '20px',
                borderRadius: 'var(--border-radius, 12px)',
                background: 'var(--card-surface, rgba(255, 255, 255, 0.03))',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>About</span>
                <span style={{ height: '2px', flex: 1, background: 'rgba(255,255,255,0.08)' }} />
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                {portfolio.fullBio || portfolio.shortBio}
              </p>
            </div>
          )}

          {/* Verified Projects Section */}
          {isVisible('projects') && (
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Featured Projects ({portfolio.projects.length})</span>
                <span style={{ height: '2px', flex: 1, background: 'rgba(255,255,255,0.08)' }} />
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: viewportMode === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '14px',
                }}
              >
                {portfolio.projects.map((proj) => (
                  <div
                    key={proj.id}
                    style={{
                      padding: '18px',
                      borderRadius: 'var(--border-radius, 12px)',
                      background: 'var(--card-surface, rgba(255, 255, 255, 0.03))',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>
                          {proj.title}
                        </h4>
                        <ExternalLink size={14} color="var(--accent-cyan)" />
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 10px' }}>
                        {proj.description}
                      </p>
                      {proj.metrics && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono, monospace)', marginBottom: '8px' }}>
                          ⚡ {proj.metrics}
                        </div>
                      )}
                    </div>

                    {/* Tools / Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(proj.tools || proj.tags || []).slice(0, 4).map((tool, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            fontSize: '0.68rem',
                            color: 'rgba(255,255,255,0.8)',
                            fontFamily: 'var(--font-mono, monospace)',
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Skills Section */}
          {isVisible('skills') && (
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Core Competencies ({portfolio.skills.length})</span>
                <span style={{ height: '2px', flex: 1, background: 'rgba(255,255,255,0.08)' }} />
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {portfolio.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 242, 254, 0.08)',
                      border: '1px solid rgba(0, 242, 254, 0.25)',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section with Preserved Iconic Telephone Visual */}
          {isVisible('contact') && (
            <div
              style={{
                padding: '24px',
                borderRadius: 'var(--border-radius, 12px)',
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05), rgba(255, 0, 85, 0.05))',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Phone size={18} color="var(--accent-magenta)" />
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                    Let's Connect & Collaborate
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Ready to discuss capstone projects, engineering challenges, or full-time opportunities.
                </p>
                <div style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono, monospace)' }}>
                  {portfolio.email || 'alex.chen@engineering.io'}
                </div>
              </div>

              {/* Telephone Visual Asset */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <img
                  src="/assets/telephone.png"
                  alt="Telephone Visual"
                  style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                  onError={(e) => {
                    // Fallback to Phone icon if image asset not in dist root
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
