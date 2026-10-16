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
  RotateCcw,
  Sparkles,
  Send,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';
import { usePortfolioStore, type AiWritingTone } from '../store/portfolioStore';
import { CURATED_THEME_PRESETS } from '../types/themeTokens';
import { SectionSortableItem } from './SectionSortableItem';
import { ThemeCustomizer } from './ThemeCustomizer';
import { LivePortfolioPreview } from './LivePortfolioPreview';
import { AiApiClient } from '../services/aiApiClient';
import type { PortfolioData } from '../types/portfolio';
import { motion, AnimatePresence } from 'motion/react';

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
    activeTone,
    setActiveTone,
    resetPortfolio,
    setPortfolio,
    themeTokens,
    applyThemePreset,
  } = usePortfolioStore();

  const [activeEditorTab, setActiveEditorTab] = useState<'sections' | 'themes'>('sections');
  const [mobileActiveTab, setMobileActiveTab] = useState<'editor' | 'preview'>('editor');

  // AI Co-Pilot Assistant State (Restored from Step 3)
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; timestamp: string; liveAi?: boolean }>
  >([
    {
      sender: 'assistant',
      text: `Hello! I'm your AI Portfolio Co-Pilot. I can help rewrite sections in your chosen tone (${activeTone}), refine capstone metrics, adjust section priorities, or optimize your presentation.`,
      timestamp: 'Now',
    },
  ]);
  const [pendingChatProfile, setPendingChatProfile] = useState<{
    profile: PortfolioData;
    explanation: string;
    summary: string;
  } | null>(null);

  const [suggestionNotice, setSuggestionNotice] = useState<string | null>(null);

  const getDisciplineSuggestion = () => {
    const disc = portfolio.discipline || portfolio.branch || 'cs_it';
    if (disc === 'ai_ml' || disc === 'systems_infra' || disc === 'mechatronics') {
      return {
        themeId: 'obsidian_stealth',
        themeName: 'Obsidian Stealth',
        order: ['hero', 'welcome', 'about', 'skills', 'projects', 'experience', 'publications', 'certifications', 'services', 'contact'],
        rationale: 'Deep tech & systems: prioritized architecture telemetry & verified capstone metrics.',
      };
    }
    if (disc === 'frontend_creative' || disc === 'mobile_app' || disc === 'product_design') {
      return {
        themeId: 'tokyo_neon',
        themeName: 'Tokyo Night',
        order: ['hero', 'welcome', 'projects', 'about', 'skills', 'services', 'experience', 'certifications', 'publications', 'contact'],
        rationale: 'Creative & visual: prioritized capstone visual showcase before background.',
      };
    }
    if (disc === 'academic_research' || disc === 'sciences' || disc === 'biotech') {
      return {
        themeId: 'minimal_mono',
        themeName: 'Minimal Monochrome',
        order: ['hero', 'welcome', 'about', 'publications', 'projects', 'experience', 'skills', 'certifications', 'services', 'contact'],
        rationale: 'Research & academia: highlighted peer-reviewed publications and core citations.',
      };
    }
    return {
      themeId: 'neon_cyberpunk',
      themeName: 'Cyberpunk Neon',
      order: ['hero', 'welcome', 'about', 'skills', 'projects', 'experience', 'services', 'certifications', 'publications', 'contact'],
      rationale: 'Balanced engineering: optimized for high-impact 3D presentation.',
    };
  };

  const handleApplySuggestion = () => {
    const suggestion = getDisciplineSuggestion();
    applyThemePreset(suggestion.themeId);
    const currentSections = [...(portfolio.sectionOrder || [])];
    const newOrder = suggestion.order.filter((id) => currentSections.includes(id));
    currentSections.forEach((id) => {
      if (!newOrder.includes(id)) newOrder.push(id);
    });
    reorderSections(newOrder);
    setSuggestionNotice(`Applied ${suggestion.themeName} & optimal section flow! Click Undo to revert.`);
  };

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

  // Co-Pilot Chat Handlers
  const handleSendChatMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || chatInput;
    if (!promptToSend.trim()) return;

    const userText = promptToSend.trim();
    setChatInput('');
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setIsChatting(true);

    try {
      const historyPayload = chatMessages.slice(-8).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }));

      const res = await AiApiClient.chat({
        instruction: userText,
        currentProfile: portfolio,
        messageHistory: historyPayload,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.explanation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          liveAi: res.liveAi,
        },
      ]);

      if (res.suggestedFollowUp) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `💡 Follow-up: ${res.suggestedFollowUp}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            liveAi: res.liveAi,
          },
        ]);
      }

      setPendingChatProfile({
        profile: res.updatedProfile,
        explanation: res.explanation,
        summary: res.changesSummary,
      });
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error processing request: ${err?.message || 'Could not reach AI co-pilot'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleAcceptChatProposal = () => {
    if (!pendingChatProfile) return;
    setPortfolio(pendingChatProfile.profile);
    setPendingChatProfile(null);
  };

  const handleDiscardChatProposal = () => {
    setPendingChatProfile(null);
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

          {/* Clear saved data / Start over */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear saved customization data and start over? This will restore the initial template.')) {
                resetPortfolio();
              }
            }}
            style={{
              background: 'rgba(255, 0, 85, 0.08)',
              border: '1px solid rgba(255, 0, 85, 0.25)',
              color: '#ff4466',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
            }}
            title="Clear saved data and reset to default"
          >
            <RotateCcw size={12} />
            <span>Reset Data</span>
          </button>
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
          {/* Quick Styles Row (6 Theme Presets) */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={14} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                  QUICK STYLES // 6 THEME PRESETS
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                {themeTokens.name}
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
              }}
            >
              {CURATED_THEME_PRESETS.map((preset) => {
                const isSelected = themeTokens.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className="theme-chip"
                    onClick={() => applyThemePreset(preset.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${preset.accentPrimary}, ${preset.accentSecondary})`,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Suggested For You Card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.06), rgba(255, 0, 85, 0.04))',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                  SUGGESTED FOR YOU
                </span>
                <span
                  style={{
                    fontSize: '0.64rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(0, 242, 254, 0.15)',
                    color: 'var(--accent-cyan)',
                  }}
                >
                  {(portfolio.disciplineName || portfolio.discipline || 'Engineering').toUpperCase()}
                </span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.4 }}>
              <strong>{getDisciplineSuggestion().themeName}</strong> theme + optimized section order.{' '}
              {getDisciplineSuggestion().rationale}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <button
                type="button"
                onClick={handleApplySuggestion}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: 'var(--accent-cyan)',
                  color: '#000',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={12} />
                <span>Apply in 1 Click</span>
              </button>
              {suggestionNotice && (
                <button
                  type="button"
                  onClick={undo}
                  disabled={!canUndo()}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  Undo
                </button>
              )}
            </div>
            {suggestionNotice && (
              <span style={{ fontSize: '0.7rem', color: '#00ff88', fontFamily: 'var(--font-mono)' }}>
                ✓ {suggestionNotice}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeEditorTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
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

              {/* Tone Selector for AI Polish */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={15} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>
                    AI Writing Tone:
                  </span>
                </div>
                <select
                  value={activeTone}
                  onChange={(e) => setActiveTone(e.target.value as AiWritingTone)}
                  style={{
                    padding: '5px 10px',
                    background: '#04070d',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.76rem',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="professional">Professional (Executive & Authoritative)</option>
                  <option value="impactful">Impactful (Outcome & Benchmark-Driven)</option>
                  <option value="concise">Concise (Crisp & Zero Fluff)</option>
                  <option value="technical">Technical (Engineering Architecture)</option>
                  <option value="creative">Creative (Evocative & Distinctive)</option>
                </select>
              </div>

              {/* Collapsed "AI Assistant" Panel (Chat & Mutation Diff) */}
              <div
                style={{
                  borderRadius: '10px',
                  background: 'rgba(0, 242, 254, 0.03)',
                  border: isAiAssistantOpen ? '1px solid var(--accent-cyan)' : '1px solid rgba(0, 242, 254, 0.2)',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  transition: 'border 0.2s ease',
                }}
              >
                {/* Collapsible Accordion Header */}
                <div
                  onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: 'rgba(5, 7, 12, 0.5)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} color="var(--accent-cyan)" />
                    <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>
                      AI Assistant Co-Pilot
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: 'rgba(0, 242, 254, 0.12)',
                        color: 'var(--accent-cyan)',
                      }}
                    >
                      Chat & Co-Pilot
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                      {isAiAssistantOpen ? 'Hide' : 'Open'}
                    </span>
                    {isAiAssistantOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Co-Pilot Body */}
                {isAiAssistantOpen && (
                  <div style={{ padding: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Quick Follow-up Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        'Highlight ANSYS & FEA precision',
                        'Shorten bio for high-impact metrics',
                        'Prioritize top capstone project',
                        'Sharpen technical terminology',
                      ].map((pill, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendChatMessage(undefined, pill)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '999px',
                            padding: '3px 8px',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.7rem',
                            fontFamily: 'var(--font-mono)',
                            cursor: 'pointer',
                          }}
                        >
                          + {pill}
                        </button>
                      ))}
                    </div>

                    {/* Proposed Mutation Diff Banner */}
                    {pendingChatProfile && (
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: 'rgba(0, 242, 254, 0.1)',
                          border: '1px solid var(--accent-cyan)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.82rem' }}>
                            Proposed: {pendingChatProfile.summary}
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={handleAcceptChatProposal}
                              className="btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                            >
                              <Check size={12} />
                              <span>Apply to Store</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleDiscardChatProposal}
                              style={{
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#fff',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                              }}
                            >
                              Discard
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                          {pendingChatProfile.explanation}
                        </div>
                      </div>
                    )}

                    {/* Chat Messages Log */}
                    <div
                      style={{
                        maxHeight: '220px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '10px',
                        background: 'rgba(3, 5, 8, 0.7)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '90%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: msg.sender === 'user' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            border: msg.sender === 'user' ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#fff',
                            fontSize: '0.78rem',
                            lineHeight: 1.45,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: msg.sender === 'user' ? 'var(--accent-cyan)' : 'var(--accent-magenta)' }}>
                              {msg.sender === 'user' ? 'You' : `AI Co-Pilot ${msg.liveAi ? '(OpenAI)' : '(Offline)'}`}
                            </span>
                            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>{msg.timestamp}</span>
                          </div>
                          <div>{msg.text}</div>
                        </div>
                      ))}
                      {isChatting && (
                        <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                          AI Co-Pilot is processing instructions...
                        </div>
                      )}
                    </div>

                    {/* Chat Input Form */}
                    <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Instruct AI co-pilot..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'rgba(3, 5, 8, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '0.82rem',
                          outline: 'none',
                        }}
                      />
                      <button type="submit" disabled={isChatting} className="btn-primary" style={{ padding: '8px 14px' }}>
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )}
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
            </motion.div>
          </AnimatePresence>
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

export default SplitCustomizer;

