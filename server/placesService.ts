import { storage } from './storage';

// Place categories with proper typing
export type PlaceCategory = 'restaurant' | 'landmark' | 'park' | 'attraction' | 'bar' | 'cafe' | 'museum' | 'shopping' | 'entertainment' | 'hotel';

export interface ExternalPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  rating?: number;
  priceLevel?: number;
  photoUrl?: string;
  distance?: number; // in meters
  isOpen?: boolean;
  website?: string;
  phone?: string;
}

export interface PlaceRecommendation extends ExternalPlace {
  xpReward: number;
  personalizedScore: number; // 0-100 based on user preferences
  badges?: string[]; // Special badges this place might unlock
  tips?: string[]; // Contextual tips about the place
}

export class PlacesService {
  private apiKey: string;
  private baseUrl = 'https://places.googleapis.com/v1';

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Places API key not found. External place discovery will be limited.');
      console.info('Set GOOGLE_PLACES_API_KEY for full place recommendation features.');
    }
  }

  /**
   * Get personalized place recommendations based on user location and preferences
   */
  async getRecommendations(
    latitude: number, 
    longitude: number, 
    userId: string,
    radius = 2000, // 2km radius
    limit = 20
  ): Promise<PlaceRecommendation[]> {
    try {
      // Get user preferences to personalize recommendations
      const userCheckIns = await storage.getUserCheckIns(userId);
      const user = await storage.getUser(userId);

      // First, get existing locations from our database
      const existingLocations = await storage.getLocationsNearby(latitude, longitude, radius / 1000);
      
      // Convert existing locations to recommendations
      const existingRecommendations: PlaceRecommendation[] = existingLocations.map(location => ({
        id: location.id,
        name: location.name,
        category: location.category as PlaceCategory,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || undefined,
        description: location.description || undefined,
        xpReward: location.xpReward,
        distance: this.calculateDistance(latitude, longitude, location.latitude, location.longitude),
        personalizedScore: this.calculatePersonalizedScore(location, user, userCheckIns),
        tips: this.generateContextualTips(location.category as PlaceCategory),
        badges: this.getPotentialBadges(location, userCheckIns)
      }));

      console.log(`API Key available: ${!!this.apiKey}`);
      console.log(`Found ${existingRecommendations.length} existing locations`);

      // If we have Google Places API key, fetch external places, otherwise use demo data
      let externalRecommendations: PlaceRecommendation[] = [];
      if (this.apiKey) {
        console.log('Fetching from Google Places API...');
        externalRecommendations = await this.fetchExternalPlaces(latitude, longitude, userId, radius);
        console.log(`Google Places API returned ${externalRecommendations.length} places`);
      } else {
        console.log('No API key - generating demo places...');
        // Generate demo places when no API key available
        externalRecommendations = this.generateDemoPlaces(latitude, longitude, userId, userCheckIns);
        console.log(`Generated ${externalRecommendations.length} demo places`);
      }

      // Combine and sort all recommendations
      const allRecommendations = [...existingRecommendations, ...externalRecommendations];
      
      // Sort by personalized score and distance
      const sortedRecommendations = allRecommendations
        .sort((a, b) => {
          // Prioritize by personalized score first, then by proximity
          const scoreWeight = 0.7;
          const distanceWeight = 0.3;
          
          const aScore = (a.personalizedScore * scoreWeight) + ((2000 - (a.distance || 0)) / 2000 * 100 * distanceWeight);
          const bScore = (b.personalizedScore * scoreWeight) + ((2000 - (b.distance || 0)) / 2000 * 100 * distanceWeight);
          
          return bScore - aScore;
        })
        .slice(0, limit);

      return sortedRecommendations;
    } catch (error) {
      console.error('Error getting place recommendations:', error);
      // Fallback to existing locations only
      const fallbackLocations = await storage.getLocationsNearby(latitude, longitude, radius / 1000);
      return fallbackLocations.map(location => ({
        id: location.id,
        name: location.name,
        category: location.category as PlaceCategory,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || undefined,
        description: location.description || undefined,
        xpReward: location.xpReward,
        distance: this.calculateDistance(latitude, longitude, location.latitude, location.longitude),
        personalizedScore: 70, // Default score
        tips: this.generateContextualTips(location.category as PlaceCategory)
      }));
    }
  }

  /**
   * Fetch places from Google Places API
   */
  private async fetchExternalPlaces(
    latitude: number, 
    longitude: number, 
    userId: string,
    radius: number
  ): Promise<PlaceRecommendation[]> {
    if (!this.apiKey) return [];

    try {
      const userCheckIns = await storage.getUserCheckIns(userId);
      const user = await storage.getUser(userId);

      // Build search types based on user travel style
      const searchTypes = this.getSearchTypesForTravelStyle(user?.travelStyle);
      
      const allPlaces: ExternalPlace[] = [];

      // Use the new Places API nearby search
      const url = `${this.baseUrl}/places:searchNearby`;
      
      // Build request body for new API
      const requestBody = {
        includedTypes: searchTypes.slice(0, 3), // limit to avoid quota issues
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: {
              latitude: latitude,
              longitude: longitude
            },
            radius: radius
          }
        },
        languageCode: "en"
      };
      
      console.log(`Fetching from New Places API: ${url}`);
      console.log(`Request body:`, JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.rating,places.priceLevel,places.primaryType,places.formattedAddress,places.regularOpeningHours.openNow,places.photos'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      console.log(`New API Response Status: ${response.status}`);
      if (!response.ok) {
        console.log(`New API Error Response:`, JSON.stringify(data, null, 2));
      } else {
        console.log(`Found ${data.places?.length || 0} results`);
        if (data.places?.length > 0) {
          console.log(`First result:`, JSON.stringify(data.places[0], null, 2));
        }
      }

      if (response.ok && data.places) {
        const places: ExternalPlace[] = data.places.map((place: any) => ({
          id: place.id,
          name: place.displayName?.text || 'Unknown Place',
          category: this.mapGoogleTypeToCategory(place.primaryType || 'establishment'),
          latitude: place.location?.latitude || latitude,
          longitude: place.location?.longitude || longitude,
          address: place.formattedAddress || 'Address not available',
          rating: place.rating,
          priceLevel: place.priceLevel,
          photoUrl: place.photos?.[0]?.name ? 
            `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=400&key=${this.apiKey}` : 
            undefined,
          distance: this.calculateDistance(latitude, longitude, place.location?.latitude || latitude, place.location?.longitude || longitude),
          isOpen: place.regularOpeningHours?.openNow
        }));

        allPlaces.push(...places);
      }

      // Convert to recommendations with personalization
      return allPlaces.map(place => ({
        ...place,
        xpReward: this.calculateXPReward(place),
        personalizedScore: this.calculatePersonalizedScore(place, user, userCheckIns),
        tips: this.generateContextualTips(place.category),
        badges: this.getPotentialBadges(place, userCheckIns)
      }));

    } catch (error) {
      console.error('Error fetching external places:', error);
      return [];
    }
  }

  /**
   * Calculate personalized score based on user preferences and history
   */
  private calculatePersonalizedScore(place: any, user: any, userCheckIns: any[]): number {
    let score = 50; // Base score

    if (!user) return score;

    // Boost score based on travel style preferences
    const travelStyleBonus = this.getTravelStyleBonus(place.category, user.travelStyle);
    score += travelStyleBonus;

    // Boost for places in categories user hasn't explored much
    const categoryFrequency = userCheckIns.filter(checkin => 
      checkin.location?.category === place.category
    ).length;
    
    if (categoryFrequency === 0) {
      score += 20; // New category exploration bonus
    } else if (categoryFrequency < 3) {
      score += 10; // Limited exploration bonus
    }

    // Boost high-rated places
    if (place.rating && place.rating >= 4.5) {
      score += 15;
    } else if (place.rating && place.rating >= 4.0) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get travel style bonus for different place categories
   */
  private getTravelStyleBonus(category: PlaceCategory, travelStyle: string): number {
    const bonusMap: Record<string, Record<PlaceCategory, number>> = {
      'SOLO': {
        'museum': 15, 'cafe': 15, 'park': 10, 'landmark': 10,
        'restaurant': 5, 'bar': 10, 'attraction': 10, 'shopping': 5,
        'entertainment': 10, 'hotel': 0
      },
      'FAMILY': {
        'park': 20, 'attraction': 15, 'museum': 10, 'entertainment': 15,
        'restaurant': 10, 'shopping': 10, 'cafe': 5, 'landmark': 10,
        'bar': 0, 'hotel': 5
      },
      'COUPLE': {
        'restaurant': 20, 'bar': 15, 'park': 10, 'attraction': 10,
        'cafe': 10, 'entertainment': 15, 'landmark': 10, 'museum': 5,
        'shopping': 5, 'hotel': 10
      },
      'BUSINESS': {
        'restaurant': 15, 'cafe': 15, 'hotel': 15, 'landmark': 5,
        'museum': 5, 'park': 5, 'bar': 10, 'attraction': 0,
        'shopping': 10, 'entertainment': 5
      },
      'BACKPACKER': {
        'park': 15, 'landmark': 15, 'museum': 10, 'cafe': 15,
        'restaurant': 10, 'bar': 10, 'attraction': 10, 'shopping': 5,
        'entertainment': 5, 'hotel': 5
      }
    };

    return bonusMap[travelStyle]?.[category] || 5;
  }

  /**
   * Generate contextual tips for different place categories
   */
  private generateContextualTips(category: PlaceCategory): string[] {
    const tipMap: Record<PlaceCategory, string[]> = {
      'restaurant': ['Try the local specialties!', 'Ask about daily specials', 'Perfect for earning Food Explorer badge'],
      'landmark': ['Great photo opportunity!', 'Learn about local history', 'Historical Explorer badge potential'],
      'park': ['Perfect for relaxation', 'Bring a camera for nature shots', 'Nature Lover badge opportunity'],
      'attraction': ['Peak hours can be busy', 'Check opening times', 'Adventure Seeker badge awaits'],
      'bar': ['Local craft drinks available', 'Evening visits recommended', 'Social Explorer badge potential'],
      'cafe': ['Great for working or reading', 'Try local coffee specialties', 'Coffee Connoisseur badge possible'],
      'museum': ['Allow 2-3 hours for visit', 'Check for special exhibitions', 'Culture Enthusiast badge opportunity'],
      'shopping': ['Local crafts and souvenirs', 'Support local businesses', 'Shopping Explorer badge potential'],
      'entertainment': ['Check showtimes in advance', 'Popular with locals', 'Entertainment Seeker badge awaits'],
      'hotel': ['Great lobby areas to explore', 'Often have local recommendations', 'Hospitality Explorer badge possible']
    };

    return tipMap[category] || ['Discover something new!'];
  }

  /**
   * Get potential badges for a place
   */
  private getPotentialBadges(place: any, userCheckIns: any[]): string[] {
    const badges: string[] = [];

    // Category-specific badges
    const categoryBadges: Record<string, string> = {
      'restaurant': 'Food Explorer',
      'landmark': 'Historical Explorer', 
      'park': 'Nature Lover',
      'attraction': 'Adventure Seeker',
      'bar': 'Social Explorer',
      'cafe': 'Coffee Connoisseur',
      'museum': 'Culture Enthusiast'
    };

    if (categoryBadges[place.category]) {
      badges.push(categoryBadges[place.category]);
    }

    // First-time category badge
    const hasVisitedCategory = userCheckIns.some(checkin => 
      checkin.location?.category === place.category
    );
    if (!hasVisitedCategory) {
      badges.push('Category Pioneer');
    }

    // High-rated place badge
    if (place.rating && place.rating >= 4.8) {
      badges.push('Excellence Finder');
    }

    return badges;
  }

  /**
   * Calculate XP reward based on place characteristics
   */
  private calculateXPReward(place: ExternalPlace): number {
    let xp = 50; // Base XP

    // Category bonuses
    const categoryBonus: Record<PlaceCategory, number> = {
      'landmark': 20, 'museum': 15, 'park': 10, 'attraction': 15,
      'restaurant': 10, 'bar': 10, 'cafe': 5, 'shopping': 5,
      'entertainment': 15, 'hotel': 5
    };

    xp += categoryBonus[place.category] || 0;

    // Rating bonus
    if (place.rating && place.rating >= 4.5) {
      xp += 15;
    } else if (place.rating && place.rating >= 4.0) {
      xp += 10;
    }

    return xp;
  }

  /**
   * Get search types based on travel style (for new Places API)
   */
  private getSearchTypesForTravelStyle(travelStyle?: string): string[] {
    const typeMap: Record<string, string[]> = {
      'SOLO': ['museum', 'cafe', 'park', 'book_store', 'library'],
      'FAMILY': ['amusement_park', 'zoo', 'park', 'museum', 'aquarium'],
      'COUPLE': ['restaurant', 'bar', 'spa', 'park', 'movie_theater'],
      'BUSINESS': ['restaurant', 'cafe', 'lodging', 'convention_center'],
      'BACKPACKER': ['tourist_attraction', 'park', 'museum', 'transit_station']
    };

    return typeMap[travelStyle || 'SOLO'] || ['tourist_attraction', 'restaurant', 'park', 'museum'];
  }

  /**
   * Map Google place types to our categories
   */
  private mapGoogleTypeToCategory(googleType: string): PlaceCategory {
    const typeMap: Record<string, PlaceCategory> = {
      'restaurant': 'restaurant',
      'food': 'restaurant',
      'meal_takeaway': 'restaurant',
      'cafe': 'cafe',
      'bar': 'bar',
      'night_club': 'bar',
      'tourist_attraction': 'attraction',
      'amusement_park': 'attraction',
      'zoo': 'attraction',
      'aquarium': 'attraction',
      'museum': 'museum',
      'art_gallery': 'museum',
      'park': 'park',
      'natural_feature': 'park',
      'shopping_mall': 'shopping',
      'store': 'shopping',
      'movie_theater': 'entertainment',
      'casino': 'entertainment',
      'bowling_alley': 'entertainment',
      'hotel': 'hotel',
      'lodging': 'hotel'
    };

    return typeMap[googleType] || 'attraction';
  }

  /**
   * Calculate distance between two points in meters
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Generate demo places when Google Places API is not available
   */
  private generateDemoPlaces(latitude: number, longitude: number, userId: string, userCheckIns: any[]): PlaceRecommendation[] {
    const demoPlaces: ExternalPlace[] = [
      {
        id: 'demo-restaurant-1',
        name: 'Local Favorite Restaurant',
        category: 'restaurant',
        latitude: latitude + 0.001,
        longitude: longitude + 0.001,
        address: 'Near your location',
        description: 'Highly rated local restaurant with authentic cuisine',
        rating: 4.6,
        priceLevel: 2,
        distance: 150,
        isOpen: true
      },
      {
        id: 'demo-cafe-1',
        name: 'Cozy Corner Cafe',
        category: 'cafe',
        latitude: latitude - 0.0015,
        longitude: longitude + 0.002,
        address: 'Coffee lovers paradise',
        description: 'Perfect spot for working or relaxing with great coffee',
        rating: 4.4,
        priceLevel: 1,
        distance: 280,
        isOpen: true
      },
      {
        id: 'demo-landmark-1',
        name: 'Historic Local Landmark',
        category: 'landmark',
        latitude: latitude + 0.002,
        longitude: longitude - 0.001,
        address: 'Cultural heritage site',
        description: 'Beautiful historic site with rich cultural significance',
        rating: 4.8,
        distance: 320,
        isOpen: true
      },
      {
        id: 'demo-park-1',
        name: 'Peaceful Green Park',
        category: 'park',
        latitude: latitude - 0.001,
        longitude: longitude - 0.002,
        address: 'Nature escape in the city',
        description: 'Beautiful park perfect for walks and relaxation',
        rating: 4.3,
        distance: 450,
        isOpen: true
      },
      {
        id: 'demo-museum-1',
        name: 'Local Art Museum',
        category: 'museum',
        latitude: latitude + 0.003,
        longitude: longitude + 0.0015,
        address: 'Art and culture center',
        description: 'Inspiring collection of local and international art',
        rating: 4.5,
        distance: 520,
        isOpen: false
      }
    ];

    // Convert to recommendations with personalization
    return demoPlaces.map(place => ({
      ...place,
      xpReward: this.calculateXPReward(place),
      personalizedScore: this.calculatePersonalizedScore(place, { travelStyle: 'SOLO' }, userCheckIns),
      tips: this.generateContextualTips(place.category),
      badges: this.getPotentialBadges(place, userCheckIns)
    }));
  }

  /**
   * Check if user is within check-in range of a place
   */
  canCheckIn(userLat: number, userLng: number, placeLat: number, placeLng: number, maxDistance = 200): boolean {
    const distance = this.calculateDistance(userLat, userLng, placeLat, placeLng);
    return distance <= maxDistance;
  }
}

// Export singleton instance
export const placesService = new PlacesService();