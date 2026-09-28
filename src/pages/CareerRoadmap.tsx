import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Target, 
  Clock, 
  CheckCircle, 
  Circle, 
  Book, 
  Award, 
  TrendingUp,
  Sparkles,
  ChevronsUpDown,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { SkillCourseDrawer } from "@/components/SkillCourseDrawer"

interface RoadmapStep {
  id: string
  title: string
  description: string
  type: "skill" | "course" | "certification" | "experience"
  duration: string
  priority: "high" | "medium" | "low"
  completed: boolean
  skills: string[]
}

interface Roadmap {
  title: string
  description: string
  timeline: string
  completionRate: number
  steps: RoadmapStep[]
}

// Comprehensive roadmap data (role, category, duration, description, steps)
type RawRoadmap = {
  role: string
  category: string
  duration: string
  description: string
  steps: { title: string; description: string; tags: string[] }[]
}

const CAREER_ROADMAPS: RawRoadmap[] = [
  // --- Software Development ---
  {
    role: "Frontend Developer",
    category: "Software Development",
    duration: "6-12 months",
    description: "Build the visual and interactive parts of websites and applications that users see and interact with.",
    steps: [
      { title: "HTML, CSS, & JavaScript Fundamentals", description: "Master the core building blocks of the web.", tags: ["HTML5", "CSS3", "ES6+"] },
      { title: "Learn a Modern Framework", description: "Choose and master a component-based framework like React, Vue, or Svelte.", tags: ["React", "Vue.js", "Svelte"] },
      { title: "State Management", description: "Understand how to manage application state effectively.", tags: ["Redux", "Zustand", "Pinia"] },
      { title: "Build Tools & Performance", description: "Learn about bundlers, transpilers, and web performance optimization.", tags: ["Vite", "Webpack", "Lighthouse"] },
    ],
  },
  {
    role: "Backend Developer",
    category: "Software Development",
    duration: "8-14 months",
    description: "Build and maintain the server-side logic, databases, and APIs that power applications from behind the scenes.",
    steps: [
      { title: "Choose a Language & Framework", description: "Master a server-side language like Node.js, Python, Go, or Java.", tags: ["Node.js/Express", "Python/Django", "Go/Gin"] },
      { title: "Database Fundamentals", description: "Learn both SQL and NoSQL databases.", tags: ["PostgreSQL", "MongoDB", "Redis"] },
      { title: "API Design", description: "Understand how to build robust and scalable RESTful and GraphQL APIs.", tags: ["REST", "GraphQL", "API Security"] },
      { title: "Authentication & Authorization", description: "Implement secure user login and permission systems.", tags: ["JWT", "OAuth 2.0", "Passport.js"] },
    ],
  },
  {
    role: "Full-Stack Developer",
    category: "Software Development",
    duration: "12-18 months",
    description: "Master both frontend and backend development to build complete web applications from start to finish.",
    steps: [
      { title: "Master Frontend Fundamentals", description: "Complete the Frontend Developer roadmap.", tags: ["HTML", "CSS", "JS", "React/Vue"] },
      { title: "Master Backend Fundamentals", description: "Complete the Backend Developer roadmap.", tags: ["Node.js/Python", "SQL/NoSQL", "APIs"] },
      { title: "Full-Stack Architecture", description: "Understand how frontend and backend systems connect and communicate.", tags: ["Monorepos", "Microfrontends", "Serverless"] },
      { title: "Deployment & DevOps Basics", description: "Learn how to deploy and maintain a full-stack application.", tags: ["Docker", "CI/CD", "Vercel/Netlify"] },
    ],
  },
  {
    role: "Mobile App Developer",
    category: "Software Development",
    duration: "9-15 months",
    description: "Create applications for mobile devices on platforms like iOS and Android.",
    steps: [
      { title: "Choose a Platform", description: "Decide between native (Swift/Kotlin) or cross-platform (React Native/Flutter).", tags: ["iOS/Swift", "Android/Kotlin", "React Native", "Flutter"] },
      { title: "Mobile UI/UX Principles", description: "Learn design patterns and guidelines specific to mobile devices.", tags: ["Material Design", "Human Interface Guidelines"] },
      { title: "Networking & Data Persistence", description: "Handle API calls and store data locally on the device.", tags: ["REST APIs", "SQLite", "Core Data"] },
      { title: "App Store Deployment", description: "Master the process of publishing an app to the Apple App Store or Google Play Store.", tags: ["App Store Connect", "Google Play Console"] },
    ],
  },
  // --- Data & AI ---
  {
    role: "Data Scientist",
    category: "Data & AI",
    duration: "12-24 months",
    description: "Use scientific methods, processes, algorithms, and systems to extract knowledge and insights from structured and unstructured data.",
    steps: [
      { title: "Programming & SQL", description: "Master Python for data analysis and SQL for database querying.", tags: ["Python", "Pandas", "NumPy", "SQL"] },
      { title: "Statistics & Probability", description: "Understand the mathematical foundations of data science.", tags: ["Hypothesis Testing", "Regression", "Probability Distributions"] },
      { title: "Machine Learning", description: "Learn to build and evaluate predictive models.", tags: ["Scikit-learn", "Supervised Learning", "Unsupervised Learning"] },
      { title: "Data Visualization & Communication", description: "Master tools to present findings effectively.", tags: ["Matplotlib", "Seaborn", "Tableau"] },
    ],
  },
  {
    role: "Machine Learning Engineer",
    category: "Data & AI",
    duration: "18-30 months",
    description: "Design, build, and deploy machine learning models into production systems at scale.",
    steps: [
      { title: "Data Science Fundamentals", description: "Complete the Data Scientist roadmap.", tags: ["Python", "SQL", "ML Theory"] },
      { title: "Deep Learning", description: "Master neural networks and deep learning frameworks.", tags: ["TensorFlow", "PyTorch", "Keras"] },
      { title: "MLOps", description: "Learn the tools and practices for deploying and maintaining ML models in production.", tags: ["MLflow", "Kubeflow", "Model Monitoring"] },
      { title: "Big Data Technologies", description: "Work with large-scale datasets using distributed computing.", tags: ["Apache Spark", "Hadoop", "Dask"] },
    ],
  },
  {
    role: "Data Engineer",
    category: "Data & AI",
    duration: "12-20 months",
    description: "Design, build, and maintain the infrastructure and pipelines that allow for large-scale data processing.",
    steps: [
      { title: "Advanced Programming & SQL", description: "Deepen skills in Python/Scala/Java and complex SQL.", tags: ["Python", "SQL", "Data Structures"] },
      { title: "Data Warehousing & ETL", description: "Build systems for extracting, transforming, and loading data.", tags: ["ETL/ELT", "Snowflake", "BigQuery"] },
      { title: "Data Orchestration", description: "Schedule and manage complex data workflows.", tags: ["Apache Airflow", "Dagster", "Prefect"] },
      { title: "Streaming Data", description: "Work with real-time data streams.", tags: ["Apache Kafka", "Spark Streaming", "Flink"] },
    ],
  },
  // --- Cloud & Infrastructure ---
  {
    role: "DevOps Engineer",
    category: "Cloud & Infrastructure",
    duration: "12-18 months",
    description: "Automate and streamline the software development and deployment lifecycle.",
    steps: [
      { title: "Linux & Scripting", description: "Master the command line and scripting languages.", tags: ["Linux", "Bash", "Python"] },
      { title: "CI/CD Pipelines", description: "Automate the build, test, and deployment processes.", tags: ["Jenkins", "GitHub Actions", "GitLab CI"] },
      { title: "Containers & Orchestration", description: "Package applications and manage them at scale.", tags: ["Docker", "Kubernetes"] },
      { title: "Infrastructure as Code (IaC)", description: "Manage infrastructure with code.", tags: ["Terraform", "Ansible", "Pulumi"] },
      { title: "Monitoring & Observability", description: "Track application health and performance.", tags: ["Prometheus", "Grafana", "Datadog"] },
    ],
  },
  {
    role: "Cloud Architect",
    category: "Cloud & Infrastructure",
    duration: "24-48 months",
    description: "Design and oversee the implementation of cloud computing strategies and solutions.",
    steps: [
      { title: "Master a Cloud Platform", description: "Gain deep expertise in AWS, Azure, or GCP.", tags: ["AWS", "Azure", "GCP"] },
      { title: "Networking & Security", description: "Design secure and scalable network architectures in the cloud.", tags: ["VPC", "IAM", "Security Groups"] },
      { title: "High Availability & Disaster Recovery", description: "Design resilient systems that can withstand failures.", tags: ["Load Balancing", "Auto-Scaling", "Backup/Restore"] },
      { title: "Cost Optimization", description: "Learn to manage and optimize cloud spending.", tags: ["Cloud Financial Management", "Reserved Instances"] },
    ],
  },
  // --- Cybersecurity ---
  {
    role: "Cybersecurity Analyst",
    category: "Cybersecurity",
    duration: "12-24 months",
    description: "Protect computer systems and networks from cyber threats by monitoring, detecting, and responding to security incidents.",
    steps: [
      { title: "Networking & Security Fundamentals", description: "Understand TCP/IP, firewalls, and security principles.", tags: ["CompTIA Security+", "Networking Protocols"] },
      { title: "Threat Detection & Analysis", description: "Use tools to monitor for and analyze security threats.", tags: ["SIEM", "Wireshark", "Intrusion Detection"] },
      { title: "Ethical Hacking & Penetration Testing", description: "Learn to think like an attacker to find vulnerabilities.", tags: ["Kali Linux", "Metasploit", "Burp Suite"] },
      { title: "Incident Response & Forensics", description: "Develop plans to respond to breaches and investigate them.", tags: ["Incident Response Plan", "Digital Forensics"] },
    ],
  },
]

const CATEGORY_TO_ROLES: Record<string, string[]> = CAREER_ROADMAPS.reduce((acc, item) => {
  acc[item.category] = acc[item.category] ? [...acc[item.category], item.role] : [item.role]
  return acc
}, {} as Record<string, string[]>)

function transformToRoadmap(raw: RawRoadmap): Roadmap {
  const steps: RoadmapStep[] = raw.steps.map((s, idx) => ({
    id: `${raw.role}-${idx + 1}`,
    title: s.title,
    description: s.description,
    type: idx === 1 ? "course" : idx === raw.steps.length - 1 ? "experience" : "skill",
    duration: idx === 0 ? "3-4 weeks" : idx === 1 ? "4-6 weeks" : "3-6 weeks",
    priority: idx < 2 ? "high" : idx === 2 ? "medium" : "low",
    completed: false,
    skills: s.tags,
  }))
  return {
    title: raw.role,
    description: raw.description,
    timeline: raw.duration,
    completionRate: 0,
    steps,
  }
}

export function CareerRoadmap() {
  const [targetRole, setTargetRole] = useState<string>("")
  const [roleOpen, setRoleOpen] = useState(false)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)

  // Suggest role from last resume analysis
  const suggestedRole = useMemo(() => {
    try {
      const r = localStorage.getItem('lastDetectedRole') ?? ''
      if (!r) return null
      // Map skill-db key to roadmap role name
      const map: Record<string, string> = {
        software_developer: 'Full-Stack Developer',
        aiml_engineer:      'Machine Learning Engineer',
        data_scientist:     'Data Scientist',
        devops_engineer:    'DevOps Engineer',
        product_manager:    null as unknown as string,
      }
      return map[r] ?? null
    } catch { return null }
  }, [])

  // Restore saved progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('roadmapProgress')
      if (saved) {
        const { role: savedRole, steps: savedSteps } = JSON.parse(saved)
        const raw = CAREER_ROADMAPS.find(r => r.role === savedRole)
        if (raw) {
          const base = transformToRoadmap(raw)
          const merged = {
            ...base,
            steps: base.steps.map(s => ({
              ...s,
              completed: savedSteps[s.id] ?? false,
            })),
          }
          const done = merged.steps.filter(s => s.completed).length
          merged.completionRate = Math.round((done / merged.steps.length) * 100)
          setTargetRole(savedRole)
          setRoadmap(merged)
        }
      }
    } catch { /* ignore */ }
  }, [])

  const saveProgress = (role: string, steps: RoadmapStep[]) => {
    try {
      const stepMap = Object.fromEntries(steps.map(s => [s.id, s.completed]))
      localStorage.setItem('roadmapProgress', JSON.stringify({ role, steps: stepMap }))
    } catch { /* ignore */ }
  }


  const handleSelectRole = (role: string) => {
    setTargetRole(role)
    const raw = CAREER_ROADMAPS.find(r => r.role === role)
    if (raw) {
      const newRoadmap = transformToRoadmap(raw)
      setRoadmap(newRoadmap)
      saveProgress(role, newRoadmap.steps)
    }
    setRoleOpen(false)
  }

  const toggleStepCompletion = (stepId: string) => {
    if (!roadmap) return
    const updatedSteps = roadmap.steps.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    )
    const completedSteps = updatedSteps.filter(step => step.completed).length
    const completionRate = Math.round((completedSteps / updatedSteps.length) * 100)
    const updated = { ...roadmap, steps: updatedSteps, completionRate }
    setRoadmap(updated)
    saveProgress(targetRole, updatedSteps)
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case "skill": return Target
      case "course": return Book
      case "certification": return Award
      case "experience": return TrendingUp
      default: return Circle
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground"
      case "medium": return "bg-warning text-warning-foreground"
      case "low": return "bg-muted text-muted-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="hero-title gradient-text mb-4">
              Career Roadmap
            </h1>
            <p className="hero-subtitle">
              Get a personalized step-by-step plan to achieve your career goals with AI-powered recommendations.
            </p>
          </motion.div>

          {!roadmap && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card neon-glow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary neon-pulse" />
                    <span className="neon-text">Choose Your Target Role</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Select a role to view a curated, high-quality roadmap.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full max-w-md">
                    <label className="block text-sm font-medium mb-2">Target Role</label>
                    <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          role="combobox"
                          variant="outline"
                          aria-expanded={roleOpen}
                          className="w-full justify-between"
                        >
                          {targetRole ? targetRole : "Select a role"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput placeholder="Search roles..." />
                          <CommandList>
                            <CommandEmpty>No role found.</CommandEmpty>
                            {Object.entries(CATEGORY_TO_ROLES).map(([category, roles]) => (
                              <CommandGroup key={category} heading={category}>
                                {roles.map((role) => (
                                  <CommandItem
                                    key={role}
                                    value={role}
                                    onSelect={() => handleSelectRole(role)}
                                  >
                                    <Check className={`mr-2 h-4 w-4 ${targetRole === role ? 'opacity-100' : 'opacity-0'}`} />
                                    {role}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Please select a target role to see your personalized roadmap.
                  </p>
                </CardContent>
              </Card>

              {/* Suggested role from resume analysis */}
              {suggestedRole && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Based on your resume, we suggest: <strong>{suggestedRole}</strong>
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleSelectRole(suggestedRole)}>
                    Use This
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Generated Roadmap */}
          <AnimatePresence>
            {roadmap && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 mt-6"
              >
                {/* Roadmap Header */}
                <Card className="glass-card neon-glow">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <CardTitle className="text-2xl gradient-text font-bold">{roadmap.title}</CardTitle>
                        <CardDescription className="mt-2 text-base text-muted-foreground">
                          {roadmap.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="tag-train">
                          <Clock className="w-3 h-3 mr-1" />
                          {roadmap.timeline}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => { setRoadmap(null); setTargetRole('') }}>
                          Change Role
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Progress</span>
                        <span className="neon-text">{roadmap.completionRate}% complete</span>
                      </div>
                      <Progress value={roadmap.completionRate} className="h-3" />
                    </div>
                    {/* Milestone badges */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {roadmap.completionRate >= 25 && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
                          <Award className="h-3 w-3" /> Getting Started
                        </Badge>
                      )}
                      {roadmap.completionRate >= 50 && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
                          <TrendingUp className="h-3 w-3" /> Halfway There
                        </Badge>
                      )}
                      {roadmap.completionRate >= 75 && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 gap-1">
                          <Sparkles className="h-3 w-3" /> Almost Done
                        </Badge>
                      )}
                      {roadmap.completionRate === 100 && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                          <CheckCircle className="h-3 w-3" /> Roadmap Complete!
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Roadmap Steps */}
                <div className="space-y-4">
                  {roadmap.steps.map((step, index) => {
                    const StepIcon = getStepIcon(step.type)
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all duration-300 content-card ${
                            step.completed ? "border-accent/30 bg-accent/5" : "glass-card"
                          }`}
                          onClick={() => toggleStepCompletion(step.id)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                {step.completed ? (
                                  <CheckCircle className="h-6 w-6 text-accent animate-pulse" />
                                ) : (
                                  <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                                )}
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-lg neon-text">{step.title}</h3>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={getPriorityColor(step.priority)}>
                                      {step.priority}
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center space-x-1">
                                      <StepIcon className="w-3 h-3" />
                                      <span>{step.type}</span>
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-muted-foreground">{step.description}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-wrap gap-1">
                                    {step.skills.map((skill, skillIndex) => (
                                      <SkillCourseDrawer key={skillIndex} skill={skill}>
                                        <Badge 
                                          variant="secondary" 
                                          className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                                        >
                                          {skill}
                                        </Badge>
                                      </SkillCourseDrawer>
                                    ))}
                                  </div>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {step.duration}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}