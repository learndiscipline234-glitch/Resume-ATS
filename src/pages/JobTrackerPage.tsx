import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Plus, Trash2, MapPin, DollarSign, Calendar, ChevronRight,
  LayoutGrid, List, Edit2, X, Briefcase, ExternalLink, ArrowRight,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────

interface JobApplication {
  id: string;
  company: string;
  role: string;
  job_url: string | null;
  status: StatusType;
  applied_at: string;
  notes: string | null;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  created_at: string;
}

type StatusType = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

// ── Status config ──────────────────────────────────────────────

const STATUS_CONFIG: Record<StatusType, {
  label: string;
  hex: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
}> = {
  applied:   { label: 'Applied',   hex: '#6366f1', color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/25',  glow: 'shadow-indigo-500/20'  },
  screening: { label: 'Screening', hex: '#f59e0b', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   glow: 'shadow-amber-500/20'   },
  interview: { label: 'Interview', hex: '#a78bfa', color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/25',  glow: 'shadow-violet-500/20'  },
  offer:     { label: 'Offer',     hex: '#34d399', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', glow: 'shadow-emerald-500/20' },
  rejected:  { label: 'Rejected',  hex: '#fb7185', color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25',    glow: 'shadow-rose-500/20'    },
  withdrawn: { label: 'Withdrawn', hex: '#94a3b8', color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/25',   glow: 'shadow-slate-500/20'   },
};

const STATUS_ORDER: StatusType[] = ['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'];
const KANBAN_STATUSES: StatusType[] = ['applied', 'screening', 'interview', 'offer', 'rejected'];
const DEMO_KEY = 'job_tracker_demo_apps';

// ── Animation variants ─────────────────────────────────────────

const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -16, scale: 0.97, transition: { duration: 0.2, ease: "easeIn" } },
};

const columnVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

// ── Demo data ──────────────────────────────────────────────────

const DEMO_DATA: JobApplication[] = [
  { id: '1', company: 'Google', role: 'Software Engineer L4', job_url: 'https://careers.google.com', status: 'interview', applied_at: '2026-06-10T00:00:00Z', notes: 'System design round scheduled for next week', salary_min: 2000000, salary_max: 3500000, location: 'Bangalore', created_at: '2026-06-10T00:00:00Z' },
  { id: '2', company: 'Microsoft', role: 'Full Stack Developer', job_url: null, status: 'screening', applied_at: '2026-06-15T00:00:00Z', notes: 'HR call done, technical round pending', salary_min: 1800000, salary_max: 2800000, location: 'Hyderabad', created_at: '2026-06-15T00:00:00Z' },
  { id: '3', company: 'Flipkart', role: 'Backend Engineer', job_url: null, status: 'applied', applied_at: '2026-06-18T00:00:00Z', notes: null, salary_min: 1500000, salary_max: 2500000, location: 'Bangalore', created_at: '2026-06-18T00:00:00Z' },
  { id: '4', company: 'Razorpay', role: 'React Developer', job_url: null, status: 'offer', applied_at: '2026-06-01T00:00:00Z', notes: 'Offer received: 28 LPA. Negotiating notice period.', salary_min: 2500000, salary_max: 3000000, location: 'Bangalore', created_at: '2026-06-01T00:00:00Z' },
  { id: '5', company: 'Swiggy', role: 'Senior Frontend Engineer', job_url: null, status: 'rejected', applied_at: '2026-06-05T00:00:00Z', notes: 'Rejected after final round — weak system design feedback', salary_min: 1800000, salary_max: 2800000, location: 'Bangalore', created_at: '2026-06-05T00:00:00Z' },
];

const EMPTY_FORM = {
  company: '', role: '', job_url: '', status: 'applied' as StatusType,
  location: '', salary_min: '', salary_max: '', notes: '',
  applied_at: new Date().toISOString().split('T')[0],
};

// ── Helpers ────────────────────────────────────────────────────

function fmtSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const f = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
  if (min && max) return `₹${f(min)}–${f(max)}`;
  return min ? `₹${f(min)}+` : null;
}

// ── Skeleton loading card ──────────────────────────────────────

function SkeletonCard() {
  return (
    <motion.div
      className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3"
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="h-3.5 w-3/4 rounded-full bg-white/10" />
      <div className="h-2.5 w-1/2 rounded-full bg-white/[0.07]" />
      <div className="h-2 w-2/3 rounded-full bg-white/[0.05]" />
    </motion.div>
  );
}

// ── Pipeline health bar ────────────────────────────────────────
// Signature element: proportional segments animate in on mount

function PipelineBar({ apps }: { apps: JobApplication[] }) {
  const total = apps.length;
  if (total === 0) return null;

  return (
    <motion.div variants={itemVariants} className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-[11px] font-medium text-white/35 uppercase tracking-widest">Pipeline</span>
        <span className="font-sans text-[11px] text-white/30">{total} total</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px bg-white/[0.04]">
        {KANBAN_STATUSES.map((s, i) => {
          const count = apps.filter(a => a.status === s).length;
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <motion.div
              key={s}
              style={{ backgroundColor: STATUS_CONFIG[s].hex, width: `${pct}%` }}
              className="h-full rounded-full"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.3 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-2.5 flex-wrap">
        {KANBAN_STATUSES.map(s => {
          const count = apps.filter(a => a.status === s).length;
          if (count === 0) return null;
          return (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_CONFIG[s].hex }} />
              <span className="font-sans text-[11px] text-white/40">{STATUS_CONFIG[s].label} · {count}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────

export function JobTrackerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const isDemo = !isSupabaseConfigured || !user;

  useEffect(() => { load(); }, [user]);

  async function load() {
    setLoading(true);
    if (isDemo) {
      const stored = localStorage.getItem(DEMO_KEY);
      setApps(stored ? JSON.parse(stored) : DEMO_DATA);
    } else {
      const { data } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setApps(data as JobApplication[]);
    }
    setLoading(false);
  }

  function persist(updated: JobApplication[]) {
    localStorage.setItem(DEMO_KEY, JSON.stringify(updated));
    setApps(updated);
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowDialog(true);
  }

  function openEdit(app: JobApplication) {
    setEditing(app);
    setForm({
      company: app.company, role: app.role, job_url: app.job_url || '',
      status: app.status, location: app.location || '',
      salary_min: app.salary_min?.toString() || '',
      salary_max: app.salary_max?.toString() || '',
      notes: app.notes || '',
      applied_at: app.applied_at.split('T')[0],
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.company.trim() || !form.role.trim()) {
      toast({ title: 'Company and role are required', variant: 'destructive' });
      return;
    }
    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      job_url: form.job_url.trim() || null,
      status: form.status,
      location: form.location.trim() || null,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      notes: form.notes.trim() || null,
      applied_at: new Date(form.applied_at).toISOString(),
    };
    if (isDemo) {
      if (editing) {
        persist(apps.map(a => a.id === editing.id ? { ...a, ...payload } : a));
        toast({ title: 'Application updated' });
      } else {
        persist([{ ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...apps]);
        toast({ title: 'Application added' });
      }
    } else {
      if (editing) {
        await supabase.from('job_applications').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id);
        toast({ title: 'Application updated' });
      } else {
        const { data } = await supabase.from('job_applications').insert({ ...payload, user_id: user!.id }).select().single();
        if (data) {
          await supabase.from('application_status_history').insert({
            application_id: data.id, user_id: user!.id, status: payload.status, notes: 'Initial',
          });
        }
        toast({ title: 'Application added' });
      }
      load();
    }
    setShowDialog(false);
  }

  async function moveStatus(app: JobApplication, newStatus: StatusType) {
    if (isDemo) {
      persist(apps.map(a => a.id === app.id ? { ...a, status: newStatus } : a));
    } else {
      await supabase.from('job_applications').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', app.id);
      await supabase.from('application_status_history').insert({ application_id: app.id, user_id: user!.id, status: newStatus });
      load();
    }
  }

  async function remove(id: string) {
    if (isDemo) {
      persist(apps.filter(a => a.id !== id));
    } else {
      await supabase.from('job_applications').delete().eq('id', id);
      load();
    }
    toast({ title: 'Application removed' });
  }

  const byStatus = (s: StatusType) => apps.filter(a => a.status === s);

  // ── Kanban card ──────────────────────────────────────────────

  const KanbanCard = React.forwardRef<HTMLDivElement, { app: JobApplication }>(({ app }, ref) => {
    const cfg = STATUS_CONFIG[app.status];
    const nextIdx = STATUS_ORDER.indexOf(app.status) + 1;
    const next = nextIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[nextIdx] : null;
    const salary = fmtSalary(app.salary_min, app.salary_max);

    return (
      <motion.div
        ref={ref}
        layout
        variants={cardVariants}
        exit="exit"
        whileHover={{ y: -3, boxShadow: `0 12px 32px -8px ${cfg.hex}26` }}
        className={`group relative rounded-2xl border p-4 cursor-pointer transition-colors ${cfg.bg} ${cfg.border}`}
        onClick={() => openEdit(app)}
      >
        {/* Status dot */}
        <div
          className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full opacity-60"
          style={{ backgroundColor: cfg.hex }}
        />

        {/* Delete on hover */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-rose-500/10 border border-rose-500/20 transition-opacity"
          onClick={e => { e.stopPropagation(); remove(app.id); }}
        >
          <X className="h-3 w-3 text-rose-400" />
        </motion.button>

        {/* Company + role */}
        <div className="mb-3 pr-5">
          <p className="font-display font-semibold text-sm text-white/90 truncate leading-tight">{app.company}</p>
          <p className="font-sans text-xs text-white/45 truncate mt-0.5">{app.role}</p>
        </div>

        {/* Meta */}
        <div className="space-y-1.5">
          {app.location && (
            <div className="flex items-center gap-1.5 text-xs text-white/35">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="font-sans truncate">{app.location}</span>
            </div>
          )}
          {salary && (
            <div className="flex items-center gap-1.5 text-xs text-white/35">
              <DollarSign className="h-3 w-3 shrink-0" />
              <span className="font-sans">{salary}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-white/25">
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="font-sans">
              {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* Advance status */}
        {next && (
          <motion.button
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
            whileTap={{ scale: 0.98 }}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/35 hover:text-white/55 transition-colors"
            onClick={e => { e.stopPropagation(); moveStatus(app, next); }}
          >
            <span className="font-sans">Move to {STATUS_CONFIG[next].label}</span>
            <ArrowRight className="h-3 w-3" />
          </motion.button>
        )}

        {/* Job URL link */}
        {app.job_url && (
          <motion.a
            whileTap={{ scale: 0.95 }}
            href={app.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1 text-[11px] text-white/25 hover:text-indigo-400 transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="h-2.5 w-2.5" />
            <span className="font-sans">View posting</span>
          </motion.a>
        )}
      </motion.div>
    );
  });
  KanbanCard.displayName = 'KanbanCard';

  // ── Empty column state ─────────────────────────────────────────

  const EmptyColumn = () => (
    <motion.div
      animate={{ opacity: [0.4, 0.65, 0.4] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      className="rounded-2xl border border-dashed border-white/[0.08] p-6 flex flex-col items-center justify-center gap-2"
    >
      <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
        <Plus className="h-3.5 w-3.5 text-white/20" />
      </div>
      <p className="font-sans text-[11px] text-white/20 text-center">No applications</p>
    </motion.div>
  );

  // ── Render ─────────────────────────────────────────────────────

  return (
    <motion.div
      className="p-6 min-h-screen"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-indigo-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">Job Tracker</h1>
          </div>
          <p className="font-sans text-sm text-white/40 ml-12">
            {apps.length} application{apps.length !== 1 ? 's' : ''} across your pipeline
            {isDemo && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">demo</span>}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
            {(['kanban', 'table'] as const).map(mode => (
              <motion.button
                key={mode}
                whileTap={{ scale: 0.97 }}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-2 text-xs flex items-center gap-1.5 font-sans transition-colors capitalize ${
                  viewMode === mode
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/35 hover:text-white/55'
                }`}
              >
                {mode === 'kanban' ? <LayoutGrid className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                {mode === 'kanban' ? 'Kanban' : 'Table'}
              </motion.button>
            ))}
          </div>

          {/* Add button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={openAdd}
              size="sm"
              className="gap-2 font-sans bg-indigo-500 hover:bg-indigo-400 text-white border-0 rounded-xl px-4"
            >
              <Plus className="h-4 w-4" /> Add Application
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-5">
        {KANBAN_STATUSES.map((s, i) => {
          const cfg = STATUS_CONFIG[s];
          const count = byStatus(s).length;
          return (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}
            >
              <p className={`font-display text-2xl font-bold ${cfg.color} leading-none`}>{count}</p>
              <p className="font-sans text-xs text-white/40 mt-1.5">{cfg.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Pipeline health bar ── */}
      {!loading && <PipelineBar apps={apps} />}

      {/* ── Loading skeleton ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {KANBAN_STATUSES.map(s => (
            <div key={s} className="space-y-3">
              <div className="h-3 w-20 rounded-full bg-white/[0.07] mb-3" />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ))}
        </div>

      ) : viewMode === 'kanban' ? (
        // ── Kanban board ──
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {KANBAN_STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            const cols = byStatus(s);
            return (
              <motion.div key={s} variants={columnVariants} initial="hidden" animate="visible">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-0.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.hex }} />
                  <span className="font-display text-[11px] font-semibold uppercase tracking-widest text-white/45">
                    {cfg.label}
                  </span>
                  <span className="ml-auto font-sans text-[11px] text-white/25 bg-white/[0.04] rounded-full px-1.5 py-0.5">
                    {cols.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {cols.map(app => <KanbanCard key={app.id} app={app} />)}
                    {cols.length === 0 && <EmptyColumn key="empty" />}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      ) : (
        // ── Table view ──
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-white/[0.07] overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.025)' }}>
                {['Company', 'Role', 'Status', 'Location', 'Salary', 'Applied', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-display text-[11px] font-semibold text-white/35 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-white/20" />
                      </div>
                      <p className="font-sans text-sm text-white/30">No applications yet</p>
                      <p className="font-sans text-xs text-white/20">Add your first application to start tracking</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {apps.map((app, i) => {
                    const cfg = STATUS_CONFIG[app.status];
                    const salary = fmtSalary(app.salary_min, app.salary_max);
                    return (
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.25, delay: i * 0.03 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-display font-semibold text-sm text-white/85">{app.company}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-sans text-sm text-white/50">{app.role}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 font-sans text-xs px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: cfg.hex }} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-sans text-sm text-white/40">{app.location || '—'}</td>
                        <td className="px-5 py-3.5 font-sans text-sm text-white/40">{salary || '—'}</td>
                        <td className="px-5 py-3.5 font-sans text-sm text-white/35">
                          {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEdit(app)}
                              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/30 hover:text-white/60 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => remove(app.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg border-white/[0.08]" style={{ background: 'hsl(var(--background))' }}>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <DialogHeader className="pb-2">
              <DialogTitle className="font-display text-lg font-semibold text-white">
                {editing ? 'Edit Application' : 'Track New Application'}
              </DialogTitle>
              <p className="font-sans text-sm text-white/40 mt-1">
                {editing ? 'Update the details for this application' : 'Add a job you\'ve applied to or plan to apply for'}
              </p>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-sans text-xs text-white/45">Company <span className="text-rose-400">*</span></label>
                  <Input className="font-sans" placeholder="e.g. Google" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-sans text-xs text-white/45">Role <span className="text-rose-400">*</span></label>
                  <Input className="font-sans" placeholder="e.g. Software Engineer" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-sans text-xs text-white/45">Status</label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as StatusType }))}>
                    <SelectTrigger className="font-sans"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map(s => (
                        <SelectItem key={s} value={s} className="font-sans">{STATUS_CONFIG[s].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-sans text-xs text-white/45">Location</label>
                  <Input className="font-sans" placeholder="e.g. Bangalore" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-sans text-xs text-white/45">Min CTC (₹/year)</label>
                  <Input className="font-sans" type="number" placeholder="1500000" value={form.salary_min} onChange={e => setForm(f => ({ ...f, salary_min: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-sans text-xs text-white/45">Max CTC (₹/year)</label>
                  <Input className="font-sans" type="number" placeholder="2500000" value={form.salary_max} onChange={e => setForm(f => ({ ...f, salary_max: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-sans text-xs text-white/45">Job Posting URL</label>
                <Input className="font-sans" placeholder="https://careers.company.com/..." value={form.job_url} onChange={e => setForm(f => ({ ...f, job_url: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="font-sans text-xs text-white/45">Date Applied</label>
                <Input className="font-sans" type="date" value={form.applied_at} onChange={e => setForm(f => ({ ...f, applied_at: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="font-sans text-xs text-white/45">Notes</label>
                <Textarea
                  className="font-sans text-sm resize-none"
                  placeholder="Interview rounds, recruiter contacts, deadlines..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" onClick={() => setShowDialog(false)} className="font-sans">
                  Cancel
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={handleSubmit}
                  className="font-sans bg-indigo-500 hover:bg-indigo-400 text-white border-0"
                >
                  {editing ? 'Save Changes' : 'Add Application'}
                </Button>
              </motion.div>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
