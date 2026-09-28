import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      {/* Professional Hero Section */}
      <section className="hero-section hero-bg">
        <div className="hero-content">
          <motion.h1 
            className="hero-title gradient-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Accelerate Your Career Journey
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Get honest insights, transparent analysis, and practical guidance to advance your career. 
            No fake promises, just real results based on data and expertise.
          </motion.p>

          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 soft-shadow group"
              onClick={() => navigate("/topics")}
            >
              Enter Platform
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Scroll Indicator - Positioned Lower */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center cursor-pointer text-muted-foreground hover:text-primary transition-colors"
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
              <span className="text-sm mb-2">Scroll to explore</span>
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Transparent Career Insights
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Honest analysis, real data, and practical guidance to help you make informed career decisions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Resume Analysis",
                description: "Get transparent scoring based on real criteria: skills, experience, formatting, and ATS-friendliness.",
                icon: "📊"
              },
              {
                title: "Job Matching",
                description: "Find real job listings with honest match percentages and salary data from trusted sources.",
                icon: "🎯"
              },
              {
                title: "AI Mentor",
                description: "Chat with our honest AI assistant that saves your conversation history and provides genuine advice.",
                icon: "🤖"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="clean-card p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 primary-text">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button 
              size="lg"
              className="soft-shadow"
              onClick={() => navigate("/topics")}
            >
              Start Your Analysis
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Honest Analysis", value: "100%", desc: "No inflated scores" },
              { label: "Real Job Data", value: "Live", desc: "From trusted APIs" },
              { label: "Transparent Pricing", value: "₹449", desc: "Affordable courses" },
              { label: "Student Focused", value: "Always", desc: "Built for learners" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center clean-card p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl font-bold primary-text mb-2">{stat.value}</div>
                <div className="text-foreground font-medium mb-1">{stat.label}</div>
                <div className="text-muted-foreground text-sm">{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
