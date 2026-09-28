import { supabase } from '@/integrations/supabase/client';

// Interfaces for model version service
export interface ModelVersion {
  id?: string;
  version_name: string;
  model_type: string;
  model_config: Record<string, any>;
  training_metrics: Record<string, any>;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_score?: number;
  training_loss: number;
  validation_loss: number;
  training_time_ms: number;
  data_size: number;
}

export interface ModelConfig {
  algorithm: string;
  hyperparameters: Record<string, any>;
  feature_columns: string[];
  target_column: string;
  preprocessing_steps: string[];
}

export class ModelVersionService {
  /**
   * Get the currently active model version
   */
  static async getActiveModel(): Promise<ModelVersion | null> {
    try {
      const { data, error } = await supabase
        .from('model_versions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No active model found
          return null;
        }
        console.error('Error fetching active model:', error);
        throw new Error(`Failed to fetch active model: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getActiveModel:', error);
      throw error;
    }
  }

  /**
   * Create a new model version
   */
  static async createModelVersion(modelData: Omit<ModelVersion, 'id' | 'created_at' | 'updated_at'>): Promise<ModelVersion> {
    try {
      const { data, error } = await supabase
        .from('model_versions')
        .insert({
          version_name: modelData.version_name,
          model_type: modelData.model_type,
          model_config: modelData.model_config,
          training_metrics: modelData.training_metrics,
          is_active: modelData.is_active,
          created_by: modelData.created_by
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating model version:', error);
        throw new Error(`Failed to create model version: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createModelVersion:', error);
      throw error;
    }
  }

  /**
   * Activate a specific model version (deactivates all others)
   */
  static async activateModel(versionId: string): Promise<void> {
    try {
      // Start a transaction to ensure atomicity
      const { error: deactivateError } = await supabase
        .from('model_versions')
        .update({ is_active: false })
        .neq('id', versionId);

      if (deactivateError) {
        console.error('Error deactivating other models:', deactivateError);
        throw new Error(`Failed to deactivate other models: ${deactivateError.message}`);
      }

      const { error: activateError } = await supabase
        .from('model_versions')
        .update({ is_active: true })
        .eq('id', versionId);

      if (activateError) {
        console.error('Error activating model:', activateError);
        throw new Error(`Failed to activate model: ${activateError.message}`);
      }
    } catch (error) {
      console.error('Error in activateModel:', error);
      throw error;
    }
  }

  /**
   * Get all model versions with optional filtering
   */
  static async getAllModelVersions(
    modelType?: string,
    limit: number = 50
  ): Promise<ModelVersion[]> {
    try {
      let query = supabase
        .from('model_versions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (modelType) {
        query = query.eq('model_type', modelType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching model versions:', error);
        throw new Error(`Failed to fetch model versions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllModelVersions:', error);
      throw error;
    }
  }

  /**
   * Get model version by ID
   */
  static async getModelVersionById(versionId: string): Promise<ModelVersion | null> {
    try {
      const { data, error } = await supabase
        .from('model_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching model version by ID:', error);
        throw new Error(`Failed to fetch model version: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getModelVersionById:', error);
      throw error;
    }
  }

  /**
   * Update model version metadata
   */
  static async updateModelVersion(
    versionId: string,
    updates: Partial<Pick<ModelVersion, 'version_name' | 'model_config' | 'training_metrics'>>
  ): Promise<ModelVersion> {
    try {
      const { data, error } = await supabase
        .from('model_versions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', versionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating model version:', error);
        throw new Error(`Failed to update model version: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateModelVersion:', error);
      throw error;
    }
  }

  /**
   * Delete a model version (only if not active)
   */
  static async deleteModelVersion(versionId: string): Promise<void> {
    try {
      // First check if the model is active
      const model = await this.getModelVersionById(versionId);
      if (!model) {
        throw new Error('Model version not found');
      }

      if (model.is_active) {
        throw new Error('Cannot delete active model version');
      }

      const { error } = await supabase
        .from('model_versions')
        .delete()
        .eq('id', versionId);

      if (error) {
        console.error('Error deleting model version:', error);
        throw new Error(`Failed to delete model version: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteModelVersion:', error);
      throw error;
    }
  }

  /**
   * Get model performance comparison
   */
  static async getModelPerformanceComparison(
    modelType?: string,
    limit: number = 10
  ): Promise<Array<{
    id: string;
    version_name: string;
    model_type: string;
    is_active: boolean;
    accuracy: number;
    f1_score: number;
    created_at: string;
  }>> {
    try {
      let query = supabase
        .from('model_versions')
        .select('id, version_name, model_type, is_active, training_metrics, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (modelType) {
        query = query.eq('model_type', modelType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching model performance comparison:', error);
        throw new Error(`Failed to fetch model performance: ${error.message}`);
      }

      // Extract performance metrics from training_metrics JSON
      return (data || []).map(model => ({
        id: model.id,
        version_name: model.version_name,
        model_type: model.model_type,
        is_active: model.is_active,
        accuracy: model.training_metrics?.accuracy || 0,
        f1_score: model.training_metrics?.f1_score || 0,
        created_at: model.created_at
      }));
    } catch (error) {
      console.error('Error in getModelPerformanceComparison:', error);
      throw error;
    }
  }

  /**
   * Get the best performing model by metric
   */
  static async getBestModelByMetric(
    metric: 'accuracy' | 'f1_score' | 'precision' | 'recall',
    modelType?: string
  ): Promise<ModelVersion | null> {
    try {
      let query = supabase
        .from('model_versions')
        .select('*');

      if (modelType) {
        query = query.eq('model_type', modelType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching models for best metric:', error);
        throw new Error(`Failed to fetch models: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return null;
      }

      // Find the model with the highest metric value
      const bestModel = data.reduce((best, current) => {
        const currentMetric = current.training_metrics?.[metric] || 0;
        const bestMetric = best.training_metrics?.[metric] || 0;
        return currentMetric > bestMetric ? current : best;
      });

      return bestModel;
    } catch (error) {
      console.error('Error in getBestModelByMetric:', error);
      throw error;
    }
  }

  /**
   * Create a new model version from training results
   */
  static async createModelFromTraining(
    versionName: string,
    modelType: string,
    config: ModelConfig,
    metrics: ModelMetrics,
    createdBy?: string,
    setAsActive: boolean = false
  ): Promise<ModelVersion> {
    try {
      // If setting as active, deactivate other models first
      if (setAsActive) {
        await supabase
          .from('model_versions')
          .update({ is_active: false })
          .eq('model_type', modelType);
      }

      const modelData: Omit<ModelVersion, 'id' | 'created_at' | 'updated_at'> = {
        version_name: versionName,
        model_type: modelType,
        model_config: config,
        training_metrics: metrics,
        is_active: setAsActive,
        created_by: createdBy
      };

      return await this.createModelVersion(modelData);
    } catch (error) {
      console.error('Error in createModelFromTraining:', error);
      throw error;
    }
  }

  /**
   * Get model version statistics
   */
  static async getModelVersionStats(): Promise<{
    totalModels: number;
    activeModels: number;
    modelTypes: Array<{ type: string; count: number }>;
    averageAccuracy: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('model_versions')
        .select('model_type, is_active, training_metrics');

      if (error) {
        console.error('Error fetching model stats:', error);
        throw new Error(`Failed to fetch model stats: ${error.message}`);
      }

      const models = data || [];
      const totalModels = models.length;
      const activeModels = models.filter(m => m.is_active).length;

      // Count by model type
      const typeCount = models.reduce((acc, model) => {
        acc[model.model_type] = (acc[model.model_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const modelTypes = Object.entries(typeCount).map(([type, count]) => ({
        type,
        count
      }));

      // Calculate average accuracy
      const accuracies = models
        .map(m => m.training_metrics?.accuracy)
        .filter(acc => typeof acc === 'number');
      
      const averageAccuracy = accuracies.length > 0 
        ? accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
        : 0;

      return {
        totalModels,
        activeModels,
        modelTypes,
        averageAccuracy
      };
    } catch (error) {
      console.error('Error in getModelVersionStats:', error);
      throw error;
    }
  }
}