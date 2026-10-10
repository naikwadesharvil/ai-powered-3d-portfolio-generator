import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod.js';
import {
  GeneratePortfolioInputSchema,
  AiStructuredPortfolioOutputSchema,
  type AiStructuredPortfolioOutput,
  RewriteSectionInputSchema,
  RecommendationsInputSchema,
  RecommendationsOutputSchema,
  ChatInputSchema,
} from '../schemas/portfolioSchema.js';
import { z } from 'zod';

export class OpenAiService {
  private static client: OpenAI | null = null;

  public static isOpenAiConfigured(): boolean {
    const key = process.env.OPENAI_API_KEY;
    return !!key && key.trim().length > 0 && !key.includes('your_openai_api_key_here');
  }

  public static getModel(): string {
    return process.env.OPENAI_MODEL || 'gpt-4o';
  }

  private static getClient(): OpenAI {
    if (!this.isOpenAiConfigured()) {
      throw new Error('OPENAI_API_KEY is not configured on the server. Please set it in server/.env');
    }
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 25000, // 25s timeout
        maxRetries: 1,
      });
    }
    return this.client;
  }

  /**
   * Generates tailored portfolio data using OpenAI Structured Outputs (zodResponseFormat)
   * with strict anti-hallucination guards, automatic retry once on failure, and Zod validation.
   */
  public static async generatePortfolio(input: z.infer<typeof GeneratePortfolioInputSchema>): Promise<AiStructuredPortfolioOutput> {
    const client = this.getClient();
    const model = this.getModel();
    const branch = input.branch || input.discipline || 'cs_it';
    const customBranch = input.customBranchName ? ` (${input.customBranchName})` : '';

    const systemPrompt = `You are a world-class portfolio designer, engineering talent strategist, and multi-disciplinary career advisor.
Your task is to structure and synthesize professional portfolio content for a user based strictly on their educational discipline, verified details, and target role.

IMPORTANT MULTI-DISCIPLINARY GUIDELINES:
- Adapt strictly to the user's discipline and terminology:
  * Computer Science / IT / AI / ML: Distributed systems, models, algorithms, clean architecture, DevOps.
  * Mechanical: 3D CAD (SolidWorks, CATIA, AutoCAD), FEA stress analysis (ANSYS), thermal engineering, GD&T, manufacturing tooling, physical mechanical prototypes.
  * Mechatronics & Robotics: Autonomous robotics (ROS), embedded systems (C++, microcontrollers), PLC/SCADA industrial automation, sensor fusion, electromechanical actuators.
  * Electrical & Electronics: Circuit design, PCB layout (Altium, KiCAD), power systems, control systems, MATLAB/Simulink, lab testing instrumentation.
  * Civil Engineering: Structural analysis (ETABS, STAAD.Pro), BIM (Revit), AutoCAD Civil 3D drafting, surveying (Total Station, GIS), construction scheduling, concrete/steel building codes.
  * Chemical: Process simulation (Aspen Plus), chemical plant design, reaction kinetics, heat/mass transfer, HAZOP safety.
  * Automobile: Vehicle dynamics, electric vehicle (EV) powertrain, battery management systems (BMS), suspension kinematics, CFD aerodynamics.
  * Aerospace: Aerodynamics, CFD (Fluent), flight dynamics, propulsion, composite materials, aircraft structures.
  * Sciences & Maths: Scientific research, mathematical modeling, numerical computing, experimental data.
  * Diploma & Polytechnic: Practical technical drafting, workshop fabrication, CNC machining, machinery maintenance, quality inspection.
  * Custom / Other: Adapt rigorously to the user's specific profession.

ROLE DEFINITIONS:
- student: Emphasize foundational education, coursework, academic labs, capstone projects, and eagerness to build real-world physical or digital systems.
- job_seeker: Emphasize ATS-optimized technical summaries, core tools/standards, targeted job title, and verified practical capability.
- professional: Emphasize systems architecture, project leadership, production/site metrics, standards compliance, and enterprise/industry scale.
- freelancer: Emphasize service offerings, end-to-end deliverables, client communication, and turnaround speed.

CRITICAL ANTI-HALLUCINATION & FACT PRESERVATION RULES:
1. NEVER invent facts, fake degrees, institutions, unverified employers, or fabricate numbers.
2. The model may ONLY rewrite, polish, and structure what the user provided.
3. If the user input lacks specific quantifiable metrics or has gaps, DO NOT make up fake numbers. Instead, FLAG GAPS in improvementSuggestions (e.g. "add a metric here for [Project Name]", "add team size or measurable impact").
4. For any newly proposed project recommendations that the user did not specify, set isAiIdea: true.
5. All bullets must be factual rewrites of user input, emphasizing action verbs, engineering tools, and verified achievements.`;

    const userPrompt = `Synthesize a structured portfolio with verified facts for:
Name: ${input.name || 'Anonymous Creator'}
Discipline / Educational Branch: ${branch}${customBranch}
Target Role / Persona: ${input.role || input.persona || 'student'}
Areas of Interest: ${input.interests || 'Core Discipline Engineering'}
User-Provided Skills: ${JSON.stringify(input.skills || [])}
User-Provided Projects: ${JSON.stringify(input.projects || [])}
User-Provided Education: ${JSON.stringify(input.education || [])}
User-Provided Experience: ${JSON.stringify(input.experiences || [])}

Adhere strictly to anti-hallucination rules and flag any metric gaps in improvementSuggestions.`;

    let lastError: Error | null = null;

    // Retry loop: 1 initial attempt + 1 retry on failure
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const parseRunner = (client.chat?.completions?.parse
          ? client.chat.completions.parse.bind(client.chat.completions)
          : (client as any).beta?.chat?.completions?.parse?.bind((client as any).beta.chat.completions));

        if (!parseRunner) {
          throw new Error('OpenAI SDK Structured Outputs (parse method) is not available.');
        }

        const response = await parseRunner({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: zodResponseFormat(AiStructuredPortfolioOutputSchema, 'portfolio_generation'),
          temperature: 0.5,
        });

        const choice = response.choices[0];
        if (!choice) {
          throw new Error('OpenAI returned no choices in response.');
        }

        if (choice.message.refusal) {
          throw new Error(`OpenAI declined to generate portfolio: ${choice.message.refusal}`);
        }

        const parsed = choice.message.parsed;
        if (!parsed) {
          throw new Error('OpenAI returned an empty structured output.');
        }

        // Validate strictly on the server against the Zod schema
        const validated = AiStructuredPortfolioOutputSchema.parse(parsed);
        return validated;
      } catch (err: any) {
        lastError = err;
        console.warn(`[OpenAI Generation] Attempt ${attempt} failed:`, err?.message || err);
        if (attempt === 1) {
          // Brief pause before single retry
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }

    throw new Error(
      `OpenAI Structured Output generation failed after retry: ${lastError?.message || 'Unknown network error'}`
    );
  }

  /**
   * Rewrites an individual section in a chosen tone
   */
  public static async rewriteSection(input: z.infer<typeof RewriteSectionInputSchema>) {
    const client = this.getClient();
    const model = this.getModel();

    const toneDescriptions: Record<string, string> = {
      professional: 'executive, authoritative, measured, and outcome-oriented',
      creative: 'imaginative, evocative, narrative-driven, and distinctive',
      concise: 'crisp, direct, zero fluff, and high information-density',
      impactful: 'results-oriented, highlighting verifiable milestones and engineering excellence',
      technical: 'architecture-focused, using rigorous engineering terminology and system concepts',
    };

    const systemPrompt = `You are an expert copywriter and engineering communicator.
Rewrite the supplied section content in the requested tone: ${input.tone} (${toneDescriptions[input.tone] || ''}).
Target Role: ${input.role || 'general'}.

RULES:
1. Preserve all factual claims and truth without inventing unverified facts.
2. Return a valid JSON object with:
{
  "rewritten": "string or object containing the rewritten content",
  "explanation": "Brief 1-2 sentence explanation of what was changed and why."
}`;

    const userPrompt = `Section: ${input.section}
Original Content: ${typeof input.content === 'object' ? JSON.stringify(input.content) : String(input.content)}
Special Instruction: ${input.instruction || 'None'}`;

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }

    const parsed = JSON.parse(content);
    return parsed;
  }

  /**
   * Generates actionable recommendations and section priority suggestions
   */
  public static async getRecommendations(input: z.infer<typeof RecommendationsInputSchema>) {
    const client = this.getClient();
    const model = this.getModel();

    const systemPrompt = `You are an AI portfolio evaluator and technical recruiter.
Analyze the user's current profile and role (${input.role}).
Identify:
1. Recommended sections that should be visible for this role.
2. Concrete improvement suggestions to maximize recruiter or client conversion.
3. Missing critical information (e.g., specific metrics, links, contact details).
4. Recommended section display priority order.

Output MUST be a valid JSON object:
{
  "recommendedSections": ["about", "projects", "experience", ...],
  "improvementSuggestions": ["Suggestion 1", "Suggestion 2", ...],
  "missingCriticalInfo": ["Item 1", "Item 2", ...],
  "priorityOrder": ["hero", "welcome", "about", "projects", ...]
}`;

    const userPrompt = `Current Profile Data:
${JSON.stringify({
  role: input.role,
  name: input.profile.name,
  tagline: input.profile.tagline,
  targetRole: input.profile.targetRole,
  skillsCount: input.profile.skills?.length || 0,
  projectsCount: input.profile.projects?.length || 0,
  experienceCount: input.profile.experience?.length || 0,
  educationCount: input.profile.education?.length || 0,
  certificationsCount: input.profile.certifications?.length || 0,
  hasPhone: !!input.profile.phone,
  hasEmail: !!input.profile.email,
  hasGithub: !!input.profile.github,
  hasLinkedin: !!input.profile.linkedin,
})}`;

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }

    const parsed = JSON.parse(content);
    return RecommendationsOutputSchema.parse(parsed);
  }

  /**
   * Conversational editing: Modifies structured profile data based on conversational instruction
   */
  public static async chatEdit(input: z.infer<typeof ChatInputSchema>) {
    const client = this.getClient();
    const model = this.getModel();

    const systemPrompt = `You are the AI Co-Pilot for the 3D Portfolio Generator.
The user will give you a natural language editing instruction (e.g., "Make my bio more concise", "Highlight my machine learning projects", "Switch theme to obsidian", "Recommend missing sections").

You must:
1. Interpret the instruction safely.
2. Modify the provided JSON profile according to the instruction.
3. DO NOT invent unverified personal history, credentials, or employers.
4. Return a valid JSON object with:
{
  "updatedProfile": <modified profile object>,
  "explanation": "Clear explanation of exactly what changed",
  "changesSummary": "Concise summary of modified fields (e.g. 'Updated bio and reordered ML projects')",
  "suggestedFollowUp": "Optional follow-up question or suggestion"
}`;

    const historyMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = (input.messageHistory || []).map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        {
          role: 'user',
          content: `Instruction: "${input.instruction}"\n\nCurrent Profile JSON:\n${JSON.stringify(input.currentProfile)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }

    const parsed = JSON.parse(content);
    return parsed;
  }
}
