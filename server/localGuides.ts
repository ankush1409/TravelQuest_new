import { GoogleLocalGuidesAPI } from 'google-local-guides-api';
import { storage } from './storage';

export interface LocalGuidesData {
  level: number;
  points: number;
  reviews: number;
  photos: number;
  videos: number;
  edits: number;
  questions: number;
  facts: number;
  roads: number;
  lists: number;
}

export class LocalGuidesService {
  private api: GoogleLocalGuidesAPI;

  constructor() {
    this.api = new GoogleLocalGuidesAPI();
  }

  /**
   * Extract profile ID from Google Local Guides URL
   * Example: https://www.google.com/maps/contrib/123456789 -> 123456789
   */
  private extractProfileId(url: string): string | null {
    try {
      const match = url.match(/\/contrib\/(\d+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting profile ID:', error);
      return null;
    }
  }

  /**
   * Fetch Local Guides data from public profile
   */
  async fetchLocalGuidesData(profileUrl: string): Promise<LocalGuidesData | null> {
    try {
      const profileId = this.extractProfileId(profileUrl);
      if (!profileId) {
        throw new Error('Invalid Google Local Guides profile URL');
      }

      const data = await this.api.getProfile(profileId);
      
      return {
        level: data.level || 0,
        points: data.points || 0,
        reviews: data.reviews || 0,
        photos: data.photos || 0,
        videos: data.videos || 0,
        edits: data.edits || 0,
        questions: data.questions || 0,
        facts: data.facts || 0,
        roads: data.roads || 0,
        lists: data.lists || 0,
      };
    } catch (error) {
      console.error('Error fetching Local Guides data:', error);
      return null;
    }
  }

  /**
   * Update user's Local Guides data in database
   */
  async updateUserLocalGuidesData(userId: string, profileUrl: string): Promise<boolean> {
    try {
      const localGuidesData = await this.fetchLocalGuidesData(profileUrl);
      if (!localGuidesData) {
        return false;
      }

      await storage.updateUserLocalGuides(userId, {
        localGuidesUrl: profileUrl,
        localGuidesLevel: localGuidesData.level,
        localGuidesPoints: localGuidesData.points,
        localGuidesReviews: localGuidesData.reviews,
        localGuidesPhotos: localGuidesData.photos,
        localGuidesVideos: localGuidesData.videos,
        localGuidesEdits: localGuidesData.edits,
        localGuidesQuestions: localGuidesData.questions,
        localGuidesFacts: localGuidesData.facts,
        localGuidesRoads: localGuidesData.roads,
        localGuidesLists: localGuidesData.lists,
        localGuidesLastUpdate: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Error updating user Local Guides data:', error);
      return false;
    }
  }

  /**
   * Check if user's Local Guides data needs updating (older than 24 hours)
   */
  shouldUpdateLocalGuidesData(lastUpdate: Date | null): boolean {
    if (!lastUpdate) return true;
    
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    return lastUpdate < oneDayAgo;
  }
}

export const localGuidesService = new LocalGuidesService();