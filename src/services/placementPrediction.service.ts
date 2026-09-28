import { supabase } from '@/integrations/supabase/client';

// Interfaces for placement prediction service
export interface PlacementPrediction {
  id?: string;
  user_id: string;
  target_role: string;
  predicted_probability: number;
  confidence_score: number;
  model_version: string;
  input_features: Record<string, any>;
  prediction_metadata: Record<string, any>;
  created_at?: string;
}

export interface PredictionHistory {
  id?: string;
  user_id: string;
  prediction_id: string;
  target_role: string;
  predicted_probability: number;
  actual_outcome?: boolean;
  feedback_score?: number;
  created_at?: string;
}

export interface PlacementPredictionRequest {
  user_id: string;
  target_role: string;
  resume_text: string;
  experience_years: number;
  skills: string[];
  education_level: string;
  certifications?: string[];
}

export class PlacementPredictionService {
  /**
   * Save a new placement prediction to the database
   */
  static async savePlacementPrediction(prediction: Omit<PlacementPrediction, 'id' | 'created_at'>): Promise<PlacementPrediction> {
    try {
      const { data, error } = await supabase
        .from('placement_predictions')
        .insert({
          user_id: prediction.user_id,
          target_role: prediction.target_role,
          predicted_probability: prediction.predicted_probability,
          confidence_score: prediction.confidence_score,
          model_version: prediction.model_version,
          input_features: prediction.input_features,
          prediction_metadata: prediction.prediction_metadata
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving placement prediction:', error);
        throw new Error(`Failed to save placement prediction: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in savePlacementPrediction:', error);
      throw error;
    }
  }

  /**
   * Get the latest prediction for a specific user
   */
  static async getLatestPrediction(userId: string): Promise<PlacementPrediction | null> {
    try {
      const { data, error } = await supabase
        .from('placement_predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching latest prediction:', error);
        throw new Error(`Failed to fetch latest prediction: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getLatestPrediction:', error);
      throw error;
    }
  }

  /**
   * Get prediction history for a specific user
   */
  static async getPredictionHistory(userId: string, limit: number = 10): Promise<PlacementPrediction[]> {
    try {
      const { data, error } = await supabase
        .from('placement_predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching prediction history:', error);
        throw new Error(`Failed to fetch prediction history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPredictionHistory:', error);
      throw error;
    }
  }

  /**
   * Get predictions by target role
   */
  static async getPredictionsByRole(role: string, limit: number = 50): Promise<PlacementPrediction[]> {
    try {
      const { data, error } = await supabase
        .from('placement_predictions')
        .select('*')
        .eq('target_role', role)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching predictions by role:', error);
        throw new Error(`Failed to fetch predictions by role: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPredictionsByRole:', error);
      throw error;
    }
  }

  /**
   * Save prediction to history table
   */
  static async savePredictionHistory(historyEntry: Omit<PredictionHistory, 'id' | 'created_at'>): Promise<PredictionHistory> {
    try {
      const { data, error } = await supabase
        .from('prediction_history')
        .insert({
          user_id: historyEntry.user_id,
          prediction_id: historyEntry.prediction_id,
          target_role: historyEntry.target_role,
          predicted_probability: historyEntry.predicted_probability,
          actual_outcome: historyEntry.actual_outcome,
          feedback_score: historyEntry.feedback_score
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving prediction history:', error);
        throw new Error(`Failed to save prediction history: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in savePredictionHistory:', error);
      throw error;
    }
  }

  /**
   * Update prediction with actual outcome for model improvement
   */
  static async updatePredictionOutcome(
    predictionId: string, 
    actualOutcome: boolean, 
    feedbackScore?: number
  ): Promise<void> {
    try {
      // Update the original prediction
      const { error: updateError } = await supabase
        .from('placement_predictions')
        .update({
          prediction_metadata: {
            actual_outcome: actualOutcome,
            feedback_score: feedbackScore,
            updated_at: new Date().toISOString()
          }
        })
        .eq('id', predictionId);

      if (updateError) {
        console.error('Error updating prediction outcome:', updateError);
        throw new Error(`Failed to update prediction outcome: ${updateError.message}`);
      }

      // Also save to history table
      const prediction = await this.getPredictionById(predictionId);
      if (prediction) {
        await this.savePredictionHistory({
          user_id: prediction.user_id,
          prediction_id: predictionId,
          target_role: prediction.target_role,
          predicted_probability: prediction.predicted_probability,
          actual_outcome: actualOutcome,
          feedback_score: feedbackScore
        });
      }
    } catch (error) {
      console.error('Error in updatePredictionOutcome:', error);
      throw error;
    }
  }

  /**
   * Get prediction by ID
   */
  static async getPredictionById(predictionId: string): Promise<PlacementPrediction | null> {
    try {
      const { data, error } = await supabase
        .from('placement_predictions')
        .select('*')
        .eq('id', predictionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching prediction by ID:', error);
        throw new Error(`Failed to fetch prediction: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getPredictionById:', error);
      throw error;
    }
  }

  /**
   * Get predictions with high confidence for a role
   */
  static async getHighConfidencePredictions(
    role: string, 
    minConfidence: number = 0.8,
    limit: number = 20
  ): Promise<PlacementPrediction[]> {
    try {
      const { data, error } = await supabase
        .from('placement_predictions')
        .select('*')
        .eq('target_role', role)
        .gte('confidence_score', minConfidence)
        .order('confidence_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching high confidence predictions:', error);
        throw new Error(`Failed to fetch high confidence predictions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getHighConfidencePredictions:', error);
      throw error;
    }
  }

  /**
   * Get prediction statistics for a user
   */
  static async getUserPredictionStats(userId: string): Promise<{
    totalPredictions: number;
    averageConfidence: number;
    averageProbability: number;
    topRole: string | null;
  }> {
    try {
      const predictions = await this.getPredictionHistory(userId, 100);
      
      if (predictions.length === 0) {
        return {
          totalPredictions: 0,
          averageConfidence: 0,
          averageProbability: 0,
          topRole: null
        };
      }

      const totalPredictions = predictions.length;
      const averageConfidence = predictions.reduce((sum, p) => sum + p.confidence_score, 0) / totalPredictions;
      const averageProbability = predictions.reduce((sum, p) => sum + p.predicted_probability, 0) / totalPredictions;
      
      // Find most predicted role
      const roleCounts = predictions.reduce((acc, p) => {
        acc[p.target_role] = (acc[p.target_role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topRole = Object.entries(roleCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

      return {
        totalPredictions,
        averageConfidence,
        averageProbability,
        topRole
      };
    } catch (error) {
      console.error('Error in getUserPredictionStats:', error);
      throw error;
    }
  }
}