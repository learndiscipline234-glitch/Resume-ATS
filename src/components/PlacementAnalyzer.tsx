import React, { useState } from 'react';
import { ResumeUploader } from './ResumeUploader';
import { AnalysisResults } from './AnalysisResults';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Database, FileText, TrendingUp, Target, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function PlacementAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisComplete = async (result: any) => {
    setIsLoading(true);
    
    try {
      // Display results (database storage is optional in demo mode)
      setAnalysisResult(result);
      
      // Log database integration status if available
      if (result.metadata?.analysisId || result.metadata?.predictionId) {
        console.log('✅ Analysis saved to database');
      } else {
        console.log('ℹ️ Demo mode: Results displayed without database storage');
      }
    } catch (error) {
      console.error('Analysis processing failed:', error);
      // Error handling is done in the ResumeUploader component
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setAnalysisResult(null);
  };

  // Extract comprehensive analysis data if available
  const comprehensiveAnalysis = analysisResult?.comprehensiveAnalysis;
  const resumeScore = comprehensiveAnalysis?.resumeScore;
  const skillMatch = comprehensiveAnalysis?.skillMatch;
  const sectionAnalysis = comprehensiveAnalysis?.sectionAnalysis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-light">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Smart Placement Predictor</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            AI-powered resume analysis with instant feedback — no login required
          </p>
          
          {/* Feature badges */}
          <div className="flex justify-center flex-wrap gap-3 mb-8">
            <Badge variant="secondary" className="px-3 py-1">
              <FileText className="w-4 h-4 mr-2" />
              PDF/DOC/DOCX Support
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Brain className="w-4 h-4 mr-2" />
              AI Analysis
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <TrendingUp className="w-4 h-4 mr-2" />
              ML Prediction
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Target className="w-4 h-4 mr-2" />
              Skill Matching
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Award className="w-4 h-4 mr-2" />
              Resume Scoring
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        {!analysisResult ? (
          <div className="max-w-2xl mx-auto">
            <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
            
            {/* How it works */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <h4 className="font-medium mb-1">Upload Resume</h4>
                    <p className="text-muted-foreground">Upload your PDF or DOCX resume file</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <h4 className="font-medium mb-1">AI Analysis</h4>
                    <p className="text-muted-foreground">Get instant AI-powered insights</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <h4 className="font-medium mb-1">Get Insights</h4>
                    <p className="text-muted-foreground">View predictions and recommendations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resume Intelligence Summary Cards */}
            {comprehensiveAnalysis && (
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Resume Score Card */}
                {resumeScore && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Award className="w-4 h-4 mr-2 text-primary" />
                        Resume Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">
                        {resumeScore.totalScore}/100
                      </div>
                      <Badge 
                        variant={
                          resumeScore.qualityFlag === 'excellent' ? 'default' :
                          resumeScore.qualityFlag === 'competitive' ? 'secondary' :
                          'outline'
                        }
                      >
                        {resumeScore.qualityFlag}
                      </Badge>
                      <Progress value={resumeScore.totalScore} className="mt-3" />
                    </CardContent>
                  </Card>
                )}

                {/* Skill Match Card */}
                {skillMatch && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Target className="w-4 h-4 mr-2 text-primary" />
                        Skill Match
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">
                        {Math.round(skillMatch.matchScore)}%
                      </div>
                      <Badge variant="secondary">
                        {skillMatch.matchQuality}
                      </Badge>
                      <div className="mt-3 text-sm text-muted-foreground">
                        {skillMatch.matchedSkills.length} matched • {skillMatch.missingSkills.length} missing
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Section Completeness Card */}
                {sectionAnalysis && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-primary" />
                        Completeness
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">
                        {sectionAnalysis.completeness}%
                      </div>
                      <Badge variant="secondary">
                        {sectionAnalysis.detectedSections.length} sections
                      </Badge>
                      <Progress value={sectionAnalysis.completeness} className="mt-3" />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Original Analysis Results */}
            <AnalysisResults 
              result={analysisResult} 
              onStartOver={handleStartOver}
            />
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Analyzing your resume with AI...</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}