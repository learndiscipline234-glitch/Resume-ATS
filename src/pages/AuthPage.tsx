import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Brain, Database, FileText, TrendingUp, Zap,
  User, Building2, CheckCircle2, ArrowRight,
} from 'lucide-react';

// ── Role selector ─────────────────────────────────────────────────────────────

type RoleChoice = 'user' | 'employer' | null;

function RoleSelector({ onSelect }: { onSelect: (role: RoleChoice) => void }) {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'var(--gradient-primary)' }}>
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold">Next Step Career AI</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose how you want to use the platform</p>
      </div>

      <div className="space-y-3">
        {/* Job Seeker */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('user')}
          className="w-full ent-card p-5 text-left group"
          aria-label="Continue as Job Seeker"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#2563EB18' }}>
              <User className="h-5 w-5" style={{ color: '#2563EB' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold">Job Seeker / Student</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Analyze resumes, check ATS compatibility, build resumes, track skill gaps
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Resume Analyzer', 'ATS Checker', 'Skill Gap', 'Resume Builder'].map(f => (
                  <span key={f} className="badge-info text-xs px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.button>

        {/* Employer */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('employer')}
          className="w-full ent-card p-5 text-left group"
          aria-label="Continue as Employer / Recruiter"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#10B98118' }}>
              <Building2 className="h-5 w-5" style={{ color: '#10B981' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold">Employer / Recruiter</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Analytics dashboard, resume ranking, DBMS insights, audit logs
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Employer Dashboard', 'Resume Ranking', 'DBMS Analytics', 'Audit Logs'].map(f => (
                  <span key={f} className="badge-success text-xs px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.button>

        {/* Demo mode */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              localStorage.removeItem('demo_role');
              window.location.href = '/dashboard';
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Continue in Demo Mode (no login required)
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main AuthPage ─────────────────────────────────────────────────────────────

export function AuthPage() {
  const { isAuthenticated, loading, userRole } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [roleChoice, setRoleChoice] = useState<RoleChoice>(null);

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  if (isAuthenticated && !loading) {
    const dest = userRole === 'employer' ? '/employer' : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  const handleRoleSelect = (role: RoleChoice) => {
    setRoleChoice(role);
    // Store role choice in localStorage for demo mode
    if (role) localStorage.setItem('demo_role', role);
  };

  const handleSuccess = () => {
    const dest = roleChoice === 'employer' ? '/employer' : '/dashboard';
    window.location.href = dest;
  };

  const handleDemoMode = () => {
    const dest = roleChoice === 'employer' ? '/employer' : '/dashboard';
    window.location.href = dest;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: 'var(--gradient-accent-bar)' }} />

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-80px)]">

          {/* Left: Branding */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}>
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">Next Step Career AI</h1>
                <p className="text-xs text-muted-foreground">Production-grade Resume Intelligence</p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-4">
                <span className="gradient-text">AI-Powered</span> Career<br />Intelligence Platform
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Advanced ML + DBMS integration for intelligent resume analysis,
                ATS compatibility, skill gap detection, and employer analytics.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                { icon: FileText,   color: '#2563EB', text: 'TF-IDF + Naive Bayes role prediction' },
                { icon: Brain,      color: '#8B5CF6', text: 'Explainable AI with skill confidence scores' },
                { icon: Database,   color: '#10B981', text: 'PostgreSQL ADBMS: partitioning, FTS, triggers' },
                { icon: TrendingUp, color: '#F59E0B', text: 'ATS checker, resume builder, auto improver' },
              ].map(({ icon: Icon, color, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}18` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            {/* Role badges */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium"
                style={{ borderColor: '#2563EB30', background: '#2563EB08', color: '#2563EB' }}>
                <User className="h-3.5 w-3.5" />
                Job Seeker — Resume tools
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium"
                style={{ borderColor: '#10B98130', background: '#10B98108', color: '#059669' }}>
                <Building2 className="h-3.5 w-3.5" />
                Employer — Analytics dashboard
              </div>
            </div>
          </motion.div>

          {/* Right: Auth form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex justify-center"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Role selection */}
              {!roleChoice && (
                <motion.div
                  key="role-select"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                >
                  <RoleSelector onSelect={handleRoleSelect} />
                </motion.div>
              )}

              {/* Step 2: Login / Signup */}
              {roleChoice && (
                <motion.div
                  key={`auth-${isLogin}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="w-full max-w-md"
                >
                  {/* Role indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
                      style={{
                        background: roleChoice === 'employer' ? '#10B98112' : '#2563EB12',
                        color: roleChoice === 'employer' ? '#059669' : '#2563EB',
                        border: `1px solid ${roleChoice === 'employer' ? '#10B98130' : '#2563EB30'}`,
                      }}>
                      {roleChoice === 'employer'
                        ? <><Building2 className="h-3.5 w-3.5" /> Employer Account</>
                        : <><User className="h-3.5 w-3.5" /> Job Seeker Account</>
                      }
                    </div>
                    <button
                      onClick={() => setRoleChoice(null)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Change role
                    </button>
                  </div>

                  {isLogin ? (
                    <LoginForm onToggleMode={() => setIsLogin(false)} onSuccess={handleSuccess} />
                  ) : (
                    <SignUpForm onToggleMode={() => setIsLogin(true)} onSuccess={handleSuccess} />
                  )}

                  {/* Demo mode shortcut */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={handleDemoMode}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                    >
                      Skip login — continue in Demo Mode
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
