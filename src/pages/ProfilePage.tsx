import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, TrendingUp, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl border ${className}`}
    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
  >
    {children}
  </div>
);

export function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName]         = useState(profile?.full_name ?? '');
  const [jobTitle, setJobTitle]         = useState(profile?.job_title ?? '');
  const [expLevel, setExpLevel]         = useState(profile?.experience_level ?? 'entry');
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? 'U').toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({ full_name: fullName, job_title: jobTitle, experience_level: expLevel as any });
      setSaved(true);
      toast({ title: 'Profile saved', description: 'Your profile has been updated.' });
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast({ title: 'Save failed', description: 'Could not update profile. Try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-6 py-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Avatar + header */}
      <motion.div variants={item}>
        <GlassCard className="p-6 flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {initials}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">
              {profile?.full_name || 'Your Profile'}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {user?.email ?? 'Not signed in'}
            </p>
            {profile?.job_title && (
              <p className="text-xs mt-1 font-medium" style={{ color: 'rgba(99,102,241,0.9)' }}>
                {profile.job_title}
              </p>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Edit form */}
      <motion.div variants={item}>
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4" style={{ color: '#6366f1' }} />
            <h2 className="font-display text-base font-semibold text-white">Personal Information</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <Input
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                className="pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <Input
                id="email"
                value={user?.email ?? ''}
                disabled
                className="pl-10 bg-white/[0.02] border-white/[0.05] text-white/40 cursor-not-allowed"
              />
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Email cannot be changed here</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle" className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Job Title
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Experience Level
            </Label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <Select value={expLevel} onValueChange={setExpLevel}>
                <SelectTrigger className="pl-10 bg-white/[0.04] border-white/[0.08] text-white focus:border-indigo-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSave}
              disabled={saving || !user}
              className="w-full gap-2 font-semibold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {saved ? (
                <><CheckCircle className="h-4 w-4" /> Saved</>
              ) : saving ? (
                'Saving…'
              ) : (
                <><Save className="h-4 w-4" /> Save Changes</>
              )}
            </Button>
          </motion.div>

          {!user && (
            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Sign in to save profile changes
            </p>
          )}
        </GlassCard>
      </motion.div>

      {/* Account info card */}
      <motion.div variants={item}>
        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Account</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
          >
            Active
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
