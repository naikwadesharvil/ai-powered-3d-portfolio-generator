import React from 'react';
import { ExternalLink, Sparkles, CheckCircle2, Activity, Terminal } from 'lucide-react';
import { GithubIcon } from './Icons';
import type { PortfolioData } from '../types/portfolio';
import { ThreeDImageStage } from './ThreeDImageStage';
import { TiltCard3D } from './TiltCard3D';
import { ProjectBlueprintPreview } from './ProjectBlueprintPreview';
import { sanitizeUrl } from '../utils/sanitize';

interface SelectedWorksProps {
  portfolio: PortfolioData;
}

export const SelectedWorks: React.FC<SelectedWorksProps> = ({ portfolio }) => {
  return (
    <section
      id="projects"
      style={{
        position: 'relative',
        width: '100%',
        padding: '120px 24px',
        background: '#04060a',
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
          <div className="badge-magenta" style={{ marginBottom: '14px' }}>
            <Terminal size={14} />
            <span>PORTFOLIO SHOWCASE // ARCHIVES</span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: 0,
            }}
          >
            SELECTED <span style={{ color: 'var(--accent-magenta)' }}>WORKS.</span>
          </h2>
        </div>

        {/* Featured Flagship Project Architecture Stage */}
        {portfolio.projects.length > 0 && (
          <div style={{ marginBottom: '48px', width: '100%' }}>
            <ThreeDImageStage
              perspective={1200}
              maxTilt={8}
              glowColor="rgba(255, 0, 85, 0.3)"
              showGlare={true}
              showFloorShadow={true}
              floatingIdle={true}
              borderRadius="24px"
            >
              <div
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #04070e 0%, #070d1a 100%)',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  minHeight: '380px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge-magenta">
                      <Sparkles size={12} />
                      <span>FLAGSHIP ARCHITECTURE</span>
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        color: 'var(--accent-cyan)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {portfolio.projects[0].role || 'CORE SYSTEM'}
                    </span>
                  </div>

                  {portfolio.projects[0].metrics && (
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: '#ffffff',
                        background: 'rgba(0, 242, 254, 0.08)',
                        border: '1px solid rgba(0, 242, 254, 0.25)',
                        borderRadius: '6px',
                        padding: '4px 12px',
                      }}
                    >
                      <span>METRIC: {portfolio.projects[0].metrics}</span>
                    </div>
                  )}
                </div>

                <ProjectBlueprintPreview
                  project={portfolio.projects[0]}
                  branch={portfolio.branch || 'cs_it'}
                  height={220}
                />

                <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: '8px',
                    }}
                  >
                    {portfolio.projects[0].title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      maxWidth: '820px',
                      margin: 0,
                    }}
                  >
                    {portfolio.projects[0].description}
                  </p>
                </div>
              </div>

              {/* Overlay Tech Readout Banner */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '16px 28px',
                  background: 'linear-gradient(to top, rgba(3, 4, 7, 0.95) 0%, transparent 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  transform: 'translateZ(30px)',
                  zIndex: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={14} color="var(--accent-cyan)" />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-cyan)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    SYSTEM // REAL-TIME DISCIPLINE SCHEMATIC
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: '0.08em',
                  }}
                >
                  ARCHIVES // {portfolio.projects.length} PROJECTS ONLINE
                </span>
              </div>
            </ThreeDImageStage>
          </div>
        )}

        {/* Project Showcase Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
          }}
        >
          {portfolio.projects.map((project) => (
            <TiltCard3D
              key={project.id}
              maxTilt={8}
              perspective={1000}
              glowColor={project.isAiIdea ? 'var(--accent-magenta)' : 'var(--accent-cyan)'}
              borderRadius="16px"
            >
              <div
                className="glass-panel"
                style={{
                  height: '100%',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: project.isAiIdea
                    ? '3px solid var(--accent-magenta)'
                    : '3px solid var(--accent-cyan)',
                  position: 'relative',
                  borderRadius: '16px',
                }}
              >
                <div>
                  {/* Verified Fact vs AI Concept Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}
                  >
                    {project.isAiIdea ? (
                      <span className="badge-magenta">
                        <Sparkles size={12} />
                        <span>AI CONCEPT IDEA</span>
                      </span>
                    ) : (
                      <span className="badge-neon">
                        <CheckCircle2 size={12} />
                        <span>VERIFIED PROJECT</span>
                      </span>
                    )}

                    {project.date && (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {project.date}
                      </span>
                    )}
                  </div>

                  {/* Discipline-Connected Visual Blueprint Preview */}
                  <ProjectBlueprintPreview
                    project={project}
                    branch={portfolio.branch || 'cs_it'}
                  />

                  {/* Project Title */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: '12px',
                      lineHeight: 1.3,
                    }}
                  >
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.92rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      marginBottom: '20px',
                    }}
                  >
                    {project.description}
                  </p>

                  {/* Measurable Metrics */}
                  {project.metrics && (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: 'var(--accent-cyan)',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>&gt; OUTCOME: {project.metrics}</span>
                    </div>
                  )}

                  {/* Accomplishment Bullets */}
                  {project.bullets && project.bullets.length > 0 && (
                    <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {project.bullets.map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', marginTop: '2px' }}>▹</span>
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  {/* Tech Tags / Tools */}
                  {(() => {
                    const techList = (project.tools && project.tools.length > 0)
                      ? project.tools
                      : (project.tags || []);
                    return techList.length > 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '24px',
                        }}
                      >
                        {techList.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              color: '#ffffff',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}

                  {/* Action Links */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {(project.githubUrl || (project as any).github) && (
                      <a
                        href={sanitizeUrl(project.githubUrl || (project as any).github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline"
                        style={{ padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        <GithubIcon size={14} />
                        <span>REPOSITORY</span>
                      </a>
                    )}
                    {(project.demoUrl || (project as any).link) && (
                      <a
                        href={sanitizeUrl(project.demoUrl || (project as any).link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} />
                        <span>LIVE DEMO</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </TiltCard3D>
          ))}
        </div>
      </div>
    </section>
  );
};
