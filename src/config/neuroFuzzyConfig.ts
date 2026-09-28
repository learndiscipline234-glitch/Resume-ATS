/**
 * Configuration for Neuro-Fuzzy Resume Ranking System
 * 
 * This file defines configuration options for the neural network evaluator,
 * fuzzy logic decision engine, and ranking engine.
 */

export interface NeuroFuzzyConfig {
  /** Neural network evaluator configuration */
  neural: {
    /** Enable/disable neural evaluator */
    enabled: boolean;
    /** Path to neural network model */
    modelPath: string;
    /** Timeout for evaluation in milliseconds */
    timeoutMs: number;
    /** Maximum retry attempts on failure */
    maxRetries: number;
  };
  /** Fuzzy logic engine configuration */
  fuzzy: {
    /** Enable/disable fuzzy engine */
    enabled: boolean;
    /** Membership function boundaries */
    membershipFunctions: {
      /** Skill match fuzzy sets */
      skillMatch: {
        low: number[];
        medium: number[];
        high: number[];
      };
      /** Experience fuzzy sets */
      experience: {
        junior: number[];
        mid: number[];
        senior: number[];
      };
    };
  };
  /** Ranking engine configuration */
  ranking: {
    /** Enable/disable ranking engine */
    enabled: boolean;
    /** Weights for final score calculation */
    weights: {
      /** Neural score weight */
      neural: number;
      /** Skill match score weight */
      skillMatch: number;
      /** Resume score weight */
      resumeScore: number;
    };
    /** Number of resumes to process in parallel */
    parallelBatchSize: number;
    /** Maximum number of resumes per batch */
    maxResumes: number;
  };
}

/**
 * Default configuration for neuro-fuzzy system
 */
export const defaultConfig: NeuroFuzzyConfig = {
  neural: {
    enabled: true,
    modelPath: '/models/resume-evaluator',
    timeoutMs: 500,
    maxRetries: 2
  },
  fuzzy: {
    enabled: true,
    membershipFunctions: {
      skillMatch: {
        low: [0, 0, 30, 50],      // Trapezoidal: fully low until 30, transitions to 50
        medium: [30, 50, 70],      // Triangular: peaks at 50
        high: [50, 70, 100, 100]   // Trapezoidal: transitions from 50, fully high at 70
      },
      experience: {
        junior: [0, 0, 1, 3],      // Trapezoidal: fully junior until 1 year, transitions to 3
        mid: [2, 4, 6],            // Triangular: peaks at 4 years
        senior: [5, 7, 20, 20]     // Trapezoidal: transitions from 5, fully senior at 7
      }
    }
  },
  ranking: {
    enabled: true,
    weights: {
      neural: 0.5,
      skillMatch: 0.3,
      resumeScore: 0.2
    },
    parallelBatchSize: 5,
    maxResumes: 50
  }
};

/**
 * Get current neuro-fuzzy configuration
 * Can be extended to load from environment variables or config file
 */
export function getNeuroFuzzyConfig(): NeuroFuzzyConfig {
  // TODO: Load from environment variables or config file if needed
  return defaultConfig;
}

/**
 * Validate configuration values
 * @param config Configuration to validate
 * @returns true if valid, false otherwise
 */
export function validateConfig(config: NeuroFuzzyConfig): boolean {
  // Validate weights sum to 1.0
  const weightsSum = config.ranking.weights.neural + 
                     config.ranking.weights.skillMatch + 
                     config.ranking.weights.resumeScore;
  
  if (Math.abs(weightsSum - 1.0) > 0.01) {
    console.warn(`Invalid weights: sum is ${weightsSum}, expected 1.0`);
    return false;
  }
  
  // Validate parallel batch size
  if (config.ranking.parallelBatchSize < 1 || config.ranking.parallelBatchSize > 10) {
    console.warn(`Invalid parallelBatchSize: ${config.ranking.parallelBatchSize}, expected 1-10`);
    return false;
  }
  
  // Validate max resumes
  if (config.ranking.maxResumes < 1 || config.ranking.maxResumes > 100) {
    console.warn(`Invalid maxResumes: ${config.ranking.maxResumes}, expected 1-100`);
    return false;
  }
  
  return true;
}
