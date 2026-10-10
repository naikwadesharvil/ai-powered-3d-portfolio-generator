import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import type { PortfolioData, UserRole } from './types/portfolio';
import { normalizePortfolioData } from './types/portfolioSchema';
import { ROLE_PROFILES } from './data/defaultProfiles';
import { Navbar } from './components/Navbar';
import { Hero3D } from './components/Hero3D';
import { WelcomeTransition } from './components/WelcomeTransition';
import { AboutBento } from './components/AboutBento';
import { SelectedWorks } from './components/SelectedWorks';
import { ExperienceServices } from './components/ExperienceServices';
import { CertificationsPublications } from './components/CertificationsPublications';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CreatorStudio } from './components/CreatorStudio';
import { ResumeModal } from './components/ResumeModal';
import { usePortfolioStore } from './store/portfolioStore';
import { themeTokensToCssVars } from './types/themeTokens';

export function App() {
  const portfolio = usePortfolioStore((s) => s.portfolio);
  const themeTokens = usePortfolioStore((s) => s.themeTokens);
  const setPortfolio = usePortfolioStore((s) => s.setPortfolio);

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Synchronize CSS custom property variables with active theme tokens
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = themeTokensToCssVars(themeTokens);
    Object.entries(cssVars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    root.style.setProperty('--card-bg', themeTokens.surface);
    root.style.setProperty('--card-border', `${themeTokens.accentPrimary}33`);
    root.style.setProperty('--glow-color', `${themeTokens.accentPrimary}4d`);
  }, [themeTokens]);

  const handleUpdatePortfolio = (updated: PortfolioData) => {
    setPortfolio(normalizePortfolioData(updated));
  };

  const handleSwitchRolePreset = (role: UserRole) => {
    const preset = ROLE_PROFILES[role];
    if (preset) {
      setPortfolio(normalizePortfolioData(preset));
    }
  };

  // Viewport Container Styling for Responsive Previews
  const getViewportStyle = (): React.CSSProperties => {
    if (previewMode === 'mobile') {
      return {
        width: '390px',
        minHeight: '844px',
        margin: '32px auto',
        borderRadius: '36px',
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(0, 242, 254, 0.3), 0 25px 50px rgba(0,0,0,0.8)',
        border: '12px solid #1a2234',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      };
    }
    if (previewMode === 'tablet') {
      return {
        width: '768px',
        minHeight: '1024px',
        margin: '32px auto',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(0, 242, 254, 0.25), 0 25px 50px rgba(0,0,0,0.8)',
        border: '10px solid #1a2234',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      };
    }
    return {
      width: '100%',
      minHeight: '100vh',
      margin: 0,
      position: 'relative',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: previewMode !== 'desktop' ? '#020306' : 'transparent',
        padding: previewMode !== 'desktop' ? '20px 0 60px' : 0,
        position: 'relative',
      }}
    >
      {/* Top Ambient Bar for Quick Role Switching */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 45,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(5, 7, 12, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          borderRadius: '9999px',
          padding: '6px 14px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px var(--glow-color)',
        }}
      >
        <button
          onClick={() => setIsStudioOpen(true)}
          style={{
            background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-magenta) 100%)',
            border: 'none',
            borderRadius: '9999px',
            padding: '6px 14px',
            color: '#000',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Sparkles size={14} />
          <span>STUDIO</span>
        </button>

        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />

        {/* Rapid Role Presets */}
        {(['student', 'job_seeker', 'professional', 'freelancer'] as UserRole[]).map((r) => {
          const active = portfolio.role === r;
          return (
            <button
              key={r}
              onClick={() => handleSwitchRolePreset(r)}
              title={`Switch to ${r.replace('_', ' ')} preset`}
              style={{
                background: active ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                border: active ? '1px solid var(--accent-cyan)' : 'none',
                borderRadius: '9999px',
                padding: '4px 10px',
                color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
              }}
            >
              {r === 'job_seeker' ? 'SEEKER' : r === 'professional' ? 'PRO' : r}
            </button>
          );
        })}
      </div>

      {/* Main Portfolio Rendering Container */}
      <div style={getViewportStyle()}>
        {/* Navigation Header */}
        <Navbar
          portfolio={portfolio}
          onOpenStudio={() => setIsStudioOpen(true)}
          onOpenResume={() => setIsResumeOpen(true)}
        />

        <main>
          {(() => {
            const rendered = new Set<string>();
            const order = portfolio.sectionOrder || [
              'hero',
              'welcome',
              'about',
              'projects',
              'experience',
              'publications',
              'contact',
            ];
            return order.map((sectionKey) => {
              if (sectionKey === 'hero' && portfolio.sectionVisibility.hero) {
                return <Hero3D portfolio={portfolio} key="hero" />;
              }
              if (sectionKey === 'welcome' && portfolio.sectionVisibility.welcome) {
                return <WelcomeTransition portfolio={portfolio} key="welcome" />;
              }
              if (sectionKey === 'about' && portfolio.sectionVisibility.about) {
                return (
                  <AboutBento
                    portfolio={portfolio}
                    key="about"
                    onOpenResume={() => setIsResumeOpen(true)}
                  />
                );
              }
              if (sectionKey === 'projects' && portfolio.sectionVisibility.projects) {
                return <SelectedWorks portfolio={portfolio} key="projects" />;
              }
              if (
                (sectionKey === 'experience' || sectionKey === 'services') &&
                (portfolio.sectionVisibility.experience || portfolio.sectionVisibility.services)
              ) {
                if (rendered.has('experience')) return null;
                rendered.add('experience');
                return <ExperienceServices portfolio={portfolio} key="experience" />;
              }
              if (
                (sectionKey === 'publications' || sectionKey === 'certifications') &&
                (portfolio.sectionVisibility.publications || portfolio.sectionVisibility.certifications)
              ) {
                if (rendered.has('publications')) return null;
                rendered.add('publications');
                return <CertificationsPublications portfolio={portfolio} key="publications" />;
              }
              if (sectionKey === 'contact' && portfolio.sectionVisibility.contact) {
                return <ContactSection portfolio={portfolio} key="contact" />;
              }
              return null;
            });
          })()}
        </main>

        {/* Section 8: Interactive Footer */}
        <Footer portfolio={portfolio} />
      </div>

      {/* Layer A: Portfolio Creator Studio Modal */}
      <CreatorStudio
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        portfolio={portfolio}
        onUpdatePortfolio={handleUpdatePortfolio}
        previewMode={previewMode}
        onChangePreviewMode={setPreviewMode}
        onOpenResume={() => setIsResumeOpen(true)}
      />

      {/* Layer B: Professional ATS Resume Studio & Preview Modal */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        portfolio={portfolio}
      />
    </div>
  );
}

export default App;
