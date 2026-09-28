import React, { useState } from "react"
import { motion } from "framer-motion"
import { Code, Github, ExternalLink, Star, Calendar, Users, Zap, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ProjectSuggestion {
  id: string
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  skills: string[]
  estimatedTime: string
  features: string[]
  category: string
  githubTemplate?: string
  liveDemo?: string
}

const projectSuggestions: ProjectSuggestion[] = [
  {
    id: "1",
    title: "AI-Powered Task Manager",
    description: "Build a smart task management app with AI categorization and priority suggestions.",
    difficulty: "Intermediate",
    skills: ["React", "Node.js", "OpenAI API", "MongoDB"],
    estimatedTime: "2-3 weeks",
    features: [
      "Task creation and management",
      "AI-powered task categorization",
      "Smart priority suggestions",
      "Real-time collaboration",
      "Analytics dashboard"
    ],
    category: "Full Stack",
    githubTemplate: "https://github.com/templates/ai-task-manager",
    liveDemo: "https://demo.ai-taskmanager.com"
  },
  {
    id: "2", 
    title: "Real-time Chat Application",
    description: "Create a modern chat app with WebSocket support, file sharing, and emoji reactions.",
    difficulty: "Intermediate",
    skills: ["React", "Socket.io", "Express", "PostgreSQL"],
    estimatedTime: "1-2 weeks",
    features: [
      "Real-time messaging",
      "File and image sharing",
      "Emoji reactions",
      "User presence indicators",
      "Message search"
    ],
    category: "Full Stack",
    githubTemplate: "https://github.com/templates/realtime-chat",
    liveDemo: "https://demo.chatapp.com"
  },
  {
    id: "3",
    title: "E-commerce Product Dashboard",
    description: "Build an admin dashboard for managing e-commerce products with analytics and insights.",
    difficulty: "Advanced",
    skills: ["React", "TypeScript", "Chart.js", "REST API"],
    estimatedTime: "3-4 weeks",
    features: [
      "Product CRUD operations",
      "Sales analytics with charts",
      "Inventory management",
      "Order tracking",
      "Customer insights"
    ],
    category: "Frontend",
    githubTemplate: "https://github.com/templates/ecommerce-dashboard"
  }
]

export function PortfolioSuggestions() {
  const [careerGoal, setCareerGoal] = useState("")
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const generateSuggestions = async () => {
    if (!careerGoal.trim()) {
      toast.error("Please enter your career goal")
      return
    }

    setIsGenerating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    setSuggestions(projectSuggestions)
    setHasGenerated(true)
    setIsGenerating(false)
    toast.success("Generated personalized project suggestions!")
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-success/10 text-success"
      case "Intermediate": return "bg-warning/10 text-warning"  
      case "Advanced": return "bg-destructive/10 text-destructive"
      default: return "bg-muted/10 text-muted-foreground"
    }
  }

  const generateGithubRepo = async (project: ProjectSuggestion) => {
    toast.success(`Generated GitHub template for ${project.title}!`)
  }

  return (
    <div className="min-h-screen bg-gradient-surface p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Portfolio <span className="gradient-text">Suggestions</span>
          </motion.h1>
          <p className="text-muted-foreground text-lg">
            Get AI-powered project ideas tailored to your career goals. Build impressive portfolio pieces that showcase your skills.
          </p>
        </div>

        {!hasGenerated ? (
          /* Input Section */
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Target className="h-6 w-6 text-primary" />
                  <span>Personalized Project Suggestions</span>
                </CardTitle>
                <CardDescription>
                  Tell us about your career aspirations and we'll suggest portfolio projects that will help you stand out to employers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="career-goal" className="text-base font-medium">
                    What's your career goal?
                  </Label>
                  <Input
                    id="career-goal"
                    placeholder="e.g., Become a Frontend Developer at a tech startup"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    className="text-base py-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific about the role, industry, or technologies you're interested in.
                  </p>
                </div>

                <Button
                  onClick={generateSuggestions}
                  disabled={!careerGoal.trim() || isGenerating}
                  className="w-full gradient-bg text-white"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Generating Suggestions...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Project Ideas
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold mb-2">
                Perfect Projects for: <span className="gradient-text">"{careerGoal}"</span>
              </h2>
              <p className="text-muted-foreground">
                Here are {suggestions.length} carefully selected projects to boost your portfolio
              </p>
            </motion.div>

            {/* Project Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {suggestions.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-glow transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <Badge className={getDifficultyColor(project.difficulty)}>
                          {project.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="text-base leading-relaxed">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Project Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {project.estimatedTime}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Code className="h-4 w-4 mr-2" />
                          {project.category}
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <h4 className="font-medium mb-2">Technologies:</h4>
                        <div className="flex flex-wrap gap-1">
                          {project.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="font-medium mb-2">Key Features:</h4>
                        <ul className="space-y-1">
                          {project.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start">
                              <Star className="h-3 w-3 mr-2 mt-0.5 text-accent" />
                              {feature}
                            </li>
                          ))}
                          {project.features.length > 3 && (
                            <li className="text-sm text-muted-foreground">
                              +{project.features.length - 3} more features
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 pt-4">
                        <Button
                          className="w-full gradient-bg text-white"
                          onClick={() => generateGithubRepo(project)}
                        >
                          <Github className="mr-2 h-4 w-4" />
                          Generate GitHub Template
                        </Button>
                        
                        <div className="flex gap-2">
                          {project.githubTemplate && (
                            <Button variant="outline" className="flex-1" size="sm">
                              <Code className="mr-2 h-3 w-3" />
                              View Code
                            </Button>
                          )}
                          {project.liveDemo && (
                            <Button variant="outline" className="flex-1" size="sm">
                              <ExternalLink className="mr-2 h-3 w-3" />
                              Live Demo
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Generate More */}
            <div className="text-center mt-8">
              <Button
                variant="outline" 
                onClick={() => {
                  setHasGenerated(false)
                  setSuggestions([])
                }}
              >
                Try Different Career Goal
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}