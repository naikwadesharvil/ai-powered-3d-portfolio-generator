import React, { useState, useEffect } from 'react';
import { Activity, Compass, Sparkles, ArrowRight } from 'lucide-react';
import type { PortfolioData } from '../types/portfolio';
import { FrameScrubber } from './FrameScrubber';
import { ThreeDImageStage } from './ThreeDImageStage';

interface Hero3DProps {
  portfolio: PortfolioData;
}

export const Hero3D: React.FC<Hero3DProps> = ({ portfolio }) => {
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
        height: '100vh',
        overflow: 'hidden',
        background: '#050505',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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

      {/* Central Interactive 2D Canvas Frame Scrubber (Rotates 360° on Horizontal Cursor Scrub with 3D Depth) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(92vw, 840px)',
          height: 'min(80vh, 760px)',
          zIndex: 10,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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
          <div style={{ width: '100%', height: 'min(80vh, 760px)', position: 'relative' }}>
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

      {/* Hero Foreground Content Layer */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          maxWidth: '1280px',
          padding: '0 36px',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginTop: 'auto',
          marginBottom: '56px',
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
            marginBottom: '16px',
            pointerEvents: 'auto',
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
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 7.5vw, 6.2rem)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '-0.03em',
            color: '#ffffff',
            lineHeight: 1.05,
            marginBottom: '16px',
            textShadow: '0 0 40px rgba(0, 242, 254, 0.35)',
            pointerEvents: 'auto',
          }}
        >
          {portfolio.name}
        </h1>

        {/* Tagline / Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1rem, 2.2vw, 1.4rem)',
            color: 'rgba(255, 255, 255, 0.85)',
            maxWidth: '820px',
            lineHeight: 1.5,
            marginBottom: '32px',
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            pointerEvents: 'auto',
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
            pointerEvents: 'auto',
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
              padding: '14px 28px',
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
              padding: '14px 26px',
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
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
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
          pointerEvents: 'none',
        }}
      >
        <Compass size={12} color="var(--accent-cyan)" />
        <span>MOVE CURSOR HORIZONTALLY TO ROTATE 360° // FRAME {String(currentFrameNum).padStart(2, '0')}/36 ({rotationDeg}°)</span>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hud-top-left {
            top: 75px !important;
            left: 16px !important;
            font-size: 0.62rem !important;
            padding: 8px 12px !important;
          }
          .hud-top-right {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};
