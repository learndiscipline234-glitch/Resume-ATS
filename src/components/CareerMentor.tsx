import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  Users, 
  DollarSign, 
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Star,
  ExternalLink
} from "lucide-react";
import { SkillAnalysis } from "./SkillAnalyzerCard";

interface CareerMentorProps {
  analysis: SkillAnalysis;
  userSkills?: string[];
  targetRole?: string;
  experienceYears?: number;
}

interface CareerAdvice {
  overview: string;
  steps: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    resources?: string[];
  }>;
  examples: string[];
  nextSteps: string[];
  skillComparison: {
    current: string[];
    suggested: string[];
    priority: Array<{
      skill: string;
      level: "high" | "medium" | "low";
      reason: string;
    }>;
  };
}

export function CareerMentor({ analysis, userSkills = [], targetRole, experienceYears }: CareerMentorProps) {
  const [selectedAdvice, setSelectedAdvice] = useState<string>("overview");

  // Generate personalized career advice based on analysis
  const generateCareerAdvice = (): CareerAdvice => {
    const detectedSkills = analysis.user_skills.map(s => s.name);
    const suggestedSkills = analysis.suggested_skills.map(s => s.name);
    const allSkills = [...new Set([...detectedSkills, ...userSkills])];

    return {
      overview: `Based on your resume analysis, you have strong technical foundations in ${detectedSkills.slice(0, 3).join(", ")}. Your ${experienceYears || 3}+ years of experience positions you well for ${targetRole || "senior-level roles"}. The key is to bridge the gap between your current skills and market demands while building strategic expertise.`,

      steps: [
        {
          title: "Immediate Skill Gaps (Next 30 Days)",
          description: "Focus on the highest-impact skills that can be learned quickly and have immediate market value.",
          priority: "high",
          resources: [
            "Complete 2-3 online courses in your priority skills",
            "Build 1-2 portfolio projects demonstrating new skills",
            "Update your resume and LinkedIn with new skills"
          ]
        },
        {
          title: "Strategic Skill Development (Next 90 Days)",
          description: "Develop deeper expertise in areas that align with your career goals and market trends.",
          priority: "high",
          resources: [
            "Join professional communities and attend meetups",
            "Contribute to open-source projects",
            "Get certified in high-demand technologies"
          ]
        },
        {
          title: "Network and Visibility (Ongoing)",
          description: "Build your professional network and increase your visibility in the industry.",
          priority: "medium",
          resources: [
            "Attend industry conferences and events",
            "Write technical blog posts or create content",
            "Connect with 5-10 professionals in your target role weekly"
          ]
        },
        {
          title: "Long-term Career Growth (6+ Months)",
          description: "Focus on leadership, specialization, or career transition based on your goals.",
          priority: "low",
          resources: [
            "Consider advanced certifications or degrees",
            "Mentor junior developers or contribute to team growth",
            "Explore side projects or entrepreneurial opportunities"
          ]
        }
      ],

      examples: [
        `"I improved our application performance by 40% using ${suggestedSkills[0] || 'Docker'} containerization, reducing deployment time from 2 hours to 15 minutes."`,
        `"Led a team of 4 developers to build a microservices architecture using ${suggestedSkills[1] || 'Kubernetes'}, handling 10x more traffic than before."`,
        `"Implemented automated testing pipeline using ${suggestedSkills[2] || 'CI/CD'} tools, reducing bug reports by 60% in production."`
      ],

      nextSteps: [
        "Choose 2-3 priority skills from the suggested list",
        "Set up a 30-day learning plan with specific milestones",
        "Update your resume with quantifiable achievements",
        "Start networking with professionals in your target role",
        "Build and showcase 1-2 portfolio projects"
      ],

      skillComparison: {
        current: allSkills,
        suggested: suggestedSkills,
        priority: analysis.suggested_skills.map(skill => ({
          skill: skill.name,
          level: skill.priority,
          reason: skill.reason
        }))
      }
    };
  };

  const advice = generateCareerAdvice();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Target className="h-6 w-6 text-primary" />
            AI Career Mentor
          </CardTitle>
          <CardDescription className="text-base">
            Personalized career guidance based on your resume analysis
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Career Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed text-muted-foreground">
            {advice.overview}
          </p>
        </CardContent>
      </Card>

      {/* Tabs for different advice sections */}
      <Tabs value={selectedAdvice} onValueChange={setSelectedAdvice} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Action Plan</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {advice.steps.map((step, index) => (
              <Card key={index} className="border-l-4 border-l-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">Step {index + 1}</span>
                      <Badge className={`text-xs ${getPriorityColor(step.priority)}`}>
                        {getPriorityIcon(step.priority)} {step.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground mb-3">{step.description}</p>
                  {step.resources && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Action Items:</h4>
                      <ul className="space-y-1">
                        {step.resources.map((resource, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-3 w-3 mt-1 text-primary flex-shrink-0" />
                            <span>{resource}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Your Current Skills
                </CardTitle>
                <CardDescription>
                  Skills detected from your resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {advice.skillComparison.current.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-500" />
                  Recommended Skills
                </CardTitle>
                <CardDescription>
                  Skills to learn for career growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {advice.skillComparison.priority.map((skill, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                      <span className="font-medium">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getPriorityColor(skill.level)}`}>
                          {getPriorityIcon(skill.level)} {skill.level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skill Gap Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Gap Analysis</CardTitle>
              <CardDescription>
                Why these skills matter for your career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {advice.skillComparison.priority.map((skill, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{skill.skill}</h4>
                      <Badge className={`text-xs ${getPriorityColor(skill.level)}`}>
                        {getPriorityIcon(skill.level)} {skill.level.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{skill.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                Resume Examples
              </CardTitle>
              <CardDescription>
                How to write impactful bullet points for your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {advice.examples.map((example, i) => (
                  <div key={i} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm italic">"{example}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Learning Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  Learning Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">Online Courses</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Udemy - Comprehensive skill courses</li>
                      <li>• Coursera - University-level programs</li>
                      <li>• Pluralsight - Technology-focused training</li>
                      <li>• freeCodeCamp - Free coding bootcamp</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">Certifications</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• AWS Certified Solutions Architect</li>
                      <li>• Google Cloud Professional</li>
                      <li>• Microsoft Azure Fundamentals</li>
                      <li>• Docker Certified Associate</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Networking Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Networking & Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">Professional Networks</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• LinkedIn - Professional networking</li>
                      <li>• GitHub - Open source contributions</li>
                      <li>• Stack Overflow - Technical Q&A</li>
                      <li>• Dev.to - Developer community</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">Events & Meetups</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Local tech meetups</li>
                      <li>• Industry conferences</li>
                      <li>• Virtual workshops</li>
                      <li>• Hackathons</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Next Steps */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Target className="h-5 w-5" />
            Your Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {advice.nextSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
