const AWS = require('aws-sdk');
const DynamoDB = require('aws-sdk/clients/dynamodb');

const dynamodb = new DynamoDB.DocumentClient();

/**
 * Main Lambda handler for TravelQuest business logic
 * Handles check-ins, referrals, user stats, and complex operations
 */
exports.handler = async (event) => {
    console.log('TravelQuest Resolver received event:', JSON.stringify(event, null, 2));
    
    const { fieldName, arguments: args, identity, source } = event;
    const userId = identity?.sub || identity?.cognitoIdentityId;
    
    if (!userId) {
        throw new Error('User not authenticated');
    }
    
    try {
        switch (fieldName) {
            case 'getUserStats':
                return await getUserStats(args.userId || userId);
            case 'processCheckIn':
                return await processCheckIn(userId, args.input);
            case 'processReferral':
                return await processReferral(userId, args.input);
            default:
                throw new Error(`Unknown field: ${fieldName}`);
        }
    } catch (error) {
        console.error('Error in resolver:', error);
        throw error;
    }
};

/**
 * Get comprehensive user statistics
 */
async function getUserStats(userId) {
    const tables = {
        users: process.env.API_TRAVELQUEST_USERTABLE_NAME,
        checkIns: process.env.API_TRAVELQUEST_CHECKINTABLE_NAME,
        discoveries: process.env.API_TRAVELQUEST_DISCOVERYTABLE_NAME,
        userBadges: process.env.API_TRAVELQUEST_USERBADGETABLE_NAME,
        userStreaks: process.env.API_TRAVELQUEST_USERSTREAKETABLE_NAME,
        referrals: process.env.API_TRAVELQUEST_REFERRALTABLE_NAME
    };
    
    try {
        // Get user data
        const userResult = await dynamodb.get({
            TableName: tables.users,
            Key: { id: userId }
        }).promise();
        
        if (!userResult.Item) {
            throw new Error('User not found');
        }
        
        const user = userResult.Item;
        
        // Get counts in parallel
        const [checkInCount, discoveryCount, badgeCount, streakCount, referralCount] = await Promise.all([
            getItemCount(tables.checkIns, 'byUser', userId),
            getItemCount(tables.discoveries, 'byUser', userId),
            getItemCount(tables.userBadges, 'byUser', userId),
            getItemCount(tables.userStreaks, 'byUser', userId),
            getItemCount(tables.referrals, 'byReferrer', userId)
        ]);
        
        return {
            totalXP: user.totalXP || 0,
            level: user.level || 1,
            checkInCount,
            discoveryCount,
            badgeCount,
            streakCount,
            referralCount
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
}

/**
 * Process a check-in with location validation and XP rewards
 */
async function processCheckIn(userId, input) {
    const { locationId, latitude, longitude, notes, photoUrl } = input;
    
    try {
        // Get location details
        const locationResult = await dynamodb.get({
            TableName: process.env.API_TRAVELQUEST_LOCATIONTABLE_NAME,
            Key: { id: locationId }
        }).promise();
        
        if (!locationResult.Item) {
            throw new Error('Location not found');
        }
        
        const location = locationResult.Item;
        
        // Calculate distance for verification
        const distance = calculateDistance(
            latitude, longitude,
            location.latitude, location.longitude
        );
        
        // Verify proximity (200m threshold)
        if (distance > 200) {
            throw new Error('You must be within 200 meters of the location to check in');
        }
        
        // Check for duplicate check-ins (same location, same day)
        const today = new Date().toISOString().split('T')[0];
        const existingCheckIn = await dynamodb.query({
            TableName: process.env.API_TRAVELQUEST_CHECKINTABLE_NAME,
            IndexName: 'byUser',
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'locationId = :locationId AND begins_with(createdAt, :today)',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':locationId': locationId,
                ':today': today
            }
        }).promise();
        
        if (existingCheckIn.Items && existingCheckIn.Items.length > 0) {
            throw new Error('You have already checked in to this location today');
        }
        
        // Create check-in record
        const checkInId = generateId();
        const xpEarned = location.xpReward || 10;
        const now = new Date().toISOString();
        
        const checkIn = {
            id: checkInId,
            userId,
            locationId,
            xpEarned,
            notes,
            photoUrl,
            verificationDistance: Math.round(distance),
            createdAt: now,
            updatedAt: now,
            __typename: 'CheckIn'
        };
        
        // Save check-in
        await dynamodb.put({
            TableName: process.env.API_TRAVELQUEST_CHECKINTABLE_NAME,
            Item: checkIn
        }).promise();
        
        // Update user XP
        await updateUserXP(userId, xpEarned);
        
        // Update streak progress (async)
        updateStreakProgress(userId, locationId, 'CHECK_IN').catch(console.error);
        
        return checkIn;
    } catch (error) {
        console.error('Error processing check-in:', error);
        throw error;
    }
}

/**
 * Process a referral and award XP
 */
async function processReferral(userId, input) {
    const { referralCode } = input;
    
    try {
        // Find referrer by referral code
        const referrerResult = await dynamodb.query({
            TableName: process.env.API_TRAVELQUEST_USERTABLE_NAME,
            IndexName: 'byReferralCode',
            KeyConditionExpression: 'referralCode = :code',
            ExpressionAttributeValues: {
                ':code': referralCode
            }
        }).promise();
        
        if (!referrerResult.Items || referrerResult.Items.length === 0) {
            throw new Error('Invalid referral code');
        }
        
        const referrer = referrerResult.Items[0];
        
        if (referrer.id === userId) {
            throw new Error('Cannot refer yourself');
        }
        
        // Check if user is already referred
        const userResult = await dynamodb.get({
            TableName: process.env.API_TRAVELQUEST_USERTABLE_NAME,
            Key: { id: userId }
        }).promise();
        
        if (!userResult.Item) {
            throw new Error('User not found');
        }
        
        if (userResult.Item.referredBy) {
            throw new Error('User is already referred by someone else');
        }
        
        // Create referral record
        const referralId = generateId();
        const xpAwarded = 500; // Standard referral XP
        const now = new Date().toISOString();
        
        const referral = {
            id: referralId,
            referrerId: referrer.id,
            referredUserId: userId,
            xpAwarded,
            status: 'COMPLETED',
            completedAt: now,
            createdAt: now,
            updatedAt: now,
            __typename: 'Referral'
        };
        
        // Update user's referredBy field
        await dynamodb.update({
            TableName: process.env.API_TRAVELQUEST_USERTABLE_NAME,
            Key: { id: userId },
            UpdateExpression: 'SET referredBy = :referredBy, updatedAt = :now',
            ExpressionAttributeValues: {
                ':referredBy': referrer.id,
                ':now': now
            }
        }).promise();
        
        // Save referral record
        await dynamodb.put({
            TableName: process.env.API_TRAVELQUEST_REFERRALTABLE_NAME,
            Item: referral
        }).promise();
        
        // Award XP to both users
        await Promise.all([
            updateUserXP(referrer.id, xpAwarded), // Referrer gets XP
            updateUserXP(userId, Math.floor(xpAwarded / 2)) // Referred user gets half XP
        ]);
        
        // Update referrer's referral count
        await dynamodb.update({
            TableName: process.env.API_TRAVELQUEST_USERTABLE_NAME,
            Key: { id: referrer.id },
            UpdateExpression: 'ADD referralCount :inc, referralXp :xp SET updatedAt = :now',
            ExpressionAttributeValues: {
                ':inc': 1,
                ':xp': xpAwarded,
                ':now': now
            }
        }).promise();
        
        return referral;
    } catch (error) {
        console.error('Error processing referral:', error);
        throw error;
    }
}

/**
 * Helper Functions
 */

async function getItemCount(tableName, indexName, keyValue) {
    try {
        const result = await dynamodb.query({
            TableName: tableName,
            IndexName: indexName,
            KeyConditionExpression: `${indexName.replace('by', '').toLowerCase()}Id = :key`,
            ExpressionAttributeValues: {
                ':key': keyValue
            },
            Select: 'COUNT'
        }).promise();
        
        return result.Count || 0;
    } catch (error) {
        console.error(`Error counting items in ${tableName}:`, error);
        return 0;
    }
}

async function updateUserXP(userId, xpToAdd) {
    const now = new Date().toISOString();
    
    try {
        const result = await dynamodb.update({
            TableName: process.env.API_TRAVELQUEST_USERTABLE_NAME,
            Key: { id: userId },
            UpdateExpression: 'ADD totalXP :xp SET updatedAt = :now',
            ExpressionAttributeValues: {
                ':xp': xpToAdd,
                ':now': now
            },
            ReturnValues: 'ALL_NEW'
        }).promise();
        
        // Calculate new level
        const newXP = result.Attributes.totalXP;
        const newLevel = calculateLevel(newXP);
        
        // Update level if changed
        if (newLevel !== result.Attributes.level) {
            await dynamodb.update({
                TableName: process.env.API_TRAVELQUEST_USERTABLE_NAME,
                Key: { id: userId },
                UpdateExpression: 'SET #level = :level, updatedAt = :now',
                ExpressionAttributeNames: {
                    '#level': 'level'
                },
                ExpressionAttributeValues: {
                    ':level': newLevel,
                    ':now': now
                }
            }).promise();
        }
        
        return result.Attributes;
    } catch (error) {
        console.error('Error updating user XP:', error);
        throw error;
    }
}

async function updateStreakProgress(userId, locationId, streakType) {
    // This would integrate with the streak processor Lambda
    // For now, we'll implement basic streak logic
    
    try {
        // Get location to determine region
        const locationResult = await dynamodb.get({
            TableName: process.env.API_TRAVELQUEST_LOCATIONTABLE_NAME,
            Key: { id: locationId }
        }).promise();
        
        if (!locationResult.Item) return;
        
        // This is a simplified implementation
        // In practice, you'd determine the region from location data
        // and update the appropriate streak records
        
        console.log(`Updating streak progress for user ${userId}, location ${locationId}, type ${streakType}`);
    } catch (error) {
        console.error('Error updating streak progress:', error);
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
}

function calculateLevel(xp) {
    // Level progression: 0-99 XP = Level 1, 100-299 = Level 2, etc.
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    return Math.min(5, Math.floor((xp - 1000) / 500) + 5);
}

function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}