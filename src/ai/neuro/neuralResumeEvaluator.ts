/**
 * Neural Network Resume Evaluator
 * 
 * Uses TensorFlow.js to evaluate resume quality using a feedforward neural network.
 * Architecture: Input(6) → Dense(16, relu) → Dense(8, relu) → Dense(1, sigmoid) → Scale to [0,100]
 * 
 * Input features:
 * - skillMatchScore (0-100)
 * - experienceYears (0-20+)
 * - projectsCount (0-20+)
 * - educationScore (0-100)
 * - keywordDensity (0-1)
 * - sectionCompleteness (0-1)
 */

import type { NeuralInputFeatures, NeuralEvaluationResult } from '../types';
import { getNeuroFuzzyConfig } from '../../config/neuroFuzzyConfig';

// TensorFlow.js instance (lazy loaded)
let tfInstance: any = null;
let modelInstance: any = null;
let loadingPromise: Promise<void> | null = null;
let isModelAvailable = false;

/**
 * Ensures TensorFlow.js is loaded
 * Uses lazy loading to avoid impacting initial page load
 */
async function ensureTensorFlowLoaded(): Promise<void> {
  if (tfInstance) return;
  
  if (loadingPromise) {
    await loadingPromise;
    return;
  }
  
  loadingPromise = (async () => {
    try {
      // Dynamically import TensorFlow.js
      tfInstance = await import('@tensorflow/tfjs');
      console.log('TensorFlow.js loaded successfully');
      isModelAvailable = true;
    } catch (error) {
      console.error('Failed to load TensorFlow.js:', error);
      isModelAvailable = false;
      throw error;
    }
  })();
  
  await loadingPromise;
}

/**
 * Loads the neural network model
 * Model is cached after first load for performance
 */
async function getModel(): Promise<any> {
  if (modelInstance) return modelInstance;
  
  await ensureTensorFlowLoaded();
  
  const config = getNeuroFuzzyConfig();
  
  try {
    // For now, create a simple model
    // In production, this would load a pre-trained model from config.neural.modelPath
    modelInstance = await createModel();
    console.log('Neural network model loaded');
    return modelInstance;
  } catch (error) {
    console.error('Failed to load model:', error);
    isModelAvailable = false;
    throw error;
  }
}

/**
 * Creates a simple feedforward neural network model
 * Architecture: Input(6) → Dense(16, relu) → Dense(8, relu) → Dense(1, sigmoid)
 */
async function createModel(): Promise<any> {
  if (!tfInstance) {
    throw new Error('TensorFlow.js not loaded');
  }
  
  const model = tfInstance.sequential();
  
  // Input layer (6 features)
  model.add(tfInstance.layers.dense({
    inputShape: [6],
    units: 16,
    activation: 'relu',
    name: 'hidden1'
  }));
  
  // Second hidden layer
  model.add(tfInstance.layers.dense({
    units: 8,
    activation: 'relu',
    name: 'hidden2'
  }));
  
  // Output layer (sigmoid for 0-1 output)
  model.add(tfInstance.layers.dense({
    units: 1,
    activation: 'sigmoid',
    name: 'output'
  }));
  
  // Compile model
  model.compile({
    optimizer: 'adam',
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });
  
  // Initialize with random weights (in production, load pre-trained weights)
  return model;
}

/**
 * Normalizes input features to [0,1] range
 * @param features Raw input features
 * @returns Normalized features
 */
function normalizeFeatures(features: NeuralInputFeatures): number[] {
  return [
    features.skillMatchScore / 100,                          // 0-100 → 0-1
    Math.min(features.experienceYears, 20) / 20,            // 0-20+ → 0-1
    Math.min(features.projectsCount, 20) / 20,              // 0-20+ → 0-1
    features.educationScore / 100,                           // 0-100 → 0-1
    features.keywordDensity,                                 // already 0-1
    features.sectionCompleteness                             // already 0-1
  ];
}

/**
 * Validates input features
 * @param features Features to validate
 * @returns true if valid, false otherwise
 */
function validateFeatures(features: NeuralInputFeatures): boolean {
  return (
    isFinite(features.skillMatchScore) && 
    features.skillMatchScore >= 0 && 
    features.skillMatchScore <= 100 &&
    isFinite(features.experienceYears) && 
    features.experienceYears >= 0 &&
    isFinite(features.projectsCount) && 
    features.projectsCount >= 0 &&
    isFinite(features.educationScore) && 
    features.educationScore >= 0 && 
    features.educationScore <= 100 &&
    isFinite(features.keywordDensity) && 
    features.keywordDensity >= 0 && 
    features.keywordDensity <= 1 &&
    isFinite(features.sectionCompleteness) && 
    features.sectionCompleteness >= 0 && 
    features.sectionCompleteness <= 1
  );
}

/**
 * Applies default values for missing or invalid features
 * @param features Input features
 * @returns Features with defaults applied
 */
function applyDefaults(features: Partial<NeuralInputFeatures>): NeuralInputFeatures {
  return {
    skillMatchScore: features.skillMatchScore ?? 0,
    experienceYears: features.experienceYears ?? 0,
    projectsCount: features.projectsCount ?? 0,
    educationScore: features.educationScore ?? 0,
    keywordDensity: features.keywordDensity ?? 0,
    sectionCompleteness: features.sectionCompleteness ?? 0
  };
}

/**
 * Evaluates resume quality using neural network
 * @param features Input features from resume analysis
 * @returns Neural evaluation result with score 0-100
 */
export async function evaluateResume(
  features: NeuralInputFeatures
): Promise<NeuralEvaluationResult> {
  const startTime = performance.now();
  
  // Check if neural evaluator is enabled
  const config = getNeuroFuzzyConfig();
  if (!config.neural.enabled) {
    return {
      success: false,
      neuralScore: null,
      error: 'Neural evaluator is disabled',
      processingTimeMs: performance.now() - startTime
    };
  }
  
  // Validate features
  if (!validateFeatures(features)) {
    console.warn('Invalid features provided, applying defaults');
    features = applyDefaults(features);
  }
  
  try {
    // Ensure TensorFlow.js and model are loaded
    const model = await getModel();
    
    // Normalize features
    const normalizedFeatures = normalizeFeatures(features);
    
    // Perform inference using tf.tidy to clean up tensors
    const neuralScore = await tfInstance.tidy(() => {
      // Create input tensor
      const inputTensor = tfInstance.tensor2d([normalizedFeatures], [1, 6]);
      
      // Run prediction
      const outputTensor = model.predict(inputTensor) as any;
      
      // Get scalar value
      const outputValue = outputTensor.dataSync()[0];
      
      // Scale from [0,1] to [0,100]
      return outputValue * 100;
    });
    
    const processingTimeMs = performance.now() - startTime;
    
    return {
      success: true,
      neuralScore: Math.round(neuralScore * 10) / 10, // Round to 1 decimal
      processingTimeMs
    };
    
  } catch (error) {
    console.error('Neural evaluation failed:', error);
    
    return {
      success: false,
      neuralScore: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: performance.now() - startTime
    };
  }
}

/**
 * Initializes the neural network model
 * Can be called explicitly to pre-load the model
 * @returns Promise that resolves when model is ready
 */
export async function initializeModel(): Promise<void> {
  try {
    await getModel();
  } catch (error) {
    console.error('Model initialization failed:', error);
    throw error;
  }
}

/**
 * Checks if the neural evaluator is available
 * @returns true if TensorFlow.js loaded successfully
 */
export function isAvailable(): boolean {
  return isModelAvailable && tfInstance !== null;
}

/**
 * Disposes of the model and frees memory
 * Useful for cleanup or model updates
 */
export function disposeModel(): void {
  if (modelInstance) {
    modelInstance.dispose();
    modelInstance = null;
    console.log('Neural network model disposed');
  }
}
