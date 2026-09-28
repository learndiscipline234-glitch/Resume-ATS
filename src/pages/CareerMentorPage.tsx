import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { QuickStartMenu } from "@/components/QuickStartMenu";
import { CareerMentor } from "@/components/CareerMentor";
import { ArrowLeft, MessageSquare, Lightbulb, FileText, CheckCircle2 } from "lucide-react";

// ── Pull real data from localStorage ─────────────────────────────────────────

function buildAnalysisFromStorage() {
  try {
    const ca   = JSON.parse(localStorage.getItem('lastAnalysisResult') ?? 'null');
    const role = localStorage.getItem('lastDetectedRole') ?? 'software_developer';
    if (!ca) return null;

    const roleLabel = role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    const matched: string[] = (ca.skillMatch?.matchedSkills ?? []).map(
      (s: any) => typeof s === 'string' ? s : s.skill
    );
    const missing: string[] = (ca.skillMatch?.missingSkills ?? []).map(
      (s: any) => typeof s === 'string' ? s : s.skill
    );
    const expYears = ca.resumeScore?.breakdown?.factors?.experienceYears ?? 2;

    const user_skills = matched.map((name, i) => ({
      name,
      confidence: Math.max(0.5, 0.95 - i * 0.05),
    }));

    const suggested_skills = missing.slice(0, 6).map((name, i) => ({
      name,
      priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
      reason: `${name} is a key skill for ${roleLabel} roles`,
      recommended_action: `Learn ${name} through online courses and build a project using it`,
    }));

    const skills_chart = [
      ...matched.slice(0, 6).map((name, i) => ({ name, score: Math.max(50, 90 - i * 8) })),
      ...missing.slice(0, 4).map((name, i) => ({ name, score: Math.max(10, 30 - i * 5) })),
    ];

    const matchScore = ca.skillMatch?.matchScore ?? 0;
    const totalScore = ca.resumeScore?.totalScore ?? 0;

    return {
      user_skills,
      suggested_skills,
      skills_chart,
      top_recommendations: [
        {
          title: `Improve ${missing[0] ?? 'key skills'}`,
          details: `Adding ${missing[0] ?? 'missing skills'} would significantly boost your ${roleLabel} profile`,
          impact: 'high',
        },
        {
          title: 'Build portfolio projects',
          details: 'Create 2-3 projects showcasing your matched skills',
          impact: 'high',
        },
        {
          title: 'Optimise resume sections',
          details: `Your resume scored ${totalScore}/100 — focus on experience and projects sections`,
          impact: 'medium',
        },
      ],
      resume_elevator_pitch: `${roleLabel} with ${expYears}+ years of experience, skilled in ${matched.slice(0, 3).join(', ')}, with a ${matchScore}% role match score.`,
      suggested_keywords: [...matched.slice(0, 5), ...missing.slice(0, 3)],
      summary_text: `Strong foundation in ${matched.slice(0, 3).join(', ')}. Focus on ${missing.slice(0, 2).join(' and ')} to advance your career.`,
      metadata: { model_confidence: 0.88 },
      _meta: { roleLabel, expYears, matchScore },
    };
  } catch { return null; }
}

// ── Fallback mock (used when no resume uploaded) ──────────────────────────────

const FALLBACK_ANALYSIS = {
  user_skills: [
    { name: "JavaScript", confidence: 0.85 },
    { name: "React",      confidence: 0.80 },
    { name: "Node.js",    confidence: 0.75 },
    { name: "Python",     confidence: 0.70 },
    { name: "SQL",        confidence: 0.65 },
  ],
  suggested_skills: [
    { name: "TypeScript", priority: "high",   reason: "Type safety for large codebases",          recommended_action: "Complete TypeScript course and migrate a JS project" },
    { name: "AWS",        priority: "high",   reason: "Cloud skills increase salary by 25%",       recommended_action: "Start with AWS Free Tier, aim for Solutions Architect cert" },
    { name: "Docker",     priority: "medium", reason: "Essential for modern deployment workflows", recommended_action: "Learn Docker fundamentals and containerise 2-3 projects" },
    { name: "GraphQL",    priority: "medium", reason: "Growing API development skill",             recommended_action: "Build a GraphQL API with Node.js and React" },
  ],
  skills_chart: [
    { name: "JavaScript", score: 85 }, { name: "React",      score: 80 },
    { name: "Node.js",    score: 75 }, { name: "Python",     score: 70 },
    { name: "SQL",        score: 65 }, { name: "TypeScript", score: 30 },
    { name: "AWS",        score: 25 }, { name: "Docker",     score: 20 },
  ],
  top_recommendations: [
    { title: "Learn TypeScript",       details: "Improve code quality and developer experience",                  impact: "high"   },
    { title: "Get Cloud Certified",    details: "AWS or Azure certification boosts market value significantly",   impact: "high"   },
    { title: "Build Portfolio Projects", details: "Create 2-3 full-stack projects showcasing your skills",       impact: "medium" },
  ],
  resume_elevator_pitch: "Full-stack developer with 3+ years building scalable web applications using React and Node.js.",
  suggested_keywords: ["JavaScript", "React", "Node.js", "TypeScript", "AWS", "Docker", "Full-stack"],
  summary_text: "Strong technical foundation with JavaScript and React; focus on TypeScript and cloud to advance to senior roles.",
  metadata: { model_confidence: 0.88 },
  _meta: { roleLabel: "Software Developer", expYears: 2, matchScore: 0 },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CareerMentorPage() {
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [customQuestion, setCustomQuestion]     = useState("");
  const [showAnalysis, setShowAnalysis]         = useState(false);

  const liveAnalysis = useMemo(buildAnalysisFromStorage, []);
  const analysis     = liveAnalysis ?? FALLBACK_ANALYSIS;
  const hasRealData  = liveAnalysis !== null;

  const { roleLabel, expYears } = (analysis as any)._meta ?? { roleLabel: 'Software Developer', expYears: 2 };
  const userSkillNames = analysis.user_skills.map(s => s.name);

  const handleQuestionSelect = (q: string) => { setSelectedQuestion(q); setShowAnalysis(true); };
  const handleCustomQuestion  = () => { if (customQuestion.trim()) { setSelectedQuestion(customQuestion); setShowAnalysis(true); } };
  const handleBack            = () => { setSelectedQuestion(""); setShowAnalysis(false); };

  if (showAnalysis && selectedQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-light p-8">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quick Start Menu
          </Button>
          <h1 className="text-3xl font-bold mb-1">Career Mentor Response</h1>
          <p className="text-muted-foreground mb-6">Your question: "{selectedQuestion}"</p>
          <CareerMentor
            analysis={analysis}
            userSkills={userSkillNames}
            targetRole={roleLabel}
            experienceYears={expYears}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-light p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-4">
            <span className="gradient-text">AI Career</span> Mentor
          </h1>
          <p className="text-xl text-muted-foreground">
            Get personalised career guidance, skill recommendations, and actionable advice.
          </p>

          {/* Data source indicator */}
          <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${
            hasRealData
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            {hasRealData
              ? <><CheckCircle2 className="h-4 w-4" /> Using your resume data — {roleLabel}, {userSkillNames.length} skills</>
              : <><FileText className="h-4 w-4" /> Using demo data — <button className="underline font-medium" onClick={() => navigate('/resume')}>upload your resume</button> for personalised advice</>
            }
          </div>
        </div>

        <Tabs defaultValue="quickstart" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="custom">Custom Question</TabsTrigger>
            <TabsTrigger value="analysis">Your Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="mt-6">
            <QuickStartMenu onQuestionSelect={handleQuestionSelect} />
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Ask a Custom Question
                </CardTitle>
                <CardDescription>Have a specific career question? Ask anything.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="e.g., How do I transition from frontend to full-stack development?"
                  value={customQuestion}
                  onChange={e => setCustomQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCustomQuestion()}
                  className="h-12"
                />
                <Button onClick={handleCustomQuestion} disabled={!customQuestion.trim()} className="w-full">
                  Get Career Advice
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Your Skills ({analysis.user_skills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.user_skills.map(s => (
                      <Badge key={s.name} className="bg-green-100 text-green-800 border-green-200">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Suggested Skills ({analysis.suggested_skills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.suggested_skills.map(s => (
                      <div key={s.name} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{s.name}</span>
                        <Badge variant="outline" className={
                          s.priority === 'high'   ? 'border-red-300 text-red-600' :
                          s.priority === 'medium' ? 'border-amber-300 text-amber-600' :
                                                    'border-gray-300 text-gray-500'
                        }>
                          {s.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.top_recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        r.impact === 'high' ? 'bg-red-500' : r.impact === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.details}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
