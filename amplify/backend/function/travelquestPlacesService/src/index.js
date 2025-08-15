const AWS = require('aws-sdk');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const https = require('https');

const dynamodb = new DynamoDB.DocumentClient();

/**
 * Lambda handler for TravelQuest places service
 * Handles Google Places API integration and location management
 */
exports.handler = async (event) => {
    console.log('Places Service received event:', JSON.stringify(event, null, 2));
    
    const { fieldName, arguments: args, identity } = event;
    const userId = identity?.sub || identity?.cognitoIdentityId;
    
    if (!userId) {
        throw new Error('User not authenticated');
    }
    
    try {
        switch (fieldName) {
            case 'getNearbyLocations':
                return await getNearbyLocations(args.latitude, args.longitude, args.radius || 1000);
            case 'searchPlaces':
                return await searchPlaces(args.query, args.latitude, args.longitude);
            default:
                throw new Error(`Unknown field: ${fieldName}`);
        }
    } catch (error) {
        console.error('Error in places service:', error);
        throw error;
    }
};

/**
 * Get nearby locations using Google Places API
 */
async function getNearbyLocations(latitude, longitude, radius) {
    try {
        // First check existing locations in our database
        const existingLocations = await getExistingNearbyLocations(latitude, longitude, radius);
        
        // If we have enough cached locations, return them
        if (existingLocations.length >= 10) {
            return existingLocations.slice(0, 20);
        }
        
        // Get Google Places API key from environment
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            console.warn('Google Places API key not configured, returning cached locations only');
            return existingLocations;
        }
        
        // Query Google Places API for nearby places
        const placesResult = await queryGooglePlacesNearby(latitude, longitude, radius, apiKey);
        
        // Process and cache new locations
        const newLocations = await processAndCacheLocations(placesResult);
        
        // Combine existing and new locations
        const allLocations = [...existingLocations, ...newLocations];
        
        // Remove duplicates and return top 20
        const uniqueLocations = removeDuplicateLocations(allLocations);
        return uniqueLocations.slice(0, 20);
        
    } catch (error) {
        console.error('Error getting nearby locations:', error);
        // Return cached locations if API fails
        return await getExistingNearbyLocations(latitude, longitude, radius * 2);
    }
}

/**
 * Search places using Google Places API
 */
async function searchPlaces(query, latitude, longitude) {
    try {
        // Search existing locations first
        const existingLocations = await searchExistingLocations(query);
        
        // Get Google Places API key
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            console.warn('Google Places API key not configured, returning cached locations only');
            return existingLocations;
        }
        
        // Query Google Places API for text search
        const placesResult = await queryGooglePlacesSearch(query, latitude, longitude, apiKey);
        
        // Process and cache new locations
        const newLocations = await processAndCacheLocations(placesResult);
        
        // Combine and deduplicate results
        const allLocations = [...existingLocations, ...newLocations];
        const uniqueLocations = removeDuplicateLocations(allLocations);
        
        return uniqueLocations.slice(0, 15);
        
    } catch (error) {
        console.error('Error searching places:', error);
        // Return cached locations if API fails
        return await searchExistingLocations(query);
    }
}

/**
 * Get existing nearby locations from database
 */
async function getExistingNearbyLocations(latitude, longitude, radius) {
    try {
        // Note: This is a simplified approach. In production, you'd use geospatial queries
        // or a proper geospatial database like Amazon Location Service
        
        const result = await dynamodb.scan({
            TableName: process.env.API_TRAVELQUEST_LOCATIONTABLE_NAME,
            FilterExpression: 'isActive = :active',
            ExpressionAttributeValues: {
                ':active': true
            }
        }).promise();
        
        if (!result.Items) return [];
        
        // Filter by distance
        const nearbyLocations = result.Items.filter(location => {
            const distance = calculateDistance(
                latitude, longitude,
                location.latitude, location.longitude
            );
            return distance <= radius;
        });
        
        // Sort by distance
        nearbyLocations.sort((a, b) => {
            const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
            const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
            return distA - distB;
        });
        
        return nearbyLocations;
    } catch (error) {
        console.error('Error getting existing nearby locations:', error);
        return [];
    }
}

/**
 * Search existing locations by name/description
 */
async function searchExistingLocations(query) {
    try {
        const result = await dynamodb.scan({
            TableName: process.env.API_TRAVELQUEST_LOCATIONTABLE_NAME,
            FilterExpression: 'isActive = :active AND (contains(#name, :query) OR contains(description, :query))',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':active': true,
                ':query': query.toLowerCase()
            }
        }).promise();
        
        return result.Items || [];
    } catch (error) {
        console.error('Error searching existing locations:', error);
        return [];
    }
}

/**
 * Query Google Places API for nearby places
 */
async function queryGooglePlacesNearby(latitude, longitude, radius, apiKey) {
    return new Promise((resolve, reject) => {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=tourist_attraction&key=${apiKey}`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.status === 'OK') {
                        resolve(result.results || []);
                    } else {
                        console.warn('Google Places API error:', result.status, result.error_message);
                        resolve([]);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Query Google Places API for text search
 */
async function queryGooglePlacesSearch(query, latitude, longitude, apiKey) {
    return new Promise((resolve, reject) => {
        const location = latitude && longitude ? `&location=${latitude},${longitude}&radius=50000` : '';
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}${location}&key=${apiKey}`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.status === 'OK') {
                        resolve(result.results || []);
                    } else {
                        console.warn('Google Places API error:', result.status, result.error_message);
                        resolve([]);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Process Google Places results and cache in database
 */
async function processAndCacheLocations(placesResults) {
    const locations = [];
    
    for (const place of placesResults) {
        try {
            // Check if location already exists
            const existingLocation = await dynamodb.query({
                TableName: process.env.API_TRAVELQUEST_LOCATIONTABLE_NAME,
                IndexName: 'byGooglePlaceId',
                KeyConditionExpression: 'googlePlaceId = :placeId',
                ExpressionAttributeValues: {
                    ':placeId': place.place_id
                }
            }).promise();
            
            if (existingLocation.Items && existingLocation.Items.length > 0) {
                locations.push(existingLocation.Items[0]);
                continue;
            }
            
            // Create new location record
            const locationId = generateId();
            const now = new Date().toISOString();
            
            const location = {
                id: locationId,
                name: place.name,
                description: place.types?.join(', ') || '',
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
                address: place.vicinity || place.formatted_address || '',
                category: place.types?.[0] || 'attraction',
                googlePlaceId: place.place_id,
                rating: place.rating || 0,
                photoUrl: place.photos?.[0] ? 
                    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}` :
                    null,
                isActive: true,
                xpReward: calculateXPReward(place),
                createdAt: now,
                updatedAt: now,
                __typename: 'Location'
            };
            
            // Save to database
            await dynamodb.put({
                TableName: process.env.API_TRAVELQUEST_LOCATIONTABLE_NAME,
                Item: location
            }).promise();
            
            locations.push(location);
            
        } catch (error) {
            console.error('Error processing place:', place.name, error);
        }
    }
    
    return locations;
}

/**
 * Remove duplicate locations based on proximity and Google Place ID
 */
function removeDuplicateLocations(locations) {
    const unique = [];
    const seen = new Set();
    
    for (const location of locations) {
        // Check by Google Place ID first
        if (location.googlePlaceId && seen.has(location.googlePlaceId)) {
            continue;
        }
        
        // Check for nearby duplicates (within 50 meters)
        const isDuplicate = unique.some(existing => {
            const distance = calculateDistance(
                location.latitude, location.longitude,
                existing.latitude, existing.longitude
            );
            return distance < 50;
        });
        
        if (!isDuplicate) {
            unique.push(location);
            if (location.googlePlaceId) {
                seen.add(location.googlePlaceId);
            }
        }
    }
    
    return unique;
}

/**
 * Calculate XP reward based on place characteristics
 */
function calculateXPReward(place) {
    let baseXP = 10;
    
    // Higher XP for highly rated places
    if (place.rating >= 4.5) baseXP += 10;
    else if (place.rating >= 4.0) baseXP += 5;
    
    // Higher XP for certain types
    const highValueTypes = ['museum', 'monument', 'natural_feature', 'park'];
    if (place.types?.some(type => highValueTypes.includes(type))) {
        baseXP += 15;
    }
    
    // Higher XP for popular places (based on user_ratings_total)
    if (place.user_ratings_total > 1000) baseXP += 10;
    else if (place.user_ratings_total > 100) baseXP += 5;
    
    return Math.min(baseXP, 50); // Cap at 50 XP
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
    
    return R * c;
}

function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}