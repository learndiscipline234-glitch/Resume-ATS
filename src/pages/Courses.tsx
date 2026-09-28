import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen, ExternalLink, Search, Star, Clock, Zap,
  Filter, ChevronDown, ChevronUp, GraduationCap,
  Target, TrendingUp, Sparkles,
} from 'lucide-react';
import { learningResources } from '@/data/learningResources';
import { useNavigate } from 'react-router-dom';

// ── Types ──────────────────────────────────────────────────────────────────────

interface CourseEntry {
  skill: string;
  freeTitle: string;
  freeUrl: string;
  freePlatform: string;
  paidTitle?: string;
  paidUrl?: string;
  paidPlatform?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isGap: boolean;
}

// ── Category / difficulty maps ─────────────────────────────────────────────────

const SKILL_CATEGORIES: Record<string, string> = {
  JavaScript: 'Frontend', TypeScript: 'Frontend', React: 'Frontend',
  'Vue.js': 'Frontend', Angular: 'Frontend', 'Next.js': 'Frontend',
  HTML: 'Frontend', CSS: 'Frontend', 'Tailwind CSS': 'Frontend',
  'Node.js': 'Backend', Express: 'Backend', Django: 'Backend',
  'Spring Boot': 'Backend', FastAPI: 'Backend', 'REST API': 'Backend', GraphQL: 'Backend',
  SQL: 'Database', PostgreSQL: 'Database', MongoDB: 'Database', Redis: 'Database',
  Docker: 'DevOps', Kubernetes: 'DevOps', AWS: 'DevOps', 'CI/CD': 'DevOps',
  Terraform: 'DevOps', Ansible: 'DevOps', Linux: 'DevOps',
  Python: 'AI/ML', 'Machine Learning': 'AI/ML', 'Deep Learning': 'AI/ML',
  TensorFlow: 'AI/ML', PyTorch: 'AI/ML', 'Scikit-learn': 'AI/ML',
  Pandas: 'AI/ML', NumPy: 'AI/ML', 'Data Visualization': 'AI/ML', Tableau: 'AI/ML',
  Git: 'Tools', Jest: 'Tools', Testing: 'Tools', Jira: 'Tools',
  Agile: 'Soft Skills', 'Problem Solving': 'Soft Skills', 'Product Management': 'Soft Skills',
  Java: 'Languages', 'C#': 'Languages', Go: 'Languages', Rust: 'Languages',
};

const SKILL_DIFFICULTY: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
  HTML: 'beginner', CSS: 'beginner', Git: 'beginner', SQL: 'beginner',
  Agile: 'beginner', 'Problem Solving': 'beginner',
  JavaScript: 'intermediate', TypeScript: 'intermediate', React: 'intermediate',
  Python: 'intermediate', 'Node.js': 'intermediate', PostgreSQL: 'intermediate',
  Docker: 'intermediate', AWS: 'intermediate', 'Machine Learning': 'intermediate',
  Kubernetes: 'advanced', 'Deep Learning': 'advanced', TensorFlow: 'advanced',
  PyTorch: 'advanced', Terraform: 'advanced', Rust: 'advanced',
};

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Database', 'DevOps', 'AI/ML', 'Languages', 'Tools', 'Soft Skills'];

const DIFF_CONFIG: Record<string, { bg: string; border: string; text: string }> = {
  beginner:     { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  intermediate: { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  text: 'text-indigo-400' },
  advanced:     { bg: 'bg-violet-500/10',  border: 'border-violet-500/30',  text: 'text-violet-400' },
};

// ── Animations ─────────────────────────────────────────────────────────────────

const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: Math.min(i * 0.03, 0.4), duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGapSkills(): string[] {
  try {
    const raw = localStorage.getItem('lastAnalysisResult');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const missing = parsed?.skillMatch?.missingSkills ?? parsed?.mlResult?.missingSkills ?? [];
    return missing.map((s: any) => (typeof s === 'string' ? s : s.skill));
  } catch { return []; }
}

function buildCourseList(): CourseEntry[] {
  const gapSet = new Set(getGapSkills().map(s => s.toLowerCase()));
  return Object.entries(learningResources)
    .filter(([, res]) => res.free)
    .map(([skill, res]) => ({
      skill,
      freeTitle:    res.free!.title,
      freeUrl:      res.free!.url,
      freePlatform: res.free!.platform,
      paidTitle:    res.paid?.title,
      paidUrl:      res.paid?.url,
      paidPlatform: res.paid?.platform,
      category:     SKILL_CATEGORIES[skill] ?? 'Other',
      difficulty:   SKILL_DIFFICULTY[skill] ?? 'intermediate',
      isGap:        gapSet.has(skill.toLowerCase()),
    }))
    .sort((a, b) => {
      if (a.isGap && !b.isGap) return -1;
      if (!a.isGap && b.isGap) return 1;
      return a.skill.localeCompare(b.skill);
    });
}

// ── Course card ────────────────────────────────────────────────────────────────

function CourseCard({ course, index }: { course: CourseEntry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const diff = DIFF_CONFIG[course.difficulty] ?? DIFF_CONFIG.intermediate;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      whileHover={{ y: -1 }}
      className={`rounded-xl border overflow-hidden transition-colors ${
        course.isGap
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-white/[0.07] bg-white/[0.025]'
      }`}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {course.isGap && (
          <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Skill gap from resume" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-sm font-semibold text-white">{course.skill}</span>
            {course.isGap && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-sans font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Target className="h-2.5 w-2.5" /> Gap
              </span>
            )}
          </div>
          <p className="font-sans text-xs text-white/35 mt-0.5">{course.freePlatform}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-sans px-2 py-0.5 rounded-full border ${diff.bg} ${diff.border} ${diff.text}`}>
            {course.difficulty}
          </span>
          <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40">
            {course.category}
          </span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-white/30 ml-1" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] space-y-3">
              {/* Free */}
              <div>
                <p className="font-sans text-xs font-semibold text-white/40 mb-1.5 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> Free Resource
                </p>
                <a href={course.freeUrl} target="_blank" rel="noopener noreferrer">
                  <motion.div
                    whileHover={{ scale: 1.01, x: 2 }}
                    className="flex items-center justify-between p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:border-indigo-500/40 transition-colors"
                  >
                    <div>
                      <p className="font-sans text-sm text-white/80">{course.freeTitle}</p>
                      <p className="font-sans text-xs text-white/35">{course.freePlatform}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-indigo-400 shrink-0" />
                  </motion.div>
                </a>
              </div>

              {/* Paid */}
              {course.paidUrl && (
                <div>
                  <p className="font-sans text-xs font-semibold text-white/40 mb-1.5 flex items-center gap-1">
                    <Star className="h-3 w-3" /> Premium Course
                  </p>
                  <a href={course.paidUrl} target="_blank" rel="noopener noreferrer">
                    <motion.div
                      whileHover={{ scale: 1.01, x: 2 }}
                      className="flex items-center justify-between p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-lg hover:border-violet-500/40 transition-colors"
                    >
                      <div>
                        <p className="font-sans text-sm text-white/80">{course.paidTitle}</p>
                        <p className="font-sans text-xs text-white/35">{course.paidPlatform}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-violet-400 shrink-0" />
                    </motion.div>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function Courses() {
  const navigate = useNavigate();
  const allCourses = useMemo(buildCourseList, []);
  const gapSkills  = useMemo(getGapSkills, []);

  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('All');
  const [difficulty, setDifficulty]   = useState('All');
  const [gapsOnly, setGapsOnly]       = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => allCourses.filter(c => {
    if (gapsOnly && !c.isGap) return false;
    if (category !== 'All' && c.category !== category) return false;
    if (difficulty !== 'All' && c.difficulty !== difficulty) return false;
    if (search && !c.skill.toLowerCase().includes(search.toLowerCase()) &&
        !c.freeTitle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [allCourses, search, category, difficulty, gapsOnly]);

  const gapCount = allCourses.filter(c => c.isGap).length;
  const hasResume = gapSkills.length > 0;

  return (
    <motion.div
      className="page-content max-w-5xl space-y-5"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Learning Resources</h1>
            <p className="font-sans text-sm text-white/40">
              {hasResume
                ? `${gapCount} courses matched to your skill gaps — ${allCourses.length} total`
                : `${allCourses.length} curated courses across all tech skills`}
            </p>
          </div>
        </div>
        {!hasResume && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button variant="outline" size="sm" onClick={() => navigate('/resume')}
              className="font-sans gap-1.5 rounded-xl border-white/[0.08] text-white/55 hover:text-white">
              <Sparkles className="h-3.5 w-3.5" /> Analyze Resume for Personalized Picks
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Gap banner */}
      {hasResume && gapCount > 0 && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 p-3.5 bg-amber-500/8 border border-amber-500/25 rounded-xl"
        >
          <Target className="h-4 w-4 text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="font-sans text-sm font-semibold text-amber-300">
              {gapCount} courses match your skill gaps
            </span>
            <span className="font-sans text-sm text-amber-400/60"> — highlighted with an amber border</span>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button size="sm" variant="outline"
              className="font-sans border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-lg shrink-0"
              onClick={() => setGapsOnly(!gapsOnly)}>
              {gapsOnly ? 'Show All' : 'Gaps Only'}
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Search + filters */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="Search skills or courses…"
              className="pl-10 font-sans rounded-xl bg-white/[0.04] border-white/[0.08] text-white/80 placeholder:text-white/25 focus:border-indigo-500/40"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}
              className="font-sans gap-1.5 rounded-xl border-white/[0.08] text-white/55 hover:text-white">
              <Filter className="h-4 w-4" /> Filters
              <motion.div animate={{ rotate: showFilters ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-3 w-3" />
              </motion.div>
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-white/[0.07] p-4 space-y-3 bg-white/[0.02]">
                <div>
                  <p className="font-sans text-xs font-semibold text-white/40 mb-2 uppercase tracking-wide">Category</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(cat => (
                      <motion.button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`px-2.5 py-1 font-sans text-xs rounded-full border transition-colors ${
                          category === cat
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : 'border-white/[0.08] text-white/45 hover:border-indigo-500/50 hover:text-white/70'
                        }`}
                      >
                        {cat}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-sans text-xs font-semibold text-white/40 mb-2 uppercase tracking-wide">Difficulty</p>
                  <div className="flex gap-1.5">
                    {['All', 'beginner', 'intermediate', 'advanced'].map(d => (
                      <motion.button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`px-2.5 py-1 font-sans text-xs rounded-full border capitalize transition-colors ${
                          difficulty === d
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : 'border-white/[0.08] text-white/45 hover:border-indigo-500/50 hover:text-white/70'
                        }`}
                      >
                        {d}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {[
          { value: filtered.length, label: 'Courses shown', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/25' },
          { value: filtered.filter(c => c.isGap).length, label: 'Your skill gaps', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25' },
          { value: filtered.filter(c => c.paidUrl).length, label: 'With premium option', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/25' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl border p-4 ${stat.bg} ${stat.border}`}>
            <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="font-sans text-xs text-white/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Course list */}
      <motion.div variants={itemVariants}>
        {filtered.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-white/20" />
            </div>
            <p className="font-sans text-sm text-white/35">No courses match your filters</p>
            <p className="font-sans text-xs text-white/20 mt-1">Try adjusting the search or category</p>
          </div>
        ) : (
          <motion.div className="space-y-2" variants={pageVariants} initial="hidden" animate="visible">
            {!gapsOnly && hasResume && filtered.some(c => c.isGap) && (
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-3.5 w-3.5 text-amber-400" />
                <p className="font-sans text-xs font-semibold text-amber-400 uppercase tracking-widest">
                  Priority Learning — Your Skill Gaps
                </p>
              </div>
            )}
            {filtered.map((course, i) => (
              <CourseCard key={course.skill} course={course} index={i} />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Platform quick links */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-white/[0.07] p-5"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-indigo-400" />
          <h3 className="font-display text-sm font-semibold text-white">Top Learning Platforms</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40' },
            { name: 'Coursera',     url: 'https://www.coursera.org',        color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40' },
            { name: 'Udemy',        url: 'https://www.udemy.com',           color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20 hover:border-violet-500/40' },
            { name: 'MDN Web Docs', url: 'https://developer.mozilla.org',   color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40' },
          ].map(p => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between p-2.5 rounded-xl border font-sans text-xs font-medium transition-colors ${p.bg} ${p.color}`}
              >
                {p.name}
                <ExternalLink className="h-3 w-3" />
              </motion.div>
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Courses;
