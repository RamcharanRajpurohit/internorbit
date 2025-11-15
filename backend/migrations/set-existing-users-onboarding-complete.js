// Migration script to mark all existing users as having completed onboarding
// This ensures the new onboarding feature only affects NEW users

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internorbit';

async function migrateExistingUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const profilesCollection = db.collection('profiles');

    // Count profiles where onboarding_completed is not set (undefined)
    const existingUsersCount = await profilesCollection.countDocuments({
      onboarding_completed: { $exists: false }
    });

    console.log(`\n📊 Found ${existingUsersCount} existing users without onboarding_completed field`);

    if (existingUsersCount === 0) {
      console.log('✅ No migration needed - all users already have onboarding_completed field');
      process.exit(0);
    }

    // Update all existing users to mark onboarding as completed
    const result = await profilesCollection.updateMany(
      { onboarding_completed: { $exists: false } },
      { 
        $set: { 
          onboarding_completed: true,  // Mark as completed for existing users
          updated_at: new Date()
        } 
      }
    );

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   - Updated ${result.modifiedCount} user profiles`);
    console.log(`   - Existing users will NOT see onboarding flow`);
    console.log(`   - New users will see onboarding flow\n`);

    // Verify the update
    const verifyCount = await profilesCollection.countDocuments({
      onboarding_completed: true
    });
    console.log(`📊 Verification: ${verifyCount} users now have onboarding_completed: true`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the migration
console.log('\n🚀 Starting migration: Set existing users onboarding_completed = true\n');
migrateExistingUsers();
