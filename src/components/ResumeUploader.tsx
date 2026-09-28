import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle, CheckCircle2, UploadCloud, ScanText, Cpu, Search } from 'lucide-react';import { useToast } from '@/hooks/use-toast';
import { FileProcessingService } from '@/lib/fileProcessingService';
import { Badge } from '@/components/ui/badge';

interface ResumeUploaderProps {
  onAnalysisComplete: (result: any) => void;
  targetRole?: string;
}

type StageKey = 'uploading' | 'parsing' | 'extracting' | 'analyzing' | 'complete';

interface ProcessingStatus {
  stage: StageKey;
  message: string;
  progress: number;
}

const STEPS: Array<{ key: StageKey; label: string; Icon: React.ElementType }> = [
  { key: 'uploading',  label: 'Uploading',          Icon: UploadCloud },
  { key: 'parsing',   label: 'Parsing Resume',      Icon: ScanText    },
  { key: 'extracting',label: 'Extracting Skills',   Icon: Search      },
  { key: 'analyzing', label: 'Analyzing Role',      Icon: Cpu         },
];

export function ResumeUploader({ onAnalysisComplete, targetRole: propTargetRole }: ResumeUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', // Added DOC support
      'text/plain' // Added for testing
    ];
    
    if (!validTypes.includes(file.type)) {
      return 'Please upload a PDF, DOC, DOCX, or TXT file only';
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return 'File size must be less than 10MB';
    }
    
    return null;
  };

  const processFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setExtractedSkills([]);

    try {
      console.log('Processing file:', file.name, 'Size:', file.size);

      // Update status: Uploading
      setProcessingStatus({ stage: 'uploading', message: 'Uploading file...', progress: 10 });
      await new Promise(resolve => setTimeout(resolve, 200));

      const targetRole = propTargetRole || 'Software Engineer';

      // Progress callback — maps pipeline steps to UI stages
      const onProgress = (_step: number, message: string, progress: number) => {
        const stage: StageKey =
          progress <= 20 ? 'uploading' :
          progress <= 40 ? 'parsing'   :
          progress <= 65 ? 'extracting':
                           'analyzing';
        setProcessingStatus({ stage, message, progress });
      };

      // Run the full pipeline with live progress updates
      const result = await FileProcessingService.processResumeFile(file, targetRole, true, onProgress);

      if (!result.success) {
        throw new Error(result.error || 'Failed to process resume');
      }

      // Show extracted skills
      if (result.comprehensiveAnalysis?.parsedResume?.skills) {
        setExtractedSkills(result.comprehensiveAnalysis.parsedResume.skills.slice(0, 10));
      }

      // Update status: Complete
      setProcessingStatus({
        stage: 'complete',
        message: 'Analysis complete!',
        progress: 100
      });

      console.log('Resume processed successfully');
      
      toast({
        title: "Resume processed successfully!",
        description: `Generated ML prediction with ${result.metadata!.textLength} characters analyzed`,
      });

      onAnalysisComplete(result);
    } catch (err) {
      console.error('Processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process resume. Please try again.';
      setError(errorMessage);
      setProcessingStatus(null);
      
      toast({
        title: "Processing failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      // Clear processing status after a delay
      setTimeout(() => {
        setProcessingStatus(null);
      }, 3000);
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <Card className={`border-dashed border-2 transition-colors ${
      dragActive ? 'border-primary bg-primary/5' : 'border-primary/20'
    } ${isProcessing ? 'opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle className="text-center">Upload Your Resume</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="text-center p-8"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
            id="resume-upload"
            disabled={isProcessing}
          />
          
          <label htmlFor="resume-upload" className="cursor-pointer block">
            <div className="flex flex-col items-center space-y-4">
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Upload className="h-12 w-12 text-primary" />
                </motion.div>
              ) : (
                <Upload className="h-12 w-12 text-primary" />
              )}
              
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {isProcessing ? 'Processing Resume...' : 'Drop your resume here or click to browse'}
                </h3>
                <p className="text-muted-foreground">
                  Supports PDF, DOC, DOCX, and TXT files (max 10MB)
                </p>
              </div>
              
              {!isProcessing && (
                <Button variant="outline" className="mt-4">
                  <FileText className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              )}
            </div>
          </label>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {processingStatus && (
            <AnimatePresence>
              <motion.div
                key="progress-overlay"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
              >
                {/* Step indicators */}
                <div className="flex items-center justify-between mb-5">
                  {STEPS.map((step, i) => {
                    const stageOrder: StageKey[] = ['uploading', 'parsing', 'extracting', 'analyzing'];
                    const currentIdx = stageOrder.indexOf(processingStatus.stage as StageKey);
                    const stepIdx    = stageOrder.indexOf(step.key);
                    const isDone     = processingStatus.stage === 'complete' || stepIdx < currentIdx;
                    const isActive   = stepIdx === currentIdx;

                    return (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center gap-1.5">
                          <motion.div
                            animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                              isDone    ? 'bg-green-500 border-green-500 text-white' :
                              isActive  ? 'bg-primary border-primary text-white' :
                                          'bg-white border-gray-200 text-gray-400'
                            }`}
                          >
                            {isDone
                              ? <CheckCircle2 className="h-5 w-5" />
                              : <step.Icon className="h-4 w-4" />
                            }
                          </motion.div>
                          <span className={`text-xs font-medium text-center leading-tight max-w-[60px] ${
                            isActive ? 'text-primary' : isDone ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>

                        {/* Connector line */}
                        {i < STEPS.length - 1 && (
                          <div className="flex-1 h-0.5 mx-1 mb-5 bg-gray-200 rounded overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded"
                              initial={{ width: '0%' }}
                              animate={{ width: isDone ? '100%' : '0%' }}
                              transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${processingStatus.progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>

                {/* Status text */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={processingStatus.stage}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-center text-blue-700 font-medium mt-3"
                  >
                    {processingStatus.stage === 'complete'
                      ? '✓ Analysis complete!'
                      : processingStatus.message}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          )}

          {extractedSkills.length > 0 && (
            <motion.div
              className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700 mb-2">
                    Extracted Skills Preview:
                  </p>
                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                  >
                    {extractedSkills.map((skill, index) => (
                      <motion.div
                        key={index}
                        variants={{
                          hidden:  { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
                        }}
                      >
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Your resume will be analyzed for:</p>
          <div className="flex justify-center space-x-6 mt-2">
            <span>• Skills extraction</span>
            <span>• Career insights</span>
            <span>• Job matching</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}