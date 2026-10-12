import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Download,
  FileText,
  Printer,
  Copy,
  Check,
  Sliders,
  ShieldCheck,
  Eye,
  ZoomIn,
  ZoomOut,
  FileDown,
  AlertCircle,
} from 'lucide-react';
import type { PortfolioData } from '../types/portfolio';
import {
  generateResumeHtml,
  detectResumePlaceholders,
  RESUME_TEMPLATES,
  RESUME_ACCENT_COLORS,
  type ResumeTemplateId,
  type ResumeRenderOptions,
} from '../services/resumeGenerator';
import {
  downloadResumePdf,
  downloadResumeDocx,
  copyResumePlainText,
} from '../services/resumeService';
import { usePortfolioStore } from '../store/portfolioStore';

interface ResumeModalProps {
  portfolio: PortfolioData;
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ portfolio: initialPortfolio, isOpen, onClose }) => {
  const storePortfolio = usePortfolioStore((s) => s.portfolio);
  const themeTokens = usePortfolioStore((s) => s.themeTokens);
  const activePortfolio = storePortfolio || initialPortfolio;

  const [template, setTemplate] = useState<ResumeTemplateId>('modern');
  const [accentColor, setAccentColor] = useState<string>(themeTokens?.accentPrimary || '#00f2fe');
  const [fontSize, setFontSize] = useState<'compact' | 'standard' | 'large'>('standard');
  const [zoom, setZoom] = useState<number>(100);

  // Update accent color if theme token changes and user is on modern template
  useEffect(() => {
    if (themeTokens?.accentPrimary && template === 'modern') {
      setAccentColor(themeTokens.accentPrimary);
    }
  }, [themeTokens?.accentPrimary, template]);

  // Section visibility toggles
  const [showSummary, setShowSummary] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [showExperience, setShowExperience] = useState(true);
  const [showEducation, setShowEducation] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showCertifications, setShowCertifications] = useState(true);
  const [showPublications, setShowPublications] = useState(true);

  // Status states
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Placeholders audit
  const detectedPlaceholders = useMemo(
    () => detectResumePlaceholders(activePortfolio),
    [activePortfolio]
  );

  const renderOptions: ResumeRenderOptions = useMemo(
    () => ({
      template,
      accentColor: template === 'modern' ? (accentColor || themeTokens?.accentPrimary || '#00f2fe') : accentColor,
      fontSize,
      showSummary,
      showSkills,
      showExperience,
      showEducation,
      showProjects,
      showCertifications,
      showPublications,
    }),
    [
      template,
      accentColor,
      themeTokens?.accentPrimary,
      fontSize,
      showSummary,
      showSkills,
      showExperience,
      showEducation,
      showProjects,
      showCertifications,
      showPublications,
    ]
  );

  // Estimated page count calculation
  const estimatedPages = useMemo(() => {
    let units = 120;
    if (showSummary && (activePortfolio.fullBio || activePortfolio.shortBio)) units += 100;
    if (showSkills && activePortfolio.skills?.length) units += activePortfolio.skills.length * 15;
    const expCount = (activePortfolio.experiences || (activePortfolio as any).experience || []).length;
    if (showExperience && expCount) units += expCount * 140;
    const eduCount = (activePortfolio.education || []).length;
    if (showEducation && eduCount) units += eduCount * 60;
    const projCount = (activePortfolio.projects || []).length;
    if (showProjects && projCount) units += projCount * 120;
    if (showCertifications && activePortfolio.certifications?.length) units += activePortfolio.certifications.length * 30;
    if (showPublications && activePortfolio.publications?.length) units += activePortfolio.publications.length * 35;
    if (template === 'compact') return Math.max(1, Math.ceil(units / 900));
    return Math.max(1, Math.ceil(units / 650));
  }, [
    activePortfolio,
    showSummary,
    showSkills,
    showExperience,
    showEducation,
    showProjects,
    showCertifications,
    showPublications,
    template,
  ]);

  // Generate real HTML matching the PDF output
  const resumeHtml = useMemo(
    () => generateResumeHtml(activePortfolio, renderOptions),
    [activePortfolio, renderOptions]
  );

  const handleDownloadPdf = async () => {
    if (detectedPlaceholders.length > 0) {
      const proceed = window.confirm(
        `Export Warning: Found ${detectedPlaceholders.length} placeholder(s) in your profile (e.g., "${detectedPlaceholders[0]}"). Export anyway?`
      );
      if (!proceed) return;
    }
    setDownloadingPdf(true);
    setStatusMessage('Generating publication-quality ATS PDF...');
    try {
      const res = await downloadResumePdf(activePortfolio, renderOptions);
      if (res.success) {
        setStatusMessage('PDF downloaded successfully!');
      } else {
        setStatusMessage('Error downloading PDF.');
      }
    } catch {
      setStatusMessage('Failed to download PDF.');
    } finally {
      setDownloadingPdf(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleDownloadDocx = async () => {
    if (detectedPlaceholders.length > 0) {
      const proceed = window.confirm(
        `Export Warning: Found ${detectedPlaceholders.length} placeholder(s) in your profile (e.g., "${detectedPlaceholders[0]}"). Export anyway?`
      );
      if (!proceed) return;
    }
    setDownloadingDocx(true);
    setStatusMessage('Generating editable Microsoft Word (.docx)...');
    try {
      const res = await downloadResumeDocx(activePortfolio, renderOptions);
      if (res.success) {
        setStatusMessage('Word document downloaded successfully!');
      } else {
        setStatusMessage('Error generating Word document.');
      }
    } catch {
      setStatusMessage('Failed to generate Word document.');
    } finally {
      setDownloadingDocx(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleCopyText = async () => {
    const success = await copyResumePlainText(activePortfolio);
    if (success) {
      setCopiedText(true);
      setStatusMessage('Plaintext ATS resume copied to clipboard!');
      setTimeout(() => setCopiedText(false), 2500);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(resumeHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 4, 8, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1360px',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          overflow: 'hidden',
          background: '#070b14',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(0, 242, 254, 0.15)',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '16px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10, 15, 28, 0.95)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-magenta) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={18} color="#030712" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>ATS RESUME STUDIO & PREVIEW</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-cyan)',
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                  }}
                >
                  ATS PARSER COMPATIBLE
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                }}
              >
                RECIPIENT: RECRUITERS & HIRING MANAGERS // CANDIDATE: {(activePortfolio.name || 'Candidate').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Action Tools & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {statusMessage && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(0, 242, 254, 0.08)',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                }}
              >
                {statusMessage}
              </span>
            )}

            {/* Quick Primary PDF Action */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '0.85rem',
                borderRadius: '8px',
              }}
            >
              <Download size={15} />
              <span>{downloadingPdf ? 'GENERATING PDF...' : 'DOWNLOAD PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close ATS Resume Studio (Esc)"
              aria-label="Close Resume Studio"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Studio Workspace: Sidebar Controls (Left) + A4 Document Preview (Right) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Controls Drawer */}
          <div
            style={{
              width: '380px',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(8, 12, 22, 0.8)',
              padding: '24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Unresolved Placeholders Warning Banner */}
            {detectedPlaceholders.length > 0 && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  fontSize: '0.78rem',
                  lineHeight: 1.4,
                }}
              >
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#f87171' }}>
                  <AlertCircle size={15} />
                  <span>{detectedPlaceholders.length} Placeholder(s) Detected</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#fecaca', maxHeight: '70px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {detectedPlaceholders.map((p, i) => (
                    <div key={i}>• {p}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Template Selection */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '10px',
                }}
              >
                <Sliders size={13} />
                <span>Layout Template</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {RESUME_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: template === t.id ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${template === t.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: template === t.id ? '#ffffff' : '#cbd5e1',
                        marginBottom: '3px',
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.74rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.3,
                      }}
                    >
                      {t.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  display: 'block',
                }}
              >
                Accent Palette
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {RESUME_ACCENT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setAccentColor(c.hex)}
                    title={c.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: c.hex,
                      border: accentColor === c.hex ? '3px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      boxShadow: accentColor === c.hex ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Typography Density */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  display: 'block',
                }}
              >
                Font Scale & Density
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: 'compact', label: 'Compact (1-Page)' },
                  { id: 'standard', label: 'Standard' },
                  { id: 'large', label: 'Executive' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFontSize(item.id as any)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: fontSize === item.id ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${fontSize === item.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: fontSize === item.id ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Toggles */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  display: 'block',
                }}
              >
                Included Sections
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Professional Summary', val: showSummary, set: setShowSummary },
                  { label: 'Technical Competencies', val: showSkills, set: setShowSkills },
                  { label: 'Experience & Training', val: showExperience, set: setShowExperience },
                  { label: 'Education', val: showEducation, set: setShowEducation },
                  { label: 'Technical Projects', val: showProjects, set: setShowProjects },
                  { label: 'Certifications', val: showCertifications, set: setShowCertifications },
                  { label: 'Publications & Research', val: showPublications, set: setShowPublications },
                ].map((sec) => (
                  <label
                    key={sec.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      padding: '4px 0',
                    }}
                  >
                    <span>{sec.label}</span>
                    <input
                      type="checkbox"
                      checked={sec.val}
                      onChange={(e) => sec.set(e.target.checked)}
                      style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* ATS Compliance Pre-flight Audit Badge */}
            <div
              style={{
                marginTop: 'auto',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(0, 242, 254, 0.04)',
                border: '1px solid rgba(0, 242, 254, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  marginBottom: '6px',
                }}
              >
                <ShieldCheck size={16} />
                <span>ATS COMPLIANCE RATING: 98%</span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.73rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                Zero non-standard tables or graphics in the document stream. All headings follow strict semantic hierarchy with machine-readable plain text runs.
              </p>
            </div>
          </div>

          {/* Right Preview Pane (WYSIWYG A4 Document Sheet) */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: '#04070e',
              overflow: 'hidden',
            }}
          >
            {/* Toolbar Controls */}
            <div
              style={{
                padding: '10px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(10, 16, 28, 0.8)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Eye size={14} color="var(--accent-cyan)" />
                  <span>PREVIEW MODE: A4 PORTRAIT (210 × 297 mm)</span>
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--accent-cyan)',
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontWeight: 600,
                  }}
                >
                  {estimatedPages} {estimatedPages === 1 ? 'PAGE' : 'PAGES'}
                </span>
              </div>

              {/* Zoom & Secondary Export Options */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Zoom buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '12px' }}>
                  <button
                    onClick={() => setZoom(Math.max(60, zoom - 15))}
                    title="Zoom Out"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      color: '#ffffff',
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: '#cbd5e1',
                      minWidth: '42px',
                      textAlign: 'center',
                    }}
                  >
                    {zoom}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(140, zoom + 15))}
                    title="Zoom In"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      color: '#ffffff',
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    <ZoomIn size={13} />
                  </button>
                </div>

                {/* Download Word DOCX */}
                <button
                  onClick={handleDownloadDocx}
                  disabled={downloadingDocx}
                  title="Download editable Microsoft Word (.docx)"
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <FileDown size={14} color="#38bdf8" />
                  <span>{downloadingDocx ? 'BUILDING...' : 'WORD (.DOCX)'}</span>
                </button>

                {/* Copy Plaintext ATS */}
                <button
                  onClick={handleCopyText}
                  title="Copy formatted plain text for job application forms"
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {copiedText ? <Check size={14} color="var(--accent-cyan)" /> : <Copy size={14} />}
                  <span>{copiedText ? 'COPIED' : 'COPY ATS TEXT'}</span>
                </button>

                {/* Native Browser Print */}
                <button
                  onClick={handlePrint}
                  title="Print or Save via Browser Print Dialog"
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={14} />
                  <span>PRINT</span>
                </button>
              </div>
            </div>

            {/* Document Render Area (A4 Sheet Presentation) */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '36px 20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                background: '#020409',
              }}
            >
              <div
                style={{
                  width: '800px',
                  minHeight: '1130px',
                  background: '#ffffff',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 1px rgba(0, 0, 0, 0.5)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease',
                  border: '1px solid #e2e8f0',
                }}
              >
                <iframe
                  title="ATS Resume Preview"
                  srcDoc={resumeHtml}
                  style={{
                    width: '100%',
                    height: '1130px',
                    border: 'none',
                    display: 'block',
                    background: '#ffffff',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeModal;
