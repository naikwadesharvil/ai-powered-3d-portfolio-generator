import React from 'react';
import {
  Download,
  Terminal,
  Layers,
  GraduationCap,
  Award,
  Cpu,
  Code2,
  Database,
  Cog,
  Wrench,
  Bot,
  Zap,
  Building2,
  Brain,
  Compass,
  Flame,
  Shield,
  Binary,
  Server,
  Activity,
  Sparkles,
} from 'lucide-react';
import type { PortfolioData } from '../types/portfolio';
import { getFlattenedSkills } from '../types/portfolioSchema';
import { sanitizeUrl } from '../utils/sanitize';
import { ThreeDImageStage } from './ThreeDImageStage';
import { TiltCard3D } from './TiltCard3D';

// Contextual engineering and technology skill icon matcher
const getSkillIcon = (name: string, category?: string) => {
  const query = `${name} ${category || ''}`.toLowerCase();
  const iconProps = { size: 13, color: 'var(--accent-cyan)' };

  if (query.match(/ai|ml|machine learn|deep learn|neural|gpt|llm|vision|nlp|tensor|torch|data/)) {
    return <Brain {...iconProps} />;
  }
  if (query.match(/robot|ros|mechatron|automati|kinematic|sensor|servo|lidar|telemet/)) {
    return <Bot {...iconProps} />;
  }
  if (query.match(/circuit|electr|pcb|hardware|embedded|microcontrol|arduino|vlsi|fpga|semiconduct|power/)) {
    return <Zap {...iconProps} />;
  }
  if (query.match(/cad|solidwork|ansys|fea|cfd|mechanic|cam|cnc|machin|thermo|gd&t/)) {
    return <Cog {...iconProps} />;
  }
  if (query.match(/civil|architect|bim|revit|structur|concre|survey|geotech|infrastruct/)) {
    return <Building2 {...iconProps} />;
  }
  if (query.match(/chem|material|fluid|process|polym|flame/)) {
    return <Flame {...iconProps} />;
  }
  if (query.match(/sql|db|data|mongo|postgr|redis|lake|warehous/)) {
    return <Database {...iconProps} />;
  }
  if (query.match(/cloud|server|aws|gcp|azure|docker|k8s|kubernet|devops/)) {
    return <Server {...iconProps} />;
  }
  if (query.match(/sec|cyber|auth|crypto|pen/)) {
    return <Shield {...iconProps} />;
  }
  if (query.match(/algor|math|logic|binary/)) {
    return <Binary {...iconProps} />;
  }
  if (query.match(/tool|wrench|test|debug|measur/)) {
    return <Wrench {...iconProps} />;
  }
  if (query.match(/design|ui|ux|figma|proto/)) {
    return <Compass {...iconProps} />;
  }
  if (query.match(/metric|analyt|optimi|perf|signal/)) {
    return <Activity {...iconProps} />;
  }
  if (query.match(/code|program|script|react|python|c\+\+|java|rust|go|type|web/)) {
    return <Code2 {...iconProps} />;
  }

  return <Cpu {...iconProps} />;
};

interface AboutBentoProps {
  portfolio: PortfolioData;
  onOpenResume?: () => void;
}

export const AboutBento: React.FC<AboutBentoProps> = ({ portfolio, onOpenResume }) => {
  const flattenedSkills = getFlattenedSkills(portfolio.skills);

  const handleDownloadResume = () => {
    // Generate text/markdown resume export or trigger download
    const resumeContent = `# ${portfolio.name || 'Candidate'}
${portfolio.tagline}
${!portfolio.hideEmail && portfolio.email ? `Contact: ${portfolio.email} | ` : ''}Location: ${portfolio.location}
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

## PUBLICATIONS
${portfolio.publications.map((pb) => `- ${pb.title} | ${pb.publisher} (${pb.date}) ${pb.award ? `[${pb.award}]` : ''}`).join('\n')}
`;
    const blob = new Blob([resumeContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(portfolio.name || 'Candidate').replace(/\s+/g, '_')}_Resume.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="about"
      style={{
        position: 'relative',
        width: '100%',
        padding: '120px 24px',
        background: 'radial-gradient(circle at 50% 50%, #080d17 0%, #030508 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Section Header */}
        <div style={{ marginBottom: '56px', textAlign: 'left' }}>
          <div className="badge-neon" style={{ marginBottom: '14px' }}>
            <Terminal size={14} />
            <span>BIOGRAPHY // PROFILE BLUEPRINT</span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: 0,
            }}
          >
            ABOUT <span style={{ color: 'var(--accent-cyan)' }}>ME.</span>
          </h2>
        </div>

        {/* Bento Grid Container */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* Left Column: Portrait Card (Desktop Span 5, Mobile Span 12) */}
          <div
            className="glass-panel about-portrait-col"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '440px',
            }}
            id="about-portrait-card"
          >
            <ThreeDImageStage
              maxTilt={8}
              perspective={1000}
              borderRadius="16px"
              glowColor="rgba(0, 242, 254, 0.35)"
              showGlare={true}
              showFloorShadow={false}
              floatingIdle={false}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '320px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#04070d',
                }}
              >
                {portfolio.avatarUrl && !portfolio.avatarUrl.includes('image_1') && !portfolio.avatarUrl.includes('profile.png') ? (
                  <img
                    src={portfolio.avatarUrl}
                    alt={portfolio.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    className="about-hologram-avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      background: 'radial-gradient(circle at center, rgba(0, 242, 254, 0.12) 0%, rgba(4, 7, 13, 0.95) 70%)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Concentric Hologram Radar Rings */}
                    <div
                      style={{
                        position: 'absolute',
                        width: '220px',
                        height: '220px',
                        borderRadius: '50%',
                        border: '1px dashed rgba(0, 242, 254, 0.35)',
                        animation: 'spin 24s linear infinite',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        width: '170px',
                        height: '170px',
                        borderRadius: '50%',
                        border: '1px solid rgba(255, 0, 85, 0.25)',
                        animation: 'spin 16s linear infinite reverse',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '2px solid var(--accent-cyan, #00f2fe)',
                        boxShadow: '0 0 25px rgba(0, 242, 254, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(9, 13, 22, 0.85)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 2,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                          fontSize: '2.5rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          letterSpacing: '0.05em',
                          textShadow: '0 0 16px var(--accent-cyan, #00f2fe)',
                        }}
                      >
                        {(portfolio.name || 'Your Name')
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: '150px',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.66rem',
                        color: 'var(--accent-cyan, #00f2fe)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        zIndex: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Sparkles size={11} color="var(--accent-cyan, #00f2fe)" />
                      <span>ABSTRACT HOLOGRAM MATRIX</span>
                    </div>
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(3, 5, 8, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transform: 'translateZ(30px)',
                    zIndex: 20,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--accent-cyan)',
                      boxShadow: '0 0 8px var(--accent-cyan)',
                    }}
                  />
                  <span>ID: {portfolio.role.toUpperCase()}</span>
                </div>
              </div>
            </ThreeDImageStage>

            <div style={{ marginTop: '20px' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '6px',
                }}
              >
                {portfolio.name || 'Portfolio'}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.05em',
                  marginBottom: '12px',
                }}
              >
                {portfolio.targetRole || portfolio.tagline}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.92rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {portfolio.fullBio}
              </p>
              {(portfolio.github || portfolio.linkedin) && (
                <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {portfolio.github && (
                    <a
                      href={sanitizeUrl(portfolio.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="badge-neon"
                      style={{ textDecoration: 'none', fontSize: '0.72rem', padding: '4px 10px' }}
                    >
                      GITHUB &rarr;
                    </a>
                  )}
                  {portfolio.linkedin && (
                    <a
                      href={sanitizeUrl(portfolio.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="badge-magenta"
                      style={{ textDecoration: 'none', fontSize: '0.72rem', padding: '4px 10px' }}
                    >
                      LINKEDIN &rarr;
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 3 Bento Stat Cards (Desktop Span 7, Mobile Span 12) */}
          <div
            className="about-stats-col"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
            id="about-stats-container"
          >
            {/* Stat Card 1: Core Stack */}
            <TiltCard3D maxTilt={6} borderRadius="12px" glowColor="var(--accent-cyan)">
              <div
                className="glass-panel"
                style={{
                  height: '100%',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: '3px solid var(--accent-cyan)',
                  borderRadius: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.12em',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {portfolio.bentoStats.stat1.title}
                    </span>
                    <Layers size={18} color="var(--accent-cyan)" />
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: '8px',
                      lineHeight: 1.3,
                    }}
                  >
                    {portfolio.bentoStats.stat1.value}
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginTop: '12px',
                  }}
                >
                  {portfolio.bentoStats.stat1.subtext}
                </p>
              </div>
            </TiltCard3D>

            {/* Stat Card 2: Education */}
            <TiltCard3D maxTilt={6} borderRadius="12px" glowColor="var(--accent-magenta)">
              <div
                className="glass-panel"
                style={{
                  height: '100%',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: '3px solid var(--accent-magenta)',
                  borderRadius: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.12em',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {portfolio.bentoStats.stat2.title}
                    </span>
                    <GraduationCap size={18} color="var(--accent-magenta)" />
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: '8px',
                      lineHeight: 1.3,
                    }}
                  >
                    {portfolio.bentoStats.stat2.value}
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginTop: '12px',
                  }}
                >
                  {portfolio.bentoStats.stat2.subtext}
                </p>
              </div>
            </TiltCard3D>

            {/* Stat Card 3: Projects / Publications */}
            <TiltCard3D maxTilt={6} borderRadius="12px" glowColor="var(--accent-cyan)">
              <div
                className="glass-panel"
                style={{
                  height: '100%',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: '3px solid var(--accent-cyan)',
                  borderRadius: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.12em',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {portfolio.bentoStats.stat3.title}
                    </span>
                    <Award size={18} color="var(--accent-cyan)" />
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: '8px',
                      lineHeight: 1.3,
                    }}
                  >
                    {portfolio.bentoStats.stat3.value}
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginTop: '12px',
                  }}
                >
                  {portfolio.bentoStats.stat3.subtext}
                </p>
              </div>
            </TiltCard3D>
          </div>

          {/* Full Width Bottom Row: GRAB YOUR TOOLS & DOWNLOAD RESUME CTA */}
          <div
            className="glass-panel"
            style={{
              gridColumn: 'span 12',
              padding: '36px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '28px',
              background: 'linear-gradient(135deg, rgba(11, 16, 28, 0.8) 0%, rgba(18, 26, 44, 0.8) 100%)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
            }}
          >
            {/* Tech Stack Pills */}
            <div style={{ flex: '1 1 600px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                  color: 'var(--accent-cyan)',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Cpu size={14} />
                <span>GRAB YOUR TOOLS // CORE TECH STACK</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {flattenedSkills.map((skill) => (
                  <div
                    key={skill.name}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '9999px',
                      padding: '8px 16px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      letterSpacing: '0.04em',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                      e.currentTarget.style.boxShadow = '0 0 14px var(--glow-color)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {getSkillIcon(skill.name, skill.category)}
                    <span>{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Glowing Download Resume Action Button */}
            <div>
              <button
                onClick={() => (onOpenResume ? onOpenResume() : handleDownloadResume())}
                className="btn-primary"
                style={{
                  padding: '16px 32px',
                  fontSize: '0.95rem',
                  letterSpacing: '0.08em',
                  borderRadius: '12px',
                }}
              >
                <Download size={18} />
                <span>DOWNLOAD RESUME</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 960px) {
          #about-portrait-card {
            grid-column: span 5 !important;
          }
          #about-stats-container {
            grid-column: span 7 !important;
          }
        }
      `}</style>
    </section>
  );
};
