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
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

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

      // If we have Google Places API key, fetch external places
      let externalRecommendations: PlaceRecommendation[] = [];
      if (this.apiKey) {
        externalRecommendations = await this.fetchExternalPlaces(latitude, longitude, userId, radius);
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

      // Search for different types of places
      for (const type of searchTypes) {
        const url = `${this.baseUrl}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${this.apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results) {
          const places: ExternalPlace[] = data.results.slice(0, 5).map((place: any) => ({
            id: place.place_id,
            name: place.name,
            category: this.mapGoogleTypeToCategory(place.types[0]),
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            address: place.vicinity,
            rating: place.rating,
            priceLevel: place.price_level,
            photoUrl: place.photos?.[0] ? 
              `${this.baseUrl}/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${this.apiKey}` : 
              undefined,
            distance: this.calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
            isOpen: place.opening_hours?.open_now
          }));

          allPlaces.push(...places);
        }
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
   * Get search types based on travel style
   */
  private getSearchTypesForTravelStyle(travelStyle?: string): string[] {
    const typeMap: Record<string, string[]> = {
      'SOLO': ['museum', 'cafe', 'park', 'book_store', 'library'],
      'FAMILY': ['amusement_park', 'zoo', 'park', 'museum', 'aquarium'],
      'COUPLE': ['restaurant', 'bar', 'spa', 'park', 'movie_theater'],
      'BUSINESS': ['restaurant', 'cafe', 'hotel', 'conference_center'],
      'BACKPACKER': ['hostel', 'park', 'museum', 'local_government_office', 'transit_station']
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
   * Check if user is within check-in range of a place
   */
  canCheckIn(userLat: number, userLng: number, placeLat: number, placeLng: number, maxDistance = 200): boolean {
    const distance = this.calculateDistance(userLat, userLng, placeLat, placeLng);
    return distance <= maxDistance;
  }
}

// Export singleton instance
export const placesService = new PlacesService();