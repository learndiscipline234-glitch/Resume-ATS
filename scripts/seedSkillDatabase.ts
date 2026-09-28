/**
 * Skill Database Seeding Script
 * Populates the skill_database table in Supabase with comprehensive skill data for all roles
 * 
 * Usage:
 *   npm run seed:skills
 * 
 * Or with ts-node:
 *   npx ts-node scripts/seedSkillDatabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import { skillDatabase } from '../src/data/skills';
import { SkillData } from '../src/ai/types';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SeedStats {
  totalRoles: number;
  totalSkills: number;
  successfulInserts: number;
  failedInserts: number;
  skippedDuplicates: number;
}

/**
 * Transform skill data to database format
 */
function transformSkillForDatabase(skill: SkillData, role: string) {
  return {
    role,
    skill_name: skill.name,
    category: skill.category,
    demand_level: skill.demandLevel,
    importance: skill.importance,
    aliases: skill.aliases,
    related_skills: skill.relatedSkills,
  };
}

/**
 * Seed skills for a single role
 */
async function seedRoleSkills(role: string, stats: SeedStats): Promise<void> {
  const roleSkillSet = skillDatabase[role];
  
  if (!roleSkillSet) {
    console.error(`❌ Role not found: ${role}`);
    return;
  }

  console.log(`\n📦 Seeding ${roleSkillSet.displayName} (${roleSkillSet.skills.length} skills)...`);

  for (const skill of roleSkillSet.skills) {
    const dbSkill = transformSkillForDatabase(skill, role);

    try {
      // Try to insert the skill
      const { error } = await supabase
        .from('skill_database')
        .insert(dbSkill);

      if (error) {
        // Check if it's a duplicate key error
        if (error.code === '23505') {
          stats.skippedDuplicates++;
          console.log(`  ⏭️  Skipped duplicate: ${skill.name}`);
        } else {
          stats.failedInserts++;
          console.error(`  ❌ Failed to insert ${skill.name}:`, error.message);
        }
      } else {
        stats.successfulInserts++;
        console.log(`  ✅ Inserted: ${skill.name}`);
      }
    } catch (err) {
      stats.failedInserts++;
      console.error(`  ❌ Error inserting ${skill.name}:`, err);
    }
  }
}

/**
 * Clear existing skill data (optional - use with caution)
 */
async function clearSkillDatabase(): Promise<boolean> {
  console.log('\n🗑️  Clearing existing skill database...');
  
  try {
    const { error } = await supabase
      .from('skill_database')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
      console.error('❌ Failed to clear database:', error.message);
      return false;
    }

    console.log('✅ Database cleared successfully');
    return true;
  } catch (err) {
    console.error('❌ Error clearing database:', err);
    return false;
  }
}

/**
 * Main seeding function
 */
async function seedSkillDatabase(clearFirst: boolean = false): Promise<void> {
  console.log('🌱 Starting Skill Database Seeding...');
  console.log(`📊 Total roles to seed: ${Object.keys(skillDatabase).length}`);

  const stats: SeedStats = {
    totalRoles: Object.keys(skillDatabase).length,
    totalSkills: 0,
    successfulInserts: 0,
    failedInserts: 0,
    skippedDuplicates: 0,
  };

  // Calculate total skills
  for (const role in skillDatabase) {
    stats.totalSkills += skillDatabase[role].skills.length;
  }

  console.log(`📊 Total skills to seed: ${stats.totalSkills}`);

  // Clear database if requested
  if (clearFirst) {
    const cleared = await clearSkillDatabase();
    if (!cleared) {
      console.error('❌ Failed to clear database. Aborting seed operation.');
      process.exit(1);
    }
  }

  // Seed each role
  for (const role in skillDatabase) {
    await seedRoleSkills(role, stats);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Roles:          ${stats.totalRoles}`);
  console.log(`Total Skills:         ${stats.totalSkills}`);
  console.log(`✅ Successful:        ${stats.successfulInserts}`);
  console.log(`⏭️  Skipped (Dupes):  ${stats.skippedDuplicates}`);
  console.log(`❌ Failed:            ${stats.failedInserts}`);
  console.log('='.repeat(60));

  if (stats.failedInserts > 0) {
    console.log('\n⚠️  Some skills failed to insert. Check the logs above for details.');
    process.exit(1);
  } else if (stats.successfulInserts === 0 && stats.skippedDuplicates > 0) {
    console.log('\n✅ All skills already exist in the database.');
  } else {
    console.log('\n✅ Skill database seeding completed successfully!');
  }
}

/**
 * Verify seeded data
 */
async function verifySeededData(): Promise<void> {
  console.log('\n🔍 Verifying seeded data...');

  for (const role in skillDatabase) {
    const { data, error } = await supabase
      .from('skill_database')
      .select('skill_name')
      .eq('role', role);

    if (error) {
      console.error(`❌ Error verifying ${role}:`, error.message);
    } else {
      const expectedCount = skillDatabase[role].skills.length;
      const actualCount = data?.length || 0;
      
      if (actualCount === expectedCount) {
        console.log(`  ✅ ${skillDatabase[role].displayName}: ${actualCount}/${expectedCount} skills`);
      } else {
        console.log(`  ⚠️  ${skillDatabase[role].displayName}: ${actualCount}/${expectedCount} skills (mismatch!)`);
      }
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const clearFirst = args.includes('--clear') || args.includes('-c');
const verifyOnly = args.includes('--verify') || args.includes('-v');

// Run the script
(async () => {
  try {
    if (verifyOnly) {
      await verifySeededData();
    } else {
      await seedSkillDatabase(clearFirst);
      await verifySeededData();
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
})();
