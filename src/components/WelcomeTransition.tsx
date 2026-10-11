import React from 'react';
import { Layers, Terminal, Sparkles } from 'lucide-react';
import type { PortfolioData } from '../types/portfolio';
import { FrameScrubber } from './FrameScrubber';
import { ThreeDImageStage } from './ThreeDImageStage';

interface WelcomeTransitionProps {
  portfolio: PortfolioData;
}

export const WelcomeTransition: React.FC<WelcomeTransitionProps> = ({ portfolio }) => {
  return (
    <section
      id="welcome"
      style={{
        position: 'relative',
        width: '100%',
        padding: '140px 24px 120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #030508 0%, #060911 50%, #04060a 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: '750px',
          height: '420px',
          borderRadius: '50%',
          background: 'var(--glow-color)',
          filter: 'blur(180px)',
          opacity: 0.16,
          top: '32%',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1240px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Sub-badge: Restrained, Clean, Art-Directed */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            letterSpacing: '0.14em',
            color: 'var(--accent-cyan)',
            background: 'rgba(0, 242, 254, 0.06)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            borderRadius: '9999px',
            padding: '6px 18px',
            marginBottom: '24px',
            textTransform: 'uppercase',
          }}
        >
          <Sparkles size={13} />
          <span>SYSTEM ARCHITECTURE // INTERACTIVE CANVAS</span>
        </div>

        {/* Section Headline */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.6rem, 6vw, 5.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            textTransform: 'uppercase',
            color: '#ffffff',
            lineHeight: 1.05,
            marginBottom: '24px',
            maxWidth: '920px',
            textShadow: '0 0 50px rgba(0, 242, 254, 0.25)',
          }}
        >
          WELCOME TO MY <span style={{ color: 'var(--accent-cyan)' }}>PORTFOLIO</span>
        </h2>

        {/* Concise, elegant bio intro */}
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            lineHeight: 1.7,
            marginBottom: '56px',
          }}
        >
          {portfolio.shortBio}
        </p>

        {/* 3D Cinematic Laptop Image Showcase on Reflective Surface */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '960px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <ThreeDImageStage
            perspective={1200}
            maxTilt={10}
            glowColor="var(--glow-color)"
            showGlare={true}
            showFloorShadow={true}
            floatingIdle={true}
            borderRadius="24px"
          >
            <div style={{ width: '100%', height: '480px', position: 'relative' }}>
              <FrameScrubber
                folderPath="/assets/image_3"
                totalFrames={36}
                fallbackImage="/assets/image_3/laptop_interface.webp"
                mode="scroll"
                fit="cover"
                overlayTelemetry={true}
                telemetryLabel="SYSTEM // LAPTOP CANVAS SCRUBBER"
              />
            </div>

            {/* Subtle Sleek Glass Caption Bar (Minimal & Clean, Floating with Depth) */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px 28px',
                background: 'linear-gradient(to top, rgba(3, 5, 8, 0.95) 0%, rgba(3, 5, 8, 0.4) 60%, transparent 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                transform: 'translateZ(30px)',
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Terminal size={14} color="var(--accent-cyan)" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    letterSpacing: '0.08em',
                    color: '#ffffff',
                  }}
                >
                  SYSTEM CORE // {portfolio.targetRole || portfolio.role.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.1em',
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Layers size={12} />
                  <span>{portfolio.projects.length} SYSTEMS ARCHITECTED</span>
                </span>
              </div>
            </div>
          </ThreeDImageStage>
        </div>
      </div>
    </section>
  );
};

