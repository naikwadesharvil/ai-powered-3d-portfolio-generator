import JSZip from 'jszip';
import type { PortfolioData } from '../types/portfolio';

function escapeXml(unsafe: string | undefined | null): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build a standard, valid Microsoft Word (.docx) file representing the ATS resume.
 */
export async function generateDocxBlob(portfolio: PortfolioData): Promise<Blob> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // 3. word/_rels/document.xml.rels
  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  );

  // 4. word/styles.xml
  zip.file(
    'word/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="21"/> <!-- 10.5 pt -->
        <w:color w:val="222222"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>`
  );

  // 5. word/document.xml
  const paragraphs: string[] = [];

  // Helper functions for Word XML building
  const p = (text: string, bold = false, size = 21, color = '222222', align = 'left', spaceAfter = 100) => `
    <w:p>
      <w:pPr>
        <w:jc w:val="${align}"/>
        <w:spacing w:after="${spaceAfter}" w:line="260" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          ${bold ? '<w:b/>' : ''}
          <w:sz w:val="${size}"/>
          <w:color w:val="${color}"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;

  const heading = (title: string) => `
    <w:p>
      <w:pPr>
        <w:spacing w:before="240" w:after="80"/>
        <w:pBdr>
          <w:bottom w:val="single" w:sz="6" w:space="4" w:color="1E3A8A"/>
        </w:pBdr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="24"/>
          <w:color w:val="1E3A8A"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(title.toUpperCase())}</w:t>
      </w:r>
    </w:p>`;

  const bullet = (text: string, boldPrefix = '') => `
    <w:p>
      <w:pPr>
        <w:ind w:left="360" w:hanging="200"/>
        <w:spacing w:after="60"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:color w:val="475569"/></w:rPr>
        <w:t xml:space="preserve">• </w:t>
      </w:r>
      ${
        boldPrefix
          ? `<w:r>
        <w:rPr><w:b/><w:color w:val="0F172A"/></w:rPr>
        <w:t xml:space="preserve">${escapeXml(boldPrefix)}: </w:t>
      </w:r>`
          : ''
      }
      <w:r>
        <w:rPr><w:color w:val="334155"/></w:rPr>
        <w:t xml:space="preserve">${escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;

  // Title / Name
  paragraphs.push(p(portfolio.name, true, 40, '0F172A', 'left', 40));

  // Target Role
  const roleText = portfolio.targetRole || portfolio.tagline || portfolio.role;
  paragraphs.push(p(roleText, true, 23, '1E3A8A', 'left', 60));

  // Contact Info
  const contacts: string[] = [];
  if (portfolio.email) contacts.push(portfolio.email);
  if (portfolio.phone) contacts.push(portfolio.phone);
  if (portfolio.location) contacts.push(portfolio.location);
  if (portfolio.linkedin) contacts.push(portfolio.linkedin.replace(/^https?:\/\//, ''));
  if (portfolio.github) contacts.push(portfolio.github.replace(/^https?:\/\//, ''));
  paragraphs.push(p(contacts.join(' | '), false, 19, '64748B', 'left', 200));

  // Summary
  if (portfolio.fullBio || portfolio.shortBio) {
    paragraphs.push(heading('Professional Summary'));
    paragraphs.push(p(portfolio.fullBio || portfolio.shortBio, false, 20, '334155', 'left', 120));
  }

  // Skills
  if (portfolio.skills && portfolio.skills.length > 0) {
    paragraphs.push(heading('Technical Competencies'));
    const grouped: Record<string, string[]> = {};
    for (const s of portfolio.skills) {
      const cat = s.category || 'Core';
      if (!grouped[cat]) grouped[cat] = [];
      if (!grouped[cat].includes(s.name)) grouped[cat].push(s.name);
    }
    for (const [cat, skills] of Object.entries(grouped)) {
      paragraphs.push(bullet(skills.join(', '), cat));
    }
  }

  // Experience
  const expList = portfolio.experiences || (portfolio as any).experience || [];
  if (expList.length > 0) {
    paragraphs.push(heading('Professional Experience & Training'));
    for (const exp of expList) {
      const expRole = exp.role || (exp as any).title || 'Role';
      paragraphs.push(p(`${expRole} — ${exp.company} (${exp.period})`, true, 21, '0F172A', 'left', 40));
      if (exp.description) {
        paragraphs.push(p(exp.description, false, 20, '475569', 'left', 40));
      }
      const expBullets = (exp.highlights && exp.highlights.length > 0 ? exp.highlights : exp.points) || [];
      for (const h of expBullets) {
        paragraphs.push(bullet(h));
      }
    }
  }

  // Education
  if (portfolio.education && portfolio.education.length > 0) {
    paragraphs.push(heading('Education'));
    for (const edu of portfolio.education) {
      paragraphs.push(p(`${edu.degree} — ${edu.institution} (${edu.period})${edu.score ? ` [${edu.score}]` : ''}`, true, 21, '0F172A', 'left', 40));
    }
  }

  // Projects
  if (portfolio.projects && portfolio.projects.length > 0) {
    paragraphs.push(heading('Technical Projects'));
    for (const proj of portfolio.projects) {
      paragraphs.push(p(`${proj.title}${proj.role ? ` (${proj.role})` : ''}${proj.date ? ` — ${proj.date}` : ''}`, true, 21, '0F172A', 'left', 40));
      paragraphs.push(bullet(proj.description || ''));
      if (proj.metrics) {
        paragraphs.push(bullet(proj.metrics, 'Outcome / Metric'));
      }
      if (proj.tags && proj.tags.length > 0) {
        paragraphs.push(bullet(proj.tags.join(', '), 'Technologies'));
      }
    }
  }

  // Certifications
  if (portfolio.certifications && portfolio.certifications.length > 0) {
    paragraphs.push(heading('Certifications & Credentials'));
    for (const c of portfolio.certifications) {
      const datePart = c.date ? ` (${c.date})` : '';
      paragraphs.push(bullet(`${c.name} — ${c.issuer}${datePart}`));
    }
  }

  // Publications
  if (portfolio.publications && portfolio.publications.length > 0) {
    paragraphs.push(heading('Publications & Research'));
    for (const pb of portfolio.publications) {
      const datePart = pb.date ? ` (${pb.date})` : '';
      const awardPart = pb.award ? ` [${pb.award}]` : '';
      paragraphs.push(bullet(`"${pb.title}" — ${pb.publisher}${datePart}${awardPart}`));
    }
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.join('\n')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/> <!-- A4: 210mm x 297mm in twips -->
      <w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850"/> <!-- ~15mm margins -->
    </w:sectPr>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
