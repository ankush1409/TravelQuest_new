const AWS = require('aws-sdk');
const DynamoDB = require('aws-sdk/clients/dynamodb');

const dynamodb = new DynamoDB.DocumentClient();

/**
 * Lambda handler for TravelQuest streak processing
 * Handles streak map data, achievements, and streak calculations
 */
exports.handler = async (event) => {
    console.log('Streak Processor received event:', JSON.stringify(event, null, 2));
    
    const { fieldName, arguments: args, identity } = event;
    const userId = identity?.sub || identity?.cognitoIdentityId;
    
    if (!userId) {
        throw new Error('User not authenticated');
    }
    
    try {
        switch (fieldName) {
            case 'getStreakMapData':
                return await getStreakMapData(args.userId || userId);
            case 'updateStreakProgress':
                return await updateStreakProgress(userId, args.input);
            default:
                throw new Error(`Unknown field: ${fieldName}`);
        }
    } catch (error) {
        console.error('Error in streak processor:', error);
        throw error;
    }
};

/**
 * Get comprehensive streak map data for user
 */
async function getStreakMapData(userId) {
    const tables = {
        regions: process.env.API_TRAVELQUEST_STREAKREGION_TABLE_NAME,
        userStreaks: process.env.API_TRAVELQUEST_USERSTREAK_TABLE_NAME,
        achievements: process.env.API_TRAVELQUEST_STREAKACHIEVEMENT_TABLE_NAME
    };
    
    try {
        // Get all active regions
        const regionsResult = await dynamodb.scan({
            TableName: tables.regions,
            FilterExpression: 'isActive = :active',
            ExpressionAttributeValues: {
                ':active': true
            }
        }).promise();
        
        // Get user's streaks
        const userStreaksResult = await dynamodb.query({
            TableName: tables.userStreaks,
            IndexName: 'byUser',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();
        
        // Get user's streak achievements
        const achievementsResult = await dynamodb.query({
            TableName: tables.achievements,
            IndexName: 'byUser',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();
        
        return {
            regions: regionsResult.Items || [],
            userStreaks: userStreaksResult.Items || [],
            achievements: achievementsResult.Items || []
        };
    } catch (error) {
        console.error('Error getting streak map data:', error);
        throw error;
    }
}

/**
 * Update streak progress for a user
 */
async function updateStreakProgress(userId, input) {
    const { regionId, streakType, activityData } = input;
    
    try {
        // Check if streak record exists
        const existingStreak = await dynamodb.query({
            TableName: process.env.API_TRAVELQUEST_USERSTREAK_TABLE_NAME,
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'regionId = :regionId AND streakType = :streakType',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':regionId': regionId,
                ':streakType': streakType
            }
        }).promise();
        
        const now = new Date().toISOString();
        
        if (existingStreak.Items && existingStreak.Items.length > 0) {
            // Update existing streak
            const streak = existingStreak.Items[0];
            const newCount = streak.count + 1;
            const newMaxStreak = Math.max(streak.maxStreak || 0, newCount);
            
            const updatedStreak = await dynamodb.update({
                TableName: process.env.API_TRAVELQUEST_USERSTREAK_TABLE_NAME,
                Key: { id: streak.id },
                UpdateExpression: 'SET #count = :count, maxStreak = :maxStreak, lastActivity = :now, metadata = :metadata, updatedAt = :now',
                ExpressionAttributeNames: {
                    '#count': 'count'
                },
                ExpressionAttributeValues: {
                    ':count': newCount,
                    ':maxStreak': newMaxStreak,
                    ':now': now,
                    ':metadata': activityData || streak.metadata || {}
                },
                ReturnValues: 'ALL_NEW'
            }).promise();
            
            // Check for achievements
            await checkStreakAchievements(userId, regionId, newCount, newMaxStreak);
            
            return updatedStreak.Attributes;
        } else {
            // Create new streak
            const streakId = generateId();
            const newStreak = {
                id: streakId,
                userId,
                regionId,
                streakType,
                count: 1,
                maxStreak: 1,
                lastActivity: now,
                metadata: activityData || {},
                createdAt: now,
                updatedAt: now,
                __typename: 'UserStreak'
            };
            
            await dynamodb.put({
                TableName: process.env.API_TRAVELQUEST_USERSTREAK_TABLE_NAME,
                Item: newStreak
            }).promise();
            
            // Check for first streak achievement
            await checkStreakAchievements(userId, regionId, 1, 1);
            
            return newStreak;
        }
    } catch (error) {
        console.error('Error updating streak progress:', error);
        throw error;
    }
}

/**
 * Check and award streak achievements
 */
async function checkStreakAchievements(userId, regionId, currentStreak, maxStreak) {
    const achievements = [
        { threshold: 1, name: 'First Steps', description: 'Your first streak in this region!', xp: 50 },
        { threshold: 5, name: 'Explorer', description: '5 consecutive activities', xp: 100 },
        { threshold: 10, name: 'Adventurer', description: '10 consecutive activities', xp: 200 },
        { threshold: 15, name: 'Wanderer', description: '15 consecutive activities', xp: 300 },
        { threshold: 25, name: 'Travel Master', description: '25 consecutive activities', xp: 500 }
    ];
    
    try {
        // Get region info for achievement names
        const regionResult = await dynamodb.get({
            TableName: process.env.API_TRAVELQUEST_STREAKREGION_TABLE_NAME,
            Key: { id: regionId }
        }).promise();
        
        const regionName = regionResult.Item?.name || 'Unknown Region';
        
        for (const achievement of achievements) {
            if (currentStreak >= achievement.threshold) {
                // Check if already awarded
                const existingAchievement = await dynamodb.query({
                    TableName: process.env.API_TRAVELQUEST_STREAKACHIEVEMENT_TABLE_NAME,
                    IndexName: 'byUser',
                    KeyConditionExpression: 'userId = :userId',
                    FilterExpression: '#name = :name',
                    ExpressionAttributeNames: {
                        '#name': 'name'
                    },
                    ExpressionAttributeValues: {
                        ':userId': userId,
                        ':name': `${achievement.name} - ${regionName}`
                    }
                }).promise();
                
                if (!existingAchievement.Items || existingAchievement.Items.length === 0) {
                    // Award achievement
                    const achievementId = generateId();
                    const now = new Date().toISOString();
                    
                    const newAchievement = {
                        id: achievementId,
                        userId,
                        name: `${achievement.name} - ${regionName}`,
                        description: `${achievement.description} in ${regionName}`,
                        xpReward: achievement.xp,
                        unlockedAt: now,
                        metadata: {
                            regionId,
                            streakCount: currentStreak,
                            achievementType: 'STREAK_MILESTONE'
                        },
                        createdAt: now,
                        updatedAt: now,
                        __typename: 'StreakAchievement'
                    };
                    
                    await dynamodb.put({
                        TableName: process.env.API_TRAVELQUEST_STREAKACHIEVEMENT_TABLE_NAME,
                        Item: newAchievement
                    }).promise();
                    
                    // Award XP to user
                    await updateUserXP(userId, achievement.xp);
                    
                    console.log(`Achievement awarded: ${newAchievement.name} to user ${userId}`);
                }
            }
        }
    } catch (error) {
        console.error('Error checking streak achievements:', error);
    }
}

/**
 * Update user XP (similar to main resolver)
 */
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

function calculateLevel(xp) {
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