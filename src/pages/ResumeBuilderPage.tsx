import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText, Plus, Trash2, Download, Check, Loader2,
  User, Briefcase, GraduationCap, Code2, FolderOpen,
  Award, ChevronDown, ChevronUp, LayoutTemplate, Printer,
} from 'lucide-react';
import { getDataset } from '@/ai/ml/rolePredictor';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  type ResumeData, type ExperienceEntry, type EducationEntry, type ProjectEntry,
  type TemplateId, TEMPLATES, GENERATORS,
} from '@/services/resumeTemplates';

// ── Types ──────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved';

// ── Constants ──────────────────────────────────────────────────

const ROLES = getDataset().map(e => ({ key: e.role, label: e.display }));
function uid() { return Math.random().toString(36).slice(2, 9); }

const DRAFT_KEY = 'resume_builder_draft_v2';

const DEFAULT_DATA: ResumeData = {
  name: '', email: '', phone: '', linkedin: '', github: '',
  summary: '', targetRole: 'software_developer', skills: '',
  experience:  [{ id: uid(), company: '', role: '', duration: '', description: '' }],
  education:   [{ id: uid(), degree: '', institution: '', year: '', grade: '' }],
  projects:    [{ id: uid(), name: '', tech: '', description: '' }],
  certifications: '',
};

// ── Animation variants ─────────────────────────────────────────

const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const listItemVariants = {
  hidden: { opacity: 0, x: -10, scale: 0.98 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:   { opacity: 0, x: 10, scale: 0.97, height: 0, marginTop: 0, transition: { duration: 0.22, ease: 'easeIn' } },
};



// ── Accordion section wrapper ──────────────────────────────────

function AccordionSection({ title, icon: Icon, accent, open, onToggle, children }: {
  title: string; icon: React.ElementType; accent: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <motion.button
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
        onClick={onToggle}
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden="true" />
        </div>
        <span className="font-display font-semibold text-sm text-white/80 flex-1">{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
          <ChevronDown className="h-4 w-4 text-white/30" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2 } }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-1 border-t border-white/[0.05]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────

export function ResumeBuilderPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData]             = useState<ResumeData>(DEFAULT_DATA);
  const [template, setTemplate]     = useState<TemplateId>('modern');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [draftId, setDraftId]       = useState<string | null>(null);
  const saveTimer                   = useRef<ReturnType<typeof setTimeout>>();
  const clearTimer                  = useRef<ReturnType<typeof setTimeout>>();

  const isDemo = !isSupabaseConfigured || !user;

  // ── Load saved draft on mount ────────────────────────────────
  useEffect(() => {
    if (isDemo) {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        try {
          const { formData, templateId } = JSON.parse(raw);
          setData(formData);
          setTemplate(templateId || 'modern');
        } catch { /* corrupted draft, start fresh */ }
      }
    } else {
      supabase
        .from('resume_drafts')
        .select('id, sections, template_id, target_role')
        .eq('user_id', user.id)
        .order('last_saved_at', { ascending: false })
        .limit(1)
        .then(({ data: drafts, error }) => {
          if (error) { console.error('Failed to load draft:', error); return; }
          if (drafts && drafts.length > 0) {
            const draft = drafts[0];
            const sections = draft.sections as any;
            if (sections?.formData) setData(sections.formData);
            if (sections?.templateId) setTemplate(sections.templateId);
            setDraftId(draft.id);
          }
        })
        .catch(err => console.error('Draft load error:', err));
    }
  }, []);

  // ── Auto-save: debounced 1.5s after any change ───────────────
  useEffect(() => {
    clearTimeout(saveTimer.current);
    clearTimeout(clearTimer.current);

    const hasContent = data.name || data.email || data.summary || data.skills;
    if (!hasContent) return;

    setSaveStatus('saving');
    saveTimer.current = setTimeout(async () => {
      await persistDraft();
      setSaveStatus('saved');
      clearTimer.current = setTimeout(() => setSaveStatus('idle'), 2500);
    }, 1500);

    return () => { clearTimeout(saveTimer.current); clearTimeout(clearTimer.current); };
  }, [data, template]);

  async function persistDraft() {
    const payload = { formData: data, templateId: template };
    if (isDemo) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } else {
      try {
        if (draftId) {
          const { error } = await supabase.from('resume_drafts').update({
            sections: payload, target_role: data.targetRole,
            title: data.name || 'Untitled',
            last_saved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', draftId);
          if (error) console.error('Draft update failed:', error);
        } else {
          const { data: d, error } = await supabase.from('resume_drafts').insert({
            user_id: user!.id,
            title: data.name || 'Untitled',
            sections: payload,
            target_role: data.targetRole,
          }).select('id').single();
          if (error) console.error('Draft insert failed:', error);
          else if (d) setDraftId(d.id);
        }
      } catch (err) {
        console.error('persistDraft error:', err);
      }
    }
  }

  // ── Field helpers ────────────────────────────────────────────
  const set = (field: keyof ResumeData, value: any) => setData(p => ({ ...p, [field]: value }));

  const addExp = () => set('experience', [...data.experience, { id: uid(), company: '', role: '', duration: '', description: '' }]);
  const delExp = (id: string) => set('experience', data.experience.filter(e => e.id !== id));
  const setExp = (id: string, field: keyof ExperienceEntry, val: string) =>
    set('experience', data.experience.map(e => e.id === id ? { ...e, [field]: val } : e));

  const addEdu = () => set('education', [...data.education, { id: uid(), degree: '', institution: '', year: '', grade: '' }]);
  const delEdu = (id: string) => set('education', data.education.filter(e => e.id !== id));
  const setEdu = (id: string, field: keyof EducationEntry, val: string) =>
    set('education', data.education.map(e => e.id === id ? { ...e, [field]: val } : e));

  const addProj = () => set('projects', [...data.projects, { id: uid(), name: '', tech: '', description: '' }]);
  const delProj = (id: string) => set('projects', data.projects.filter(p => p.id !== id));
  const setProj = (id: string, field: keyof ProjectEntry, val: string) =>
    set('projects', data.projects.map(p => p.id === id ? { ...p, [field]: val } : p));

  // ── Section open state ───────────────────────────────────────
  const [open, setOpen] = useState({ contact: true, summary: true, skills: true, experience: true, projects: false, education: true, certs: false });
  const tog = (k: keyof typeof open) => setOpen(p => ({ ...p, [k]: !p[k] }));

  // ── Export ───────────────────────────────────────────────────
  function handleDownload() {
    const html = GENERATORS[template](data);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `${data.name || 'resume'}.html` });
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Resume downloaded' });
  }

  function handlePrint() {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(GENERATORS[template](data));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <motion.div
      className="w-full min-h-[calc(100vh-56px)] px-6 py-5 bg-background flex flex-col"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-500/15 border border-indigo-500/25">
            <FileText className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white tracking-tight">Resume Builder</h1>
            <p className="font-sans text-xs text-white/40 mt-0.5">Build an ATS-friendly resume · export as HTML or PDF</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Auto-save indicator */}
          <AnimatePresence mode="wait">
            {saveStatus === 'saving' && (
              <motion.div key="saving" initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
                className="flex items-center gap-1.5 font-sans text-xs text-amber-400">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving…
              </motion.div>
            )}
            {saveStatus === 'saved' && (
              <motion.div key="saved" initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
                className="flex items-center gap-1.5 font-sans text-xs text-emerald-400">
                <Check className="h-3 w-3" /> Saved
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 font-sans text-xs rounded-xl">
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button size="sm" onClick={handleDownload}
              className="gap-1.5 font-sans text-xs rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white border-0">
              <Download className="h-3.5 w-3.5" /> Download HTML
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Template picker ── */}
      <motion.div variants={itemVariants} className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <LayoutTemplate className="h-3.5 w-3.5 text-white/30" />
          <span className="font-sans text-xs font-medium text-white/35 uppercase tracking-widest">Template</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEMPLATES.map((t, i) => {
            const selected = template === t.id;
            return (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -2, boxShadow: `0 8px 24px -4px ${t.accent}30` }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTemplate(t.id)}
                className="relative text-left rounded-2xl border p-3.5 transition-colors overflow-hidden"
                style={{
                  borderColor: selected ? `${t.accent}60` : 'rgba(255,255,255,0.07)',
                  background: selected ? `${t.accent}12` : 'rgba(255,255,255,0.02)',
                }}
              >
                {/* Accent bar at top */}
                <div className="h-1 rounded-full mb-3" style={{ background: t.accent, opacity: selected ? 1 : 0.35 }} />

                <p className="font-display font-semibold text-sm text-white/85 leading-tight">{t.name}</p>
                <p className="font-sans text-[11px] text-white/35 mt-0.5 leading-tight">{t.desc}</p>

                {/* Selected checkmark */}
                <AnimatePresence>
                  {selected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'backOut' }}
                      className="absolute top-2.5 right-2.5 w-4.5 h-4.5 rounded-full flex items-center justify-center"
                      style={{ background: t.accent, width: '1.125rem', height: '1.125rem' }}
                    >
                      <Check className="h-2.5 w-2.5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Form + Preview grid ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-5 flex-1 min-w-0">

        {/* Left: Form (40%) */}
        <div className="lg:col-span-2 overflow-y-auto max-h-[calc(100vh-200px)] flex flex-col gap-3 min-w-0 pr-1">

          {/* Target role */}
          <div className="rounded-2xl border border-white/[0.07] p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="font-display text-sm font-semibold text-white/70 mb-2.5">Target Role</p>
            <select
              value={data.targetRole}
              onChange={e => set('targetRole', e.target.value)}
              className="w-full rounded-xl px-3 py-2 font-sans text-sm bg-white/[0.05] border border-white/[0.08] text-white/80 focus:outline-none focus:border-indigo-500/50"
            >
              {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>

          {/* Contact */}
          <AccordionSection title="Contact" icon={User} accent="#6366f1" open={open.contact} onToggle={() => tog('contact')}>
            <div className="space-y-2 pt-1">
              <Input className="font-sans" placeholder="Full Name *" value={data.name} onChange={e => set('name', e.target.value)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input className="font-sans" placeholder="Email *" value={data.email} onChange={e => set('email', e.target.value)} />
                <Input className="font-sans" placeholder="Phone" value={data.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input className="font-sans" placeholder="LinkedIn URL" value={data.linkedin} onChange={e => set('linkedin', e.target.value)} />
                <Input className="font-sans" placeholder="GitHub URL" value={data.github} onChange={e => set('github', e.target.value)} />
              </div>
            </div>
          </AccordionSection>

          {/* Summary */}
          <AccordionSection title="Summary" icon={FileText} accent="#8b5cf6" open={open.summary} onToggle={() => tog('summary')}>
            <Textarea
              className="font-sans text-sm resize-none min-h-[72px] mt-1"
              placeholder="2–3 sentences about your experience, skills, and goals…"
              value={data.summary}
              onChange={e => set('summary', e.target.value)}
            />
          </AccordionSection>

          {/* Skills */}
          <AccordionSection title="Skills" icon={Code2} accent="#10b981" open={open.skills} onToggle={() => tog('skills')}>
            <Textarea
              className="font-mono text-sm resize-none min-h-[56px] mt-1"
              placeholder="React, Node.js, Python, PostgreSQL, AWS, Docker…"
              value={data.skills}
              onChange={e => set('skills', e.target.value)}
            />
            <p className="font-sans text-[11px] text-white/30 mt-1.5">Comma-separated</p>
          </AccordionSection>

          {/* Experience */}
          <AccordionSection title="Experience" icon={Briefcase} accent="#f59e0b" open={open.experience} onToggle={() => tog('experience')}>
            <div className="space-y-4 pt-1">
              <AnimatePresence initial={false}>
                {data.experience.map((exp, i) => (
                  <motion.div key={exp.id} variants={listItemVariants} initial="hidden" animate="visible" exit="exit"
                    className="space-y-2 pt-3 border-t border-white/[0.05] first:border-0 first:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[11px] font-medium text-white/30 uppercase tracking-wider">Entry {i + 1}</span>
                      {data.experience.length > 1 && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => delExp(exp.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/10 text-white/25 hover:text-rose-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input className="font-sans text-sm" placeholder="Job Title *" value={exp.role} onChange={e => setExp(exp.id, 'role', e.target.value)} />
                      <Input className="font-sans text-sm" placeholder="Company *" value={exp.company} onChange={e => setExp(exp.id, 'company', e.target.value)} />
                    </div>
                    <Input className="font-sans text-sm" placeholder="Duration (e.g. Jan 2023 – Present)" value={exp.duration} onChange={e => setExp(exp.id, 'duration', e.target.value)} />
                    <Textarea className="font-sans text-sm resize-none min-h-[72px]"
                      placeholder="• Led development of X using Y, resulting in Z↑&#10;• Collaborated with N engineers to ship…"
                      value={exp.description} onChange={e => setExp(exp.id, 'description', e.target.value)} />
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="sm" onClick={addExp}
                  className="w-full gap-1.5 font-sans text-xs rounded-xl border-white/[0.08] text-white/45 hover:text-white/70">
                  <Plus className="h-3.5 w-3.5" /> Add Experience
                </Button>
              </motion.div>
            </div>
          </AccordionSection>

          {/* Projects */}
          <AccordionSection title="Projects" icon={FolderOpen} accent="#0ea5e9" open={open.projects} onToggle={() => tog('projects')}>
            <div className="space-y-4 pt-1">
              <AnimatePresence initial={false}>
                {data.projects.map((proj, i) => (
                  <motion.div key={proj.id} variants={listItemVariants} initial="hidden" animate="visible" exit="exit"
                    className="space-y-2 pt-3 border-t border-white/[0.05] first:border-0 first:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[11px] font-medium text-white/30 uppercase tracking-wider">Project {i + 1}</span>
                      {data.projects.length > 1 && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => delProj(proj.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/10 text-white/25 hover:text-rose-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input className="font-sans text-sm" placeholder="Project Name *" value={proj.name} onChange={e => setProj(proj.id, 'name', e.target.value)} />
                      <Input className="font-sans text-sm" placeholder="Tech Stack" value={proj.tech} onChange={e => setProj(proj.id, 'tech', e.target.value)} />
                    </div>
                    <Textarea className="font-sans text-sm resize-none min-h-[56px]"
                      placeholder="What you built and the impact it had…"
                      value={proj.description} onChange={e => setProj(proj.id, 'description', e.target.value)} />
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="sm" onClick={addProj}
                  className="w-full gap-1.5 font-sans text-xs rounded-xl border-white/[0.08] text-white/45 hover:text-white/70">
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </Button>
              </motion.div>
            </div>
          </AccordionSection>

          {/* Education */}
          <AccordionSection title="Education" icon={GraduationCap} accent="#6366f1" open={open.education} onToggle={() => tog('education')}>
            <div className="space-y-4 pt-1">
              <AnimatePresence initial={false}>
                {data.education.map((edu, i) => (
                  <motion.div key={edu.id} variants={listItemVariants} initial="hidden" animate="visible" exit="exit"
                    className="space-y-2 pt-3 border-t border-white/[0.05] first:border-0 first:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[11px] font-medium text-white/30 uppercase tracking-wider">Entry {i + 1}</span>
                      {data.education.length > 1 && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => delEdu(edu.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/10 text-white/25 hover:text-rose-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input className="font-sans text-sm" placeholder="Degree / Course *" value={edu.degree} onChange={e => setEdu(edu.id, 'degree', e.target.value)} />
                      <Input className="font-sans text-sm" placeholder="Institution *" value={edu.institution} onChange={e => setEdu(edu.id, 'institution', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input className="font-sans text-sm" placeholder="Year (e.g. 2020–2024)" value={edu.year} onChange={e => setEdu(edu.id, 'year', e.target.value)} />
                      <Input className="font-sans text-sm" placeholder="Grade / CGPA" value={edu.grade} onChange={e => setEdu(edu.id, 'grade', e.target.value)} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="sm" onClick={addEdu}
                  className="w-full gap-1.5 font-sans text-xs rounded-xl border-white/[0.08] text-white/45 hover:text-white/70">
                  <Plus className="h-3.5 w-3.5" /> Add Education
                </Button>
              </motion.div>
            </div>
          </AccordionSection>

          {/* Certifications */}
          <AccordionSection title="Certifications" icon={Award} accent="#ec4899" open={open.certs} onToggle={() => tog('certs')}>
            <Textarea
              className="font-sans text-sm resize-none min-h-[72px] mt-1"
              placeholder={"AWS Solutions Architect\nGoogle Cloud Professional\nCertified Kubernetes Administrator"}
              value={data.certifications}
              onChange={e => set('certifications', e.target.value)}
            />
            <p className="font-sans text-[11px] text-white/30 mt-1.5">One per line</p>
          </AccordionSection>
        </div>

        {/* Right: Preview (60%) */}
        <div className="lg:col-span-3 sticky top-14 lg:top-5 max-h-[calc(100vh-200px)] overflow-hidden flex flex-col rounded-2xl border border-white/[0.07]">
          {/* Preview header */}
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0"
            style={{ background: 'rgba(255,255,255,0.025)' }}>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-sans text-xs font-medium text-white/40 uppercase tracking-widest">Live Preview</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-8 rounded-full" style={{ background: TEMPLATES.find(t => t.id === template)?.accent, opacity: 0.7 }} />
              <span className="font-sans text-[11px] text-white/30 capitalize">{template}</span>
            </div>
          </div>

          {/* Preview iframe-style pane */}
          <div className="flex-1 overflow-auto min-h-[500px] p-4" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <motion.div
              key={template}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-2xl min-h-full"
              dangerouslySetInnerHTML={{ __html: GENERATORS[template](data) }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
