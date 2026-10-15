import React, { useState, useEffect } from 'react';
import { Activity, Compass, Sparkles, ArrowRight } from 'lucide-react';
import type { PortfolioData } from '../types/portfolio';
import { FrameScrubber } from './FrameScrubber';
import { ThreeDImageStage } from './ThreeDImageStage';
import { HologramCard } from './HologramCard';

interface Hero3DProps {
  portfolio: PortfolioData;
  onOpenStudio?: () => void;
  isPublicPage?: boolean;
}

export const Hero3D: React.FC<Hero3DProps> = ({ portfolio, onOpenStudio, isPublicPage }) => {
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentFrameNum, setCurrentFrameNum] = useState(1);
  const [rotationDeg, setRotationDeg] = useState(180);

  // Live Timezone Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#050505',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '88px',
        paddingBottom: '50px',
      }}
    >
      {/* Background Subtle Grid & Radial Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.08) 0%, rgba(5, 5, 5, 0.95) 75%), linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Left Monospace Telemetry Readout */}
      <div
        style={{
          position: 'absolute',
          top: '90px',
          left: '36px',
          zIndex: 25,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          color: 'rgba(255, 255, 255, 0.85)',
          background: 'rgba(5, 5, 5, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '12px 18px',
          borderRadius: '8px',
          borderLeft: '2px solid var(--accent-cyan)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
        className="hud-top-left"
      >
        <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)' }} />
          <span>STATUS: ONLINE // 2026</span>
        </div>
        <div>SESSION: #AGY-PORTFOLIO-9042</div>
        <div style={{ color: 'var(--text-secondary)' }}>
          DISCIPLINE: <span style={{ color: '#fff' }}>{portfolio.branchName ? portfolio.branchName.toUpperCase() : (portfolio.branch || 'ENGINEERING').toUpperCase()}</span>
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.68)', fontSize: '0.65rem' }}>
          FRAME SCRUBBER: 360° CURSOR ENGINE ACTIVE
        </div>
      </div>

      {/* Top Right Monospace Telemetry Readout */}
      <div
        style={{
          position: 'absolute',
          top: '90px',
          right: '36px',
          zIndex: 25,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          color: 'rgba(255, 255, 255, 0.85)',
          background: 'rgba(5, 5, 5, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '12px 18px',
          borderRadius: '8px',
          borderRight: '2px solid var(--accent-magenta)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
        className="hud-top-right"
      >
        <div style={{ color: 'var(--accent-magenta)', fontWeight: 700 }}>
          {currentTimeStr || '12:00:00 PM UTC'}
        </div>
        <div>THROUGHPUT: 124.8 MB/S</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <span>60 FPS [RENDER PIPELINE]</span>
          <Activity size={12} color="var(--accent-cyan)" />
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.68)', fontSize: '0.65rem' }}>
          THEME: {portfolio.theme.toUpperCase()}
        </div>
      </div>

      {/* Pitch Header & Value Proposition */}
      <div
        className="hero-value-prop"
        style={{
          position: 'relative',
          zIndex: 25,
          width: '100%',
          maxWidth: '840px',
          padding: '16px 20px 0',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '28px',
        }}
      >
        {/* Main Pitch Headline */}
        <h1
          data-testid="hero-headline"
          style={{
            fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
            fontSize: 'clamp(2rem, 4.8vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            margin: '0 0 12px 0',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-cyan, #00f2fe) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(0, 242, 254, 0.3)',
          }}
        >
          Turn your details into a 3D hologram portfolio
        </h1>

        {/* One-Line Subtitle */}
        <p
          data-testid="hero-subtitle"
          style={{
            fontFamily: 'var(--font-body, "Inter", sans-serif)',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
            color: 'rgba(255, 255, 255, 0.82)',
            maxWidth: '680px',
            margin: '0 auto 18px',
            lineHeight: 1.5,
          }}
        >
          Generate an interactive, holographic 3D personal portfolio and ATS resume in seconds.
        </p>

        {/* 3-Step Strip: Enter details, Generate, Share your 3D portfolio */}
        <div
          data-testid="hero-steps-strip"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px 12px',
            padding: '8px 20px',
            borderRadius: '999px',
            background: 'rgba(5, 7, 12, 0.85)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            backdropFilter: 'blur(12px)',
            marginBottom: '22px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontFamily: 'var(--font-mono, monospace)', color: '#ffffff' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.2)', border: '1px solid var(--accent-cyan, #00f2fe)', color: 'var(--accent-cyan, #00f2fe)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>1</span>
            <span>Enter details</span>
          </span>
          <span style={{ color: 'var(--accent-cyan, #00f2fe)', fontSize: '0.75rem' }}>→</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontFamily: 'var(--font-mono, monospace)', color: '#ffffff' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.2)', border: '1px solid var(--accent-cyan, #00f2fe)', color: 'var(--accent-cyan, #00f2fe)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>2</span>
            <span>Generate</span>
          </span>
          <span style={{ color: 'var(--accent-cyan, #00f2fe)', fontSize: '0.75rem' }}>→</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontFamily: 'var(--font-mono, monospace)', color: '#ffffff' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.2)', border: '1px solid var(--accent-cyan, #00f2fe)', color: 'var(--accent-cyan, #00f2fe)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>3</span>
            <span>Share your 3D portfolio</span>
          </span>
        </div>

        {/* Prominent "Create My Portfolio" Button */}
        <div>
          <button
            id="hero-create-portfolio-btn"
            data-testid="hero-create-portfolio-btn"
            onClick={() => {
              if (onOpenStudio) {
                onOpenStudio();
              } else if (isPublicPage) {
                window.location.href = '/';
              }
            }}
            style={{
              backgroundColor: 'var(--accent-cyan, #00f2fe)',
              backgroundImage: 'linear-gradient(135deg, var(--accent-cyan, #00f2fe) 0%, var(--accent-magenta, #ff0055) 100%)',
              border: 'none',
              borderRadius: '999px',
              padding: '16px 36px',
              color: '#000000',
              fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
              fontSize: '1rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 0 35px rgba(0, 242, 254, 0.55), 0 10px 25px rgba(0, 0, 0, 0.6)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 45px rgba(0, 242, 254, 0.8), 0 15px 30px rgba(0, 0, 0, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(0, 242, 254, 0.55), 0 10px 25px rgba(0, 0, 0, 0.6)';
            }}
          >
            <Sparkles size={18} />
            <span>CREATE MY PORTFOLIO</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* 3D Showcase: Left = HologramCard, Right = 360° Portrait Scrubber */}
      <div
        className="hero-showcase-grid"
        style={{
          width: '100%',
          maxWidth: '1240px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          margin: '0 auto 36px',
          position: 'relative',
          zIndex: 20,
          padding: '0 20px',
        }}
      >
        {/* HologramCard 3D Component */}
        <div
          className="hero-hologram-slot"
          style={{
            flex: '1 1 380px',
            maxWidth: '480px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <HologramCard portfolio={portfolio} />
        </div>

        {/* Central Interactive 2D Canvas Frame Scrubber */}
        <div
          className="hero-scrubber-slot"
          style={{
            flex: '1 1 440px',
            maxWidth: '560px',
            width: '100%',
            height: '420px',
            position: 'relative',
          }}
        >
          <ThreeDImageStage
            perspective={1400}
            maxTilt={12}
            glowColor="var(--glow-color)"
            showGlare={true}
            showFloorShadow={true}
            floatingIdle={true}
            borderRadius="24px"
            style={{ width: '100%', height: '100%' }}
          >
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <FrameScrubber
                folderPath="/assets/image_1"
                totalFrames={36}
                fallbackImage="/assets/image_1/hero_front.webp"
                mode="cursor"
                fit="cover"
                overlayTelemetry={true}
                telemetryLabel="HERO // 360° PORTRAIT SCRUBBER"
                onFrameChange={(f, p) => {
                  setCurrentFrameNum(f);
                  setRotationDeg(Math.round(p * 360));
                }}
              />
            </div>
          </ThreeDImageStage>
        </div>
      </div>

      {/* Hero Foreground Content Layer (Role, Name, View Works, About) */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          maxWidth: '1280px',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '40px',
        }}
      >
        {/* Role Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '999px',
            background: 'rgba(5, 5, 5, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--accent-cyan)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--accent-cyan)',
            marginBottom: '14px',
            letterSpacing: '0.1em',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.25)',
          }}
        >
          <Sparkles size={14} />
          <span>
            {portfolio.role.toUpperCase()} // {portfolio.branchName ? portfolio.branchName.toUpperCase() : (portfolio.branch || 'ENGINEERING').toUpperCase()}
          </span>
        </div>

        {/* Name Display Headline */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '-0.03em',
            color: '#ffffff',
            lineHeight: 1.05,
            marginBottom: '12px',
            textShadow: '0 0 30px rgba(0, 242, 254, 0.35)',
          }}
        >
          {portfolio.name}
        </h2>

        {/* Tagline / Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.25rem)',
            color: 'rgba(255, 255, 255, 0.85)',
            maxWidth: '820px',
            lineHeight: 1.5,
            marginBottom: '24px',
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
          }}
        >
          {portfolio.tagline}
        </p>

        {/* Action Button Pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <a
            href="#projects"
            style={{
              backgroundColor: '#00f2fe',
              backgroundImage: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-magenta) 100%)',
              color: '#000',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.88rem',
              padding: '12px 24px',
              borderRadius: '999px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 25px rgba(0, 242, 254, 0.4)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(0, 242, 254, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 242, 254, 0.4)';
            }}
          >
            <span>VIEW SELECTED WORKS</span>
            <ArrowRight size={16} />
          </a>

          <a
            href="#about"
            style={{
              background: 'rgba(5, 5, 5, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.88rem',
              padding: '12px 22px',
              borderRadius: '999px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.color = 'var(--accent-cyan)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = '#ffffff';
            }}
          >
            <span>ABOUT BLUEPRINT</span>
          </a>
        </div>
      </div>

      {/* Bottom Center Prompt Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          letterSpacing: '0.12em',
          color: 'var(--accent-cyan)',
          background: 'rgba(5, 5, 5, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '6px 14px',
          borderRadius: '999px',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          marginBottom: '16px',
          zIndex: 20,
        }}
      >
        <Compass size={12} color="var(--accent-cyan)" />
        <span>MOVE CURSOR HORIZONTALLY TO ROTATE 360° // FRAME {String(currentFrameNum).padStart(2, '0')}/36 ({rotationDeg}°)</span>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hud-top-right {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .hud-top-left {
            display: none !important;
          }
          .hero-scrubber-slot {
            height: 320px !important;
          }
        }
        @media (max-width: 480px) {
          .hero-value-prop h1 {
            font-size: 1.65rem !important;
          }
          .hero-scrubber-slot {
            height: 260px !important;
          }
        }
      `}</style>
    </section>
  );
};
