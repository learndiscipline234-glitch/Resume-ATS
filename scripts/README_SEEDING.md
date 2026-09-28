# Skill Database Seeding Guide

This guide explains how to populate the `skill_database` table in Supabase with comprehensive skill data for all roles.

## Overview

The skill database contains 300+ skills across 5 roles:
- **Software Developer** (60+ skills)
- **AI/ML Engineer** (19+ skills)
- **Data Scientist** (65+ skills)
- **DevOps Engineer** (75+ skills)
- **Product Manager** (80+ skills)

## Prerequisites

1. **Supabase Project**: Ensure you have a Supabase project set up
2. **Environment Variables**: Set up your `.env` file with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_role_key  # Optional, for service role access
   ```
3. **Migration**: Run migration `004_create_skill_database_table.sql` first
4. **Dependencies**: Install tsx if not already installed:
   ```bash
   npm install -D tsx
   ```

## Seeding Methods

### Method 1: TypeScript Seeding Script (Recommended)

This method uses the TypeScript seeding script to populate all skills from the local skill database files.

#### Basic Seeding
```bash
npm run seed:skills
```

This will:
- Read skill data from `src/data/skills/` directory
- Insert all skills into the `skill_database` table
- Skip duplicates automatically
- Show progress for each role
- Display a summary at the end

#### Clear and Re-seed
```bash
npm run seed:skills:clear
```

⚠️ **Warning**: This will delete all existing skills before seeding. Use with caution!

#### Verify Seeded Data
```bash
npm run seed:skills:verify
```

This will check the database and compare counts with expected values.

### Method 2: SQL Migration (Partial)

Run the SQL migration file in Supabase SQL Editor:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/010_seed_skill_database.sql
```

**Note**: The SQL migration only includes Software Developer skills due to size limits. Use Method 1 for complete seeding.

## Seeding Script Options

The TypeScript seeding script supports command-line arguments:

```bash
# Seed with default behavior (skip duplicates)
npx tsx scripts/seedSkillDatabase.ts

# Clear database before seeding
npx tsx scripts/seedSkillDatabase.ts --clear
npx tsx scripts/seedSkillDatabase.ts -c

# Verify seeded data only (no seeding)
npx tsx scripts/seedSkillDatabase.ts --verify
npx tsx scripts/seedSkillDatabase.ts -v
```

## Expected Output

### Successful Seeding
```
🌱 Starting Skill Database Seeding...
📊 Total roles to seed: 5
📊 Total skills to seed: 300

📦 Seeding Software Developer (60 skills)...
  ✅ Inserted: JavaScript
  ✅ Inserted: TypeScript
  ...

📦 Seeding AI/ML Engineer (19 skills)...
  ✅ Inserted: Python
  ✅ Inserted: Machine Learning
  ...

============================================================
📊 SEEDING SUMMARY
============================================================
Total Roles:          5
Total Skills:         300
✅ Successful:        300
⏭️  Skipped (Dupes):  0
❌ Failed:            0
============================================================

🔍 Verifying seeded data...
  ✅ Software Developer: 60/60 skills
  ✅ AI/ML Engineer: 19/19 skills
  ✅ Data Scientist: 65/65 skills
  ✅ DevOps Engineer: 75/75 skills
  ✅ Product Manager: 80/80 skills

✅ Skill database seeding completed successfully!
```

### Re-running (Duplicates Skipped)
```
📦 Seeding Software Developer (60 skills)...
  ⏭️  Skipped duplicate: JavaScript
  ⏭️  Skipped duplicate: TypeScript
  ...

============================================================
📊 SEEDING SUMMARY
============================================================
Total Roles:          5
Total Skills:         300
✅ Successful:        0
⏭️  Skipped (Dupes):  300
❌ Failed:            0
============================================================

✅ All skills already exist in the database.
```

## Troubleshooting

### Error: Missing Supabase configuration
```
❌ Error: Missing Supabase configuration
Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables
```

**Solution**: Check your `.env` file and ensure both variables are set correctly.

### Error: Permission denied
```
❌ Failed to insert JavaScript: permission denied for table skill_database
```

**Solution**: 
1. Use `SUPABASE_SERVICE_KEY` instead of `VITE_SUPABASE_ANON_KEY`
2. Or update RLS policies to allow inserts for authenticated users

### Error: Table does not exist
```
❌ Failed to insert JavaScript: relation "skill_database" does not exist
```

**Solution**: Run migration `004_create_skill_database_table.sql` first.

### Partial Failures
If some skills fail to insert, check the error messages in the output. Common issues:
- Invalid data format
- Constraint violations
- Network issues

## Verifying Seeded Data

### Using the Script
```bash
npm run seed:skills:verify
```

### Using Supabase SQL Editor
```sql
-- Count skills by role
SELECT role, COUNT(*) as skill_count
FROM skill_database
GROUP BY role
ORDER BY role;

-- Expected results:
-- software_developer: 60
-- aiml_engineer: 19
-- data_scientist: 65
-- devops_engineer: 75
-- product_manager: 80

-- View sample skills
SELECT role, skill_name, category, demand_level, importance
FROM skill_database
LIMIT 10;
```

## Adding New Skills

To add new skills to the database:

1. **Update skill data files** in `src/data/skills/`:
   - `softwareDeveloper.ts`
   - `aimlEngineer.ts`
   - `dataScientist.ts`
   - `devopsEngineer.ts`
   - `productManager.ts`

2. **Run the seeding script**:
   ```bash
   npm run seed:skills
   ```

3. **Verify the new skills**:
   ```bash
   npm run seed:skills:verify
   ```

## Skill Data Structure

Each skill in the database has the following fields:

```typescript
{
  role: string;              // e.g., 'software_developer'
  skill_name: string;        // e.g., 'JavaScript'
  category: string;          // e.g., 'languages', 'frameworks', 'tools'
  demand_level: string;      // 'high', 'medium', 'low'
  importance: string;        // 'critical', 'important', 'nice-to-have'
  aliases: string[];         // e.g., ['JS', 'ECMAScript']
  related_skills: string[];  // e.g., ['TypeScript', 'Node.js']
}
```

## Best Practices

1. **Always verify** after seeding to ensure data integrity
2. **Use --clear flag** only when you need to completely reset the database
3. **Keep skill data files** in sync with database schema
4. **Test locally** before seeding production database
5. **Backup database** before running --clear flag

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the seeding script logs for detailed error messages
3. Verify your Supabase configuration and permissions
4. Check that all migrations have been run successfully
