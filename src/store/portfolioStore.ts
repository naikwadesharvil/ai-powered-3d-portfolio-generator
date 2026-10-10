import { create } from 'zustand';
import type { PortfolioData } from '../types/portfolio';
import { ROLE_PROFILES } from '../data/defaultProfiles.ts';
import {
  type ThemeTokens,
  CURATED_THEME_PRESETS,
} from '../types/themeTokens';

const AUTOSAVE_STORAGE_KEY = 'portfolio_builder_customizer_autosave_v2';
const THEME_STORAGE_KEY = 'portfolio_theme_tokens_v2';

let autosaveTimer: any = null;

function getInitialPortfolio(): PortfolioData {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('ai_portfolio_draft') || localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    } catch {
      // Fallback
    }
  }
  return ROLE_PROFILES.student;
}

function getInitialTheme(): ThemeTokens {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.accentPrimary) return parsed;
      }
    } catch {
      // Fallback
    }
  }
  return CURATED_THEME_PRESETS[0]; // Cyberpunk Neon (Default)
}

export interface PortfolioStoreState {
  portfolio: PortfolioData;
  themeTokens: ThemeTokens;
  history: PortfolioData[];
  future: PortfolioData[];
  autosaveStatus: 'idle' | 'saving' | 'saved';
  lastAutosavedAt: string | null;

  // Actions
  setPortfolio: (portfolio: PortfolioData, skipHistory?: boolean) => void;
  updateSectionVisibility: (sectionId: string, visible: boolean) => void;
  reorderSections: (newOrder: string[]) => void;
  updateSectionField: (field: keyof PortfolioData, value: any) => void;
  updateProjectItem: (projectId: string, field: string, value: any) => void;
  updateSkillItem: (index: number, name: string) => void;
  setThemeTokens: (tokens: Partial<ThemeTokens>) => void;
  applyThemePreset: (presetId: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const usePortfolioStore = create<PortfolioStoreState>((set, get) => ({
  portfolio: getInitialPortfolio(),
  themeTokens: getInitialTheme(),
  history: [],
  future: [],
  autosaveStatus: 'idle',
  lastAutosavedAt: null,

  setPortfolio: (newPortfolio: PortfolioData, skipHistory = false) => {
    const current = get().portfolio;
    set((state) => ({
      portfolio: newPortfolio,
      history: skipHistory ? state.history : [...state.history.slice(-20), current],
      future: skipHistory ? state.future : [],
      autosaveStatus: 'saving',
    }));

    // Trigger debounced autosave (400ms)
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          const serialized = JSON.stringify(newPortfolio);
          localStorage.setItem(AUTOSAVE_STORAGE_KEY, serialized);
          localStorage.setItem('ai_portfolio_draft', serialized);
          set({ autosaveStatus: 'saved', lastAutosavedAt: new Date().toLocaleTimeString() });
        } catch {
          set({ autosaveStatus: 'idle' });
        }
      }
    }, 400);
  },

  updateSectionVisibility: (sectionId: string, visible: boolean) => {
    const current = get().portfolio;
    const updatedVisibility = {
      ...(current.sectionVisibility || {}),
      [sectionId]: visible,
    };
    const updated = {
      ...current,
      sectionVisibility: updatedVisibility,
    };
    get().setPortfolio(updated);
  },

  reorderSections: (newOrder: string[]) => {
    const current = get().portfolio;
    const updated = {
      ...current,
      sectionOrder: newOrder as any,
    };
    get().setPortfolio(updated);
  },

  updateSectionField: (field: keyof PortfolioData, value: any) => {
    const current = get().portfolio;
    const updated = {
      ...current,
      [field]: value,
    };
    get().setPortfolio(updated);
  },

  updateProjectItem: (projectId: string, field: string, value: any) => {
    const current = get().portfolio;
    const updatedProjects = current.projects.map((p) => {
      if (p.id === projectId) {
        return { ...p, [field]: value };
      }
      return p;
    });
    get().setPortfolio({ ...current, projects: updatedProjects });
  },

  updateSkillItem: (index: number, name: string) => {
    const current = get().portfolio;
    const updatedSkills = [...current.skills];
    if (updatedSkills[index]) {
      updatedSkills[index] = { ...updatedSkills[index], name };
      get().setPortfolio({ ...current, skills: updatedSkills });
    }
  },

  setThemeTokens: (partial: Partial<ThemeTokens>) => {
    const updated = { ...get().themeTokens, ...partial };
    set({ themeTokens: updated });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Fallback
      }
    }
  },

  applyThemePreset: (presetId: string) => {
    const found = CURATED_THEME_PRESETS.find((p) => p.id === presetId);
    if (found) {
      set({ themeTokens: found });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(found));
        } catch {
          // Fallback
        }
      }
    }
  },

  undo: () => {
    const { history, portfolio, future } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    set({
      portfolio: previous,
      history: newHistory,
      future: [portfolio, ...future],
      autosaveStatus: 'saving',
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(previous));
      set({ autosaveStatus: 'saved', lastAutosavedAt: new Date().toLocaleTimeString() });
    }
  },

  redo: () => {
    const { future, portfolio, history } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      portfolio: next,
      history: [...history, portfolio],
      future: newFuture,
      autosaveStatus: 'saving',
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(next));
      set({ autosaveStatus: 'saved', lastAutosavedAt: new Date().toLocaleTimeString() });
    }
  },

  canUndo: () => get().history.length > 0,
  canRedo: () => get().future.length > 0,
}));
