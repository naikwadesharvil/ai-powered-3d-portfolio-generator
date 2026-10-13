import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Download,
  Check,
  RotateCcw,
  RotateCw,
  Laptop,
  Tablet,
  Smartphone,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Plus,
  Trash2,
  Lightbulb,
  Briefcase,
  GraduationCap,
  Wrench,
  Compass,
  Award,
  FileText,
  Copy,
  Globe,
  ExternalLink,
  Loader2,
  Key,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  publishPortfolio,
  unpublishPortfolio,
  getStoredOwnerToken,
  storeOwnerToken,
  getLastPublishedSlug,
} from '../services/portfolioApi';
import { compressPortfolioImages } from '../utils/imageCompressor';
import type {
  PortfolioData,
  UserRole,
  EducationBranch,
  TechSkill,
  ProjectItem,
  EducationItem,
  ExperienceItem,
} from '../types/portfolio';
import type { Persona } from '../types/portfolioSchema';
import { AiApiClient, type ServerHealth } from '../services/aiApiClient.ts';
import { AiEngine } from '../services/aiEngine.ts';
import {
  getDisciplineConfig,
  type DisciplineConfig,
} from '../config/disciplines.ts';
import { usePortfolioStore } from '../store/portfolioStore';
import {
  generateResumeHtml,
  detectResumePlaceholders,
  type ResumeTemplateId,
} from '../services/resumeGenerator';

import SplitCustomizer from './SplitCustomizer';

export type StepperStep = 'details' | 'generate' | 'customize' | 'download_publish';

interface CreatorStudioProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: PortfolioData;
  onUpdatePortfolio: (updated: PortfolioData) => void;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onChangePreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onOpenResume?: () => void;
}

const CreatorStudio: React.FC<CreatorStudioProps> = ({
  isOpen,
  onClose,
  portfolio,
  onUpdatePortfolio,
  previewMode,
  onChangePreviewMode,
  onOpenResume,
}) => {
  // 4-Step Stepper Flow: Details -> Generate -> Customize -> Download/Publish
  const [currentStep, setCurrentStep] = useState<StepperStep>('details');
  const [history, setHistory] = useState<PortfolioData[]>([portfolio]);
  const [future, setFuture] = useState<PortfolioData[]>([]);

  // Synchronize Zustand portfolioStore when CreatorStudio opens with an external profile
  useEffect(() => {
    if (isOpen && portfolio) {
      const current = usePortfolioStore.getState().portfolio;
      if (!current || current.name !== portfolio.name || current.role !== portfolio.role) {
        usePortfolioStore.getState().setPortfolio(portfolio, true);
      }
    }
  }, [isOpen, portfolio]);

  // Step 4 Resume Template Picker, Live Preview & Page Count State
  const [step4ResumeTemplate, setStep4ResumeTemplate] = useState<ResumeTemplateId>('modern');
  const [step4ExportingPdf, setStep4ExportingPdf] = useState(false);
  const [step4ExportingDocx, setStep4ExportingDocx] = useState(false);
  const activeThemeTokens = usePortfolioStore((s) => s.themeTokens);
  const currentPortfolio = usePortfolioStore((s) => s.portfolio) || portfolio;

  const step4Placeholders = React.useMemo(
    () => detectResumePlaceholders(currentPortfolio),
    [currentPortfolio]
  );

  const step4ResumeHtml = React.useMemo(
    () =>
      generateResumeHtml(currentPortfolio, {
        template: step4ResumeTemplate,
        accentColor: activeThemeTokens?.accentPrimary || '#00f2fe',
      }),
    [currentPortfolio, step4ResumeTemplate, activeThemeTokens?.accentPrimary]
  );

  const step4EstimatedPages = React.useMemo(() => {
    let units = 120;
    if (currentPortfolio.fullBio || currentPortfolio.shortBio) units += 100;
    if (currentPortfolio.skills?.length) units += currentPortfolio.skills.length * 15;
    const expCount = (currentPortfolio.experiences || (currentPortfolio as any).experience || []).length;
    if (expCount) units += expCount * 140;
    const eduCount = (currentPortfolio.education || []).length;
    if (eduCount) units += eduCount * 60;
    const projCount = (currentPortfolio.projects || []).length;
    if (projCount) units += projCount * 120;
    if (currentPortfolio.certifications?.length) units += currentPortfolio.certifications.length * 30;
    if (currentPortfolio.publications?.length) units += currentPortfolio.publications.length * 35;
    if (step4ResumeTemplate === 'compact') return Math.max(1, Math.ceil(units / 900));
    return Math.max(1, Math.ceil(units / 650));
  }, [currentPortfolio, step4ResumeTemplate]);

  // Server & Model Status
  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);

  // Discipline & Free-Text State
  const [selectedBranch, setSelectedBranch] = useState<string>(portfolio.branch || 'cs_it');
  const [customBranchName, setCustomBranchName] = useState<string>(portfolio.branchName || '');

  // Computed Discipline Config from config/disciplines.ts
  const activeDiscipline: DisciplineConfig = getDisciplineConfig(selectedBranch, customBranchName);

  // Personal Info State
  const [autopilotName, setAutopilotName] = useState(portfolio.name);
  const [autopilotInterests, setAutopilotInterests] = useState(portfolio.interests.join(', '));
  const [autopilotRole, setAutopilotRole] = useState<UserRole>(portfolio.role);
  const [userLocation, setUserLocation] = useState(portfolio.location || '');
  const [userEmail, setUserEmail] = useState(portfolio.email || '');

  // Sub-tabs for Step 1 (Details)
  const [detailsSubTab, setDetailsSubTab] = useState<'persona_discipline' | 'skills' | 'projects' | 'education' | 'experience'>('persona_discipline');

  // Interactive Skills State
  const [skillsList, setSkillsList] = useState<TechSkill[]>(portfolio.skills || []);
  const [newSkillName, setNewSkillName] = useState('');

  // Interactive Projects State
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

  // Generation Status & Progress State
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationMeta, setGenerationMeta] = useState<{
    liveAi: boolean;
    source: 'ai' | 'fallback';
    model: string;
    message: string;
    suggestions?: string[];
  } | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Public ZIP State
  const [exportingZip, setExportingZip] = useState(false);

  // Live Publishing State (Phase 6 & 7)
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published' | 'error'>('idle');
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [imageWarnings, setImageWarnings] = useState<string[]>([]);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [copiedPublishLink, setCopiedPublishLink] = useState(false);
  const [newlyIssuedToken, setNewlyIssuedToken] = useState<string | null>(null);
  const [copiedOwnerToken, setCopiedOwnerToken] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [tokenFeedback, setTokenFeedback] = useState<string | null>(null);

  // Initialize published slug & owner token from localStorage on open
  useEffect(() => {
    if (isOpen) {
      const savedSlug = getLastPublishedSlug();
      if (savedSlug && getStoredOwnerToken(savedSlug)) {
        setPublishedSlug(savedSlug);
        setPublishedUrl(`${window.location.origin}/p/${savedSlug}`);
        setPublishStatus('published');
      }
    }
  }, [isOpen]);

  const handlePublish = async () => {
    setPublishStatus('publishing');
    setPublishError(null);
    setImageWarnings([]);

    try {
      // 1. Client-side base64 image downscale & compress pass (<200KB)
      const { compressedPortfolio, warnings } = await compressPortfolioImages(currentPortfolio);
      if (warnings.length > 0) {
        setImageWarnings(warnings);
      }

      // 2. Transmit to server with owner token & existing slug for in-place re-publishing
      const tokenToUse = publishedSlug ? getStoredOwnerToken(publishedSlug) : null;
      const res = await publishPortfolio(compressedPortfolio, tokenToUse, publishedSlug);

      if (res.success && res.slug) {
        setPublishStatus('published');
        setPublishedSlug(res.slug);
        const fullUrl = `${window.location.origin}/p/${res.slug}`;
        setPublishedUrl(fullUrl);
        if (res.ownerToken) {
          setNewlyIssuedToken(res.ownerToken);
        }
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore canvas-confetti issues in headless test environments
        }
      } else {
        setPublishStatus('error');
        setPublishError(res.message || res.error || 'Failed to publish portfolio.');
      }
    } catch (err: any) {
      setPublishStatus('error');
      setPublishError(err?.message || 'Error communicating with publishing service.');
    }
  };

  const handleSaveManualToken = () => {
    const trimmed = manualTokenInput.trim();
    if (!trimmed) {
      setTokenFeedback('Please enter a valid owner token.');
      return;
    }
    const slug = publishedSlug || getLastPublishedSlug() || 'current-portfolio';
    storeOwnerToken(slug, trimmed);
    if (!publishedSlug) {
      setPublishedSlug(slug);
      setPublishedUrl(`${window.location.origin}/p/${slug}`);
    }
    setTokenFeedback('✓ Owner token saved for this device/session!');
    setManualTokenInput('');
    setTimeout(() => {
      setTokenFeedback(null);
      setShowTokenInput(false);
    }, 2500);
  };

  const handleUnpublish = async () => {
    if (!publishedSlug) return;
    if (!window.confirm('Are you sure you want to unpublish your live portfolio? The public link will become inactive.')) return;
    setIsUnpublishing(true);
    try {
      const tokenToUse = getStoredOwnerToken(publishedSlug);
      const res = await unpublishPortfolio(publishedSlug, tokenToUse);
      if (res.success) {
        setPublishStatus('idle');
        setPublishedSlug(null);
        setPublishedUrl(null);
        setImageWarnings([]);
      } else {
        alert(res.error || 'Failed to unpublish');
      }
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleCopyPublishedLink = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopiedPublishLink(true);
      setTimeout(() => setCopiedPublishLink(false), 2500);
    }
  };

  // Check backend server health on open
  useEffect(() => {
    if (isOpen) {
      AiApiClient.checkHealth().then((health) => {
        setServerHealth(health);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Persona Selection (Changes Section Emphasis and Visibility)
  const handleSelectPersona = (newPersona: Persona) => {
    setAutopilotRole(newPersona as UserRole);
    const emphasis = activeDiscipline.personaSectionEmphasis[newPersona] || [
      'hero', 'welcome', 'about', 'education', 'projects', 'skills', 'contact'
    ];

    const updatedVisibility = { ...portfolio.sectionVisibility };
    if (newPersona === 'student') {
      // Students lead with education and projects
      updatedVisibility.education = true;
      updatedVisibility.projects = true;
      updatedVisibility.skills = true;
      updatedVisibility.experience = false;
      updatedVisibility.services = false;
      updatedVisibility.testimonials = false;
      updatedVisibility.certifications = true;
      updatedVisibility.publications = true;
    } else if (newPersona === 'job_seeker') {
      // Job seekers lead with skills, projects, and verified experience
      updatedVisibility.skills = true;
      updatedVisibility.projects = true;
      updatedVisibility.experience = true;
      updatedVisibility.education = true;
      updatedVisibility.services = false;
      updatedVisibility.testimonials = false;
    } else if (newPersona === 'professional') {
      // Working professionals lead with experience, architecture, and track record
      updatedVisibility.experience = true;
      updatedVisibility.projects = true;
      updatedVisibility.skills = true;
      updatedVisibility.education = true;
      updatedVisibility.publications = true;
      updatedVisibility.certifications = true;
      updatedVisibility.services = false;
      updatedVisibility.testimonials = false;
    } else if (newPersona === 'freelancer') {
      // Freelancers lead with services, testimonials, and deliverables
      updatedVisibility.services = true;
      updatedVisibility.testimonials = true;
      updatedVisibility.projects = true;
      updatedVisibility.skills = true;
      updatedVisibility.experience = false;
      updatedVisibility.education = false;
    }

    const updated: PortfolioData = {
      ...portfolio,
      persona: newPersona,
      role: newPersona as UserRole,
      sectionOrder: emphasis,
      sectionVisibility: updatedVisibility,
    };
    setHistory((prev) => [...prev, updated]);
    setFuture([]);
    onUpdatePortfolio(updated);
  };

  // Handle Discipline Selection
  const handleSelectDiscipline = (discId: string) => {
    setSelectedBranch(discId);
    const cfg = getDisciplineConfig(discId, discId === 'other' ? customBranchName : undefined);
    const updated: PortfolioData = {
      ...portfolio,
      branch: discId as any,
      discipline: discId,
      disciplineName: discId === 'other' ? (customBranchName || 'Specialized Engineering') : cfg.shortName,
    };
    setHistory((prev) => [...prev, updated]);
    setFuture([]);
    onUpdatePortfolio(updated);
  };

  // Handle Free-Text Custom Discipline
  const handleCustomBranchChange = (text: string) => {
    setCustomBranchName(text);
    const updated: PortfolioData = {
      ...portfolio,
      branch: 'other' as any,
      discipline: 'other',
      disciplineName: text || 'Specialized Engineering',
    };
    onUpdatePortfolio(updated);
  };

  // Quick-Add Domain Skill
  const handleToggleDomainSkill = (skillName: string, category: string) => {
    const existingIndex = skillsList.findIndex((s) => s.name.toLowerCase() === skillName.toLowerCase());
    if (existingIndex >= 0) {
      const updated = skillsList.filter((_, i) => i !== existingIndex);
      setSkillsList(updated);
      onUpdatePortfolio({ ...portfolio, skills: updated });
    } else {
      const updated = [...skillsList, { name: skillName, category, level: 'advanced' }];
      setSkillsList(updated);
      onUpdatePortfolio({ ...portfolio, skills: updated });
    }
  };

  // Run AI Generation (Autopilot)
  const handleRunAutopilot = async (e?: React.FormEvent, forceOffline: boolean = false) => {
    if (e) e.preventDefault();

    if (forceOffline) {
      setIsGenerating(true);
      setGenerationError(null);
      const fallbackPortfolio = AiEngine.generatePortfolioFromAutopilot({
        name: autopilotName || 'Alex Chen',
        branch: selectedBranch as EducationBranch,
        customBranchName: selectedBranch === 'other' ? customBranchName : undefined,
        interests: autopilotInterests || activeDiscipline.defaultInterests.join(', '),
        role: autopilotRole,
        skills: skillsList,
        projects: projectsList,
        education: educationList,
        experiences: experienceList,
      });
      setHistory((prev) => [...prev, fallbackPortfolio]);
      setFuture([]);
      onUpdatePortfolio(fallbackPortfolio);
      setSkillsList(fallbackPortfolio.skills);
      setProjectsList(fallbackPortfolio.projects);
      setEducationList(fallbackPortfolio.education);
      setExperienceList(fallbackPortfolio.experiences);
      setGenerationMeta({
        liveAi: false,
        source: 'fallback',
        model: 'offline_heuristic_v1',
        message: 'Generated with the offline engine; connect AI for richer results',
        suggestions: ['Connect OpenAI backend for dynamic model synthesis.'],
      });
      setGenerationError(null);
      setIsGenerating(false);
      return;
    }

    // Client-side form validation
    const errors: Record<string, string> = {};
    if (!autopilotName.trim()) {
      errors.name = 'Full name is required.';
    } else if (autopilotName.trim().length > 100) {
      errors.name = 'Name must not exceed 100 characters.';
    }

    if (userEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail.trim())) {
        errors.email = 'Please enter a valid email address format.';
      } else if (userEmail.trim().length > 150) {
        errors.email = 'Email must not exceed 150 characters.';
      }
    }

    if (selectedBranch === 'other' && !customBranchName.trim()) {
      errors.customBranchName = 'Custom discipline name is required when selecting Other.';
    } else if (selectedBranch === 'other' && customBranchName.trim().length > 120) {
      errors.customBranchName = 'Discipline name must not exceed 120 characters.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setCurrentStep('details');
      setDetailsSubTab('persona_discipline');
      setGenerationError('Please fix the validation errors before generating.');
      return;
    }

    setFormErrors({});
    setIsGenerating(true);
    setGenerationError(null);
    setStreamProgress(15);
    setGenerationStep(`Analyzing ${activeDiscipline.label} engineering taxonomy...`);

    const timer1 = setTimeout(() => {
      setStreamProgress(45);
      setGenerationStep(`Formulating persona structure for ${autopilotRole.toUpperCase()}...`);
    }, 400);

    const timer2 = setTimeout(() => {
      setStreamProgress(75);
      setGenerationStep(`Structuring verified project metrics & Bento telemetry...`);
    }, 800);

    try {
      const result = await AiApiClient.generatePortfolio({
        name: autopilotName || 'Alex Chen',
        branch: selectedBranch as EducationBranch,
        customBranchName: selectedBranch === 'other' ? customBranchName : undefined,
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

      clearTimeout(timer1);
      clearTimeout(timer2);
      setStreamProgress(100);
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
        source: result.source || (result.liveAi ? 'ai' : 'fallback'),
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
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (err?.fieldErrors) {
        const mappedErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(err.fieldErrors)) {
          if (Array.isArray(msgs) && msgs.length > 0) {
            mappedErrors[key] = (msgs as string[])[0];
          }
        }
        setFormErrors(mappedErrors);
        setCurrentStep('details');
        setDetailsSubTab('persona_discipline');
        setGenerationError('Server rejected inputs due to validation errors. Please review highlighted fields.');
      } else {
        setGenerationError(err?.message || 'Failed to complete generation. Please retry.');
      }
    } finally {
      setIsGenerating(false);
    }
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

  // Standalone Complete Website ZIP Exporter (Offline Static HTML Package)
  const handleExportZip = async () => {
    setExportingZip(true);
    try {
      const { downloadStaticHtmlZip } = await import('../services/staticExport');
      await downloadStaticHtmlZip(currentPortfolio);
    } catch (err: any) {
      alert(`Export failed: ${err?.message || 'Error creating ZIP file'}`);
    } finally {
      setExportingZip(false);
    }
  };

  // Persona Options Definition
  const PERSONA_OPTIONS: Array<{
    id: Persona;
    label: string;
    badge: string;
    desc: string;
    emphasis: string;
  }> = [
    {
      id: 'student',
      label: 'Student',
      badge: 'Academic & Capstones',
      desc: 'Focuses on degree coursework, academic honors, verified capstone projects, and lab prototypes.',
      emphasis: 'Leads with: Education & Selected Projects',
    },
    {
      id: 'job_seeker',
      label: 'Job Seeker',
      badge: 'ATS & Quantitative Proof',
      desc: 'Optimized for recruiter scanning, immediate core stack competencies, and impact metrics.',
      emphasis: 'Leads with: Skills, Projects & Experience',
    },
    {
      id: 'professional',
      label: 'Professional',
      badge: 'Enterprise Impact & Scale',
      desc: 'Emphasizes industry tenure, systems architecture, team leadership, and standards compliance.',
      emphasis: 'Leads with: Experience & Architecture',
    },
    {
      id: 'freelancer',
      label: 'Freelancer',
      badge: 'Client Deliverables & Scope',
      desc: 'Showcases end-to-end client deliverables, consulting packages, testimonials, and rapid turnaround.',
      emphasis: 'Leads with: Services & Testimonials',
    },
  ];

  // Discipline Options Definition (5 Core + Other Free Text)
  const DISCIPLINE_CARDS: Array<{ id: string; label: string; desc: string }> = [
    { id: 'mechanical', label: 'Mechanical', desc: 'Machine design, FEA simulation, CAD, thermal & GD&T' },
    { id: 'civil', label: 'Civil', desc: 'Structural analysis, seismic codes, BIM, geotechnical' },
    { id: 'electrical', label: 'Electrical', desc: 'Circuits, PCB layout, power systems, motor drives' },
    { id: 'mechatronics', label: 'Mechatronics', desc: 'Robotics, ROS2, embedded firmware, sensor fusion, PLC' },
    { id: 'cs_it', label: 'Computer Science', desc: 'Algorithms, neural networks, distributed systems, full-stack' },
    { id: 'other', label: 'Other (Free text)', desc: 'Custom branch, specialized trades, or research fields' },
  ];

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
        id="creator-studio-modal"
        data-testid="creator-studio-modal"
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: currentStep === 'customize' ? '1420px' : '1160px',
          height: '94vh',
          maxHeight: '940px',
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
                  AI PORTFOLIO STUDIO // GENERATOR
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
                DISCIPLINE: {activeDiscipline.label.toUpperCase()} // PERSONA: {autopilotRole.toUpperCase()}
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
                color: history.length > 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.55)',
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
                color: future.length > 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.55)',
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

        {/* STEPPER BAR: 1. Details -> 2. Generate -> 3. Customize -> 4. Download/Publish */}
        <div
          className="stepper-container"
          role="tablist"
          aria-label="Portfolio creation process steps"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 28px',
            background: 'rgba(5, 7, 12, 0.5)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {[
            { id: 'details' as const, stepNumber: 1, label: 'Details', desc: 'Persona, Branch & Inputs' },
            { id: 'generate' as const, stepNumber: 2, label: 'Generate', desc: 'AI Synthesis & Audit' },
            { id: 'customize' as const, stepNumber: 3, label: 'Customize', desc: 'Sections, Tones & Themes' },
            { id: 'download_publish' as const, stepNumber: 4, label: 'Download / Publish', desc: 'ZIP, ATS Resume & Share' },
          ].map((step, idx) => {
            const isCurrent = currentStep === step.id;
            const isCompleted =
              (step.id === 'details' && currentStep !== 'details') ||
              (step.id === 'generate' && (currentStep === 'customize' || currentStep === 'download_publish')) ||
              (step.id === 'customize' && currentStep === 'download_publish');

            const circleClass = isCurrent
              ? 'stepper-circle active'
              : isCompleted
              ? 'stepper-circle completed'
              : 'stepper-circle upcoming';

            return (
              <React.Fragment key={step.id}>
                <button
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`Step ${step.stepNumber}: ${step.label} (${step.desc})`}
                  onClick={() => setCurrentStep(step.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    className={circleClass}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {isCompleted ? <Check size={16} /> : step.stepNumber}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: isCurrent ? 'var(--accent-cyan)' : isCompleted ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {step.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {step.desc}
                    </div>
                  </div>
                </button>
                {idx < 3 && (
                  <div
                    style={{
                      flex: 1,
                      height: '2px',
                      background: isCompleted ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)',
                      margin: '0 8px',
                      transition: 'background 0.3s ease',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: currentStep === 'customize' ? '16px 20px' : '32px' }}>
          {/* ========================================================================= */}
          {/* STEP 1: DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 'details' && (
            <div style={{ maxWidth: '880px', margin: '0 auto' }}>
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
                  Select your Persona and Engineering Discipline. Enter your verified qualifications, skills, and projects without code.
                </p>
              </div>

              {/* Sub-Tabs for Details */}
              <div
                role="tablist"
                aria-label="Creator details categories"
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingBottom: '10px',
                }}
              >
                {[
                  { id: 'persona_discipline' as const, label: 'Persona & Discipline', icon: Compass },
                  { id: 'skills' as const, label: `Skills (${skillsList.length})`, icon: Wrench },
                  { id: 'projects' as const, label: `Projects (${projectsList.length})`, icon: Briefcase },
                  { id: 'education' as const, label: `Education (${educationList.length})`, icon: GraduationCap },
                  { id: 'experience' as const, label: `Experience (${experienceList.length})`, icon: Award },
                ].map((st) => {
                  const Icon = st.icon;
                  const active = detailsSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      role="tab"
                      aria-selected={active}
                      aria-label={st.label}
                      onClick={() => setDetailsSubTab(st.id)}
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

              {/* SUB-SECTION 1: PERSONA & DISCIPLINE */}
              {detailsSubTab === 'persona_discipline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* 1. Persona Selection */}
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
                      1. SELECT YOUR PERSONA (ADAPTS SECTION EMPHASIS & VISIBILITY)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {PERSONA_OPTIONS.map((p) => {
                        const selected = autopilotRole === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPersona(p.id)}
                            style={{
                              padding: '16px',
                              borderRadius: '10px',
                              border: selected ? '2px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: selected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, color: selected ? 'var(--accent-cyan)' : '#fff', fontSize: '0.95rem' }}>
                                {p.label}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontFamily: 'var(--font-mono)',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  background: selected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
                                  color: selected ? '#000' : 'rgba(255, 255, 255, 0.7)',
                                  fontWeight: 600,
                                }}
                              >
                                {p.badge}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              {p.desc}
                            </p>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                              {p.emphasis}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Discipline Selection Grid */}
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
                      2. SELECT ENGINEERING DISCIPLINE
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '10px',
                      }}
                    >
                      {DISCIPLINE_CARDS.map((disc) => {
                        const selected = selectedBranch === disc.id;
                        return (
                          <div
                            key={disc.id}
                            onClick={() => handleSelectDiscipline(disc.id)}
                            style={{
                              padding: '14px',
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
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: selected ? 'var(--accent-cyan)' : '#ffffff',
                                marginBottom: '4px',
                              }}
                            >
                              {disc.label}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              {disc.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Free-Text Custom Discipline Input */}
                  {selectedBranch === 'other' && (
                    <div
                      style={{
                        padding: '18px',
                        borderRadius: '10px',
                        background: 'rgba(0, 242, 254, 0.06)',
                        border: '1px solid var(--accent-cyan)',
                      }}
                    >
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          color: 'var(--accent-cyan)',
                          marginBottom: '8px',
                        }}
                      >
                        SPECIFY CUSTOM DISCIPLINE (DYNAMIC DOMAIN PROMPT SYNTHESIS)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Biomedical Engineering, Aerospace Propulsion, Chemical Systems..."
                        value={customBranchName}
                        onChange={(e) => {
                          handleCustomBranchChange(e.target.value);
                          if (formErrors.customBranchName) setFormErrors((prev) => ({ ...prev, customBranchName: '' }));
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(5, 7, 11, 0.8)',
                          border: formErrors.customBranchName ? '1px solid #ff0055' : '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.95rem',
                          outline: 'none',
                        }}
                      />
                      {formErrors.customBranchName && (
                        <div style={{ color: '#ff4466', fontSize: '0.74rem', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                          {formErrors.customBranchName}
                        </div>
                      )}
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '8px' }}>
                        Custom disciplines dynamically generate technical terminology, skill categories, and project archetypes without requiring code changes.
                      </p>
                    </div>
                  )}

                  {/* Personal Contact Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        value={autopilotName}
                        onChange={(e) => {
                          setAutopilotName(e.target.value);
                          if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        placeholder="e.g. Alex Chen"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(5, 7, 11, 0.8)',
                          border: formErrors.name ? '1px solid #ff0055' : '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      {formErrors.name && (
                        <div style={{ color: '#ff4466', fontSize: '0.74rem', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                          {formErrors.name}
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => {
                          setUserEmail(e.target.value);
                          if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        placeholder="e.g. alex.chen@engineering.io"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(5, 7, 11, 0.8)',
                          border: formErrors.email ? '1px solid #ff0055' : '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      {formErrors.email && (
                        <div style={{ color: '#ff4466', fontSize: '0.74rem', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                          {formErrors.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                        LOCATION
                      </label>
                      <input
                        type="text"
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        placeholder="e.g. Pune, India / Remote"
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

                  {/* Areas of Interest */}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                      AREAS OF INTEREST (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={autopilotInterests}
                      onChange={(e) => setAutopilotInterests(e.target.value)}
                      placeholder="e.g. Finite Element Analysis, CAD Design, Robotic Kinematics..."
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
                              setAutopilotInterests((prev) => (prev ? `${prev}, ${interest}` : interest));
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

                  {/* Bottom Navigation for Step 1 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
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

              {/* SUB-SECTION 2: SKILLS MANAGER */}
              {detailsSubTab === 'skills' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.1rem' }}>
                        Verified Skills ({skillsList.length})
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Click a skill badge to remove it, or use the quick-add categories below.
                      </p>
                    </div>
                  </div>

                  {/* Empty State for Skills */}
                  {skillsList.length === 0 && (
                    <div className="empty-state-card">
                      <Wrench size={32} color="var(--accent-cyan)" />
                      <h5 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>No Verified Skills Added Yet</h5>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '420px', margin: 0 }}>
                        Click any of the suggested {activeDiscipline.label} competencies below to add with one click, or enter custom skills.
                      </p>
                    </div>
                  )}

                  {/* Current Skills List */}
                  {skillsList.length > 0 && (
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
                  )}

                  {/* Add Custom Skill Input */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Type a custom skill (e.g. SolidWorks, ANSYS, ROS2, Docker)..."
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSkillName.trim()) {
                          e.preventDefault();
                          setSkillsList([...skillsList, { name: newSkillName.trim(), category: 'Core Competency', level: 'advanced' }]);
                          setNewSkillName('');
                        }
                      }}
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
                          setSkillsList([...skillsList, { name: newSkillName.trim(), category: 'Core Competency', level: 'advanced' }]);
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

                  {/* Quick Skill Suggestions from config/disciplines.ts */}
                  <div style={{ padding: '18px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <Lightbulb size={16} color="var(--accent-cyan)" />
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                        Industry Competencies for {activeDiscipline.label}:
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {activeDiscipline.skillCategories.map((cat) => (
                        <div key={cat.name}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
                            {cat.name.toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {cat.skills.map((skillName) => {
                              const alreadyAdded = skillsList.some((s) => s.name.toLowerCase() === skillName.toLowerCase());
                              return (
                                <button
                                  key={skillName}
                                  type="button"
                                  onClick={() => handleToggleDomainSkill(skillName, cat.name)}
                                  style={{
                                    background: alreadyAdded ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    border: alreadyAdded ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.12)',
                                    color: alreadyAdded ? 'var(--accent-cyan)' : '#ffffff',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '0.75rem',
                                    fontFamily: 'var(--font-mono)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  {alreadyAdded ? <Check size={11} /> : <Plus size={11} />}
                                  <span>{skillName}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
                    <button type="button" onClick={() => setDetailsSubTab('persona_discipline')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button type="button" onClick={() => setDetailsSubTab('projects')} className="btn-primary" style={{ padding: '10px 22px' }}>
                      Next: Manage Projects →
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 3: PROJECTS MANAGER */}
              {detailsSubTab === 'projects' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.1rem' }}>
                      Verified Projects & Capstones ({projectsList.length})
                    </h4>
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

                  {/* Empty State for Projects */}
                  {projectsList.length === 0 && !isAddingProject && (
                    <div className="empty-state-card">
                      <Briefcase size={32} color="var(--accent-cyan)" />
                      <h5 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>No Verified Projects Listed</h5>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '440px', margin: 0 }}>
                        Add your capstone, hardware prototype, software architecture, or client deliverables.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAddingProject(true)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      >
                        <Plus size={14} />
                        <span>Add First Project</span>
                      </button>
                    </div>
                  )}

                  {/* Add Project Form */}
                  {isAddingProject && (
                    <div style={{ padding: '18px', borderRadius: '10px', background: '#05070b', border: '1px solid var(--accent-cyan)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Project Title (e.g. Planetary Gearbox with FEA Stress Validation)..."
                        value={newProjTitle}
                        onChange={(e) => setNewProjTitle(e.target.value)}
                        style={{ padding: '10px 14px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                      />
                      <textarea
                        rows={3}
                        placeholder="Project Description & Engineering Actions..."
                        value={newProjDesc}
                        onChange={(e) => setNewProjDesc(e.target.value)}
                        style={{ padding: '10px 14px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Tools & Frameworks (e.g. SolidWorks, ANSYS, GD&T)..."
                          value={newProjTags}
                          onChange={(e) => setNewProjTags(e.target.value)}
                          style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                        />
                        <input
                          type="text"
                          placeholder={activeDiscipline.metricsPlaceholder || 'Quantifiable Metric (e.g. FOS > 2.2)...'}
                          value={newProjMetrics}
                          onChange={(e) => setNewProjMetrics(e.target.value)}
                          style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (newProjTitle.trim()) {
                            setProjectsList([...projectsList, {
                              id: `proj-${Date.now()}`,
                              title: newProjTitle.trim(),
                              description: newProjDesc.trim(),
                              tools: newProjTags.split(',').map((t) => t.trim()).filter(Boolean),
                              tags: newProjTags.split(',').map((t) => t.trim()).filter(Boolean),
                              metrics: newProjMetrics.trim(),
                              role: 'Lead Engineer',
                              isAiIdea: false,
                            }]);
                            setNewProjTitle('');
                            setNewProjDesc('');
                            setNewProjTags('');
                            setNewProjMetrics('');
                            setIsAddingProject(false);
                          }
                        }}
                        className="btn-primary"
                        style={{ alignSelf: 'flex-start', padding: '8px 16px', marginTop: '6px' }}
                      >
                        Save Project
                      </button>
                    </div>
                  )}

                  {/* Projects List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {projectsList.map((proj, idx) => (
                      <div
                        key={proj.id}
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
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{proj.title}</span>
                            {proj.metrics && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                                [{proj.metrics}]
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {proj.description?.slice(0, 110)}...
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProjectsList(projectsList.filter((_, i) => i !== idx))}
                          style={{ background: 'transparent', border: 'none', color: '#ff4466', cursor: 'pointer', marginLeft: '12px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Navigation */}
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

              {/* SUB-SECTION 4: EDUCATION MANAGER */}
              {detailsSubTab === 'education' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.1rem' }}>
                      Academic Background ({educationList.length})
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

                  {/* Empty State for Education */}
                  {educationList.length === 0 && !isAddingEdu && (
                    <div className="empty-state-card">
                      <GraduationCap size={32} color="var(--accent-cyan)" />
                      <h5 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>No Education Records Listed</h5>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '440px', margin: 0 }}>
                        Enter your degree, college/university, graduation year, and GPA or academic honors.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAddingEdu(true)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      >
                        <Plus size={14} />
                        <span>Add Education</span>
                      </button>
                    </div>
                  )}

                  {/* Add Education Form */}
                  {isAddingEdu && (
                    <div style={{ padding: '18px', borderRadius: '10px', background: '#05070b', border: '1px solid var(--accent-cyan)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Institution / University..."
                          value={newEduInst}
                          onChange={(e) => setNewEduInst(e.target.value)}
                          style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                        />
                        <input
                          type="text"
                          placeholder="Degree (e.g. B.Tech Mechanical, B.S. Civil)..."
                          value={newEduDegree}
                          onChange={(e) => setNewEduDegree(e.target.value)}
                          style={{ padding: '8px 12px', background: '#020408', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
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
                          placeholder="Score / CGPA (e.g. 8.4 / 10)..."
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

                  {/* Education List */}
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

                  {/* Navigation */}
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

              {/* SUB-SECTION 5: EXPERIENCE MANAGER */}
              {detailsSubTab === 'experience' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.1rem' }}>
                      Experience & Internships ({experienceList.length})
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

                  {/* Empty State for Experience */}
                  {experienceList.length === 0 && !isAddingExp && (
                    <div className="empty-state-card">
                      <Award size={32} color="var(--accent-cyan)" />
                      <h5 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>No Work Experience Listed</h5>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '460px', margin: 0 }}>
                        {autopilotRole === 'student'
                          ? 'As a Student persona, your 3D portfolio leads with Education and Projects. If you have internships or research positions, add them below.'
                          : 'Add your employment history, consulting engagements, or industry internships.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAddingExp(true)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      >
                        <Plus size={14} />
                        <span>Add Experience</span>
                      </button>
                    </div>
                  )}

                  {/* Add Experience Form */}
                  {isAddingExp && (
                    <div style={{ padding: '18px', borderRadius: '10px', background: '#05070b', border: '1px solid var(--accent-cyan)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Company / Organization..."
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
                              points: newExpPoints.split('\n').map((p) => p.trim()).filter(Boolean),
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

                  {/* Experience List */}
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

                  {/* Proceed to Step 2 Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                    <button type="button" onClick={() => setDetailsSubTab('education')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('generate')}
                      className="btn-primary"
                      style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                    >
                      <span>Proceed to Step 2: Generate</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: GENERATE (AI SYNTHESIS & AUDIT) */}
          {/* ========================================================================= */}
          {currentStep === 'generate' && (
            <div style={{ maxWidth: '780px', margin: '0 auto' }}>
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
                      : 'OFFLINE HEURISTIC SYNTHESIS // ZERO HALLUCINATION'}
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
                  Active Discipline: <strong style={{ color: 'var(--accent-cyan)' }}>{activeDiscipline.label}</strong> • Persona: <strong style={{ color: 'var(--accent-cyan)' }}>{autopilotRole.toUpperCase()}</strong>
                </p>
              </div>

              {/* Error State Banner */}
              {generationError && (
                <div className="error-banner" style={{ marginBottom: '20px' }}>
                  <AlertCircle size={20} color="#ff0055" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>Generation Failure</div>
                    <div>{generationError}</div>
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#ffcc00', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} />
                      <span>Generated with the offline engine; connect AI for richer results</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleRunAutopilot()}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunAutopilot(undefined, true)}
                      style={{
                        background: 'rgba(255, 170, 0, 0.15)',
                        border: '1px solid rgba(255, 170, 0, 0.4)',
                        color: '#ffcc00',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Use Offline Engine
                    </button>
                  </div>
                </div>
              )}

              {/* Streaming Progress & Skeleton Shimmer Loader (When Generating) */}
              {isGenerating && (
                <div style={{ padding: '32px 20px', textAlign: 'center', marginBottom: '28px' }}>
                  <div className="stepper-circle active" style={{ width: '48px', height: '48px', margin: '0 auto 16px' }}>
                    <Sparkles size={22} color="#000" />
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '8px' }}>
                    Synthesizing 3D Portfolio
                  </h4>
                  <p style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '20px' }}>
                    {generationStep || 'Processing domain knowledge...'}
                  </p>

                  {/* Streaming Progress Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '480px',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '999px',
                      margin: '0 auto 32px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${streamProgress}%`,
                        background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta))',
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  {/* Skeleton Shimmer Layout */}
                  <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="skeleton-box skeleton-shimmer" style={{ height: '36px', width: '50%', margin: '0 auto' }} />
                    <div className="skeleton-box skeleton-shimmer" style={{ height: '18px', width: '75%', margin: '0 auto' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '12px' }}>
                      <div className="skeleton-box skeleton-shimmer" style={{ height: '84px' }} />
                      <div className="skeleton-box skeleton-shimmer" style={{ height: '84px' }} />
                      <div className="skeleton-box skeleton-shimmer" style={{ height: '84px' }} />
                    </div>
                    <div className="skeleton-box skeleton-shimmer" style={{ height: '110px', marginTop: '6px' }} />
                  </div>
                </div>
              )}

              {/* Generation Meta Outcome & Anti-Hallucination Gap Alerts */}
              {!isGenerating && generationMeta && (
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    background: generationMeta.source === 'ai' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 170, 0, 0.08)',
                    border: generationMeta.source === 'ai' ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid rgba(255, 170, 0, 0.3)',
                    marginBottom: '24px',
                  }}
                >
                  {/* Non-alarming fallback engine notice */}
                  {generationMeta.source === 'fallback' && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255, 170, 0, 0.12)',
                        border: '1px solid rgba(255, 170, 0, 0.3)',
                        color: '#ffcc00',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '14px',
                      }}
                    >
                      <Sparkles size={16} />
                      <span>Generated with the offline engine; connect AI for richer results</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle2 size={18} color={generationMeta.source === 'ai' ? '#00f2fe' : '#ffaa00'} />
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      {generationMeta.message}
                    </span>
                  </div>

                  {/* Anti-Hallucination Gap Warnings */}
                  {generationMeta.suggestions && generationMeta.suggestions.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#ffaa00', marginBottom: '6px' }}>
                        ANTI-HALLUCINATION AUDIT // IDENTIFIED FACT GAPS:
                      </div>
                      <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                        {generationMeta.suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Ready to Synthesize Summary Card */}
              {!isGenerating && (
                <div
                  style={{
                    padding: '22px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>NAME: </span>
                      <strong style={{ color: '#fff' }}>{autopilotName || 'Alex Chen'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>DISCIPLINE: </span>
                      <strong style={{ color: 'var(--accent-cyan)' }}>{activeDiscipline.shortName}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>PERSONA: </span>
                      <strong style={{ color: '#fff' }}>{autopilotRole.toUpperCase()}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>VERIFIED PROJECTS: </span>
                      <strong style={{ color: '#fff' }}>{projectsList.filter((p) => !p.isAiIdea).length} Projects</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              {!isGenerating && (
                <button
                  type="button"
                  onClick={() => handleRunAutopilot()}
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
                  <span>GENERATE {activeDiscipline.shortName.toUpperCase()} 3D PORTFOLIO</span>
                </button>
              )}

              {/* Career & Portfolio Recommendations */}
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
                    Recommended Standards for {activeDiscipline.label}:
                  </span>
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                  {(portfolio.careerRecommendations || [
                    `Quantify engineering trade-offs using ${activeDiscipline.shortName} domain metrics.`,
                    'Provide clear schematics, CAD models, or architecture diagrams for major capstones.',
                    'Anchor project claims with measurable efficiency or benchmark outcomes.',
                  ]).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Suggested AI Project Concepts */}
              {projectsList.some((p) => p.isAiIdea) && (
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
                      AI Suggested Milestones (Flagged Separately)
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {projectsList.filter((p) => p.isAiIdea).map((idea) => (
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

              {/* Navigation between steps */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep('details')}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  ← Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('customize')}
                  className="btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  <span>Next: Customize & Polish</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CUSTOMIZE (SPLIT LAYOUT: EDITOR LEFT, LIVE PREVIEW RIGHT) */}
          {/* ========================================================================= */}
          {currentStep === 'customize' && (
            <div style={{ width: '100%', height: '100%', minHeight: '620px' }}>
              <SplitCustomizer
                onBackToStep2={() => setCurrentStep('generate')}
                onProceedToStep4={() => setCurrentStep('download_publish')}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: DOWNLOAD OR PUBLISH */}
          {/* ========================================================================= */}
          {currentStep === 'download_publish' && (
            <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
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

              <h4 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: '1.7rem', marginBottom: '8px' }}>
                Export & Publish Your Portfolio
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px', lineHeight: 1.5 }}>
                Export your tailored 3D website as a standalone package, open the professional ATS Resume Studio, or copy your public portfolio share link.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {/* 1. Standalone Offline HTML ZIP Package */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
                      <Download size={18} />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Download as static HTML (zip)</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Self-contained offline HTML website with inlined CSS, styling tokens, and sanitized data. Double-click to open offline anywhere.
                    </p>
                  </div>
                  <button
                    onClick={handleExportZip}
                    disabled={exportingZip}
                    className="btn-primary"
                    style={{ padding: '12px', justifyContent: 'center', fontSize: '0.84rem' }}
                  >
                    <span>{exportingZip ? 'PACKAGING OFFLINE HTML...' : 'DOWNLOAD AS STATIC HTML (ZIP)'}</span>
                  </button>
                </div>

                {/* 2. ATS Resume Studio & Live Preview */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 0, 85, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-magenta)' }}>
                      <FileText size={18} />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>ATS Resume Exports</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-cyan)',
                        background: 'rgba(0, 242, 254, 0.08)',
                        border: '1px solid rgba(0, 242, 254, 0.25)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontWeight: 600,
                      }}
                    >
                      {step4EstimatedPages} {step4EstimatedPages === 1 ? 'PAGE' : 'PAGES'}
                    </span>
                  </div>

                  {/* Template Picker */}
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                      RESUME TEMPLATE:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                      {(['classic', 'modern', 'compact'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setStep4ResumeTemplate(t)}
                          style={{
                            padding: '6px 4px',
                            borderRadius: '6px',
                            border: step4ResumeTemplate === t ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                            background: step4ResumeTemplate === t ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            color: step4ResumeTemplate === t ? 'var(--accent-cyan)' : '#cbd5e1',
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            fontWeight: step4ResumeTemplate === t ? 700 : 500,
                          }}
                        >
                          {t === 'classic' ? 'Classic ATS' : t === 'modern' ? 'Modern' : 'Compact'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Placeholder Warning Banner */}
                  {step4Placeholders.length > 0 && (
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        fontSize: '0.72rem',
                        color: '#fca5a5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <AlertCircle size={14} color="#ef4444" />
                      <span>{step4Placeholders.length} placeholder(s) detected (e.g. &quot;add a metric&quot;)</span>
                    </div>
                  )}

                  {/* Live Mini Preview */}
                  <div
                    style={{
                      height: '180px',
                      background: '#ffffff',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <iframe
                      title="Step 4 Live Resume Preview"
                      srcDoc={step4ResumeHtml}
                      style={{
                        width: '200%',
                        height: '200%',
                        transform: 'scale(0.5)',
                        transformOrigin: 'top left',
                        border: 'none',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  {/* Export Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      onClick={async () => {
                        if (step4Placeholders.length > 0) {
                          const proceed = window.confirm(`Warning: Your profile has ${step4Placeholders.length} placeholder(s) (e.g. "${step4Placeholders[0]}"). Export anyway?`);
                          if (!proceed) return;
                        }
                        setStep4ExportingPdf(true);
                        try {
                          const { downloadResumePdf } = await import('../services/resumeService');
                          await downloadResumePdf(currentPortfolio, {
                            template: step4ResumeTemplate,
                            accentColor: activeThemeTokens?.accentPrimary || '#00f2fe',
                          });
                        } finally {
                          setStep4ExportingPdf(false);
                        }
                      }}
                      disabled={step4ExportingPdf}
                      className="btn-primary"
                      style={{ padding: '8px', justifyContent: 'center', fontSize: '0.76rem' }}
                    >
                      <span>{step4ExportingPdf ? 'EXPORTING...' : 'PDF EXPORT'}</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (step4Placeholders.length > 0) {
                          const proceed = window.confirm(`Warning: Your profile has ${step4Placeholders.length} placeholder(s) (e.g. "${step4Placeholders[0]}"). Export anyway?`);
                          if (!proceed) return;
                        }
                        setStep4ExportingDocx(true);
                        try {
                          const { downloadResumeDocx } = await import('../services/resumeService');
                          await downloadResumeDocx(currentPortfolio, {
                            template: step4ResumeTemplate,
                            accentColor: activeThemeTokens?.accentPrimary || '#00f2fe',
                          });
                        } finally {
                          setStep4ExportingDocx(false);
                        }
                      }}
                      disabled={step4ExportingDocx}
                      className="btn-primary"
                      style={{ padding: '8px', justifyContent: 'center', fontSize: '0.76rem', background: 'linear-gradient(135deg, #0284c7, #2563eb)' }}
                    >
                      <span>{step4ExportingDocx ? 'EXPORTING...' : 'DOCX EXPORT'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenResume) onOpenResume();
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-magenta)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      textDecoration: 'underline',
                      marginTop: '-4px',
                    }}
                  >
                    Launch Full ATS Resume Studio &rarr;
                  </button>
                </div>
              </div>

              {/* Public Share & Publish Card (Phase 6: Live Hosting & Slug) */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  marginBottom: '28px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={18} color="var(--accent-cyan)" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      Publish 3D Portfolio
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: publishStatus === 'published' ? '#10b981' : 'var(--accent-cyan)',
                      background: publishStatus === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 242, 254, 0.1)',
                      border: `1px solid ${publishStatus === 'published' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 242, 254, 0.3)'}`,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    {publishStatus === 'published' ? 'LIVE & ACTIVE' : publishStatus === 'publishing' ? 'DEPLOYING...' : 'ONLINE HOSTING'}
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  Deploy your portfolio to a persistent, unguessable public URL (<code style={{ color: 'var(--accent-cyan)' }}>/p/:slug</code>) that anyone can visit with zero studio UI.
                </p>

                {/* One-time Owner Token Display Banner */}
                {newlyIssuedToken && (
                  <div
                    id="owner-token-banner"
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#34d399',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                        <Key size={15} />
                        <span>Owner Token: Save this to manage your page</span>
                      </div>
                      <button
                        type="button"
                        id="btn-copy-owner-token"
                        onClick={() => {
                          navigator.clipboard.writeText(newlyIssuedToken);
                          setCopiedOwnerToken(true);
                          setTimeout(() => setCopiedOwnerToken(false), 2500);
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {copiedOwnerToken ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedOwnerToken ? 'COPIED' : 'COPY TOKEN'}</span>
                      </button>
                    </div>
                    <div
                      id="owner-token-display"
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        wordBreak: 'break-all',
                        fontSize: '0.74rem',
                        color: '#a7f3d0',
                        userSelect: 'all',
                      }}
                    >
                      {newlyIssuedToken}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>⚠️ Save this to manage your page from any browser. It will only be shown once.</span>
                      <button
                        type="button"
                        onClick={() => setNewlyIssuedToken(null)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#9ca3af',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Banner with Retry */}
                {publishStatus === 'error' && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontSize: '0.8rem' }}>
                      <AlertCircle size={16} />
                      <span>{publishError || 'Publishing failed. Please retry.'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePublish}
                      style={{
                        background: 'rgba(239, 68, 68, 0.3)',
                        border: '1px solid #ef4444',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Published State: Real Link, Copy, Open, Update, and Unpublish */}
                {publishedUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.82rem',
                          color: '#34d399',
                          fontFamily: 'var(--font-mono)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {publishedUrl}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={handleCopyPublishedLink}
                          className="btn-primary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.74rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          {copiedPublishLink ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedPublishLink ? 'COPIED!' : 'COPY LINK'}</span>
                        </button>
                        <a
                          href={publishedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.74rem',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          <ExternalLink size={14} />
                          <span>OPEN SITE</span>
                        </a>
                      </div>
                    </div>

                    {/* Update Published Page Button */}
                    <button
                      type="button"
                      id="btn-update-published-page"
                      onClick={handlePublish}
                      disabled={publishStatus === 'publishing'}
                      className="btn-primary"
                      style={{
                        padding: '10px 20px',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                      }}
                    >
                      {publishStatus === 'publishing' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Updating published page...</span>
                        </>
                      ) : (
                        <>
                          <RotateCw size={15} />
                          <span>Update published page</span>
                        </>
                      )}
                    </button>

                    {/* Localhost Host Notice */}
                    {typeof window !== 'undefined' &&
                      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                        <div
                          style={{
                            marginTop: '4px',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.35)',
                            color: '#fbbf24',
                            fontSize: '0.78rem',
                            fontFamily: 'var(--font-mono)',
                            lineHeight: 1.5,
                            textAlign: 'left',
                          }}
                        >
                          ℹ️ <strong>Local Hosting Notice:</strong> This link works only on this computer ({publishedUrl}) unless you host the app.
                        </div>
                      )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={handleUnpublish}
                        disabled={isUnpublishing}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.74rem',
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          opacity: isUnpublishing ? 0.6 : 0.9,
                        }}
                      >
                        <Trash2 size={13} />
                        <span>{isUnpublishing ? 'UNPUBLISHING...' : 'Unpublish Portfolio'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Initial or Loading State: Publish Button */
                  <div>
                    <button
                      type="button"
                      id="btn-publish-portfolio"
                      onClick={handlePublish}
                      disabled={publishStatus === 'publishing'}
                      className="btn-primary"
                      style={{
                        padding: '12px 24px',
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                      }}
                    >
                      {publishStatus === 'publishing' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Globe size={16} />
                          <span>Publish</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Re-enter Owner Token Field */}
                <div style={{ marginTop: '4px' }}>
                  <button
                    type="button"
                    id="btn-toggle-token-input"
                    onClick={() => setShowTokenInput(!showTokenInput)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 0',
                      textDecoration: 'underline',
                    }}
                  >
                    <Key size={13} />
                    <span>{showTokenInput ? 'Hide token entry' : 'Have an owner token? Re-enter it here'}</span>
                  </button>

                  {showTokenInput && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <label style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
                        Re-enter Owner Token to manage your page:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          id="manual-owner-token-input"
                          placeholder="Paste your 64-character owner token"
                          value={manualTokenInput}
                          onChange={(e) => setManualTokenInput(e.target.value)}
                          style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '0.74rem',
                            color: '#fff',
                            fontFamily: 'var(--font-mono)',
                          }}
                        />
                        <button
                          type="button"
                          id="btn-save-owner-token"
                          onClick={handleSaveManualToken}
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.74rem' }}
                        >
                          Save Token
                        </button>
                      </div>
                      {tokenFeedback && (
                        <span style={{ fontSize: '0.72rem', color: tokenFeedback.includes('✓') ? '#34d399' : '#f87171', fontFamily: 'var(--font-mono)' }}>
                          {tokenFeedback}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Image Downscale / Compression Warning Notice */}
                {imageWarnings.length > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1.5,
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>⚠️ Image Notice:</div>
                    {imageWarnings.map((w, idx) => (
                      <div key={idx}>• {w}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Back to Customize and Close Action */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep('customize')}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  ← Back to Customize
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary"
                  style={{ padding: '12px 28px', fontSize: '0.92rem' }}
                >
                  <Check size={16} />
                  <span>Finish & View Live 3D Portfolio</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorStudio;
