import { 
  users, 
  badges,
  challenges,
  userBadges,
  userChallenges,
  type User, 
  type InsertUser,
  type Badge,
  type Challenge,
  type UserBadge,
  type UserChallenge,
  type InsertBadge,
  type InsertChallenge,
  type InsertUserChallenge
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
  createUser(user: InsertUser): Promise<User>;
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
  
  // Seeding methods
  seedBadges(): Promise<void>;
  seedChallenges(): Promise<void>;
  
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
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
}

export const storage = new DatabaseStorage();
