import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Sparkles, MessageSquare, History, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { careerChat, ChatMessage as ServiceChatMessage, CareerChatContext } from "@/services/edgeFunctionService"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
}

const sampleQuestions = [
  "How do I negotiate a higher salary?",
  "What skills should I learn for my next role?", 
  "How to write an effective cover letter?",
  "Tips for remote work productivity?",
  "How to prepare for technical interviews?",
  "Career change strategies for 2024?"
]

export function AIMentor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI Career Mentor. I'm here to help you with career advice, job search strategies, interview preparation, and professional development. What would you like to discuss today?",
      sender: "ai",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      const history: ServiceChatMessage[] = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.sender === "user" ? "user" as const : "assistant" as const, content: m.content }))

      const reply = await careerChat(content, history)

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: reply,
        sender: "ai",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (err) {
      console.warn('AI Mentor: Edge Function unavailable, using fallback:', err)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(content),
        sender: "ai",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const generateAIResponse = (userMessage: string): string => {
    // Fallback response simulation (used when Edge Function is unavailable)
    const responses = [
      "That's a great question! Based on current industry trends, I'd recommend focusing on developing both technical and soft skills. For technical skills, consider learning cloud platforms like AWS or Azure. For soft skills, work on communication and leadership abilities.",
      "Excellent point! When it comes to career development, it's important to set clear goals and create a timeline. I suggest breaking down your career objective into smaller, achievable milestones. Would you like me to help you create a specific action plan?",
      "I understand your concern. This is actually quite common in today's job market. Here are some strategies that have proven effective: networking through LinkedIn, tailoring your resume for each application, and preparing for behavioral interviews using the STAR method.",
      "That's a strategic approach! For salary negotiations, research is key. Use platforms like Glassdoor, PayScale, and Levels.fyi to understand market rates for your role and experience level. Timing is also crucial - the best time to negotiate is during the offer stage, not after you've already accepted."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleQuestionClick = (question: string) => {
    sendMessage(question)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const saveCurrentSession = () => {
    if (messages.length > 1) { // More than just welcome message
      const session: ChatSession = {
        id: Date.now().toString(),
        title: messages[1]?.content.substring(0, 50) + "..." || "New Chat",
        messages: messages,
        timestamp: new Date()
      }
      setChatSessions(prev => [session, ...prev])
    }
  }

  const loadSession = (session: ChatSession) => {
    saveCurrentSession()
    setMessages(session.messages)
    setCurrentSessionId(session.id)
    setShowHistory(false)
  }

  const clearHistory = () => {
    setChatSessions([])
    setShowHistory(false)
  }

  const startNewChat = () => {
    saveCurrentSession()
    setMessages([{
      id: "welcome",
      content: "Hello! I'm your AI Career Mentor. I'm here to help you with career advice, job search strategies, interview preparation, and professional development. What would you like to discuss today?",
      sender: "ai",
      timestamp: new Date()
    }])
    setCurrentSessionId(null)
  }

  return (
    <div className="h-screen bg-gradient-surface flex flex-col">
      <div className="p-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">AI Career</span> Mentor
          </h1>
          <p className="text-lg text-muted-foreground">
            Get personalized career advice, interview tips, and professional guidance from our AI mentor.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 px-8 pb-8 overflow-hidden">
        <div className="h-full flex gap-6">
          {/* Chat History Sidebar */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="w-80 h-full"
              >
                <Card className="h-full bg-card/80 backdrop-blur-sm">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <History className="h-5 w-5 text-primary" />
                        <span>Chat History</span>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(false)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2 mb-4">
                      <Button
                        onClick={startNewChat}
                        className="w-full gradient-bg text-white"
                        size="sm"
                      >
                        New Chat
                      </Button>
                      <Button
                        onClick={clearHistory}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear History
                      </Button>
                    </div>
                    <ScrollArea className="h-[calc(100vh-280px)]">
                      <div className="space-y-2">
                        {chatSessions.map((session) => (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              currentSessionId === session.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-surface/50"
                            }`}
                            onClick={() => loadSession(session)}
                          >
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">
                              {session.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {session.timestamp.toLocaleDateString()} • {session.messages.length} messages
                            </p>
                          </motion.div>
                        ))}
                        {chatSessions.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No chat history yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col bg-card/80 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <span>Career Mentor Chat</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    {showHistory ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <History className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-start space-x-3 ${
                          message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={
                            message.sender === "user" 
                              ? "bg-secondary text-secondary-foreground" 
                              : "bg-primary text-primary-foreground"
                          }>
                            {message.sender === "user" ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[80%] ${message.sender === "user" ? "text-right" : ""}`}>
                          <div
                            className={`p-4 rounded-2xl ${
                              message.sender === "user"
                                ? "bg-primary text-primary-foreground ml-auto"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 px-2">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-start space-x-3"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted p-4 rounded-2xl">
                          <div className="flex space-x-1">
                            <div className="w-3 h-3 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-3 h-3 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-3 h-3 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Message Input */}
              <div className="border-t border-border/50 p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything about your career..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={isTyping || !inputValue.trim()}
                    className="gradient-bg"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Quick Questions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full bg-gradient-glow border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Quick Start</span>
                </CardTitle>
                <CardDescription>
                  Click on a question to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sampleQuestions.map((question, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full text-left justify-start h-auto p-3 text-sm hover:bg-primary/5 border border-border/50"
                      onClick={() => handleQuestionClick(question)}
                      disabled={isTyping}
                    >
                      <MessageSquare className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="line-clamp-2">{question}</span>
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}