import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, BarChart3, Target, BookOpen, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import HeroSection from '@/components/HeroSection';

const Index = () => {
  const navigate = useNavigate();

  const handleAnalyzeClick = () => {
    navigate('/resume');
  };

  const handleLoginClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Cinematic Hero Section (fullscreen video + liquid glass) ── */}
      <HeroSection />

      {/* Feature Cards Section */}
      <section className="px-6 py-24 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-foreground mb-4">
              Everything you need to advance your career
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools to analyze, match, and optimize your career path
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="clean-card hover:shadow-soft-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Resume Analyzer</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  ML-powered role prediction with fuzzy skill matching
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="clean-card hover:shadow-soft-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Job Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compare your resume against any job description instantly
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="clean-card hover:shadow-soft-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Skill Gap Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Personalized learning plans with timeline and resources
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="clean-card hover:shadow-soft-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track your progress and placement probability
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-foreground mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your career insights in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Resume</h3>
              <p className="text-muted-foreground">
                Drop a PDF, DOCX, or TXT file — our parser extracts all text instantly
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">ML Analysis</h3>
              <p className="text-muted-foreground">
                TF-IDF vectorization + Naive Bayes classifies your role and scores every skill
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Actionable Plan</h3>
              <p className="text-muted-foreground">
                Get your match %, skill gaps, learning resources, and career roadmap
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="px-6 py-24 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-foreground mb-4">
              Trusted by professionals worldwide
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Resumes Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Career Roles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">87%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-display text-foreground mb-4">
            Ready to take the next step in your career?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of professionals who have advanced their careers with AI-powered insights
          </p>
          <Button size="lg" onClick={handleAnalyzeClick}>
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
