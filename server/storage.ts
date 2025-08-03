import { 
  users, 
  badges,
  challenges,
  userBadges,
  userChallenges,
  locations,
  checkIns,
  discoveries,
  type User, 
  type InsertUser,
  type InsertGoogleUser,
  type Badge,
  type Challenge,
  type UserBadge,
  type UserChallenge,
  type Location,
  type CheckIn,
  type Discovery,
  type InsertBadge,
  type InsertChallenge,
  type InsertUserChallenge,
  type InsertLocation,
  type InsertCheckIn,
  type InsertDiscovery
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, lte, gte } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createGoogleUser(user: InsertGoogleUser): Promise<User>;
  linkGoogleAccount(userId: string, googleId: string): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserXP(userId: string, xpToAdd: number): Promise<User | undefined>;
  
  // Badge methods
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  checkAndAwardBadges(userId: string, currentXP: number): Promise<Badge[]>;
  
  // Challenge methods
  getAllChallenges(): Promise<Challenge[]>;
  getActiveChallenges(): Promise<Challenge[]>;
  getUserChallenges(userId: string): Promise<(UserChallenge & { challenge: Challenge })[]>;
  joinChallenge(userId: string, challengeId: string): Promise<UserChallenge>;
  completeChallenge(userId: string, challengeId: string, progress?: number): Promise<UserChallenge | undefined>;
  
  // Location methods
  getAllLocations(): Promise<Location[]>;
  getLocationsNearby(latitude: number, longitude: number, radiusKm?: number): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  // Check-in methods
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  getUserCheckIns(userId: string): Promise<(CheckIn & { location: Location })[]>;
  getLocationCheckIns(locationId: string): Promise<(CheckIn & { user: User })[]>;
  
  // Discovery methods
  createDiscovery(userId: string, locationId: string): Promise<Discovery>;
  getUserDiscoveries(userId: string): Promise<(Discovery & { location: Location })[]>;
  
  // Seeding methods
  seedBadges(): Promise<void>;
  seedChallenges(): Promise<void>;
  seedLocations(): Promise<void>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // Helper function to calculate level from XP
  private calculateLevel(xp: number): number {
    return Math.floor(xp / 1000) + 1;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createGoogleUser(insertUser: InsertGoogleUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ googleId, provider: "google" })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserLocalGuides(userId: string, localGuidesData: {
    localGuidesUrl: string;
    localGuidesLevel: number;
    localGuidesPoints: number;
    localGuidesReviews: number;
    localGuidesPhotos: number;
    localGuidesVideos: number;
    localGuidesEdits: number;
    localGuidesQuestions: number;
    localGuidesFacts: number;
    localGuidesRoads: number;
    localGuidesLists: number;
    localGuidesLastUpdate: Date;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...localGuidesData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserXP(userId: string, xpToAdd: number): Promise<User | undefined> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) return undefined;

    const newXP = currentUser.totalXP + xpToAdd;
    const newLevel = this.calculateLevel(newXP);

    const [user] = await db
      .update(users)
      .set({ 
        totalXP: newXP, 
        level: newLevel,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Badge methods
  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    return await db
      .select({
        id: userBadges.id,
        userId: userBadges.userId,
        badgeId: userBadges.badgeId,
        earnedAt: userBadges.earnedAt,
        badge: badges,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    // Check if user already has this badge
    const existing = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [userBadge] = await db
      .insert(userBadges)
      .values({ userId, badgeId })
      .returning();
    return userBadge;
  }

  async checkAndAwardBadges(userId: string, currentXP: number): Promise<Badge[]> {
    const allBadges = await this.getAllBadges();
    const userBadgeList = await this.getUserBadges(userId);
    const userBadgeIds = new Set(userBadgeList.map(ub => ub.badgeId));

    const newBadges: Badge[] = [];
    
    for (const badge of allBadges) {
      if (!userBadgeIds.has(badge.id) && badge.xpRequired && currentXP >= badge.xpRequired) {
        await this.awardBadge(userId, badge.id);
        newBadges.push(badge);
      }
    }

    return newBadges;
  }

  // Challenge methods
  async getAllChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges).orderBy(desc(challenges.createdAt));
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    const now = new Date();
    return await db
      .select()
      .from(challenges)
      .where(and(
        eq(challenges.status, "ACTIVE"),
        lte(challenges.startDate, now), // startDate <= now
        gte(challenges.endDate, now)    // endDate >= now
      ))
      .orderBy(desc(challenges.createdAt));
  }

  async getUserChallenges(userId: string): Promise<(UserChallenge & { challenge: Challenge })[]> {
    return await db
      .select({
        id: userChallenges.id,
        userId: userChallenges.userId,
        challengeId: userChallenges.challengeId,
        status: userChallenges.status,
        progress: userChallenges.progress,
        joinedAt: userChallenges.joinedAt,
        completedAt: userChallenges.completedAt,
        challenge: challenges,
      })
      .from(userChallenges)
      .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
      .where(eq(userChallenges.userId, userId))
      .orderBy(desc(userChallenges.joinedAt));
  }

  async joinChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    // Check if user already joined this challenge
    const existing = await db
      .select()
      .from(userChallenges)
      .where(and(eq(userChallenges.userId, userId), eq(userChallenges.challengeId, challengeId)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [userChallenge] = await db
      .insert(userChallenges)
      .values({ userId, challengeId, status: "JOINED" })
      .returning();
    return userChallenge;
  }

  async completeChallenge(userId: string, challengeId: string, progress = 100): Promise<UserChallenge | undefined> {
    const [userChallenge] = await db
      .update(userChallenges)
      .set({ 
        status: "COMPLETED", 
        progress,
        completedAt: new Date() 
      })
      .where(and(
        eq(userChallenges.userId, userId), 
        eq(userChallenges.challengeId, challengeId)
      ))
      .returning();

    if (userChallenge) {
      // Award XP and badge if any
      const challenge = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
      if (challenge.length > 0) {
        const challengeData = challenge[0];
        
        // Award XP
        if (challengeData.xpReward > 0) {
          await this.updateUserXP(userId, challengeData.xpReward);
        }
        
        // Award badge if specified
        if (challengeData.badgeReward) {
          await this.awardBadge(userId, challengeData.badgeReward);
        }
      }
    }

    return userChallenge || undefined;
  }

  // Seeding methods
  async seedBadges(): Promise<void> {
    const existingBadges = await db.select().from(badges).limit(1);
    if (existingBadges.length > 0) return; // Already seeded

    const badgesToSeed: InsertBadge[] = [
      {
        name: "First Steps",
        icon: "👶",
        category: "MILESTONE",
        description: "Welcome to TravelQuest! You've taken your first step on an amazing journey.",
        criteria: "Sign up for TravelQuest",
        xpRequired: 0,
      },
      {
        name: "Explorer",
        icon: "🗺️",
        category: "EXPLORATION",
        description: "You're getting the hang of this! Keep exploring and discovering new places.",
        criteria: "Reach 500 XP",
        xpRequired: 500,
      },
      {
        name: "Adventurer",
        icon: "🎒",
        category: "MILESTONE",
        description: "A true adventurer emerges! Your journey is inspiring others.",
        criteria: "Reach 1000 XP",
        xpRequired: 1000,
      },
      {
        name: "Globetrotter",
        icon: "🌍",
        category: "EXPLORATION",
        description: "The world is your playground! You've become a seasoned traveler.",
        criteria: "Reach 2500 XP",
        xpRequired: 2500,
      },
      {
        name: "Challenge Champion",
        icon: "🏆",
        category: "SPECIAL",
        description: "You love a good challenge! Your determination is admirable.",
        criteria: "Complete your first challenge",
        xpRequired: null,
      },
      {
        name: "Social Butterfly",
        icon: "🦋",
        category: "SOCIAL",
        description: "Making connections wherever you go! Travel is better with friends.",
        criteria: "Connect with other travelers",
        xpRequired: null,
      },
    ];

    await db.insert(badges).values(badgesToSeed);
  }

  async seedChallenges(): Promise<void> {
    const existingChallenges = await db.select().from(challenges).limit(1);
    if (existingChallenges.length > 0) return; // Already seeded

    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const challengesToSeed: InsertChallenge[] = [
      {
        title: "Weekend Explorer",
        description: "Plan and complete a weekend getaway to discover a new destination near you.",
        category: "EXPLORATION",
        startDate: now,
        endDate: oneMonthFromNow,
        xpReward: 150,
        badgeReward: null,
        status: "ACTIVE",
      },
      {
        title: "Photo Journey",
        description: "Capture and share 10 amazing photos from your travels to inspire others.",
        category: "PHOTO",
        startDate: now,
        endDate: oneMonthFromNow,
        xpReward: 100,
        badgeReward: null,
        status: "ACTIVE",
      },
      {
        title: "Cultural Immersion",
        description: "Experience local culture by trying traditional food, learning basic phrases, or attending a cultural event.",
        category: "CULTURAL",
        startDate: now,
        endDate: oneMonthFromNow,
        xpReward: 200,
        badgeReward: null,
        status: "ACTIVE",
      },
    ];

    await db.insert(challenges).values(challengesToSeed);
  }

  // Location methods
  async getAllLocations(): Promise<Location[]> {
    return await db.select().from(locations).orderBy(locations.name);
  }

  async getLocationsNearby(latitude: number, longitude: number, radiusKm = 5): Promise<Location[]> {
    // Simple distance calculation using Haversine formula approximation
    // For production, consider using PostGIS for more accurate geospatial queries
    const allLocations = await db.select().from(locations);
    
    return allLocations.filter(location => {
      if (!location.latitude || !location.longitude) return false;
      
      const R = 6371; // Earth's radius in km
      const dLat = this.toRadians(location.latitude - latitude);
      const dLon = this.toRadians(location.longitude - longitude);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(latitude)) * Math.cos(this.toRadians(location.latitude)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance <= radiusKm;
    });
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  // Check-in methods
  async createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn> {
    // Calculate XP reward based on location
    const location = await db.select().from(locations).where(eq(locations.id, checkIn.locationId)).limit(1);
    const xpEarned = location.length > 0 ? location[0].xpReward : 50;
    
    const [newCheckIn] = await db.insert(checkIns).values({
      ...checkIn,
      xpEarned
    }).returning();

    // Award XP to user
    await this.updateUserXP(checkIn.userId, xpEarned);

    // Check for discoveries
    if (location.length > 0 && location[0].isDiscovery) {
      const existingDiscovery = await db.select().from(discoveries)
        .where(and(eq(discoveries.userId, checkIn.userId), eq(discoveries.locationId, checkIn.locationId)))
        .limit(1);
      
      if (existingDiscovery.length === 0) {
        await this.createDiscovery(checkIn.userId, checkIn.locationId);
      }
    }

    return newCheckIn;
  }

  async getUserCheckIns(userId: string): Promise<(CheckIn & { location: Location })[]> {
    return await db
      .select({
        id: checkIns.id,
        userId: checkIns.userId,
        locationId: checkIns.locationId,
        latitude: checkIns.latitude,
        longitude: checkIns.longitude,
        notes: checkIns.notes,
        photo: checkIns.photo,
        xpEarned: checkIns.xpEarned,
        checkedInAt: checkIns.checkedInAt,
        location: locations,
      })
      .from(checkIns)
      .innerJoin(locations, eq(checkIns.locationId, locations.id))
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.checkedInAt));
  }

  async getLocationCheckIns(locationId: string): Promise<(CheckIn & { user: User })[]> {
    return await db
      .select({
        id: checkIns.id,
        userId: checkIns.userId,
        locationId: checkIns.locationId,
        latitude: checkIns.latitude,
        longitude: checkIns.longitude,
        notes: checkIns.notes,
        photo: checkIns.photo,
        xpEarned: checkIns.xpEarned,
        checkedInAt: checkIns.checkedInAt,
        user: users,
      })
      .from(checkIns)
      .innerJoin(users, eq(checkIns.userId, users.id))
      .where(eq(checkIns.locationId, locationId))
      .orderBy(desc(checkIns.checkedInAt));
  }

  // Discovery methods
  async createDiscovery(userId: string, locationId: string): Promise<Discovery> {
    const [discovery] = await db.insert(discoveries).values({
      userId,
      locationId
    }).returning();

    // Award bonus XP for discovery
    await this.updateUserXP(userId, 100);

    return discovery;
  }

  async getUserDiscoveries(userId: string): Promise<(Discovery & { location: Location })[]> {
    return await db
      .select({
        id: discoveries.id,
        userId: discoveries.userId,
        locationId: discoveries.locationId,
        discoveredAt: discoveries.discoveredAt,
        location: locations,
      })
      .from(discoveries)
      .innerJoin(locations, eq(discoveries.locationId, locations.id))
      .where(eq(discoveries.userId, userId))
      .orderBy(desc(discoveries.discoveredAt));
  }

  async seedLocations(): Promise<void> {
    const existingLocations = await db.select().from(locations).limit(1);
    if (existingLocations.length > 0) return; // Already seeded

    const locationsToSeed: InsertLocation[] = [
      {
        name: "Central Park",
        description: "A massive urban park in the heart of Manhattan, perfect for morning runs and peaceful walks.",
        latitude: 40.785091,
        longitude: -73.968285,
        category: "park",
        address: "Central Park, New York, NY",
        xpReward: 75,
        isDiscovery: false,
      },
      {
        name: "Times Square",
        description: "The bustling crossroads of the world, famous for its bright lights and energy.",
        latitude: 40.758896,
        longitude: -73.985130,
        category: "landmark",
        address: "Times Square, New York, NY",
        xpReward: 100,
        isDiscovery: false,
      },
      {
        name: "Hidden Speakeasy",
        description: "A secret cocktail bar behind an unmarked door. Only true explorers find this place!",
        latitude: 40.722210,
        longitude: -73.987677,
        category: "bar",
        address: "Secret Location, New York, NY",
        xpReward: 200,
        isDiscovery: true,
      },
      {
        name: "Brooklyn Bridge",
        description: "An iconic suspension bridge connecting Manhattan and Brooklyn with stunning views.",
        latitude: 40.706086,
        longitude: -73.996864,
        category: "landmark",
        address: "Brooklyn Bridge, New York, NY",
        xpReward: 125,
        isDiscovery: false,
      },
      {
        name: "The High Line",
        description: "An elevated linear park built on a former rail line, offering unique urban views.",
        latitude: 40.748817,
        longitude: -74.004934,
        category: "park",
        address: "High Line, New York, NY",
        xpReward: 90,
        isDiscovery: false,
      },
    ];

    await db.insert(locations).values(locationsToSeed);
  }
}

export const storage = new DatabaseStorage();
