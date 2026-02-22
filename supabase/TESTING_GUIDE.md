# Database Testing Guide - Collaborative Walks

This guide walks you through testing all the collaborative walks functionality in your database.

---

## Prerequisites

- ✅ Migrations applied successfully
- ✅ Logged into Supabase Dashboard
- ✅ SQL Editor open
- ✅ You have an authenticated user account

---

## Option 1: Quick Smoke Test (5 minutes)

**File:** `migrations/quick_test.sql`

This tests basic functionality:
1. Creates your profile
2. Creates a test walk
3. Adds a test sighting
4. Verifies auto-triggers work

### How to Run:

1. Copy `quick_test.sql`
2. Paste into SQL Editor
3. Run steps 1-2
4. Copy the `walk_id` from step 2 results
5. Replace `WALK_ID_HERE` in step 3 with actual UUID
6. Run step 3
7. Run step 4 (verification)

### Expected Results:

You should see 3 rows:
```
✅ Profile       | birder_xxxxx | Test Birder
✅ Walk (as owner) | Morning Test Walk | owner
✅ Sighting (with creator) | Northern Cardinal | birder_xxxxx
```

If you see these, **basic functionality works!** ✅

---

## Option 2: Comprehensive Test (20 minutes)

**File:** `migrations/test_database.sql`

This tests everything:
- All triggers
- All RLS policies
- All database functions
- Constraints and validations
- Data integrity

### How to Run:

1. Open `test_database.sql`
2. Read through each test section
3. Run tests one section at a time
4. Check results after each test
5. Look for ✅ marks

### Test Sections:

1. **Profile Creation** - Creates test profile
2. **Constraints** - Tests validation rules
3. **Auto-Owner Trigger** - Walk creator becomes owner
4. **Auto-Creator Trigger** - Sighting creator tracked
5. **Search Users** - Find users by username
6. **Profile Stats** - User stats calculation
7. **Accessible Walks** - Get walks user can access
8. **Permissions** - Check user permissions
9. **RLS Policies** - Security policies work
10. **Cascading Deletes** - Data integrity

### Expected Results:

Each test should return a row with ✅ and data. If you see errors, note which test failed.

---

## Option 3: Multi-User Testing (30 minutes)

**Requires:** Two user accounts

This tests the full collaborative flow:

### Setup:

1. Create two test accounts in Supabase Auth:
   - User A (you): `tester1@example.com`
   - User B: `tester2@example.com`

### Test Flow:

**As User A:**
1. Run quick_test.sql
2. Note your walk_id
3. Create invitation:
   ```sql
   -- Get User B's ID first
   SELECT id, email FROM auth.users WHERE email = 'tester2@example.com';

   -- Send invitation
   INSERT INTO walk_invitations (walk_id, inviter_id, invitee_id, message)
   VALUES (
     'YOUR_WALK_ID',
     auth.uid(),
     'USER_B_ID',
     'Join my test walk!'
   );
   ```

**As User B:**
1. Sign out, sign in as User B
2. Check invitation:
   ```sql
   SELECT * FROM walk_invitations WHERE invitee_id = auth.uid();
   ```
3. Accept invitation:
   ```sql
   SELECT accept_walk_invitation('INVITATION_ID');
   ```
4. Verify you can access walk:
   ```sql
   SELECT * FROM get_accessible_walks(auth.uid());
   ```
5. Add a sighting to the shared walk:
   ```sql
   INSERT INTO sightings (walk_id, species_code, species_name, type, timestamp)
   VALUES ('SHARED_WALK_ID', 'blujay', 'Blue Jay', 'seen', NOW());
   ```

**As User A (again):**
1. Check you can see User B's sighting:
   ```sql
   SELECT s.*, p.username as added_by
   FROM sightings s
   LEFT JOIN profiles p ON s.created_by = p.id
   WHERE s.walk_id = 'YOUR_WALK_ID'
   ORDER BY s.created_at;
   ```
2. You should see both sightings with different `added_by` values

### Test Permission Restrictions:

**As User B (contributor):**

Try these (should FAIL):
```sql
-- Try to edit walk details (should fail)
UPDATE walks SET name = 'Hacked!' WHERE id = 'SHARED_WALK_ID';
-- Expected: Permission denied

-- Try to delete walk (should fail)
DELETE FROM walks WHERE id = 'SHARED_WALK_ID';
-- Expected: Permission denied

-- Try to edit User A's sighting (should fail)
UPDATE sightings SET notes = 'Hacked!' WHERE created_by = 'USER_A_ID';
-- Expected: Permission denied
```

Try these (should SUCCEED):
```sql
-- Edit your own sighting (should work)
UPDATE sightings
SET notes = 'Updated my notes'
WHERE created_by = auth.uid();
-- Expected: Success

-- Leave the walk (should work)
DELETE FROM walk_collaborators
WHERE walk_id = 'SHARED_WALK_ID' AND user_id = auth.uid();
-- Expected: Success, walk removed from your list
```

**As User A (owner):**

Try these (should SUCCEED):
```sql
-- Edit walk details (should work)
UPDATE walks SET notes = 'Updated notes' WHERE id = 'YOUR_WALK_ID';

-- Edit ANY sighting (should work)
UPDATE sightings SET notes = 'Owner override' WHERE walk_id = 'YOUR_WALK_ID';

-- Remove User B (should work)
DELETE FROM walk_collaborators
WHERE walk_id = 'YOUR_WALK_ID' AND user_id = 'USER_B_ID';
```

---

## Verification Checklist

After testing, verify:

- [ ] Can create profile
- [ ] Username must be unique
- [ ] Walk creation auto-adds owner
- [ ] Sighting creation auto-sets creator
- [ ] Can search for users
- [ ] Can send invitations
- [ ] Can accept invitations
- [ ] Contributor can add sightings
- [ ] Contributor cannot edit walk
- [ ] Contributor cannot delete walk
- [ ] Contributor can edit own sightings
- [ ] Contributor cannot edit others' sightings
- [ ] Owner can edit any sighting
- [ ] Owner can remove contributors
- [ ] Contributor can leave walk
- [ ] Functions return correct data
- [ ] RLS policies block unauthorized access

---

## Common Issues

### "Permission denied for table profiles"
**Fix:** Make sure you're signed in as authenticated user, not running as anonymous.

### "Insert or update on table violates foreign key constraint"
**Fix:** Make sure referenced IDs (walk_id, user_id) actually exist.

### "Duplicate key value violates unique constraint"
**Fix:** You're trying to create something that already exists (profile, invitation, etc.)

### "Function does not exist"
**Fix:** Re-run migration 7 (create_functions.sql)

### "Trigger does not exist"
**Fix:** Re-run migrations 5 and 6 (walks and sightings RLS)

---

## Clean Up Test Data

After testing, clean up:

```sql
-- Delete test sightings
DELETE FROM sightings
WHERE walk_id IN (
  SELECT id FROM walks WHERE name LIKE '%Test%'
);

-- Delete test walks
DELETE FROM walks WHERE name LIKE '%Test%';

-- Delete test invitations
DELETE FROM walk_invitations WHERE message LIKE '%test%';

-- Keep your profile for app testing
```

---

## Next Steps

Once all tests pass:

1. ✅ Mark Phase 1 complete in TODO
2. ✅ Move to Phase 2: TypeScript types and services
3. ✅ Start building UI components

**Tests passing?** You're ready to build the app layer! 🚀
