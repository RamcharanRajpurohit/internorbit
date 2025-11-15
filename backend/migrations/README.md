# Migration Instructions - Onboarding Fix

## Quick Start

If you have existing users in your database, run this migration to prevent them from seeing the onboarding screen.

### Step 1: Navigate to Backend
```bash
cd /home/ramcharan/Documents/dev/plt/backend
```

### Step 2: Run Migration Script
```bash
node migrations/set-existing-users-onboarding-complete.js
```

### Expected Output:
```
🚀 Starting migration: Set existing users onboarding_completed = true

🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Found 15 existing users without onboarding_completed field

✅ Migration completed successfully!
   - Updated 15 user profiles
   - Existing users will NOT see onboarding flow
   - New users will see onboarding flow

📊 Verification: 15 users now have onboarding_completed: true

🔌 Database connection closed
```

---

## What This Does

The migration script:
1. Finds all users where `onboarding_completed` field doesn't exist
2. Sets `onboarding_completed: true` for those users
3. Updates their `updated_at` timestamp
4. Verifies the changes

---

## Why This Is Needed

**Before Migration:**
- Existing users: `onboarding_completed: undefined`
- New users: `onboarding_completed: false`
- Result: ✅ Works (existing users won't see onboarding due to strict comparison)

**After Migration:**
- Existing users: `onboarding_completed: true` 
- New users: `onboarding_completed: false`
- Result: ✅ More explicit and cleaner database state

---

## When to Run

Run this migration:
- ✅ **If you have existing users** in production/staging
- ✅ **After deploying the onboarding feature**
- ✅ **Before new users start signing up**

Skip this migration:
- ❌ Fresh database with no users
- ❌ Development environment with test users only

---

## Alternative: Manual Update

If you prefer to update manually using MongoDB Compass or shell:

```javascript
// MongoDB Shell
use internorbit

db.profiles.updateMany(
  { onboarding_completed: { $exists: false } },
  { 
    $set: { 
      onboarding_completed: true,
      updated_at: new Date()
    } 
  }
)

// Check the result
db.profiles.find({ onboarding_completed: true }).count()
```

---

## Verification

After running migration, verify it worked:

### Check in MongoDB:
```javascript
// Should return 0 (all users have the field)
db.profiles.find({ onboarding_completed: { $exists: false } }).count()

// Should return count of all existing users
db.profiles.find({ onboarding_completed: true }).count()
```

### Check in Application:
1. Login as existing user
2. Check console logs
3. Should see: `onboarding_completed: true`
4. Should show dashboard (not onboarding)

---

## Troubleshooting

### Migration fails with "Cannot connect to MongoDB"
- Check your `.env` file has correct `MONGODB_URI`
- Ensure MongoDB is running
- Check network connectivity

### Migration says "0 users found"
- All users already have the field (already migrated)
- Or database is empty (no migration needed)

### Users still seeing onboarding after migration
- Clear browser cache and cookies
- Logout and login again
- Check database to confirm `onboarding_completed: true`
- Check console logs for user object

---

## Rollback (If Needed)

If you want to undo the migration:

```javascript
// Remove the field from all users
db.profiles.updateMany(
  { onboarding_completed: true },
  { $unset: { onboarding_completed: "" } }
)
```

**Note**: This is not recommended as it would cause existing users to see onboarding.

---

## Production Deployment Checklist

Before deploying to production:

1. ✅ Test the feature in staging environment
2. ✅ Run migration in staging first
3. ✅ Verify existing staging users don't see onboarding
4. ✅ Create new test account and verify onboarding shows
5. ✅ Deploy backend changes to production
6. ✅ Run migration in production database
7. ✅ Deploy frontend changes to production
8. ✅ Monitor logs for any issues
9. ✅ Test with real production user account

---

## Summary

**Run this command:**
```bash
cd backend && node migrations/set-existing-users-onboarding-complete.js
```

**Result:**
- ✅ Existing users marked as having completed onboarding
- ✅ They won't see the onboarding screen
- ✅ New users will see onboarding normally
- ✅ Database state is clean and explicit
