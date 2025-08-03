import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  joinChallengeSchema, 
  completeChallengeSchema,
  type Badge,
  type Challenge,
  type UserChallenge,
  type UserBadge
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Profile update route
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const updatedUser = await storage.updateUser(req.user!.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Seed data on startup
  await storage.seedBadges();
  await storage.seedChallenges();

  // XP and Badge routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get("/api/user/badges", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userBadges = await storage.getUserBadges(req.user!.id);
      res.json(userBadges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  app.post("/api/user/xp", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid XP amount" });
      }

      const updatedUser = await storage.updateUserXP(req.user!.id, amount);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check for new badges
      const newBadges = await storage.checkAndAwardBadges(req.user!.id, updatedUser.totalXP);
      
      res.json({
        user: updatedUser,
        newBadges,
        xpGained: amount
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update XP" });
    }
  });

  // Challenge routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getAllChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get("/api/challenges/active", async (req, res) => {
    try {
      const challenges = await storage.getActiveChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active challenges" });
    }
  });

  app.get("/api/user/challenges", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userChallenges = await storage.getUserChallenges(req.user!.id);
      res.json(userChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user challenges" });
    }
  });

  app.post("/api/challenges/join", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = joinChallengeSchema.parse(req.body);
      const userChallenge = await storage.joinChallenge(req.user!.id, validatedData.challengeId);
      res.status(201).json(userChallenge);
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ message: "Validation error", errors: error.issues });
      }
      res.status(500).json({ message: "Failed to join challenge" });
    }
  });

  app.post("/api/challenges/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = completeChallengeSchema.parse(req.body);
      const userChallenge = await storage.completeChallenge(
        req.user!.id, 
        validatedData.challengeId, 
        validatedData.progress
      );
      
      if (!userChallenge) {
        return res.status(404).json({ message: "Challenge not found or not joined" });
      }

      // Get updated user with new XP
      const updatedUser = await storage.getUser(req.user!.id);
      
      res.json({
        userChallenge,
        user: updatedUser,
        message: "Challenge completed successfully!"
      });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ message: "Validation error", errors: error.issues });
      }
      res.status(500).json({ message: "Failed to complete challenge" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
