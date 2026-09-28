import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, CheckCircle, XCircle, Clock, Trophy, ArrowLeft, ArrowRight, RotateCcw,
  Brain, Target, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface Assessment {
  id: string;
  skill_name: string;
  role: string | null;
  difficulty: string;
  questions: Question[];
  time_limit_sec: number;
}

interface QuizState {
  currentQuestion: number;
  answers: (number | null)[];
  startedAt: number;
  completed: boolean;
  score: number | null;
}

const DEMO_ASSESSMENTS: Assessment[] = [
  {
    id: "demo-js",
    skill_name: "JavaScript",
    role: "Frontend Developer",
    difficulty: "intermediate",
    time_limit_sec: 120,
    questions: [
      { question: "What does 'typeof null' return in JavaScript?", options: ["null", "undefined", "object", "number"], correct: 2 },
      { question: "Which method creates a new array with results of calling a function on every element?", options: [".forEach()", ".map()", ".filter()", ".reduce()"], correct: 1 },
      { question: "What is a closure in JavaScript?", options: ["A way to close browser tabs", "A function with access to its outer scope variables", "A type of loop", "An error handling mechanism"], correct: 1 },
      { question: "What does the 'spread' operator (...) do?", options: ["Combines two strings", "Expands iterables into individual elements", "Creates a deep copy of objects", "Declares a variable"], correct: 1 },
      { question: "Which is NOT a valid way to declare a variable in modern JS?", options: ["let x = 1", "const x = 1", "var x = 1", "int x = 1"], correct: 3 },
    ],
  },
  {
    id: "demo-react",
    skill_name: "React",
    role: "Frontend Developer",
    difficulty: "intermediate",
    time_limit_sec: 120,
    questions: [
      { question: "What hook is used for side effects in React?", options: ["useState", "useEffect", "useReducer", "useMemo"], correct: 1 },
      { question: "What is the virtual DOM?", options: ["A copy of the real DOM in memory", "A CSS framework", "A React component", "A browser API"], correct: 0 },
      { question: "Which is the correct way to update state in React?", options: ["state.value = 5", "this.state = {value: 5}", "setState({value: 5}) or setter function", "state = 5"], correct: 2 },
      { question: "What does React.memo() do?", options: ["Stores data in localStorage", "Memoizes a component to prevent unnecessary re-renders", "Creates a memo note UI", "Allocates memory"], correct: 1 },
      { question: "What is the purpose of keys in React lists?", options: ["Styling elements", "Helping React identify which items changed", "Sorting items", "Creating unique URLs"], correct: 1 },
    ],
  },
  {
    id: "demo-python",
    skill_name: "Python",
    role: "Software Developer",
    difficulty: "beginner",
    time_limit_sec: 90,
    questions: [
      { question: "Which keyword is used to define a function in Python?", options: ["function", "func", "def", "define"], correct: 2 },
      { question: "What is a list comprehension?", options: ["A way to understand lists", "A concise way to create lists", "A list sorting algorithm", "A debugging tool"], correct: 1 },
      { question: "What does 'pip' stand for?", options: ["Python Install Package", "Pip Installs Packages", "Package Index Python", "Python Interface Platform"], correct: 1 },
      { question: "Which is an immutable data type in Python?", options: ["list", "dict", "set", "tuple"], correct: 3 },
      { question: "What is the output of: print(type([]))?", options: ["<class 'array'>", "<class 'list'>", "<class 'tuple'>", "<class 'set'>"], correct: 1 },
    ],
  },
  {
    id: "demo-sql",
    skill_name: "SQL",
    role: "Database Developer",
    difficulty: "intermediate",
    time_limit_sec: 120,
    questions: [
      { question: "Which SQL clause is used to filter groups?", options: ["WHERE", "HAVING", "FILTER", "GROUP BY"], correct: 1 },
      { question: "What type of JOIN returns all rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correct: 3 },
      { question: "What does ACID stand for in databases?", options: ["Atomicity, Consistency, Isolation, Durability", "Add, Create, Insert, Delete", "Access, Control, Index, Data", "Automatic, Concurrent, Isolated, Distributed"], correct: 0 },
      { question: "Which is used to add a new column to an existing table?", options: ["INSERT INTO", "ADD COLUMN", "ALTER TABLE ... ADD", "UPDATE TABLE"], correct: 2 },
      { question: "What is a primary key?", options: ["The first column in a table", "A unique identifier for each row", "The most important data", "An encryption key"], correct: 1 },
    ],
  },
];

const DIFFICULTY_CONFIG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  beginner:     { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Beginner' },
  intermediate: { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',   label: 'Intermediate' },
  advanced:     { bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    text: 'text-rose-400',    label: 'Advanced' },
};

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
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.2 } },
};
const viewTransition = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.25 } },
};

function SkeletonCard() {
  return (
    <motion.div
      className="rounded-2xl border border-white/[0.06] p-5 space-y-3"
      style={{ background: 'rgba(255,255,255,0.025)' }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="flex justify-between items-start">
        <div className="h-3.5 w-2/5 rounded-full bg-white/10" />
        <div className="h-5 w-16 rounded-full bg-white/[0.07]" />
      </div>
      <div className="h-2.5 w-3/5 rounded-full bg-white/[0.07]" />
      <div className="h-2 w-4/5 rounded-full bg-white/[0.05]" />
      <div className="h-8 w-full rounded-xl bg-white/[0.06] mt-2" />
    </motion.div>
  );
}

export function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>(DEMO_ASSESSMENTS);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAssessments(); }, []);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase.from("skill_assessments").select("*").order("skill_name");
      if (!error && data && data.length > 0) setAssessments(data as Assessment[]);
    } catch { /* use demo */ }
    finally { setLoading(false); }
  };

  const handleComplete = useCallback(() => {
    if (!quizState || !selectedAssessment || quizState.completed) return;
    const correct = quizState.answers.reduce((acc, ans, i) => {
      const question = selectedAssessment.questions[i];
      if (!question) return acc;
      return acc + (ans === question.correct ? 1 : 0);
    }, 0);
    const score = Math.round((correct / selectedAssessment.questions.length) * 100);
    setQuizState(prev => prev ? { ...prev, completed: true, score } : prev);
    saveResult(selectedAssessment.id, score, score >= 70);
  }, [quizState, selectedAssessment]);

  useEffect(() => {
    if (!quizState || quizState.completed || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleComplete(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizState, timeLeft, handleComplete]);

  const startQuiz = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setQuizState({
      currentQuestion: 0,
      answers: new Array(assessment.questions.length).fill(null),
      startedAt: Date.now(),
      completed: false,
      score: null,
    });
    setTimeLeft(assessment.time_limit_sec);
  };

  const selectAnswer = (optionIndex: number) => {
    if (!quizState || quizState.completed) return;
    setQuizState(prev => {
      if (!prev) return prev;
      const answers = [...prev.answers];
      answers[prev.currentQuestion] = optionIndex;
      return { ...prev, answers };
    });
  };

  const nextQuestion = () => {
    if (!quizState || !selectedAssessment) return;
    if (quizState.currentQuestion < selectedAssessment.questions.length - 1) {
      setQuizState(prev => prev ? { ...prev, currentQuestion: prev.currentQuestion + 1 } : prev);
    }
  };

  const prevQuestion = () => {
    if (!quizState || quizState.currentQuestion === 0) return;
    setQuizState(prev => prev ? { ...prev, currentQuestion: prev.currentQuestion - 1 } : prev);
  };

  const saveResult = async (assessmentId: string, score: number, passed: boolean) => {
    if (assessmentId.startsWith("demo-")) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("user_assessment_results").insert({
        user_id: user.id, assessment_id: assessmentId, score, passed,
        answers: quizState?.answers ?? [],
      });
    } catch { /* ignore */ }
  };

  const resetQuiz = () => {
    setSelectedAssessment(null);
    setQuizState(null);
    setTimeLeft(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Determine active view ──────────────────────────────────────
  const view: 'list' | 'quiz' | 'results' =
    quizState?.completed ? 'results' :
    quizState ? 'quiz' : 'list';

  return (
    <AnimatePresence mode="wait">
      {/* ── Results View ───────────────────────────────────────────── */}
      {view === 'results' && quizState && selectedAssessment && (() => {
        const passed = (quizState.score ?? 0) >= 70;
        return (
          <motion.div
            key="results"
            variants={viewTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-2xl mx-auto px-6 py-8"
          >
            {/* Score hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className={`rounded-3xl border p-8 text-center mb-6 ${
                passed
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-rose-500/5 border-rose-500/20'
              }`}
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: passed ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)' }}
              >
                {passed
                  ? <Trophy className="h-7 w-7 text-emerald-400" />
                  : <Target className="h-7 w-7 text-rose-400" />
                }
              </motion.div>
              <motion.p
                className="font-display text-5xl font-black text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                {quizState.score}%
              </motion.p>
              <motion.h2
                className="font-display text-xl font-bold text-white mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
              >
                {passed ? 'Assessment Passed!' : 'Keep Practising'}
              </motion.h2>
              <motion.p
                className="font-sans text-sm text-white/45"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.35 }}
              >
                {selectedAssessment.skill_name} — {selectedAssessment.difficulty}
              </motion.p>
              <motion.span
                className={`inline-block mt-3 px-3 py-1 rounded-full font-sans text-xs font-semibold border ${
                  passed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
              </motion.span>
            </motion.div>

            {/* Answer review */}
            <motion.div
              variants={pageVariants} initial="hidden" animate="visible"
              className="space-y-2 mb-6"
            >
              <motion.h3 variants={itemVariants} className="font-display text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">
                Review Answers
              </motion.h3>
              {selectedAssessment.questions.map((q, i) => {
                const userAnswer = quizState.answers[i];
                const isCorrect = userAnswer === q.correct;
                return (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={cardVariants}
                    className={`rounded-xl border p-3.5 ${
                      isCorrect
                        ? 'bg-emerald-500/5 border-emerald-500/15'
                        : 'bg-rose-500/5 border-rose-500/15'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isCorrect
                        ? <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        : <XCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                      }
                      <div>
                        <p className="font-sans text-sm text-white/80">{q.question}</p>
                        <p className="font-sans text-xs text-white/40 mt-1">
                          Your answer: <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                            {userAnswer !== null ? q.options[userAnswer] : 'Skipped'}
                          </span>
                          {!isCorrect && (
                            <span className="text-emerald-400 ml-3">Correct: {q.options[q.correct]}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.35 }}
            >
              <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" onClick={resetQuiz}
                  className="w-full font-sans rounded-xl border-white/[0.08] text-white/55 hover:text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assessments
                </Button>
              </motion.div>
              <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={() => startQuiz(selectedAssessment)}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white border-0 font-sans rounded-xl">
                  <RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        );
      })()}

      {/* ── Quiz View ─────────────────────────────────────────────── */}
      {view === 'quiz' && quizState && selectedAssessment && (() => {
        const q = selectedAssessment.questions[quizState.currentQuestion];
        const progressPct = ((quizState.currentQuestion + 1) / selectedAssessment.questions.length) * 100;
        const answered = quizState.answers.filter(a => a !== null).length;
        const isUrgent = timeLeft < 30;
        const isLast = quizState.currentQuestion === selectedAssessment.questions.length - 1;
        const currentAnswer = quizState.answers[quizState.currentQuestion];

        return (
          <motion.div
            key={`quiz-${quizState.currentQuestion}`}
            variants={viewTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-2xl mx-auto px-6 py-8 space-y-5"
          >
            {/* Quiz header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-white">{selectedAssessment.skill_name}</h2>
                <p className="font-sans text-xs text-white/40 mt-0.5">
                  Question {quizState.currentQuestion + 1} of {selectedAssessment.questions.length}
                </p>
              </div>
              <motion.div
                animate={isUrgent ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 0.8, repeat: isUrgent ? Infinity : 0 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-sm font-semibold ${
                  isUrgent
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/60'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timeLeft)}
              </motion.div>
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between font-sans text-xs text-white/30">
                <span>{answered}/{selectedAssessment.questions.length} answered</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <Progress value={progressPct} className="h-1.5 bg-white/[0.06]" />
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={quizState.currentQuestion}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="rounded-2xl border border-white/[0.07] p-6 space-y-5"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <h3 className="font-display text-lg font-semibold text-white leading-snug">{q.question}</h3>
                <div className="space-y-2.5">
                  {q.options.map((option, i) => {
                    const isSelected = currentAnswer === i;
                    return (
                      <motion.button
                        key={i}
                        onClick={() => selectAnswer(i)}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        animate={isSelected ? { borderColor: 'rgba(99,102,241,0.6)' } : {}}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border transition-colors ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500/50'
                            : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                        }`}
                      >
                        <span className={`font-mono text-xs font-bold mr-3 ${isSelected ? 'text-indigo-400' : 'text-white/30'}`}>
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <span className={`font-sans text-sm ${isSelected ? 'text-white' : 'text-white/65'}`}>
                          {option}
                        </span>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                            className="float-right mt-0.5"
                          >
                            <CheckCircle className="h-4 w-4 text-indigo-400" />
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" onClick={prevQuestion}
                  disabled={quizState.currentQuestion === 0}
                  className="font-sans rounded-xl border-white/[0.08] text-white/55 hover:text-white disabled:opacity-30">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              </motion.div>
              {isLast ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={handleComplete}
                    disabled={answered < selectedAssessment.questions.length}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white border-0 font-sans rounded-xl disabled:opacity-40"
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> Submit Quiz
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button onClick={nextQuestion}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white border-0 font-sans rounded-xl">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* ── Assessment List View ───────────────────────────────────── */}
      {view === 'list' && (
        <motion.div
          key="list"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="max-w-5xl mx-auto px-6 py-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-start gap-4 mb-7">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black text-white tracking-tight">
                Skill Assessments
              </h1>
              <p className="font-sans text-sm text-white/40 mt-1">
                Test your knowledge and earn skill badges. Pass with <span className="text-white/60">70%</span> or higher.
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[
              { value: assessments.length, label: 'Assessments', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/25' },
              { value: assessments.reduce((a, b) => a + b.questions.length, 0), label: 'Total questions', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/25' },
              { value: '70%', label: 'Pass threshold', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
            ].map(stat => (
              <div key={stat.label} className={`rounded-2xl border p-4 ${stat.bg} ${stat.border}`}>
                <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="font-sans text-xs text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Cards */}
          {loading ? (
            <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assessments.map((assessment, i) => {
                const diff = DIFFICULTY_CONFIG[assessment.difficulty] ?? DIFFICULTY_CONFIG.intermediate;
                return (
                  <motion.div
                    key={assessment.id}
                    custom={i}
                    variants={cardVariants}
                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
                    className="group rounded-2xl border border-white/[0.07] p-5 cursor-pointer transition-colors"
                    style={{ background: 'rgba(255,255,255,0.025)' }}
                    onClick={() => startQuiz(assessment)}
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-display text-base font-bold text-white leading-tight">
                            {assessment.skill_name}
                          </h3>
                          {assessment.role && (
                            <p className="font-sans text-xs text-white/35 mt-0.5">{assessment.role}</p>
                          )}
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-sans font-semibold px-2 py-0.5 rounded-full border ${diff.bg} ${diff.border} ${diff.text}`}>
                        {diff.label}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 font-sans text-xs text-white/35 mb-4">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3 w-3" /> {assessment.questions.length} questions
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> {Math.ceil(assessment.time_limit_sec / 60)} min
                      </span>
                    </div>

                    {/* CTA */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        className="w-full bg-indigo-500/10 hover:bg-indigo-500 border border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:text-white font-sans rounded-xl transition-colors"
                        onClick={e => { e.stopPropagation(); startQuiz(assessment); }}
                      >
                        Start Assessment
                      </Button>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
