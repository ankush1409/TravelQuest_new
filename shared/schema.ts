import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum, uuid, primaryKey } from "drizzle-orm/pg-core";
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
  password: text("password").notNull(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  travelStyle: travelStyleEnum("travel_style").notNull().default("SOLO"),
  totalXP: integer("total_xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  isPrivate: boolean("is_private").notNull().default(false),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  badges: many(userBadges),
  challenges: many(userChallenges),
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
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  joinedAt: true,
  completedAt: true,
});

export const loginSchema = insertUserSchema.pick({
  username: true,
  password: true,
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type UserChallenge = typeof userChallenges.$inferSelect;

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;

export type LoginData = z.infer<typeof loginSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type JoinChallenge = z.infer<typeof joinChallengeSchema>;
export type CompleteChallenge = z.infer<typeof completeChallengeSchema>;
