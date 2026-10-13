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
import { NotFoundPage } from './components/NotFoundPage';
import { usePortfolioStore } from './store/portfolioStore';
import { CURATED_THEME_PRESETS, themeTokensToCssVars } from './types/themeTokens';
import { getPublishedPortfolio } from './services/portfolioApi';

function updateDocumentMeta(p: PortfolioData) {
  const name = p.name || p.profile?.name || 'Engineer';
  const tagline = p.tagline || p.profile?.tagline || 'Interactive 3D Portfolio';
  const bio = p.fullBio || p.summary?.fullBio || p.shortBio || tagline;
  const pageTitle = `${name} — ${tagline} | 3D Portfolio`;

  document.title = pageTitle;

  const setMeta = (nameOrProp: string, content: string, isProp = false) => {
    const selector = isProp ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`;
    let tag = document.querySelector(selector) as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement('meta');
      if (isProp) {
        tag.setAttribute('property', nameOrProp);
      } else {
        tag.setAttribute('name', nameOrProp);
      }
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  setMeta('description', bio);
  setMeta('og:title', pageTitle, true);
  setMeta('og:description', bio, true);
  setMeta('og:url', window.location.href, true);
  setMeta('og:type', 'website', true);

  // Search engine indexing policy (Phase 7c)
  const isNoIndex = Boolean(p.noIndex ?? p.privacy?.noIndex);
  let robotsTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (isNoIndex) {
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    robotsTag.content = 'noindex, nofollow';
  } else if (robotsTag) {
    robotsTag.remove();
  }
}

export function App() {
  const portfolio = usePortfolioStore((s) => s.portfolio);
  const themeTokens = usePortfolioStore((s) => s.themeTokens);
  const setPortfolio = usePortfolioStore((s) => s.setPortfolio);

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [StudioComponent, setStudioComponent] = useState<React.ComponentType<any> | null>(null);
  const [ResumeComponent, setResumeComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (isStudioOpen && !StudioComponent) {
      import('./components/CreatorStudio').then((mod) => {
        setStudioComponent(() => mod.default);
      });
    }
  }, [isStudioOpen, StudioComponent]);

  useEffect(() => {
    if (isResumeOpen && !ResumeComponent) {
      import('./components/ResumeModal').then((mod) => {
        setResumeComponent(() => mod.default);
      });
    }
  }, [isResumeOpen, ResumeComponent]);

  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const slugMatch = currentPath.match(/^\/p\/([a-zA-Z0-9_-]+)\/?$/);
  const isSlugRoute = !!slugMatch;
  const currentSlug = slugMatch ? slugMatch[1] : null;

  const [publicPortfolio, setPublicPortfolio] = useState<PortfolioData | null>(null);
  const [publicLoading, setPublicLoading] = useState<boolean>(isSlugRoute);
  const [publicError, setPublicError] = useState<string | null>(null);

  useEffect(() => {
    if (isSlugRoute && currentSlug) {
      setPublicLoading(true);
      setPublicError(null);
      getPublishedPortfolio(currentSlug).then((res) => {
        if (res.success && res.portfolio) {
          const norm = normalizePortfolioData(res.portfolio);
          setPublicPortfolio(norm);
          updateDocumentMeta(norm);

          const foundPreset =
            CURATED_THEME_PRESETS.find((p) => p.id === norm.theme) || CURATED_THEME_PRESETS[0];
          const root = document.documentElement;
          const cssVars = themeTokensToCssVars(foundPreset);
          Object.entries(cssVars).forEach(([key, val]) => {
            root.style.setProperty(key, val);
          });
          root.style.setProperty('--card-bg', foundPreset.surface);
          root.style.setProperty('--card-border', `${foundPreset.accentPrimary}33`);
          root.style.setProperty('--glow-color', `${foundPreset.accentPrimary}4d`);
        } else {
          setPublicError(res.error || 'Portfolio not found or has been unpublished.');
        }
        setPublicLoading(false);
      });
    }
  }, [isSlugRoute, currentSlug]);

  const is404 =
    !isSlugRoute &&
    currentPath !== '/' &&
    currentPath !== '/index.html' &&
    !currentPath.startsWith('/?');

  // Synchronize CSS custom property variables with active theme tokens (when in studio / preview mode)
  useEffect(() => {
    if (!isSlugRoute) {
      const root = document.documentElement;
      const cssVars = themeTokensToCssVars(themeTokens);
      Object.entries(cssVars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
      root.style.setProperty('--card-bg', themeTokens.surface);
      root.style.setProperty('--card-border', `${themeTokens.accentPrimary}33`);
      root.style.setProperty('--glow-color', `${themeTokens.accentPrimary}4d`);
    }
  }, [themeTokens, isSlugRoute]);

  const handleUpdatePortfolio = (updated: PortfolioData) => {
    if (updated !== portfolio) {
      setPortfolio(normalizePortfolioData(updated));
    }
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

  // Public Slug Route: Loading State
  if (isSlugRoute && publicLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030508',
          color: '#ffffff',
          fontFamily: 'var(--font-mono)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            border: '3px solid rgba(0, 242, 254, 0.2)',
            borderTopColor: 'var(--accent-cyan)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', letterSpacing: '0.12em' }}>
          LOADING 3D PORTFOLIO TELEMETRY...
        </div>
      </div>
    );
  }

  // Public Slug Route: Not Found or Unmounted
  if (isSlugRoute && (publicError || !publicPortfolio)) {
    return (
      <NotFoundPage
        title="Published Portfolio Not Found"
        message={publicError || 'The requested portfolio does not exist, has expired, or has been unpublished.'}
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }}
      />
    );
  }

  // Generic 404 Route
  if (is404) {
    return (
      <NotFoundPage
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }}
      />
    );
  }

  const activePortfolio = isSlugRoute && publicPortfolio ? publicPortfolio : portfolio;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: previewMode !== 'desktop' ? '#020306' : 'transparent',
        padding: previewMode !== 'desktop' ? '20px 0 60px' : 0,
        position: 'relative',
      }}
    >
      {/* Top Ambient Bar for Quick Role Switching (Only in studio / authoring mode) */}
      {!isSlugRoute && (
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
            id="launch-studio-btn"
            data-testid="studio-launch-btn"
            onClick={() => {
              setIsStudioOpen(true);
            }}
            style={{
              backgroundColor: 'var(--accent-cyan)',
              backgroundImage: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-magenta) 100%)',
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
      )}

      {/* Main Portfolio Rendering Container */}
      <div style={getViewportStyle()}>
        {/* Navigation Header */}
        <Navbar
          portfolio={activePortfolio}
          onOpenStudio={() => !isSlugRoute && setIsStudioOpen(true)}
          onOpenResume={() => setIsResumeOpen(true)}
        />

        <main>
          {(() => {
            const rendered = new Set<string>();
            const order = activePortfolio.sectionOrder || [
              'hero',
              'welcome',
              'about',
              'projects',
              'experience',
              'publications',
              'contact',
            ];
            return order.map((sectionKey) => {
              if (sectionKey === 'hero' && activePortfolio.sectionVisibility.hero) {
                return <Hero3D portfolio={activePortfolio} key="hero" />;
              }
              if (sectionKey === 'welcome' && activePortfolio.sectionVisibility.welcome) {
                return <WelcomeTransition portfolio={activePortfolio} key="welcome" />;
              }
              if (sectionKey === 'about' && activePortfolio.sectionVisibility.about) {
                return (
                  <AboutBento
                    portfolio={activePortfolio}
                    key="about"
                    onOpenResume={() => setIsResumeOpen(true)}
                  />
                );
              }
              if (sectionKey === 'projects' && activePortfolio.sectionVisibility.projects) {
                return <SelectedWorks portfolio={activePortfolio} key="projects" />;
              }
              if (
                (sectionKey === 'experience' || sectionKey === 'services') &&
                (activePortfolio.sectionVisibility.experience || activePortfolio.sectionVisibility.services)
              ) {
                if (rendered.has('experience')) return null;
                rendered.add('experience');
                return <ExperienceServices portfolio={activePortfolio} key="experience" />;
              }
              if (
                (sectionKey === 'publications' || sectionKey === 'certifications' || sectionKey === 'credentials') &&
                (activePortfolio.sectionVisibility.publications || activePortfolio.sectionVisibility.certifications || (activePortfolio.sectionVisibility as any).credentials)
              ) {
                if (rendered.has('credentials')) return null;
                rendered.add('credentials');
                return <CertificationsPublications portfolio={activePortfolio} key="credentials" />;
              }
              if (sectionKey === 'contact' && activePortfolio.sectionVisibility.contact) {
                return <ContactSection portfolio={activePortfolio} key="contact" />;
              }
              return null;
            });
          })()}
        </main>

        {/* Section 8: Interactive Footer */}
        <Footer portfolio={activePortfolio} />
      </div>

      {!isSlugRoute && isStudioOpen && StudioComponent && (
        <StudioComponent
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          portfolio={portfolio}
          onUpdatePortfolio={handleUpdatePortfolio}
          previewMode={previewMode}
          onChangePreviewMode={setPreviewMode}
          onOpenResume={() => setIsResumeOpen(true)}
        />
      )}

      {/* Layer B: Professional ATS Resume Studio & Preview Modal */}
      {isResumeOpen && ResumeComponent && (
        <ResumeComponent
          isOpen={isResumeOpen}
          onClose={() => setIsResumeOpen(false)}
          portfolio={activePortfolio}
        />
      )}
    </div>
  );
}

export default App;
