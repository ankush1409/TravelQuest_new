import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const travelStyleEnum = pgEnum("travel_style", [
  "SOLO",
  "FAMILY", 
  "COUPLE",
  "BUSINESS",
  "BACKPACKER"
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
  isPrivate: boolean("is_private").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
