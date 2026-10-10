import type { PortfolioData, ProjectItem, TechSkill, EducationItem } from '../types/portfolio';

export type ResumeTemplateId = 'modern' | 'classic' | 'engineering';

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
    id: 'modern',
    name: 'Modern ATS (Clean & Scannable)',
    description: 'High-clarity sans-serif layout with subtle accent rules. Optimised for ATS parsers and technical screeners.',
  },
  {
    id: 'classic',
    name: 'Classic Executive (Standard Corporate)',
    description: 'Traditional centered header with classic horizontal rules. Preferred for formal corporate and academic roles.',
  },
  {
    id: 'engineering',
    name: 'Engineering Technical (Metric-Oriented)',
    description: 'Structured layout emphasizing CAD/hardware tools, verified system metrics, and technical competencies.',
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

  const fontScale =
    fontSize === 'compact'
      ? { base: '9.5pt', h1: '19pt', h2: '11.5pt', h3: '10pt', lead: '9pt', gap: '8px' }
      : fontSize === 'large'
      ? { base: '11pt', h1: '23pt', h2: '13pt', h3: '11.5pt', lead: '10.5pt', gap: '14px' }
      : { base: '10pt', h1: '21pt', h2: '12pt', h3: '10.5pt', lead: '9.5pt', gap: '11px' };

  const fontFamily =
    template === 'classic'
      ? `'Times New Roman', Times, 'Georgia', serif`
      : `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

  // Contact items array
  const contacts: string[] = [];
  if (portfolio.email) {
    contacts.push(`<span>${escapeHtml(portfolio.email)}</span>`);
  }
  if (portfolio.phone) {
    contacts.push(`<span>${escapeHtml(portfolio.phone)}</span>`);
  }
  if (portfolio.location) {
    contacts.push(`<span>${escapeHtml(portfolio.location)}</span>`);
  }
  if (portfolio.linkedin) {
    const cleanLink = portfolio.linkedin.replace(/^https?:\/\/(www\.)?/, '');
    contacts.push(`<span>${escapeHtml(cleanLink)}</span>`);
  }
  if (portfolio.github) {
    const cleanGit = portfolio.github.replace(/^https?:\/\/(www\.)?/, '');
    contacts.push(`<span>${escapeHtml(cleanGit)}</span>`);
  }

  // Skills grouped
  const skillGroups = groupSkillsByCategory(portfolio.skills || []);

  // Header styles per template
  const isCentered = template === 'classic';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(portfolio.name)} - Resume</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: ${fontFamily};
      font-size: ${fontScale.base};
      line-height: 1.45;
      color: #111827;
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
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
      border-bottom: 2px solid ${accentColor};
      margin-bottom: ${fontScale.gap};
    }
    .name {
      font-size: ${fontScale.h1};
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #0f172a;
      text-transform: uppercase;
      margin: 0 0 4px 0;
    }
    .target-role {
      font-size: ${fontScale.h3};
      font-weight: 600;
      color: ${accentColor};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 6px 0;
    }
    .contact-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: ${isCentered ? 'center' : 'flex-start'};
      gap: 6px 14px;
      font-size: ${fontScale.lead};
      color: #475569;
    }
    .contact-row span:not(:last-child):after {
      content: " •";
      margin-left: 10px;
      color: #94a3b8;
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
      color: ${accentColor};
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 3px;
      margin: 0 0 8px 0;
      page-break-after: avoid;
      break-after: avoid;
    }
    .entry {
      margin-bottom: 9px;
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
      color: #64748b;
      font-weight: 500;
      white-space: nowrap;
    }
    .entry-badge {
      display: inline-block;
      font-size: 8pt;
      padding: 1px 6px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      margin-left: 6px;
      font-weight: 600;
      color: #475569;
    }
    ul.bullets {
      margin: 3px 0 6px 0;
      padding-left: 18px;
    }
    ul.bullets li {
      margin-bottom: 3px;
      color: #334155;
    }
    .skills-grid {
      display: table;
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    .skills-row {
      display: table-row;
    }
    .skills-label {
      display: table-cell;
      font-weight: 700;
      width: 28%;
      padding: 2px 8px 3px 0;
      color: #1e293b;
      vertical-align: top;
      white-space: nowrap;
    }
    .skills-list {
      display: table-cell;
      padding: 2px 0 3px 0;
      color: #334155;
      vertical-align: top;
    }
    .summary-text {
      color: #334155;
      margin: 0;
      text-align: justify;
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
      <h1 class="name">${escapeHtml(portfolio.name)}</h1>
      <div class="target-role">${escapeHtml(portfolio.targetRole || portfolio.tagline || portfolio.role)}</div>
      <div class="contact-row">
        ${contacts.join('\n        ')}
      </div>
    </header>

    ${
      showSummary && (portfolio.fullBio || portfolio.shortBio)
        ? `<!-- Professional Summary -->
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary-text">${escapeHtml(portfolio.fullBio || portfolio.shortBio)}</p>
    </section>`
        : ''
    }

    ${
      showSkills && Object.keys(skillGroups).length > 0
        ? `<!-- Technical & Core Skills -->
    <section class="section">
      <h2 class="section-title">Technical Competencies</h2>
      <div class="skills-grid">
        ${Object.entries(skillGroups)
          .map(
            ([cat, list]) => `
        <div class="skills-row">
          <div class="skills-label">${escapeHtml(cat)}:</div>
          <div class="skills-list">${escapeHtml(list.join(', '))}</div>
        </div>`
          )
          .join('')}
      </div>
    </section>`
        : ''
    }

    ${(() => {
      const expList = portfolio.experiences || (portfolio as any).experience || [];
      if (!showExperience || expList.length === 0) return '';
      return `<!-- Professional Experience & Training -->
    <section class="section">
      <h2 class="section-title">Professional Experience & Training</h2>
      ${expList
        .map(
          (exp: any) => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <span class="entry-title">${escapeHtml(exp.role || exp.title)}</span>
            <span class="entry-subtitle"> — ${escapeHtml(exp.company)}</span>
          </div>
          <span class="entry-date">${escapeHtml(exp.period)}</span>
        </div>
        ${exp.description ? `<p style="margin: 2px 0 4px 0; color: #475569;">${escapeHtml(exp.description)}</p>` : ''}
        ${
          (exp.highlights && exp.highlights.length > 0 ? exp.highlights : exp.points) &&
          (exp.highlights || exp.points).length > 0
            ? `<ul class="bullets">
          ${(exp.highlights || exp.points).map((h: string) => `<li>${escapeHtml(h)}</li>`).join('\n          ')}
        </ul>`
            : ''
        }
      </div>`
        )
        .join('')}
    </section>`;
    })()}

    ${
      showEducation && portfolio.education && portfolio.education.length > 0
        ? `<!-- Education -->
    <section class="section">
      <h2 class="section-title">Education</h2>
      ${portfolio.education
        .map(
          (edu: EducationItem) => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <span class="entry-title">${escapeHtml(edu.degree)}</span>
            <span class="entry-subtitle"> — ${escapeHtml(edu.institution)}</span>
            ${edu.score ? `<span class="entry-badge">${escapeHtml(edu.score)}</span>` : ''}
          </div>
          <span class="entry-date">${escapeHtml(edu.period)}</span>
        </div>
      </div>`
        )
        .join('')}
    </section>`
        : ''
    }

    ${
      showProjects && portfolio.projects && portfolio.projects.length > 0
        ? `<!-- Technical Projects -->
    <section class="section">
      <h2 class="section-title">Technical Projects</h2>
      ${portfolio.projects
        .map(
          (proj: ProjectItem) => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <span class="entry-title">${escapeHtml(proj.title)}</span>
            ${proj.role ? `<span class="entry-subtitle"> (${escapeHtml(proj.role)})</span>` : ''}
            ${proj.isAiIdea ? '<span class="entry-badge" style="color: #7c3aed; background: #f5f3ff;">Proposed Concept</span>' : ''}
          </div>
          ${proj.date ? `<span class="entry-date">${escapeHtml(proj.date)}</span>` : ''}
        </div>
        <ul class="bullets">
          <li>${escapeHtml(proj.description)}</li>
          ${
            proj.metrics
              ? `<li><strong>Outcome / Key Metric:</strong> ${escapeHtml(proj.metrics)}</li>`
              : ''
          }
          ${
            proj.tags && proj.tags.length > 0
              ? `<li><strong>Technologies:</strong> ${escapeHtml(proj.tags.join(', '))}</li>`
              : ''
          }
        </ul>
      </div>`
        )
        .join('')}
    </section>`
        : ''
    }

    ${
      showCertifications && portfolio.certifications && portfolio.certifications.length > 0
        ? `<!-- Certifications & Credentials -->
    <section class="section">
      <h2 class="section-title">Certifications & Credentials</h2>
      <ul class="bullets">
        ${portfolio.certifications
          .map(
            (c) =>
              `<li><strong>${escapeHtml(c.name)}</strong> — ${escapeHtml(c.issuer)}${c.date ? ` (${escapeHtml(c.date)})` : ''}</li>`
          )
          .join('\n        ')}
      </ul>
    </section>`
        : ''
    }

    ${
      showPublications && portfolio.publications && portfolio.publications.length > 0
        ? `<!-- Publications & Research -->
    <section class="section">
      <h2 class="section-title">Publications & Research</h2>
      <ul class="bullets">
        ${portfolio.publications
          .map(
            (pb) => {
              const datePart = pb.date ? ` (${escapeHtml(pb.date)})` : '';
              const awardPart = pb.award ? ` [${escapeHtml(pb.award)}]` : '';
              return `<li>"${escapeHtml(pb.title)}" — <em>${escapeHtml(pb.publisher)}</em>${datePart}${awardPart}</li>`;
            }
          )
          .join('\n        ')}
      </ul>
    </section>`
        : ''
    }
  </div>
</body>
</html>`;
}

/**
 * Generate Structured ATS Plaintext for FlowCV / Direct Portals
 */
export function generateResumePlainText(portfolio: PortfolioData): string {
  const lines: string[] = [];

  lines.push(portfolio.name.toUpperCase());
  lines.push(portfolio.targetRole || portfolio.tagline || portfolio.role.toUpperCase());
  lines.push('------------------------------------------------------------');

  const contacts: string[] = [];
  if (portfolio.email) contacts.push(`Email: ${portfolio.email}`);
  if (portfolio.phone) contacts.push(`Phone: ${portfolio.phone}`);
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

  if (portfolio.projects && portfolio.projects.length > 0) {
    lines.push('TECHNICAL PROJECTS');
    lines.push('============================================================');
    for (const proj of portfolio.projects) {
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

  lines.push(`# ${portfolio.name}`);
  lines.push(`**${portfolio.targetRole || portfolio.tagline || portfolio.role}**\n`);

  const contacts: string[] = [];
  if (portfolio.email) contacts.push(`[${portfolio.email}](mailto:${portfolio.email})`);
  if (portfolio.phone) contacts.push(portfolio.phone);
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

  if (portfolio.projects && portfolio.projects.length > 0) {
    lines.push('## Technical Projects');
    for (const proj of portfolio.projects) {
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
