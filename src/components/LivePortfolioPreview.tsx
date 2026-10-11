import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  MapPin,
  Mail,
} from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { themeTokensToCssVars } from '../types/themeTokens';
import { AboutBento } from './AboutBento';
import { SelectedWorks } from './SelectedWorks';
import { ExperienceServices } from './ExperienceServices';
import { CertificationsPublications } from './CertificationsPublications';
import { ContactSection } from './ContactSection';

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

          {/* Real Section Components (Shared with Live Site) */}
          {(() => {
            const rendered = new Set<string>();
            const order = portfolio.sectionOrder || [
              'about',
              'projects',
              'experience',
              'publications',
              'contact',
            ];

            return order.map((sectionKey) => {
              if (sectionKey === 'about' && isVisible('about')) {
                return (
                  <div key="about" style={{ width: '100%' }}>
                    <AboutBento portfolio={portfolio} onOpenResume={() => {}} />
                  </div>
                );
              }
              if (sectionKey === 'projects' && isVisible('projects')) {
                return (
                  <div key="projects" style={{ width: '100%' }}>
                    <SelectedWorks portfolio={portfolio} />
                  </div>
                );
              }
              if (
                (sectionKey === 'experience' || sectionKey === 'services') &&
                (isVisible('experience') || isVisible('services'))
              ) {
                if (rendered.has('experience')) return null;
                rendered.add('experience');
                return (
                  <div key="experience" style={{ width: '100%' }}>
                    <ExperienceServices portfolio={portfolio} />
                  </div>
                );
              }
              if (
                (sectionKey === 'publications' || sectionKey === 'certifications') &&
                (isVisible('publications') || isVisible('certifications'))
              ) {
                if (rendered.has('publications')) return null;
                rendered.add('publications');
                return (
                  <div key="publications" style={{ width: '100%' }}>
                    <CertificationsPublications portfolio={portfolio} />
                  </div>
                );
              }
              if (sectionKey === 'contact' && isVisible('contact')) {
                return (
                  <div key="contact" style={{ width: '100%' }}>
                    <ContactSection portfolio={portfolio} />
                  </div>
                );
              }
              return null;
            });
          })()}
        </div>
      </div>
    </div>
  );
};
