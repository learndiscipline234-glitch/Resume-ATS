import { supabase } from '../integrations/supabase/client';
import { SectionAnalysis } from '../ai/types';

/**
 * Section Analysis Service
 * Manages section analysis results in Supabase
 */

interface SectionAnalysisRow {
  id: string;
  user_id: string;
  resume_analysis_id: string;
  detected_sections: string[];
  missing_sections: string[];
  completeness: number;
  recommendations: any[];
  created_at: string;
}

export class SectionAnalysisService {
  /**
   * Save section analysis
   */
  async saveSectionAnalysis(
    userId: string,
    resumeAnalysisId: string,
    sectionAnalysis: SectionAnalysis
  ): Promise<string> {
    try {
      const analysisData = {
        user_id: userId,
        resume_analysis_id: resumeAnalysisId,
        detected_sections: sectionAnalysis.detectedSections,
        missing_sections: sectionAnalysis.missingSections,
        completeness: sectionAnalysis.completeness,
        recommendations: sectionAnalysis.recommendations,
      };

      const { data, error } = await supabase
        .from('section_analyses')
        .insert(analysisData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`Saved section analysis ${data.id} for user ${userId}`);
      return data.id;
    } catch (error) {
      console.error('Error saving section analysis:', error);
      throw error;
    }
  }

  /**
   * Get section analysis history for user
   */
  async getSectionAnalysisHistory(
    userId: string,
    limit: number = 10
  ): Promise<SectionAnalysisRow[]> {
    try {
      const { data, error } = await supabase
        .from('section_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching section analysis history:', error);
      throw error;
    }
  }

  /**
   * Get section analysis by ID
   */
  async getSectionAnalysisById(analysisId: string): Promise<SectionAnalysisRow | null> {
    try {
      const { data, error } = await supabase
        .from('section_analyses')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching section analysis:', error);
      throw error;
    }
  }

  /**
   * Get section analysis for resume analysis
   */
  async getSectionAnalysisByResumeAnalysis(
    resumeAnalysisId: string
  ): Promise<SectionAnalysisRow | null> {
    try {
      const { data, error } = await supabase
        .from('section_analyses')
        .select('*')
        .eq('resume_analysis_id', resumeAnalysisId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching section analysis by resume analysis:', error);
      throw error;
    }
  }

  /**
   * Get completeness trend for user
   */
  async getCompletenessTrend(
    userId: string,
    limit: number = 10
  ): Promise<{
    dates: string[];
    completeness: number[];
  }> {
    try {
      const { data, error } = await supabase
        .from('section_analyses')
        .select('completeness, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          dates: [],
          completeness: [],
        };
      }

      return {
        dates: data.map(row => new Date(row.created_at).toLocaleDateString()),
        completeness: data.map(row => row.completeness),
      };
    } catch (error) {
      console.error('Error fetching completeness trend:', error);
      throw error;
    }
  }

  /**
   * Delete section analysis
   */
  async deleteSectionAnalysis(analysisId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('section_analyses')
        .delete()
        .eq('id', analysisId);

      if (error) {
        throw error;
      }

      console.log(`Deleted section analysis ${analysisId}`);
    } catch (error) {
      console.error('Error deleting section analysis:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const sectionAnalysisService = new SectionAnalysisService();
