import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Target, TrendingUp, AlertCircle, CheckCircle, Brain, Award, Star, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getContrastText, getTextShadow } from '@/utils/colorUtils';

// ── Staggered badge list ──────────────────────────────────────────────────────
function SkillBadgeList({ skills, className }: { skills: string[]; className?: string }) {
  return (
    <motion.div
      className="flex flex-wrap gap-2"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
    >
      {skills.map((skill, i) => (
        <motion.div
          key={`${skill}-${i}`}
          variants={{
            hidden:  { opacity: 0, x: -15 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
          }}
        >
          <Badge variant="secondary" className={className}>
            {skill}
          </Badge>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface AnalysisResultsProps {
  result: any;
  onStartOver: () => void;
}

export function AnalysisResults({ result, onStartOver }: AnalysisResultsProps) {
  const { analysis, prediction, metadata, comprehensiveAnalysis } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle>Resume Analysis Complete</CardTitle>
            </div>
            <Button variant="outline" onClick={onStartOver}>
              Upload Another Resume
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">File:</span>
              <p className="font-medium">{metadata.fileName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Size:</span>
              <p className="font-medium">{Math.round(metadata.fileSize / 1024)} KB</p>
            </div>
            <div>
              <span className="text-muted-foreground">Text Length:</span>
              <p className="font-medium">{metadata.textLength} chars</p>
            </div>
            <div>
              <span className="text-muted-foreground">Target Role:</span>
              <p className="font-medium">{metadata.targetRole}</p>
            </div>
          </div>
          {(metadata.analysisId || metadata.predictionId) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg" style={{ color: '#1a1a2e' }}>
              <p className="text-sm" style={{ color: '#1a1a2e', textShadow: getTextShadow() }}>
                ✅ Data saved to Advanced DBMS:
                {metadata.analysisId && ` Analysis ID: ${metadata.analysisId.substring(0, 8)}...`}
                {metadata.predictionId && ` | Prediction ID: ${metadata.predictionId.substring(0, 8)}...`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ML Prediction */}
      {prediction && (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>ML Placement Prediction</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {Math.round(prediction.predicted_probability * 100)}%
                </div>
                <p className="text-sm text-muted-foreground mb-4">Placement Probability</p>
                <Progress value={prediction.predicted_probability * 100} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {prediction.prediction_metadata?.analysis_summary?.overall_assessment}
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold mb-2">
                  {Math.round(prediction.confidence_score * 100)}%
                </div>
                <p className="text-sm text-muted-foreground mb-4">Model Confidence</p>
                <div className="space-y-1">
                  {prediction.prediction_metadata?.model_confidence_factors?.slice(0, 3).map((factor: string, index: number) => (
                    <p key={index} className="text-xs text-muted-foreground">• {factor}</p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Neuro-Fuzzy AI Evaluation */}
      {(comprehensiveAnalysis?.neuralScore != null || comprehensiveAnalysis?.fuzzyRating) && (
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50" style={{ color: '#1a1a2e' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" style={{ color: '#1a1a2e' }}>
              <Zap className="h-5 w-5 text-purple-600" />
              <span>Neuro-Fuzzy AI Evaluation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {comprehensiveAnalysis.neuralScore != null && (
                <div className="text-center p-4 bg-white rounded-lg border border-purple-100" style={{ color: '#1a1a2e' }}>
                  <div className="text-3xl font-bold text-purple-600 mb-1" style={{ textShadow: getTextShadow() }}>
                    {Math.round(comprehensiveAnalysis.neuralScore)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Neural Score / 100</p>
                  <Progress value={comprehensiveAnalysis.neuralScore} className="h-2" />
                </div>
              )}
              {comprehensiveAnalysis.fuzzyRating && (
                <div className="text-center p-4 bg-white rounded-lg border border-purple-100" style={{ color: '#1a1a2e' }}>
                  <Badge
                    className={`text-lg px-4 py-2 mb-2 ${
                      comprehensiveAnalysis.fuzzyRating === 'Excellent' ? 'bg-blue-100 text-blue-800' :
                      comprehensiveAnalysis.fuzzyRating === 'Good'      ? 'bg-green-100 text-green-800' :
                      comprehensiveAnalysis.fuzzyRating === 'Average'   ? 'bg-yellow-100 text-yellow-800' :
                                                                          'bg-red-100 text-red-800'
                    }`}
                  >
                    {comprehensiveAnalysis.fuzzyRating}
                  </Badge>
                  <p className="text-sm text-muted-foreground">Fuzzy Rating</p>
                </div>
              )}
              {comprehensiveAnalysis.hiringRecommendation && (
                <div className="text-center p-4 bg-white rounded-lg border border-purple-100" style={{ color: '#1a1a2e' }}>
                  <div className="flex justify-center mb-2">
                    <Users className={`h-8 w-8 ${
                      comprehensiveAnalysis.hiringRecommendation === 'Strong Candidate' ? 'text-green-600' :
                      comprehensiveAnalysis.hiringRecommendation === 'Consider'         ? 'text-yellow-600' :
                                                                                          'text-red-600'
                    }`} />
                  </div>
                  <p className={`font-semibold ${
                    comprehensiveAnalysis.hiringRecommendation === 'Strong Candidate' ? 'text-green-700' :
                    comprehensiveAnalysis.hiringRecommendation === 'Consider'         ? 'text-yellow-700' :
                                                                                        'text-red-700'
                  }`}>
                    {comprehensiveAnalysis.hiringRecommendation}
                  </p>
                  <p className="text-sm text-muted-foreground">AI Recommendation</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume Score */}
      {comprehensiveAnalysis?.resumeScore && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50" style={{ color: '#1a1a2e' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" style={{ color: '#1a1a2e' }}>
              <Award className="h-5 w-5 text-blue-600" />
              <span>Resume Score Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2" style={{ textShadow: getTextShadow() }}>
                  {comprehensiveAnalysis.resumeScore.totalScore}/100
                </div>
                <p className="text-sm text-muted-foreground mb-4">Overall Resume Score</p>
                <Progress value={comprehensiveAnalysis.resumeScore.totalScore} className="mb-2 h-3" />
                <Badge
                  variant={
                    comprehensiveAnalysis.resumeScore.qualityFlag === 'excellent' ? 'default' :
                    comprehensiveAnalysis.resumeScore.qualityFlag === 'competitive' ? 'secondary' : 'destructive'
                  }
                  className="mt-2"
                >
                  {comprehensiveAnalysis.resumeScore.qualityFlag === 'excellent' ? 'Excellent' :
                   comprehensiveAnalysis.resumeScore.qualityFlag === 'competitive' ? 'Competitive' : 'Needs Improvement'}
                </Badge>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Skills (40%)',     val: comprehensiveAnalysis.resumeScore.componentScores.skillsScore },
                  { label: 'Projects (25%)',   val: comprehensiveAnalysis.resumeScore.componentScores.projectsScore },
                  { label: 'Experience (20%)', val: comprehensiveAnalysis.resumeScore.componentScores.experienceScore },
                  { label: 'Education (15%)',  val: comprehensiveAnalysis.resumeScore.componentScores.educationScore },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{label}</span>
                      <span className="font-medium">{val}/100</span>
                    </div>
                    <Progress value={val} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Match Visualization */}
      {comprehensiveAnalysis?.skillMatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>Skill Match Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {comprehensiveAnalysis.skillMatch.matchScore}%
                </div>
                <p className="text-sm text-muted-foreground mb-4">Match Score</p>
                <Progress value={comprehensiveAnalysis.skillMatch.matchScore} className="mb-2" />
                <Badge variant="secondary" className="mt-2">
                  {comprehensiveAnalysis.skillMatch.matchQuality}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded" style={{ color: '#1a1a2e' }}>
                  <span className="text-sm">Matched Skills</span>
                  <span className="font-bold text-green-700" style={{ textShadow: getTextShadow() }}>{comprehensiveAnalysis.skillMatch.matchedSkills.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded" style={{ color: '#1a1a2e' }}>
                  <span className="text-sm">Missing Skills</span>
                  <span className="font-bold text-orange-700" style={{ textShadow: getTextShadow() }}>{comprehensiveAnalysis.skillMatch.missingSkills.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded" style={{ color: '#1a1a2e' }}>
                  <span className="text-sm">Target Role</span>
                  <span className="font-bold text-blue-700" style={{ textShadow: getTextShadow() }}>{comprehensiveAnalysis.skillMatch.targetRole}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Matched skills by importance */}
              {(['critical', 'important', 'nice-to-have'] as const).map((importance) => {
                const skills = comprehensiveAnalysis.skillMatch.matchedSkills
                  .filter((s: any) => s.importance === importance)
                  .map((s: any) => s.skill);
                if (skills.length === 0) return null;
                return (
                  <div key={importance}>
                    <h4 className="text-sm font-medium mb-2 capitalize flex items-center space-x-2">
                      <Star className={`h-4 w-4 ${
                        importance === 'critical' ? 'text-red-500' :
                        importance === 'important' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <span>{importance === 'nice-to-have' ? 'Nice to Have' : importance} Skills Matched</span>
                    </h4>
                    <SkillBadgeList skills={skills} className="bg-green-100 text-green-800" />
                  </div>
                );
              })}

              {/* Missing skills by importance */}
              {(['critical', 'important', 'nice-to-have'] as const).map((importance) => {
                const skills = comprehensiveAnalysis.skillMatch.missingSkills
                  .filter((s: any) => s.importance === importance)
                  .map((s: any) => s.skill);
                if (skills.length === 0) return null;
                return (
                  <div key={`missing-${importance}`}>
                    <h4 className="text-sm font-medium mb-2 capitalize flex items-center space-x-2">
                      <AlertCircle className={`h-4 w-4 ${
                        importance === 'critical' ? 'text-red-500' :
                        importance === 'important' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <span>{importance === 'nice-to-have' ? 'Nice to Have' : importance} Skills to Learn</span>
                    </h4>
                    <SkillBadgeList skills={skills} className="bg-orange-100 text-orange-800" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Quality */}
      {comprehensiveAnalysis?.sectionAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Section Quality Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Completeness</span>
                <span className="text-2xl font-bold text-purple-600">
                  {comprehensiveAnalysis.sectionAnalysis.completeness}%
                </span>
              </div>
              <Progress value={comprehensiveAnalysis.sectionAnalysis.completeness} className="h-3" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Detected Sections ({comprehensiveAnalysis.sectionAnalysis.detectedSections.length})</span>
                </h4>
                <SkillBadgeList
                  skills={comprehensiveAnalysis.sectionAnalysis.detectedSections}
                  className="bg-green-100 text-green-800"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span>Missing Sections ({comprehensiveAnalysis.sectionAnalysis.missingSections.length})</span>
                </h4>
                <SkillBadgeList
                  skills={comprehensiveAnalysis.sectionAnalysis.missingSections}
                  className="bg-orange-100 text-orange-800"
                />
              </div>
            </div>

            {Object.keys(comprehensiveAnalysis.sectionAnalysis.sectionQuality || {}).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Section Quality Scores</h4>
                {Object.entries(comprehensiveAnalysis.sectionAnalysis.sectionQuality).map(([section, quality]: [string, any]) => (
                  <div key={section} className="p-3 bg-gray-50 rounded-lg" style={{ color: '#1a1a2e' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{section}</span>
                      <span className="text-sm font-bold" style={{ textShadow: getTextShadow() }}>{quality.score}/100</span>
                    </div>
                    <Progress value={quality.score} className="h-2 mb-2" />
                    {quality.issues?.length > 0 && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        {quality.issues.map((issue: string, idx: number) => (
                          <p key={idx}>• {issue}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trending Skills */}
      {comprehensiveAnalysis?.trendingSkills?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <span>Trending Skills in Your Field</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {comprehensiveAnalysis.trendingSkills.slice(0, 10).map((skill: any, idx: number) => (
                <div key={idx} className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200" style={{ color: '#1a1a2e' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{skill.skill}</span>
                    <Badge
                      variant={skill.trend === 'rising' ? 'default' : skill.trend === 'stable' ? 'secondary' : 'outline'}
                      className={
                        skill.trend === 'rising' ? 'bg-green-100 text-green-800' :
                        skill.trend === 'stable' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {skill.trend}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Demand: {skill.demandScore}/100</span>
                    <span>Growth: {skill.growthRate > 0 ? '+' : ''}{skill.growthRate}%</span>
                  </div>
                  <Progress value={skill.demandScore} className="h-1 mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Match Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.matchScore}%</div>
            <Progress value={analysis.matchScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {analysis.matchScore >= 80 ? 'Excellent match!' :
               analysis.matchScore >= 60 ? 'Good match' : 'Room for improvement'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Identified</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.user_skills?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {analysis.matchedSkills?.length || 0} matched, {analysis.missingSkills?.length || 0} missing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience Level</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prediction?.input_features?.experience_years || 0}+ years
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {prediction?.input_features?.education_level || 'Bachelor'} degree
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom skills breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Matched Skills ({analysis.matchedSkills?.length || 0})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.matchedSkills?.length > 0 ? (
              <>
                <SkillBadgeList
                  skills={(analysis.matchedSkills as string[]).slice(0, 12)}
                  className="bg-green-100 text-green-800"
                />
                {analysis.matchedSkills.length > 12 && (
                  <Badge variant="outline" className="mt-2">+{analysis.matchedSkills.length - 12} more</Badge>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No matched skills found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Skills to Learn ({analysis.missingSkills?.length || 0})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.missingSkills?.length > 0 ? (
              <>
                <SkillBadgeList
                  skills={(analysis.missingSkills as string[]).slice(0, 12)}
                  className="bg-orange-100 text-orange-800"
                />
                {analysis.missingSkills.length > 12 && (
                  <Badge variant="outline" className="mt-2">+{analysis.missingSkills.length - 12} more</Badge>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No skill gaps identified</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Top Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.top_recommendations?.slice(0, 5).map((rec: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg" style={{ color: '#1a1a2e' }}>
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  rec.impact === 'high' ? 'bg-red-500' :
                  rec.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div>
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground">{rec.details}</p>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No specific recommendations available</p>}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            {analysis.summary_text || 'Resume analysis completed successfully. Review the skills breakdown and recommendations above to improve your profile.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
