import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  MessageSquare,
  Download,
  Share2,
  Check,
  RotateCcw,
  RotateCw,
  Laptop,
  Tablet,
  Smartphone,
  Layers,
  Palette,
  Send,
  Wand2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  Cpu,
  Plus,
  Trash2,
  Edit3,
  Lightbulb,
  Briefcase,
  GraduationCap,
  Wrench,
  Compass,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type {
  PortfolioData,
  UserRole,
  EducationBranch,
  ThemePreset,
  Hero3DMode,
  TechSkill,
  ProjectItem,
  EducationItem,
  ExperienceItem,
} from '../types/portfolio';
import { AiApiClient, type ServerHealth, type AiRecommendationsResult } from '../services/aiApiClient.ts';
import { THEME_CONFIGS } from '../data/themeConfig';
import {
  ALL_DISCIPLINE_OPTIONS,
  getDisciplinePreset,
  type DisciplinePreset,
} from '../data/disciplinePresets.ts';

interface CreatorStudioProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: PortfolioData;
  onUpdatePortfolio: (updated: PortfolioData) => void;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onChangePreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  isOpen,
  onClose,
  portfolio,
  onUpdatePortfolio,
  previewMode,
  onChangePreviewMode,
}) => {
  // Navigation: Enter Details -> Generate Portfolio -> Customize & Co-Pilot -> Download or Publish
  const [activeTab, setActiveTab] = useState<'details' | 'autopilot' | 'sections' | 'chat' | 'theme' | 'export'>('details');
  const [history, setHistory] = useState<PortfolioData[]>([portfolio]);
  const [future, setFuture] = useState<PortfolioData[]>([]);

  // Server & Model Status
  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);

  // Multi-Discipline State
  const [selectedBranch, setSelectedBranch] = useState<EducationBranch>(portfolio.branch || 'cs_it');
  const [customBranchName, setCustomBranchName] = useState<string>(portfolio.branchName || '');

  // Computed Discipline Preset
  const activeDiscipline: DisciplinePreset = getDisciplinePreset(selectedBranch, customBranchName);

  // Personal Info State
  const [autopilotName, setAutopilotName] = useState(portfolio.name);
  const [autopilotInterests, setAutopilotInterests] = useState(portfolio.interests.join(', '));
  const [autopilotRole, setAutopilotRole] = useState<UserRole>(portfolio.role);
  const [userLocation, setUserLocation] = useState(portfolio.location || '');
  const [userEmail, setUserEmail] = useState(portfolio.email || '');

  // Sub-sections in Details tab
  const [detailsSubTab, setDetailsSubTab] = useState<'branch_role' | 'skills' | 'projects' | 'education' | 'experience'>('branch_role');

  // Interactive Skills State
  const [skillsList, setSkillsList] = useState<TechSkill[]>(portfolio.skills || []);
  const [newSkillName, setNewSkillName] = useState('');
  const newSkillCategory = 'Core Competency';

  // Interactive Projects State (Verified user projects)
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(portfolio.projects || []);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTags, setNewProjTags] = useState('');
  const [newProjMetrics, setNewProjMetrics] = useState('');

  // Interactive Education State
  const [educationList, setEducationList] = useState<EducationItem[]>(portfolio.education || []);
  const [isAddingEdu, setIsAddingEdu] = useState(false);
  const [newEduInst, setNewEduInst] = useState('');
  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduPeriod, setNewEduPeriod] = useState('');
  const [newEduScore, setNewEduScore] = useState('');

  // Interactive Experience State
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>(portfolio.experiences || []);
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpPeriod, setNewExpPeriod] = useState('');
  const [newExpPoints, setNewExpPoints] = useState('');

  // Generation Status State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationMeta, setGenerationMeta] = useState<{
    liveAi: boolean;
    model: string;
    message: string;
    suggestions?: string[];
  } | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Conversational Assistant State
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; timestamp: string; liveAi?: boolean }>
  >([
    {
      sender: 'assistant',
      text: `Hello! I'm your AI Portfolio Co-Pilot. I can help tailor your 3D portfolio for your discipline (${activeDiscipline.label}), rewrite bios, prioritize capstone projects, or adjust visual themes.`,
      timestamp: 'Now',
    },
  ]);
  const [pendingChatProfile, setPendingChatProfile] = useState<{
    profile: PortfolioData;
    explanation: string;
    summary: string;
  } | null>(null);

  // Section Rewriter & Tone State
  const [rewriteTarget, setRewriteTarget] = useState<'tagline' | 'shortBio' | 'fullBio' | 'targetRole'>('tagline');
  const [rewriteTone, setRewriteTone] = useState<'professional' | 'creative' | 'concise' | 'impactful' | 'technical'>('professional');
  const [rewriteCustomInstruction, setRewriteCustomInstruction] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [pendingRewrite, setPendingRewrite] = useState<{
    section: string;
    original: string;
    rewritten: string;
    explanation: string;
    liveAi: boolean;
  } | null>(null);

  // Recommendations State
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);
  const [recommendations, setRecommendations] = useState<AiRecommendationsResult | null>(null);

  // Public Link State
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);

  // Check backend server health on open
  useEffect(() => {
    if (isOpen) {
      AiApiClient.checkHealth().then((health) => {
        setServerHealth(health);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Run AI Autopilot Generation
  const handleRunAutopilot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStep(`Analyzing ${activeDiscipline.label} requirements...`);

    try {
      setTimeout(() => setGenerationStep(`Synthesizing tailored ${autopilotRole.toUpperCase()} portfolio...`), 300);

      const result = await AiApiClient.generatePortfolio({
        name: autopilotName || 'Alex Chen',
        branch: selectedBranch,
        customBranchName: selectedBranch === 'custom' ? customBranchName : undefined,
        interests: autopilotInterests || activeDiscipline.defaultInterests.join(', '),
        role: autopilotRole,
        skills: skillsList,
        projects: projectsList,
        education: educationList,
        experiences: experienceList,
        currentProfile: {
          ...portfolio,
          location: userLocation,
          email: userEmail,
        },
      });

      setGenerationStep('Assembling 3D telemetry and Bento statistics...');

      // Save to undo history, clear redo stack
      setHistory((prev) => [...prev, result.portfolio]);
      setFuture([]);
      onUpdatePortfolio(result.portfolio);

      // Synchronize internal lists with the generated portfolio
      setSkillsList(result.portfolio.skills);
      setProjectsList(result.portfolio.projects);
      setEducationList(result.portfolio.education);
      setExperienceList(result.portfolio.experiences);

      setGenerationMeta({
        liveAi: result.liveAi,
        model: result.model,
        message: result.message,
        suggestions: result.improvementSuggestions,
      });

      // Confetti celebration
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#ff0055', '#ffffff'],
      });

      // Advance to Autopilot overview tab
      setActiveTab('autopilot');
    } catch (err: any) {
      setGenerationError(err?.message || 'Failed to complete generation. Please retry.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Conversational Assistant Co-Pilot
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

  // Accept Co-Pilot changes
  const handleAcceptChatProposal = () => {
    if (!pendingChatProfile) return;
    setHistory((prev) => [...prev, pendingChatProfile.profile]);
    setFuture([]);
    onUpdatePortfolio(pendingChatProfile.profile);
    setSkillsList(pendingChatProfile.profile.skills);
    setProjectsList(pendingChatProfile.profile.projects);
    setEducationList(pendingChatProfile.profile.education);
    setExperienceList(pendingChatProfile.profile.experiences);
    setPendingChatProfile(null);
  };

  // Discard Co-Pilot changes
  const handleDiscardChatProposal = () => {
    setPendingChatProfile(null);
  };

  // Rewrite individual section
  const handleRewriteSection = async () => {
    setIsRewriting(true);
    try {
      const originalContent = portfolio[rewriteTarget] || '';
      const res = await AiApiClient.rewriteSection({
        section: rewriteTarget,
        content: originalContent,
        tone: rewriteTone,
        instruction: rewriteCustomInstruction || undefined,
        role: portfolio.role,
      });

      setPendingRewrite({
        section: rewriteTarget,
        original: String(originalContent),
        rewritten: String(res.rewritten),
        explanation: res.explanation,
        liveAi: res.liveAi,
      });
    } catch (err: any) {
      alert(`Rewrite failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsRewriting(false);
    }
  };

  // Accept section rewrite
  const handleAcceptRewrite = () => {
    if (!pendingRewrite) return;
    const updated = {
      ...portfolio,
      [pendingRewrite.section]: pendingRewrite.rewritten,
    };
    setHistory((prev) => [...prev, updated]);
    setFuture([]);
    onUpdatePortfolio(updated);
    setPendingRewrite(null);
  };

  // Fetch role recommendations
  const handleFetchRecommendations = async () => {
    setIsFetchingRecs(true);
    try {
      const res = await AiApiClient.getRecommendations({
        profile: portfolio,
        role: portfolio.role,
      });
      setRecommendations(res);
    } catch (err: any) {
      alert(`Recommendations check failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsFetchingRecs(false);
    }
  };

  // Apply recommendations
  const handleApplyRecommendations = () => {
    if (!recommendations) return;
    const visibilityUpdate = { ...portfolio.sectionVisibility };
    recommendations.recommendedSections.forEach((sec) => {
      if (sec in visibilityUpdate) {
        (visibilityUpdate as any)[sec] = true;
      }
    });

    const updated: PortfolioData = {
      ...portfolio,
      sectionOrder: recommendations.priorityOrder as any,
      sectionVisibility: visibilityUpdate,
    };
    setHistory((prev) => [...prev, updated]);
    setFuture([]);
    onUpdatePortfolio(updated);
  };

  // Add Project Idea into Verified Work
  const handleAcceptProjectIdea = (ideaId: string) => {
    const updatedProjects = projectsList.map((p) => {
      if (p.id === ideaId) {
        return { ...p, isAiIdea: false, role: 'Verified Project' };
      }
      return p;
    });
    setProjectsList(updatedProjects);
    const updated = { ...portfolio, projects: updatedProjects };
    setHistory((prev) => [...prev, updated]);
    setFuture([]);
    onUpdatePortfolio(updated);
  };

  // Dismiss Project Idea
  const handleDismissProjectIdea = (ideaId: string) => {
    const updatedProjects = projectsList.filter((p) => p.id !== ideaId);
    setProjectsList(updatedProjects);
    const updated = { ...portfolio, projects: updatedProjects };
    setHistory((prev) => [...prev, updated]);
    setFuture([]);
    onUpdatePortfolio(updated);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (history.length <= 1) return;
    const previous = history[history.length - 2];
    const newHistory = history.slice(0, -1);
    setFuture((prev) => [portfolio, ...prev]);
    setHistory(newHistory);
    onUpdatePortfolio(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setHistory((prev) => [...prev, next]);
    setFuture(newFuture);
    onUpdatePortfolio(next);
  };

  // Copy Public URL
  const handleCopyShareableLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Standalone Complete Website ZIP Exporter
  const handleExportZip = async () => {
    setExportingZip(true);
    try {
      const zip = new JSZip();

      const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${portfolio.name} — ${portfolio.tagline}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #030508;
      --bg-secondary: #080d17;
      --accent-cyan: #00f2fe;
      --accent-magenta: #ff0055;
      --text-primary: #ffffff;
      --text-secondary: rgba(255, 255, 255, 0.65);
      --font-display: 'Syne', sans-serif;
      --font-heading: 'Space Grotesk', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-body);
      overflow-x: hidden;
      line-height: 1.6;
    }
    .glass-panel {
      background: rgba(10, 15, 26, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 242, 254, 0.2);
      border-radius: 12px;
    }
    .glow-cyan {
      text-shadow: 0 0 20px rgba(0, 242, 254, 0.6);
    }
  </style>
</head>
<body>
  <header style="position: fixed; top: 0; left: 0; right: 0; height: 75px; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; background: rgba(3, 5, 8, 0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div style="font-family: var(--font-heading); font-weight: 700; letter-spacing: 0.1em; color: #fff;">
      ${portfolio.name.toUpperCase()} <span style="color: var(--accent-cyan); font-size: 0.8rem;">// ${portfolio.branchName ? portfolio.branchName.toUpperCase() : portfolio.role.toUpperCase()}</span>
    </div>
    <nav style="display: flex; gap: 24px; font-family: var(--font-mono); font-size: 0.8rem;">
      <a href="#about" style="color: rgba(255,255,255,0.7); text-decoration: none;">ABOUT</a>
      <a href="#projects" style="color: rgba(255,255,255,0.7); text-decoration: none;">PROJECTS</a>
      <a href="#contact" style="color: rgba(255,255,255,0.7); text-decoration: none;">CONTACT</a>
    </nav>
  </header>

  <section style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 120px 24px 60px;">
    <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan); margin-bottom: 16px; letter-spacing: 0.2em;">
      ${portfolio.telemetry?.status || 'STATUS: ACTIVE // 2026'}
    </div>
    <h1 style="font-family: var(--font-display); font-size: clamp(3rem, 8vw, 6.5rem); font-weight: 800; line-height: 1; margin-bottom: 16px;" class="glow-cyan">
      ${portfolio.name}
    </h1>
    <p style="font-family: var(--font-heading); font-size: clamp(1.2rem, 3vw, 2rem); color: rgba(255,255,255,0.85); max-width: 800px; margin-bottom: 32px;">
      ${portfolio.tagline}
    </p>
    <div style="display: flex; gap: 16px;">
      <a href="#projects" style="background: var(--accent-cyan); color: #000; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none;">VIEW PROJECTS</a>
      <a href="#contact" style="border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none;">GET IN TOUCH</a>
    </div>
  </section>

  <section id="about" style="padding: 100px 32px; max-width: 1200px; margin: 0 auto;">
    <h2 style="font-family: var(--font-display); font-size: 2.8rem; margin-bottom: 40px;">ABOUT ME.</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
      <div class="glass-panel" style="padding: 32px;">
        <h3 style="color: var(--accent-cyan); margin-bottom: 12px; font-family: var(--font-mono); font-size: 0.85rem;">BIOGRAPHY</h3>
        <p style="color: rgba(255,255,255,0.85); font-size: 1.05rem; line-height: 1.7;">${portfolio.fullBio}</p>
      </div>
      <div class="glass-panel" style="padding: 32px;">
        <h3 style="color: var(--accent-cyan); margin-bottom: 16px; font-family: var(--font-mono); font-size: 0.85rem;">CORE TOOLS & SKILLS</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${portfolio.skills.map(s => `<span style="background: rgba(0,242,254,0.1); border: 1px solid rgba(0,242,254,0.3); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-family: var(--font-mono);">${s.name}</span>`).join('')}
        </div>
      </div>
    </div>
  </section>

  <section id="projects" style="padding: 100px 32px; max-width: 1200px; margin: 0 auto;">
    <h2 style="font-family: var(--font-display); font-size: 2.8rem; margin-bottom: 40px;">SELECTED WORKS.</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">
      ${portfolio.projects.map(p => `
        <div class="glass-panel" style="padding: 28px; border-top: 3px solid ${p.isAiIdea ? 'var(--accent-magenta)' : 'var(--accent-cyan)'};">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-size: 0.75rem; color: ${p.isAiIdea ? 'var(--accent-magenta)' : 'var(--accent-cyan)'}; font-family: var(--font-mono);">${p.isAiIdea ? '💡 AI SUGGESTION' : '✓ VERIFIED PROJECT'}</span>
            ${p.metrics ? `<span style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">${p.metrics}</span>` : ''}
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; margin-bottom: 12px;">${p.title}</h3>
          <p style="color: rgba(255,255,255,0.75); font-size: 0.9rem; margin-bottom: 16px; line-height: 1.6;">${p.description}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${(p.tools || p.tags || []).map(t => `<span style="background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-family: var(--font-mono);">${t}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  </section>

  <footer id="contact" style="padding: 80px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); background: #020305;">
    <h3 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 12px;">INITIATE INQUIRY</h3>
    <p style="color: rgba(255,255,255,0.7); margin-bottom: 24px;">${portfolio.email} ${portfolio.location ? `• ${portfolio.location}` : ''}</p>
    <p style="color: rgba(255,255,255,0.4); font-size: 0.8rem; font-family: var(--font-mono);">
      Generated via AI-Powered 3D Portfolio Platform // ${portfolio.telemetry?.fps || '60 FPS STABLE'}
    </p>
  </footer>
</body>
</html>`;

      zip.file('index.html', standaloneHtml);
      zip.file('portfolio.json', JSON.stringify(portfolio, null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${portfolio.name.toLowerCase().replace(/\s+/g, '_')}_3D_portfolio.zip`);
    } catch (err: any) {
      alert(`Export failed: ${err?.message || 'Error creating ZIP file'}`);
    } finally {
      setExportingZip(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 4, 8, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '24px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1160px',
          height: '94vh',
          maxHeight: '920px',
          background: 'rgba(9, 13, 22, 0.96)',
          border: '1px solid var(--accent-cyan)',
          boxShadow: '0 0 60px -10px var(--glow-color)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top Control Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(5, 7, 12, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#000" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#ffffff',
                  }}
                >
                  AI PORTFOLIO STUDIO // MULTI-DISCIPLINE GENERATOR
                </h3>

                {/* Server Status Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    background: serverHealth?.hasOpenAiKey ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 170, 0, 0.12)',
                    border: serverHealth?.hasOpenAiKey ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid rgba(255, 170, 0, 0.3)',
                    color: serverHealth?.hasOpenAiKey ? 'var(--accent-cyan)' : '#ffaa00',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: serverHealth?.hasOpenAiKey ? '#00f2fe' : '#ffaa00',
                      boxShadow: serverHealth?.hasOpenAiKey ? '0 0 6px #00f2fe' : 'none',
                    }}
                  />
                  <span>
                    {serverHealth?.hasOpenAiKey ? `OPENAI ACTIVE // ${serverHealth.model.toUpperCase()}` : 'OFFLINE HEURISTIC ACTIVE'}
                  </span>
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                DISCIPLINE: {activeDiscipline.label.toUpperCase()} // ROLE: {portfolio.role.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Viewport Preview Mode Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              onClick={() => onChangePreviewMode('desktop')}
              title="Desktop Preview"
              style={{
                background: previewMode === 'desktop' ? 'var(--accent-cyan)' : 'transparent',
                color: previewMode === 'desktop' ? '#000' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              <Laptop size={16} />
            </button>
            <button
              onClick={() => onChangePreviewMode('tablet')}
              title="Tablet Preview"
              style={{
                background: previewMode === 'tablet' ? 'var(--accent-cyan)' : 'transparent',
                color: previewMode === 'tablet' ? '#000' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => onChangePreviewMode('mobile')}
              title="Mobile Preview"
              style={{
                background: previewMode === 'mobile' ? 'var(--accent-cyan)' : 'transparent',
                color: previewMode === 'mobile' ? '#000' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              <Smartphone size={16} />
            </button>
          </div>

          {/* Undo, Redo & Close Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleUndo}
              disabled={history.length <= 1}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: history.length > 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                cursor: history.length > 1 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}
            >
              <RotateCcw size={14} />
              <span>UNDO</span>
            </button>

            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: future.length > 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                cursor: future.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}
            >
              <RotateCw size={14} />
              <span>REDO</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation: Enter Details -> Generate Portfolio -> Customize -> Download or Publish */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(5, 7, 12, 0.4)',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'details', label: '1. Enter Details', icon: Edit3 },
            { id: 'autopilot', label: '2. Generate (AI Autopilot)', icon: Sparkles },
            { id: 'sections', label: '3. Sections & AI Rewriter', icon: Layers },
            { id: 'chat', label: '4. Conversational Editor', icon: MessageSquare },
            { id: 'theme', label: '5. Visual Themes & 3D', icon: Palette },
            { id: 'export', label: '6. Download & Publish', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  background: active ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  padding: '14px 20px',
                  color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {/* STEP 1: ENTER DETAILS */}
          {activeTab === 'details' && (
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '8px',
                  }}
                >
                  Step 1: Enter Your Background & Verified Details
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Select your educational branch, profession, and role. Enter your verified qualifications, skills, and projects without code.
                </p>
              </div>

              {/* Sub-Tabs for Details */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingBottom: '10px',
                }}
              >
                {[
                  { id: 'branch_role', label: 'Discipline & Role', icon: Compass },
                  { id: 'skills', label: `Skills (${skillsList.length})`, icon: Wrench },
                  { id: 'projects', label: `Projects (${projectsList.length})`, icon: Briefcase },
                  { id: 'education', label: `Education (${educationList.length})`, icon: GraduationCap },
                  { id: 'experience', label: `Experience (${experienceList.length})`, icon: Award },
                ].map((st) => {
                  const Icon = st.icon;
                  const active = detailsSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setDetailsSubTab(st.id as any)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        background: active ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
                        color: active ? '#000' : '#fff',
                        border: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Icon size={13} />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* SECTION 1: DISCIPLINE & ROLE */}
              {detailsSubTab === 'branch_role' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Educational Branch Selection Grid */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: 'var(--accent-cyan)',
                        marginBottom: '10px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      1. SELECT EDUCATIONAL BRANCH / PROFESSION
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '10px',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        padding: '4px',
                      }}
                    >
                      {ALL_DISCIPLINE_OPTIONS.map((disc) => {
                        const selected = selectedBranch === disc.id;
                        return (
                          <div
                            key={disc.id}
                            onClick={() => setSelectedBranch(disc.id)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '8px',
                              border: selected ? '2px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: selected ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div
                              style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: selected ? 'var(--accent-cyan)' : '#ffffff',
                                marginBottom: '2px',
                              }}
                            >
                              {disc.label}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              {disc.shortName} • {disc.category}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Branch Input if selected */}
                  {selectedBranch === 'custom' && (
                    <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.06)', border: '1px solid var(--accent-cyan)' }}>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                        ENTER YOUR CUSTOM BRANCH OR PROFESSION
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Industrial Design, Marine Engineering, Architecture, Product Management..."
                        value={customBranchName}
                        onChange={(e) => setCustomBranchName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(5, 7, 11, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.95rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  )}

                  {/* Role Selector */}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)', marginBottom: '10px' }}>
                      2. CURRENT ROLE
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {[
                        { id: 'student', label: '1. Student', desc: 'Focuses on coursework, academic projects, CAD/lab models' },
                        { id: 'job_seeker', label: '2. Job Seeker', desc: 'ATS-tailored headline, verified skills & portfolio resume' },
                        { id: 'professional', label: '3. Working Professional', desc: 'Industry leadership, production metrics, standards compliance' },
                        { id: 'freelancer', label: '4. Freelancer', desc: 'Consulting deliverables, client case studies, custom scopes' },
                      ].map((r) => {
                        const selected = autopilotRole === r.id;
                        return (
                          <div
                            key={r.id}
                            onClick={() => setAutopilotRole(r.id as any)}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: selected ? '2px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: selected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ fontWeight: 700, color: selected ? 'var(--accent-cyan)' : '#fff', fontSize: '0.88rem' }}>
                              {r.label}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{r.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={autopilotName}
                        onChange={(e) => setAutopilotName(e.target.value)}
                        placeholder="e.g. Sharvil Naikwade"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(5, 7, 11, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                        EMAIL / CONTACT
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="e.g. sharvil@example.com"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(5, 7, 11, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                        LOCATION
                      </label>
                      <input
                        type="text"
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        placeholder="e.g. Pune, Maharashtra / Remote"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(5, 7, 11, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                    </div>
                  </div>

                  {/* Areas of Interest with Suggested Branch Chips */}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                      AREAS OF INTEREST (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={autopilotInterests}
                      onChange={(e) => setAutopilotInterests(e.target.value)}
                      placeholder="e.g. CAD, Finite Element Analysis, Thermal Systems..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(5, 7, 11, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        marginBottom: '8px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                        Recommended for {activeDiscipline.shortName}:
                      </span>
                      {activeDiscipline.defaultInterests.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => {
                            if (!autopilotInterests.includes(interest)) {
                              setAutopilotInterests(prev => prev ? `${prev}, ${interest}` : interest);
                            }
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '999px',
                            padding: '3px 10px',
                            color: '#fff',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                          }}
                        >
                          + {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Next Action */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={() => setDetailsSubTab('skills')}
                      className="btn-primary"
                      style={{ padding: '12px 24px' }}
                    >
                      Next: Manage Skills →
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 2: SKILLS MANAGER */}
              {detailsSubTab === 'skills' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.1rem' }}>
                      Your Technical & Domain Skills ({skillsList.length})
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Click on any skill to remove it
                    </span>
                  </div>

                  {/* Current Skills List */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px', background: 'rgba(5, 7, 11, 0.6)', borderRadius: '10px' }}>
                    {skillsList.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(0, 242, 254, 0.1)',
                          border: '1px solid rgba(0, 242, 254, 0.3)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          color: '#fff',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <span>{skill.name}</span>
                        <button
                          type="button"
                          onClick={() => setSkillsList(skillsList.filter((_, i) => i !== idx))}
                          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0 }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Custom Skill Form */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Add a new skill (e.g. SolidWorks, ROS, ETABS, MATLAB)..."
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: 'rgba(5, 7, 11, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSkillName.trim()) {
                          setSkillsList([...skillsList, { name: newSkillName.trim(), category: newSkillCategory, level: 'advanced' }]);
                          setNewSkillName('');
                        }
                      }}
                      className="btn-primary"
                      style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                    >
                      <Plus size={14} />
                      <span>Add Skill</span>
                    </button>
                  </div>

                  {/* 1-Click Recommended Skills from Chosen Branch */}
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                      Suggested Tools & Skills for {activeDiscipline.label}:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {activeDiscipline.recommendedSkills.map((rs) => {
                        const alreadyAdded = skillsList.some(s => s.name.toLowerCase() === rs.name.toLowerCase());
                        return (
                          <button
                            key={rs.name}
                            type="button"
                            disabled={alreadyAdded}
                            onClick={() => {
                              if (!alreadyAdded) setSkillsList([...skillsList, rs]);
                            }}
                            style={{
                              background: alreadyAdded ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                              border: alreadyAdded ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                              color: alreadyAdded ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.8)',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)',
                              cursor: alreadyAdded ? 'default' : 'pointer',
                            }}
                          >
                            {alreadyAdded ? '✓ ' : '+ '} {rs.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
                    <button type="button" onClick={() => setDetailsSubTab('branch_role')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button type="button" onClick={() => setDetailsSubTab('projects')} className="btn-primary" style={{ padding: '10px 22px' }}>
                      Next: Manage Projects →
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 3: PROJECTS MANAGER */}
              {detailsSubTab === 'projects' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.1rem' }}>
                        Your Verified Projects ({projectsList.length})
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        All user projects are verified. No credentials or metrics are fabricated.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingProject(!isAddingProject)}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                    >
                      <Plus size={14} />
                      <span>{isAddingProject ? 'Cancel' : '+ Add Project'}</span>
                    </button>
                  </div>

                  {/* Add Project Form */}
                  {isAddingProject && (
                    <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(5, 7, 11, 0.9)', border: '1px solid var(--accent-cyan)' }}>
                      <h5 style={{ color: '#fff', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>
                        New Verified Project
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Project Title (e.g. Gearbox FEA Optimization, AMR Robot SLAM, G+12 Seismic Design)..."
                          value={newProjTitle}
                          onChange={(e) => setNewProjTitle(e.target.value)}
                          style={{ padding: '10px 14px', background: '#030508', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                        />
                        <textarea
                          rows={3}
                          placeholder="Project Description (tools used, mechanical/computational approach, problem solved)..."
                          value={newProjDesc}
                          onChange={(e) => setNewProjDesc(e.target.value)}
                          style={{ padding: '10px 14px', background: '#030508', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <input
                            type="text"
                            placeholder="Tools / Tags (e.g. SolidWorks, ANSYS, ROS 2, ETABS)..."
                            value={newProjTags}
                            onChange={(e) => setNewProjTags(e.target.value)}
                            style={{ padding: '8px 12px', background: '#030508', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                          />
                          <input
                            type="text"
                            placeholder="Verified Metrics (e.g. 14% Mass Reduction, Sub-2cm Precision)..."
                            value={newProjMetrics}
                            onChange={(e) => setNewProjMetrics(e.target.value)}
                            style={{ padding: '8px 12px', background: '#030508', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (newProjTitle.trim()) {
                              const newProj: ProjectItem = {
                                id: `user-proj-${Date.now()}`,
                                title: newProjTitle.trim(),
                                description: newProjDesc.trim(),
                                tags: newProjTags.split(',').map(t => t.trim()).filter(Boolean),
                                metrics: newProjMetrics.trim(),
                                isAiIdea: false,
                              };
                              setProjectsList([...projectsList, newProj]);
                              setNewProjTitle('');
                              setNewProjDesc('');
                              setNewProjTags('');
                              setNewProjMetrics('');
                              setIsAddingProject(false);
                            }
                          }}
                          className="btn-primary"
                          style={{ alignSelf: 'flex-start', padding: '8px 18px', marginTop: '6px' }}
                        >
                          Save Verified Project
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of Verified Projects */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {projectsList.map((p, idx) => (
                      <div
                        key={p.id}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: p.isAiIdea ? '1px dashed var(--accent-magenta)' : '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{p.title}</span>
                            <span
                              style={{
                                fontSize: '0.65rem',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: p.isAiIdea ? 'rgba(255,0,85,0.15)' : 'rgba(0,242,254,0.15)',
                                color: p.isAiIdea ? 'var(--accent-magenta)' : 'var(--accent-cyan)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {p.isAiIdea ? 'AI SUGGESTION' : 'VERIFIED PROJECT'}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '8px' }}>
                            {p.description}
                          </p>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {(p.tools || p.tags || []).map(t => (
                              <span key={t} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', color: '#fff' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProjectsList(projectsList.filter((_, i) => i !== idx))}
                          style={{ background: 'transparent', border: 'none', color: '#ff4466', cursor: 'pointer', padding: '6px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
                    <button type="button" onClick={() => setDetailsSubTab('skills')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button type="button" onClick={() => setDetailsSubTab('education')} className="btn-primary" style={{ padding: '10px 22px' }}>
                      Next: Manage Education →
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 4: EDUCATION MANAGER */}
              {detailsSubTab === 'education' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.1rem' }}>
                      Your Education & Academic Degrees ({educationList.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingEdu(!isAddingEdu)}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                    >
                      <Plus size={14} />
                      <span>{isAddingEdu ? 'Cancel' : '+ Add Education'}</span>
                    </button>
                  </div>

                  {isAddingEdu && (
                    <div style={{ padding: '18px', borderRadius: '10px', background: '#05070b', border: '1px solid var(--accent-cyan)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Institution (e.g. Rajarambapu Institute of Technology, IIT, NIT)..."
                        value={newEduInst}
                        onChange={(e) => setNewEduInst(e.target.value)}
                        style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                      />
                      <input
                        type="text"
                        placeholder="Degree & Specialization (e.g. B.Tech Mechanical Engineering, Diploma Mechatronics)..."
                        value={newEduDegree}
                        onChange={(e) => setNewEduDegree(e.target.value)}
                        style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Period (e.g. 2022 – 2026)..."
                          value={newEduPeriod}
                          onChange={(e) => setNewEduPeriod(e.target.value)}
                          style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                        />
                        <input
                          type="text"
                          placeholder="Score / CGPA (e.g. CGPA: 8.4 / 10)..."
                          value={newEduScore}
                          onChange={(e) => setNewEduScore(e.target.value)}
                          style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (newEduInst.trim()) {
                            setEducationList([...educationList, {
                              id: `edu-${Date.now()}`,
                              institution: newEduInst.trim(),
                              degree: newEduDegree.trim(),
                              period: newEduPeriod.trim(),
                              score: newEduScore.trim(),
                            }]);
                            setNewEduInst('');
                            setNewEduDegree('');
                            setNewEduPeriod('');
                            setNewEduScore('');
                            setIsAddingEdu(false);
                          }
                        }}
                        className="btn-primary"
                        style={{ alignSelf: 'flex-start', padding: '8px 16px', marginTop: '6px' }}
                      >
                        Save Education
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {educationList.map((edu, idx) => (
                      <div
                        key={edu.id}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{edu.degree}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {edu.institution} • {edu.period} {edu.score ? `(${edu.score})` : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEducationList(educationList.filter((_, i) => i !== idx))}
                          style={{ background: 'transparent', border: 'none', color: '#ff4466', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
                    <button type="button" onClick={() => setDetailsSubTab('projects')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button type="button" onClick={() => setDetailsSubTab('experience')} className="btn-primary" style={{ padding: '10px 22px' }}>
                      Next: Manage Experience →
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 5: EXPERIENCE MANAGER */}
              {detailsSubTab === 'experience' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.1rem' }}>
                      Your Experience & Internships ({experienceList.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingExp(!isAddingExp)}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                    >
                      <Plus size={14} />
                      <span>{isAddingExp ? 'Cancel' : '+ Add Experience'}</span>
                    </button>
                  </div>

                  {isAddingExp && (
                    <div style={{ padding: '18px', borderRadius: '10px', background: '#05070b', border: '1px solid var(--accent-cyan)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Organization / Company..."
                          value={newExpCompany}
                          onChange={(e) => setNewExpCompany(e.target.value)}
                          style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                        />
                        <input
                          type="text"
                          placeholder="Role (e.g. Mechanical Design Intern, CAD Trainee)..."
                          value={newExpRole}
                          onChange={(e) => setNewExpRole(e.target.value)}
                          style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Period (e.g. Jun 2025 – Aug 2025)..."
                        value={newExpPeriod}
                        onChange={(e) => setNewExpPeriod(e.target.value)}
                        style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                      />
                      <textarea
                        rows={2}
                        placeholder="Key Contributions (comma or newline separated)..."
                        value={newExpPoints}
                        onChange={(e) => setNewExpPoints(e.target.value)}
                        style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newExpCompany.trim()) {
                            setExperienceList([...experienceList, {
                              id: `exp-${Date.now()}`,
                              company: newExpCompany.trim(),
                              role: newExpRole.trim(),
                              period: newExpPeriod.trim(),
                              points: newExpPoints.split('\n').map(p => p.trim()).filter(Boolean),
                              isVerified: true,
                            }]);
                            setNewExpCompany('');
                            setNewExpRole('');
                            setNewExpPeriod('');
                            setNewExpPoints('');
                            setIsAddingExp(false);
                          }
                        }}
                        className="btn-primary"
                        style={{ alignSelf: 'flex-start', padding: '8px 16px', marginTop: '6px' }}
                      >
                        Save Experience
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {experienceList.map((exp, idx) => (
                      <div
                        key={exp.id}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{exp.role}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {exp.company} • {exp.period}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExperienceList(experienceList.filter((_, i) => i !== idx))}
                          style={{ background: 'transparent', border: 'none', color: '#ff4466', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Proceed to Generation Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                    <button type="button" onClick={() => setDetailsSubTab('education')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('autopilot')}
                      className="btn-primary"
                      style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                    >
                      <Sparkles size={16} />
                      <span>Proceed to AI Generation →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: GENERATE PORTFOLIO (AI AUTOPILOT) */}
          {activeTab === 'autopilot' && (
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 14px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    background: serverHealth?.hasOpenAiKey ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 170, 0, 0.1)',
                    border: serverHealth?.hasOpenAiKey ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid rgba(255, 170, 0, 0.3)',
                    color: serverHealth?.hasOpenAiKey ? 'var(--accent-cyan)' : '#ffaa00',
                    marginBottom: '12px',
                  }}
                >
                  <Cpu size={12} />
                  <span>
                    {serverHealth?.hasOpenAiKey
                      ? `OPENAI INTEGRATION // ${serverHealth.model.toUpperCase()} // STRICT ANTI-HALLUCINATION`
                      : 'OFFLINE FACT-GOVERNED AI // ZERO HALLUCINATION'}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '8px',
                  }}
                >
                  Generate Your Tailored 3D Portfolio
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Active Discipline: <strong style={{ color: 'var(--accent-cyan)' }}>{activeDiscipline.label}</strong> ({autopilotRole.toUpperCase()})
                </p>
              </div>

              {/* Generation Meta Outcome Banner */}
              {generationMeta && (
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: generationMeta.liveAi ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 170, 0, 0.08)',
                    border: generationMeta.liveAi ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid rgba(255, 170, 0, 0.3)',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <CheckCircle2 size={16} color={generationMeta.liveAi ? '#00f2fe' : '#ffaa00'} />
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>
                      {generationMeta.message}
                    </span>
                  </div>
                  {generationMeta.suggestions && generationMeta.suggestions.length > 0 && (
                    <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '6px' }}>
                      {generationMeta.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Error Message */}
              {generationError && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: 'rgba(255, 0, 85, 0.1)',
                    border: '1px solid rgba(255, 0, 85, 0.3)',
                    color: '#ff8899',
                    fontSize: '0.85rem',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{generationError}</span>
                </div>
              )}

              {/* Summary Card of Input Data */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>NAME: </span>
                    <strong style={{ color: '#fff' }}>{autopilotName || 'Alex Chen'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>BRANCH: </span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{activeDiscipline.shortName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>ROLE: </span>
                    <strong style={{ color: '#fff' }}>{autopilotRole.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>VERIFIED PROJECTS: </span>
                    <strong style={{ color: '#fff' }}>{projectsList.filter(p => !p.isAiIdea).length} Projects</strong>
                  </div>
                </div>
              </div>

              {/* Generate Trigger Button */}
              <button
                type="button"
                onClick={() => handleRunAutopilot()}
                disabled={isGenerating}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '18px',
                  fontSize: '1.05rem',
                  justifyContent: 'center',
                  marginBottom: '28px',
                }}
              >
                <Sparkles size={20} />
                <span>{isGenerating ? (generationStep || 'GENERATING 3D PORTFOLIO...') : `GENERATE ${activeDiscipline.shortName.toUpperCase()} PORTFOLIO`}</span>
              </button>

              {/* DISCIPLINE CAREER RECOMMENDATIONS */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'rgba(0, 242, 254, 0.04)',
                  border: '1px solid rgba(0, 242, 254, 0.2)',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Lightbulb size={16} color="var(--accent-cyan)" />
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                    Career & Portfolio Recommendations for {activeDiscipline.label}:
                  </span>
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                  {(portfolio.careerRecommendations || activeDiscipline.careerRecommendations).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* AI SUGGESTED PROJECTS PANEL */}
              {projectsList.some(p => p.isAiIdea) && (
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    background: 'rgba(255, 0, 85, 0.04)',
                    border: '1px solid rgba(255, 0, 85, 0.2)',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sparkles size={16} color="var(--accent-magenta)" />
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      AI Concept Suggestions (Identified Separately)
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {projectsList.filter(p => p.isAiIdea).map((idea) => (
                      <div
                        key={idea.id}
                        style={{
                          padding: '14px',
                          borderRadius: '8px',
                          background: 'rgba(5, 7, 11, 0.8)',
                          border: '1px dashed var(--accent-magenta)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem', marginBottom: '2px' }}>
                            {idea.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                            {idea.description}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleAcceptProjectIdea(idea.id || '')}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                          >
                            <Check size={12} />
                            <span>Add to Portfolio</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDismissProjectIdea(idea.id || '')}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <button type="button" onClick={() => setActiveTab('details')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                  ← Edit Details
                </button>
                <button type="button" onClick={() => setActiveTab('sections')} className="btn-primary" style={{ padding: '10px 24px' }}>
                  Next: Customize & Tone Rewriter →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SECTIONS & AI REWRITER */}
          {activeTab === 'sections' && (
            <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* SECTION A: AI ROLE RECOMMENDATIONS */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '14px',
                  background: 'rgba(0, 242, 254, 0.04)',
                  border: '1px solid rgba(0, 242, 254, 0.2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.2rem', marginBottom: '4px' }}>
                      AI Role Recommendations & Section Optimizer
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      Evaluates your profile against standard hiring expectations for a <strong>{portfolio.role.toUpperCase()}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={handleFetchRecommendations}
                    disabled={isFetchingRecs}
                    className="btn-primary"
                    style={{ padding: '10px 18px', fontSize: '0.82rem' }}
                  >
                    <Wand2 size={15} />
                    <span>{isFetchingRecs ? 'Analyzing...' : 'Analyze My Role'}</span>
                  </button>
                </div>

                {recommendations && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
                        RECOMMENDED SECTION PRIORITY ORDER:
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {recommendations.priorityOrder.map((sec, idx) => (
                          <span
                            key={sec}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)',
                              color: '#fff',
                            }}
                          >
                            {idx + 1}. {sec.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-magenta)', marginBottom: '4px' }}>
                        IMPROVEMENT SUGGESTIONS:
                      </div>
                      <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                        {recommendations.improvementSuggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={handleApplyRecommendations}
                      className="btn-primary"
                      style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8rem' }}
                    >
                      <Check size={14} />
                      <span>Apply AI Section Order & Visibility</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION B: REGENERATE SECTION IN CHOSEN TONE */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.2rem', marginBottom: '6px' }}>
                  Regenerate Section in a Chosen Tone
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px' }}>
                  Rewrite your headline, bio, or target role in a distinct tone without manual editing.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
                      TARGET FIELD
                    </label>
                    <select
                      value={rewriteTarget}
                      onChange={(e) => setRewriteTarget(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#04070d',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    >
                      <option value="tagline">Tagline / Headline</option>
                      <option value="shortBio">Short Bio (Hero Summary)</option>
                      <option value="fullBio">Full Biography (About Section)</option>
                      <option value="targetRole">Target Role Headline</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
                      WRITING TONE
                    </label>
                    <select
                      value={rewriteTone}
                      onChange={(e) => setRewriteTone(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#04070d',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    >
                      <option value="professional">Professional (Executive & Authoritative)</option>
                      <option value="impactful">Impactful (Outcome-Driven & High Benchmark)</option>
                      <option value="concise">Concise (Crisp & Zero Fluff)</option>
                      <option value="technical">Technical (Rigorous Engineering Terminology)</option>
                      <option value="creative">Creative (Evocative & Distinctive)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>
                    OPTIONAL GUIDANCE (e.g., "Emphasize SolidWorks CAD and FEA simulation")
                  </label>
                  <input
                    type="text"
                    placeholder="Custom instruction..."
                    value={rewriteCustomInstruction}
                    onChange={(e) => setRewriteCustomInstruction(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#04070d',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  onClick={handleRewriteSection}
                  disabled={isRewriting}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  <RefreshCw size={14} />
                  <span>{isRewriting ? 'Rewriting with AI...' : 'Rewrite Section'}</span>
                </button>

                {/* Proposed Rewrite Diff */}
                {pendingRewrite && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'rgba(0, 242, 254, 0.08)',
                      border: '1px solid var(--accent-cyan)',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', marginBottom: '8px' }}>
                      Proposed Rewritten {pendingRewrite.section}:
                    </div>
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: '#030508',
                        color: 'var(--accent-cyan)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        marginBottom: '12px',
                      }}
                    >
                      "{pendingRewrite.rewritten}"
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                      {pendingRewrite.explanation}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleAcceptRewrite} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                        <Check size={14} />
                        <span>Accept & Apply to Portfolio</span>
                      </button>
                      <button
                        onClick={() => setPendingRewrite(null)}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION C: REORDER & VISIBILITY TOGGLES */}
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>
                  Manual Section Reordering & Toggles
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(() => {
                    const defaultOrder: Array<keyof PortfolioData['sectionVisibility']> = [
                      'hero',
                      'welcome',
                      'about',
                      'projects',
                      'experience',
                      'services',
                      'publications',
                      'certifications',
                      'contact',
                    ];
                    const activeOrder = (portfolio.sectionOrder as Array<keyof PortfolioData['sectionVisibility']>) || defaultOrder;
                    return activeOrder.map((secKey, idx) => {
                      const visible = portfolio.sectionVisibility[secKey] ?? true;
                      return (
                        <div
                          key={secKey}
                          style={{
                            padding: '12px 18px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', width: '20px' }}>
                              #{idx + 1}
                            </span>
                            <span style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff' }}>
                              {secKey} SECTION
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              disabled={idx === 0}
                              onClick={() => {
                                const newOrder = [...activeOrder];
                                const temp = newOrder[idx - 1];
                                newOrder[idx - 1] = newOrder[idx];
                                newOrder[idx] = temp;
                                const updated = { ...portfolio, sectionOrder: newOrder };
                                setHistory((prev) => [...prev, updated]);
                                setFuture([]);
                                onUpdatePortfolio(updated);
                              }}
                              style={{
                                background: idx === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: idx === 0 ? 'rgba(255, 255, 255, 0.2)' : '#ffffff',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.72rem',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              <ArrowUp size={12} />
                              <span>UP</span>
                            </button>

                            <button
                              disabled={idx === activeOrder.length - 1}
                              onClick={() => {
                                const newOrder = [...activeOrder];
                                const temp = newOrder[idx + 1];
                                newOrder[idx + 1] = newOrder[idx];
                                newOrder[idx] = temp;
                                const updated = { ...portfolio, sectionOrder: newOrder };
                                setHistory((prev) => [...prev, updated]);
                                setFuture([]);
                                onUpdatePortfolio(updated);
                              }}
                              style={{
                                background: idx === activeOrder.length - 1 ? 'transparent' : 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: idx === activeOrder.length - 1 ? 'rgba(255, 255, 255, 0.2)' : '#ffffff',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                cursor: idx === activeOrder.length - 1 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.72rem',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              <ArrowDown size={12} />
                              <span>DOWN</span>
                            </button>

                            <button
                              onClick={() => {
                                const updated = {
                                  ...portfolio,
                                  sectionVisibility: {
                                    ...portfolio.sectionVisibility,
                                    [secKey]: !visible,
                                  },
                                };
                                setHistory((prev) => [...prev, updated]);
                                setFuture([]);
                                onUpdatePortfolio(updated);
                              }}
                              style={{
                                background: visible ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                                border: visible ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                                color: visible ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.3)',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.72rem',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {visible ? <Eye size={12} /> : <EyeOff size={12} />}
                              <span>{visible ? 'VISIBLE' : 'HIDDEN'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONVERSATIONAL ASSISTANT & CO-PILOT */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '840px', margin: '0 auto' }}>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.25rem', marginBottom: '6px' }}>
                  AI Conversational Co-Pilot
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Ask the Co-Pilot to adjust your tone, reorder projects, tweak your visual theme, or rewrite sections.
                </p>
              </div>

              {/* Quick Instruction Pills tailored to discipline */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {[
                  `Make my headline focus on ${activeDiscipline.shortName}`,
                  'Make my summary more punchy and concise',
                  'Prioritize my verified technical projects',
                  'Recommend missing sections for my role',
                  'Switch theme to Obsidian Stealth',
                ].map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendChatMessage(undefined, pill)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '999px',
                      padding: '6px 12px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
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
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '1px solid var(--accent-cyan)',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                      Proposed Changes: {pendingChatProfile.summary}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleAcceptChatProposal}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                      >
                        <Check size={14} />
                        <span>Accept Changes</span>
                      </button>
                      <button
                        onClick={handleDiscardChatProposal}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                    {pendingChatProfile.explanation}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div
                style={{
                  flex: 1,
                  minHeight: '320px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  padding: '16px',
                  background: 'rgba(5, 7, 11, 0.5)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '16px',
                }}
              >
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '78%',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      background: msg.sender === 'user' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: msg.sender === 'user' ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          color: msg.sender === 'user' ? 'var(--accent-cyan)' : 'var(--accent-magenta)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {msg.sender === 'user' ? 'You' : `AI Co-Pilot ${msg.liveAi ? '(OpenAI)' : '(Offline)'}`}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{msg.timestamp}</span>
                    </div>
                    <div>{msg.text}</div>
                  </div>
                ))}
                {isChatting && (
                  <div style={{ alignSelf: 'flex-start', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    AI Co-Pilot is processing instructions...
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Enter instruction (e.g. 'Emphasize SolidWorks CAD' or 'Make bio more executive')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    background: 'rgba(5, 7, 11, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
                <button type="submit" disabled={isChatting} className="btn-primary" style={{ padding: '12px 20px' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: VISUAL THEMES & 3D */}
          {activeTab === 'theme' && (
            <div style={{ maxWidth: '780px', margin: '0 auto' }}>
              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.3rem', marginBottom: '8px' }}>
                  Cinematic Color Palettes
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {(Object.keys(THEME_CONFIGS) as ThemePreset[]).map((thm) => {
                    const cfg = THEME_CONFIGS[thm];
                    const selected = portfolio.theme === thm;
                    return (
                      <div
                        key={thm}
                        onClick={() => {
                          const updated = { ...portfolio, theme: thm };
                          setHistory((prev) => [...prev, updated]);
                          setFuture([]);
                          onUpdatePortfolio(updated);
                        }}
                        style={{
                          padding: '18px',
                          borderRadius: '12px',
                          border: selected ? '2px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: selected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{cfg.name}</span>
                          {selected && <Check size={16} color="var(--accent-cyan)" />}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: cfg.bgPrimary, border: '1px solid #444' }} />
                          <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: cfg.accentCyan }} />
                          <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: cfg.accentMagenta }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3D Mode Selector */}
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.3rem', marginBottom: '8px' }}>
                  Hero 3D Visualization Mode
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { id: 'kinetic_360', label: 'Kinetic 360 Avatar', desc: 'Original reference experience with mouse tracking & dual lighting' },
                    { id: 'hologram_core', label: 'Hologram Core', desc: 'Rotating cybernetic particle simulation and wireframe geometry' },
                    { id: 'cyber_wireframe', label: 'Cyber Grid', desc: 'Minimalist high-contrast tech mesh with pulsing rim shaders' },
                  ].map((mode) => {
                    const selected = portfolio.hero3DMode === mode.id;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => {
                          const updated = { ...portfolio, hero3DMode: mode.id as Hero3DMode };
                          setHistory((prev) => [...prev, updated]);
                          setFuture([]);
                          onUpdatePortfolio(updated);
                        }}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          border: selected ? '2px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: selected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: selected ? 'var(--accent-cyan)' : '#fff', marginBottom: '6px' }}>
                          {mode.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{mode.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DOWNLOAD OR PUBLISH */}
          {activeTab === 'export' && (
            <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'rgba(0, 242, 254, 0.1)',
                  border: '1px solid var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Download size={28} color="var(--accent-cyan)" />
              </div>

              <h4 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: '1.6rem', marginBottom: '8px' }}>
                Download & Publish Your 3D Portfolio
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px', lineHeight: 1.5 }}>
                Export your portfolio as a complete standalone package. Double-click <code>index.html</code> to run offline, or deploy directly to GitHub Pages or any static host with zero setup.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '440px', margin: '0 auto' }}>
                <button
                  onClick={handleExportZip}
                  disabled={exportingZip}
                  className="btn-primary"
                  style={{ padding: '16px', justifyContent: 'center', fontSize: '1rem' }}
                >
                  <Download size={18} />
                  <span>{exportingZip ? 'PACKAGING STANDALONE ZIP...' : 'DOWNLOAD STANDALONE WEBSITE (ZIP)'}</span>
                </button>

                <button
                  onClick={handleCopyShareableLink}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Share2 size={16} />
                  <span>{copiedLink ? 'LINK COPIED TO CLIPBOARD!' : 'COPY PORTFOLIO LINK'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
