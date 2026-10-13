import { z } from 'zod';

// ============================================================================
// 1. Core Enumerations & Primitives
// ============================================================================

export const PersonaSchema = z.enum([
  'student',
  'job_seeker',
  'professional',
  'freelancer',
]);
export type Persona = z.infer<typeof PersonaSchema>;

export const DisciplineSchema = z.enum([
  'cs_it',
  'mechanical',
  'mechatronics',
  'electrical_ece',
  'civil',
  'chemical',
  'automobile',
  'aerospace',
  'biotech',
  'sciences',
  'diploma_polytechnic',
  'custom',
]).or(z.string());
export type Discipline = z.infer<typeof DisciplineSchema>;

export const ThemePresetSchema = z.enum([
  'cyberpunk_neon',
  'obsidian_stealth',
  'sunset_titanium',
  'emerald_matrix',
]).or(z.string());
export type ThemePreset = z.infer<typeof ThemePresetSchema>;

export const Hero3DModeSchema = z.enum([
  'kinetic_360',
  'hologram_core',
  'cyber_wireframe',
]).or(z.string());
export type Hero3DMode = z.infer<typeof Hero3DModeSchema>;

// ============================================================================
// 2. Profile, Summary & Contact Sub-Schemas
// ============================================================================

export const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').default(''),
  targetRole: z.string().default('Engineer & Developer'),
  tagline: z.string().default('Building high-performance systems.'),
  avatarUrl: z.string().default('/assets/profile.png'),
  location: z.string().default(''),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const SummarySchema = z.object({
  shortBio: z.string().default(''),
  fullBio: z.string().default(''),
});
export type Summary = z.infer<typeof SummarySchema>;

export const ContactSchema = z.object({
  email: z.string().default(''),
  phone: z.string().optional().default(''),
  location: z.string().default(''),
  github: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  twitter: z.string().optional().default(''),
});
export type Contact = z.infer<typeof ContactSchema>;

// ============================================================================
// 3. Skills Sub-Schema (Grouped & Individual)
// ============================================================================

export const SkillItemSchema = z.object({
  name: z.string(),
  category: z.string().default('Core'),
  level: z.union([z.string(), z.number()]).optional().default('intermediate'),
  icon: z.string().optional(),
});
export type SkillItem = z.infer<typeof SkillItemSchema>;
export type TechSkill = SkillItem;

export const SkillGroupSchema = z.object({
  category: z.string(),
  items: z.array(z.string()).default([]),
});
export type SkillGroup = z.infer<typeof SkillGroupSchema>;

// ============================================================================
// 4. Projects Sub-Schema (title, description, bullets, tools, imageUrl)
// ============================================================================

export interface ProjectItem {
  id?: string;
  title: string;
  description?: string;
  bullets?: string[];
  tools?: string[];
  tags?: string[];
  imageUrl?: string;
  demoUrl?: string;
  link?: string;
  githubUrl?: string;
  github?: string;
  metrics?: string;
  role?: string;
  date?: string;
  isAiIdea?: boolean;
}
export type Project = ProjectItem;

export const ProjectSchema: z.ZodType<ProjectItem> = z.object({
  id: z.string().optional().default(() => `proj-${Math.random().toString(36).substring(2, 9)}`),
  title: z.string().min(1, 'Project title is required'),
  description: z.string().optional().default(''),
  bullets: z.array(z.string()).optional().default([]),
  tools: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]), // backwards compat with tools
  imageUrl: z.string().optional().default(''),
  demoUrl: z.string().optional().default(''),
  link: z.string().optional().default(''),
  githubUrl: z.string().optional().default(''),
  github: z.string().optional().default(''),
  metrics: z.string().optional().default(''),
  role: z.string().optional().default('Lead Developer'),
  date: z.string().optional().default(''),
  isAiIdea: z.boolean().optional().default(false),
});

// ============================================================================
// 5. Experience & Education Sub-Schemas
// ============================================================================

export interface ExperienceItem {
  id?: string;
  company: string;
  role: string;
  period?: string;
  location?: string;
  description?: string;
  companyUrl?: string;
  link?: string;
  bullets?: string[];
  points?: string[];
  highlights?: string[];
  isVerified?: boolean;
}
export type Experience = ExperienceItem;

export const ExperienceSchema: z.ZodType<ExperienceItem> = z.object({
  id: z.string().optional().default(() => `exp-${Math.random().toString(36).substring(2, 9)}`),
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role title is required'),
  period: z.string().optional().default('Present'),
  location: z.string().optional().default(''),
  description: z.string().optional().default(''),
  companyUrl: z.string().optional().default(''),
  link: z.string().optional().default(''),
  bullets: z.array(z.string()).optional().default([]),
  points: z.array(z.string()).optional().default([]),
  highlights: z.array(z.string()).optional().default([]),
  isVerified: z.boolean().optional().default(true),
});

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  period?: string;
  score?: string;
  details?: string;
}
export type Education = EducationItem;

export const EducationSchema: z.ZodType<EducationItem> = z.object({
  id: z.string().optional().default(() => `edu-${Math.random().toString(36).substring(2, 9)}`),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  period: z.string().optional().default(''),
  score: z.string().optional().default(''),
  details: z.string().optional().default(''),
});

// ============================================================================
// 6. Section Configuration (id, visible, order)
// ============================================================================

export const SectionConfigSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  visible: z.boolean().default(true),
  order: z.number().default(0),
});
export type SectionConfig = z.infer<typeof SectionConfigSchema>;

// Supporting section items
export interface CertificationItem {
  id?: string;
  name: string;
  issuer: string;
  date?: string;
  credentialUrl?: string;
}
export type Certification = CertificationItem;

export const CertificationSchema: z.ZodType<CertificationItem> = z.object({
  id: z.string().optional().default(() => `cert-${Math.random().toString(36).substring(2, 9)}`),
  name: z.string(),
  issuer: z.string(),
  date: z.string().optional().default(''),
  credentialUrl: z.string().optional().default(''),
});

export interface PublicationItem {
  id?: string;
  title: string;
  publisher: string;
  date?: string;
  award?: string;
  link?: string;
}
export type Publication = PublicationItem;

export const PublicationSchema: z.ZodType<PublicationItem> = z.object({
  id: z.string().optional().default(() => `pub-${Math.random().toString(36).substring(2, 9)}`),
  title: z.string(),
  publisher: z.string(),
  date: z.string().optional().default(''),
  award: z.string().optional().default(''),
  link: z.string().optional().default(''),
});

export const ServicePackageSchema = z.object({
  id: z.string().default(() => `srv-${Math.random().toString(36).substring(2, 9)}`),
  title: z.string(),
  description: z.string(),
  deliverables: z.array(z.string()).default([]),
  startingPrice: z.string().optional().default(''),
});
export type ServicePackage = z.infer<typeof ServicePackageSchema>;

export const TestimonialSchema = z.object({
  id: z.string().default(() => `tst-${Math.random().toString(36).substring(2, 9)}`),
  clientName: z.string(),
  clientRole: z.string(),
  company: z.string(),
  feedback: z.string(),
});
export type Testimonial = z.infer<typeof TestimonialSchema>;

export const TelemetrySchema = z.object({
  session: z.string().default('INITIALIZED'),
  timezone: z.string().default('UTC'),
  status: z.string().default('READY'),
  coords: z.string().default('19.0760 N, 72.8777 E'),
  fps: z.string().default('60.0'),
  coreEngine: z.string().default('V8 / Canvas2D Frame Scrubber'),
});
export type Telemetry = z.infer<typeof TelemetrySchema>;

export const StatCardSchema = z.object({
  title: z.string(),
  value: z.string(),
  subtext: z.string(),
});
export type StatCard = z.infer<typeof StatCardSchema>;

export const BentoStatsSchema = z.object({
  stat1: StatCardSchema,
  stat2: StatCardSchema,
  stat3: StatCardSchema,
});
export type BentoStats = z.infer<typeof BentoStatsSchema>;

// ============================================================================
// 7. Complete Shared PortfolioData Schema
// ============================================================================

export const PortfolioDataSchema = z.object({
  id: z.string().default(() => `portfolio-${Date.now()}`),
  version: z.number().default(2),
  lastUpdated: z.string().default(() => new Date().toISOString()),

  // Required Core Dimensions
  persona: PersonaSchema.default('student'),
  discipline: DisciplineSchema.default('cs_it'),
  disciplineName: z.string().optional().default(''),

  profile: ProfileSchema,
  summary: SummarySchema,
  contact: ContactSchema,
  theme: ThemePresetSchema.default('cyberpunk_neon'),
  sections: z.array(SectionConfigSchema).default([
    { id: 'hero', title: 'Hero HUD', visible: true, order: 0 },
    { id: 'welcome', title: 'Welcome Matrix', visible: true, order: 1 },
    { id: 'about', title: 'About & Bento', visible: true, order: 2 },
    { id: 'skills', title: 'Competencies', visible: true, order: 3 },
    { id: 'projects', title: 'Selected Works', visible: true, order: 4 },
    { id: 'experience', title: 'Career & Services', visible: true, order: 5 },
    { id: 'credentials', title: 'Research & Credentials', visible: true, order: 6 },
    { id: 'contact', title: 'Direct Transmission', visible: true, order: 7 },
  ]),

  // Detailed Content Arrays
  skills: z.array(SkillItemSchema).default([]),
  skillGroups: z.array(SkillGroupSchema).optional().default([]),
  projects: z.array(ProjectSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),

  certifications: z.array(CertificationSchema).optional().default([]),
  publications: z.array(PublicationSchema).optional().default([]),
  services: z.array(ServicePackageSchema).optional().default([]),
  testimonials: z.array(TestimonialSchema).optional().default([]),

  telemetry: TelemetrySchema.optional().default({
    session: 'SESSION_ACTIVE_001',
    timezone: 'UTC',
    status: 'OPTIMAL',
    coords: '19.0760 N, 72.8777 E',
    fps: '60.0',
    coreEngine: 'Canvas2D Frame Scrubber',
  }),

  bentoStats: BentoStatsSchema.optional().default({
    stat1: { title: 'CORE STACK', value: '12+ Tools', subtext: 'Verified Competencies' },
    stat2: { title: 'ACADEMIC RECORD', value: 'B.Tech AI/ML', subtext: 'Engineering Honor' },
    stat3: { title: 'ACTIVE ARCHIVES', value: '4 Prototypes', subtext: 'Functional Deliverables' },
  }),

  // Backwards-compatible shortcuts for existing UI components
  name: z.string().optional().default(''),
  role: PersonaSchema.optional().default('student'),
  branch: z.string().optional().default('cs_it'),
  branchName: z.string().optional().default(''),
  tagline: z.string().optional().default(''),
  shortBio: z.string().optional().default(''),
  fullBio: z.string().optional().default(''),
  avatarUrl: z.string().optional().default('/assets/profile.png'),
  targetRole: z.string().optional().default(''),
  location: z.string().optional().default(''),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  github: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  twitter: z.string().optional().default(''),
  resumeUrl: z.string().optional().default(''),
  interests: z.array(z.string()).optional().default([]),
  careerRecommendations: z.array(z.string()).optional().default([]),
  aiProjectSuggestions: z.array(ProjectSchema).optional().default([]),
  experiences: z.array(ExperienceSchema).optional().default([]),
  sectionVisibility: z.record(z.string(), z.boolean()).optional().default({
    hero: true,
    welcome: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    education: true,
    certifications: true,
    publications: true,
    services: false,
    testimonials: false,
    contact: true,
  }),
  sectionOrder: z.array(z.string()).optional().default([
    'hero',
    'welcome',
    'about',
    'projects',
    'experience',
    'publications',
    'contact',
  ]),
  hero3DMode: Hero3DModeSchema.optional().default('kinetic_360'),
});

export type PortfolioData = z.infer<typeof PortfolioDataSchema>;

// ============================================================================
// 8. Normalizer Function (Ensures Bidirectional Synchrony)
// ============================================================================

export function normalizePortfolioData(raw: Partial<PortfolioData> | any): PortfolioData {
  const personaVal = (raw.role || raw.persona || 'student') as Persona;
  const nameVal = (raw.name && raw.name.trim().length > 0) ? raw.name.trim() : (raw.profile?.name || 'Engineer');
  const targetRoleVal = raw.targetRole || raw.profile?.targetRole || raw.tagline || 'AI/ML Systems Engineer';
  const taglineVal = raw.tagline || raw.profile?.tagline || targetRoleVal;
  const avatarUrlVal = raw.avatarUrl || raw.profile?.avatarUrl || '/assets/profile.png';
  const locationVal = raw.location || raw.contact?.location || raw.profile?.location || '';
  const emailVal = raw.email || raw.contact?.email || 'contact@engineering.io';
  const phoneVal = raw.phone || raw.contact?.phone || '';
  const githubVal = raw.github || raw.contact?.github || '';
  const linkedinVal = raw.linkedin || raw.contact?.linkedin || '';
  const twitterVal = raw.twitter || raw.contact?.twitter || '';
  const shortBioVal = raw.shortBio || raw.summary?.shortBio || '';
  const fullBioVal = raw.fullBio || raw.summary?.fullBio || shortBioVal;
  const disciplineVal = raw.discipline || raw.branch || 'cs_it';
  const disciplineNameVal = raw.disciplineName || raw.branchName || '';

  // Normalize projects (ensure bullets and tools are arrays)
  const projectsVal: Project[] = (raw.projects || []).map((p: any, idx: number) => {
    const tools = p.tools && p.tools.length > 0 ? p.tools : (p.tags || []);
    const bullets = p.bullets && p.bullets.length > 0
      ? p.bullets
      : (p.highlights || (p.description ? [p.description] : []));
    return {
      id: p.id || `proj-${idx + 1}`,
      title: p.title || 'Untitled Project',
      description: p.description || (bullets[0] || ''),
      bullets,
      tools,
      tags: tools,
      imageUrl: p.imageUrl || '',
      demoUrl: p.demoUrl || p.link || '',
      githubUrl: p.githubUrl || p.github || '',
      metrics: p.metrics || '',
      role: p.role || 'Lead Engineer',
      date: p.date || '',
      isAiIdea: p.isAiIdea ?? false,
    };
  });

  // Normalize experiences
  const expList = raw.experience || raw.experiences || [];
  const experienceVal: Experience[] = expList.map((e: any, idx: number) => {
    const bullets = e.bullets && e.bullets.length > 0 ? e.bullets : (e.points || []);
    return {
      id: e.id || `exp-${idx + 1}`,
      company: e.company || 'Enterprise',
      role: e.role || e.title || 'Engineer',
      period: e.period || 'Present',
      location: e.location || '',
      description: e.description || '',
      companyUrl: e.companyUrl || e.link || '',
      link: e.link || e.companyUrl || '',
      bullets,
      points: bullets,
      isVerified: e.isVerified ?? true,
    };
  });

  // Normalize sections
  let sectionsVal: SectionConfig[] = raw.sections || [];
  if (!sectionsVal || sectionsVal.length === 0) {
    const orderList = raw.sectionOrder || [
      'hero',
      'welcome',
      'about',
      'skills',
      'projects',
      'experience',
      'credentials',
      'contact',
    ];
    const visRecord = raw.sectionVisibility || {};
    sectionsVal = orderList.map((id: string, idx: number) => ({
      id,
      title: id.toUpperCase(),
      visible: visRecord[id] ?? true,
      order: idx,
    }));
  }

  // Derive sectionVisibility and sectionOrder for backward compatibility
  const sectionVisibility: Record<string, boolean> = { ...(raw.sectionVisibility || {}) };
  sectionsVal.forEach((sec) => {
    sectionVisibility[sec.id] = sec.visible;
  });
  const sectionOrder = [...sectionsVal].sort((a, b) => a.order - b.order).map((s) => s.id);

  const cleanObject: PortfolioData = {
    id: raw.id || `portfolio-${Date.now()}`,
    version: raw.version || 2,
    lastUpdated: raw.lastUpdated || new Date().toISOString(),

    persona: personaVal,
    discipline: disciplineVal,
    disciplineName: disciplineNameVal,

    profile: {
      name: nameVal,
      targetRole: targetRoleVal,
      tagline: taglineVal,
      avatarUrl: avatarUrlVal,
      location: locationVal,
    },
    summary: {
      shortBio: shortBioVal,
      fullBio: fullBioVal,
    },
    contact: {
      email: emailVal,
      phone: phoneVal,
      location: locationVal,
      github: githubVal,
      linkedin: linkedinVal,
      twitter: twitterVal,
    },
    theme: raw.theme || 'cyberpunk_neon',
    sections: sectionsVal,

    skills: getFlattenedSkills(raw.skills || []),
    skillGroups: getGroupedSkills(raw.skillGroups || raw.skills || []),
    projects: projectsVal,
    experience: experienceVal,
    education: raw.education || [],

    certifications: raw.certifications || [],
    publications: raw.publications || [],
    services: raw.services || [],
    testimonials: raw.testimonials || [],
    telemetry: raw.telemetry || {
      session: 'SESSION_ACTIVE_001',
      timezone: 'UTC',
      status: 'OPTIMAL',
      coords: '19.0760 N, 72.8777 E',
      fps: '60.0',
      coreEngine: 'Canvas2D Frame Scrubber',
    },
    bentoStats: raw.bentoStats || {
      stat1: { title: 'CORE STACK', value: '12+ Tools', subtext: 'Verified Competencies' },
      stat2: { title: 'ACADEMIC RECORD', value: 'B.Tech AI/ML', subtext: 'Engineering Honor' },
      stat3: { title: 'ACTIVE ARCHIVES', value: '4 Prototypes', subtext: 'Functional Deliverables' },
    },

    // Backwards-compatible properties
    name: nameVal,
    role: personaVal,
    branch: disciplineVal,
    branchName: disciplineNameVal,
    tagline: taglineVal,
    shortBio: shortBioVal,
    fullBio: fullBioVal,
    avatarUrl: avatarUrlVal,
    targetRole: targetRoleVal,
    location: locationVal,
    email: emailVal,
    phone: phoneVal,
    github: githubVal,
    linkedin: linkedinVal,
    twitter: twitterVal,
    resumeUrl: raw.resumeUrl || '',
    interests: raw.interests || [],
    careerRecommendations: raw.careerRecommendations || [],
    aiProjectSuggestions: raw.aiProjectSuggestions || [],
    experiences: experienceVal,
    sectionVisibility,
    sectionOrder,
    hero3DMode: raw.hero3DMode || 'kinetic_360',
  };

  return cleanObject;
}

// ============================================================================
// 9. OpenAI Structured Output Target Schema (Strict JSON Schema Compliant)
// ============================================================================

export const AiStructuredPortfolioOutputSchema = z.object({
  targetRole: z.string().describe('Precise industry role headline matching the discipline'),
  tagline: z.string().describe('Punchy professional punchline / tagline'),
  shortBio: z.string().describe('Concise 2-sentence summary'),
  fullBio: z.string().describe('Complete professional summary with achievements and discipline background'),
  skills: z.array(
    z.object({
      category: z.string().describe('Category name e.g. CAD, Robotics, Core, Systems'),
      items: z.array(z.string()).describe('List of verified technical skills in this category'),
    })
  ).describe('Technical skill groups tailored to the discipline'),
  projects: z.array(
    z.object({
      title: z.string().describe('Project title'),
      description: z.string().describe('Overview of system or mechanism built'),
      bullets: z.array(z.string()).describe('Specific engineering actions, algorithms, and design choices'),
      tools: z.array(z.string()).describe('Technical tools and frameworks used'),
      metrics: z.string().describe('Quantifiable outcome e.g. 80% accuracy or 15% weight reduction'),
      isAiIdea: z.boolean().describe('True ONLY if this is a newly suggested milestone rather than user-provided work'),
    })
  ).describe('Projects array'),
  bentoStats: z.object({
    stat1: z.object({ title: z.string(), value: z.string(), subtext: z.string() }),
    stat2: z.object({ title: z.string(), value: z.string(), subtext: z.string() }),
    stat3: z.object({ title: z.string(), value: z.string(), subtext: z.string() }),
  }).describe('Bento grid high-level metric cards'),
  careerRecommendations: z.array(z.string()).describe('Strategic next steps, high-value certifications, or capstone milestones'),
  improvementSuggestions: z.array(z.string()).describe('Actionable flags for missing facts or metrics in user details (e.g. "add a metric here")'),
});

export type AiStructuredPortfolioOutput = z.infer<typeof AiStructuredPortfolioOutputSchema>;

// ============================================================================
// 10. Helper Utilities for Safe Multi-format Section Consumption
// ============================================================================

export function getFlattenedSkills(skills: any[]): SkillItem[] {
  if (!Array.isArray(skills)) return [];
  const result: SkillItem[] = [];
  for (const s of skills) {
    if (typeof s === 'string') {
      result.push({ name: s, category: 'Core', level: 'intermediate' });
    } else if (s && Array.isArray(s.items)) {
      for (const item of s.items) {
        result.push({ name: String(item), category: s.category || 'Core', level: 'intermediate' });
      }
    } else if (s && typeof s === 'object' && s.name) {
      result.push({
        name: String(s.name),
        category: s.category || 'Core',
        level: s.level ?? 'intermediate',
        icon: s.icon,
      });
    }
  }
  return result;
}

export function getGroupedSkills(skills: any[]): Array<{ category: string; items: string[] }> {
  if (!Array.isArray(skills)) return [];
  const groupMap = new Map<string, Set<string>>();
  for (const s of skills) {
    if (typeof s === 'string') {
      const cat = 'Core';
      if (!groupMap.has(cat)) groupMap.set(cat, new Set());
      groupMap.get(cat)!.add(s);
    } else if (s && Array.isArray(s.items)) {
      const cat = s.category || 'Core';
      if (!groupMap.has(cat)) groupMap.set(cat, new Set());
      for (const item of s.items) groupMap.get(cat)!.add(String(item));
    } else if (s && typeof s === 'object' && s.name) {
      const cat = s.category || 'Core';
      if (!groupMap.has(cat)) groupMap.set(cat, new Set());
      groupMap.get(cat)!.add(String(s.name));
    }
  }
  return Array.from(groupMap.entries()).map(([category, itemsSet]) => ({
    category,
    items: Array.from(itemsSet),
  }));
}
