import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Briefcase, ExternalLink, TrendingUp } from 'lucide-react';
import type { RealJob } from '@/services/jobFetcher';
import { getApplyUrl, getSourceLabel } from '@/services/jobFetcher';

export interface JobCardProps {
  job: RealJob;
  /** Optional match score (0-100) derived from user's skill profile */
  matchScore?: number;
  /** Skills the user already has that overlap with requiredSkills */
  matchedSkills?: string[];
  onClick?: () => void;
}

export function JobCard({ job, matchScore, matchedSkills = [], onClick }: JobCardProps) {
  const score = matchScore ?? 0;
  const matched = matchedSkills.length;
  const total   = job.requiredSkills.length;

  const borderColor =
    score >= 80 ? 'border-green-300' :
    score >= 60 ? 'border-blue-300'  :
    score >= 40 ? 'border-yellow-300' :
    'border-gray-200';

  const scoreColor =
    score >= 80 ? 'text-green-600' :
    score >= 60 ? 'text-blue-600'  :
    score >= 40 ? 'text-yellow-600' :
    'text-gray-500';

  const scoreLabel =
    score >= 80 ? 'Excellent Match' :
    score >= 60 ? 'Good Match'      :
    score >= 40 ? 'Fair Match'      :
    'Browse Role';

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getApplyUrl(job), '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow cursor-pointer border-2 ${borderColor}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight mb-1 truncate">{job.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {job.location}
              </span>
            </div>
          </div>

          {score > 0 && (
            <div className="text-right shrink-0">
              <div className={`text-2xl font-bold ${scoreColor}`}>{score}%</div>
              <Badge variant="secondary" className="text-xs mt-0.5">{scoreLabel}</Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Skill match bar — only shown when we have a score */}
        {score > 0 && total > 0 && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Skill match</span>
              <span>{matched}/{total} skills</span>
            </div>
            <Progress value={(matched / total) * 100} className="h-1.5" />
          </div>
        )}

        {/* Required skills */}
        {job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.slice(0, 6).map((skill) => {
              const has = matchedSkills.includes(skill);
              return (
                <Badge
                  key={skill}
                  variant="secondary"
                  className={has
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-gray-100 text-gray-700'}
                >
                  {skill}
                </Badge>
              );
            })}
            {job.requiredSkills.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{job.requiredSkills.length - 6} more
              </Badge>
            )}
          </div>
        )}

        {/* Description snippet */}
        {job.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>
        )}

        {/* Improvement tip */}
        {score > 0 && score < 80 && (
          <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
            <span className="text-blue-700">
              Add more matching skills to improve your score for this role.
            </span>
          </div>
        )}

        {/* Apply button */}
        <Button
          className="w-full"
          onClick={handleApply}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Apply on {getSourceLabel(job.source)}
        </Button>
      </CardContent>
    </Card>
  );
}
