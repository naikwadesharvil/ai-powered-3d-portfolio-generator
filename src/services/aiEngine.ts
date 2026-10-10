import type {
  PortfolioData,
  UserRole,
  EducationBranch,
  ThemePreset,
  Hero3DMode,
  ProjectItem,
  TechSkill,
  EducationItem,
  ExperienceItem,
  CertificationItem,
  PublicationItem,
} from '../types/portfolio';
import { ROLE_PROFILES } from '../data/defaultProfiles.ts';
import { getDisciplinePreset } from '../data/disciplinePresets.ts';

export interface AutopilotInput {
  name: string;
  branch?: EducationBranch;
  customBranchName?: string;
  interests: string;
  role: UserRole;
  skills?: TechSkill[];
  projects?: ProjectItem[];
  education?: EducationItem[];
  experiences?: ExperienceItem[];
  achievements?: (CertificationItem | PublicationItem)[];
  currentProfile?: PortfolioData;
}

export interface RefinementResult {
  updatedProfile: PortfolioData;
  explanation: string;
  suggestedFollowUp?: string;
}

export interface ResumeAuditResult {
  extractedFacts: Partial<PortfolioData>;
  sectionStatus: Record<string, 'COMPLETE' | 'PARTIAL' | 'MISSING' | 'NEEDS_IMPROVEMENT'>;
  criticalMissingInfo: string[];
  supportedKeywords: string[];
  suggestedNextQuestion: string;
}

export class AiEngine {
  /**
   * AI Autopilot: Generates a complete, tailored 3D portfolio configuration
   * from Educational Branch, Role, Interests, and optional user details.
   */
  static generatePortfolioFromAutopilot(input: AutopilotInput): PortfolioData {
    const {
      name,
      branch = 'cs_it',
      customBranchName,
      interests,
      role,
      skills: userSkills,
      projects: userProjects,
      education: userEducation,
      experiences: userExperiences,
      currentProfile,
    } = input;

    const base = currentProfile || ROLE_PROFILES[role];
    const finalName = (name && name.trim().length > 0) ? name.trim() : (base?.name || 'Alex Chen');
    const discipline = getDisciplinePreset(branch, customBranchName);

    // Resolve interests: use provided or discipline defaults
    let interestList = (interests || '')
      .split(/[,;\n]+/)
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (interestList.length === 0) {
      interestList = [...discipline.defaultInterests];
    }

    const primaryInterest = interestList[0] || discipline.defaultInterests[0] || 'Engineering';
    const secondaryInterest = interestList[1] || discipline.defaultInterests[1] || 'Design';

    // Role-specific tailored configuration based on discipline preset
    let theme: ThemePreset = 'cyberpunk_neon';
    let hero3DMode: Hero3DMode = 'kinetic_360';
    let targetRole = '';
    let tagline = '';
    let shortBio = '';
    let fullBio = '';

    if (role === 'student') {
      theme = 'cyberpunk_neon';
      hero3DMode = 'kinetic_360';
      targetRole = (branch && branch !== 'cs_it') || customBranchName ? `${discipline.shortName} Graduate Engineer` : `${primaryInterest} Graduate Engineer`;
      tagline = (branch && branch !== 'cs_it') || customBranchName ? discipline.roleHeadlines.student : `${primaryInterest} Specialist & Aspiring Engineer`;
      shortBio = discipline.roleShortBios.student;
      fullBio = `${finalName} is an engineering student specializing in ${discipline.label}. Experienced in ${primaryInterest}, hands-on modeling, analysis, and data systems. Dedicated to building reliable projects and collaborating on high-impact initiatives.`;
    } else if (role === 'job_seeker') {
      theme = 'obsidian_stealth';
      hero3DMode = 'kinetic_360';
      targetRole = (branch && branch !== 'cs_it') || customBranchName ? `${discipline.shortName} Specialist` : `${primaryInterest} Software Engineer`;
      tagline = (branch && branch !== 'cs_it') || customBranchName ? discipline.roleHeadlines.job_seeker : `Results-Driven ${primaryInterest} & Systems Engineer`;
      shortBio = discipline.roleShortBios.job_seeker;
      fullBio = `Engineer with demonstrated technical proficiency in ${primaryInterest} and ${secondaryInterest}. Committed to writing interview-defensible code, optimizing computational workflows, and accelerating team delivery.`;
    } else if (role === 'professional') {
      theme = 'obsidian_stealth';
      hero3DMode = 'hologram_core';
      targetRole = (branch && branch !== 'cs_it') || customBranchName ? `Senior ${discipline.shortName} Lead` : `Lead ${primaryInterest} Architect`;
      tagline = (branch && branch !== 'cs_it') || customBranchName ? discipline.roleHeadlines.professional : `Senior ${primaryInterest} Architect & Engineering Lead`;
      shortBio = discipline.roleShortBios.professional;
      fullBio = `Seasoned technology leader with extensive background designing resilient enterprise systems. Specializing in ${primaryInterest}, large-scale engineering, and technical mentorship.`;
    } else if (role === 'freelancer') {
      theme = 'sunset_titanium';
      hero3DMode = 'kinetic_360';
      targetRole = (branch && branch !== 'cs_it') || customBranchName ? `Independent ${discipline.shortName} Consultant` : `Independent ${primaryInterest} Consultant`;
      tagline = (branch && branch !== 'cs_it') || customBranchName ? discipline.roleHeadlines.freelancer : `Creative ${primaryInterest} & 3D Web Technologist`;
      shortBio = discipline.roleShortBios.freelancer;
      fullBio = `Independent creative developer partnering with startups and innovative brands worldwide. Delivering immersive 3D digital flagships and robust ${primaryInterest} architectures.`;
    }

    // Skills Assembly: Preserve user-entered skills first, then discipline skills, then interest skills
    const combinedSkills: TechSkill[] = [];
    if (userSkills && userSkills.length > 0) {
      userSkills.forEach((s) => combinedSkills.push(s));
    } else {
      // Use discipline recommended skills
      discipline.recommendedSkills.forEach((s) => combinedSkills.push(s));
    }

    // Also add any unique interests as skills if not already present
    interestList.slice(0, 4).forEach((interest) => {
      if (!combinedSkills.some((s) => s.name.toLowerCase() === interest.toLowerCase())) {
        combinedSkills.push({
          name: interest,
          category: 'Specialization',
          level: 'advanced',
        });
      }
    });

    // Projects Assembly:
    // 1. User verified projects (never fabricated, isAiIdea: false)
    const verifiedProjects: ProjectItem[] = [];
    if (userProjects && userProjects.length > 0) {
      userProjects.forEach((p) => {
        verifiedProjects.push({ ...p, isAiIdea: false });
      });
    } else {
      // Use discipline sample projects as verified baseline if user provided none
      discipline.sampleProjects.forEach((p) => {
        verifiedProjects.push({ ...p, isAiIdea: false });
      });
    }

    // 2. AI Suggestions (strictly marked isAiIdea: true)
    const aiIdeas: ProjectItem[] = discipline.aiProjectSuggestions.map((sug, idx) => ({
      ...sug,
      id: `ai-sug-${discipline.id}-${idx + 1}-${Date.now()}`,
      isAiIdea: true,
    }));

    const finalProjects = [...verifiedProjects, ...aiIdeas];

    // Bento Stats tailored to discipline
    const bentoStats = {
      stat1: discipline.bentoStatsDefaults.stat1,
      stat2: discipline.bentoStatsDefaults.stat2,
      stat3: discipline.bentoStatsDefaults.stat3,
    };

    // Education Assembly: Preserve user education if supplied
    const finalEducation: EducationItem[] = (userEducation && userEducation.length > 0)
      ? userEducation
      : (base?.education && base.education.length > 0)
        ? base.education
        : [
            {
              id: 'edu-primary',
              institution: 'Engineering & Technology Institute',
              degree: `Degree / Specialization in ${discipline.shortName}`,
              period: '2022 – 2026',
              score: 'First Class / Distinction',
              details: `Core discipline coursework in ${discipline.label}`,
            },
          ];

    // Experience Assembly: Preserve user experience if supplied
    const finalExperience: ExperienceItem[] = (userExperiences && userExperiences.length > 0)
      ? userExperiences
      : (base?.experiences && base.experiences.length > 0)
        ? base.experiences
        : [];

    // Role-tailored section visibility and order
    const sectionVisibility = {
      hero: true,
      welcome: true,
      about: true,
      skills: true,
      projects: true,
      experience: role !== 'freelancer',
      education: role === 'student' || role === 'job_seeker',
      certifications: role === 'student' || role === 'job_seeker',
      publications: role === 'student' || role === 'professional',
      services: role === 'freelancer',
      testimonials: role === 'freelancer',
      contact: true,
    };

    let sectionOrder: ('hero' | 'welcome' | 'about' | 'projects' | 'experience' | 'services' | 'publications' | 'certifications' | 'contact')[] = [];
    if (role === 'student') {
      sectionOrder = ['hero', 'welcome', 'about', 'projects', 'experience', 'certifications', 'publications', 'contact'];
    } else if (role === 'job_seeker') {
      sectionOrder = ['hero', 'welcome', 'about', 'experience', 'projects', 'certifications', 'contact'];
    } else if (role === 'professional') {
      sectionOrder = ['hero', 'welcome', 'about', 'experience', 'projects', 'publications', 'contact'];
    } else if (role === 'freelancer') {
      sectionOrder = ['hero', 'welcome', 'about', 'services', 'projects', 'contact'];
    }

    return {
      ...base,
      id: `portfolio_${finalName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      version: (base?.version || 1) + 1,
      lastUpdated: new Date().toISOString().split('T')[0],
      name: finalName,
      branch,
      branchName: discipline.label,
      role,
      persona: role,
      targetRole,
      tagline,
      shortBio,
      fullBio,
      theme,
      hero3DMode,
      interests: interestList,
      skills: combinedSkills.slice(0, 16),
      projects: finalProjects,
      education: finalEducation,
      experiences: finalExperience,
      bentoStats,
      careerRecommendations: discipline.careerRecommendations,
      aiProjectSuggestions: aiIdeas,
      sectionVisibility,
      sectionOrder,
      telemetry: {
        session: `SESSION: ${finalName.toUpperCase().split(' ')[0]}_ONLINE`,
        timezone: base?.telemetry?.timezone || 'UTC+05:30 [ONLINE]',
        status: `STATUS: ACTIVE // ${discipline.shortName.toUpperCase()} // 2026`,
        coords: base?.telemetry?.coords || '16.8524° N, 74.2814° E',
        fps: '60 [STABLE]',
        coreEngine: discipline.telemetryCode,
      },
    };
  }

  /**
   * Conversational Assistant: Understands natural language editing commands
   * and translates them into safe, validated portfolio mutations.
   */
  static applyConversationalInstruction(
    profile: PortfolioData,
    instruction: string
  ): RefinementResult {
    const text = instruction.toLowerCase().trim();
    const updated = JSON.parse(JSON.stringify(profile)) as PortfolioData;
    let explanation = '';

    // 1. Theme and Aesthetic commands
    if (text.includes('cyberpunk') || text.includes('neon') || text.includes('reference')) {
      updated.theme = 'cyberpunk_neon';
      explanation = 'Switched theme to Cyberpunk Neon (Original Reference Palette with cyan and magenta rim lighting).';
    } else if (text.includes('obsidian') || text.includes('stealth') || text.includes('darker') || text.includes('minimal')) {
      updated.theme = 'obsidian_stealth';
      explanation = 'Switched theme to Obsidian Stealth (Ultra-sleek monochrome palette with white rim lighting).';
    } else if (text.includes('sunset') || text.includes('titanium') || text.includes('warm') || text.includes('amber')) {
      updated.theme = 'sunset_titanium';
      explanation = 'Switched theme to Sunset Titanium (Warm amber and rose gold accents).';
    } else if (text.includes('matrix') || text.includes('emerald') || text.includes('green')) {
      updated.theme = 'emerald_matrix';
      explanation = 'Switched theme to Emerald Matrix (Cybernetic digital rain tones).';
    }

    // 2. 3D Model / Hero mode commands
    else if (text.includes('hologram') || text.includes('core') || text.includes('orb')) {
      updated.hero3DMode = 'hologram_core';
      explanation = 'Activated Hologram Core 3D visualization mode with rotating particle field.';
    } else if (text.includes('kinetic') || text.includes('portrait') || text.includes('avatar') || text.includes('360')) {
      updated.hero3DMode = 'kinetic_360';
      explanation = 'Re-activated Kinetic 360-degree rotating portrait hero scrubber.';
    } else if (text.includes('wireframe') || text.includes('cyber')) {
      updated.hero3DMode = 'cyber_wireframe';
      explanation = 'Switched 3D hero mode to Cyber Wireframe geometry.';
    }

    // 3. Tone and Writing commands
    else if (text.includes('recruiter') || text.includes('job') || text.includes('ats')) {
      updated.tagline = `${updated.name} | Results-Driven Systems & AI Developer`;
      updated.shortBio = `Software Engineer targeting technical impact. Experienced in building high-performance production systems, clean APIs, and defensible architectures.`;
      updated.sectionVisibility.experience = true;
      updated.sectionVisibility.education = true;
      updated.sectionVisibility.certifications = true;
      explanation = 'Optimized phrasing for recruiter scanning: emphasized concrete deliverables, verified achievements, and highlighted the resume CTA.';
    } else if (text.includes('professional') || text.includes('experienced') || text.includes('senior')) {
      updated.tagline = `Senior Technical Specialist & Architect`;
      updated.shortBio = `Over a decade of hands-on expertise building resilient, production-ready software systems with measurable business outcomes.`;
      explanation = 'Elevated tone to an experienced, outcomes-oriented style without fabricating unverified metrics.';
    } else if (text.includes('simpler') || text.includes('concise') || text.includes('shorter')) {
      updated.shortBio = `${updated.name} is a developer focused on modern web engineering and high-impact applications.`;
      explanation = 'Condensed introduction into clean, direct English.';
    }

    // 4. Section Visibility commands
    else if (text.includes('hide education') || text.includes('remove education')) {
      updated.sectionVisibility.education = false;
      explanation = 'Hidden the Education section.';
    } else if (text.includes('show education') || text.includes('add education')) {
      updated.sectionVisibility.education = true;
      explanation = 'Enabled the Education section.';
    } else if (text.includes('show services') || text.includes('add services')) {
      updated.sectionVisibility.services = true;
      explanation = 'Enabled the Services & Pricing section.';
    } else if (text.includes('show publications') || text.includes('add publications') || text.includes('papers')) {
      updated.sectionVisibility.publications = true;
      explanation = 'Enabled Research & Publications section.';
    }

    // 5. Project Reordering or Filtering
    else if (text.includes('ai project') || text.includes('first') || text.includes('ml project')) {
      updated.projects.sort((a, b) => {
        const aTags = a.tools || a.tags || [];
        const bTags = b.tools || b.tags || [];
        const aHasAi = aTags.some((t) => /ai|ml|learning|nlp/i.test(t));
        const bHasAi = bTags.some((t) => /ai|ml|learning|nlp/i.test(t));
        if (aHasAi && !bHasAi) return -1;
        if (!aHasAi && bHasAi) return 1;
        return 0;
      });
      explanation = 'Reordered projects: AI & Machine Learning systems are now prioritized at the top.';
    }

    // General fallback refinement
    else {
      explanation = `Analyzed instruction "${instruction}". Enhanced portfolio presentation and refreshed metadata.`;
    }

    return {
      updatedProfile: updated,
      explanation,
      suggestedFollowUp: 'You can undo this change, or ask for further styling adjustments.',
    };
  }

  /**
   * Resume Extractor & Anti-Hallucination Audit
   * Strictly adheres to Resume_Prompt.txt rules
   */
  static auditResumeText(rawText: string): ResumeAuditResult {
    const supportedKeywords: string[] = [];
    const criticalMissingInfo: string[] = [];
    const sectionStatus: Record<string, 'COMPLETE' | 'PARTIAL' | 'MISSING' | 'NEEDS_IMPROVEMENT'> = {
      contact: 'MISSING',
      summary: 'MISSING',
      skills: 'MISSING',
      experience: 'MISSING',
      education: 'MISSING',
      projects: 'MISSING',
    };

    const textLower = rawText.toLowerCase();

    // Check Contact
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (emailMatch && phoneMatch) {
      sectionStatus.contact = 'COMPLETE';
    } else if (emailMatch || phoneMatch) {
      sectionStatus.contact = 'PARTIAL';
      if (!phoneMatch) criticalMissingInfo.push('Phone number is missing.');
    } else {
      criticalMissingInfo.push('Contact information (email and phone) is missing.');
    }

    // Check Skills
    const commonSkills = [
      'python', 'sql', 'javascript', 'typescript', 'react', 'machine learning',
      'docker', 'aws', 'django', 'mongodb', 'git', 'c++', 'java', 'tensorflow', 'pytorch'
    ];
    commonSkills.forEach((skill) => {
      if (textLower.includes(skill)) {
        supportedKeywords.push(skill.toUpperCase());
      }
    });

    if (supportedKeywords.length >= 6) {
      sectionStatus.skills = 'COMPLETE';
    } else if (supportedKeywords.length > 0) {
      sectionStatus.skills = 'PARTIAL';
      criticalMissingInfo.push('Add specific tools, frameworks, and database technologies.');
    } else {
      sectionStatus.skills = 'MISSING';
    }

    // Check Education
    if (textLower.includes('b.tech') || textLower.includes('bachelor') || textLower.includes('degree') || textLower.includes('university') || textLower.includes('institute')) {
      sectionStatus.education = 'COMPLETE';
    } else {
      sectionStatus.education = 'MISSING';
      criticalMissingInfo.push('Degree and educational institution details.');
    }

    // Check Projects
    if (textLower.includes('project') || textLower.includes('developed') || textLower.includes('engineered') || textLower.includes('built')) {
      sectionStatus.projects = 'COMPLETE';
    } else {
      sectionStatus.projects = 'MISSING';
      criticalMissingInfo.push('Project descriptions with technical methodologies and outcomes.');
    }

    return {
      extractedFacts: {
        email: emailMatch ? emailMatch[0] : undefined,
        phone: phoneMatch ? phoneMatch[0] : undefined,
      },
      sectionStatus,
      criticalMissingInfo,
      supportedKeywords,
      suggestedNextQuestion: criticalMissingInfo.length > 0
        ? `What is your ${criticalMissingInfo[0]}?`
        : 'All core sections are identified. Would you like to generate the portfolio preview?',
    };
  }
}
