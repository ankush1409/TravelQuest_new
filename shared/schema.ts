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

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  password: text("password"), // Make password optional for OAuth users
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  travelStyle: travelStyleEnum("travel_style").notNull().default("SOLO"),
  totalXP: integer("total_xp").notNull().default(0),
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
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type InsertDiscovery = z.infer<typeof insertDiscoverySchema>;

export type LoginData = z.infer<typeof loginSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type JoinChallenge = z.infer<typeof joinChallengeSchema>;
export type CompleteChallenge = z.infer<typeof completeChallengeSchema>;
export type CheckInData = z.infer<typeof checkInSchema>;
