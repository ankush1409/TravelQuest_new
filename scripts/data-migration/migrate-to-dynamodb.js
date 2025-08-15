#!/usr/bin/env node
/**
 * Data migration script from PostgreSQL to DynamoDB
 * Run this script after setting up your AWS infrastructure
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { Client } = require('pg');
require('dotenv').config();

// Initialize AWS DynamoDB client
const client = new DynamoDBClient({ region: process.env.VITE_AWS_REGION || 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

// Initialize PostgreSQL client
const pgClient = new Client({
  connectionString: process.env.DATABASE_URL
});

async function connectDatabases() {
  console.log('Connecting to databases...');
  await pgClient.connect();
  console.log('Connected to PostgreSQL');
}

async function disconnectDatabases() {
  await pgClient.end();
  console.log('Disconnected from databases');
}

/**
 * Migrate users from PostgreSQL to DynamoDB
 */
async function migrateUsers() {
  console.log('\n🔄 Migrating users...');
  
  try {
    const result = await pgClient.query('SELECT * FROM users ORDER BY created_at');
    const users = result.rows;
    
    console.log(`Found ${users.length} users to migrate`);
    
    // Process in batches of 25 (DynamoDB limit)
    const batchSize = 25;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const putRequests = batch.map(user => ({
        PutRequest: {
          Item: {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.display_name,
            bio: user.bio,
            profilePicture: user.profile_picture,
            travelStyle: user.travel_style || 'SOLO',
            totalXP: user.total_xp || 100,
            level: user.level || 1,
            isPrivate: user.is_private || false,
            googleId: user.google_id,
            provider: user.provider || 'local',
            localGuidesUrl: user.local_guides_url,
            localGuidesLevel: user.local_guides_level,
            localGuidesPoints: user.local_guides_points,
            localGuidesReviews: user.local_guides_reviews,
            localGuidesPhotos: user.local_guides_photos,
            localGuidesVideos: user.local_guides_videos,
            localGuidesEdits: user.local_guides_edits,
            localGuidesQuestions: user.local_guides_questions,
            localGuidesFacts: user.local_guides_facts,
            localGuidesRoads: user.local_guides_roads,
            localGuidesLists: user.local_guides_lists,
            localGuidesLastUpdate: user.local_guides_last_update?.toISOString(),
            referralCode: user.referral_code,
            referredBy: user.referred_by,
            referralCount: user.referral_count || 0,
            referralXp: user.referral_xp || 0,
            onboardingCompleted: user.onboarding_completed || false,
            preferredTheme: user.preferred_theme || 'dark',
            notificationsEnabled: user.notifications_enabled !== false,
            privacyMode: user.privacy_mode || false,
            accessibilityMode: user.accessibility_mode || false,
            dashboardLayout: user.dashboard_layout ? JSON.stringify(user.dashboard_layout) : null,
            createdAt: user.created_at.toISOString(),
            updatedAt: user.updated_at.toISOString(),
            __typename: 'User'
          }
        }
      }));
      
      const command = new BatchWriteCommand({
        RequestItems: {
          [`User-${process.env.AMPLIFY_ENV || 'dev'}`]: putRequests
        }
      });
      
      await dynamodb.send(command);
      console.log(`Migrated users batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`);
    }
    
    console.log(`✅ Successfully migrated ${users.length} users`);
  } catch (error) {
    console.error('❌ Error migrating users:', error);
    throw error;
  }
}

/**
 * Migrate locations from PostgreSQL to DynamoDB
 */
async function migrateLocations() {
  console.log('\n🔄 Migrating locations...');
  
  try {
    const result = await pgClient.query('SELECT * FROM locations ORDER BY created_at');
    const locations = result.rows;
    
    console.log(`Found ${locations.length} locations to migrate`);
    
    const batchSize = 25;
    for (let i = 0; i < locations.length; i += batchSize) {
      const batch = locations.slice(i, i + batchSize);
      
      const putRequests = batch.map(location => ({
        PutRequest: {
          Item: {
            id: location.id,
            name: location.name,
            description: location.description,
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
            address: location.address,
            category: location.category,
            googlePlaceId: location.google_place_id,
            rating: location.rating ? parseFloat(location.rating) : 0,
            photoUrl: location.photo_url,
            isActive: location.is_active !== false,
            xpReward: location.xp_reward || 10,
            createdAt: location.created_at.toISOString(),
            updatedAt: location.updated_at.toISOString(),
            __typename: 'Location'
          }
        }
      }));
      
      const command = new BatchWriteCommand({
        RequestItems: {
          [`Location-${process.env.AMPLIFY_ENV || 'dev'}`]: putRequests
        }
      });
      
      await dynamodb.send(command);
      console.log(`Migrated locations batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(locations.length / batchSize)}`);
    }
    
    console.log(`✅ Successfully migrated ${locations.length} locations`);
  } catch (error) {
    console.error('❌ Error migrating locations:', error);
    throw error;
  }
}

/**
 * Migrate check-ins from PostgreSQL to DynamoDB
 */
async function migrateCheckIns() {
  console.log('\n🔄 Migrating check-ins...');
  
  try {
    const result = await pgClient.query('SELECT * FROM check_ins ORDER BY created_at');
    const checkIns = result.rows;
    
    console.log(`Found ${checkIns.length} check-ins to migrate`);
    
    const batchSize = 25;
    for (let i = 0; i < checkIns.length; i += batchSize) {
      const batch = checkIns.slice(i, i + batchSize);
      
      const putRequests = batch.map(checkIn => ({
        PutRequest: {
          Item: {
            id: checkIn.id,
            userId: checkIn.user_id,
            locationId: checkIn.location_id,
            xpEarned: checkIn.xp_earned || 10,
            notes: checkIn.notes,
            photoUrl: checkIn.photo_url,
            verificationDistance: checkIn.verification_distance ? parseFloat(checkIn.verification_distance) : null,
            createdAt: checkIn.created_at.toISOString(),
            updatedAt: checkIn.updated_at.toISOString(),
            __typename: 'CheckIn'
          }
        }
      }));
      
      const command = new BatchWriteCommand({
        RequestItems: {
          [`CheckIn-${process.env.AMPLIFY_ENV || 'dev'}`]: putRequests
        }
      });
      
      await dynamodb.send(command);
      console.log(`Migrated check-ins batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(checkIns.length / batchSize)}`);
    }
    
    console.log(`✅ Successfully migrated ${checkIns.length} check-ins`);
  } catch (error) {
    console.error('❌ Error migrating check-ins:', error);
    throw error;
  }
}

/**
 * Migrate discoveries from PostgreSQL to DynamoDB
 */
async function migrateDiscoveries() {
  console.log('\n🔄 Migrating discoveries...');
  
  try {
    const result = await pgClient.query('SELECT * FROM discoveries ORDER BY created_at');
    const discoveries = result.rows;
    
    console.log(`Found ${discoveries.length} discoveries to migrate`);
    
    const batchSize = 25;
    for (let i = 0; i < discoveries.length; i += batchSize) {
      const batch = discoveries.slice(i, i + batchSize);
      
      const putRequests = batch.map(discovery => ({
        PutRequest: {
          Item: {
            id: discovery.id,
            userId: discovery.user_id,
            locationId: discovery.location_id,
            title: discovery.title,
            description: discovery.description,
            photoUrl: discovery.photo_url,
            xpEarned: discovery.xp_earned || 15,
            createdAt: discovery.created_at.toISOString(),
            updatedAt: discovery.updated_at.toISOString(),
            __typename: 'Discovery'
          }
        }
      }));
      
      const command = new BatchWriteCommand({
        RequestItems: {
          [`Discovery-${process.env.AMPLIFY_ENV || 'dev'}`]: putRequests
        }
      });
      
      await dynamodb.send(command);
      console.log(`Migrated discoveries batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(discoveries.length / batchSize)}`);
    }
    
    console.log(`✅ Successfully migrated ${discoveries.length} discoveries`);
  } catch (error) {
    console.error('❌ Error migrating discoveries:', error);
    throw error;
  }
}

/**
 * Migrate streak regions from PostgreSQL to DynamoDB
 */
async function migrateStreakRegions() {
  console.log('\n🔄 Migrating streak regions...');
  
  try {
    const result = await pgClient.query('SELECT * FROM streak_regions ORDER BY created_at');
    const regions = result.rows;
    
    console.log(`Found ${regions.length} streak regions to migrate`);
    
    const batchSize = 25;
    for (let i = 0; i < regions.length; i += batchSize) {
      const batch = regions.slice(i, i + batchSize);
      
      const putRequests = batch.map(region => ({
        PutRequest: {
          Item: {
            id: region.id,
            name: region.name,
            countryCode: region.country_code,
            regionType: region.region_type || 'COUNTRY',
            coordinates: region.coordinates ? JSON.stringify(region.coordinates) : null,
            parentRegionId: region.parent_region_id,
            isActive: region.is_active !== false,
            createdAt: region.created_at.toISOString(),
            updatedAt: region.updated_at.toISOString(),
            __typename: 'StreakRegion'
          }
        }
      }));
      
      const command = new BatchWriteCommand({
        RequestItems: {
          [`StreakRegion-${process.env.AMPLIFY_ENV || 'dev'}`]: putRequests
        }
      });
      
      await dynamodb.send(command);
      console.log(`Migrated regions batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(regions.length / batchSize)}`);
    }
    
    console.log(`✅ Successfully migrated ${regions.length} streak regions`);
  } catch (error) {
    console.error('❌ Error migrating streak regions:', error);
    throw error;
  }
}

/**
 * Migrate user streaks from PostgreSQL to DynamoDB
 */
async function migrateUserStreaks() {
  console.log('\n🔄 Migrating user streaks...');
  
  try {
    const result = await pgClient.query('SELECT * FROM user_streaks ORDER BY created_at');
    const streaks = result.rows;
    
    console.log(`Found ${streaks.length} user streaks to migrate`);
    
    const batchSize = 25;
    for (let i = 0; i < streaks.length; i += batchSize) {
      const batch = streaks.slice(i, i + batchSize);
      
      const putRequests = batch.map(streak => ({
        PutRequest: {
          Item: {
            id: streak.id,
            userId: streak.user_id,
            regionId: streak.region_id,
            streakType: streak.streak_type || 'VISIT',
            count: streak.count || 0,
            maxStreak: streak.max_streak || 0,
            lastActivity: streak.last_activity?.toISOString(),
            metadata: streak.metadata ? JSON.stringify(streak.metadata) : null,
            createdAt: streak.created_at.toISOString(),
            updatedAt: streak.updated_at.toISOString(),
            __typename: 'UserStreak'
          }
        }
      }));
      
      const command = new BatchWriteCommand({
        RequestItems: {
          [`UserStreak-${process.env.AMPLIFY_ENV || 'dev'}`]: putRequests
        }
      });
      
      await dynamodb.send(command);
      console.log(`Migrated streaks batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(streaks.length / batchSize)}`);
    }
    
    console.log(`✅ Successfully migrated ${streaks.length} user streaks`);
  } catch (error) {
    console.error('❌ Error migrating user streaks:', error);
    throw error;
  }
}

/**
 * Migrate referrals from PostgreSQL to DynamoDB
 */
async function migrateReferrals() {
  console.log('\n🔄 Migrating referrals...');
  
  try {
    const result = await pgClient.query('SELECT * FROM referrals ORDER BY created_at');
    const referrals = result.rows;
    
    console.log(`Found ${referrals.length} referrals to migrate`);
    
    const batchSize = 25;
    for (let i = 0; i < referrals.length; i += batchSize) {
      const batch = referrals.slice(i, i + batchSize);
      
      const putRequests = batch.map(referral => ({
        PutRequest: {
          Item: {
            id: referral.id,
            referrerId: referral.referrer_id,
            referredUserId: referral.referred_user_id,
            xpAwarded: referral.xp_awarded || 500,
            status: referral.status?.toUpperCase() || 'PENDING',
            completedAt: referral.completed_at?.toISOString(),
            createdAt: referral.created_at.toISOString(),
            updatedAt: referral.updated_at?.toISOString() || referral.created_at.toISOString(),
            __typename: 'Referral'
          }
        }
      }));
      
      const command = new BatchWriteCommand({
        RequestItems: {
          [`Referral-${process.env.AMPLIFY_ENV || 'dev'}`]: putRequests
        }
      });
      
      await dynamodb.send(command);
      console.log(`Migrated referrals batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(referrals.length / batchSize)}`);
    }
    
    console.log(`✅ Successfully migrated ${referrals.length} referrals`);
  } catch (error) {
    console.error('❌ Error migrating referrals:', error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting TravelQuest data migration to AWS DynamoDB...');
  console.log('Environment:', process.env.AMPLIFY_ENV || 'dev');
  
  try {
    await connectDatabases();
    
    // Run migrations in sequence
    await migrateUsers();
    await migrateLocations();
    await migrateCheckIns();
    await migrateDiscoveries();
    await migrateStreakRegions();
    await migrateUserStreaks();
    await migrateReferrals();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('Please verify the data in AWS DynamoDB console.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabases();
  }
}

// Handle command line execution
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  migrateUsers,
  migrateLocations,
  migrateCheckIns,
  migrateDiscoveries,
  migrateStreakRegions,
  migrateUserStreaks,
  migrateReferrals
};