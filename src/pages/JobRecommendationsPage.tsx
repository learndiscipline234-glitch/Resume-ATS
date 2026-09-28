import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { JobCard } from '@/components/jobs/JobCard';
import { JobDetails } from '@/components/jobs/JobDetails';
import { Briefcase, Search, RefreshCw, AlertCircle, ExternalLink, Zap } from 'lucide-react';
import { fetchJobsForRole, type RealJob } from '@/services/jobFetcher';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function getStoredRole(): string {
  try { return localStorage.getItem('lastDetectedRole') ?? 'software_developer'; }
  catch { return 'software_developer'; }
}

function SkeletonCard() {
  return (
    <motion.div
      className="rounded-2xl border border-white/[0.06] p-5 space-y-3"
      style={{ background: 'rgba(255,255,255,0.025)' }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="h-3.5 w-3/5 rounded-full bg-white/10" />
      <div className="h-2.5 w-2/5 rounded-full bg-white/[0.07]" />
      <div className="h-2 w-4/5 rounded-full bg-white/[0.05]" />
      <div className="h-2 w-3/4 rounded-full bg-white/[0.05]" />
      <div className="flex gap-2 pt-1">
        <div className="h-5 w-16 rounded-full bg-white/[0.07]" />
        <div className="h-5 w-12 rounded-full bg-white/[0.07]" />
      </div>
    </motion.div>
  );
}

export function JobRecommendationsPage() {
  const [jobs, setJobs]             = useState<RealJob[]>([]);
  const [filtered, setFiltered]     = useState<RealJob[]>([]);
  const [selected, setSelected]     = useState<RealJob | null>(null);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [search, setSearch]         = useState('');
  const [role]                      = useState(getStoredRole);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const result = await fetchJobsForRole(role);
      setJobs(result.jobs);
      setFiltered(result.jobs);
      setIsFallback(result.source === 'fallback');
      if (result.source === 'fallback') {
        toast.info('Showing curated job search links — connect a RapidAPI key for live listings.');
      }
    } catch (err) {
      setFetchError(true);
      setJobs([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(jobs); return; }
    const q = search.toLowerCase();
    setFiltered(jobs.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      j.requiredSkills.some(s => s.toLowerCase().includes(q))
    ));
  }, [search, jobs]);

  const roleLabel = role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white tracking-tight">Job Recommendations</h1>
            <p className="font-sans text-xs text-white/40 mt-0.5">Fetching latest listings for {roleLabel}…</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5 text-rose-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">Couldn't load listings</h2>
          <p className="font-sans text-sm text-white/45">Try fetching the latest jobs from Unstop, Internshala, or LinkedIn.</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={loadJobs} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white border-0 rounded-xl font-sans">
              <RefreshCw className="h-4 w-4 mr-2" /> Try again
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── Main ────────────────────────────────────────────────────────
  return (
    <motion.div
      className="max-w-6xl mx-auto px-6 py-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white tracking-tight">Job Recommendations</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-sans text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">{roleLabel}</span>
              {isFallback && (
                <span className="font-sans text-xs px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 flex items-center gap-1">
                  <ExternalLink className="h-2.5 w-2.5" /> Curated links
                </span>
              )}
            </div>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button variant="outline" onClick={loadJobs} size="sm"
            className="font-sans gap-1.5 rounded-xl border-white/[0.08] text-white/55 hover:text-white">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 mb-5">
        {[
          { value: jobs.length, label: 'Jobs found', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/25' },
          { value: roleLabel, label: 'Detected role', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/25' },
          { value: isFallback ? 'Curated' : 'Live API', label: 'Source', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`rounded-2xl border p-4 ${stat.bg} ${stat.border}`}
          >
            <p className={`font-display text-xl font-bold ${stat.color} truncate`}>{stat.value}</p>
            <p className="font-sans text-xs text-white/40 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <Input
          className="pl-10 font-sans rounded-xl bg-white/[0.04] border-white/[0.08] text-white/80 placeholder:text-white/25 focus:border-indigo-500/40"
          placeholder="Search by title, company, location or skill…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Job grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-6 w-6 text-white/20" />
            </div>
            <p className="font-sans text-sm text-white/35">No jobs match your search</p>
            <p className="font-sans text-xs text-white/20 mt-1">Try a different keyword</p>
          </motion.div>
        ) : (
          <motion.div key="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job, i) => (
              <motion.div key={job.jobId} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                <JobCard job={job} onClick={() => setSelected(job)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <JobDetails
        open={selected !== null}
        onOpenChange={open => { if (!open) setSelected(null); }}
        job={selected}
      />
    </motion.div>
  );
}
