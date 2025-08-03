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
  constructor() {
    // Using demo data for now - API integration can be added later
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
   * Fetch Local Guides data from public profile (using demo data for now)
   */
  async fetchLocalGuidesData(profileUrl: string): Promise<LocalGuidesData | null> {
    try {
      const profileId = this.extractProfileId(profileUrl);
      if (!profileId) {
        throw new Error('Invalid Google Local Guides profile URL');
      }

      // Using demo data - replace with actual API integration when available
      return {
        level: Math.floor(Math.random() * 5) + 2, // Level 2-6
        points: Math.floor(Math.random() * 1000) + 100, // 100-1100 points
        reviews: Math.floor(Math.random() * 50) + 5, // 5-55 reviews
        photos: Math.floor(Math.random() * 100) + 10, // 10-110 photos  
        videos: Math.floor(Math.random() * 5) + 1, // 1-6 videos
        edits: Math.floor(Math.random() * 20) + 2, // 2-22 edits
        questions: Math.floor(Math.random() * 10) + 1, // 1-11 questions
        facts: Math.floor(Math.random() * 15) + 1, // 1-16 facts
        roads: Math.floor(Math.random() * 3) + 0, // 0-3 roads
        lists: Math.floor(Math.random() * 5) + 1, // 1-6 lists
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

// XP Conversion Formula for Local Guides achievements - BALANCED VERSION
export const LOCAL_GUIDES_XP_MULTIPLIERS = {
  points: 0.1,    // 0.1 XP per Local Guides point (1000 points = 100 XP)
  reviews: 3,     // 3 XP per review (50 reviews = 150 XP)
  photos: 1,      // 1 XP per photo (100 photos = 100 XP)
  videos: 5,      // 5 XP per video (5 videos = 25 XP)
  edits: 2,       // 2 XP per edit (20 edits = 40 XP)
  questions: 3,   // 3 XP per question answered (10 questions = 30 XP)
  facts: 2,       // 2 XP per fact added (15 facts = 30 XP)
  roads: 10,      // 10 XP per road added (rare achievement)
  lists: 8,       // 8 XP per list created (5 lists = 40 XP)
  levelBonus: 200 // 200 XP bonus per Local Guides level (Level 5 = 1000 XP bonus)
};

export function calculateLocalGuidesXP(data: any) {
  const baseXP = 
    (data.localGuidesPoints || 0) * LOCAL_GUIDES_XP_MULTIPLIERS.points +
    (data.localGuidesReviews || 0) * LOCAL_GUIDES_XP_MULTIPLIERS.reviews +
    (data.localGuidesPhotos || 0) * LOCAL_GUIDES_XP_MULTIPLIERS.photos +
    (data.localGuidesVideos || 0) * LOCAL_GUIDES_XP_MULTIPLIERS.videos +
    (data.localGuidesEdits || 0) * LOCAL_GUIDES_XP_MULTIPLIERS.edits +
    (data.localGuidesQuestions || 0) * LOCAL_GUIDES_XP_MULTIPLIERS.questions +
    (data.localGuidesFacts || 0) * LOCAL_GUIDES_XP_MULTIPLIERS.facts +
    (data.localGuidesRoads || 0) * LOCAL_GUIDES_XP_MULTIPLIERS.roads +
    (data.localGuidesLists || 0) * LOCAL_GUIDES_XP_MULTIPLIERS.lists;
  
  const levelBonus = (data.localGuidesLevel || 0) * LOCAL_GUIDES_XP_MULTIPLIERS.levelBonus;
  
  return baseXP + levelBonus;
}

// Fallback function for demo purposes - generates balanced sample data
export async function fetchLocalGuidesData(profileUrl: string) {
  const sampleData = {
    localGuidesLevel: Math.floor(Math.random() * 5) + 2, // Level 2-6
    localGuidesPoints: Math.floor(Math.random() * 1000) + 100, // 100-1100 points
    localGuidesReviews: Math.floor(Math.random() * 50) + 5, // 5-55 reviews
    localGuidesPhotos: Math.floor(Math.random() * 100) + 10, // 10-110 photos  
    localGuidesVideos: Math.floor(Math.random() * 5) + 1, // 1-6 videos
    localGuidesEdits: Math.floor(Math.random() * 20) + 2, // 2-22 edits
    localGuidesQuestions: Math.floor(Math.random() * 10) + 1, // 1-11 questions
    localGuidesFacts: Math.floor(Math.random() * 15) + 1, // 1-16 facts
    localGuidesRoads: Math.floor(Math.random() * 3) + 0, // 0-3 roads
    localGuidesLists: Math.floor(Math.random() * 5) + 1, // 1-6 lists
  };

  return sampleData;
}