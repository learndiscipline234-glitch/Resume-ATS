import { toast as sonnerToast } from 'sonner';

/**
 * Toast Notification Utilities
 * Provides user-friendly notifications for various operations
 */

export const toast = {
  /**
   * Show success message
   */
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show error message
   */
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 6000,
    });
  },

  /**
   * Show info message
   */
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show warning message
   */
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show loading message with promise
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  /**
   * Show analysis progress toast
   */
  analysisProgress: (step: number, message: string, progress: number) => {
    const stepNames = [
      'Initializing',
      'Parsing Resume',
      'Extracting Skills',
      'Detecting Role',
      'Matching Skills',
      'Calculating Score',
      'Analyzing Sections',
      'Finding Trends',
      'Generating Recommendations',
      'Saving Results'
    ];

    sonnerToast.loading(`${stepNames[step] || 'Processing'}: ${message}`, {
      id: 'analysis-progress',
      description: `${Math.round(progress)}% complete`,
    });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (id?: string) => {
    sonnerToast.dismiss(id);
  },
};
