import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { MapPin, Briefcase, CheckCircle, ExternalLink, TrendingUp } from 'lucide-react';
import type { RealJob } from '@/services/jobFetcher';
import { getApplyUrl, getSourceLabel } from '@/services/jobFetcher';

export interface JobDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: RealJob | null;
  matchScore?: number;
  matchedSkills?: string[];
}

export function JobDetails({ open, onOpenChange, job, matchScore = 0, matchedSkills = [] }: JobDetailsProps) {
  if (!job) return null;

  const score   = matchScore;
  const matched = matchedSkills.length;
  const total   = job.requiredSkills.length;

  const scoreColor =
    score >= 80 ? 'text-green-600' :
    score >= 60 ? 'text-blue-600'  :
    score >= 40 ? 'text-yellow-600' :
    'text-gray-500';

  const handleApply = () => {
    window.open(getApplyUrl(job), '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{job.title}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Match score — only when available */}
          {score > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold">Your Match Score</p>
                  <p className="text-xs text-muted-foreground">Based on your skills</p>
                </div>
                <span className={`text-3xl font-bold ${scoreColor}`}>{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{matched} skills matched</span>
                <span>{total - matched} skills to learn</span>
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <>
              <div>
                <p className="font-semibold mb-2">About this role</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{job.description}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Required skills */}
          {job.requiredSkills.length > 0 && (
            <div>
              <p className="font-semibold mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => {
                  const has = matchedSkills.includes(skill);
                  return (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className={has
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-700'}
                    >
                      {has && <CheckCircle className="h-3 w-3 mr-1" />}
                      {skill}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Improvement tip */}
          {score > 0 && score < 80 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-blue-700">
                Build the missing skills above to increase your match score and stand out to recruiters.
              </p>
            </div>
          )}

          {/* Apply */}
          <Button className="w-full" size="lg" onClick={handleApply}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Apply on {getSourceLabel(job.source)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
