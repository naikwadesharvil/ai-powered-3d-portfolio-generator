import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  BorderStyle,
} from 'docx';
import type { PortfolioData, ProjectItem, EducationItem } from '../types/portfolio';
import type { ResumeRenderOptions } from './resumeGenerator';

/**
 * Group skills by category for clean scannable display
 */
function groupSkillsByCategory(skills: Array<{ name: string; category?: string }>): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const s of skills) {
    if (!s.name?.trim()) continue;
    const cat = s.category?.trim() || 'Core Competencies';
    if (!groups[cat]) groups[cat] = [];
    if (!groups[cat].includes(s.name.trim())) {
      groups[cat].push(s.name.trim());
    }
  }
  return groups;
}

/**
 * Build a standard, valid Microsoft Word (.docx) Document object representing the ATS resume.
 */
export function buildDocxDocument(
  portfolio: PortfolioData,
  options: ResumeRenderOptions = {}
): Document {
  const {
    template = 'modern',
    accentColor = '#1e3a8a',
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

  const fontName = isClassic ? 'Times New Roman' : 'Calibri';
  const rawAccent = isClassic ? '111827' : (accentColor ? accentColor.replace('#', '') : '1E3A8A');
  const accentHex = rawAccent.length === 6 ? rawAccent : '1E3A8A';

  // Margins in twips: 10mm = ~567 twips, 15mm = ~850 twips
  const pageMarginTwips = isCompact ? 567 : 850;

  // Font sizing in half-points (20 half-points = 10pt)
  const bodySize = isCompact ? 18 : 20;
  const h1Size = isCompact ? 32 : 38;
  const h2Size = isCompact ? 22 : 24;
  const subSize = isCompact ? 18 : 20;
  const leadSize = isCompact ? 16 : 18;

  const children: Paragraph[] = [];

  // Helper for Section Headings with bottom border and keepNext to prevent orphaned headings
  const addSectionHeading = (title: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        keepNext: true,
        spacing: { before: isCompact ? 140 : 220, after: isCompact ? 40 : 80 },
        border: {
          bottom: {
            color: accentHex,
            space: 4,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: h2Size,
            color: accentHex,
            font: fontName,
          }),
        ],
      })
    );
  };

  // 1. Header: Name
  children.push(
    new Paragraph({
      alignment: isClassic ? AlignmentType.CENTER : AlignmentType.LEFT,
      keepNext: true,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: (portfolio.name || 'Candidate').toUpperCase(),
          bold: true,
          size: h1Size,
          color: '0F172A',
          font: fontName,
        }),
      ],
    })
  );

  // 2. Header: Target Role
  const roleText = portfolio.targetRole || portfolio.tagline || portfolio.role;
  if (roleText?.trim()) {
    children.push(
      new Paragraph({
        alignment: isClassic ? AlignmentType.CENTER : AlignmentType.LEFT,
        keepNext: true,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: roleText.toUpperCase(),
            bold: true,
            size: subSize,
            color: accentHex,
            font: fontName,
          }),
        ],
      })
    );
  }

  // 3. Header: Contact Details
  const contactParts: string[] = [];
  if (portfolio.email?.trim()) contactParts.push(portfolio.email.trim());
  if (portfolio.phone?.trim()) contactParts.push(portfolio.phone.trim());
  if (portfolio.location?.trim()) contactParts.push(portfolio.location.trim());
  if (portfolio.linkedin?.trim()) {
    contactParts.push(portfolio.linkedin.trim().replace(/^https?:\/\/(www\.)?/, ''));
  }
  if (portfolio.github?.trim()) {
    contactParts.push(portfolio.github.trim().replace(/^https?:\/\/(www\.)?/, ''));
  }

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: isClassic ? AlignmentType.CENTER : AlignmentType.LEFT,
        keepNext: true,
        spacing: { after: isCompact ? 100 : 160 },
        border: isClassic
          ? {
              bottom: {
                color: '111827',
                space: 4,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            }
          : undefined,
        children: [
          new TextRun({
            text: contactParts.join('  •  '),
            size: leadSize,
            color: '475569',
            font: fontName,
          }),
        ],
      })
    );
  }

  // 4. Professional Summary (Omitted if empty)
  const summaryText = portfolio.fullBio?.trim() || portfolio.shortBio?.trim();
  if (showSummary && summaryText) {
    addSectionHeading('Professional Summary');
    children.push(
      new Paragraph({
        keepLines: true,
        spacing: { after: isCompact ? 80 : 120, line: 240 },
        children: [
          new TextRun({
            text: summaryText,
            size: bodySize,
            color: '1F2937',
            font: fontName,
          }),
        ],
      })
    );
  }

  // 5. Technical Competencies (Omitted if empty)
  const skillGroups = groupSkillsByCategory(portfolio.skills || []);
  if (showSkills && Object.keys(skillGroups).length > 0) {
    addSectionHeading('Technical Competencies');
    for (const [cat, skills] of Object.entries(skillGroups)) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          keepLines: true,
          spacing: { after: isCompact ? 30 : 50 },
          children: [
            new TextRun({
              text: `${cat}: `,
              bold: true,
              size: bodySize,
              color: '0F172A',
              font: fontName,
            }),
            new TextRun({
              text: skills.join(', '),
              size: bodySize,
              color: '374151',
              font: fontName,
            }),
          ],
        })
      );
    }
  }

  // 6. Professional Experience (Omitted if empty)
  const expList = (portfolio.experiences || (portfolio as any).experience || []).filter(
    (e: any) => (e.role && e.role.trim()) || (e.company && e.company.trim()) || (e.title && e.title.trim())
  );
  if (showExperience && expList.length > 0) {
    addSectionHeading('Professional Experience');
    for (const exp of expList) {
      const expRole = exp.role?.trim() || (exp as any).title?.trim() || 'Role';
      const company = exp.company?.trim() ? ` — ${exp.company.trim()}` : '';
      const period = exp.period?.trim() ? ` (${exp.period.trim()})` : '';

      children.push(
        new Paragraph({
          keepNext: true,
          keepLines: true,
          spacing: { before: isCompact ? 60 : 100, after: 30 },
          children: [
            new TextRun({
              text: expRole,
              bold: true,
              size: subSize,
              color: '0F172A',
              font: fontName,
            }),
            new TextRun({
              text: `${company}${period}`,
              italics: true,
              size: bodySize,
              color: '334155',
              font: fontName,
            }),
          ],
        })
      );

      if (exp.description?.trim()) {
        children.push(
          new Paragraph({
            keepLines: true,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: exp.description.trim(),
                size: bodySize,
                color: '475569',
                font: fontName,
              }),
            ],
          })
        );
      }

      const expBullets = (
        (exp.highlights && exp.highlights.length > 0 ? exp.highlights : exp.points) || []
      ).filter((h: string) => h && h.trim());

      for (const h of expBullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            keepLines: true,
            spacing: { after: isCompact ? 25 : 45 },
            children: [
              new TextRun({
                text: h.trim(),
                size: bodySize,
                color: '1F2937',
                font: fontName,
              }),
            ],
          })
        );
      }
    }
  }

  // 7. Education (Omitted if empty)
  const eduList = (portfolio.education || []).filter(
    (e: EducationItem) => (e.degree && e.degree.trim()) || (e.institution && e.institution.trim())
  );
  if (showEducation && eduList.length > 0) {
    addSectionHeading('Education');
    for (const edu of eduList) {
      const degree = edu.degree?.trim() || 'Degree';
      const inst = edu.institution?.trim() ? ` — ${edu.institution.trim()}` : '';
      const period = edu.period?.trim() ? ` (${edu.period.trim()})` : '';
      const score = edu.score?.trim() ? ` [Score: ${edu.score.trim()}]` : '';

      children.push(
        new Paragraph({
          keepNext: true,
          keepLines: true,
          spacing: { before: isCompact ? 40 : 70, after: 30 },
          children: [
            new TextRun({
              text: degree,
              bold: true,
              size: subSize,
              color: '0F172A',
              font: fontName,
            }),
            new TextRun({
              text: `${inst}${period}${score}`,
              size: bodySize,
              color: '334155',
              font: fontName,
            }),
          ],
        })
      );
    }
  }

  // 8. Technical Projects (Omitted if empty)
  const projList = (portfolio.projects || []).filter(
    (p: ProjectItem) => p.title && p.title.trim()
  );
  if (showProjects && projList.length > 0) {
    addSectionHeading('Technical Projects');
    for (const proj of projList) {
      const pTitle = proj.title.trim();
      const pRole = proj.role?.trim() ? ` (${proj.role.trim()})` : '';
      const pDate = proj.date?.trim() ? ` — ${proj.date.trim()}` : '';

      children.push(
        new Paragraph({
          keepNext: true,
          keepLines: true,
          spacing: { before: isCompact ? 60 : 90, after: 30 },
          children: [
            new TextRun({
              text: pTitle,
              bold: true,
              size: subSize,
              color: '0F172A',
              font: fontName,
            }),
            new TextRun({
              text: `${pRole}${pDate}`,
              italics: true,
              size: bodySize,
              color: '475569',
              font: fontName,
            }),
          ],
        })
      );

      if (proj.description?.trim()) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            keepLines: true,
            spacing: { after: isCompact ? 25 : 40 },
            children: [
              new TextRun({
                text: proj.description.trim(),
                size: bodySize,
                color: '1F2937',
                font: fontName,
              }),
            ],
          })
        );
      }

      if (proj.metrics?.trim()) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            keepLines: true,
            spacing: { after: isCompact ? 25 : 40 },
            children: [
              new TextRun({
                text: 'Key Metric / Outcome: ',
                bold: true,
                size: bodySize,
                color: '0F172A',
                font: fontName,
              }),
              new TextRun({
                text: proj.metrics.trim(),
                size: bodySize,
                color: '1F2937',
                font: fontName,
              }),
            ],
          })
        );
      }

      if (proj.tags && proj.tags.length > 0) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            keepLines: true,
            spacing: { after: isCompact ? 25 : 40 },
            children: [
              new TextRun({
                text: 'Technologies: ',
                bold: true,
                size: bodySize,
                color: '0F172A',
                font: fontName,
              }),
              new TextRun({
                text: proj.tags.join(', '),
                size: bodySize,
                color: '374151',
                font: fontName,
              }),
            ],
          })
        );
      }
    }
  }

  // 9. Certifications (Omitted if empty)
  const certList = (portfolio.certifications || []).filter((c) => c.name && c.name.trim());
  if (showCertifications && certList.length > 0) {
    addSectionHeading('Certifications & Credentials');
    for (const c of certList) {
      const issuer = c.issuer?.trim() ? ` — ${c.issuer.trim()}` : '';
      const datePart = c.date?.trim() ? ` (${c.date.trim()})` : '';

      children.push(
        new Paragraph({
          bullet: { level: 0 },
          keepLines: true,
          spacing: { after: isCompact ? 25 : 45 },
          children: [
            new TextRun({
              text: c.name.trim(),
              bold: true,
              size: bodySize,
              color: '0F172A',
              font: fontName,
            }),
            new TextRun({
              text: `${issuer}${datePart}`,
              size: bodySize,
              color: '374151',
              font: fontName,
            }),
          ],
        })
      );
    }
  }

  // 10. Publications (Omitted if empty)
  const pubList = (portfolio.publications || []).filter((pb) => pb.title && pb.title.trim());
  if (showPublications && pubList.length > 0) {
    addSectionHeading('Publications & Research');
    for (const pb of pubList) {
      const pubName = pb.publisher?.trim() ? ` — ${pb.publisher.trim()}` : '';
      const datePart = pb.date?.trim() ? ` (${pb.date.trim()})` : '';
      const awardPart = pb.award?.trim() ? ` [${pb.award.trim()}]` : '';

      children.push(
        new Paragraph({
          bullet: { level: 0 },
          keepLines: true,
          spacing: { after: isCompact ? 25 : 45 },
          children: [
            new TextRun({
              text: `"${pb.title.trim()}"`,
              bold: true,
              size: bodySize,
              color: '0F172A',
              font: fontName,
            }),
            new TextRun({
              text: `${pubName}${datePart}${awardPart}`,
              italics: true,
              size: bodySize,
              color: '374151',
              font: fontName,
            }),
          ],
        })
      );
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: pageMarginTwips,
              bottom: pageMarginTwips,
              left: pageMarginTwips,
              right: pageMarginTwips,
            },
          },
        },
        children,
      },
    ],
  });
}

/**
 * Generate a Blob for browser downloads using the docx library.
 */
export async function generateDocxBlob(
  portfolio: PortfolioData,
  options: ResumeRenderOptions = {}
): Promise<Blob> {
  const doc = buildDocxDocument(portfolio, options);
  return Packer.toBlob(doc);
}

/**
 * Generate a Buffer for server environments or testing using the docx library.
 */
export async function generateDocxBuffer(
  portfolio: PortfolioData,
  options: ResumeRenderOptions = {}
): Promise<Buffer> {
  const doc = buildDocxDocument(portfolio, options);
  return Packer.toBuffer(doc);
}
