import React, { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, CheckCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SkillsComparisonChart } from "@/components/SkillsComparisonChart";

import { EnhancedSkillAnalysis } from "@/lib/enhancedResumeAnalysisService";

interface UserSkill {
  name: string;
  confidence: number;
  score: number;
  addedAt: Date;
}

interface SkillAnalyzerCardProps {
  analysis: EnhancedSkillAnalysis;
  onAddSkill?: (skill: string) => void;
  onAddToLearningPlan?: (skill: string) => void;
}

export function SkillAnalyzerCard({ analysis, onAddSkill, onAddToLearningPlan }: SkillAnalyzerCardProps) {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const { toast } = useToast();

  if (!analysis) return null;

  // Prepare data for radar chart - ensure all scores are 0-100
  const chartData = analysis.skills_chart.map(s => ({
    skill: s.name,
    score: Math.max(0, Math.min(100, s.score))
  }));

  // Prepare data for comparison chart (user skills vs suggested skills)
  const comparisonChartData = [
    ...analysis.user_skills.map(skill => ({
      skill: skill.name,
      userScore: Math.round(skill.confidence * 100),
      suggestedScore: analysis.skills_chart.find(s => s.name === skill.name)?.score || 0,
      type: 'existing' as const
    })),
    ...analysis.suggested_skills.map(skill => ({
      skill: skill.name,
      userScore: userSkills.find(s => s.name === skill.name)?.score || 0,
      suggestedScore: analysis.skills_chart.find(s => s.name === skill.name)?.score || 0,
      type: 'suggested' as const
    }))
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return "🔴";
      case "medium": return "🟡";
      case "low": return "🟢";
      default: return "⚪";
    }
  };

  const handleAddSkill = (skillName: string) => {
    // Check if skill already exists
    if (userSkills.some(skill => skill.name === skillName)) {
      toast({
        title: "Skill already added",
        description: `${skillName} is already in your skills.`,
        variant: "destructive"
      });
      return;
    }

    // Find the skill in suggested skills to get priority and recommended action
    const suggestedSkill = analysis.suggested_skills.find(s => s.name === skillName);
    const chartSkill = analysis.skills_chart.find(s => s.name === skillName);
    
    const newSkill: UserSkill = {
      name: skillName,
      confidence: 0.5, // Default confidence when manually added
      score: chartSkill?.score || 50,
      addedAt: new Date()
    };

    setUserSkills(prev => [...prev, newSkill]);
    
    toast({
      title: "Skill added!",
      description: `${skillName} has been added to your profile.`,
    });

    // Call parent callback if provided
    if (onAddSkill) {
      onAddSkill(skillName);
    }
  };

  const handleLearnMore = (skillName: string) => {
    // Find the skill in suggested skills to get the recommended action
    const suggestedSkill = analysis.suggested_skills.find(s => s.name === skillName);
    
    if (suggestedSkill?.recommended_action) {
      // Extract URLs from recommended action (simple regex for demo)
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = suggestedSkill.recommended_action.match(urlRegex);
      
      if (urls && urls.length > 0) {
        window.open(urls[0], '_blank', 'noopener,noreferrer');
      } else {
        // Fallback: search for the skill on a learning platform
        const searchUrl = `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skillName)}`;
        window.open(searchUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Fallback: search for the skill on a learning platform
      const searchUrl = `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skillName)}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }

    if (onAddToLearningPlan) {
      onAddToLearningPlan(skillName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Skills Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Skills Overview</span>
            <Badge variant="outline" className="text-xs">
              Confidence: {Math.round(analysis.metadata.model_confidence * 100)}%
            </Badge>
          </CardTitle>
          <CardDescription>
            Visual representation of your current skill levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="90%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="skill" 
                  tick={{ fontSize: 12 }}
                  className="text-xs"
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                />
                <Radar 
                  name="score" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3} 
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Your Skills Section */}
      {userSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Your Skills
            </CardTitle>
            <CardDescription>
              Skills you've added to your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {userSkills.map((skill, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">{skill.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {skill.score}/100
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Recommendations and Suggested Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Recommendations</CardTitle>
            <CardDescription>
              Priority actions to improve your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.top_recommendations.map((rec, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{rec.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(rec.impact)}`}
                    >
                      {rec.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.details}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Suggested Skills
            </CardTitle>
            <CardDescription>
              Skills to learn for better job prospects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {analysis.suggested_skills.map((skill, i) => (
                <Card key={i} className="border-2 hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{skill.name}</h4>
                        <Badge 
                          className={`text-xs px-2 py-1 ${getPriorityColor(skill.priority)}`}
                        >
                          {getPriorityIcon(skill.priority)} {skill.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {skill.reason}
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800 font-medium mb-1">💡 Recommended Action:</p>
                      <p className="text-xs text-blue-700">{skill.recommended_action}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleAddSkill(skill.name)}
                        className="text-xs bg-primary hover:bg-primary/90 text-white"
                        disabled={userSkills.some(s => s.name === skill.name)}
                      >
                        {userSkills.some(s => s.name === skill.name) ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            Add to Profile
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleLearnMore(skill.name)}
                        className="text-xs border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resume Elevator Pitch */}
      <Card>
        <CardHeader>
          <CardTitle>Resume Elevator Pitch</CardTitle>
          <CardDescription>
            Suggested summary for the top of your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm italic">"{analysis.resume_elevator_pitch}"</p>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Keywords</CardTitle>
          <CardDescription>
            Keywords to include in job applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.suggested_keywords.map((keyword, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{analysis.summary_text}</p>
        </CardContent>
      </Card>

      {/* Skills Comparison Chart */}
      {(userSkills.length > 0 || analysis.suggested_skills.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Skills Comparison</CardTitle>
            <CardDescription>
              Your skills vs suggested skills - see where you stand and what to learn next
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{userSkills.length}</div>
                  <div className="text-sm text-green-700">Your Skills</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analysis.suggested_skills.length}</div>
                  <div className="text-sm text-blue-700">Suggested Skills</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analysis.user_skills.length}</div>
                  <div className="text-sm text-purple-700">Detected Skills</div>
                </div>
              </div>
              
              <SkillsComparisonChart data={comparisonChartData} />
              
              {/* Debug info - remove in production */}
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">View raw chart data</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(comparisonChartData, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
