import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Download, Menu, X } from 'lucide-react';
import type { PortfolioData } from '../types/portfolio';
import { getFlattenedSkills } from '../types/portfolioSchema';

interface NavbarProps {
  portfolio: PortfolioData;
  onOpenStudio: () => void;
  onOpenResume?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ portfolio, onOpenStudio, onOpenResume }) => {
  const [scrolled, setScrolled] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const triggerResume = () => {
    if (onOpenResume) {
      onOpenResume();
    } else {
      handleDownloadResume();
    }
  };

  const handleDownloadResume = () => {
    const flattenedSkills = getFlattenedSkills(portfolio.skills);
    const resumeContent = `# ${portfolio.name}
${portfolio.tagline}
Contact: ${portfolio.email} | Location: ${portfolio.location}
LinkedIn: ${portfolio.linkedin || 'N/A'} | GitHub: ${portfolio.github || 'N/A'}

## PROFESSIONAL SUMMARY
${portfolio.fullBio}

## EDUCATION
${portfolio.education.map((e) => `- ${e.degree} | ${e.institution} (${e.period}) [${e.score || ''}]`).join('\n')}

## TECHNICAL SKILLS
${flattenedSkills.map((s) => `- ${s.name} (${s.category})`).join('\n')}

## PROJECTS
${portfolio.projects.map((p) => `### ${p.title}\n${p.description || ''}\nTags: ${(p.tools || p.tags || []).join(', ')}\nMetrics: ${p.metrics || 'N/A'}\n`).join('\n')}

## CERTIFICATIONS
${portfolio.certifications.map((c) => `- ${c.name} (${c.issuer})`).join('\n')}
`;
    const blob = new Blob([resumeContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${portfolio.name.replace(/\s+/g, '_')}_Resume.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [activeSection, setActiveSection] = useState<string>('hero');

  // Track active section for navigation highlighting
  useEffect(() => {
    const sectionIds = ['hero', 'about', 'services', 'experience', 'projects', 'contact'];
    const handleScrollSpy = () => {
      setScrolled(window.scrollY > 40);
      const scrollPos = window.scrollY + 120;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  // Keyboard navigation & Escape key support for mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Subtle futuristic ambient drone synthesizer using Web Audio API
  const toggleAudio = () => {
    if (!audioActive) {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A drone
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setAudioCtx(ctx);
        setAudioActive(true);
      } catch {
        setAudioActive(false);
      }
    } else {
      if (audioCtx) {
        audioCtx.close();
        setAudioCtx(null);
      }
      setAudioActive(false);
    }
  };

  const navLinks = [
    { label: 'HOME', href: '#hero' },
    { label: 'ABOUT', href: '#about' },
    ...(portfolio.sectionVisibility.services ? [{ label: 'SERVICES', href: '#services' }] : []),
    ...(portfolio.sectionVisibility.experience ? [{ label: 'EXPERIENCE', href: '#experience' }] : []),
    { label: 'PORTFOLIO', href: '#projects' },
    { label: 'CONTACT', href: '#contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(5, 7, 11, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0, 242, 254, 0.15)' : '1px solid transparent',
        padding: scrolled ? '14px 28px' : '22px 36px',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand / Name Logo */}
        <a
          href="#hero"
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-magenta) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#030712',
              fontFamily: 'var(--font-display)',
              boxShadow: '0 0 15px var(--glow-color)',
            }}
          >
            {portfolio.name.charAt(0)}
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.05rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {portfolio.name.split(' ')[0]}
              <span style={{ color: 'var(--accent-cyan)' }}>.</span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                letterSpacing: '0.12em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              DIGITAL CRAFT // {portfolio.role.toUpperCase()}
            </div>
          </div>
        </a>

        {/* Center Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = link.href.replace('#', '') === activeSection;
            return (
              <a
                key={link.label}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  padding: '4px 0',
                  borderBottom: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--accent-cyan)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right Action Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleAudio}
            title={audioActive ? 'Mute ambient sound' : 'Enable ambient sound'}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: audioActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {audioActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* 1-Click ATS Resume Studio & Download */}
          <button
            onClick={triggerResume}
            title="Download ATS-Friendly Resume"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#ffffff',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.color = 'var(--accent-cyan)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = '#ffffff';
            }}
          >
            <Download size={13} />
            <span>RESUME</span>
          </button>

          {/* AI Creator Studio Trigger */}
          <button
            onClick={onOpenStudio}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(255, 0, 85, 0.15) 100%)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#ffffff',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0, 242, 254, 0.25)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 242, 254, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 242, 254, 0.25)';
            }}
          >
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span>AI AUTOPILOT</span>
          </button>

          {/* Direct Contact Button */}
          <a
            href="#contact"
            style={{
              textDecoration: 'none',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              transition: 'all 0.2s ease',
            }}
            className="contact-btn"
          >
            CONNECT
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-toggle"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(3, 5, 9, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '40px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-magenta) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: '#030712',
                }}
              >
                {portfolio.name.charAt(0)}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#ffffff',
                  letterSpacing: '0.05em',
                }}
              >
                {portfolio.name.toUpperCase()}
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  textDecoration: 'none',
                  letterSpacing: '0.05em',
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{link.label}</span>
                <span style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>→</span>
              </a>
            ))}
          </nav>

          {/* Mobile Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: 'auto' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStudio();
              }}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                justifyContent: 'center',
                fontSize: '0.95rem',
              }}
            >
              <Sparkles size={16} />
              <span>OPEN AI GENERATOR STUDIO</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                triggerResume();
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <Download size={15} />
              <span>DOWNLOAD RESUME (.MD)</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .contact-btn { display: inline-flex !important; }
          .mobile-menu-toggle { display: none !important; }
        }
        @media (max-width: 859px) {
          .mobile-menu-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
};
