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
   * Update user's Local Guides data in database
   */
  async updateUserLocalGuidesData(userId: string, profileUrl: string): Promise<boolean> {
    try {
      const localGuidesData = await fetchLocalGuidesData(profileUrl);
      if (!localGuidesData) {
        return false;
      }

      await storage.updateUserLocalGuides(userId, {
        localGuidesUrl: profileUrl,
        localGuidesLevel: localGuidesData.localGuidesLevel,
        localGuidesPoints: localGuidesData.localGuidesPoints,
        localGuidesReviews: localGuidesData.localGuidesReviews,
        localGuidesPhotos: localGuidesData.localGuidesPhotos,
        localGuidesVideos: localGuidesData.localGuidesVideos,
        localGuidesEdits: localGuidesData.localGuidesEdits,
        localGuidesQuestions: localGuidesData.localGuidesQuestions,
        localGuidesFacts: localGuidesData.localGuidesFacts,
        localGuidesRoads: localGuidesData.localGuidesRoads,
        localGuidesLists: localGuidesData.localGuidesLists,
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

/**
 * Fetch real Local Guides data from Google Maps profile page
 * Note: This uses web scraping since there's no official API
 */
export async function fetchLocalGuidesData(profileUrl: string) {
  try {
    console.log('Fetching Local Guides data from:', profileUrl);
    
    // Fetch the profile page
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract data using regex patterns (Google's page structure)
    const extractData = {
      // Extract level (e.g., "Level 5 Local Guide")
      localGuidesLevel: extractNumber(html, /Level (\d+) Local Guide/i) || 1,
      
      // Extract total points
      localGuidesPoints: extractNumber(html, /(\d+(?:,\d+)*) points/i) || 0,
      
      // Extract individual contributions
      localGuidesReviews: extractNumber(html, /(\d+(?:,\d+)*) reviews/i) || 0,
      localGuidesPhotos: extractNumber(html, /(\d+(?:,\d+)*) photos/i) || 0,
      localGuidesVideos: extractNumber(html, /(\d+(?:,\d+)*) videos/i) || 0,
      localGuidesEdits: extractNumber(html, /(\d+(?:,\d+)*) edits/i) || 0,
      localGuidesQuestions: extractNumber(html, /(\d+(?:,\d+)*) questions/i) || 0,
      localGuidesFacts: extractNumber(html, /(\d+(?:,\d+)*) facts/i) || 0,
      localGuidesRoads: extractNumber(html, /(\d+(?:,\d+)*) roads/i) || 0,
      localGuidesLists: extractNumber(html, /(\d+(?:,\d+)*) lists/i) || 0,
    };

    console.log('Extracted Local Guides data:', extractData);
    return extractData;

  } catch (error) {
    console.error('Error fetching Local Guides data:', error);
    throw new Error(`Failed to fetch Local Guides data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function to extract numbers from HTML text using regex
 */
function extractNumber(html: string, regex: RegExp): number {
  const match = html.match(regex);
  if (match && match[1]) {
    // Remove commas and convert to number
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
  return 0;
}