import React from 'react';
import { Sparkles, Box, Cpu } from 'lucide-react';
import type { PortfolioData } from '../types/portfolio';
import { usePortfolioStore } from '../store/portfolioStore';

export interface HologramCardProps {
  portfolio?: PortfolioData;
  className?: string;
  style?: React.CSSProperties;
  showBadge?: boolean;
}

export const HologramCard: React.FC<HologramCardProps> = React.memo(({
  portfolio: propPortfolio,
  className = '',
  style = {},
  showBadge = true,
}) => {
  const storePortfolio = usePortfolioStore((s) => (propPortfolio ? undefined : s.portfolio));
  const data = propPortfolio || storePortfolio;

  // Safe fallback extractions
  const name = data?.name?.trim() || 'Candidate Name';
  const role = data?.role ? data.role.toUpperCase() : (data?.tagline || 'Engineering Specialist');
  const discipline = data?.disciplineName || data?.branchName || (data?.branch ? String(data.branch).toUpperCase() : 'TECHNOLOGY');

  // Extract top 6 skills safely from diverse portfolio schema formats
  const topSkills: string[] = React.useMemo(() => {
    if (!data?.skills) return [];
    if (Array.isArray(data.skills)) {
      const extracted: string[] = [];
      for (const item of data.skills) {
        if (typeof item === 'string') {
          extracted.push(item);
        } else if (item && typeof item === 'object') {
          if (item.name) extracted.push(item.name);
          if (Array.isArray((item as any).skills)) {
            extracted.push(...(item as any).skills);
          }
        }
      }
      const unique = Array.from(new Set(extracted.filter(Boolean)));
      if (unique.length > 0) {
        return unique.slice(0, 6);
      }
    }
    return ['CAD / Design', 'FEA Simulation', 'System Architecture', 'Optimization', 'Rapid Prototyping', 'Telemetry'];
  }, [data?.skills]);

  // First project title
  const firstProjectTitle = data?.projects?.[0]?.title?.trim() || 'Flagship Autonomous Capstone';

  return (
    <div
      className={`hologram-card-wrapper ${className}`}
      data-testid="hologram-card"
      data-hologram-name={name}
      style={{
        perspective: '1200px',
        width: '100%',
        maxWidth: '460px',
        margin: '0 auto',
        ...style,
      }}
    >
      <div
        className="hologram-card-3d"
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '16px',
          background: 'var(--card-bg, rgba(9, 13, 22, 0.88))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--accent-cyan, #00f2fe)',
          boxShadow: '0 0 30px -5px var(--glow-color, rgba(0, 242, 254, 0.4)), inset 0 0 20px rgba(0, 242, 254, 0.1)',
          padding: '24px 22px',
          transformStyle: 'preserve-3d',
          transform: 'rotateY(-6deg) rotateX(4deg)',
          animation: 'hologramTurntable 12s ease-in-out infinite alternate',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Holographic Scanline Overlay */}
        <div
          className="hologram-scanline"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0, 242, 254, 0.05) 0px, rgba(0, 242, 254, 0.05) 1px, transparent 1px, transparent 4px)',
            pointerEvents: 'none',
            zIndex: 1,
            mixBlendMode: 'screen',
          }}
        />

        {/* Hologram Light Sweeper Beam */}
        <div
          className="hologram-beam"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            backgroundImage:
              'linear-gradient(135deg, transparent 40%, rgba(0, 242, 254, 0.08) 50%, transparent 60%)',
            animation: 'hologramSweep 6s linear infinite',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Top Header Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            position: 'relative',
            zIndex: 3,
            transform: 'translateZ(20px)',
          }}
        >
          {showBadge && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'rgba(0, 242, 254, 0.12)',
                border: '1px solid var(--accent-cyan, #00f2fe)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.68rem',
                color: 'var(--accent-cyan, #00f2fe)',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}
            >
              <Sparkles size={11} color="var(--accent-cyan, #00f2fe)" />
              <span>3D HOLOGRAM // LIVE TELEMETRY</span>
            </div>
          )}

          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.65rem',
              color: 'var(--text-secondary, rgba(255, 255, 255, 0.6))',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {discipline}
          </div>
        </div>

        {/* Holographic Name Display */}
        <div
          style={{
            marginBottom: '12px',
            position: 'relative',
            zIndex: 3,
            transform: 'translateZ(26px)',
          }}
        >
          <h2
            data-testid="hologram-name"
            style={{
              fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
              fontSize: 'clamp(1.4rem, 4vw, 1.85rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              margin: '0 0 4px 0',
              textShadow: '0 0 16px var(--accent-cyan, #00f2fe), 0 0 32px var(--glow-color, rgba(0, 242, 254, 0.3))',
              wordBreak: 'break-word',
            }}
          >
            {name}
          </h2>
          <div
            data-testid="hologram-role"
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.78rem',
              color: 'var(--accent-cyan, #00f2fe)',
              letterSpacing: '0.06em',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {role}
          </div>
        </div>

        {/* 3D Floating Skills Chips */}
        <div
          style={{
            marginBottom: '18px',
            position: 'relative',
            zIndex: 3,
            transform: 'translateZ(28px)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.66rem',
              color: 'var(--text-secondary, rgba(255, 255, 255, 0.65))',
              letterSpacing: '0.08em',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Cpu size={11} color="var(--accent-cyan, #00f2fe)" />
            <span>CORE COMPETENCIES // TOP 6 SKILLS:</span>
          </div>

          <div
            data-testid="hologram-skills"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            {topSkills.map((skill, idx) => (
              <span
                key={`${skill}-${idx}`}
                className="hologram-skill-chip"
                data-skill={skill}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 9px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.7rem',
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                  transform: `translateZ(${18 + (idx % 3) * 6}px)`,
                  transition: 'all 0.2s ease',
                }}
              >
                <span
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--accent-cyan, #00f2fe)',
                    marginRight: '6px',
                    boxShadow: '0 0 4px var(--accent-cyan, #00f2fe)',
                  }}
                />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* First Project Hologram Block */}
        <div
          data-testid="hologram-project"
          style={{
            position: 'relative',
            zIndex: 3,
            transform: 'translateZ(22px)',
            background: 'rgba(0, 242, 254, 0.05)',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            borderRadius: '10px',
            padding: '10px 14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.64rem',
              color: 'var(--accent-cyan, #00f2fe)',
              letterSpacing: '0.08em',
              marginBottom: '4px',
            }}
          >
            <Box size={11} color="var(--accent-cyan, #00f2fe)" />
            <span>PRIMARY CAPSTONE PROJECT</span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {firstProjectTitle}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hologramTurntable {
          0% {
            transform: rotateY(-10deg) rotateX(4deg) translateY(0px);
          }
          50% {
            transform: rotateY(8deg) rotateX(-3deg) translateY(-6px);
          }
          100% {
            transform: rotateY(-10deg) rotateX(4deg) translateY(0px);
          }
        }

        @keyframes hologramSweep {
          0% {
            transform: translate(-30%, -30%) rotate(0deg);
          }
          100% {
            transform: translate(30%, 30%) rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hologram-card-3d {
            animation: none !important;
            transform: none !important;
          }
          .hologram-beam {
            animation: none !important;
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}, (prev, next) => {
  const p1 = prev.portfolio;
  const p2 = next.portfolio;
  if (!p1 && !p2) return true;
  if (!p1 || !p2) return false;
  return (
    p1.name === p2.name &&
    p1.role === p2.role &&
    p1.disciplineName === p2.disciplineName &&
    p1.branch === p2.branch &&
    p1.skills === p2.skills &&
    p1.projects?.[0]?.title === p2.projects?.[0]?.title &&
    prev.showBadge === next.showBadge &&
    prev.className === next.className
  );
});

export default HologramCard;
