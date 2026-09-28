import { MLAnalysisResult } from './mlAnalysis.service';
import { GENERATORS, type TemplateId } from './resumeTemplates';

function scoreColor(s: number): string {
  if (s >= 80) return '#34d399';
  if (s >= 60) return '#818cf8';
  if (s >= 40) return '#fbbf24';
  return '#f87171';
}

function scoreLabel(s: number): string {
  if (s >= 80) return 'Excellent';
  if (s >= 60) return 'Good';
  if (s >= 40) return 'Fair';
  return 'Needs Work';
}

function badge(text: string, bg: string, color: string): string {
  return `<span style="background:${bg};color:${color};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;margin:2px;display:inline-block;letter-spacing:0.02em">${text}</span>`;
}

function skillBadge(skill: string, type: 'matched' | 'missing' | 'partial'): string {
  const styles = {
    matched: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
    missing: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    partial: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  };
  const s = styles[type];
  return `<span style="background:${s.bg};color:${s.color};border:1px solid ${s.border};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;margin:2px;display:inline-block">${skill}</span>`;
}

function progressBar(value: number, color: string): string {
  return `<div style="background:#f1f5f9;border-radius:99px;height:6px;margin:6px 0;overflow:hidden">
    <div style="background:${color};width:${Math.min(value, 100)}%;height:100%;border-radius:99px"></div>
  </div>`;
}

const REPORT_FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
`;

export function generateAnalysisReport(
  mlResult: MLAnalysisResult,
  analysis: any,
  role: string,
  fileName?: string
): string {
  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const roleLabel = role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const totalScore = analysis?.resumeScore?.totalScore ?? 0;
  const cs   = analysis?.resumeScore?.componentScores ?? {};
  const recs: string[] = analysis?.resumeScore?.recommendations ?? [];

  const matchedSkills: string[] = mlResult.matchedSkills ?? [];
  const missingSkills: string[] = mlResult.missingSkills ?? [];
  const partialSkills = mlResult.partialSkills ?? [];
  const extractedSkills: string[] = mlResult.extractedSkills ?? [];
  const jobCompat = (mlResult.jobCompatibility ?? []).slice(0, 8);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume Analysis — ${roleLabel}</title>
  ${REPORT_FONTS}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
      font-size: 14px;
    }
    .page { max-width: 920px; margin: 0 auto; padding: 36px 24px; }

    /* Header */
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%);
      color: white;
      padding: 36px 32px;
      border-radius: 20px;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
    }
    .header::after {
      content: '';
      position: absolute;
      top: -40%;
      right: -10%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
    }
    .header h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
    .header .subtitle { opacity: 0.75; font-size: 13px; font-weight: 400; }
    .meta-row { display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap; }
    .meta-pill {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 99px;
      padding: 4px 14px;
      font-size: 12px;
      font-weight: 500;
    }
    .meta-pill strong { display: block; font-size: 13px; font-weight: 700; }

    /* Sections */
    .section {
      background: white;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 14px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
    }

    /* Score hero */
    .score-hero { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
    .score-ring {
      width: 96px; height: 96px;
      border-radius: 50%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      border: 6px solid;
      flex-shrink: 0;
    }
    .score-num  { font-size: 28px; font-weight: 800; line-height: 1; }
    .score-denom { font-size: 10px; color: #94a3b8; }
    .score-details { flex: 1; }
    .score-grade { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .score-hint  { font-size: 12px; color: #64748b; }

    /* Component grid */
    .component-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 12px; }
    .component-card {
      padding: 14px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #fafafa;
    }
    .component-name  { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .component-score { font-size: 22px; font-weight: 800; margin-top: 2px; }

    /* ML cards */
    .ml-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .ml-card  {
      padding: 16px;
      border-radius: 10px;
      text-align: center;
      border: 1px solid;
    }
    .ml-value { font-size: 26px; font-weight: 800; }
    .ml-name  { font-size: 10px; color: #64748b; margin-top: 3px; font-weight: 500; }

    /* Compat rows */
    .compat-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f8fafc; }
    .compat-row:last-child { border-bottom: none; }
    .compat-role { flex: 1; font-size: 13px; font-weight: 500; }
    .compat-bar  { flex: 2; }
    .compat-pct  { font-size: 13px; font-weight: 700; width: 44px; text-align: right; flex-shrink: 0; }

    /* Rec items */
    .rec-item { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }
    .rec-item:last-child { border-bottom: none; }
    .rec-dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }

    /* Skills */
    .skills-grid { display: flex; flex-wrap: wrap; gap: 4px; }

    /* Footer */
    .footer {
      text-align: center;
      color: #94a3b8;
      font-size: 11px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      line-height: 1.8;
    }

    @media print {
      body { background: white; font-size: 13px; }
      .page { padding: 16px; }
      .section { box-shadow: none; break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <h1>Resume Analysis Report</h1>
    <p class="subtitle">Next Step Career AI — ML-powered resume intelligence</p>
    <div class="meta-row">
      <div class="meta-pill"><strong>${roleLabel}</strong>Target Role</div>
      <div class="meta-pill"><strong>${mlResult.predictedDisplay ?? roleLabel}</strong>Predicted Role</div>
      <div class="meta-pill"><strong>${mlResult.mlConfidence ?? 0}%</strong>ML Confidence</div>
      <div class="meta-pill"><strong>${dateStr}</strong>${timeStr}</div>
      ${fileName ? `<div class="meta-pill"><strong>${fileName}</strong>Resume File</div>` : ''}
    </div>
  </div>

  <!-- Overall Score -->
  <div class="section">
    <div class="section-title">Overall Score</div>
    <div class="score-hero">
      <div class="score-ring" style="border-color:${scoreColor(mlResult.finalScore)};color:${scoreColor(mlResult.finalScore)}">
        <span class="score-num">${mlResult.finalScore}</span>
        <span class="score-denom">/ 100</span>
      </div>
      <div class="score-details">
        <div class="score-grade" style="color:${scoreColor(mlResult.finalScore)}">${scoreLabel(mlResult.finalScore)}</div>
        <div class="score-hint">
          ${mlResult.finalScore >= 80 ? 'Highly competitive for this role.' :
            mlResult.finalScore >= 60 ? 'Good match — a few gaps to close.' :
            mlResult.finalScore >= 40 ? 'Fair match — build key skills.' :
            'Upload a more detailed resume to improve your score.'}
        </div>
        ${progressBar(mlResult.finalScore, scoreColor(mlResult.finalScore))}
        <div style="font-size:12px;color:#94a3b8;margin-top:4px">
          <strong style="color:#475569">${matchedSkills.length}</strong> skills matched ·
          <strong style="color:#475569">${missingSkills.length}</strong> gaps ·
          <strong style="color:#475569">${extractedSkills.length}</strong> total extracted
        </div>
      </div>
    </div>
  </div>

  <!-- ML Breakdown -->
  <div class="section">
    <div class="section-title">ML Score Breakdown</div>
    <div class="ml-grid">
      <div class="ml-card" style="background:#eef2ff;border-color:#c7d2fe">
        <div class="ml-value" style="color:#4338ca">${mlResult.mlScore ?? 0}%</div>
        <div class="ml-name">TF-IDF Score</div>
        ${progressBar(mlResult.mlScore ?? 0, '#4338ca')}
      </div>
      <div class="ml-card" style="background:#fffbeb;border-color:#fde68a">
        <div class="ml-value" style="color:#b45309">${mlResult.fuzzyScore ?? 0}%</div>
        <div class="ml-name">Fuzzy Score</div>
        ${progressBar(mlResult.fuzzyScore ?? 0, '#b45309')}
      </div>
      <div class="ml-card" style="background:#f0fdf4;border-color:#bbf7d0">
        <div class="ml-value" style="color:#15803d">${mlResult.finalScore ?? 0}%</div>
        <div class="ml-name">Final (0.7×ML + 0.3×Fuzzy)</div>
        ${progressBar(mlResult.finalScore ?? 0, '#15803d')}
      </div>
    </div>
  </div>

  ${totalScore > 0 ? `
  <!-- Resume Quality -->
  <div class="section">
    <div class="section-title">Resume Quality Score</div>
    <div class="score-hero">
      <div class="score-ring" style="border-color:${scoreColor(totalScore)};color:${scoreColor(totalScore)}">
        <span class="score-num">${totalScore}</span>
        <span class="score-denom">/ 100</span>
      </div>
      <div class="score-details" style="flex:1">
        <div class="component-grid">
          ${[
            { label: 'Skills',     score: cs.skillsScore ?? 0,     weight: '40%', color: '#4f46e5' },
            { label: 'Projects',   score: cs.projectsScore ?? 0,   weight: '25%', color: '#7c3aed' },
            { label: 'Experience', score: cs.experienceScore ?? 0, weight: '20%', color: '#059669' },
            { label: 'Education',  score: cs.educationScore ?? 0,  weight: '15%', color: '#d97706' },
          ].map(c => `
            <div class="component-card">
              <div class="component-name">${c.label} <span style="color:#cbd5e1">(${c.weight})</span></div>
              <div class="component-score" style="color:${c.color}">${c.score}</div>
              ${progressBar(c.score, c.color)}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Matched Skills -->
  <div class="section">
    <div class="section-title">✓ Matched Skills (${matchedSkills.length})</div>
    <div class="skills-grid">
      ${matchedSkills.map(s => skillBadge(s, 'matched')).join('') || '<span style="color:#94a3b8;font-size:13px">No matched skills detected</span>'}
    </div>
  </div>

  ${partialSkills.length > 0 ? `
  <div class="section">
    <div class="section-title">≈ Partial Matches — Fuzzy Logic (${partialSkills.length})</div>
    <div class="skills-grid">
      ${partialSkills.map((ps: any) => skillBadge(`${ps.skill} (${ps.similarity}%)`, 'partial')).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Missing Skills -->
  <div class="section">
    <div class="section-title">✗ Missing Skills (${missingSkills.length})</div>
    <div class="skills-grid">
      ${missingSkills.map(s => skillBadge(s, 'missing')).join('') || '<span style="color:#94a3b8;font-size:13px">No critical gaps detected</span>'}
    </div>
  </div>

  <!-- Job Compatibility -->
  ${jobCompat.length > 0 ? `
  <div class="section">
    <div class="section-title">Job Role Compatibility</div>
    ${jobCompat.map((jc: any, i: number) => `
      <div class="compat-row">
        <div class="compat-role">
          ${i === 0 ? badge('Best Match', '#ecfdf5', '#059669') + '&nbsp;' : ''}
          ${jc.display}
        </div>
        <div class="compat-bar">${progressBar(jc.score, scoreColor(jc.score))}</div>
        <div class="compat-pct" style="color:${scoreColor(jc.score)}">${jc.score}%</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Recommendations -->
  ${recs.length > 0 ? `
  <div class="section">
    <div class="section-title">Recommendations</div>
    ${recs.map(rec => {
      const isPositive = /excellent|strong|good|great/i.test(rec);
      return `<div class="rec-item">
        <div class="rec-dot" style="background:${isPositive ? '#16a34a' : '#f59e0b'}"></div>
        <div>${rec}</div>
      </div>`;
    }).join('')}
  </div>
  ` : ''}

  <div class="footer">
    Generated by <strong>Next Step Career AI</strong> · ${dateStr} at ${timeStr}<br>
    ML Pipeline: TF-IDF Vectorization + Multinomial Naive Bayes + Fuzzy Matching (Levenshtein + Jaccard)
  </div>
</div>
</body>
</html>`;
}

export function downloadAnalysisReport(
  mlResult: MLAnalysisResult,
  analysis: any,
  role: string,
  fileName?: string
): void {
  const html = generateAnalysisReport(mlResult, analysis, role, fileName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `resume-analysis-${role}-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadLastAnalysisReport(): boolean {
  try {
    const raw  = localStorage.getItem('lastAnalysisResult');
    const role = localStorage.getItem('lastDetectedRole') ?? 'software_developer';
    if (!raw) return false;
    const analysis = JSON.parse(raw);
    const mlResult = analysis?.mlResult;
    if (!mlResult) return false;
    downloadAnalysisReport(mlResult, analysis, role);
    return true;
  } catch { return false; }
}

export function exportAsPDF(
  mlResult: MLAnalysisResult,
  analysis: any,
  role: string,
  fileName?: string
): void {
  const html = generateAnalysisReport(mlResult, analysis, role, fileName);
  const win  = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

export function exportLastAnalysisAsPDF(): boolean {
  try {
    const raw  = localStorage.getItem('lastAnalysisResult');
    const role = localStorage.getItem('lastDetectedRole') ?? 'software_developer';
    if (!raw) return false;
    const analysis = JSON.parse(raw);
    const mlResult = analysis?.mlResult;
    if (!mlResult) return false;
    exportAsPDF(mlResult, analysis, role);
    return true;
  } catch { return false; }
}

/**
 * Export a resume builder draft as a print-ready PDF.
 * Wraps the builder-generated HTML in a full print-optimised document.
 */
export function exportResumeDraftAsPDF(resumeHtml: string, candidateName?: string): void {
  const name = candidateName ?? 'Resume';
  const doc  = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: white;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    @page { size: A4; margin: 12mm 14mm; }
    @media print { html, body { height: auto; } }
  </style>
</head>
<body>${resumeHtml}</body>
</html>`;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(doc);
  win.document.close();
  win.onload = () => {
    setTimeout(() => { win.print(); }, 200);
  };
}

export function exportLastResumeDraftAsPDF(): boolean {
  try {
    const raw = localStorage.getItem('resume_builder_draft_v2');
    if (!raw) return false;
    const draft = JSON.parse(raw);
    const formData = draft?.formData;
    const templateId: TemplateId = draft?.templateId ?? 'modern';
    if (!formData) return false;
    const generator = GENERATORS[templateId] ?? GENERATORS.modern;
    const html = generator(formData);
    exportResumeDraftAsPDF(html, formData.name);
    return true;
  } catch { return false; }
}
