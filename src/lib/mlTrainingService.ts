import { supabase } from '@/integrations/supabase/client';
import { SkillAnalysis } from '@/components/SkillAnalyzerCard';

// Types for ML training
export interface TrainingData {
  id: string;
  resume_text: string;
  target_role: string | null;
  experience_years: number | null;
  analysis_result: SkillAnalysis;
  created_at: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  modelConfidence: number;
  trainingLoss: number;
  validationLoss: number;
}

export interface TrainingConfig {
  learningRate: number;
  batchSize: number;
  epochs: number;
  trainTestSplit: number;
  modelType: 'neural_network' | 'random_forest' | 'gradient_boosting';
}

export interface TrainingResult {
  modelId: string;
  metrics: ModelMetrics;
  config: TrainingConfig;
  trainingDataSize: number;
  testDataSize: number;
  trainingTime: number;
  createdAt: string;
}

export class MLTrainingService {
  private static readonly MIN_TRAINING_SAMPLES = 50;
  private static readonly DEFAULT_CONFIG: TrainingConfig = {
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
    trainTestSplit: 0.8,
    modelType: 'neural_network'
  };

  /**
   * Fetch training data from Supabase
   */
  static async fetchTrainingData(): Promise<TrainingData[]> {
    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching training data:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch training data:', error);
      throw error;
    }
  }

  /**
   * Preprocess training data for ML model
   */
  static preprocessData(data: TrainingData[]): {
    features: number[][];
    labels: number[];
    featureNames: string[];
  } {
    if (data.length < this.MIN_TRAINING_SAMPLES) {
      throw new Error(`Insufficient training data. Need at least ${this.MIN_TRAINING_SAMPLES} samples, got ${data.length}`);
    }

    // Extract features from resume text and analysis
    const features: number[][] = [];
    const labels: number[] = [];
    const featureNames: string[] = [];

    // Define feature extraction
    const extractFeatures = (item: TrainingData): number[] => {
      const featureVector: number[] = [];
      
      // Text-based features
      const text = item.resume_text.toLowerCase();
      const wordCount = text.split(/\s+/).length;
      const charCount = text.length;
      const hasEmail = text.includes('@') ? 1 : 0;
      const hasPhone = /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text) ? 1 : 0;
      const hasLinkedIn = text.includes('linkedin') ? 1 : 0;
      const hasGithub = text.includes('github') ? 1 : 0;
      
      // Experience features
      const experienceYears = item.experience_years || 0;
      
      // Skill confidence features
      const analysis = item.analysis_result as SkillAnalysis;
      const avgConfidence = analysis.user_skills.reduce((sum, skill) => sum + skill.confidence, 0) / analysis.user_skills.length;
      const skillCount = analysis.user_skills.length;
      const highConfidenceSkills = analysis.user_skills.filter(skill => skill.confidence > 0.8).length;
      
      // Technical keywords
      const techKeywords = [
        'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker',
        'kubernetes', 'git', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql'
      ];
      
      const techKeywordCount = techKeywords.reduce((count, keyword) => {
        return count + (text.includes(keyword) ? 1 : 0);
      }, 0);

      // Build feature vector
      featureVector.push(
        wordCount / 1000, // Normalize word count
        charCount / 10000, // Normalize char count
        hasEmail,
        hasPhone,
        hasLinkedIn,
        hasGithub,
        experienceYears / 10, // Normalize experience
        avgConfidence,
        skillCount / 20, // Normalize skill count
        highConfidenceSkills / 10, // Normalize high confidence skills
        techKeywordCount / 15 // Normalize tech keywords
      );

      return featureVector;
    };

    // Initialize feature names
    featureNames.push(
      'word_count_norm',
      'char_count_norm', 
      'has_email',
      'has_phone',
      'has_linkedin',
      'has_github',
      'experience_years_norm',
      'avg_confidence',
      'skill_count_norm',
      'high_confidence_skills_norm',
      'tech_keywords_norm'
    );

    // Process each data point
    data.forEach(item => {
      const featureVector = extractFeatures(item);
      features.push(featureVector);
      
      // Use model confidence as label (0-1 scale)
      const analysis = item.analysis_result as SkillAnalysis;
      labels.push(analysis.metadata.model_confidence);
    });

    return { features, labels, featureNames };
  }

  /**
   * Split data into training and testing sets
   */
  static splitData(
    features: number[][], 
    labels: number[], 
    trainRatio: number = 0.8
  ): {
    trainFeatures: number[][];
    trainLabels: number[];
    testFeatures: number[][];
    testLabels: number[];
  } {
    const totalSamples = features.length;
    const trainSize = Math.floor(totalSamples * trainRatio);
    
    // Shuffle indices
    const indices = Array.from({ length: totalSamples }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const trainIndices = indices.slice(0, trainSize);
    const testIndices = indices.slice(trainSize);

    return {
      trainFeatures: trainIndices.map(i => features[i]),
      trainLabels: trainIndices.map(i => labels[i]),
      testFeatures: testIndices.map(i => features[i]),
      testLabels: testIndices.map(i => labels[i])
    };
  }

  /**
   * Train a neural network model using TensorFlow.js
   */
  static async trainNeuralNetwork(
    trainFeatures: number[][],
    trainLabels: number[],
    testFeatures: number[][],
    testLabels: number[],
    config: TrainingConfig
  ): Promise<ModelMetrics> {
    // Dynamic import of TensorFlow.js
    const tf = await import('@tensorflow/tfjs');
    
    const inputShape = trainFeatures[0].length;
    
    // Create model
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [inputShape],
          units: 64,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    });

    // Compile model
    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    // Convert data to tensors
    const trainX = tf.tensor2d(trainFeatures);
    const trainY = tf.tensor2d(trainLabels, [trainLabels.length, 1]);
    const testX = tf.tensor2d(testFeatures);
    const testY = tf.tensor2d(testLabels, [testLabels.length, 1]);

    // Train model
    const history = await model.fit(trainX, trainY, {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationData: [testX, testY],
      verbose: 0
    });

    // Evaluate model
    const testPredictions = model.predict(testX) as tf.Tensor;
    const testPredictionsArray = await testPredictions.data();
    
    // Calculate metrics
    const metrics = this.calculateMetrics(testLabels, Array.from(testPredictionsArray));
    
    // Add training history
    const trainingLoss = history.history.loss[history.history.loss.length - 1] as number;
    const validationLoss = history.history.val_loss[history.history.val_loss.length - 1] as number;
    
    metrics.trainingLoss = trainingLoss;
    metrics.validationLoss = validationLoss;

    // Clean up tensors
    trainX.dispose();
    trainY.dispose();
    testX.dispose();
    testY.dispose();
    testPredictions.dispose();

    return metrics;
  }

  /**
   * Calculate evaluation metrics
   */
  static calculateMetrics(actual: number[], predicted: number[]): ModelMetrics {
    const threshold = 0.5;
    const binaryPredicted = predicted.map(p => p > threshold ? 1 : 0);
    const binaryActual = actual.map(a => a > threshold ? 1 : 0);

    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < actual.length; i++) {
      if (binaryActual[i] === 1 && binaryPredicted[i] === 1) truePositives++;
      else if (binaryActual[i] === 0 && binaryPredicted[i] === 1) falsePositives++;
      else if (binaryActual[i] === 0 && binaryPredicted[i] === 0) trueNegatives++;
      else if (binaryActual[i] === 1 && binaryPredicted[i] === 0) falseNegatives++;
    }

    const accuracy = (truePositives + trueNegatives) / actual.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    // Calculate model confidence as average of predicted probabilities
    const modelConfidence = predicted.reduce((sum, p) => sum + p, 0) / predicted.length;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      modelConfidence,
      trainingLoss: 0, // Will be set by training function
      validationLoss: 0 // Will be set by training function
    };
  }

  /**
   * Hyperparameter tuning
   */
  static async hyperparameterTuning(
    features: number[][],
    labels: number[]
  ): Promise<{ bestConfig: TrainingConfig; bestMetrics: ModelMetrics }> {
    const configs: TrainingConfig[] = [
      { ...this.DEFAULT_CONFIG, learningRate: 0.001, epochs: 50 },
      { ...this.DEFAULT_CONFIG, learningRate: 0.01, epochs: 50 },
      { ...this.DEFAULT_CONFIG, learningRate: 0.0001, epochs: 100 },
      { ...this.DEFAULT_CONFIG, batchSize: 16, epochs: 50 },
      { ...this.DEFAULT_CONFIG, batchSize: 64, epochs: 50 },
    ];

    let bestConfig = this.DEFAULT_CONFIG;
    let bestMetrics: ModelMetrics = {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      modelConfidence: 0,
      trainingLoss: 0,
      validationLoss: 0
    };

    for (const config of configs) {
      try {
        const { trainFeatures, trainLabels, testFeatures, testLabels } = 
          this.splitData(features, labels, config.trainTestSplit);

        const metrics = await this.trainNeuralNetwork(
          trainFeatures,
          trainLabels,
          testFeatures,
          testLabels,
          config
        );

        // Use F1 score as the primary metric
        if (metrics.f1Score > bestMetrics.f1Score) {
          bestMetrics = metrics;
          bestConfig = config;
        }
      } catch (error) {
        console.warn(`Failed to train with config:`, config, error);
      }
    }

    return { bestConfig, bestMetrics };
  }

  /**
   * Save training results to Supabase
   */
  static async saveTrainingResults(
    metrics: ModelMetrics,
    config: TrainingConfig,
    trainingDataSize: number,
    testDataSize: number,
    trainingTime: number
  ): Promise<string> {
    try {
      const trainingResult: Omit<TrainingResult, 'modelId' | 'createdAt'> = {
        metrics,
        config,
        trainingDataSize,
        testDataSize,
        trainingTime
      };

      const { data, error } = await supabase
        .from('training_logs')
        .insert({
          metrics: metrics,
          config: config,
          training_data_size: trainingDataSize,
          test_data_size: testDataSize,
          training_time: trainingTime,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving training results:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Failed to save training results:', error);
      throw error;
    }
  }

  /**
   * Get latest training results
   */
  static async getLatestTrainingResults(): Promise<TrainingResult | null> {
    try {
      const { data, error } = await supabase
        .from('training_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching latest training results:', error);
        return null;
      }

      return data ?? null;
    } catch (error) {
      console.error('Failed to fetch latest training results:', error);
      return null;
    }
  }

  /**
   * Main training pipeline
   */
  static async runTrainingPipeline(config?: Partial<TrainingConfig>): Promise<TrainingResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting ML training pipeline...');
      
      // 1. Fetch training data
      console.log('📊 Fetching training data...');
      const trainingData = await this.fetchTrainingData();
      console.log(`Found ${trainingData.length} training samples`);

      if (trainingData.length < this.MIN_TRAINING_SAMPLES) {
        throw new Error(`Insufficient training data. Need at least ${this.MIN_TRAINING_SAMPLES} samples, got ${trainingData.length}`);
      }

      // 2. Preprocess data
      console.log('🔧 Preprocessing data...');
      const { features, labels } = this.preprocessData(trainingData);
      console.log(`Extracted ${features[0].length} features from ${features.length} samples`);

      // 3. Hyperparameter tuning
      console.log('🎯 Running hyperparameter tuning...');
      const { bestConfig, bestMetrics } = await this.hyperparameterTuning(features, labels);
      console.log('Best config:', bestConfig);
      console.log('Best metrics:', bestMetrics);

      // 4. Final training with best config
      console.log('🏋️ Training final model...');
      const { trainFeatures, trainLabels, testFeatures, testLabels } = 
        this.splitData(features, labels, bestConfig.trainTestSplit);

      const finalMetrics = await this.trainNeuralNetwork(
        trainFeatures,
        trainLabels,
        testFeatures,
        testLabels,
        bestConfig
      );

      // 5. Save results
      const trainingTime = Date.now() - startTime;
      const modelId = await this.saveTrainingResults(
        finalMetrics,
        bestConfig,
        trainFeatures.length,
        testFeatures.length,
        trainingTime
      );

      console.log('✅ Training pipeline completed successfully!');
      console.log(`Model ID: ${modelId}`);
      console.log(`Training time: ${trainingTime}ms`);
      console.log('Final metrics:', finalMetrics);

      return {
        modelId,
        metrics: finalMetrics,
        config: bestConfig,
        trainingDataSize: trainFeatures.length,
        testDataSize: testFeatures.length,
        trainingTime,
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Training pipeline failed:', error);
      throw error;
    }
  }
}
