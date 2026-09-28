import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BookOpen, 
  Target,
  FileText,
  MessageSquare,
  Briefcase,
  Award
} from "lucide-react";

interface QuickStartMenuProps {
  onQuestionSelect: (question: string) => void;
}

const quickStartQuestions = [
  {
    category: "Job Search",
    icon: Search,
    questions: [
      "How do I find the right job opportunities?",
      "What's the best way to apply for jobs?",
      "How can I stand out in a competitive market?",
      "Should I apply to jobs I'm not 100% qualified for?"
    ]
  },
  {
    category: "Resume & Interview",
    icon: FileText,
    questions: [
      "How do I write a compelling resume summary?",
      "What should I include in my cover letter?",
      "How do I prepare for technical interviews?",
      "What are the most common interview questions?"
    ]
  },
  {
    category: "Skills & Learning",
    icon: BookOpen,
    questions: [
      "What skills are most in-demand right now?",
      "How do I choose what to learn next?",
      "What's the best way to learn new technologies?",
      "How do I stay updated with industry trends?"
    ]
  },
  {
    category: "Career Growth",
    icon: TrendingUp,
    questions: [
      "How do I advance to the next level?",
      "What should I focus on for promotion?",
      "How do I transition to a new role?",
      "What are the signs I'm ready for a change?"
    ]
  },
  {
    category: "Networking",
    icon: Users,
    questions: [
      "How do I build a professional network?",
      "What's the best way to reach out to people?",
      "How do I maintain professional relationships?",
      "Should I attend networking events?"
    ]
  },
  {
    category: "Salary & Negotiation",
    icon: DollarSign,
    questions: [
      "How do I research salary ranges?",
      "When and how should I negotiate salary?",
      "What benefits should I consider?",
      "How do I handle counter-offers?"
    ]
  }
];

export function QuickStartMenu({ onQuestionSelect }: QuickStartMenuProps) {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Target className="h-6 w-6 text-primary" />
            Quick Start Career Questions
          </CardTitle>
          <CardDescription className="text-base">
            Click on any question below to get detailed, personalized career advice
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickStartQuestions.map((category, categoryIndex) => {
          const IconComponent = category.icon;
          return (
            <Card key={categoryIndex} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconComponent className="h-5 w-5 text-primary" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.questions.map((question, questionIndex) => (
                    <Button
                      key={questionIndex}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3 text-sm hover:bg-primary/10"
                      onClick={() => onQuestionSelect(question)}
                    >
                      <span className="text-left">{question}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Popular Career Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "Remote Work Tips",
              "Career Pivot Guide",
              "Leadership Skills",
              "Technical Interviews",
              "Portfolio Building",
              "LinkedIn Optimization",
              "Freelancing",
              "Industry Certifications"
            ].map((topic, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onQuestionSelect(`Tell me about ${topic.toLowerCase()}`)}
              >
                {topic}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
