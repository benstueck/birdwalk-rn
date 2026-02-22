# Database Migrations for Collaborative Walks

This directory contains SQL migration files to add collaborative walks functionality to Birdwalk.

## Migration Files

1. **20260221000001_create_profiles.sql** - Creates profiles table for user discovery
2. **20260221000002_create_walk_collaborators.sql** - Creates walk_collaborators table to track who has access
3. **20260221000003_create_walk_invitations.sql** - Creates walk_invitations table for invitation management
4. **20260221000004_add_sighting_creator.sql** - Adds created_by column to sightings for attribution
5. **20260221000005_update_walks_rls.sql** - Updates walks RLS policies for collaborative access
6. **20260221000006_update_sightings_rls.sql** - Updates sightings RLS policies for collaborative access
7. **20260221000007_create_functions.sql** - Creates database helper functions

## How to Apply Migrations

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file **in order** (1 through 7)
4. Run each migration one at a time
5. Verify no errors in the output

### Option 2: Via Supabase CLI

If you have Supabase CLI installed:

```bash
# Apply all migrations
supabase db push

# Or apply individually
psql $DATABASE_URL -f 20260221000001_create_profiles.sql
psql $DATABASE_URL -f 20260221000002_create_walk_collaborators.sql
# ... continue for all files
```

### Option 3: All-in-One Script

Use the provided `apply_all_migrations.sql` file that combines all migrations in order (includes realtime setup).

**OR** use the two-step approach:
1. First run `apply_all_migrations.sql` (core tables, policies, functions)
2. Then run `enable_realtime.sql` (enables real-time subscriptions)

This approach is safer if you're unsure about realtime configuration.

## Verification Checklist

After running all migrations, verify:

- [ ] `profiles` table exists with 7 columns
- [ ] `walk_collaborators` table exists with 5 columns
- [ ] `walk_invitations` table exists with 9 columns
- [ ] `sightings` table has `created_by` column
- [ ] All RLS policies show in Table Editor (Security tab)
- [ ] All 6 functions are listed in Database > Functions
- [ ] All 2 triggers are listed (add_walk_owner_trigger, set_sighting_creator_trigger)

## Testing Migrations

### Test 1: Create Profile
```sql
-- Should succeed
INSERT INTO profiles (id, username, display_name)
VALUES (auth.uid(), 'testuser', 'Test User');

-- Should fail (duplicate username)
INSERT INTO profiles (id, username, display_name)
VALUES (gen_random_uuid(), 'testuser', 'Another User');
```

### Test 2: Create Walk (Auto-owner)
```sql
-- Create walk
INSERT INTO walks (user_id, name, date, start_time)
VALUES (auth.uid(), 'Test Walk', '2026-02-21', '08:00:00')
RETURNING id;

-- Check walk_collaborators (should have owner entry)
SELECT * FROM walk_collaborators WHERE walk_id = '<walk_id>';
```

### Test 3: Accept Invitation
```sql
-- Send invitation (as User A)
INSERT INTO walk_invitations (walk_id, inviter_id, invitee_id)
VALUES ('<walk_id>', auth.uid(), '<user_b_id>');

-- Accept invitation (as User B)
SELECT accept_walk_invitation('<invitation_id>');

-- Verify User B is now collaborator
SELECT * FROM walk_collaborators WHERE user_id = '<user_b_id>';
```

## Rollback

If you need to rollback these migrations:

1. Drop functions: `DROP FUNCTION IF EXISTS <function_name> CASCADE;`
2. Drop triggers: `DROP TRIGGER IF EXISTS <trigger_name> ON <table>;`
3. Drop tables: `DROP TABLE IF EXISTS <table_name> CASCADE;`
4. Remove column: `ALTER TABLE sightings DROP COLUMN IF EXISTS created_by;`

**Warning:** Rollback will delete all data in these tables!

## Realtime Subscriptions

After migrations are applied, enable realtime:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.sightings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.walk_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.walk_invitations;
```

## Next Steps

After successful migration:
1. ✅ Update TypeScript types in `src/types/database.ts`
2. ✅ Create service files (`profileService.ts`, `collaboratorService.ts`, `invitationService.ts`)
3. ✅ Build UI components
4. ✅ Test with real users

## Support

If you encounter errors:
- Check Supabase logs in Dashboard > Logs
- Verify auth.users table exists
- Ensure you're authenticated when testing
- Check RLS policies are enabled
