// AWS Amplify GraphQL queries temporarily disabled for development
// This prevents runtime errors while maintaining the AWS architecture ready for deployment

// Mock query functions for development mode
export const amplifyQueries = {
  async getUser(id: string) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async getUserStats(userId: string) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async getStreakMapData(userId: string) {
    console.warn('AWS Amplify not configured - using development mode');
    return { regions: [], userStreaks: [], achievements: [] };
  },

  async getNearbyLocations(latitude: number, longitude: number, radius?: number) {
    console.warn('AWS Amplify not configured - using development mode');
    return [];
  },

  async searchPlaces(searchQuery: string, latitude?: number, longitude?: number) {
    console.warn('AWS Amplify not configured - using development mode');
    return [];
  },

  async listCheckIns(filter?: any, limit?: number) {
    console.warn('AWS Amplify not configured - using development mode');
    return { items: [], nextToken: null };
  },

  async listDiscoveries(filter?: any, limit?: number) {
    console.warn('AWS Amplify not configured - using development mode');
    return { items: [], nextToken: null };
  },

  async listBadges(filter?: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return { items: [], nextToken: null };
  },

  async listUserBadges(filter?: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return { items: [], nextToken: null };
  },

  async listStreakRegions(filter?: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return { items: [], nextToken: null };
  },

  async listUserStreaks(filter?: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return { items: [], nextToken: null };
  },

  async listReferrals(filter?: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return { items: [], nextToken: null };
  }
};

// Mock mutation functions for development mode
export const amplifyMutations = {
  async createUser(input: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async updateUser(input: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async processCheckIn(input: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async createCheckIn(input: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async createDiscovery(input: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async updateDiscovery(input: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async processReferral(input: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async createReferral(input: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async updateStreakProgress(input: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async createUserStreak(input: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  },

  async createStreakAchievement(input: any) {
    console.warn('AWS Amplify not configured - using development mode');
    return null;
  }
};