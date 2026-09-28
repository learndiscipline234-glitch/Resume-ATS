import React, { useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Users, Linkedin, Copy, Send, Sparkles, Target, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface NetworkingSuggestion {
  id: string
  name: string
  title: string
  company: string
  reason: string
  industry: string
  mutualConnections: number
}

const networkingSuggestions: NetworkingSuggestion[] = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Senior Frontend Developer",
    company: "Meta",
    reason: "Expert in React and has written about career growth in tech",
    industry: "Big Tech",
    mutualConnections: 12
  },
  {
    id: "2",
    name: "Marcus Johnson", 
    title: "Engineering Manager",
    company: "Stripe",
    reason: "Leads frontend teams and actively mentors junior developers",
    industry: "Fintech",
    mutualConnections: 8
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    title: "Tech Lead",
    company: "Shopify",
    reason: "Specializes in e-commerce platforms and full-stack development",
    industry: "E-commerce",
    mutualConnections: 5
  }
]

export function NetworkingAssistant() {
  const [selectedTab, setSelectedTab] = useState("connection-messages")
  const [careerGoal, setCareerGoal] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [currentRole, setCurrentRole] = useState("")
  const [generatedMessage, setGeneratedMessage] = useState("")
  const [generatedBio, setGeneratedBio] = useState("")
  const [suggestions, setSuggestions] = useState<NetworkingSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateConnectionMessage = async () => {
    if (!targetRole.trim()) {
      toast.error("Please enter the target person's role")
      return
    }

    setIsGenerating(true)
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const message = `Hi ${targetRole},

I hope this message finds you well! I came across your profile and was really impressed by your work at [Company]. As someone aspiring to grow in the [Industry] space, I'd love to connect and learn from your experience.

I'm currently a ${currentRole || "professional"} with a passion for ${careerGoal || "technology and innovation"}. I'd greatly appreciate any insights you might have about career development in this field.

Would you be open to a brief conversation? I understand you're busy, so even a short exchange would be incredibly valuable.

Thank you for considering my request!

Best regards,
[Your Name]`

    setGeneratedMessage(message)
    setIsGenerating(false)
    toast.success("Connection message generated!")
  }

  const generateLinkedInBio = async () => {
    if (!careerGoal.trim() && !currentRole.trim()) {
      toast.error("Please enter your career goal or current role")
      return
    }

    setIsGenerating(true)
    
    // Simulate AI generation  
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const bio = `${currentRole || "Passionate Professional"} | ${careerGoal || "Driving Innovation in Tech"} | Open to New Opportunities

🚀 Passionate about leveraging technology to solve real-world problems and drive meaningful impact.

💡 Currently focused on: ${careerGoal || "Advancing my career in technology"}
🔧 Specializing in: Full-stack development, AI integration, and modern web technologies
📈 Always learning: Staying current with React, TypeScript, and emerging tech trends

🎯 Career Goal: ${careerGoal || "Building innovative solutions that make a difference"}

📫 Open to: Networking opportunities, mentorship, collaboration, and meaningful conversations about technology and career growth.

Let's connect and explore how we can help each other succeed! 🤝

#Technology #CareerGrowth #Innovation #Networking`

    setGeneratedBio(bio)
    setIsGenerating(false)
    toast.success("LinkedIn bio generated!")
  }

  const generateNetworkingSuggestions = async () => {
    if (!careerGoal.trim()) {
      toast.error("Please enter your career goal")
      return
    }

    setIsGenerating(true)
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSuggestions(networkingSuggestions)
    setIsGenerating(false)
    toast.success("Found networking opportunities!")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-gradient-surface p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Networking <span className="gradient-text">Assistant</span>
          </motion.h1>
          <p className="text-muted-foreground text-lg">
            AI-powered networking tools to help you build meaningful professional connections and grow your career network.
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection-messages" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Connection Messages</span>
            </TabsTrigger>
            <TabsTrigger value="linkedin-bio" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>LinkedIn Bio</span>
            </TabsTrigger>
            <TabsTrigger value="networking-suggestions" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>People to Connect</span>
            </TabsTrigger>
          </TabsList>

          {/* Connection Messages Tab */}
          <TabsContent value="connection-messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span>AI Connection Message Generator</span>
                </CardTitle>
                <CardDescription>
                  Generate personalized LinkedIn connection messages that get responses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-role">Your Current Role</Label>
                    <Input
                      id="current-role"
                      placeholder="e.g., Frontend Developer"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-role">Target Person's Role</Label>
                    <Input
                      id="target-role"
                      placeholder="e.g., Senior Engineering Manager"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="career-goal-msg">Your Career Goal</Label>
                  <Input
                    id="career-goal-msg"
                    placeholder="e.g., Transition into a senior frontend role at a tech company"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                  />
                </div>

                <Button
                  onClick={generateConnectionMessage}
                  disabled={isGenerating}
                  className="w-full gradient-bg text-white"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Generating Message...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Connection Message
                    </>
                  )}
                </Button>

                {generatedMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Generated Message</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedMessage)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={generatedMessage}
                          onChange={(e) => setGeneratedMessage(e.target.value)}
                          className="min-h-[200px] font-mono text-sm"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LinkedIn Bio Tab */}
          <TabsContent value="linkedin-bio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Linkedin className="h-5 w-5 text-primary" />
                  <span>LinkedIn Bio Generator</span>
                </CardTitle>
                <CardDescription>
                  Create a compelling LinkedIn bio that attracts the right opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-role-bio">Current Role/Title</Label>
                  <Input
                    id="current-role-bio"
                    placeholder="e.g., Frontend Developer at TechCorp"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="career-goal-bio">Career Aspiration</Label>
                  <Textarea
                    id="career-goal-bio"
                    placeholder="e.g., Become a senior frontend developer specializing in React and modern web technologies"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                  />
                </div>

                <Button
                  onClick={generateLinkedInBio}
                  disabled={isGenerating}
                  className="w-full gradient-bg text-white"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Generating Bio...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate LinkedIn Bio
                    </>
                  )}
                </Button>

                {generatedBio && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Generated Bio</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedBio)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={generatedBio}
                          onChange={(e) => setGeneratedBio(e.target.value)}
                          className="min-h-[300px] font-mono text-sm"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Networking Suggestions Tab */}
          <TabsContent value="networking-suggestions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Smart Networking Suggestions</span>
                </CardTitle>
                <CardDescription>
                  Find professionals and communities relevant to your career goals.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="career-goal-suggestions">What's your career goal?</Label>
                  <Textarea
                    id="career-goal-suggestions"
                    placeholder="e.g., Break into frontend development at a FAANG company"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                  />
                </div>

                <Button
                  onClick={generateNetworkingSuggestions}
                  disabled={isGenerating}
                  className="w-full gradient-bg text-white"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Finding Connections...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Find People to Connect With
                    </>
                  )}
                </Button>

                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <h3 className="text-lg font-semibold">Recommended Connections</h3>
                    <div className="grid gap-4">
                      {suggestions.map((person, index) => (
                        <motion.div
                          key={person.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="hover:shadow-glow transition-all duration-300">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-lg">{person.name}</h4>
                                  <p className="text-muted-foreground">{person.title}</p>
                                  <p className="text-sm text-muted-foreground">{person.company}</p>
                                </div>
                                <Badge className="bg-accent/10 text-accent">
                                  {person.industry}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">
                                <strong>Why connect:</strong> {person.reason}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  {person.mutualConnections} mutual connections
                                </span>
                                <Button size="sm" variant="outline">
                                  <Send className="mr-2 h-3 w-3" />
                                  Connect
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}