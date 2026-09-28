// Shared resume template generators — used by builder page and export service

export interface ExperienceEntry { id: string; company: string; role: string; duration: string; description: string; }
export interface EducationEntry  { id: string; degree: string; institution: string; year: string; grade: string; }
export interface ProjectEntry    { id: string; name: string; tech: string; description: string; }

export interface ResumeData {
  name: string; email: string; phone: string; linkedin: string; github: string;
  summary: string; targetRole: string; skills: string;
  experience: ExperienceEntry[];
  education:  EducationEntry[];
  projects:   ProjectEntry[];
  certifications: string;
}

export type TemplateId = 'modern' | 'classic' | 'minimal' | 'corporate';

export const TEMPLATES: Array<{ id: TemplateId; name: string; desc: string; accent: string; headerStyle: string }> = [
  { id: 'modern',    name: 'Modern',    desc: 'Indigo accents, skill tags',  accent: '#6366f1', headerStyle: 'blue left-bar'   },
  { id: 'classic',   name: 'Classic',   desc: 'Traditional serif, timeless', accent: '#1e293b', headerStyle: 'bold underline'  },
  { id: 'minimal',   name: 'Minimal',   desc: 'Clean lines, lots of space',  accent: '#94a3b8', headerStyle: 'thin hairlines'  },
  { id: 'corporate', name: 'Corporate', desc: 'Dark header, executive look', accent: '#0f172a', headerStyle: 'dark banner'     },
];

export function generateModern(data: ResumeData): string {
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const certs  = data.certifications.split('\n').map(s => s.trim()).filter(Boolean);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${data.name} — Resume</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Calibri','Arial',sans-serif;font-size:11pt;color:#1a1a1a;background:#fff;padding:32px 40px;max-width:800px;margin:0 auto}h1{font-size:22pt;font-weight:700;color:#0a1628;letter-spacing:-0.5px}
.contact{font-size:9.5pt;color:#475569;margin-top:4px}.contact a{color:#4f46e5;text-decoration:none}
.divider{border:none;border-top:2px solid #6366f1;margin:14px 0 10px}
.section-title{font-size:11pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0a1628;margin-bottom:8px}
.summary{font-size:10.5pt;color:#334155;line-height:1.6;margin-bottom:14px}
.skills-grid{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.skill-tag{background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe;padding:2px 10px;border-radius:12px;font-size:9.5pt;font-weight:500}
.entry{margin-bottom:12px}.entry-header{display:flex;justify-content:space-between;align-items:baseline}
.entry-title{font-weight:700;font-size:10.5pt;color:#0f172a}.entry-sub{font-size:10pt;color:#475569}
.entry-date{font-size:9.5pt;color:#64748b}.entry-desc{font-size:10pt;color:#334155;line-height:1.55;margin-top:3px;white-space:pre-line}
.cert-list{list-style:none}.cert-list li::before{content:"✓ ";color:#6366f1;font-weight:bold}.cert-list li{font-size:10pt;color:#334155;margin-bottom:3px}
@media print{body{padding:20px 28px}}</style></head><body>
<h1>${data.name||'Your Name'}</h1>
<div class="contact">${[data.email&&`<a href="mailto:${data.email}">${data.email}</a>`,data.phone,data.linkedin&&`<a href="${data.linkedin}">LinkedIn</a>`,data.github&&`<a href="${data.github}">GitHub</a>`].filter(Boolean).join(' &nbsp;|&nbsp; ')}</div>
${data.summary?`<hr class="divider"><div class="section-title">Professional Summary</div><div class="summary">${data.summary}</div>`:''}
${skills.length?`<hr class="divider"><div class="section-title">Technical Skills</div><div class="skills-grid">${skills.map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div>`:''}
${data.experience.some(e=>e.company||e.role)?`<hr class="divider"><div class="section-title">Experience</div>${data.experience.filter(e=>e.company||e.role).map(e=>`<div class="entry"><div class="entry-header"><div><span class="entry-title">${e.role||'Role'}</span>${e.company?` &nbsp;—&nbsp; <span class="entry-sub">${e.company}</span>`:''}</div>${e.duration?`<span class="entry-date">${e.duration}</span>`:''}</div>${e.description?`<div class="entry-desc">${e.description}</div>`:''}</div>`).join('')}`:''}
${data.projects.some(p=>p.name)?`<hr class="divider"><div class="section-title">Projects</div>${data.projects.filter(p=>p.name).map(p=>`<div class="entry"><div class="entry-header"><span class="entry-title">${p.name}</span>${p.tech?`<span class="entry-date">${p.tech}</span>`:''}</div>${p.description?`<div class="entry-desc">${p.description}</div>`:''}</div>`).join('')}`:''}
${data.education.some(e=>e.degree||e.institution)?`<hr class="divider"><div class="section-title">Education</div>${data.education.filter(e=>e.degree||e.institution).map(e=>`<div class="entry"><div class="entry-header"><div><span class="entry-title">${e.degree||'Degree'}</span>${e.institution?` &nbsp;—&nbsp; <span class="entry-sub">${e.institution}</span>`:''}</div><span class="entry-date">${[e.year,e.grade].filter(Boolean).join(' · ')}</span></div></div>`).join('')}`:''}
${certs.length?`<hr class="divider"><div class="section-title">Certifications</div><ul class="cert-list">${certs.map(c=>`<li>${c}</li>`).join('')}</ul>`:''}
</body></html>`;
}

export function generateClassic(data: ResumeData): string {
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const certs  = data.certifications.split('\n').map(s => s.trim()).filter(Boolean);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${data.name} — Resume</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Times New Roman','Georgia',serif;font-size:11pt;color:#111;background:#fff;padding:36px 44px;max-width:800px;margin:0 auto}
h1{font-size:20pt;font-weight:700;color:#000;text-align:center;letter-spacing:0.5px}
.contact{font-size:9.5pt;color:#555;margin-top:5px;text-align:center}.contact a{color:#111;text-decoration:none}
.divider{border:none;border-top:1px solid #111;margin:12px 0 8px}
.section-title{font-size:10.5pt;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#000;margin-bottom:7px;border-bottom:1px solid #ccc;padding-bottom:3px}
.summary{font-size:10.5pt;color:#222;line-height:1.65;margin-bottom:12px}
.skills-row{font-size:10pt;color:#333;margin-bottom:12px}
.entry{margin-bottom:11px}.entry-header{display:flex;justify-content:space-between;align-items:baseline}
.entry-title{font-weight:700;font-size:10.5pt;color:#000}.entry-sub{font-style:italic;font-size:10pt;color:#444}
.entry-date{font-size:9.5pt;color:#666}.entry-desc{font-size:10pt;color:#333;line-height:1.55;margin-top:3px;white-space:pre-line}
.cert-list{list-style:disc;padding-left:18px}.cert-list li{font-size:10pt;color:#333;margin-bottom:3px}
@media print{body{padding:22px 30px}}</style></head><body>
<h1>${data.name||'Your Name'}</h1>
<div class="contact">${[data.email&&`<a href="mailto:${data.email}">${data.email}</a>`,data.phone,data.linkedin&&`<a href="${data.linkedin}">LinkedIn</a>`,data.github&&`<a href="${data.github}">GitHub</a>`].filter(Boolean).join(' · ')}</div>
${data.summary?`<hr class="divider"><div class="section-title">Summary</div><div class="summary">${data.summary}</div>`:''}
${skills.length?`<hr class="divider"><div class="section-title">Skills</div><div class="skills-row">${skills.join(' · ')}</div>`:''}
${data.experience.some(e=>e.company||e.role)?`<hr class="divider"><div class="section-title">Experience</div>${data.experience.filter(e=>e.company||e.role).map(e=>`<div class="entry"><div class="entry-header"><div><span class="entry-title">${e.role||'Role'}</span>${e.company?`, <span class="entry-sub">${e.company}</span>`:''}</div>${e.duration?`<span class="entry-date">${e.duration}</span>`:''}</div>${e.description?`<div class="entry-desc">${e.description}</div>`:''}</div>`).join('')}`:''}
${data.projects.some(p=>p.name)?`<hr class="divider"><div class="section-title">Projects</div>${data.projects.filter(p=>p.name).map(p=>`<div class="entry"><div class="entry-header"><span class="entry-title">${p.name}</span>${p.tech?`<span class="entry-date">${p.tech}</span>`:''}</div>${p.description?`<div class="entry-desc">${p.description}</div>`:''}</div>`).join('')}`:''}
${data.education.some(e=>e.degree||e.institution)?`<hr class="divider"><div class="section-title">Education</div>${data.education.filter(e=>e.degree||e.institution).map(e=>`<div class="entry"><div class="entry-header"><div><span class="entry-title">${e.degree||'Degree'}</span>${e.institution?`, <span class="entry-sub">${e.institution}</span>`:''}</div><span class="entry-date">${[e.year,e.grade].filter(Boolean).join(' · ')}</span></div></div>`).join('')}`:''}
${certs.length?`<hr class="divider"><div class="section-title">Certifications</div><ul class="cert-list">${certs.map(c=>`<li>${c}</li>`).join('')}</ul>`:''}
</body></html>`;
}

export function generateMinimal(data: ResumeData): string {
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const certs  = data.certifications.split('\n').map(s => s.trim()).filter(Boolean);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${data.name} — Resume</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Helvetica Neue','Arial',sans-serif;font-size:10.5pt;color:#222;background:#fff;padding:40px 48px;max-width:800px;margin:0 auto}
h1{font-size:18pt;font-weight:300;color:#111;letter-spacing:-0.3px}
.contact{font-size:9pt;color:#888;margin-top:5px}.contact a{color:#555;text-decoration:none}
.divider{border:none;border-top:1px solid #e5e7eb;margin:16px 0 12px}
.section-title{font-size:8pt;font-weight:600;text-transform:uppercase;letter-spacing:2.5px;color:#9ca3af;margin-bottom:10px}
.summary{font-size:10.5pt;color:#374151;line-height:1.7;margin-bottom:14px}
.skills-row{font-size:9.5pt;color:#6b7280;margin-bottom:14px;line-height:1.8}
.entry{margin-bottom:14px}.entry-header{display:flex;justify-content:space-between;align-items:baseline}
.entry-title{font-weight:500;font-size:10.5pt;color:#111}.entry-sub{font-size:10pt;color:#6b7280}
.entry-date{font-size:9pt;color:#9ca3af}.entry-desc{font-size:10pt;color:#4b5563;line-height:1.6;margin-top:4px;white-space:pre-line}
.cert-list{list-style:none}.cert-list li{font-size:10pt;color:#4b5563;margin-bottom:4px;padding-left:12px;position:relative}.cert-list li::before{content:"—";position:absolute;left:0;color:#d1d5db}
@media print{body{padding:24px 32px}}</style></head><body>
<h1>${data.name||'Your Name'}</h1>
<div class="contact">${[data.email&&`<a href="mailto:${data.email}">${data.email}</a>`,data.phone,data.linkedin&&`<a href="${data.linkedin}">LinkedIn</a>`,data.github&&`<a href="${data.github}">GitHub</a>`].filter(Boolean).join('  ·  ')}</div>
${data.summary?`<hr class="divider"><div class="section-title">About</div><div class="summary">${data.summary}</div>`:''}
${skills.length?`<hr class="divider"><div class="section-title">Skills</div><div class="skills-row">${skills.join('  ·  ')}</div>`:''}
${data.experience.some(e=>e.company||e.role)?`<hr class="divider"><div class="section-title">Experience</div>${data.experience.filter(e=>e.company||e.role).map(e=>`<div class="entry"><div class="entry-header"><div><span class="entry-title">${e.role||'Role'}</span>${e.company?` · <span class="entry-sub">${e.company}</span>`:''}</div>${e.duration?`<span class="entry-date">${e.duration}</span>`:''}</div>${e.description?`<div class="entry-desc">${e.description}</div>`:''}</div>`).join('')}`:''}
${data.projects.some(p=>p.name)?`<hr class="divider"><div class="section-title">Projects</div>${data.projects.filter(p=>p.name).map(p=>`<div class="entry"><div class="entry-header"><span class="entry-title">${p.name}</span>${p.tech?`<span class="entry-date">${p.tech}</span>`:''}</div>${p.description?`<div class="entry-desc">${p.description}</div>`:''}</div>`).join('')}`:''}
${data.education.some(e=>e.degree||e.institution)?`<hr class="divider"><div class="section-title">Education</div>${data.education.filter(e=>e.degree||e.institution).map(e=>`<div class="entry"><div class="entry-header"><div><span class="entry-title">${e.degree||'Degree'}</span>${e.institution?` · <span class="entry-sub">${e.institution}</span>`:''}</div><span class="entry-date">${[e.year,e.grade].filter(Boolean).join(' · ')}</span></div></div>`).join('')}`:''}
${certs.length?`<hr class="divider"><div class="section-title">Certifications</div><ul class="cert-list">${certs.map(c=>`<li>${c}</li>`).join('')}</ul>`:''}
</body></html>`;
}

export function generateCorporate(data: ResumeData): string {
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const certs  = data.certifications.split('\n').map(s => s.trim()).filter(Boolean);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${data.name} — Resume</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Calibri','Arial',sans-serif;font-size:10.5pt;color:#1a1a1a;background:#fff;max-width:800px;margin:0 auto}
.header{background:#0f172a;color:#fff;padding:28px 40px 24px}h1{font-size:20pt;font-weight:600;color:#fff;letter-spacing:-0.3px}
.contact{font-size:9pt;color:#94a3b8;margin-top:5px}.contact a{color:#818cf8;text-decoration:none}
.body{padding:24px 40px}
.divider{border:none;border-top:1px solid #e2e8f0;margin:12px 0 10px}
.section-title{font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#0f172a;margin-bottom:8px;display:flex;align-items:center;gap:8px}.section-title::after{content:'';flex:1;height:1px;background:#e2e8f0}
.summary{font-size:10.5pt;color:#334155;line-height:1.6;margin-bottom:12px}
.skills-grid{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px}.skill-tag{background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;padding:2px 10px;border-radius:4px;font-size:9.5pt}
.entry{margin-bottom:11px}.entry-header{display:flex;justify-content:space-between;align-items:baseline}
.entry-title{font-weight:700;font-size:10.5pt;color:#0f172a}.entry-sub{font-size:10pt;color:#475569}
.entry-date{font-size:9pt;color:#64748b;background:#f8fafc;padding:1px 8px;border-radius:4px}
.entry-desc{font-size:10pt;color:#334155;line-height:1.55;margin-top:3px;white-space:pre-line}
.cert-list{list-style:none}.cert-list li::before{content:"▸ ";color:#6366f1}.cert-list li{font-size:10pt;color:#334155;margin-bottom:3px}
@media print{body{} .header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
<div class="header"><h1>${data.name||'Your Name'}</h1>
<div class="contact">${[data.email&&`<a href="mailto:${data.email}">${data.email}</a>`,data.phone,data.linkedin&&`<a href="${data.linkedin}">LinkedIn</a>`,data.github&&`<a href="${data.github}">GitHub</a>`].filter(Boolean).join(' &nbsp;·&nbsp; ')}</div></div>
<div class="body">
${data.summary?`<hr class="divider"><div class="section-title">Profile</div><div class="summary">${data.summary}</div>`:''}
${skills.length?`<hr class="divider"><div class="section-title">Skills</div><div class="skills-grid">${skills.map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div>`:''}
${data.experience.some(e=>e.company||e.role)?`<hr class="divider"><div class="section-title">Experience</div>${data.experience.filter(e=>e.company||e.role).map(e=>`<div class="entry"><div class="entry-header"><div><span class="entry-title">${e.role||'Role'}</span>${e.company?` &nbsp;—&nbsp; <span class="entry-sub">${e.company}</span>`:''}</div>${e.duration?`<span class="entry-date">${e.duration}</span>`:''}</div>${e.description?`<div class="entry-desc">${e.description}</div>`:''}</div>`).join('')}`:''}
${data.projects.some(p=>p.name)?`<hr class="divider"><div class="section-title">Projects</div>${data.projects.filter(p=>p.name).map(p=>`<div class="entry"><div class="entry-header"><span class="entry-title">${p.name}</span>${p.tech?`<span class="entry-date">${p.tech}</span>`:''}</div>${p.description?`<div class="entry-desc">${p.description}</div>`:''}</div>`).join('')}`:''}
${data.education.some(e=>e.degree||e.institution)?`<hr class="divider"><div class="section-title">Education</div>${data.education.filter(e=>e.degree||e.institution).map(e=>`<div class="entry"><div class="entry-header"><div><span class="entry-title">${e.degree||'Degree'}</span>${e.institution?` &nbsp;—&nbsp; <span class="entry-sub">${e.institution}</span>`:''}</div><span class="entry-date">${[e.year,e.grade].filter(Boolean).join(' · ')}</span></div></div>`).join('')}`:''}
${certs.length?`<hr class="divider"><div class="section-title">Certifications</div><ul class="cert-list">${certs.map(c=>`<li>${c}</li>`).join('')}</ul>`:''}
</div></body></html>`;
}

export const GENERATORS: Record<TemplateId, (data: ResumeData) => string> = {
  modern: generateModern, classic: generateClassic,
  minimal: generateMinimal, corporate: generateCorporate,
};
