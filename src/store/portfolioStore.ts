import { create } from 'zustand';
import type { PortfolioData } from '../types/portfolio';
import { ROLE_PROFILES } from '../data/defaultProfiles.ts';
import {
  type ThemeTokens,
  CURATED_THEME_PRESETS,
} from '../types/themeTokens';

const AUTOSAVE_STORAGE_KEY = 'portfolio_builder_customizer_autosave_v2';
const THEME_STORAGE_KEY = 'portfolio_theme_tokens_v2';

export type AiWritingTone = 'professional' | 'creative' | 'concise' | 'impactful' | 'technical';

let autosaveTimer: any = null;

/**
 * Strips or downscales oversized base64 strings to safeguard against localStorage quota overflow.
 */
function sanitizePortfolioForStorage(data: PortfolioData): PortfolioData {
  try {
    const clone = JSON.parse(JSON.stringify(data));
    if (typeof clone.avatar === 'string' && clone.avatar.startsWith('data:') && clone.avatar.length > 50000) {
      clone.avatar = '';
    }
    if (Array.isArray(clone.projects)) {
      clone.projects.forEach((p: any) => {
        if (typeof p.imageUrl === 'string' && p.imageUrl.startsWith('data:') && p.imageUrl.length > 50000) {
          p.imageUrl = '';
        }
      });
    }
    return clone;
  } catch {
    return data;
  }
}

/**
 * Safely writes to localStorage with try/catch guarding for QuotaExceededError.
 */
function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    if (err && (err.name === 'QuotaExceededError' || err.code === 22 || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn(`[portfolioStore] LocalStorage quota exceeded writing ${key}. Clearing secondary drafts to recover space.`);
      try {
        localStorage.removeItem('ai_portfolio_draft');
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.warn('[portfolioStore] Recovery attempt failed, quota full:', retryErr);
      }
    } else {
      console.warn(`[portfolioStore] LocalStorage write error for ${key}:`, err);
    }
    return false;
  }
}

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
  activeTone: AiWritingTone;
  autosaveStatus: 'idle' | 'saving' | 'saved';
  lastAutosavedAt: string | null;

  // Actions
  setPortfolio: (portfolio: PortfolioData, skipHistory?: boolean) => void;
  setActiveTone: (tone: AiWritingTone) => void;
  resetPortfolio: () => void;
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
  activeTone: 'professional',
  autosaveStatus: 'idle',
  lastAutosavedAt: null,

  setActiveTone: (tone: AiWritingTone) => {
    set({ activeTone: tone });
  },

  resetPortfolio: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
        localStorage.removeItem('ai_portfolio_draft');
        localStorage.removeItem(THEME_STORAGE_KEY);
      } catch (e) {
        console.warn('[portfolioStore] Clear localStorage failed:', e);
      }
    }
    set({
      portfolio: ROLE_PROFILES.student,
      themeTokens: CURATED_THEME_PRESETS[0],
      history: [],
      future: [],
      autosaveStatus: 'idle',
      lastAutosavedAt: null,
      activeTone: 'professional',
    });
  },

  setPortfolio: (newPortfolio: PortfolioData, skipHistory = false) => {
    const current = get().portfolio;
    set((state) => ({
      portfolio: newPortfolio,
      history: skipHistory ? state.history : [...state.history.slice(-20), current],
      future: skipHistory ? state.future : [],
      autosaveStatus: 'saving',
    }));

    // Trigger debounced autosave (400ms) with sanitized payload and safe localStorage quota handling
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      try {
        const sanitized = sanitizePortfolioForStorage(newPortfolio);
        const serialized = JSON.stringify(sanitized);
        const savedPrimary = safeSetLocalStorage(AUTOSAVE_STORAGE_KEY, serialized);
        safeSetLocalStorage('ai_portfolio_draft', serialized);
        if (savedPrimary) {
          set({ autosaveStatus: 'saved', lastAutosavedAt: new Date().toLocaleTimeString() });
        } else {
          set({ autosaveStatus: 'idle' });
        }
      } catch {
        set({ autosaveStatus: 'idle' });
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
    safeSetLocalStorage(THEME_STORAGE_KEY, JSON.stringify(updated));
  },

  applyThemePreset: (presetId: string) => {
    const found = CURATED_THEME_PRESETS.find((p) => p.id === presetId);
    if (found) {
      set({ themeTokens: found });
      safeSetLocalStorage(THEME_STORAGE_KEY, JSON.stringify(found));
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
    const sanitized = sanitizePortfolioForStorage(previous);
    safeSetLocalStorage(AUTOSAVE_STORAGE_KEY, JSON.stringify(sanitized));
    set({ autosaveStatus: 'saved', lastAutosavedAt: new Date().toLocaleTimeString() });
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
    const sanitized = sanitizePortfolioForStorage(next);
    safeSetLocalStorage(AUTOSAVE_STORAGE_KEY, JSON.stringify(sanitized));
    set({ autosaveStatus: 'saved', lastAutosavedAt: new Date().toLocaleTimeString() });
  },

  canUndo: () => get().history.length > 0,
  canRedo: () => get().future.length > 0,
}));
