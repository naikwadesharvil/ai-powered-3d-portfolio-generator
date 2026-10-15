import type { PortfolioData, ProjectItem, TechSkill, EducationItem } from '../types/portfolio';

export type ResumeTemplateId = 'classic' | 'modern' | 'compact' | 'engineering';

export interface ResumeRenderOptions {
  template?: ResumeTemplateId;
  accentColor?: string;
  fontSize?: 'compact' | 'standard' | 'large';
  showSummary?: boolean;
  showSkills?: boolean;
  showExperience?: boolean;
  showEducation?: boolean;
  showProjects?: boolean;
  showCertifications?: boolean;
  showPublications?: boolean;
}

export const RESUME_TEMPLATES: { id: ResumeTemplateId; name: string; description: string }[] = [
  {
    id: 'classic',
    name: 'Classic ATS (Single Column)',
    description: 'Clean single-column layout, standard headings, no tables/icons/images. 100% scannable by ATS parsers.',
  },
  {
    id: 'modern',
    name: 'Modern (Theme Accent)',
    description: 'Contemporary sans-serif typography with accent color styling derived from theme tokens.',
  },
  {
    id: 'compact',
    name: 'Compact (Dense One-Page)',
    description: 'Dense, space-optimized layout with 10mm margins engineered to fit comprehensive profiles onto 1 page.',
  },
];

export const RESUME_ACCENT_COLORS = [
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Slate Charcoal', hex: '#1f2937' },
  { name: 'Emerald Teal', hex: '#0f766e' },
  { name: 'Deep Crimson', hex: '#991b1b' },
  { name: 'Steel Indigo', hex: '#3730a3' },
];

/**
 * Detect placeholder text such as "add a metric here", "e.g.,", "TODO" that must never appear in an exported resume.
 * Returns an array of descriptive messages for each detected placeholder.
 */
export function detectResumePlaceholders(portfolio: PortfolioData): string[] {
  const issues: string[] = [];
  const placeholderRegexes = [
    /add a metric here/i,
    /add a metric/i,
    /insert metric/i,
    /metric here/i,
    /\be\.g\.,?/i,
    /\btodo\b/i,
    /\btbd\b/i,
    /\bfixme\b/i,
    /\bplaceholder\b/i,
    /\[(?:Company|Role|Metric|Project|Degree|Institution|Your Name)\]/i,
    /\bxyz\b/i,
  ];

  const scanText = (val: string | undefined | null, field: string) => {
    if (!val || typeof val !== 'string') return;
    for (const rx of placeholderRegexes) {
      if (rx.test(val)) {
        issues.push(`${field}: contains placeholder "${val.trim().substring(0, 50)}"`);
        break;
      }
    }
  };

  scanText(portfolio.name, 'Full Name');
  scanText(portfolio.targetRole, 'Target Role');
  scanText(portfolio.tagline, 'Tagline');
  scanText(portfolio.role, 'Role');
  scanText(portfolio.shortBio, 'Short Bio');
  scanText(portfolio.fullBio, 'Full Bio');

  portfolio.projects?.forEach((proj, idx) => {
    const pTitle = proj.title || `Project #${idx + 1}`;
    scanText(proj.title, `Project (${pTitle}) Title`);
    scanText(proj.description, `Project (${pTitle}) Description`);
    scanText(proj.metrics, `Project (${pTitle}) Metrics`);
  });

  const expList = portfolio.experiences || (portfolio as any).experience || [];
  expList.forEach((exp: any, idx: number) => {
    const expName = `${exp.role || exp.title || 'Role'} at ${exp.company || 'Company'} #${idx + 1}`;
    scanText(exp.role || exp.title, `Experience (${expName}) Role`);
    scanText(exp.company, `Experience (${expName}) Company`);
    scanText(exp.description, `Experience (${expName}) Description`);
    const bullets = (exp.highlights && exp.highlights.length > 0 ? exp.highlights : exp.points) || [];
    bullets.forEach((b: string, bIdx: number) => {
      scanText(b, `Experience (${expName}) Bullet #${bIdx + 1}`);
    });
  });

  portfolio.education?.forEach((edu, idx) => {
    const eduName = `${edu.degree || 'Degree'} at ${edu.institution || 'School'} #${idx + 1}`;
    scanText(edu.degree, `Education (${eduName}) Degree`);
    scanText(edu.institution, `Education (${eduName}) Institution`);
  });

  portfolio.certifications?.forEach((cert, idx) => {
    scanText(cert.name, `Certification #${idx + 1} Name`);
    scanText(cert.issuer, `Certification #${idx + 1} Issuer`);
  });

  portfolio.publications?.forEach((pub, idx) => {
    scanText(pub.title, `Publication #${idx + 1} Title`);
    scanText(pub.publisher, `Publication #${idx + 1} Publisher`);
  });

  return issues;
}

/**
 * Clean and escape HTML text to prevent XSS and formatting breaks
 */
function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Group skills by category for clean scannable display
 */
function groupSkillsByCategory(skills: TechSkill[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const s of skills) {
    const cat = s.category || 'Core Competencies';
    if (!groups[cat]) groups[cat] = [];
    if (!groups[cat].includes(s.name)) {
      groups[cat].push(s.name);
    }
  }
  return groups;
}

/**
 * Generate standard ATS-friendly HTML document
 */
export function generateResumeHtml(
  portfolio: PortfolioData,
  options: ResumeRenderOptions = {}
): string {
  const {
    template = 'modern',
    accentColor = '#1e3a8a',
    fontSize = 'standard',
    showSummary = true,
    showSkills = true,
    showExperience = true,
    showEducation = true,
    showProjects = true,
    showCertifications = true,
    showPublications = true,
  } = options;

  const isClassic = template === 'classic';
  const isCompact = template === 'compact';

  // Resolved accent color (Classic is strictly neutral dark for ATS parsers)
  const resolvedAccent = isClassic ? '#111827' : (accentColor || '#1e3a8a');

  const fontScale =
    isCompact || fontSize === 'compact'
      ? { base: '8.8pt', h1: '16.5pt', h2: '10.5pt', h3: '9.4pt', lead: '8.5pt', gap: '5px' }
      : fontSize === 'large'
      ? { base: '11pt', h1: '23pt', h2: '13pt', h3: '11.5pt', lead: '10.5pt', gap: '13px' }
      : { base: '10pt', h1: '21pt', h2: '12pt', h3: '10.5pt', lead: '9.5pt', gap: '10px' };

  const fontFamily = isClassic
    ? `'Times New Roman', Times, 'Georgia', serif`
    : `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

  // Contact items array
  const contacts: string[] = [];
  if (!portfolio.hideEmail && portfolio.email?.trim()) {
    contacts.push(`<span>${escapeHtml(portfolio.email.trim())}</span>`);
  }
  if (!portfolio.hidePhone && portfolio.phone?.trim()) {
    contacts.push(`<span>${escapeHtml(portfolio.phone.trim())}</span>`);
  }
  if (portfolio.location?.trim()) {
    contacts.push(`<span>${escapeHtml(portfolio.location.trim())}</span>`);
  }
  if (portfolio.linkedin?.trim()) {
    const cleanLink = portfolio.linkedin.trim().replace(/^https?:\/\/(www\.)?/, '');
    contacts.push(`<span>${escapeHtml(cleanLink)}</span>`);
  }
  if (portfolio.github?.trim()) {
    const cleanGit = portfolio.github.trim().replace(/^https?:\/\/(www\.)?/, '');
    contacts.push(`<span>${escapeHtml(cleanGit)}</span>`);
  }

  // Skills grouped
  const validSkills = (portfolio.skills || []).filter((s) => s.name?.trim());
  const skillGroups = groupSkillsByCategory(validSkills);

  // Header alignment
  const isCentered = isClassic;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(portfolio.name || 'Candidate')} - Resume</title>
  <style>
    @page {
      size: A4 portrait;
      margin: ${isCompact ? '10mm' : '15mm'};
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: ${fontFamily};
      font-size: ${fontScale.base};
      line-height: ${isCompact ? '1.32' : '1.45'};
      color: #111827;
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
      word-break: break-word;
      overflow-wrap: break-word;
      user-select: text;
    }
    .resume-sheet {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 0;
    }
    .header {
      text-align: ${isCentered ? 'center' : 'left'};
      padding-bottom: ${fontScale.gap};
      border-bottom: ${isClassic ? '1px solid #111827' : `2px solid ${resolvedAccent}`};
      margin-bottom: ${fontScale.gap};
    }
    .name {
      font-size: ${fontScale.h1};
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #0f172a;
      text-transform: uppercase;
      margin: 0 0 3px 0;
    }
    .target-role {
      font-size: ${fontScale.h3};
      font-weight: 600;
      color: ${resolvedAccent};
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin: 0 0 5px 0;
    }
    .contact-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: ${isCentered ? 'center' : 'flex-start'};
      gap: 4px 12px;
      font-size: ${fontScale.lead};
      color: #374151;
    }
    .contact-row span:not(:last-child):after {
      content: " •";
      margin-left: 8px;
      color: #9ca3af;
    }
    .section {
      margin-top: ${fontScale.gap};
      margin-bottom: ${fontScale.gap};
    }
    .section-title {
      font-size: ${fontScale.h2};
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${resolvedAccent};
      border-bottom: ${isClassic ? '1px solid #111827' : `1.5px solid ${resolvedAccent}`};
      padding-bottom: 2px;
      margin: 0 0 ${isCompact ? '5px' : '7px'} 0;
      page-break-after: avoid;
      break-after: avoid;
    }
    .entry {
      margin-bottom: ${isCompact ? '5px' : '8px'};
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    .entry-title {
      font-weight: 700;
      font-size: ${fontScale.h3};
      color: #0f172a;
    }
    .entry-subtitle {
      font-style: italic;
      color: #334155;
      font-size: ${fontScale.base};
    }
    .entry-date {
      font-size: ${fontScale.lead};
      color: #4b5563;
      font-weight: 500;
      white-space: nowrap;
    }
    .entry-badge {
      display: inline-block;
      font-size: 8pt;
      padding: 1px 5px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 3px;
      margin-left: 6px;
      font-weight: 600;
      color: #374151;
    }
    ul.bullets {
      margin: ${isCompact ? '2px 0 4px 0' : '3px 0 5px 0'};
      padding-left: 18px;
    }
    ul.bullets li {
      margin-bottom: ${isCompact ? '1.5px' : '2.5px'};
      color: #1f2937;
    }
    .skills-block {
      margin-top: 3px;
    }
    .skills-row {
      margin-bottom: ${isCompact ? '2px' : '4px'};
      line-height: ${isCompact ? '1.3' : '1.4'};
    }
    .skills-label {
      font-weight: 700;
      color: #111827;
      display: inline;
    }
    .skills-list {
      color: #374151;
      display: inline;
    }
    .summary-text {
      color: #1f2937;
      margin: 0;
      text-align: justify;
      line-height: ${isCompact ? '1.32' : '1.45'};
    }
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="resume-sheet">
    <!-- Header -->
    <header class="header">
      <h1 class="name">${escapeHtml(portfolio.name || 'Candidate')}</h1>
      ${(portfolio.targetRole || portfolio.tagline || portfolio.role) ? `<div class="target-role">${escapeHtml(portfolio.targetRole || portfolio.tagline || portfolio.role)}</div>` : ''}
      ${contacts.length > 0 ? `
      <div class="contact-row">
        ${contacts.join('\n        ')}
      </div>` : ''}
    </header>

    ${
      showSummary && (portfolio.fullBio?.trim() || portfolio.shortBio?.trim())
        ? `<!-- Professional Summary -->
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary-text">${escapeHtml(portfolio.fullBio?.trim() || portfolio.shortBio?.trim())}</p>
    </section>`
        : ''
    }

    ${
      showSkills && Object.keys(skillGroups).length > 0
        ? `<!-- Technical & Core Skills -->
    <section class="section">
      <h2 class="section-title">Technical Competencies</h2>
      <div class="skills-block">
        ${Object.entries(skillGroups)
          .map(
            ([cat, list]) => `
        <div class="skills-row">
          <span class="skills-label">${escapeHtml(cat)}: </span>
          <span class="skills-list">${escapeHtml(list.join(', '))}</span>
        </div>`
          )
          .join('')}
      </div>
    </section>`
        : ''
    }

    ${(() => {
      const expList = (portfolio.experiences || (portfolio as any).experience || []).filter(
        (e: any) => (e.role && e.role.trim()) || (e.company && e.company.trim()) || (e.title && e.title.trim())
      );
      if (!showExperience || expList.length === 0) return '';
      return `<!-- Professional Experience & Training -->
    <section class="section">
      <h2 class="section-title">Professional Experience</h2>
      ${expList
        .map(
          (exp: any) => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <span class="entry-title">${escapeHtml(exp.role || exp.title)}</span>
            ${exp.company?.trim() ? `<span class="entry-subtitle"> — ${escapeHtml(exp.company)}</span>` : ''}
          </div>
          ${exp.period?.trim() ? `<span class="entry-date">${escapeHtml(exp.period)}</span>` : ''}
        </div>
        ${exp.description?.trim() ? `<p style="margin: 2px 0 3px 0; color: #374151;">${escapeHtml(exp.description.trim())}</p>` : ''}
        ${
          (exp.highlights && exp.highlights.length > 0 ? exp.highlights : exp.points) &&
          (exp.highlights || exp.points).some((h: string) => h && h.trim())
            ? `<ul class="bullets">
          ${(exp.highlights || exp.points).filter((h: string) => h && h.trim()).map((h: string) => `<li>${escapeHtml(h)}</li>`).join('\n          ')}
        </ul>`
            : ''
        }
      </div>`
        )
        .join('')}
    </section>`;
    })()}

    ${(() => {
      const eduList = (portfolio.education || []).filter((e: EducationItem) => (e.degree && e.degree.trim()) || (e.institution && e.institution.trim()));
      if (!showEducation || eduList.length === 0) return '';
      return `<!-- Education -->
    <section class="section">
      <h2 class="section-title">Education</h2>
      ${eduList
        .map(
          (edu: EducationItem) => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <span class="entry-title">${escapeHtml(edu.degree)}</span>
            ${edu.institution?.trim() ? `<span class="entry-subtitle"> — ${escapeHtml(edu.institution)}</span>` : ''}
            ${edu.score?.trim() ? (isClassic ? ` <span style="font-size: 8.5pt; color: #4b5563;">(${escapeHtml(edu.score)})</span>` : `<span class="entry-badge">${escapeHtml(edu.score)}</span>`) : ''}
          </div>
          ${edu.period?.trim() ? `<span class="entry-date">${escapeHtml(edu.period)}</span>` : ''}
        </div>
      </div>`
        )
        .join('')}
    </section>`;
    })()}

    ${(() => {
      // Resumes strictly present verified completed projects, never unbuilt AI suggestions
      const projList = (portfolio.projects || []).filter((p: ProjectItem) => p.title && p.title.trim() && !p.isAiIdea);
      if (!showProjects || projList.length === 0) return '';
      return `<!-- Technical Projects -->
    <section class="section">
      <h2 class="section-title">Technical Projects</h2>
      ${projList
        .map(
          (proj: ProjectItem) => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <span class="entry-title">${escapeHtml(proj.title)}</span>
            ${proj.role?.trim() ? `<span class="entry-subtitle"> (${escapeHtml(proj.role)})</span>` : ''}
          </div>
          ${proj.date?.trim() ? `<span class="entry-date">${escapeHtml(proj.date)}</span>` : ''}
        </div>
        ${proj.description?.trim() || proj.metrics?.trim() || (proj.tags && proj.tags.length > 0) ? `
        <ul class="bullets">
          ${proj.description?.trim() ? `<li>${escapeHtml(proj.description.trim())}</li>` : ''}
          ${
            proj.metrics?.trim()
              ? `<li><strong>Outcome / Key Metric:</strong> ${escapeHtml(proj.metrics.trim())}</li>`
              : ''
          }
          ${
            proj.tags && proj.tags.length > 0
              ? `<li><strong>Technologies:</strong> ${escapeHtml(proj.tags.join(', '))}</li>`
              : ''
          }
        </ul>` : ''}
      </div>`
        )
        .join('')}
    </section>`;
    })()}

    ${(() => {
      const certList = (portfolio.certifications || []).filter((c) => c.name && c.name.trim());
      if (!showCertifications || certList.length === 0) return '';
      return `<!-- Certifications & Credentials -->
    <section class="section">
      <h2 class="section-title">Certifications & Credentials</h2>
      <ul class="bullets">
        ${certList
          .map(
            (c) =>
              `<li><strong>${escapeHtml(c.name)}</strong>${c.issuer?.trim() ? ` — ${escapeHtml(c.issuer)}` : ''}${c.date?.trim() ? ` (${escapeHtml(c.date)})` : ''}</li>`
          )
          .join('\n        ')}
      </ul>
    </section>`;
    })()}

    ${(() => {
      const pubList = (portfolio.publications || []).filter((pb) => pb.title && pb.title.trim());
      if (!showPublications || pubList.length === 0) return '';
      return `<!-- Publications & Research -->
    <section class="section">
      <h2 class="section-title">Publications & Research</h2>
      <ul class="bullets">
        ${pubList
          .map(
            (pb) => {
              const datePart = pb.date?.trim() ? ` (${escapeHtml(pb.date)})` : '';
              const awardPart = pb.award?.trim() ? ` [${escapeHtml(pb.award)}]` : '';
              const pubPart = pb.publisher?.trim() ? ` — <em>${escapeHtml(pb.publisher)}</em>` : '';
              return `<li>"${escapeHtml(pb.title)}"${pubPart}${datePart}${awardPart}</li>`;
            }
          )
          .join('\n        ')}
      </ul>
    </section>`;
    })()}
  </div>
</body>
</html>`;
}

/**
 * Generate Structured ATS Plaintext for FlowCV / Direct Portals
 */
export function generateResumePlainText(portfolio: PortfolioData): string {
  const lines: string[] = [];

  lines.push((portfolio.name || 'Candidate').toUpperCase());
  lines.push(portfolio.targetRole || portfolio.tagline || portfolio.role.toUpperCase());
  lines.push('------------------------------------------------------------');

  const contacts: string[] = [];
  if (!portfolio.hideEmail && portfolio.email) contacts.push(`Email: ${portfolio.email}`);
  if (!portfolio.hidePhone && portfolio.phone) contacts.push(`Phone: ${portfolio.phone}`);
  if (portfolio.location) contacts.push(`Location: ${portfolio.location}`);
  if (portfolio.linkedin) contacts.push(`LinkedIn: ${portfolio.linkedin}`);
  if (portfolio.github) contacts.push(`GitHub: ${portfolio.github}`);
  lines.push(contacts.join(' | '));
  lines.push('');

  if (portfolio.fullBio || portfolio.shortBio) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push('============================================================');
    lines.push(portfolio.fullBio || portfolio.shortBio);
    lines.push('');
  }

  if (portfolio.skills && portfolio.skills.length > 0) {
    lines.push('TECHNICAL COMPETENCIES');
    lines.push('============================================================');
    const grouped = groupSkillsByCategory(portfolio.skills);
    for (const [cat, items] of Object.entries(grouped)) {
      lines.push(`${cat}: ${items.join(', ')}`);
    }
    lines.push('');
  }

  const expList = portfolio.experiences || (portfolio as any).experience || [];
  if (expList.length > 0) {
    lines.push('PROFESSIONAL EXPERIENCE & TRAINING');
    lines.push('============================================================');
    for (const exp of expList) {
      const expRole = exp.role || (exp as any).title || 'Role';
      lines.push(`${expRole.toUpperCase()} — ${exp.company} (${exp.period})`);
      if (exp.description) lines.push(exp.description);
      const expBullets = (exp.highlights && exp.highlights.length > 0 ? exp.highlights : exp.points) || [];
      for (const h of expBullets) {
        lines.push(`• ${h}`);
      }
      lines.push('');
    }
  }

  if (portfolio.education && portfolio.education.length > 0) {
    lines.push('EDUCATION');
    lines.push('============================================================');
    for (const edu of portfolio.education) {
      lines.push(`${edu.degree} — ${edu.institution} (${edu.period})${edu.score ? ` [Score: ${edu.score}]` : ''}`);
    }
    lines.push('');
  }

  const verifiedProjects = (portfolio.projects || []).filter(
    (p: ProjectItem) => p.title && p.title.trim() && !p.isAiIdea
  );
  if (verifiedProjects.length > 0) {
    lines.push('TECHNICAL PROJECTS');
    lines.push('============================================================');
    for (const proj of verifiedProjects) {
      lines.push(`${proj.title.toUpperCase()}${proj.role ? ` (${proj.role})` : ''}${proj.date ? ` — ${proj.date}` : ''}`);
      lines.push(`• Description: ${proj.description}`);
      if (proj.metrics) lines.push(`• Key Metric / Outcome: ${proj.metrics}`);
      if (proj.tags && proj.tags.length > 0) lines.push(`• Tools: ${proj.tags.join(', ')}`);
      lines.push('');
    }
  }

  if (portfolio.certifications && portfolio.certifications.length > 0) {
    lines.push('CERTIFICATIONS & CREDENTIALS');
    lines.push('============================================================');
    for (const c of portfolio.certifications) {
      lines.push(`• ${c.name} — ${c.issuer}${c.date ? ` (${c.date})` : ''}`);
    }
    lines.push('');
  }

  if (portfolio.publications && portfolio.publications.length > 0) {
    lines.push('PUBLICATIONS & RESEARCH');
    lines.push('============================================================');
    for (const pb of portfolio.publications) {
      const datePart = pb.date ? ` (${pb.date})` : '';
      const awardPart = pb.award ? ` [${pb.award}]` : '';
      lines.push(`• "${pb.title}" — ${pb.publisher}${datePart}${awardPart}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate Structured Markdown Resume
 */
export function generateResumeMarkdown(portfolio: PortfolioData): string {
  const lines: string[] = [];

  lines.push(`# ${portfolio.name || 'Candidate'}`);
  lines.push(`**${portfolio.targetRole || portfolio.tagline || portfolio.role}**\n`);

  const contacts: string[] = [];
  if (!portfolio.hideEmail && portfolio.email) contacts.push(`[${portfolio.email}](mailto:${portfolio.email})`);
  if (!portfolio.hidePhone && portfolio.phone) contacts.push(portfolio.phone);
  if (portfolio.location) contacts.push(portfolio.location);
  if (portfolio.linkedin) contacts.push(`[LinkedIn](${portfolio.linkedin})`);
  if (portfolio.github) contacts.push(`[GitHub](${portfolio.github})`);
  lines.push(contacts.join(' | '));
  lines.push('\n---\n');

  if (portfolio.fullBio || portfolio.shortBio) {
    lines.push('## Professional Summary');
    lines.push(portfolio.fullBio || portfolio.shortBio);
    lines.push('');
  }

  if (portfolio.skills && portfolio.skills.length > 0) {
    lines.push('## Technical Competencies');
    const grouped = groupSkillsByCategory(portfolio.skills);
    for (const [cat, items] of Object.entries(grouped)) {
      lines.push(`- **${cat}:** ${items.join(', ')}`);
    }
    lines.push('');
  }

  const expList = portfolio.experiences || (portfolio as any).experience || [];
  if (expList.length > 0) {
    lines.push('## Professional Experience');
    for (const exp of expList) {
      const expRole = exp.role || (exp as any).title || 'Role';
      lines.push(`### ${expRole} — ${exp.company}`);
      lines.push(`*${exp.period}*\n`);
      if (exp.description) lines.push(`${exp.description}\n`);
      const expBullets = (exp.highlights && exp.highlights.length > 0 ? exp.highlights : exp.points) || [];
      for (const h of expBullets) {
        lines.push(`- ${h}`);
      }
      lines.push('');
    }
  }

  if (portfolio.education && portfolio.education.length > 0) {
    lines.push('## Education');
    for (const edu of portfolio.education) {
      lines.push(`- **${edu.degree}** | ${edu.institution} (${edu.period})${edu.score ? ` — *${edu.score}*` : ''}`);
    }
    lines.push('');
  }

  const verifiedProjects = (portfolio.projects || []).filter(
    (p: ProjectItem) => p.title && p.title.trim() && !p.isAiIdea
  );
  if (verifiedProjects.length > 0) {
    lines.push('## Technical Projects');
    for (const proj of verifiedProjects) {
      lines.push(`### ${proj.title}${proj.role ? ` (${proj.role})` : ''}`);
      if (proj.date) lines.push(`*${proj.date}*`);
      lines.push(`- ${proj.description}`);
      if (proj.metrics) lines.push(`- **Outcome:** ${proj.metrics}`);
      if (proj.tags && proj.tags.length > 0) lines.push(`- **Tech Stack:** ${proj.tags.join(', ')}`);
      lines.push('');
    }
  }

  if (portfolio.certifications && portfolio.certifications.length > 0) {
    lines.push('## Certifications');
    for (const c of portfolio.certifications) {
      lines.push(`- **${c.name}** — ${c.issuer}${c.date ? ` (${c.date})` : ''}`);
    }
    lines.push('');
  }

  if (portfolio.publications && portfolio.publications.length > 0) {
    lines.push('## Publications');
    for (const pb of portfolio.publications) {
      lines.push(`- "${pb.title}" — *${pb.publisher}* (${pb.date})${pb.award ? ` [${pb.award}]` : ''}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
