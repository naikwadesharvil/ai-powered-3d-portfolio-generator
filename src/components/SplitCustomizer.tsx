import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Undo,
  Redo,
  Layout,
  Palette,
  Check,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { SectionSortableItem } from './SectionSortableItem';
import { ThemeCustomizer } from './ThemeCustomizer';
import { LivePortfolioPreview } from './LivePortfolioPreview';

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero & 3D Telemetry',
  welcome: 'Welcome & Value Headline',
  about: 'About & Bento Statistics',
  skills: 'Technical Skills Matrix',
  projects: 'Featured Verified Projects',
  experience: 'Work History & Roles',
  services: 'Freelance Offerings',
  publications: 'Publications & Papers',
  certifications: 'Credentials & Certifications',
  contact: 'Contact & Collaboration',
};

export interface SplitCustomizerProps {
  onBackToStep2?: () => void;
  onProceedToStep4?: () => void;
}

export const SplitCustomizer: React.FC<SplitCustomizerProps> = ({
  onBackToStep2,
  onProceedToStep4,
}) => {
  const {
    portfolio,
    reorderSections,
    undo,
    redo,
    canUndo,
    canRedo,
    autosaveStatus,
    lastAutosavedAt,
  } = usePortfolioStore();

  const [activeEditorTab, setActiveEditorTab] = useState<'sections' | 'themes'>('sections');
  const [mobileActiveTab, setMobileActiveTab] = useState<'editor' | 'preview'>('editor');

  // Sensors for @dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Active section list based on portfolio order or default
  const sectionIds: string[] = (
    portfolio.sectionOrder && portfolio.sectionOrder.length > 0
      ? portfolio.sectionOrder
      : [
          'hero',
          'about',
          'skills',
          'projects',
          'experience',
          'contact',
        ]
  ).filter((id) => SECTION_LABELS[id] !== undefined);

  // Ensure contact is in section list if not present
  if (!sectionIds.includes('contact')) {
    sectionIds.push('contact');
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionIds.indexOf(String(active.id));
      const newIndex = sectionIds.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(sectionIds, oldIndex, newIndex);
        reorderSections(newOrder);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '620px' }}>
      {/* Universal Top Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'rgba(5, 7, 12, 0.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px 10px 0 0',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Mobile View Switcher (Tabs on Mobile) */}
        <div className="mobile-only-tabs" style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setMobileActiveTab('editor')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: mobileActiveTab === 'editor' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
              color: mobileActiveTab === 'editor' ? '#000' : '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Editor Panel
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveTab('preview')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: mobileActiveTab === 'preview' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
              color: mobileActiveTab === 'preview' ? '#000' : '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Live Preview
          </button>
        </div>

        {/* Undo / Redo & Autosave Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo()}
            style={{
              background: canUndo() ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: canUndo() ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: canUndo() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
            }}
            title="Undo recent modification"
          >
            <Undo size={14} />
            <span>Undo</span>
          </button>

          <button
            type="button"
            onClick={redo}
            disabled={!canRedo()}
            style={{
              background: canRedo() ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: canRedo() ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: canRedo() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
            }}
            title="Redo previous modification"
          >
            <Redo size={14} />
            <span>Redo</span>
          </button>

          {/* Debounced Autosave Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
            }}
          >
            {autosaveStatus === 'saving' ? (
              <>
                <Loader2 size={12} className="spinning" color="var(--accent-cyan)" />
                <span>Autosaving...</span>
              </>
            ) : autosaveStatus === 'saved' ? (
              <>
                <Check size={12} color="#00ff88" />
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Saved {lastAutosavedAt || 'locally'}
                </span>
              </>
            ) : (
              <span>Autosave active</span>
            )}
          </div>
        </div>

        {/* Editor Sub-Tab Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveEditorTab('sections')}
            style={{
              background: activeEditorTab === 'sections' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              border: activeEditorTab === 'sections' ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeEditorTab === 'sections' ? 'var(--accent-cyan)' : '#ffffff',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
            }}
          >
            <Layout size={14} />
            <span>Sections & Flow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveEditorTab('themes')}
            style={{
              background: activeEditorTab === 'themes' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              border: activeEditorTab === 'themes' ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeEditorTab === 'themes' ? 'var(--accent-cyan)' : '#ffffff',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
            }}
          >
            <Palette size={14} />
            <span>Theme Tokens</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout Body */}
      <div
        className="split-customizer-container"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1fr)',
          gap: '20px',
          padding: '20px 0',
          overflow: 'hidden',
          minHeight: '520px',
        }}
      >
        {/* Left Panel: Editor */}
        <div
          className={`split-editor-panel ${mobileActiveTab === 'editor' ? 'active-mobile' : 'hidden-mobile'}`}
          style={{
            overflowY: 'auto',
            paddingRight: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {activeEditorTab === 'sections' ? (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontFamily: 'var(--font-display)' }}>
                  Section Flow & Inline Editor
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Drag items by their handle to reorder. Toggle eye to show/hide. Click arrows to edit inline or rewrite with AI.
                </p>
              </div>

              {/* @dnd-kit Drag-to-Reorder Sortable List */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sectionIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {sectionIds.map((secId) => (
                      <SectionSortableItem
                        key={secId}
                        id={secId}
                        label={SECTION_LABELS[secId] || secId.toUpperCase()}
                        visible={portfolio.sectionVisibility?.[secId] ?? true}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <ThemeCustomizer />
          )}
        </div>

        {/* Right Panel: Live Reactive Preview */}
        <div
          className={`split-preview-panel ${mobileActiveTab === 'preview' ? 'active-mobile' : 'hidden-mobile'}`}
          style={{
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <LivePortfolioPreview />
        </div>
      </div>

      {/* Navigation Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          marginTop: 'auto',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <button
          type="button"
          onClick={onBackToStep2}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Generate</span>
        </button>

        <button
          type="button"
          onClick={onProceedToStep4}
          className="btn-primary"
          style={{
            padding: '10px 24px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Proceed to Step 4: Download / Publish</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

