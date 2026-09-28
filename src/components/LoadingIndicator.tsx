import React from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';

interface LoadingIndicatorProps {
  message?: string;
  progress?: number;
  steps?: string[];
  currentStep?: number;
}

/**
 * Loading Indicator Component
 * Displays loading state with optional progress tracking for multi-step operations
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Processing...',
  progress,
  steps,
  currentStep,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Spinner */}
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      
      {/* Message */}
      <p className="text-lg font-medium text-foreground">{message}</p>
      
      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="w-full max-w-md space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            {Math.round(progress)}% complete
          </p>
        </div>
      )}
      
      {/* Step Indicators */}
      {steps && steps.length > 0 && (
        <div className="w-full max-w-md space-y-2">
          {steps.map((step, index) => {
            const isComplete = currentStep !== undefined && index < currentStep;
            const isCurrent = currentStep === index;
            const isPending = currentStep !== undefined && index > currentStep;
            
            return (
              <div
                key={index}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  isCurrent ? 'bg-primary/10' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? '✓' : index + 1}
                </div>
                <span
                  className={`text-sm ${
                    isComplete
                      ? 'text-green-600 dark:text-green-400'
                      : isCurrent
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
