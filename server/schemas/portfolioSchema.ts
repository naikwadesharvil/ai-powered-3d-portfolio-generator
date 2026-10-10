import { z } from 'zod';
export * from '../../src/types/portfolioSchema.js';
import {
  PersonaSchema,
  DisciplineSchema,
  PortfolioDataSchema,
  AiStructuredPortfolioOutputSchema,
} from '../../src/types/portfolioSchema.js';

export const UserRoleSchema = PersonaSchema;
export const EducationBranchSchema = DisciplineSchema;

export const GeneratePortfolioInputSchema = z.object({
  name: z.string().trim().max(120).default(''),
  branch: z.string().trim().max(120).default('cs_it'),
  customBranchName: z.string().trim().max(120).optional(),
  interests: z.string().trim().max(1000).default(''),
  role: PersonaSchema.default('student'),
  persona: PersonaSchema.optional(),
  discipline: z.string().optional(),
  skills: z.array(z.any()).optional(),
  projects: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  experiences: z.array(z.any()).optional(),
  achievements: z.array(z.any()).optional(),
  currentProfile: z.record(z.string(), z.any()).optional(),
});

export const RewriteToneSchema = z.enum([
  'professional',
  'creative',
  'concise',
  'impactful',
  'technical',
]);

export const RewriteSectionInputSchema = z.object({
  section: z.string().trim().min(1).max(60),
  content: z.any(),
  tone: RewriteToneSchema,
  instruction: z.string().trim().max(600).optional(),
  role: PersonaSchema.optional(),
  persona: PersonaSchema.optional(),
});

export const RecommendationsInputSchema = z.object({
  profile: z.record(z.string(), z.any()),
  role: PersonaSchema.optional(),
  persona: PersonaSchema.optional(),
});

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(2000),
});

export const ChatInputSchema = z.object({
  instruction: z.string().trim().min(1, 'Instruction cannot be empty').max(1000),
  currentProfile: z.record(z.string(), z.any()),
  messageHistory: z.array(ChatMessageSchema).max(20).optional(),
});

export const GeneratedPortfolioOutputSchema = AiStructuredPortfolioOutputSchema;

export const RecommendationsOutputSchema = z.object({
  recommendedSections: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  missingCriticalInfo: z.array(z.string()),
  priorityOrder: z.array(z.string()),
});
