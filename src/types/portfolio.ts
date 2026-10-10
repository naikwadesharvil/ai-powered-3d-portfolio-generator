export * from './portfolioSchema';
export type {
  Persona as UserRole,
  Discipline as EducationBranch,
  SkillItem as TechSkill,
  Project as ProjectItem,
  Experience as ExperienceItem,
  Education as EducationItem,
  Certification as CertificationItem,
  Publication as PublicationItem,
  ServicePackage as ServicePackage,
  Testimonial as TestimonialItem,
  Telemetry as TelemetryData,
} from './portfolioSchema';

export type SectionKey =
  | 'hero'
  | 'welcome'
  | 'about'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'publications'
  | 'services'
  | 'testimonials'
  | 'contact';

export interface ThemeColors {
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  accentCyan: string;
  accentMagenta: string;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  cardBorder: string;
  glowColor: string;
}
