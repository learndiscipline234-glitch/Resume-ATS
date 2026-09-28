import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Route, 
  Target, 
  Users, 
  Bot,
  ArrowRight,
  Sparkles
} from "lucide-react";

const topics = [
  {
    id: "resume",
    title: "Resume Analyzer",
    description: "AI-powered resume insights with improvement suggestions and job fit analysis",
    icon: FileText,
    route: "/resume",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    position: { x: 0, y: 0 } // Top-left
  },
  {
    id: "roadmap",
    title: "Career Roadmap",
    description: "Personalized step-by-step career growth plans with skills and timelines",
    icon: Route,
    route: "/roadmap",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    position: { x: 1, y: 0 } // Top-right
  },
  {
    id: "jobs",
    title: "Job Match",
    description: "Intelligent job recommendations based on your skills and preferences",
    icon: Target,
    route: "/jobs",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    position: { x: 0, y: 1 } // Bottom-left
  },
  {
    id: "networking",
    title: "Networking Hub",
    description: "Connect with professionals and build meaningful career relationships",
    icon: Users,
    route: "/networking",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    position: { x: 1, y: 1 } // Bottom-right
  },
];

export function TopicsPage() {
  const navigate = useNavigate();
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const handleTopicClick = (route: string) => {
    navigate(route);
  };

  // Calculate positions for connecting lines
  const getCirclePosition = (topic: typeof topics[0]) => {
    const baseX = topic.position.x * 300 + 150; // 300px spacing, 150px offset
    const baseY = topic.position.y * 300 + 150;
    return { x: baseX, y: baseY };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-white/80" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-16 pb-8 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-6"
        >
          <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 shadow-sm mb-6">
            <Bot className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Choose Your Path</span>
          </div>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-6xl font-black mb-4 leading-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Career</span><br />
          <span className="bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">Intelligence</span>
        </motion.h1>
        
        <motion.p 
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          Unlock your potential with AI-powered career tools. Select a feature to begin your transformation.
        </motion.p>
      </div>

      {/* Main Circular Interface */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative" style={{ height: '600px' }}>
            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {/* Horizontal lines */}
              <motion.line
                x1="150" y1="300" x2="450" y2="300"
                stroke="url(#gradient1)"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
              />
              {/* Vertical lines */}
              <motion.line
                x1="300" y1="150" x2="300" y2="450"
                stroke="url(#gradient2)"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.7 }}
              />
              {/* Diagonal lines */}
              <motion.line
                x1="150" y1="150" x2="450" y2="450"
                stroke="url(#gradient3)"
                strokeWidth="1.5"
                strokeDasharray="3,3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, delay: 0.9 }}
              />
              <motion.line
                x1="450" y1="150" x2="150" y2="450"
                stroke="url(#gradient4)"
                strokeWidth="1.5"
                strokeDasharray="3,3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, delay: 1.1 }}
              />
              
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Circular Elements */}
            {topics.map((topic, index) => {
              const position = getCirclePosition(topic);
              return (
                <motion.div
                  key={topic.id}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${position.x - 100}px`, // Center the 200px circle
                    top: `${position.y - 100}px`,
                    zIndex: 10
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoveredTopic(topic.id)}
                  onHoverEnd={() => setHoveredTopic(null)}
                  onClick={() => handleTopicClick(topic.route)}
                >
                  {/* Main Circle */}
                  <div className="relative w-[200px] h-[200px]">
                    {/* Outer glow ring */}
                    <motion.div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${topic.color} p-1`}
                      animate={{
                        boxShadow: hoveredTopic === topic.id 
                          ? `0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)`
                          : `0 0 20px rgba(59, 130, 246, 0.2)`
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Inner circle */}
                      <div className={`w-full h-full rounded-full ${topic.bgColor} border-2 ${topic.borderColor} overflow-hidden shadow-lg`}>
                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
                          {/* Icon */}
                          <div className={`mb-3 p-4 rounded-full bg-gradient-to-br ${topic.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <topic.icon className="h-10 w-10 text-white" />
                          </div>
                          
                          {/* Title */}
                          <h3 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-gray-900 transition-colors">
                            {topic.title}
                          </h3>
                          
                          {/* Description - only show on hover */}
                          <motion.p 
                            className="text-xs text-gray-600 leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: hoveredTopic === topic.id ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {topic.description}
                          </motion.p>

                          {/* Arrow indicator */}
                          <motion.div
                            className="mt-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ 
                              opacity: hoveredTopic === topic.id ? 1 : 0,
                              x: hoveredTopic === topic.id ? 0 : -10
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowRight className="h-4 w-4 text-blue-600" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 text-center pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-6">
            Need guidance on where to start?
          </p>
          <motion.button
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 hover:border-blue-300 transition-colors group shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/mentor")}
          >
            <Sparkles className="h-4 w-4 text-blue-600 group-hover:animate-pulse" />
            <span className="text-gray-700">Ask AI Mentor</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}