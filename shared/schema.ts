import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum, uuid, primaryKey, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const travelStyleEnum = pgEnum("travel_style", [
  "SOLO",
  "FAMILY", 
  "COUPLE",
  "BUSINESS",
  "BACKPACKER"
]);

export const badgeCategoryEnum = pgEnum("badge_category", [
  "EXPLORATION",
  "SOCIAL",
  "MILESTONE",
  "SPECIAL",
  "SEASONAL"
]);

export const challengeCategoryEnum = pgEnum("challenge_category", [
  "EXPLORATION",
  "SOCIAL",
  "PHOTO",
  "ADVENTURE",
  "CULTURAL"
]);

export const challengeStatusEnum = pgEnum("challenge_status", [
  "ACTIVE",
  "COMPLETED",
  "EXPIRED"
]);

export const userChallengeStatusEnum = pgEnum("user_challenge_status", [
  "JOINED",
  "IN_PROGRESS",
  "COMPLETED",
  "ABANDONED"
]);

export const regionTypeEnum = pgEnum("region_type", [
  "COUNTRY",
  "STATE_PROVINCE",
  "CITY",
  "LANDMARK",
  "CUSTOM"
]);

export const streakTypeEnum = pgEnum("streak_type", [
  "VISIT",
  "CHALLENGE_COMPLETION",
  "CHECK_IN",
  "DISCOVERY",
  "CUSTOM"
]);

export const colorSchemeEnum = pgEnum("color_scheme", [
  "DEFAULT",
  "HEAT",
  "PROGRESS",
  "ACHIEVEMENTS",
  "CUSTOM"
]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  password: text("password"), // Make password optional for OAuth users
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  travelStyle: travelStyleEnum("travel_style").notNull().default("SOLO"),
  totalXP: integer("total_xp").notNull().default(100), // Start users with 100 XP (Level 0-1)
  level: integer("level").notNull().default(1),
  isPrivate: boolean("is_private").notNull().default(false),
  // Google OAuth fields
  googleId: text("google_id").unique(),
  provider: text("provider").default("local"), // 'local' or 'google'
  // Google Local Guides Integration
  localGuidesUrl: text("local_guides_url"),
  localGuidesLevel: integer("local_guides_level"),
  localGuidesPoints: integer("local_guides_points"),
  localGuidesReviews: integer("local_guides_reviews"),
  localGuidesPhotos: integer("local_guides_photos"),
  localGuidesVideos: integer("local_guides_videos"),
  localGuidesEdits: integer("local_guides_edits"),
  localGuidesQuestions: integer("local_guides_questions"),
  localGuidesFacts: integer("local_guides_facts"),
  localGuidesRoads: integer("local_guides_roads"),
  localGuidesLists: integer("local_guides_lists"),
  localGuidesLastUpdate: timestamp("local_guides_last_update"),
  // Referral System
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"),
  referralCount: integer("referral_count").default(0),
  referralXp: integer("referral_xp").default(0),
  // User preferences for enhanced UX
  onboardingCompleted: boolean("onboarding_completed").default(false),
  preferredTheme: text("preferred_theme").default("dark"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  privacyMode: boolean("privacy_mode").default(false),
  accessibilityMode: boolean("accessibility_mode").default(false),
  dashboardLayout: jsonb("dashboard_layout"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Referrals tracking table
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: text("referrer_id").notNull(),
  referredUserId: text("referred_user_id").notNull(),
  xpAwarded: integer("xp_awarded").default(500),
  status: text("status").default("pending"), // pending, completed, cancelled
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  category: badgeCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  criteria: text("criteria").notNull(),
  xpRequired: integer("xp_required"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: challengeCategoryEnum("category").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
  badgeReward: varchar("badge_reward"),
  status: challengeStatusEnum("status").notNull().default("ACTIVE"),
  // Location-based fields
  latitude: real("latitude"),
  longitude: real("longitude"),
  radius: integer("radius"), // in meters
  locationName: text("location_name"),
  isLocationBased: boolean("is_location_based").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: varchar("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").notNull().default(sql`now()`),
});

export const userChallenges = pgTable("user_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  status: userChallengeStatusEnum("status").notNull().default("JOINED"),
  progress: integer("progress").notNull().default(0),
  joinedAt: timestamp("joined_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

// New tables for location-based features
export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  category: text("category").notNull(), // landmark, restaurant, attraction, etc.
  address: text("address"),
  xpReward: integer("xp_reward").notNull().default(50),
  isDiscovery: boolean("is_discovery").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  locationId: varchar("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  notes: text("notes"),
  photo: text("photo"), // URL to uploaded photo
  xpEarned: integer("xp_earned").notNull().default(0),
  checkedInAt: timestamp("checked_in_at").notNull().default(sql`now()`),
});

export const discoveries = pgTable("discoveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  locationId: varchar("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  discoveredAt: timestamp("discovered_at").notNull().default(sql`now()`),
});

// Streak Map System Tables
export const streakRegions = pgTable("streak_regions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: regionTypeEnum("type").notNull(),
  countryCode: text("country_code"), // ISO 3166-1 alpha-2
  stateCode: text("state_code"), // For states/provinces
  centerLatitude: real("center_latitude").notNull(),
  centerLongitude: real("center_longitude").notNull(),
  boundingBox: jsonb("bounding_box"), // GeoJSON bounding box
  polygon: jsonb("polygon"), // GeoJSON polygon for complex shapes
  parentRegionId: varchar("parent_region_id").references(() => streakRegions.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

export const userStreaks = pgTable("user_streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  regionId: varchar("region_id").notNull().references(() => streakRegions.id, { onDelete: "cascade" }),
  streakType: streakTypeEnum("streak_type").notNull(),
  count: integer("count").notNull().default(1),
  maxStreak: integer("max_streak").notNull().default(1),
  lastActivity: timestamp("last_activity").notNull().default(sql`now()`),
  firstActivity: timestamp("first_activity").notNull().default(sql`now()`),
  metadata: jsonb("metadata"), // Additional data like specific achievements, photos, etc.
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

export const streakMapConfigs = pgTable("streak_map_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  isGlobal: boolean("is_global").notNull().default(true), // Available to all users
  createdBy: varchar("created_by").references(() => users.id),
  // Map Settings
  defaultZoomLevel: integer("default_zoom_level").notNull().default(2),
  centerLatitude: real("center_latitude").notNull().default(0),
  centerLongitude: real("center_longitude").notNull().default(0),
  minZoom: integer("min_zoom").notNull().default(1),
  maxZoom: integer("max_zoom").notNull().default(18),
  // Region Settings
  regionGranularity: regionTypeEnum("region_granularity").notNull().default("COUNTRY"),
  enabledRegionTypes: text("enabled_region_types").array().notNull().default(["COUNTRY"]),
  // Streak Settings
  enabledStreakTypes: text("enabled_streak_types").array().notNull().default(["VISIT", "CHALLENGE_COMPLETION"]),
  streakThresholds: jsonb("streak_thresholds"), // { visit: [1, 5, 10], challenge: [3, 7, 15] }
  // Visual Settings
  colorScheme: colorSchemeEnum("color_scheme").notNull().default("DEFAULT"),
  customColors: jsonb("custom_colors"), // Color mappings for different streak levels
  showLabels: boolean("show_labels").notNull().default(true),
  showStats: boolean("show_stats").notNull().default(true),
  animateAchievements: boolean("animate_achievements").notNull().default(true),
  // Feature Flags
  enableSocialExport: boolean("enable_social_export").notNull().default(true),
  enableFilters: boolean("enable_filters").notNull().default(true),
  enablePersonalization: boolean("enable_personalization").notNull().default(true),
  enableComparisons: boolean("enable_comparisons").notNull().default(false),
  // XP and Badge Settings
  xpRewards: jsonb("xp_rewards"), // XP rewards for different streak milestones
  badgeThresholds: jsonb("badge_thresholds"), // Badge unlock thresholds
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

export const userMapPreferences = pgTable("user_map_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  configId: varchar("config_id").notNull().references(() => streakMapConfigs.id),
  customSettings: jsonb("custom_settings"), // User overrides for the base config
  favoriteRegions: text("favorite_regions").array().default([]),
  hiddenRegions: text("hidden_regions").array().default([]),
  personalNotes: jsonb("personal_notes"), // User notes for specific regions
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

export const streakAchievements = pgTable("streak_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  regionId: varchar("region_id").notNull().references(() => streakRegions.id),
  achievementType: text("achievement_type").notNull(), // 'first_visit', 'streak_milestone', 'region_complete'
  achievementData: jsonb("achievement_data"), // Details about the achievement
  xpEarned: integer("xp_earned").notNull().default(0),
  badgeEarned: text("badge_earned"),
  isShared: boolean("is_shared").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  badges: many(userBadges),
  challenges: many(userChallenges),
  checkIns: many(checkIns),
  discoveries: many(discoveries),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  checkIns: many(checkIns),
  discoveries: many(discoveries),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(users, {
    fields: [checkIns.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [checkIns.locationId],
    references: [locations.id],
  }),
}));

export const discoveriesRelations = relations(discoveries, ({ one }) => ({
  user: one(users, {
    fields: [discoveries.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [discoveries.locationId],
    references: [locations.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  users: many(userBadges),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  users: many(userChallenges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallenges.challengeId],
    references: [challenges.id],
  }),
}));

// Streak Map Relations
export const streakRegionsRelations = relations(streakRegions, ({ one, many }) => ({
  parent: one(streakRegions, {
    fields: [streakRegions.parentRegionId],
    references: [streakRegions.id],
  }),
  children: many(streakRegions),
  userStreaks: many(userStreaks),
  achievements: many(streakAchievements),
}));

export const userStreaksRelations = relations(userStreaks, ({ one }) => ({
  user: one(users, {
    fields: [userStreaks.userId],
    references: [users.id],
  }),
  region: one(streakRegions, {
    fields: [userStreaks.regionId],
    references: [streakRegions.id],
  }),
}));

export const streakMapConfigsRelations = relations(streakMapConfigs, ({ one, many }) => ({
  creator: one(users, {
    fields: [streakMapConfigs.createdBy],
    references: [users.id],
  }),
  userPreferences: many(userMapPreferences),
}));

export const userMapPreferencesRelations = relations(userMapPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userMapPreferences.userId],
    references: [users.id],
  }),
  config: one(streakMapConfigs, {
    fields: [userMapPreferences.configId],
    references: [streakMapConfigs.id],
  }),
}));

export const streakAchievementsRelations = relations(streakAchievements, ({ one }) => ({
  user: one(users, {
    fields: [streakAchievements.userId],
    references: [users.id],
  }),
  region: one(streakRegions, {
    fields: [streakAchievements.regionId],
    references: [streakRegions.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  level: true,
  createdAt: true,
  updatedAt: true,
  googleId: true,
  provider: true,
}).extend({
  password: z.string().optional(), // Make password optional for OAuth
});

export const insertGoogleUserSchema = createInsertSchema(users).omit({
  id: true,
  level: true,
  createdAt: true,
  updatedAt: true,
  password: true, // Google users don't need password
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
  latitude: true,
  longitude: true,
  radius: true,
  locationName: true,
  isLocationBased: true,
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  joinedAt: true,
  completedAt: true,
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const updateProfileSchema = insertUserSchema.pick({
  displayName: true,
  bio: true,
  travelStyle: true,
  isPrivate: true,
}).partial();

export const joinChallengeSchema = z.object({
  challengeId: z.string(),
});

export const completeChallengeSchema = z.object({
  challengeId: z.string(),
  progress: z.number().optional(),
});

// New insert schemas for location features
export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  checkedInAt: true,
});

export const insertDiscoverySchema = createInsertSchema(discoveries).omit({
  id: true,
  discoveredAt: true,
});

export const checkInSchema = z.object({
  locationId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  notes: z.string().optional(),
  photo: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGoogleUser = z.infer<typeof insertGoogleUserSchema>;
export type User = typeof users.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type UserChallenge = typeof userChallenges.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type CheckIn = typeof checkIns.$inferSelect;
export type Discovery = typeof discoveries.$inferSelect;

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type InsertDiscovery = z.infer<typeof insertDiscoverySchema>;

export type LoginData = z.infer<typeof loginSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type JoinChallenge = z.infer<typeof joinChallengeSchema>;
export type CompleteChallenge = z.infer<typeof completeChallengeSchema>;
export type CheckInData = z.infer<typeof checkInSchema>;

// Streak Map Insert Schemas
export const insertStreakRegionSchema = createInsertSchema(streakRegions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserStreakSchema = createInsertSchema(userStreaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStreakMapConfigSchema = createInsertSchema(streakMapConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserMapPreferencesSchema = createInsertSchema(userMapPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStreakAchievementSchema = createInsertSchema(streakAchievements).omit({
  id: true,
  createdAt: true,
});

// Streak Map Query Schemas
export const streakMapFilterSchema = z.object({
  regionTypes: z.array(z.enum(["COUNTRY", "STATE_PROVINCE", "CITY", "LANDMARK", "CUSTOM"])).optional(),
  streakTypes: z.array(z.enum(["VISIT", "CHALLENGE_COMPLETION", "CHECK_IN", "DISCOVERY", "CUSTOM"])).optional(),
  minStreak: z.number().optional(),
  maxStreak: z.number().optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
});

export const mapExportSchema = z.object({
  format: z.enum(["PNG", "JPEG", "SVG"]),
  quality: z.number().min(0.1).max(1).optional(),
  width: z.number().max(4000).optional(),
  height: z.number().max(4000).optional(),
  includeStats: z.boolean().optional(),
  includeTitle: z.boolean().optional(),
});

// Streak Map Type exports
export type StreakRegion = typeof streakRegions.$inferSelect;
export type UserStreak = typeof userStreaks.$inferSelect;
export type StreakMapConfig = typeof streakMapConfigs.$inferSelect;
export type UserMapPreferences = typeof userMapPreferences.$inferSelect;
export type StreakAchievement = typeof streakAchievements.$inferSelect;

export type InsertStreakRegion = z.infer<typeof insertStreakRegionSchema>;
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;
export type InsertStreakMapConfig = z.infer<typeof insertStreakMapConfigSchema>;
export type InsertUserMapPreferences = z.infer<typeof insertUserMapPreferencesSchema>;
export type InsertStreakAchievement = z.infer<typeof insertStreakAchievementSchema>;
export type StreakMapFilterData = z.infer<typeof streakMapFilterSchema>;
export type MapExportData = z.infer<typeof mapExportSchema>;
