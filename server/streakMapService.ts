import { eq, and, desc, sql, asc, inArray, gte, lte } from "drizzle-orm";
import { db } from "./db.js";
import {
  streakRegions,
  userStreaks,
  streakMapConfigs,
  userMapPreferences,
  streakAchievements,
  users,
  type StreakRegion,
  type UserStreak,
  type StreakMapConfig,
  type UserMapPreferences,
  type InsertStreakRegion,
  type InsertUserStreak,
  type InsertStreakMapConfig,
  type InsertUserMapPreferences,
  type StreakAchievement,
  type StreakMapFilterData,
} from "../shared/schema.js";

export class StreakMapService {
  // Region Management
  async getRegions(type?: string): Promise<StreakRegion[]> {
    if (type) {
      return db.select().from(streakRegions).where(and(
        eq(streakRegions.type, type as any),
        eq(streakRegions.isActive, true)
      ));
    }
    
    return db.select().from(streakRegions).where(eq(streakRegions.isActive, true));
  }

  async getRegionById(id: string): Promise<StreakRegion | null> {
    const result = await db.select()
      .from(streakRegions)
      .where(eq(streakRegions.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async createRegion(regionData: InsertStreakRegion): Promise<StreakRegion> {
    const result = await db.insert(streakRegions)
      .values(regionData)
      .returning();
    
    return result[0];
  }

  async updateRegion(id: string, updates: Partial<InsertStreakRegion>): Promise<StreakRegion | null> {
    const result = await db.update(streakRegions)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(streakRegions.id, id))
      .returning();
    
    return result[0] || null;
  }

  // User Streak Management
  async getUserStreaks(userId: string, filters?: any): Promise<any[]> {
    const baseQuery = db.select({
      id: userStreaks.id,
      userId: userStreaks.userId,
      regionId: userStreaks.regionId,
      streakType: userStreaks.streakType,
      count: userStreaks.count,
      maxStreak: userStreaks.maxStreak,
      lastActivity: userStreaks.lastActivity,
      firstActivity: userStreaks.firstActivity,
      metadata: userStreaks.metadata,
      isActive: userStreaks.isActive,
      createdAt: userStreaks.createdAt,
      updatedAt: userStreaks.updatedAt,
    })
    .from(userStreaks)
    .where(and(
      eq(userStreaks.userId, userId),
      eq(userStreaks.isActive, true)
    ));

    const results = await baseQuery.orderBy(desc(userStreaks.count));
    
    // Get regions separately and join them
    const regionIds = results.map(r => r.regionId);
    if (regionIds.length === 0) return [];
    
    const regions = await db.select().from(streakRegions).where(inArray(streakRegions.id, regionIds));
    const regionMap = new Map(regions.map(r => [r.id, r]));
    
    return results.map(streak => ({
      ...streak,
      region: regionMap.get(streak.regionId)
    }));
  }

  async incrementStreak(userId: string, regionId: string, streakType: string, metadata?: any): Promise<UserStreak> {
    // Check if streak exists
    const existing = await db.select()
      .from(userStreaks)
      .where(and(
        eq(userStreaks.userId, userId),
        eq(userStreaks.regionId, regionId),
        eq(userStreaks.streakType, streakType as any)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing streak
      const newCount = existing[0].count + 1;
      const newMaxStreak = Math.max(existing[0].maxStreak, newCount);
      
      const result = await db.update(userStreaks)
        .set({
          count: newCount,
          maxStreak: newMaxStreak,
          lastActivity: sql`now()`,
          metadata: metadata || existing[0].metadata,
          updatedAt: sql`now()`
        })
        .where(eq(userStreaks.id, existing[0].id))
        .returning();
      
      return result[0];
    } else {
      // Create new streak
      const result = await db.insert(userStreaks)
        .values({
          userId,
          regionId,
          streakType: streakType as any,
          count: 1,
          maxStreak: 1,
          metadata
        })
        .returning();
      
      return result[0];
    }
  }

  // Map Configuration Management
  async getMapConfigs(isGlobal?: boolean): Promise<StreakMapConfig[]> {
    const query = db.select().from(streakMapConfigs);
    
    if (isGlobal !== undefined) {
      return query.where(eq(streakMapConfigs.isGlobal, isGlobal));
    }
    
    return query.orderBy(desc(streakMapConfigs.isDefault), asc(streakMapConfigs.name));
  }

  async getDefaultMapConfig(): Promise<StreakMapConfig | null> {
    const result = await db.select()
      .from(streakMapConfigs)
      .where(eq(streakMapConfigs.isDefault, true))
      .limit(1);
    
    return result[0] || null;
  }

  async createMapConfig(configData: InsertStreakMapConfig): Promise<StreakMapConfig> {
    // If this is set as default, unset other defaults
    if (configData.isDefault) {
      await db.update(streakMapConfigs)
        .set({ isDefault: false })
        .where(eq(streakMapConfigs.isDefault, true));
    }
    
    const result = await db.insert(streakMapConfigs)
      .values(configData)
      .returning();
    
    return result[0];
  }

  async updateMapConfig(id: string, updates: Partial<InsertStreakMapConfig>): Promise<StreakMapConfig | null> {
    // If this is set as default, unset other defaults
    if (updates.isDefault) {
      await db.update(streakMapConfigs)
        .set({ isDefault: false })
        .where(eq(streakMapConfigs.isDefault, true));
    }
    
    const result = await db.update(streakMapConfigs)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(streakMapConfigs.id, id))
      .returning();
    
    return result[0] || null;
  }

  // User Preferences Management
  async getUserMapPreferences(userId: string, configId?: string): Promise<any[]> {
    let whereConditions = and(
      eq(userMapPreferences.userId, userId),
      eq(userMapPreferences.isActive, true)
    );

    if (configId) {
      whereConditions = and(whereConditions, eq(userMapPreferences.configId, configId));
    }

    return db.select().from(userMapPreferences).where(whereConditions);
  }

  async saveUserMapPreferences(prefData: InsertUserMapPreferences): Promise<UserMapPreferences> {
    // Check if preferences exist for this user/config combination
    const existing = await db.select()
      .from(userMapPreferences)
      .where(and(
        eq(userMapPreferences.userId, prefData.userId),
        eq(userMapPreferences.configId, prefData.configId)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing preferences
      const result = await db.update(userMapPreferences)
        .set({
          ...prefData,
          updatedAt: sql`now()`
        })
        .where(eq(userMapPreferences.id, existing[0].id))
        .returning();
      
      return result[0];
    } else {
      // Create new preferences
      const result = await db.insert(userMapPreferences)
        .values(prefData)
        .returning();
      
      return result[0];
    }
  }

  // Achievement Management
  async getUserAchievements(userId: string, regionId?: string): Promise<any[]> {
    let whereConditions = eq(streakAchievements.userId, userId);

    if (regionId) {
      whereConditions = and(whereConditions, eq(streakAchievements.regionId, regionId));
    }

    return db.select().from(streakAchievements)
      .where(whereConditions)
      .orderBy(desc(streakAchievements.createdAt));
  }

  async createAchievement(
    userId: string, 
    regionId: string, 
    achievementType: string, 
    achievementData: any, 
    xpEarned: number = 0,
    badgeEarned?: string
  ): Promise<StreakAchievement> {
    const result = await db.insert(streakAchievements)
      .values({
        userId,
        regionId,
        achievementType,
        achievementData,
        xpEarned,
        badgeEarned,
        isShared: false
      })
      .returning();
    
    // Update user's total XP if applicable
    if (xpEarned > 0) {
      await db.update(users)
        .set({ 
          totalXP: sql`${users.totalXP} + ${xpEarned}`,
        })
        .where(eq(users.id, userId));
    }
    
    return result[0];
  }

  // Analytics and Statistics
  async getMapStatistics(userId: string): Promise<{
    totalRegionsVisited: number;
    totalStreaks: number;
    longestStreak: number;
    countriesVisited: number;
    citiesVisited: number;
    totalXPFromStreaks: number;
    recentAchievements: StreakAchievement[];
  }> {
    const streaks = await this.getUserStreaks(userId);
    const achievements = await this.getUserAchievements(userId);
    
    // Get unique regions by type
    const regionIds = [...new Set(streaks.map(s => s.regionId))];
    const regions = regionIds.length > 0 ? 
      await db.select().from(streakRegions).where(inArray(streakRegions.id, regionIds)) : [];
    
    const countriesVisited = new Set(
      regions.filter(r => r.type === 'COUNTRY').map(r => r.countryCode).filter(Boolean)
    ).size;
    
    const citiesVisited = regions.filter(r => r.type === 'CITY').length;
    
    const totalXPFromStreaks = achievements.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
    
    return {
      totalRegionsVisited: new Set(streaks.map(s => s.regionId)).size,
      totalStreaks: streaks.length,
      longestStreak: Math.max(...streaks.map(s => s.maxStreak), 0),
      countriesVisited,
      citiesVisited,
      totalXPFromStreaks,
      recentAchievements: achievements.slice(0, 5)
    };
  }

  // Initialize default world regions (countries)
  async initializeWorldRegions(): Promise<void> {
    const existingRegions = await db.select().from(streakRegions).limit(1);
    
    if (existingRegions.length > 0) {
      return; // Already initialized
    }

    // Add major countries as default regions
    const worldRegions = [
      {
        name: "United States",
        type: "COUNTRY" as const,
        countryCode: "US",
        centerLatitude: 39.8283,
        centerLongitude: -98.5795,
        boundingBox: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[-125, 25], [-66, 25], [-66, 49], [-125, 49], [-125, 25]]]
          }
        }
      },
      {
        name: "Canada", 
        type: "COUNTRY" as const,
        countryCode: "CA",
        centerLatitude: 56.1304,
        centerLongitude: -106.3468,
        boundingBox: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[-141, 42], [-52, 42], [-52, 84], [-141, 84], [-141, 42]]]
          }
        }
      },
      {
        name: "United Kingdom",
        type: "COUNTRY" as const,
        countryCode: "GB", 
        centerLatitude: 55.3781,
        centerLongitude: -3.4360,
        boundingBox: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[-10, 49], [2, 49], [2, 61], [-10, 61], [-10, 49]]]
          }
        }
      },
      {
        name: "France",
        type: "COUNTRY" as const,
        countryCode: "FR",
        centerLatitude: 46.2276,
        centerLongitude: 2.2137,
        boundingBox: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[-5, 42], [9, 42], [9, 51], [-5, 51], [-5, 42]]]
          }
        }
      },
      {
        name: "Japan",
        type: "COUNTRY" as const,
        countryCode: "JP",
        centerLatitude: 36.2048,
        centerLongitude: 138.2529,
        boundingBox: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[129, 31], [146, 31], [146, 46], [129, 46], [129, 31]]]
          }
        }
      },
      {
        name: "Australia",
        type: "COUNTRY" as const,
        countryCode: "AU",
        centerLatitude: -25.2744,
        centerLongitude: 133.7751,
        boundingBox: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[113, -44], [154, -44], [154, -10], [113, -10], [113, -44]]]
          }
        }
      }
    ];

    await db.insert(streakRegions).values(worldRegions);
  }

  // Initialize default map configuration
  async initializeDefaultConfig(): Promise<void> {
    const existing = await this.getDefaultMapConfig();
    
    if (existing) {
      return; // Already initialized
    }

    const defaultConfig = {
      name: "Default World Map",
      description: "Default configuration for the world streak map",
      isDefault: true,
      isGlobal: true,
      defaultZoomLevel: 2,
      centerLatitude: 20,
      centerLongitude: 0,
      minZoom: 1,
      maxZoom: 18,
      regionGranularity: "COUNTRY" as const,
      enabledRegionTypes: ["COUNTRY", "STATE_PROVINCE", "CITY"],
      enabledStreakTypes: ["VISIT", "CHALLENGE_COMPLETION", "CHECK_IN", "DISCOVERY"],
      streakThresholds: {
        visit: [1, 5, 10, 25, 50],
        challenge_completion: [1, 3, 7, 15, 30],
        check_in: [1, 10, 25, 50, 100],
        discovery: [1, 5, 15, 30, 60]
      },
      colorScheme: "DEFAULT" as const,
      customColors: {
        level1: "#4f46e5", // indigo-600
        level2: "#7c3aed", // violet-600
        level3: "#c026d3", // fuchsia-600
        level4: "#e11d48", // rose-600
        level5: "#f59e0b"  // amber-500
      },
      showLabels: true,
      showStats: true,
      animateAchievements: true,
      enableSocialExport: true,
      enableFilters: true,
      enablePersonalization: true,
      enableComparisons: false,
      xpRewards: {
        first_visit: 100,
        streak_milestone_5: 250,
        streak_milestone_10: 500,
        streak_milestone_25: 1000,
        region_complete: 2000
      },
      badgeThresholds: {
        explorer: 5,        // Visit 5 regions
        adventurer: 15,     // Visit 15 regions
        globetrotter: 50,   // Visit 50 regions
        streak_master: 25   // Achieve 25 streak in any region
      }
    };

    await this.createMapConfig(defaultConfig);
  }
}

export const streakMapService = new StreakMapService();