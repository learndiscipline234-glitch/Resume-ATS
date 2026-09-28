import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Layout } from "@/components/Layout";
import { AnimatePresence, motion } from "framer-motion";
import Index from "@/pages/Index";
import { TopicsPage } from "@/pages/TopicsPage";
import { Dashboard } from "@/pages/Dashboard";
import { ResumeAnalyzer } from "@/pages/ResumeAnalyzer";
import { ResumeInsightsPage } from "@/pages/ResumeInsightsPage";
import { CareerRoadmap } from "@/pages/CareerRoadmap";
import { CareerChatbotPage } from "@/pages/CareerChatbotPage";
import { JobRecommendationsPage } from "@/pages/JobRecommendationsPage";
import { NetworkingAssistant } from "@/pages/NetworkingAssistant";
import { Courses } from "@/pages/Courses";
import { AuthPage } from "@/pages/AuthPage";
import { JobMatchingPage } from "@/pages/JobMatchingPage";
import { SkillGapPage } from "@/pages/SkillGapPage";
import { ResumeScorePage } from "@/pages/ResumeScorePage";
import { ProjectSummaryPage } from "@/pages/ProjectSummaryPage";
import { ATSCheckerPage } from "@/pages/ATSCheckerPage";
import { ResumeBuilderPage } from "@/pages/ResumeBuilderPage";
import { AutoImproverPage } from "@/pages/AutoImproverPage";
import { EmployerDashboardPage } from "@/pages/EmployerDashboardPage";
import { AssessmentsPage } from "@/pages/AssessmentsPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { JobTrackerPage } from "@/pages/JobTrackerPage";
import { SalaryInsightsPage } from "@/pages/SalaryInsightsPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { MLTraining } from "@/pages/MLTraining";
import { DBMSAnalyticsPage } from "@/pages/DBMSAnalyticsPage";
import { ProductionAnalyticsPage } from "@/pages/ProductionAnalyticsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Page transition wrapper component
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="career-ai-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Landing Page - No Layout, No Auth Required */}
                <Route path="/" element={<PageTransition><Index /></PageTransition>} />
                
                {/* Topics Page - No Layout, No Auth Required */}
                <Route path="/topics" element={<PageTransition><TopicsPage /></PageTransition>} />
                
                {/* Authentication Page - Optional (No Layout) */}
                <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
                <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
                
                {/* DEMO MODE: All App Pages - With Layout, NO Authentication Required */}
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                  <Route path="/resume" element={<PageTransition><ResumeAnalyzer /></PageTransition>} />
                  <Route path="/analytics" element={<PageTransition><ResumeInsightsPage /></PageTransition>} />
                  <Route path="/roadmap" element={<PageTransition><CareerRoadmap /></PageTransition>} />
                  <Route path="/chatbot" element={<PageTransition><CareerChatbotPage /></PageTransition>} />
                  <Route path="/job-matches" element={<PageTransition><JobRecommendationsPage /></PageTransition>} />
                  <Route path="/networking" element={<PageTransition><NetworkingAssistant /></PageTransition>} />
                  <Route path="/courses" element={<PageTransition><Courses /></PageTransition>} />
                  <Route path="/job-matching" element={<PageTransition><JobMatchingPage /></PageTransition>} />
                  <Route path="/skill-gap" element={<PageTransition><SkillGapPage /></PageTransition>} />
                  <Route path="/score" element={<PageTransition><ResumeScorePage /></PageTransition>} />
                  <Route path="/summary" element={<PageTransition><ProjectSummaryPage /></PageTransition>} />
                  <Route path="/ats" element={<PageTransition><ATSCheckerPage /></PageTransition>} />
                  <Route path="/builder" element={<PageTransition><ResumeBuilderPage /></PageTransition>} />
                  <Route path="/improver" element={<PageTransition><AutoImproverPage /></PageTransition>} />
                  <Route path="/employer" element={<PageTransition><EmployerDashboardPage /></PageTransition>} />
                  <Route path="/assessments" element={<PageTransition><AssessmentsPage /></PageTransition>} />
                  <Route path="/job-tracker" element={<PageTransition><JobTrackerPage /></PageTransition>} />
                  <Route path="/salary-insights" element={<PageTransition><SalaryInsightsPage /></PageTransition>} />
                  <Route path="/advanced-analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
                  <Route path="/ml-training" element={<PageTransition><MLTraining /></PageTransition>} />
                  <Route path="/dbms-analytics" element={<PageTransition><DBMSAnalyticsPage /></PageTransition>} />
                  <Route path="/production-analytics" element={<PageTransition><ProductionAnalyticsPage /></PageTransition>} />
                  <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
                  <Route path="/settings" element={<PageTransition><ProfilePage /></PageTransition>} />
                </Route>
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
