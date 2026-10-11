import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { AiApiClient } from '../services/aiApiClient';

interface SectionSortableItemProps {
  id: string;
  label: string;
  visible: boolean;
}

export const SectionSortableItem: React.FC<SectionSortableItemProps> = ({
  id,
  label,
  visible,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const {
    portfolio,
    updateSectionVisibility,
    updateSectionField,
    updateProjectItem,
    updateSkillItem,
    activeTone,
    reorderSections,
  } = usePortfolioStore();

  const currentOrder = portfolio.sectionOrder || ['hero', 'welcome', 'about', 'projects', 'experience', 'publications', 'contact'];
  const currentIndex = currentOrder.indexOf(id);
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex >= 0 && currentIndex < currentOrder.length - 1;

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canMoveUp) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[currentIndex - 1];
    newOrder[currentIndex - 1] = newOrder[currentIndex];
    newOrder[currentIndex] = temp;
    reorderSections(newOrder);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canMoveDown) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[currentIndex + 1];
    newOrder[currentIndex + 1] = newOrder[currentIndex];
    newOrder[currentIndex] = temp;
    reorderSections(newOrder);
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [rewriteSuccess, setRewriteSuccess] = useState(false);

  // Measure keystroke-to-paint latency with double requestAnimationFrame
  const measureKeystrokePaint = () => {
    const start = performance.now();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const latency = performance.now() - start;
        if (typeof window !== 'undefined') {
          (window as any).__lastKeystrokePaintMs = latency;
        }
      });
    });
  };

  // Per-section AI rewrite handler
  const handleRegenerateSection = async () => {
    setIsRewriting(true);
    setRewriteError(null);
    setRewriteSuccess(false);

    try {
      let sectionKey = id;
      let contentToRewrite: any = '';

      if (id === 'hero' || id === 'welcome') {
        sectionKey = 'tagline';
        contentToRewrite = portfolio.tagline;
      } else if (id === 'about') {
        sectionKey = 'shortBio';
        contentToRewrite = portfolio.shortBio;
      } else if (id === 'projects') {
        sectionKey = 'projects';
        contentToRewrite = portfolio.projects.map((p) => p.title).join(', ');
      } else {
        sectionKey = 'shortBio';
        contentToRewrite = portfolio.shortBio;
      }

      const res = await AiApiClient.rewriteSection({
        section: sectionKey,
        content: contentToRewrite,
        tone: activeTone || 'professional',
        role: portfolio.role,
      });

      if (id === 'hero' || id === 'welcome') {
        updateSectionField('tagline', typeof res.rewritten === 'string' ? res.rewritten : portfolio.tagline);
      } else if (id === 'about') {
        updateSectionField('shortBio', typeof res.rewritten === 'string' ? res.rewritten : portfolio.shortBio);
      }

      setRewriteSuccess(true);
      setTimeout(() => setRewriteSuccess(false), 2500);
    } catch (err: any) {
      setRewriteError(err?.message || 'Failed to rewrite section. Please try again.');
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'rgba(255, 255, 255, 0.02)',
        border: isExpanded ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        marginBottom: '10px',
        overflow: 'hidden',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: 'rgba(5, 7, 12, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.4)',
              cursor: 'grab',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Drag to reorder section"
            aria-label={`Drag to reorder ${label}`}
          >
            <GripVertical size={16} />
          </button>

          {/* Keyboard accessible Reorder Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              type="button"
              onClick={handleMoveUp}
              disabled={!canMoveUp}
              aria-label={`Move ${label} up`}
              title={`Move ${label} up`}
              style={{
                background: 'transparent',
                border: 'none',
                color: canMoveUp ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.15)',
                cursor: canMoveUp ? 'pointer' : 'not-allowed',
                padding: '1px',
                display: 'flex',
                alignItems: 'center',
                lineHeight: 1,
              }}
            >
              <ChevronUp size={12} />
            </button>
            <button
              type="button"
              onClick={handleMoveDown}
              disabled={!canMoveDown}
              aria-label={`Move ${label} down`}
              title={`Move ${label} down`}
              style={{
                background: 'transparent',
                border: 'none',
                color: canMoveDown ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.15)',
                cursor: canMoveDown ? 'pointer' : 'not-allowed',
                padding: '1px',
                display: 'flex',
                alignItems: 'center',
                lineHeight: 1,
              }}
            >
              <ChevronDown size={12} />
            </button>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: visible ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
              textDecoration: visible ? 'none' : 'line-through',
            }}
          >
            {label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Per-Section AI Regenerate Button */}
          <button
            type="button"
            onClick={handleRegenerateSection}
            disabled={isRewriting}
            style={{
              background: rewriteSuccess
                ? 'rgba(0, 242, 254, 0.2)'
                : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: rewriteSuccess ? 'var(--accent-cyan)' : '#ffffff',
              padding: '5px 10px',
              borderRadius: '6px',
              cursor: isRewriting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
            }}
            title="Rewrite this section with AI"
          >
            {isRewriting ? (
              <Loader2 size={12} className="spinning" />
            ) : rewriteSuccess ? (
              <Check size={12} />
            ) : (
              <Sparkles size={12} color="var(--accent-cyan)" />
            )}
            <span>{isRewriting ? 'REWRITING...' : rewriteSuccess ? 'UPDATED' : 'AI POLISH'}</span>
          </button>

          {/* Visibility Toggle Button */}
          <button
            type="button"
            onClick={() => updateSectionVisibility(id, !visible)}
            style={{
              background: visible ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.04)',
              border: visible ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: visible ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.4)',
              padding: '6px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title={visible ? 'Hide section from portfolio' : 'Show section in portfolio'}
          >
            {visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {/* Expand/Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {rewriteError && (
        <div
          style={{
            padding: '8px 12px',
            background: 'rgba(255, 0, 85, 0.1)',
            borderBottom: '1px solid rgba(255, 0, 85, 0.25)',
            color: '#ff4466',
            fontSize: '0.74rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertCircle size={14} />
          <span>{rewriteError}</span>
        </div>
      )}

      {/* Expandable Inline Editing Body */}
      {isExpanded && (
        <div style={{ padding: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Hero & Welcome Inline Edit */}
          {(id === 'hero' || id === 'welcome') && (
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                HEADLINE / TAGLINE
              </label>
              <input
                type="text"
                value={portfolio.tagline}
                onChange={(e) => {
                  measureKeystrokePaint();
                  updateSectionField('tagline', e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          )}

          {/* About Section Inline Edit */}
          {id === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  SHORT BIO (2 SENTENCES)
                </label>
                <textarea
                  rows={2}
                  value={portfolio.shortBio}
                  onChange={(e) => {
                    measureKeystrokePaint();
                    updateSectionField('shortBio', e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  TARGET ROLE TITLE
                </label>
                <input
                  type="text"
                  value={portfolio.targetRole}
                  onChange={(e) => {
                    measureKeystrokePaint();
                    updateSectionField('targetRole', e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            </div>
          )}

          {/* Projects Section Inline Edit */}
          {id === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>
                EDIT PROJECT TITLES & METRICS
              </div>
              {portfolio.projects.map((proj) => (
                <div
                  key={proj.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateProjectItem(proj.id || '', 'title', e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.15)',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      padding: '2px 0',
                    }}
                  />
                  <input
                    type="text"
                    value={proj.description}
                    onChange={(e) => updateProjectItem(proj.id || '', 'description', e.target.value)}
                    placeholder="Brief description..."
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.78rem',
                      padding: '2px 0',
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Skills Section Inline Edit */}
          {id === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>
                EDIT VERIFIED SKILL BADGES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {portfolio.skills.map((skill, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkillItem(idx, e.target.value)}
                    style={{
                      background: 'rgba(0, 242, 254, 0.08)',
                      border: '1px solid rgba(0, 242, 254, 0.25)',
                      color: '#fff',
                      fontSize: '0.76rem',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontFamily: 'var(--font-mono)',
                      maxWidth: '140px',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
