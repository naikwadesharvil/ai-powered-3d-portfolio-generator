import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { PortfolioData } from '../types/portfolio';
import { getFlattenedSkills } from '../types/portfolioSchema';
import { sanitizeHtmlText, sanitizeUrl } from '../utils/sanitize';

/**
 * Generates and downloads a complete standalone static website ZIP package
 * that works completely offline with inlined CSS, SVGs, and sanitized user data.
 */
export async function downloadStaticHtmlZip(portfolio: PortfolioData): Promise<void> {
  const zip = new JSZip();

  const name = sanitizeHtmlText(portfolio.name || portfolio.profile?.name || 'Engineer');
  const tagline = sanitizeHtmlText(portfolio.tagline || portfolio.profile?.tagline || 'Building innovative systems.');
  const bio = sanitizeHtmlText(portfolio.fullBio || portfolio.summary?.fullBio || portfolio.shortBio || '');
  const email = sanitizeHtmlText(portfolio.email || portfolio.contact?.email || 'contact@example.com');
  const location = sanitizeHtmlText(portfolio.location || portfolio.profile?.location || '');
  const role = sanitizeHtmlText(portfolio.role || portfolio.persona || 'Engineer');
  const discipline = sanitizeHtmlText(portfolio.branchName || portfolio.discipline || 'Engineering');

  const githubUrl = sanitizeUrl(portfolio.github || portfolio.contact?.github);
  const linkedinUrl = sanitizeUrl(portfolio.linkedin || portfolio.contact?.linkedin);
  const twitterUrl = sanitizeUrl(portfolio.twitter || portfolio.contact?.twitter);

  const skills = getFlattenedSkills(portfolio.skills || []);
  const projects = portfolio.projects || [];
  const experience = portfolio.experience || [];
  const education = portfolio.education || [];

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} — ${tagline}</title>
  <style>
    :root {
      --bg-primary: #030508;
      --bg-secondary: #080d17;
      --surface: #0a0f1a;
      --accent-cyan: #00f2fe;
      --accent-magenta: #ff0055;
      --text-primary: #ffffff;
      --text-secondary: rgba(255, 255, 255, 0.7);
      --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-family);
      line-height: 1.6;
      overflow-x: hidden;
    }
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      background: rgba(3, 5, 8, 0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .brand {
      font-weight: 800;
      letter-spacing: 0.1em;
      font-size: 1.1rem;
      color: #fff;
    }
    .brand span { color: var(--accent-cyan); font-size: 0.75rem; font-family: var(--font-mono); margin-left: 6px; }
    nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.8rem;
      font-family: var(--font-mono);
      margin-left: 24px;
      transition: color 0.2s ease;
    }
    nav a:hover { color: var(--accent-cyan); }
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 120px 24px 60px;
      background: radial-gradient(circle at 50% 30%, rgba(0, 242, 254, 0.08) 0%, transparent 70%);
    }
    .status-badge {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--accent-cyan);
      background: rgba(0, 242, 254, 0.1);
      border: 1px solid rgba(0, 242, 254, 0.3);
      padding: 4px 14px;
      border-radius: 9999px;
      margin-bottom: 24px;
      letter-spacing: 0.1em;
    }
    h1 {
      font-size: clamp(2.5rem, 7vw, 5.5rem);
      font-weight: 900;
      line-height: 1.05;
      margin-bottom: 18px;
      text-shadow: 0 0 40px rgba(0, 242, 254, 0.3);
    }
    .tagline {
      font-size: clamp(1.1rem, 2.5vw, 1.6rem);
      color: var(--text-secondary);
      max-width: 800px;
      margin-bottom: 36px;
    }
    .btn-group { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
    .btn-primary {
      background: var(--accent-cyan);
      color: #000;
      font-weight: 700;
      padding: 14px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.9rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 242, 254, 0.4);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-weight: 600;
      padding: 14px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }
    .section-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 100px 24px;
    }
    h2 {
      font-size: 2.4rem;
      font-weight: 800;
      margin-bottom: 36px;
      letter-spacing: -0.02em;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }
    .card {
      background: var(--surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 28px;
      transition: border-color 0.2s, transform 0.2s;
    }
    .card:hover {
      border-color: var(--accent-cyan);
      transform: translateY(-3px);
    }
    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .card-desc {
      color: var(--text-secondary);
      font-size: 0.92rem;
      line-height: 1.6;
      margin-bottom: 18px;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tag {
      background: rgba(0, 242, 254, 0.08);
      border: 1px solid rgba(0, 242, 254, 0.25);
      color: var(--accent-cyan);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      padding: 4px 10px;
      border-radius: 4px;
    }
    footer {
      background: #020306;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 80px 24px;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      ${name} <span>// ${role.toUpperCase()}</span>
    </div>
    <nav>
      <a href="#about">ABOUT</a>
      <a href="#projects">PROJECTS</a>
      ${experience.length > 0 ? '<a href="#experience">EXPERIENCE</a>' : ''}
      <a href="#contact">CONTACT</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="status-badge">PORTFOLIO // ${discipline.toUpperCase()}</div>
      <h1>${name}</h1>
      <p class="tagline">${tagline}</p>
      <div class="btn-group">
        <a href="#projects" class="btn-primary">EXPLORE PROJECTS</a>
        <a href="#contact" class="btn-secondary">CONNECT</a>
      </div>
    </section>

    <section id="about" class="section-container">
      <h2>ABOUT ME</h2>
      <div class="card-grid">
        <div class="card">
          <div class="card-title" style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">BIOGRAPHY</div>
          <p class="card-desc" style="font-size: 1rem; color: #fff;">${bio || 'Experienced engineering professional focused on robust architectures.'}</p>
          ${location ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 14px;">Location: ${location}</p>` : ''}
        </div>
        <div class="card">
          <div class="card-title" style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">CORE CAPABILITIES</div>
          <div class="tags">
            ${skills.map((s) => `<span class="tag">${sanitizeHtmlText(s.name)}</span>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <section id="projects" class="section-container">
      <h2>SELECTED WORKS</h2>
      <div class="card-grid">
        ${projects.map((p) => `
          <div class="card">
            <div style="font-size: 0.72rem; color: var(--accent-cyan); font-family: var(--font-mono); margin-bottom: 8px;">
              ${p.isAiIdea ? 'AI GENERATED INITIATIVE' : 'PROJECT ARCHIVE'}
            </div>
            <div class="card-title">${sanitizeHtmlText(p.title)}</div>
            <p class="card-desc">${sanitizeHtmlText(p.description)}</p>
            ${p.metrics ? `<p style="font-size: 0.82rem; color: var(--accent-magenta); margin-bottom: 14px; font-weight: 600;">Metric: ${sanitizeHtmlText(p.metrics)}</p>` : ''}
            <div class="tags">
              ${(p.tools || p.tags || []).map((t: string) => `<span class="tag">${sanitizeHtmlText(t)}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    ${experience.length > 0 ? `
    <section id="experience" class="section-container">
      <h2>EXPERIENCE & ROLES</h2>
      <div class="card-grid">
        ${experience.map((e) => `
          <div class="card">
            <div style="font-size: 0.72rem; color: var(--accent-cyan); font-family: var(--font-mono); margin-bottom: 8px;">
              ${sanitizeHtmlText(e.period || '')}
            </div>
            <div class="card-title">${sanitizeHtmlText(e.role)} // ${sanitizeHtmlText(e.company)}</div>
            <p class="card-desc">${sanitizeHtmlText(e.description || '')}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${education.length > 0 ? `
    <section id="education" class="section-container">
      <h2>ACADEMIC FOUNDATION</h2>
      <div class="card-grid">
        ${education.map((ed) => `
          <div class="card">
            <div style="font-size: 0.72rem; color: var(--accent-cyan); font-family: var(--font-mono); margin-bottom: 8px;">
              ${sanitizeHtmlText(ed.period || '')} ${ed.score ? `• ${sanitizeHtmlText(ed.score)}` : ''}
            </div>
            <div class="card-title">${sanitizeHtmlText(ed.degree)}</div>
            <p class="card-desc">${sanitizeHtmlText(ed.institution)}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <section id="contact" class="section-container">
      <h2>GET IN TOUCH</h2>
      <div class="card" style="max-width: 600px; margin: 0 auto; text-align: center;">
        <div class="card-title" style="font-size: 1.5rem; margin-bottom: 12px;">Let's Build Together</div>
        <p class="card-desc">Reach out for engineering roles, technical collaboration, or advisory inquiries.</p>
        <a href="mailto:${email}" class="btn-primary" style="display: inline-block; margin: 12px 0 24px;">SEND TRANSMISSION: ${email}</a>
        <div style="display: flex; justify-content: center; gap: 18px; margin-top: 16px;">
          ${githubUrl && githubUrl !== '#' ? `<a href="${githubUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.85rem; font-family: var(--font-mono);">GitHub &rarr;</a>` : ''}
          ${linkedinUrl && linkedinUrl !== '#' ? `<a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.85rem; font-family: var(--font-mono);">LinkedIn &rarr;</a>` : ''}
          ${twitterUrl && twitterUrl !== '#' ? `<a href="${twitterUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.85rem; font-family: var(--font-mono);">Twitter &rarr;</a>` : ''}
        </div>
      </div>
    </section>
  </main>

  <footer>
    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 8px;">
      ${name} &copy; ${new Date().getFullYear()} &mdash; All Rights Reserved.
    </p>
    <p style="color: rgba(255, 255, 255, 0.4); font-size: 0.75rem; font-family: var(--font-mono);">
      Self-Contained Static Offline Package
    </p>
  </footer>
</body>
</html>`;

  const readmeContent = `# ${name} — 3D Portfolio Static Build

This standalone website bundle contains zero external runtime dependencies and can be viewed completely offline.

## How to View Offline
Simply double-click \`index.html\` to open it in any modern browser (Chrome, Edge, Firefox, Safari).

## How to Host Online
Upload \`index.html\` to any static web hosting provider:
- GitHub Pages
- Cloudflare Pages
- Vercel
- Netlify
- AWS S3 / CloudFront

Package generated on: ${new Date().toISOString()}
`;

  zip.file('index.html', htmlContent);
  zip.file('README.txt', readmeContent);
  zip.file('portfolio.json', JSON.stringify(portfolio, null, 2));

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const filename = `${(portfolio.name || 'portfolio').toLowerCase().replace(/\s+/g, '_')}_static_site.zip`;
  saveAs(zipBlob, filename);
}
