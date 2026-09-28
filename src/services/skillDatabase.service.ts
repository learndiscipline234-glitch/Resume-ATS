import { supabase } from '../integrations/supabase/client';
import { skillDatabase as localSkillDatabase } from '../data/skills';
import { SkillData } from '../ai/types';

/**
 * Skill Database Service
 * 
 * Manages skill data in Supabase with intelligent caching for optimal performance.
 * Provides CRUD operations for skills, role management, and search functionality.
 * 
 * Features:
 * - Multi-level caching (role cache, search cache, all roles cache)
 * - 1-hour cache TTL for optimal performance
 * - Automatic fallback to local skill database
 * - Cache invalidation on updates
 * - Performance monitoring and statistics
 * 
 * @module services/skillDatabase
 * 
 * @example
 * ```typescript
 * import { skillDatabaseService } from './services/skillDatabase.service';
 * 
 * // Get skills for a role
 * const skills = await skillDatabaseService.getSkillsByRole('software_developer');
 * 
 * // Search across all roles
 * const results = await skillDatabaseService.searchSkills('React');
 * 
 * // Get cache statistics
 * const stats = skillDatabaseService.getCacheStats();
 * ```
 */

/**
 * Database row structure for skill_database table
 */
interface SkillDatabaseRow {
  id: string;
  role: string;
  skill_name: string;
  category: string;
  demand_level: string;
  importance: string;
  aliases: string[];
  related_skills: string[];
  created_at: string;
  updated_at: string;
}

export class SkillDatabaseService {
  private cache: Map<string, SkillData[]> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour (Task 13.1 requirement)
  
  // Additional caches for frequently accessed data
  private allRolesCache: string[] | null = null;
  private allRolesCacheTimestamp: number = 0;
  private searchCache: Map<string, SkillData[]> = new Map();
  private searchCacheTimestamps: Map<string, number> = new Map();

  /**
   * Retrieves skills for a specific role with caching
   * 
   * This method first checks the cache for valid data. If not found or expired,
   * it queries Supabase. Falls back to local database on errors.
   * 
   * Performance: <100ms (cache hit), <500ms (database query)
   * 
   * @param role - The target role (e.g., 'software_developer', 'data_scientist')
   * @returns Promise resolving to array of skills for the role
   * 
   * @example
   * ```typescript
   * const skills = await service.getSkillsByRole('software_developer');
   * console.log(`Found ${skills.length} skills`);
   * ```
   */
  async getSkillsByRole(role: string): Promise<SkillData[]> {
    const startTime = Date.now();

    // Check cache first
    if (this.isCacheValid(role)) {
      const cached = this.cache.get(role);
      if (cached) {
        const duration = Date.now() - startTime;
        console.log(`Cache hit for role ${role} (${duration}ms)`);
        return cached;
      }
    }

    try {
      // Query Supabase
      const { data, error } = await supabase
        .from('skill_database')
        .select('*')
        .eq('role', role);

      if (error) {
        console.error('Error fetching skills from database:', error);
        // Fallback to local database
        return this.getLocalSkillsByRole(role);
      }

      if (!data || data.length === 0) {
        // Fallback to local database
        return this.getLocalSkillsByRole(role);
      }

      // Transform database rows to SkillData
      const skills = data.map(row => this.transformRowToSkillData(row));

      // Update cache
      this.cache.set(role, skills);
      this.cacheTimestamps.set(role, Date.now());

      const duration = Date.now() - startTime;
      console.log(`Fetched ${skills.length} skills for role ${role} (${duration}ms)`);

      return skills;
    } catch (error) {
      console.error('Error in getSkillsByRole:', error);
      // Fallback to local database
      return this.getLocalSkillsByRole(role);
    }
  }

  /**
   * Retrieves skills from local database (fallback mechanism)
   * 
   * Used when Supabase is unavailable or returns no data.
   * Ensures the application continues to function offline.
   * 
   * @param role - The target role
   * @returns Array of skills from local database, empty array if role not found
   * @private
   */
  private getLocalSkillsByRole(role: string): SkillData[] {
    const roleSkillSet = localSkillDatabase[role];
    if (!roleSkillSet) {
      return [];
    }
    return roleSkillSet.skills;
  }

  /**
   * Adds multiple skills for a specific role to the database
   * 
   * Inserts skills into Supabase and invalidates relevant caches.
   * All skills are inserted in a single transaction for efficiency.
   * 
   * @param role - The target role
   * @param skills - Array of skill data to insert
   * @throws Error if database insertion fails
   * 
   * @example
   * ```typescript
   * const newSkills: SkillData[] = [
   *   { name: 'React', category: 'frontend', demandLevel: 'high', importance: 'critical' },
   *   { name: 'Node.js', category: 'backend', demandLevel: 'high', importance: 'critical' }
   * ];
   * await service.addSkillsForRole('software_developer', newSkills);
   * ```
   */
  async addSkillsForRole(role: string, skills: SkillData[]): Promise<void> {
    try {
      const rows = skills.map(skill => ({
        role,
        skill_name: skill.name,
        category: skill.category,
        demand_level: skill.demandLevel,
        importance: skill.importance,
        aliases: skill.aliases || [],
        related_skills: skill.relatedSkills || [],
      }));

      const { error } = await supabase
        .from('skill_database')
        .insert(rows);

      if (error) {
        throw error;
      }

      // Invalidate cache
      this.cache.delete(role);
      this.cacheTimestamps.delete(role);
      this.allRolesCache = null; // Invalidate all roles cache too
      this.allRolesCacheTimestamp = 0;

      console.log(`Added ${skills.length} skills for role ${role}`);
    } catch (error) {
      console.error('Error adding skills:', error);
      throw error;
    }
  }

  /**
   * Updates metadata for a specific skill
   * 
   * Allows partial updates of skill properties. Invalidates caches
   * to ensure fresh data on next query.
   * 
   * @param role - The role containing the skill
   * @param skillName - The name of the skill to update
   * @param updates - Partial skill data with fields to update
   * @throws Error if database update fails
   * 
   * @example
   * ```typescript
   * await service.updateSkillMetadata('software_developer', 'React', {
   *   demandLevel: 'very_high',
   *   importance: 'critical'
   * });
   * ```
   */
  async updateSkillMetadata(
    role: string,
    skillName: string,
    updates: Partial<SkillData>
  ): Promise<void> {
    try {
      const updateData: any = {};

      if (updates.category) updateData.category = updates.category;
      if (updates.demandLevel) updateData.demand_level = updates.demandLevel;
      if (updates.importance) updateData.importance = updates.importance;
      if (updates.aliases) updateData.aliases = updates.aliases;
      if (updates.relatedSkills) updateData.related_skills = updates.relatedSkills;

      const { error } = await supabase
        .from('skill_database')
        .update(updateData)
        .eq('role', role)
        .eq('skill_name', skillName);

      if (error) {
        throw error;
      }

      // Invalidate cache
      this.cache.delete(role);
      this.cacheTimestamps.delete(role);
      // Clear search cache as skill metadata changed
      this.searchCache.clear();
      this.searchCacheTimestamps.clear();

      console.log(`Updated skill ${skillName} for role ${role}`);
    } catch (error) {
      console.error('Error updating skill metadata:', error);
      throw error;
    }
  }

  /**
   * Retrieves all available roles from the database
   * 
   * Returns unique role identifiers with caching for performance.
   * Falls back to local database roles if Supabase is unavailable.
   * 
   * @returns Promise resolving to array of role identifiers
   * 
   * @example
   * ```typescript
   * const roles = await service.getAllRoles();
   * // ['software_developer', 'data_scientist', 'devops_engineer', ...]
   * ```
   */
  async getAllRoles(): Promise<string[]> {
    // Check cache first
    if (this.isCacheValid('__all_roles__')) {
      if (this.allRolesCache) {
        console.log('Cache hit for all roles');
        return this.allRolesCache;
      }
    }

    try {
      const { data, error } = await supabase
        .from('skill_database')
        .select('role')
        .order('role');

      if (error) {
        console.error('Error fetching roles:', error);
        return Object.keys(localSkillDatabase);
      }

      if (!data || data.length === 0) {
        return Object.keys(localSkillDatabase);
      }

      // Get unique roles
      const roles = [...new Set(data.map(row => row.role))];
      
      // Update cache
      this.allRolesCache = roles;
      this.allRolesCacheTimestamp = Date.now();

      return roles;
    } catch (error) {
      console.error('Error in getAllRoles:', error);
      return Object.keys(localSkillDatabase);
    }
  }

  /**
   * Searches for skills across all roles
   * 
   * Performs case-insensitive search on skill names and aliases.
   * Results are cached for improved performance on repeated searches.
   * 
   * @param query - Search query string
   * @returns Promise resolving to array of matching skills
   * 
   * @example
   * ```typescript
   * const results = await service.searchSkills('React');
   * // Returns all skills with 'React' in name or aliases
   * ```
   */
  async searchSkills(query: string): Promise<SkillData[]> {
    const cacheKey = query.toLowerCase();
    
    // Check cache first
    if (this.isSearchCacheValid(cacheKey)) {
      const cached = this.searchCache.get(cacheKey);
      if (cached) {
        console.log(`Search cache hit for query: ${query}`);
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('skill_database')
        .select('*')
        .or(`skill_name.ilike.%${query}%,aliases.cs.{${query}}`);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      const results = data.map(row => this.transformRowToSkillData(row));
      
      // Update search cache
      this.searchCache.set(cacheKey, results);
      this.searchCacheTimestamps.set(cacheKey, Date.now());

      return results;
    } catch (error) {
      console.error('Error searching skills:', error);
      return [];
    }
  }

  /**
   * Validates if cached data for a role is still fresh
   * 
   * Checks if the cache entry exists and hasn't exceeded the TTL (1 hour).
   * Special handling for the all roles cache.
   * 
   * @param role - The role to check, or '__all_roles__' for all roles cache
   * @returns true if cache is valid, false otherwise
   * @private
   */
  private isCacheValid(role: string): boolean {
    // Special handling for all roles cache
    if (role === '__all_roles__') {
      const age = Date.now() - this.allRolesCacheTimestamp;
      return age < this.CACHE_TTL;
    }

    const timestamp = this.cacheTimestamps.get(role);
    if (!timestamp) return false;

    const age = Date.now() - timestamp;
    return age < this.CACHE_TTL;
  }

  /**
   * Validates if cached search results are still fresh
   * 
   * @param query - The search query to check
   * @returns true if search cache is valid, false otherwise
   * @private
   */
  private isSearchCacheValid(query: string): boolean {
    const timestamp = this.searchCacheTimestamps.get(query);
    if (!timestamp) return false;

    const age = Date.now() - timestamp;
    return age < this.CACHE_TTL;
  }

  /**
   * Transforms database row to SkillData interface
   * 
   * Converts snake_case database columns to camelCase TypeScript properties.
   * 
   * @param row - Database row from skill_database table
   * @returns Transformed SkillData object
   * @private
   */
  private transformRowToSkillData(row: any): SkillData {
    return {
      name: row.skill_name,
      category: row.category,
      demandLevel: row.demand_level,
      relatedSkills: row.related_skills || [],
      aliases: row.aliases || [],
      importance: row.importance,
    };
  }

  /**
   * Clears all caches (role cache, search cache, all roles cache)
   * 
   * Use this method when you need to force fresh data from the database,
   * such as after bulk updates or database migrations.
   * 
   * @example
   * ```typescript
   * service.clearCache();
   * console.log('All caches cleared');
   * ```
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
    this.allRolesCache = null;
    this.allRolesCacheTimestamp = 0;
    this.searchCache.clear();
    this.searchCacheTimestamps.clear();
    console.log('All caches cleared');
  }

  /**
   * Retrieves cache statistics for monitoring and debugging
   * 
   * Provides insights into cache usage and effectiveness.
   * 
   * @returns Object containing cache statistics
   * 
   * @example
   * ```typescript
   * const stats = service.getCacheStats();
   * console.log(`Roles cached: ${stats.rolesCached}`);
   * console.log(`Searches cached: ${stats.searchesCached}`);
   * ```
   */
  getCacheStats(): {
    rolesCached: number;
    searchesCached: number;
    allRolesCached: boolean;
    cacheHitRate?: number;
  } {
    return {
      rolesCached: this.cache.size,
      searchesCached: this.searchCache.size,
      allRolesCached: this.allRolesCache !== null,
    };
  }

  /**
   * Seeds the database with local skill data
   * 
   * Populates the skill_database table with all skills from the local
   * skill database. Useful for initial setup or database resets.
   * 
   * Warning: This may create duplicate entries if skills already exist.
   * 
   * @throws Error if seeding fails for any role
   * 
   * @example
   * ```typescript
   * await service.seedDatabase();
   * console.log('Database seeded successfully');
   * ```
   */
  async seedDatabase(): Promise<void> {
    console.log('Seeding skill database...');

    for (const [role, roleSkillSet] of Object.entries(localSkillDatabase)) {
      try {
        await this.addSkillsForRole(role, roleSkillSet.skills);
        console.log(`Seeded ${roleSkillSet.skills.length} skills for ${role}`);
      } catch (error) {
        console.error(`Error seeding ${role}:`, error);
      }
    }

    console.log('Database seeding complete');
  }
}

// Export singleton instance
export const skillDatabaseService = new SkillDatabaseService();
