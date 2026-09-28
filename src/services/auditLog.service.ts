import { supabase } from '@/integrations/supabase/client';

// Interfaces for audit log service
export interface AuditLog {
  id?: string;
  user_id?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface AuditLogFilter {
  user_id?: string;
  table_name?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'PREDICTION_GENERATED' 
  | 'MODEL_TRAINED' 
  | 'MODEL_ACTIVATED' 
  | 'RESUME_ANALYZED' 
  | 'SKILL_ADDED' 
  | 'PROFILE_UPDATED';

export interface AuditLogSummary {
  totalLogs: number;
  actionCounts: Record<string, number>;
  tableCounts: Record<string, number>;
  recentActivity: AuditLog[];
  topUsers: Array<{ user_id: string; action_count: number }>;
}

export class AuditLogService {
  /**
   * Log an audit event
   */
  static async logAuditEvent(
    action: AuditAction,
    tableName: string,
    recordId?: string,
    userId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog> {
    try {
      const auditData: Omit<AuditLog, 'id' | 'created_at'> = {
        user_id: userId,
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress,
        user_agent: userAgent
      };

      const { data, error } = await supabase
        .from('audit_logs')
        .insert(auditData)
        .select()
        .single();

      if (error) {
        console.error('Error logging audit event:', error);
        throw new Error(`Failed to log audit event: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in logAuditEvent:', error);
      throw error;
    }
  }

  /**
   * Get audit logs by user ID
   */
  static async getAuditLogsByUser(
    userId: string, 
    limit: number = 50,
    offset: number = 0
  ): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching audit logs by user:', error);
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAuditLogsByUser:', error);
      throw error;
    }
  }

  /**
   * Get audit logs by table name
   */
  static async getAuditLogsByTable(
    tableName: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', tableName)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching audit logs by table:', error);
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAuditLogsByTable:', error);
      throw error;
    }
  }

  /**
   * Get audit logs with advanced filtering
   */
  static async getAuditLogs(filter: AuditLogFilter = {}): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }

      if (filter.table_name) {
        query = query.eq('table_name', filter.table_name);
      }

      if (filter.action) {
        query = query.eq('action', filter.action);
      }

      if (filter.start_date) {
        query = query.gte('created_at', filter.start_date);
      }

      if (filter.end_date) {
        query = query.lte('created_at', filter.end_date);
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching filtered audit logs:', error);
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAuditLogs:', error);
      throw error;
    }
  }

  /**
   * Get audit log summary and statistics
   */
  static async getAuditLogSummary(
    startDate?: string,
    endDate?: string
  ): Promise<AuditLogSummary> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs for summary:', error);
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      const logs = data || [];
      const totalLogs = logs.length;

      // Count actions
      const actionCounts = logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count tables
      const tableCounts = logs.reduce((acc, log) => {
        acc[log.table_name] = (acc[log.table_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get recent activity (last 10 logs)
      const recentActivity = logs
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
        .slice(0, 10);

      // Get top users by activity
      const userCounts = logs.reduce((acc, log) => {
        if (log.user_id) {
          acc[log.user_id] = (acc[log.user_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topUsers = Object.entries(userCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([user_id, action_count]) => ({ user_id, action_count: action_count as number }));

      return {
        totalLogs,
        actionCounts,
        tableCounts,
        recentActivity,
        topUsers
      };
    } catch (error) {
      console.error('Error in getAuditLogSummary:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a specific record
   */
  static async getRecordAuditHistory(
    tableName: string,
    recordId: string
  ): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', tableName)
        .eq('record_id', recordId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching record audit history:', error);
        throw new Error(`Failed to fetch record audit history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecordAuditHistory:', error);
      throw error;
    }
  }

  /**
   * Log user authentication events
   */
  static async logAuthEvent(
    action: 'LOGIN' | 'LOGOUT',
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    additionalData?: Record<string, any>
  ): Promise<AuditLog> {
    try {
      return await this.logAuditEvent(
        action,
        'auth_events',
        userId,
        userId,
        undefined,
        additionalData,
        ipAddress,
        userAgent
      );
    } catch (error) {
      console.error('Error in logAuthEvent:', error);
      throw error;
    }
  }

  /**
   * Log prediction generation events
   */
  static async logPredictionEvent(
    userId: string,
    predictionId: string,
    targetRole: string,
    probability: number,
    modelVersion: string
  ): Promise<AuditLog> {
    try {
      return await this.logAuditEvent(
        'PREDICTION_GENERATED',
        'placement_predictions',
        predictionId,
        userId,
        undefined,
        {
          target_role: targetRole,
          predicted_probability: probability,
          model_version: modelVersion
        }
      );
    } catch (error) {
      console.error('Error in logPredictionEvent:', error);
      throw error;
    }
  }

  /**
   * Log model training events
   */
  static async logModelTrainingEvent(
    userId: string,
    modelId: string,
    modelType: string,
    trainingMetrics: Record<string, any>
  ): Promise<AuditLog> {
    try {
      return await this.logAuditEvent(
        'MODEL_TRAINED',
        'model_versions',
        modelId,
        userId,
        undefined,
        {
          model_type: modelType,
          training_metrics: trainingMetrics
        }
      );
    } catch (error) {
      console.error('Error in logModelTrainingEvent:', error);
      throw error;
    }
  }

  /**
   * Log resume analysis events
   */
  static async logResumeAnalysisEvent(
    userId: string,
    analysisId: string,
    targetRole?: string,
    matchScore?: number
  ): Promise<AuditLog> {
    try {
      return await this.logAuditEvent(
        'RESUME_ANALYZED',
        'resume_analyses',
        analysisId,
        userId,
        undefined,
        {
          target_role: targetRole,
          match_score: matchScore
        }
      );
    } catch (error) {
      console.error('Error in logResumeAnalysisEvent:', error);
      throw error;
    }
  }

  /**
   * Get security-related audit logs
   */
  static async getSecurityAuditLogs(
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    try {
      const securityActions = ['LOGIN', 'LOGOUT', 'DELETE', 'MODEL_ACTIVATED'];
      
      let query = supabase
        .from('audit_logs')
        .select('*')
        .in('action', securityActions)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching security audit logs:', error);
        throw new Error(`Failed to fetch security audit logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSecurityAuditLogs:', error);
      throw error;
    }
  }

  /**
   * Clean up old audit logs (for maintenance)
   */
  static async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        console.error('Error cleaning up old audit logs:', error);
        throw new Error(`Failed to cleanup old logs: ${error.message}`);
      }

      return (data || []).length;
    } catch (error) {
      console.error('Error in cleanupOldLogs:', error);
      throw error;
    }
  }

  /**
   * Export audit logs to CSV format
   */
  static async exportAuditLogs(
    filter: AuditLogFilter = {}
  ): Promise<string> {
    try {
      const logs = await this.getAuditLogs(filter);
      
      if (logs.length === 0) {
        return 'No audit logs found for the specified criteria.';
      }

      // CSV headers
      const headers = [
        'ID',
        'User ID',
        'Action',
        'Table Name',
        'Record ID',
        'IP Address',
        'Created At'
      ];

      // Convert logs to CSV rows
      const csvRows = logs.map(log => [
        log.id || '',
        log.user_id || '',
        log.action,
        log.table_name,
        log.record_id || '',
        log.ip_address || '',
        log.created_at || ''
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error in exportAuditLogs:', error);
      throw error;
    }
  }
}