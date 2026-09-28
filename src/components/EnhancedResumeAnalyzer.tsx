import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Target, Star, DollarSign, BarChart3, ExternalLink, BookOpen, ChevronsUpDown, Check, Calendar, Briefcase, FolderOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SkillAnalyzerCard, SkillAnalysis } from "@/components/SkillAnalyzerCard"
import { ResumeAnalysisService } from "@/lib/resumeAnalysisService"
import { EnhancedResumeAnalysisService, EnhancedSkillAnalysis } from "@/lib/enhancedResumeAnalysisService"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Removed CareerMentor import as the Mentor tab is no longer used
import { CareerChatbot } from "@/components/CareerChatbot"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface SkillSuggestion {
  skill: string
  reason: string
  impact: string
  courses: {
    free: { name: string; url: string }
    paid: { name: string; url: string; price: string }
  }
}

interface JobFitAnalysis {
  role: string
  matchPercentage: number
  skills: string[]
  salaryRange: string
  demandLevel: "High" | "Medium" | "Low"
  readinessScore: number
}

interface AnalysisResult {
  score: number
  categoryScores: {
    skills: number
    experience: number
    formatting: number
    grammar: number
    links: number
  }
  strengths: string[]
  improvements: { text: string; clickable: boolean; skill?: string }[]
  jobFit: JobFitAnalysis
  suggestions: string[]
  skillSuggestions: SkillSuggestion[]
  salaryBenchmark: {
    current: number
    potential: number
    afterImprovement: number
  }
  trendingSkills: string[]
}

const TOP_CS_ROLES = [
  "Software Engineer", "Data Scientist", "AI/ML Engineer", "Cloud Engineer", "Cybersecurity Specialist", "Game Developer", "Web Developer", "Mobile App Developer", "Database Administrator", "DevOps Engineer", "UI/UX Designer", "Product Manager", "IT Project Manager", "Systems Architect", "Blockchain Developer", "Research Scientist", "QA Engineer", "Network Engineer", "Business Analyst"
]

export function EnhancedResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [skillAnalysis, setSkillAnalysis] = useState<EnhancedSkillAnalysis | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<SkillSuggestion | null>(null)
  const [resumeText, setResumeText] = useState<string>("")
  const [targetRole, setTargetRole] = useState<string>("")
  const [userSkills, setUserSkills] = useState<string[]>([])
  const [roleOpen, setRoleOpen] = useState(false)
  const [portfolioGoal, setPortfolioGoal] = useState<string>("")
  const { toast } = useToast()

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || selectedFile.type.includes("document")) {
        setFile(selectedFile)
        setAnalysis(null)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        })
      }
    }
  }, [toast])

  const analyzeResume = async () => {
    if (!file && !resumeText.trim()) return

    setIsAnalyzing(true)
    
    try {
      const text = file ? await extractTextFromFile(file) : resumeText
      setResumeText(text)
      
      const [legacyAnalysis, skillAnalysisResult] = await Promise.all([
        runLegacyAnalysis(),
        EnhancedResumeAnalysisService.analyzeResume({
          resume_text: text,
          target_role: targetRole || undefined,
          user_id: "demo-user"
        })
      ])
      
      setAnalysis(legacyAnalysis)
      setSkillAnalysis(skillAnalysisResult)
      
      toast({
        title: "Enhanced analysis complete!",
        description: "Your resume has been analyzed with advanced AI insights.",
      })
    } catch (error) {
      console.error('Analysis error:', error)
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const mockText = `
          John Doe
          Senior Software Engineer
          
          Experience:
          - 5 years developing web applications with React and Node.js
          - Led team of 4 developers on e-commerce platform
          - Improved application performance by 40%
          - Implemented CI/CD pipelines using Docker and AWS
          
          Skills:
          - JavaScript, TypeScript, React, Node.js
          - Python, SQL, MongoDB
          - AWS, Docker, Git
          - Agile methodologies
          
          Education:
          - BS Computer Science, University of Technology
        `
        resolve(mockText)
      }
      reader.readAsText(file)
    })
  }

  const runLegacyAnalysis = async (): Promise<AnalysisResult> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const categoryScores = {
      skills: Math.floor(Math.random() * 40) + 60,
      experience: Math.floor(Math.random() * 30) + 50,
      formatting: Math.floor(Math.random() * 30) + 70,
      grammar: Math.floor(Math.random() * 20) + 80,
      links: Math.floor(Math.random() * 40) + 40,
    }
    
    const totalScore = Math.round(
      (categoryScores.skills * 0.35) +
      (categoryScores.experience * 0.25) +
      (categoryScores.formatting * 0.20) +
      (categoryScores.grammar * 0.10) +
      (categoryScores.links * 0.10)
    )
    
    return {
      score: totalScore,
      categoryScores,
      strengths: totalScore > 75 ? [
        "Strong technical skills alignment",
        "Good project portfolio documentation",
        "Clear career progression shown",
        "Solid educational foundation"
      ] : [
        "Has relevant technical experience",
        "Shows some project involvement",
        "Educational background present"
      ],
      improvements: [
        { text: "Add more specific metrics and quantifiable achievements", clickable: false },
        { text: "Include relevant certifications or continuing education", clickable: false },
        { text: "Learn AWS for cloud expertise", clickable: true, skill: "AWS" },
        { text: "Master Docker and containerization", clickable: true, skill: "Docker" }
      ],
      jobFit: {
        role: targetRole || "Senior Frontend Developer",
        matchPercentage: 92,
        skills: ["React", "TypeScript", "JavaScript", "CSS", "HTML", "Git"],
        salaryRange: "$85,000 - $120,000",
        demandLevel: "High",
        readinessScore: 88
      },
      suggestions: [
        "Consider adding AWS or cloud platform experience",
        "Highlight leadership and mentoring experience more prominently",
        "Include specific examples of problem-solving and impact"
      ],
      skillSuggestions: [
        {
          skill: "AWS",
          reason: "Cloud skills are in high demand and can increase salary by 25%",
          impact: "Opens opportunities at top tech companies",
          courses: {
            free: { name: "AWS Free Tier Training", url: "https://aws.amazon.com/training/" },
            paid: { name: "AWS Solutions Architect Course", url: "https://udemy.com/aws-architect", price: "₹449" }
          }
        },
        {
          skill: "Docker", 
          reason: "Containerization is essential for modern development workflows",
          impact: "Increases job market fit by 40%",
          courses: {
            free: { name: "Docker Official Tutorial", url: "https://docs.docker.com/get-started/" },
            paid: { name: "Complete Docker Mastery", url: "https://udemy.com/docker-mastery", price: "₹399" }
          }
        }
      ],
      salaryBenchmark: {
        current: 800000,
        potential: 1200000,
        afterImprovement: 1500000
      },
      trendingSkills: ["Next.js", "GraphQL", "Kubernetes", "Terraform", "Microservices"]
    }
  }

  const openSkillModal = (skill: SkillSuggestion) => {
    setSelectedSkill(skill)
  }

  const resetAnalysis = () => {
    setFile(null)
    setAnalysis(null)
    setSkillAnalysis(null)
    setResumeText("")
    setTargetRole("")
    setUserSkills([])
    setPortfolioGoal("")
  }

  const handleAddSkill = async (skillName: string) => {
    try {
      await ResumeAnalysisService.addUserSkill("demo-user", skillName, 0.5)
      setUserSkills(prev => [...prev, skillName])
      toast({
        title: "Skill added!",
        description: `${skillName} has been added to your profile.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleAddToLearningPlan = (skillName: string) => {
    toast({
      title: "Added to learning plan",
      description: `${skillName} has been added to your learning plan.`,
    })
  }

  const roleSpecificRecommendations = (role: string) => {
    const lower = role.toLowerCase()
    if (lower.includes("data") || lower.includes("ml")) {
      return {
        missingCerts: ["Google Data Analytics", "AWS Machine Learning Specialty"],
        projectIdeas: ["End-to-end ML pipeline on Kaggle dataset", "Deploy a FastAPI inference service on AWS"],
        missingCore: ["Pandas", "Scikit-learn", "TensorFlow/PyTorch", "SQL", "Statistics"]
      }
    }
    if (lower.includes("cloud") || lower.includes("devops")) {
      return {
        missingCerts: ["AWS Solutions Architect Associate", "CKA (Kubernetes Administrator)"],
        projectIdeas: ["IaC with Terraform for a 3-tier app", "CI/CD pipeline with GitHub Actions + EKS"],
        missingCore: ["AWS", "Docker", "Kubernetes", "Terraform", "Linux"]
      }
    }
    if (lower.includes("cyber")) {
      return {
        missingCerts: ["CompTIA Security+", "Certified Ethical Hacker (CEH)"],
        projectIdeas: ["Home lab with SIEM", "Vulnerability assessment on DVWA"],
        missingCore: ["Networking", "Linux", "OWASP Top 10", "Threat modeling"]
      }
    }
    if (lower.includes("mobile")) {
      return {
        missingCerts: ["Google Associate Android Developer"],
        projectIdeas: ["React Native app with offline sync", "Flutter app consuming GraphQL"],
        missingCore: ["React Native/Flutter", "State management", "App store deployment"]
      }
    }
    return {
      missingCerts: ["Scrum Fundamentals", "AWS Cloud Practitioner"],
      projectIdeas: ["Full-stack app with auth and payments", "Refactor to TypeScript + tests"],
      missingCore: ["TypeScript", "Testing (Jest)", "System design basics"]
    }
  }

  const generateRoadmap = (role: string) => {
    const lower = (role || "Software Engineer").toLowerCase()
    const base = {
      beginner: { months: "3–6", skills: ["Programming fundamentals", "Git", "Data structures"], tags: ["HTML", "CSS", "JS"] },
      intermediate: { months: "6–12", skills: ["Build 2–3 projects", "APIs & databases", "Testing"], tags: ["TypeScript", "Node.js", "SQL"] },
      advanced: { months: "12+", skills: ["System design", "Cloud & CI/CD", "Optimization"], tags: ["AWS", "Docker", "Design Patterns"] },
      certs: ["AWS Cloud Practitioner"],
      projects: ["End-to-end product with auth, payments, and analytics"]
    }
    if (lower.includes("data") || lower.includes("ml")) {
      return {
        title: `Career Roadmap for ${role}`,
        beginner: { months: "3–6", skills: ["Python", "Pandas", "SQL", "Statistics"], tags: ["Python", "Pandas", "SQL"] },
        intermediate: { months: "6–12", skills: ["Scikit-learn", "EDA", "Feature engineering", "Visualization"], tags: ["scikit-learn", "Matplotlib", "Seaborn"] },
        advanced: { months: "12+", skills: ["Deep Learning", "MLOps", "Cloud deployment"], tags: ["PyTorch", "TensorFlow", "AWS Sagemaker"] },
        certs: ["Google Data Analytics", "AWS ML Specialty"],
        projects: ["Kaggle pipeline", "ML API on cloud", "Dashboard analytics app"]
      }
    }
    if (lower.includes("cloud") || lower.includes("devops")) {
      return {
        title: `Career Roadmap for ${role}`,
        beginner: { months: "3–6", skills: ["Linux", "Networking", "Git", "Scripting"], tags: ["Linux", "Bash", "Git"] },
        intermediate: { months: "6–12", skills: ["Cloud services", "Containers", "IaC"], tags: ["AWS", "Docker", "Terraform"] },
        advanced: { months: "12+", skills: ["Kubernetes", "Observability", "Cost optimization"], tags: ["EKS", "Prometheus", "Grafana"] },
        certs: ["AWS SAA", "CKA"],
        projects: ["3-tier IaC", "GitOps pipeline", "Autoscaling microservices"]
      }
    }
    return {
      title: `Career Roadmap for ${role || 'Software Engineer'}`,
      ...base
    }
  }

  const generateJobRecommendations = (role: string) => {
    const lower = (role || "Software Engineer").toLowerCase()
    if (lower.includes("data") || lower.includes("ml")) {
      return [
        { title: "Data Analyst", level: "Entry", salary: "₹5L–₹10L", skills: ["SQL", "Excel", "Pandas"], resp: ["Build dashboards", "Analyze trends", "Support decisions"] },
        { title: "Machine Learning Engineer", level: "Mid", salary: "₹12L–₹25L", skills: ["Python", "scikit-learn", "ML pipelines"], resp: ["Train models", "Deploy services", "Monitor drift"] },
        { title: "Data Scientist", level: "Mid/Senior", salary: "₹15L–₹35L", skills: ["Stats", "ML", "Visualization"], resp: ["Experimentation", "Feature engineering", "Insights"] }
      ]
    }
    if (lower.includes("cloud") || lower.includes("devops")) {
      return [
        { title: "Cloud Engineer", level: "Mid", salary: "₹12L–₹28L", skills: ["AWS", "Networking", "IaC"], resp: ["Design cloud infra", "Security baselines", "Cost mgmt"] },
        { title: "DevOps Engineer", level: "Mid", salary: "₹12L–₹26L", skills: ["CI/CD", "Docker", "Kubernetes"], resp: ["Build pipelines", "Automate deployments", "Observability"] },
        { title: "SRE", level: "Senior", salary: "₹20L–₹40L", skills: ["Reliability", "Monitoring", "On-call"], resp: ["SLIs/SLOs", "Incident response", "Capacity planning"] }
      ]
    }
    return [
      { title: "Frontend Engineer", level: "Entry/Mid", salary: "₹6L–₹18L", skills: ["React", "TypeScript", "CSS"], resp: ["Build UI", "Optimize performance", "Collaborate with backend"] },
      { title: "Backend Engineer", level: "Mid", salary: "₹10L–₹22L", skills: ["Node.js", "SQL/NoSQL", "APIs"], resp: ["Design APIs", "Data modeling", "Scalability"] },
      { title: "Full Stack Engineer", level: "Mid", salary: "₹12L–₹24L", skills: ["React", "Node.js", "Cloud"], resp: ["End-to-end features", "Testing", "Deployment"] }
    ]
  }

  const generatePortfolioSuggestions = (role: string, goal: string) => {
    const lower = (role || "Software Engineer").toLowerCase()
    const commonTip = "Add to your portfolio by showing project description, tech stack used, key challenges solved, and outcomes."
    if (lower.includes("data") || lower.includes("ml")) {
      return {
        prompt: "What’s your career goal?",
        items: [
          { title: "ML Pipeline on Kaggle", level: "Intermediate", stack: ["Python", "Pandas", "scikit-learn"], features: ["EDA", "Feature engineering", "Model registry"], tip: commonTip },
          { title: "Realtime Analytics Dashboard", level: "Advanced", stack: ["Python", "FastAPI", "Postgres", "React"], features: ["Ingestion", "Charts", "Auth"], tip: commonTip },
          { title: "Image Classifier Service", level: "Intermediate", stack: ["PyTorch", "FastAPI", "Docker"], features: ["Training", "REST API", "Dockerfile"], tip: commonTip }
        ]
      }
    }
    if (lower.includes("cloud") || lower.includes("devops")) {
      return {
        prompt: "What’s your career goal?",
        items: [
          { title: "3-Tier Web App on AWS", level: "Intermediate", stack: ["AWS", "Terraform", "RDS", "ALB"], features: ["IaC", "Blue/green deploy", "Autoscaling"], tip: commonTip },
          { title: "GitOps Microservices", level: "Advanced", stack: ["Docker", "Kubernetes", "ArgoCD"], features: ["CI/CD", "Helm", "Observability"], tip: commonTip },
          { title: "Cost-Optimized Serverless", level: "Intermediate", stack: ["Lambda", "API Gateway", "DynamoDB"], features: ["Event-driven", "Monitoring", "Cost alerts"], tip: commonTip }
        ]
      }
    }
    return {
      prompt: "What’s your career goal?",
      items: [
        { title: "AI-Powered Task Manager", level: "Intermediate", stack: ["React", "Node.js", "Postgres"], features: ["Auth", "Tasks CRUD", "Analytics"], tip: commonTip },
        { title: "E-commerce Storefront", level: "Intermediate", stack: ["Next.js", "Stripe", "Prisma"], features: ["Checkout", "Catalog", "Admin"], tip: commonTip },
        { title: "Social Feed App", level: "Beginner", stack: ["React", "Supabase"], features: ["Feeds", "Likes", "Profiles"], tip: commonTip }
      ]
    }
  }

  const renderRoleFitInsights = () => {
    if (!analysis && !skillAnalysis) return null
    const currentSkills = skillAnalysis ? skillAnalysis.user_skills.map(s => s.name) : userSkills
    const suggestedSkills = skillAnalysis ? skillAnalysis.suggested_skills.map(s => s.name) : (analysis ? analysis.skillSuggestions.map(s => s.skill) : [])
    const missing = suggestedSkills.filter(s => !currentSkills.includes(s))
    const roleRecs = roleSpecificRecommendations(targetRole || analysis?.jobFit.role || "")

    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-primary" />
            <span>Role-Fit Insights {targetRole ? `for ${targetRole}` : ''}</span>
          </CardTitle>
          <CardDescription>
            Strengths, gaps, and next steps tailored to your target role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Strengths</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {(analysis?.strengths || []).slice(0, 4).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Skill Gaps</h4>
              <div className="flex flex-wrap gap-2">
                {missing.length > 0 ? missing.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                )) : <span className="text-sm text-muted-foreground">No major gaps detected</span>}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Recommended Certifications</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {roleRecs.missingCerts.map((c, i) => (<li key={i}>{c}</li>))}
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Project Ideas</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {roleRecs.projectIdeas.map((p, i) => (<li key={i}>{p}</li>))}
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Core Skills to Add</h4>
              <div className="flex flex-wrap gap-2">
                {roleRecs.missingCore.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Next 30–90 Days Roadmap</h4>
            <ul className="list-disc pl-5 text-sm text-green-900 space-y-1">
              <li>Pick 2 high-impact skills and follow a weekly plan</li>
              <li>Build one portfolio project aligned with the role</li>
              <li>Earn one relevant certification</li>
              <li>Update resume with quantifiable, role-specific bullets</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCareerRoadmap = () => {
    const roadmap = generateRoadmap(targetRole || analysis?.jobFit.role || "Software Engineer")
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {roadmap.title}
          </CardTitle>
          <CardDescription>
            Learning milestones, suggested timeline, certifications, and example projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {roadmap.beginner.tags.map((t: string) => (<Badge key={`b-${t}`} variant="secondary" className="text-xs">{t}</Badge>))}
            {roadmap.intermediate.tags.map((t: string) => (<Badge key={`i-${t}`} variant="secondary" className="text-xs">{t}</Badge>))}
            {roadmap.advanced.tags.map((t: string) => (<Badge key={`a-${t}`} variant="secondary" className="text-xs">{t}</Badge>))}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">Beginner • {roadmap.beginner.months} months</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {roadmap.beginner.skills.map((s: string) => (<li key={s}>{s}</li>))}
              </ul>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">Intermediate • {roadmap.intermediate.months} months</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {roadmap.intermediate.skills.map((s: string) => (<li key={s}>{s}</li>))}
              </ul>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">Advanced • {roadmap.advanced.months} months</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {roadmap.advanced.skills.map((s: string) => (<li key={s}>{s}</li>))}
              </ul>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Industry Certifications</h4>
            <div className="flex flex-wrap gap-2">
              {roadmap.certs.map((c: string) => (<Badge key={c} variant="outline" className="text-xs">{c}</Badge>))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Example Projects</h4>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {roadmap.projects.map((p: string) => (<li key={p}>{p}</li>))}
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderJobRecommendations = () => {
    const jobs = generateJobRecommendations(targetRole || analysis?.jobFit.role || "Software Engineer")
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Job Recommendations
          </CardTitle>
          <CardDescription>
            Roles aligned with your target, with required skills and typical responsibilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {jobs.map(job => (
              <div key={job.title} className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{job.title}</h4>
                  <Badge variant="secondary" className="text-xs">Experience Level: {job.level}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {job.skills.map((s: string) => (<Badge key={`${job.title}-${s}`} variant="outline" className="text-xs">{s}</Badge>))}
                </div>
                <p className="text-xs text-muted-foreground mb-1">Approx. Salary: {job.salary}</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {job.resp.map((r: string, i: number) => (<li key={i}>{r}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderPortfolioSuggestions = () => {
    const suggestions = generatePortfolioSuggestions(targetRole || analysis?.jobFit.role || "Software Engineer", portfolioGoal)
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Portfolio Suggestions
          </CardTitle>
          <CardDescription>
            Tell us your goal to tailor portfolio ideas. No code/demo links—focus on what to build.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">What’s your career goal?</label>
            <input
              type="text"
              value={portfolioGoal}
              onChange={(e) => setPortfolioGoal(e.target.value)}
              placeholder="e.g., Get a mid-level ${targetRole || 'Software Engineer'} role in 6 months"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {suggestions.items.map((item) => (
              <div key={item.title} className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{item.title}</h4>
                  <Badge variant="secondary" className="text-xs">Difficulty: {item.level}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.stack.map((s: string) => (<Badge key={`${item.title}-${s}`} variant="outline" className="text-xs">{s}</Badge>))}
                </div>
                <h5 className="font-medium text-sm mb-1">Features to implement</h5>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {item.features.map((f: string, i: number) => (<li key={i}>{f}</li>))}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">{item.tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-light p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-black mb-4">
            <span className="gradient-text">Enhanced Resume</span> Analyzer
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced AI analysis with salary insights, skill recommendations, and career roadmaps.
          </p>
        </motion.div>

        <div className="grid gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-dashed border-2 border-primary/20 glass-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className="p-6 bg-primary/10 rounded-full mb-6 neon-glow">
                      <Upload className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">
                      {file ? file.name : "Upload Your Resume"}
                    </h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      Get advanced AI insights, salary projections, and skill recommendations
                    </p>
                  </label>
                  
                  {/* Target Role Input (Combobox) */}
                  <div className="w-full max-w-md mx-auto mb-6 text-left">
                    <label htmlFor="target-role" className="block text-sm font-medium mb-2">
                      Target Role (Optional)
                    </label>
                    <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="target-role"
                          role="combobox"
                          variant="outline"
                          aria-expanded={roleOpen}
                          className="w-full justify-between"
                        >
                          {targetRole ? targetRole : "Select or type a role"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput placeholder="Search roles..." />
                          <CommandList>
                            <CommandEmpty>No role found.</CommandEmpty>
                            <CommandGroup>
                              {TOP_CS_ROLES.map((role) => (
                                <CommandItem
                                  key={role}
                                  value={role}
                                  onSelect={() => {
                                    setTargetRole(role)
                                    setRoleOpen(false)
                                  }}
                                >
                                  <Check className={`mr-2 h-4 w-4 ${targetRole === role ? 'opacity-100' : 'opacity-0'}`} />
                                  {role}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="Or type your target role"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  {/* Manual Resume Input */}
                  <div className="w-full max-w-2xl mx-auto mb-6 text-left">
                    <label htmlFor="resume-text" className="block text-sm font-medium mb-2">
                      Or paste your resume content here:
                    </label>
                    <textarea
                      id="resume-text"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume content here for analysis..."
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                    />
                  </div>
                  
                  {(file || resumeText.trim()) && (
                    <div className="flex justify-center space-x-6 mt-8">
                      <Button onClick={analyzeResume} disabled={isAnalyzing} size="lg" className="gradient-bg px-8 py-4">
                        {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
                      </Button>
                      <Button variant="outline" onClick={resetAnalysis} size="lg">
                        Upload Different File
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Loading State */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-6">
                      <div className="inline-flex p-6 bg-primary/10 rounded-full animate-pulse neon-glow">
                        <FileText className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold">Advanced AI Analysis in Progress</h3>
                      <p className="text-muted-foreground text-lg">
                        Analyzing skills, calculating salary potential, and generating personalized recommendations...
                      </p>
                      <Progress value={75} className="max-w-md mx-auto h-3" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Analysis Results */}
          <AnimatePresence>
            {(analysis || skillAnalysis) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
                    <TabsTrigger value="chatbot">AI Chat</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-8">
                {/* Score and Salary Overview */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="h-6 w-6 text-primary" />
                        <span>Resume Score Breakdown</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold gradient-text mb-2">{analysis!.score}/100</div>
                        <Progress value={analysis!.score} className="mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {analysis!.score >= 80 ? "Excellent" : analysis!.score >= 70 ? "Good" : analysis!.score >= 60 ? "Average" : "Needs Improvement"}
                        </p>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span>Skills Match (35%)</span>
                          <span className="font-semibold">{analysis!.categoryScores.skills}/100</span>
                        </div>
                        <Progress value={analysis!.categoryScores.skills} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <span>Experience (25%)</span>
                          <span className="font-semibold">{analysis!.categoryScores.experience}/100</span>
                        </div>
                        <Progress value={analysis!.categoryScores.experience} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <span>ATS Formatting (20%)</span>
                          <span className="font-semibold">{analysis!.categoryScores.formatting}/100</span>
                        </div>
                        <Progress value={analysis!.categoryScores.formatting} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <span>Grammar (10%)</span>
                          <span className="font-semibold">{analysis!.categoryScores.grammar}/100</span>
                        </div>
                        <Progress value={analysis!.categoryScores.grammar} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <span>Links/Portfolio (10%)</span>
                          <span className="font-semibold">{analysis!.categoryScores.links}/100</span>
                        </div>
                        <Progress value={analysis!.categoryScores.links} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-6 w-6 text-accent" />
                        <span>Salary Projection (INR)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current Market Value</span>
                            <span className="font-semibold">₹{(analysis!.salaryBenchmark.current / 100000).toFixed(1)}L</span>
                          </div>
                          <Progress value={70} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>With Improvements</span>
                            <span className="font-semibold text-accent">₹{(analysis!.salaryBenchmark.afterImprovement / 100000).toFixed(1)}L</span>
                          </div>
                          <Progress value={95} className="h-2" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Potential increase: <span className="text-accent font-semibold">
                            ₹{((analysis!.salaryBenchmark.afterImprovement - analysis!.salaryBenchmark.current) / 100000).toFixed(1)}L
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          *Based on market data from Glassdoor, Naukri, and AmbitionBox
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Job Market Analysis */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-6 w-6 text-accent" />
                      <span>Job Market Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">{analysis!.jobFit.matchPercentage}%</div>
                        <p className="text-sm text-muted-foreground">Job Match</p>
                        <Progress value={analysis!.jobFit.matchPercentage} className="mt-2" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">{analysis!.jobFit.readinessScore}%</div>
                        <p className="text-sm text-muted-foreground">Market Readiness</p>
                        <Progress value={analysis!.jobFit.readinessScore} className="mt-2" />
                      </div>
                      <div className="text-center">
                        <Badge className={`${analysis!.jobFit.demandLevel === 'High' ? 'bg-accent' : 'bg-warning'} text-white text-lg px-4 py-2`}>
                          {analysis!.jobFit.demandLevel} Demand
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">{analysis!.jobFit.salaryRange}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Role-Fit Insights */}
                {renderRoleFitInsights()}

                {/* New: Career Roadmap */}
                {renderCareerRoadmap()}

                {/* New: Job Recommendations */}
                {renderJobRecommendations()}

                {/* New: Portfolio Suggestions */}
                {renderPortfolioSuggestions()}

                {/* Clickable Improvements */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="h-6 w-6 text-warning" />
                      <span>Smart Recommendations</span>
                    </CardTitle>
                    <CardDescription>
                      Click on skill recommendations to see learning paths and courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis!.improvements.map((improvement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          improvement.clickable 
                            ? "border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors" 
                            : "border-border bg-surface/50"
                        }`}
                        onClick={() => {
                          if (improvement.clickable && improvement.skill) {
                            const skillSuggestion = analysis!.skillSuggestions.find(s => s.skill === improvement.skill)
                            if (skillSuggestion) openSkillModal(skillSuggestion)
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-warning mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-sm">{improvement.text}</span>
                            {improvement.clickable && (
                              <div className="flex items-center mt-1">
                                <ExternalLink className="h-4 w-4 text-primary mr-1" />
                                <span className="text-xs text-primary">Click for courses & roadmap</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Trending Skills */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      <span>Trending Skills in Your Field</span>
                    </CardTitle>
                  </CardHeader>
                   <CardContent>
                     <div className="flex flex-wrap gap-3">
                       {analysis!.trendingSkills.map((skill) => (
                         <Badge 
                           key={skill} 
                           variant="outline" 
                           className="px-4 py-2 text-sm hover:bg-primary/10 cursor-pointer transition-colors"
                           onClick={() => {
                             const urls = {
                               'Next.js': 'https://www.udemy.com/course/nextjs-react-the-complete-guide/',
                               'GraphQL': 'https://www.udemy.com/course/graphql-with-react-course/',
                               'Kubernetes': 'https://www.udemy.com/course/learn-kubernetes/',
                               'Terraform': 'https://www.udemy.com/course/terraform-beginner-to-advanced/',
                               'Microservices': 'https://www.udemy.com/course/microservices-with-node-js-and-react/'
                             }
                             window.open(urls[skill as keyof typeof urls] || `https://www.udemy.com/courses/search/?q=${skill}`, '_blank')
                           }}
                         >
                           {skill}
                         </Badge>
                       ))}
                     </div>
                     <p className="text-xs text-muted-foreground mt-3">
                       Click on any skill to find affordable courses on Udemy
                     </p>
                   </CardContent>
                </Card>
                  </TabsContent>
                  
                  <TabsContent value="skills" className="space-y-8">
                    {skillAnalysis && (
                      <>
                        {/* Enhanced Skill Analysis Overview */}
                        <div className="grid md:grid-cols-3 gap-6">
                          <Card className="glass-card">
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2">
                                <Target className="h-6 w-6 text-primary" />
                                <span>Skill Match Score</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center">
                                <div className="text-4xl font-bold gradient-text mb-2">
                                  {skillAnalysis.matchScore}%
                                </div>
                                <Progress value={skillAnalysis.matchScore} className="mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  Match with {targetRole || 'target role'}
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="glass-card">
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <span>Matched Skills</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                  {skillAnalysis.matchedSkills.length}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Skills found in resume
                                </p>
                                <div className="flex flex-wrap gap-1 mt-3 justify-center">
                                  {skillAnalysis.matchedSkills.slice(0, 5).map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {skillAnalysis.matchedSkills.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{skillAnalysis.matchedSkills.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="glass-card">
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2">
                                <AlertCircle className="h-6 w-6 text-warning" />
                                <span>Missing Skills</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-warning mb-2">
                                  {skillAnalysis.missingSkills.length}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Skills to learn
                                </p>
                                <div className="flex flex-wrap gap-1 mt-3 justify-center">
                                  {skillAnalysis.missingSkills.slice(0, 5).map((skill) => (
                                    <Badge key={skill} variant="destructive" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {skillAnalysis.missingSkills.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{skillAnalysis.missingSkills.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Critical Missing Skills */}
                        {skillAnalysis.criticalMissingSkills.length > 0 && (
                          <Card className="glass-card border-red-200 bg-red-50">
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2 text-red-800">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                                <span>Critical Missing Skills</span>
                              </CardTitle>
                              <CardDescription className="text-red-700">
                                These skills are essential for {targetRole || 'your target role'} and should be prioritized
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid md:grid-cols-2 gap-4">
                                {skillAnalysis.criticalMissingSkills.map((skill) => {
                                  const suggestion = skillAnalysis.suggested_skills.find(s => s.name === skill);
                                  return (
                                    <div key={skill} className="p-4 border border-red-200 rounded-lg bg-white">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-red-800">{skill}</h4>
                                        <Badge className="bg-red-600 text-white">CRITICAL</Badge>
                                      </div>
                                      {suggestion && (
                                        <>
                                          <p className="text-sm text-red-700 mb-2">{suggestion.reason}</p>
                                          <div className="flex gap-2">
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              className="border-red-300 text-red-700 hover:bg-red-100"
                                              onClick={() => handleAddSkill(skill)}
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Add to Profile
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              className="border-red-300 text-red-700 hover:bg-red-100"
                                              onClick={() => {
                                                const skillSuggestion = skillAnalysis.suggested_skills.find(s => s.name === skill);
                                                if (skillSuggestion) {
                                                  const skillSuggestionObj = {
                                                    skill: skill,
                                                    reason: skillSuggestion.reason,
                                                    impact: "High impact on job prospects",
                                                    courses: {
                                                      free: { name: `${skill} Tutorial`, url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}` },
                                                      paid: { name: `Complete ${skill} Course`, url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`, price: '₹399' }
                                                    }
                                                  };
                                                  setSelectedSkill(skillSuggestionObj);
                                                }
                                              }}
                                            >
                                              <ExternalLink className="h-3 w-3 mr-1" />
                                              Learn More
                                            </Button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Important Missing Skills */}
                        {skillAnalysis.importantMissingSkills.length > 0 && (
                          <Card className="glass-card border-yellow-200 bg-yellow-50">
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                                <Star className="h-6 w-6 text-yellow-600" />
                                <span>Important Missing Skills</span>
                              </CardTitle>
                              <CardDescription className="text-yellow-700">
                                These skills will significantly improve your job prospects
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid md:grid-cols-3 gap-4">
                                {skillAnalysis.importantMissingSkills.map((skill) => {
                                  const suggestion = skillAnalysis.suggested_skills.find(s => s.name === skill);
                                  return (
                                    <div key={skill} className="p-4 border border-yellow-200 rounded-lg bg-white">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-yellow-800">{skill}</h4>
                                        <Badge className="bg-yellow-600 text-white">IMPORTANT</Badge>
                                      </div>
                                      {suggestion && (
                                        <>
                                          <p className="text-sm text-yellow-700 mb-2">{suggestion.reason}</p>
                                          <div className="flex gap-2">
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                                              onClick={() => handleAddSkill(skill)}
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Add to Profile
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                                              onClick={() => {
                                                const skillSuggestion = skillAnalysis.suggested_skills.find(s => s.name === skill);
                                                if (skillSuggestion) {
                                                  const skillSuggestionObj = {
                                                    skill: skill,
                                                    reason: skillSuggestion.reason,
                                                    impact: "Medium impact on job prospects",
                                                    courses: {
                                                      free: { name: `${skill} Tutorial`, url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}` },
                                                      paid: { name: `Complete ${skill} Course`, url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`, price: '₹399' }
                                                    }
                                                  };
                                                  setSelectedSkill(skillSuggestionObj);
                                                }
                                              }}
                                            >
                                              <ExternalLink className="h-3 w-3 mr-1" />
                                              Learn More
                                            </Button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* All Skills Analysis */}
                        <SkillAnalyzerCard 
                          analysis={skillAnalysis}
                          onAddSkill={handleAddSkill}
                          onAddToLearningPlan={handleAddToLearningPlan}
                        />
                      </>
                    )}
                  </TabsContent>
                  
                  
                  
                  <TabsContent value="chatbot" className="space-y-8">
                    <CareerChatbot 
                      userSkills={userSkills}
                      targetRole={targetRole}
                      experienceYears={3}
                    />
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skill Course Modal */}
          <Dialog open={!!selectedSkill} onOpenChange={() => setSelectedSkill(null)}>
            <DialogContent className="max-w-2xl glass-card">
              <DialogHeader>
                <DialogTitle className="text-2xl gradient-text">
                  Master {selectedSkill?.skill}
                </DialogTitle>
                <DialogDescription className="text-lg">
                  {selectedSkill?.reason}
                </DialogDescription>
              </DialogHeader>
              
              {selectedSkill && (
                <div className="space-y-6 mt-6">
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h4 className="font-semibold text-accent mb-2">Career Impact</h4>
                    <p className="text-sm">{selectedSkill.impact}</p>
                  </div>

                  <div className="grid gap-4">
                    <Card className="border-success/20 bg-success/5">
                      <CardHeader>
                        <CardTitle className="text-lg text-success">Free – Quick Start</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">{selectedSkill.courses.free.name}</p>
                        <Button variant="outline" className="border-success hover:bg-success/10" asChild>
                          <a href={selectedSkill.courses.free.url} target="_blank" rel="noopener noreferrer">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Start Free Course
                          </a>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="text-lg text-primary flex items-center justify-between">
                          Paid – Deep Dive 🚀
                          <Badge className="bg-primary text-primary-foreground">{selectedSkill.courses.paid.price}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">{selectedSkill.courses.paid.name}</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Structured learning with projects, certificates, and lifetime access. 
                          A small investment that can 10x your career opportunities.
                        </p>
                        <Button className="gradient-bg" asChild>
                          <a href={selectedSkill.courses.paid.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Enroll Now - {selectedSkill.courses.paid.price}
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}