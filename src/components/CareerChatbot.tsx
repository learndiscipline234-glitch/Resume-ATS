import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  User,
  Lightbulb,
  Target,
  BookOpen,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { careerChat, ChatMessage as ServiceChatMessage, CareerChatContext } from "@/services/edgeFunctionService";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  skillData?: SkillGapData;
}

interface SkillGapData {
  current_skills: string[];
  suggested_skills: Array<{
    skill: string;
    priority: "high" | "medium" | "low";
    reason: string;
    recommended_action: string;
  }>;
  skill_chart: Array<{
    skill: string;
    current_score: number;
    target_score: number;
    gap: number;
  }>;
}

interface CareerChatbotProps {
  userSkills?: string[];
  targetRole?: string;
  experienceYears?: number;
}

export function CareerChatbot({ userSkills = [], targetRole, experienceYears }: CareerChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI Career Mentor. I'm here to help you with any career-related questions - whether it's about skills, job searching, interviews, networking, or career growth. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const appendAskForDetails = (text: string) => `${text}\n\nTell me more about what you’re aiming for (role, skills, or career change).`;

  const containsProfanity = (text: string) => {
    const badWords = ["fuck","shit","bitch","asshole","bastard","dick","cunt","slut","whore"]; // simple filter
    const lower = text.toLowerCase();
    return badWords.some(w => lower.includes(w));
  };

  const isGreeting = (text: string) => {
    const t = text.trim().toLowerCase();
    return ["hi","hello","hey","hi!","hello!","hey!","hi there","hello there"].includes(t);
  };

  const generateCareerResponse = (question: string): { content: string; skillData?: SkillGapData } => {
    const lowerQuestion = question.toLowerCase();

    // Profanity check
    if (containsProfanity(lowerQuestion)) {
      return { content: "⚠️ Please avoid this language. Let’s keep this professional." };
    }

    // Greeting handling
    if (isGreeting(question)) {
      return { content: "Hi! How’s it going?" };
    }
    
    // Skill-related questions
    if (lowerQuestion.includes('skill') || lowerQuestion.includes('learn') || lowerQuestion.includes('technology')) {
      const r = generateSkillAdvice(question);
      return { content: appendAskForDetails(r.content), skillData: r.skillData };
    }
    
    // Job search questions
    if (lowerQuestion.includes('job') || lowerQuestion.includes('search') || lowerQuestion.includes('apply')) {
      const r = generateJobSearchAdvice(question);
      return { content: appendAskForDetails(r.content) };
    }
    
    // Interview questions
    if (lowerQuestion.includes('interview') || lowerQuestion.includes('prepare') || lowerQuestion.includes('question')) {
      const r = generateInterviewAdvice(question);
      return { content: appendAskForDetails(r.content) };
    }
    
    // Resume questions
    if (lowerQuestion.includes('resume') || lowerQuestion.includes('cv') || lowerQuestion.includes('format')) {
      const r = generateResumeAdvice(question);
      return { content: appendAskForDetails(r.content) };
    }
    
    // Networking questions
    if (lowerQuestion.includes('network') || lowerQuestion.includes('connect') || lowerQuestion.includes('professional')) {
      const r = generateNetworkingAdvice(question);
      return { content: appendAskForDetails(r.content) };
    }
    
    // Salary questions
    if (lowerQuestion.includes('salary') || lowerQuestion.includes('negotiate') || lowerQuestion.includes('pay')) {
      const r = generateSalaryAdvice(question);
      return { content: appendAskForDetails(r.content) };
    }
    
    // Career growth questions
    if (lowerQuestion.includes('career') || lowerQuestion.includes('growth') || lowerQuestion.includes('advance')) {
      const r = generateCareerGrowthAdvice(question);
      return { content: appendAskForDetails(r.content) };
    }
    
    // Default response
    const r = generateGeneralAdvice(question);
    return { content: appendAskForDetails(r.content) };
  };

  const generateSkillAdvice = (question: string): { content: string; skillData?: SkillGapData } => {
    const skillData: SkillGapData = {
      current_skills: userSkills.length > 0 ? userSkills : ["JavaScript", "React", "Node.js", "Python", "SQL"],
      suggested_skills: [
        {
          skill: "TypeScript",
          priority: "high",
          reason: "Type safety and better developer experience for large codebases",
          recommended_action: "Complete TypeScript course and migrate existing JavaScript projects"
        },
        {
          skill: "AWS",
          priority: "high",
          reason: "Cloud skills are in high demand and can increase salary by 25%",
          recommended_action: "Start with AWS Free Tier and complete Solutions Architect Associate certification"
        },
        {
          skill: "Docker",
          priority: "medium",
          reason: "Essential for modern development workflows and deployment",
          recommended_action: "Learn Docker fundamentals and containerize 2-3 projects"
        },
        {
          skill: "Kubernetes",
          priority: "medium",
          reason: "Container orchestration is becoming standard in production environments",
          recommended_action: "Learn Kubernetes basics and deploy a sample application"
        },
        {
          skill: "GraphQL",
          priority: "low",
          reason: "Modern API development skill that's growing in popularity",
          recommended_action: "Build a GraphQL API with Node.js and React frontend"
        }
      ],
      skill_chart: [
        { skill: "JavaScript", current_score: 85, target_score: 90, gap: 5 },
        { skill: "React", current_score: 80, target_score: 85, gap: 5 },
        { skill: "Node.js", current_score: 75, target_score: 80, gap: 5 },
        { skill: "Python", current_score: 70, target_score: 75, gap: 5 },
        { skill: "SQL", current_score: 65, target_score: 70, gap: 5 },
        { skill: "TypeScript", current_score: 30, target_score: 80, gap: 50 },
        { skill: "AWS", current_score: 25, target_score: 75, gap: 50 },
        { skill: "Docker", current_score: 20, target_score: 70, gap: 50 },
        { skill: "Kubernetes", current_score: 15, target_score: 60, gap: 45 },
        { skill: "GraphQL", current_score: 10, target_score: 65, gap: 55 }
      ]
    };

    const content = `## 🎯 Skill Development Strategy

**Summary**: Based on your current skills, I recommend focusing on TypeScript and AWS as high-priority additions, followed by containerization technologies.

### 📊 Your Current Skills
You have a solid foundation in ${skillData.current_skills.slice(0, 3).join(", ")} and related technologies. This positions you well for ${targetRole || "senior development roles"}.

### 🚀 Recommended Learning Path

**High Priority Skills:**
- **TypeScript**: Essential for modern JavaScript development
- **AWS**: Cloud skills are in extremely high demand

**Medium Priority Skills:**
- **Docker**: Containerization is becoming standard
- **Kubernetes**: For advanced container orchestration

**Low Priority Skills:**
- **GraphQL**: Growing in popularity for API development

### 📚 Learning Resources
1. **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Free official documentation
2. **AWS**: [AWS Free Tier](https://aws.amazon.com/free/) - Hands-on practice
3. **Docker**: [Docker Official Tutorial](https://docs.docker.com/get-started/) - Step-by-step guide
4. **Kubernetes**: [Kubernetes Basics](https://kubernetes.io/docs/tutorials/) - Official tutorials

### 🎯 Next Steps
1. Choose 2-3 skills to focus on first
2. Set up a 30-day learning plan
3. Build projects to practice new skills
4. Update your resume and LinkedIn profile
5. Consider getting certified in high-priority skills

Would you like me to elaborate on any specific skill or help you create a learning timeline?`;

    return { content, skillData };
  };

  const generateJobSearchAdvice = (question: string): { content: string } => {
    const content = `## 🔍 Job Search Strategy

**Summary**: A successful job search requires a multi-faceted approach combining targeted applications, networking, and skill development.

### 📋 Step-by-Step Job Search Process

**1. Define Your Target (Week 1)**
- Research companies and roles that align with your skills
- Identify 10-15 target companies
- Understand their tech stack and culture
- Set salary expectations based on market research

**2. Optimize Your Application Materials (Week 2)**
- Tailor your resume for each application
- Write compelling cover letters
- Update your LinkedIn profile with keywords
- Create a portfolio showcasing your best work

**3. Apply Strategically (Weeks 3-6)**
- Apply to 3-5 jobs per week (quality over quantity)
- Use multiple channels: job boards, company websites, referrals
- Track applications in a spreadsheet
- Follow up after 1-2 weeks if no response

**4. Network Actively (Ongoing)**
- Attend virtual meetups and conferences
- Connect with professionals in your field
- Reach out to current employees at target companies
- Ask for informational interviews

### 🎯 Best Job Search Platforms
- **LinkedIn**: Professional networking and job postings
- **Indeed**: Broad job search with filters
- **AngelList**: Startup and tech company jobs
- **Glassdoor**: Company reviews and salary insights
- **Company Websites**: Direct applications to target companies

### 📈 Success Metrics
- Response rate: 10-15% is good
- Interview rate: 5-10% of applications
- Offer rate: 20-30% of interviews

### 🚀 Next Steps
1. Create a job search tracking spreadsheet
2. Set up job alerts on 2-3 platforms
3. Reach out to 5 people in your network this week
4. Apply to 3 jobs that perfectly match your skills
5. Prepare for common interview questions

What specific aspect of job searching would you like help with?`;

    return { content };
  };

  const generateInterviewAdvice = (question: string): { content: string } => {
    const content = `## 🎤 Interview Preparation Guide

**Summary**: Successful interviews require thorough preparation, practice, and confidence. Here's your comprehensive strategy.

### 📚 Pre-Interview Preparation

**1. Research the Company (2-3 hours)**
- Company mission, values, and recent news
- Tech stack and development practices
- Team structure and company culture
- Recent projects or achievements

**2. Prepare Your Stories (1-2 hours)**
- STAR method: Situation, Task, Action, Result
- 5-7 stories covering different scenarios
- Quantify your achievements with numbers
- Practice telling stories in 2-3 minutes

**3. Technical Preparation (4-6 hours)**
- Review job requirements and prepare examples
- Practice coding problems (LeetCode, HackerRank)
- Prepare questions about their tech stack
- Review system design basics if applicable

### 🗣️ Common Interview Questions & Answers

**"Tell me about yourself"**
- 2-3 minute elevator pitch
- Focus on relevant experience and achievements
- End with why you're excited about this role

**"Why do you want to work here?"**
- Specific reasons related to company/role
- Show you've done your research
- Connect your goals with their mission

**"What's your greatest weakness?"**
- Choose a real weakness you're working on
- Show self-awareness and improvement
- Example: "I sometimes overthink technical solutions, but I've learned to set time limits and ask for feedback"

**"Do you have any questions for us?"**
- Ask about team dynamics, growth opportunities
- Show genuine interest in the role
- Avoid questions about salary/benefits initially

### 💻 Technical Interview Tips
- Think out loud while solving problems
- Ask clarifying questions before coding
- Start with a simple solution, then optimize
- Test your code with examples
- Discuss time/space complexity

### 🎯 Next Steps
1. Practice your "tell me about yourself" story
2. Prepare 5-10 thoughtful questions to ask
3. Do 2-3 mock interviews with friends
4. Research the company thoroughly
5. Prepare specific examples of your achievements

What type of interview are you preparing for? Technical, behavioral, or both?`;

    return { content };
  };

  const generateResumeAdvice = (question: string): { content: string } => {
    const content = `## 📄 Resume Optimization Guide

**Summary**: A strong resume gets you interviews. Focus on quantifiable achievements, relevant keywords, and clear formatting.

### 🎯 Resume Structure & Content

**1. Header Section**
- Full name, phone, email, LinkedIn URL
- Location (city, state)
- GitHub/portfolio links if relevant
- Keep it clean and professional

**2. Professional Summary (2-3 lines)**
- Years of experience and key skills
- One major achievement or specialization
- What you're looking for next
- Example: "Full-stack developer with 3+ years building scalable web applications using React and Node.js, with experience improving application performance by 40%."

**3. Experience Section**
- Use action verbs: Built, Developed, Implemented, Led
- Quantify achievements with numbers
- Focus on impact, not just responsibilities
- Include relevant technologies

**4. Skills Section**
- Group by category: Languages, Frameworks, Tools
- Include both technical and soft skills
- Match keywords from job descriptions
- Be honest about proficiency levels

### 📊 Quantifying Your Achievements

**Instead of:** "Worked on improving application performance"
**Write:** "Improved application performance by 40% using React optimization techniques, reducing load time from 3 seconds to 1.8 seconds"

**Instead of:** "Led a team of developers"
**Write:** "Led a team of 4 developers to deliver a microservices architecture, handling 10x more traffic than the previous system"

**Instead of:** "Implemented testing"
**Write:** "Implemented automated testing pipeline using Jest and Cypress, reducing production bugs by 60%"

### 🔍 ATS Optimization
- Use standard section headers
- Include relevant keywords from job postings
- Save as PDF to preserve formatting
- Use simple, clean fonts (Arial, Calibri, Times New Roman)
- Avoid graphics, tables, or complex formatting

### 📈 Resume Examples by Experience Level

**Entry Level (0-2 years):**
- Focus on projects, internships, and education
- Include personal projects and contributions
- Highlight relevant coursework and certifications

**Mid Level (3-5 years):**
- Emphasize technical achievements and impact
- Show progression in responsibilities
- Include leadership or mentoring experience

**Senior Level (5+ years):**
- Focus on strategic impact and leadership
- Include team management and architecture decisions
- Show business impact and cost savings

### 🚀 Next Steps
1. Update your resume with quantifiable achievements
2. Tailor it for each job application
3. Have 2-3 people review it
4. Test it through ATS systems
5. Keep it updated with new skills and projects

Would you like me to help you improve a specific section of your resume?`;

    return { content };
  };

  const generateNetworkingAdvice = (question: string): { content: string } => {
    const content = `## 🤝 Professional Networking Strategy

**Summary**: Building a strong professional network opens doors to opportunities, mentorship, and career growth. Here's how to network effectively.

### 🎯 Networking Fundamentals

**1. Define Your Networking Goals**
- What type of opportunities are you seeking?
- Who are the key people in your industry?
- What value can you offer to others?
- Set specific, measurable networking targets

**2. Build Your Online Presence**
- Optimize your LinkedIn profile with keywords
- Share relevant content and insights
- Engage with others' posts thoughtfully
- Join industry-specific groups and communities

**3. Attend Events and Meetups**
- Look for virtual and in-person events
- Prepare elevator pitch and business cards
- Set goals: meet 3-5 new people per event
- Follow up within 24-48 hours

### 💬 Effective Networking Conversations

**Starting Conversations:**
- "Hi, I'm [Name]. I noticed you work at [Company]. I'm really interested in learning about [specific aspect]."
- "What brought you to this event today?"
- "I saw your post about [topic]. I'd love to hear more about your experience."

**During Conversations:**
- Ask open-ended questions
- Listen actively and show genuine interest
- Share relevant experiences or insights
- Offer help or resources when possible

**Ending Conversations:**
- Exchange contact information
- Suggest a specific follow-up action
- "I'd love to continue this conversation. Would you be open to a coffee chat next week?"

### 📱 Digital Networking Platforms

**LinkedIn:**
- Connect with people you meet
- Send personalized connection requests
- Share valuable content regularly
- Engage with others' posts

**Twitter:**
- Follow industry leaders and companies
- Participate in relevant hashtag conversations
- Share insights and ask questions

**Discord/Slack Communities:**
- Join developer and tech communities
- Participate in discussions
- Help others with questions
- Build relationships over time

### 🎯 Networking Follow-Up Strategy

**Immediate (Within 24 hours):**
- Send a personalized LinkedIn connection request
- Reference something specific from your conversation
- Suggest a concrete next step

**Short-term (Within 1 week):**
- Send a follow-up email or message
- Share a relevant article or resource
- Invite them to coffee or a virtual meeting

**Long-term (Monthly):**
- Check in with updates on your progress
- Share relevant opportunities or information
- Offer help with their projects or goals

### 🚀 Next Steps
1. Update your LinkedIn profile with current information
2. Identify 5 people you'd like to connect with this week
3. Find 2-3 virtual events to attend this month
4. Prepare your elevator pitch (30-60 seconds)
5. Set up a system to track your networking activities

What's your current networking goal? Are you looking for job opportunities, mentorship, or industry insights?`;

    return { content };
  };

  const generateSalaryAdvice = (question: string): { content: string } => {
    const content = `## 💰 Salary Negotiation Guide

**Summary**: Effective salary negotiation requires research, preparation, and confidence. Here's how to maximize your compensation.

### 📊 Research & Preparation

**1. Market Research (2-3 hours)**
- Use Glassdoor, PayScale, and LinkedIn Salary Insights
- Research salaries for your role, location, and experience level
- Consider total compensation: salary, bonuses, equity, benefits
- Factor in cost of living differences

**2. Know Your Value (1 hour)**
- List your unique skills and achievements
- Quantify your impact with numbers
- Identify what makes you different from other candidates
- Prepare specific examples of your contributions

**3. Understand the Company's Position**
- Research their financial health and growth stage
- Understand their compensation philosophy
- Know their budget constraints and priorities
- Identify non-monetary benefits they might offer

### 💬 Negotiation Strategy

**Timing:**
- Wait until you have a written offer
- Express enthusiasm for the role first
- Then discuss compensation
- Be prepared to negotiate multiple rounds

**Opening the Conversation:**
- "I'm excited about this opportunity. I'd like to discuss the compensation package."
- "Based on my research and experience, I was hoping we could discuss the salary range."
- "I have a few questions about the total compensation package."

**Making Your Case:**
- Reference your research and market data
- Highlight your unique value proposition
- Use specific examples of your achievements
- Be confident but not demanding

### 🎯 Negotiation Tactics

**Anchoring:**
- Start with a number at the high end of your range
- Give a range: "I was thinking somewhere in the $X-Y range"
- Let them make the first offer if possible

**Creating Value:**
- Emphasize what you bring to the table
- Show how you'll help them achieve their goals
- Highlight your potential for growth and impact

**Finding Win-Win Solutions:**
- Be flexible on different compensation elements
- Consider equity, bonuses, or other benefits
- Negotiate for professional development opportunities
- Ask about flexible work arrangements

### 📈 Common Negotiation Scenarios

**Scenario 1: Low Initial Offer**
- "I appreciate the offer. Based on my research and experience, I was hoping for something closer to $X."
- Provide market data to support your request
- Ask about opportunities for quick salary reviews

**Scenario 2: They Won't Budge on Salary**
- Negotiate other benefits: more vacation, flexible hours, professional development budget
- Ask about performance bonuses or equity
- Negotiate for a faster promotion timeline

**Scenario 3: Multiple Offers**
- "I have another offer at $X. I'm more interested in this role, but I need to consider the total package."
- Use competing offers as leverage (but be honest)
- Ask them to match or beat the other offer

### 🚀 Next Steps
1. Research salary ranges for your role and location
2. Prepare your value proposition with specific examples
3. Practice your negotiation conversation
4. Decide on your minimum acceptable offer
5. Prepare alternative requests if salary is non-negotiable

What's your current situation? Are you negotiating a new offer or asking for a raise?`;

    return { content };
  };

  const generateCareerGrowthAdvice = (question: string): { content: string } => {
    const content = `## 🚀 Career Growth Strategy

**Summary**: Sustainable career growth requires a combination of skill development, relationship building, and strategic positioning. Here's your roadmap to advancement.

### 🎯 Career Growth Framework

**1. Define Your Career Vision (1-2 hours)**
- Where do you want to be in 1, 3, and 5 years?
- What type of work excites you most?
- What impact do you want to make?
- What lifestyle do you want to maintain?

**2. Identify Growth Opportunities (2-3 hours)**
- Analyze your current role for growth potential
- Research roles 1-2 levels above yours
- Identify skills gaps you need to fill
- Find mentors and role models in your field

**3. Create a Development Plan (1-2 hours)**
- Set specific, measurable goals
- Identify learning resources and opportunities
- Create a timeline for skill development
- Plan for regular progress reviews

### 📈 Skill Development Strategy

**Technical Skills:**
- Stay current with industry trends
- Learn new technologies and frameworks
- Contribute to open-source projects
- Get certified in high-demand skills

**Soft Skills:**
- Improve communication and presentation skills
- Develop leadership and management abilities
- Build emotional intelligence
- Practice public speaking and networking

**Business Skills:**
- Understand your company's business model
- Learn about your industry and market
- Develop project management skills
- Understand financial metrics and KPIs

### 🎯 Advancement Strategies

**1. Excel in Your Current Role**
- Consistently deliver high-quality work
- Take on additional responsibilities
- Solve problems and create value
- Build strong relationships with colleagues

**2. Seek Stretch Assignments**
- Volunteer for challenging projects
- Take on leadership opportunities
- Mentor junior colleagues
- Lead cross-functional initiatives

**3. Build Your Personal Brand**
- Share your expertise through content
- Speak at conferences and meetups
- Contribute to industry discussions
- Build a strong online presence

**4. Network Strategically**
- Connect with senior professionals
- Find mentors and sponsors
- Join professional associations
- Attend industry events

### 📊 Career Growth Metrics

**Short-term (6 months):**
- Complete 2-3 skill development courses
- Take on 1 new responsibility or project
- Build relationships with 5 new professionals
- Update your resume and LinkedIn profile

**Medium-term (1-2 years):**
- Get promoted or change roles
- Lead a significant project or initiative
- Mentor 2-3 junior colleagues
- Speak at 1-2 industry events

**Long-term (3-5 years):**
- Reach your target role or level
- Build a strong professional reputation
- Have a network of 100+ relevant professionals
- Be recognized as an expert in your field

### 🚀 Next Steps
1. Write down your 1, 3, and 5-year career goals
2. Identify 3 skills you need to develop this year
3. Find 2-3 mentors or role models to learn from
4. Set up monthly career development check-ins
5. Create a personal brand strategy

What's your current career level and what's your next target role?`;

    return { content };
  };

  const generateGeneralAdvice = (question: string): { content: string } => {
    const content = `## 💡 General Career Guidance

**Summary**: I'm here to help with any career-related question you have. Let me provide some general guidance and then we can dive deeper into your specific needs.

### 🎯 Common Career Challenges & Solutions

**1. Feeling Stuck in Your Current Role**
- Identify what's holding you back
- Look for growth opportunities within your company
- Consider lateral moves to gain new skills
- Network with people in different departments

**2. Imposter Syndrome**
- Remember that everyone feels this way sometimes
- Focus on your achievements and growth
- Seek feedback from trusted colleagues
- Celebrate small wins and progress

**3. Work-Life Balance**
- Set clear boundaries between work and personal time
- Communicate your needs with your manager
- Prioritize your health and relationships
- Consider flexible work arrangements

**4. Career Transitions**
- Research your target industry thoroughly
- Build relevant skills before making the switch
- Network with people in your target field
- Consider taking on side projects or freelance work

### 🚀 Universal Career Success Principles

**1. Continuous Learning**
- Stay curious and open to new ideas
- Invest in your professional development
- Learn from both successes and failures
- Share your knowledge with others

**2. Relationship Building**
- Treat everyone with respect and kindness
- Help others without expecting anything in return
- Build genuine connections, not just professional ones
- Maintain relationships even when changing jobs

**3. Value Creation**
- Focus on solving problems and creating value
- Think about how your work impacts others
- Look for ways to improve processes and systems
- Share your ideas and innovations

**4. Personal Brand**
- Be authentic and consistent in your interactions
- Share your expertise and insights
- Build a strong online presence
- Tell your story in a compelling way

### 🎯 How I Can Help You

I can provide specific guidance on:
- **Skills Development**: What to learn and how to learn it
- **Job Searching**: Strategies for finding and landing opportunities
- **Interview Preparation**: How to prepare and perform well
- **Resume Writing**: How to showcase your experience effectively
- **Networking**: How to build and maintain professional relationships
- **Salary Negotiation**: How to maximize your compensation
- **Career Planning**: How to chart your path forward

### 🚀 Next Steps
1. Tell me more about your specific situation
2. What's your biggest career challenge right now?
3. What would you like to achieve in the next 6 months?
4. How can I help you move forward?

What specific career question can I help you with today?`;

    return { content };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || showDisclaimer) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const history: ServiceChatMessage[] = messages
        .filter(m => m.id !== '1')
        .map(m => ({ role: m.type === 'user' ? 'user' as const : 'assistant' as const, content: m.content }));

      const context: CareerChatContext = {};
      if (userSkills.length) context.skills = userSkills;
      if (targetRole) context.targetRole = targetRole;
      if (experienceYears) context.experienceYears = experienceYears;

      const reply = await careerChat(question, history, context);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.warn('Career chat LLM unavailable, using fallback:', err);
      const response = generateCareerResponse(question);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        skillData: response.skillData
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Convert markdown-like formatting to JSX
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mb-3 text-primary">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold mb-2 mt-4">{line.slice(4)}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold mb-2">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1">{line.slice(2)}</li>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
        return <li key={index} className="ml-4 mb-1">{line.slice(3)}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      {/* Disclaimer Modal */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Important Notice</DialogTitle>
            <DialogDescription>
              ⚠️ This is only for educational purposes. Please make your own research before taking any career decisions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowDisclaimer(false)}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Career Mentor
          </CardTitle>
          <CardDescription>
            Ask me anything about your career - skills, jobs, interviews, networking, or growth strategies.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 mt-1 flex-shrink-0" />
                      ) : (
                        <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      {formatMessage(message.content)}
                    </div>
                    
                    {message.skillData && (
                      <div className="mt-4 p-3 bg-background rounded border">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Skill Gap Analysis
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">Current Skills: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.skillData.current_skills.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Suggested Skills: </span>
                            <div className="space-y-1 mt-1">
                              {message.skillData.suggested_skills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  <Badge 
                                    className={`${
                                      skill.priority === 'high' ? 'bg-red-500' :
                                      skill.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                    } text-white`}
                                  >
                                    {skill.priority}
                                  </Badge>
                                  <span className="font-medium">{skill.skill}</span>
                                  <span className="text-muted-foreground">- {skill.reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your career..."
              className="flex-1"
              disabled={showDisclaimer}
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping || showDisclaimer}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
