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

  // Location API routes
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.get("/api/locations/nearby", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const locations = await storage.getLocationsNearby(
        parseFloat(lat as string),
        parseFloat(lng as string),
        radius ? parseFloat(radius as string) : undefined
      );
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby locations" });
    }
  });

  // Check-in API routes
  app.post("/api/checkins", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const checkIn = await storage.createCheckIn({
        ...req.body,
        userId: req.user!.id
      });
      res.json(checkIn);
    } catch (error) {
      res.status(500).json({ message: "Failed to create check-in" });
    }
  });

  app.get("/api/user/checkins", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const checkIns = await storage.getUserCheckIns(req.user!.id);
      res.json(checkIns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch check-ins" });
    }
  });

  // Discovery API routes
  app.get("/api/user/discoveries", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const discoveries = await storage.getUserDiscoveries(req.user!.id);
      res.json(discoveries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discoveries" });
    }
  });

  // Seed data on startup
  await storage.seedBadges();
  await storage.seedChallenges();
  await storage.seedLocations();

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

  // Google Local Guides Integration
  app.post("/api/user/local-guides", async (req, res) => {
    try {
      const { profileUrl } = req.body;
      if (!req.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!profileUrl || !profileUrl.includes("google.com/maps/contrib/")) {
        return res.status(400).json({ error: "Invalid Google Local Guides profile URL" });
      }

      // Extract profile ID for validation
      const profileIdMatch = profileUrl.match(/\/contrib\/(\d+)/);
      if (!profileIdMatch) {
        return res.status(400).json({ error: "Could not extract profile ID from URL" });
      }

      // Fetch Local Guides data and calculate XP gain
      const { fetchLocalGuidesData, calculateLocalGuidesXP } = await import("./localGuides");
      const localGuidesData = await fetchLocalGuidesData(profileUrl);
      
      // Calculate XP from Local Guides achievements
      const currentUser = await storage.getUser(req.user.id);
      const localGuidesXP = calculateLocalGuidesXP(localGuidesData);
      const previousLocalGuidesXP = currentUser?.localGuidesUrl ? calculateLocalGuidesXP(currentUser) : 0;
      const xpGain = localGuidesXP - previousLocalGuidesXP;

      const sampleData = {
        localGuidesUrl: profileUrl,
        ...localGuidesData,
        localGuidesLastUpdate: new Date(),
      };

      const user = await storage.updateUserLocalGuides(req.user.id, sampleData);
      
      // Update total XP separately
      const updatedUser = await storage.updateUser(req.user.id, {
        totalXP: Math.max(100, (currentUser?.totalXP || 100) + xpGain),
      });
      
      // Check and award badges for new XP level
      const newBadges = await storage.checkAndAwardBadges(req.user.id, updatedUser.totalXP);
      
      res.json({
        success: true,
        user: updatedUser,
        xpGained: xpGain,
        newBadges,
        message: "Google Local Guides profile connected successfully!"
      });
    } catch (error) {
      console.error("Error connecting Local Guides:", error);
      res.status(500).json({ error: "Failed to connect Google Local Guides profile" });
    }
  });

  app.delete("/api/user/local-guides", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const clearData = {
        localGuidesUrl: null,
        localGuidesLevel: null,
        localGuidesPoints: null,
        localGuidesReviews: null,
        localGuidesPhotos: null,
        localGuidesVideos: null,
        localGuidesEdits: null,
        localGuidesQuestions: null,
        localGuidesFacts: null,
        localGuidesRoads: null,
        localGuidesLists: null,
        localGuidesLastUpdate: null,
      };

      const user = await storage.updateUser(req.user.id, clearData as any);
      
      res.json({
        success: true,
        user,
        message: "Google Local Guides profile disconnected successfully!"
      });
    } catch (error) {
      console.error("Error disconnecting Local Guides:", error);
      res.status(500).json({ error: "Failed to disconnect Google Local Guides profile" });
    }
  });

  // Refresh Google Local Guides data
  app.post("/api/user/local-guides/refresh", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user?.localGuidesUrl) {
        return res.status(400).json({ error: "No Local Guides profile connected" });
      }

      // Fetch fresh data from Local Guides
      const { fetchLocalGuidesData, calculateLocalGuidesXP } = await import("./localGuides");
      const localGuidesData = await fetchLocalGuidesData(user.localGuidesUrl);
      
      // Calculate new XP from Local Guides data
      const localGuidesXP = calculateLocalGuidesXP(localGuidesData);
      const previousLocalGuidesXP = calculateLocalGuidesXP(user);
      const xpGain = localGuidesXP - previousLocalGuidesXP;
      
      const updatedUser = await storage.updateUserLocalGuides(user.id, {
        ...localGuidesData,
        localGuidesUrl: user.localGuidesUrl,
        localGuidesLastUpdate: new Date(),
      });

      // Update total XP separately
      await storage.updateUser(user.id, {
        totalXP: Math.max(100, (user.totalXP || 100) + xpGain),
      });

      res.json({
        success: true,
        user: updatedUser,
        message: "Local Guides data refreshed successfully!"
      });
    } catch (error) {
      console.error("Error refreshing Local Guides data:", error);
      res.status(500).json({ error: "Failed to refresh Local Guides data" });
    }
  });

  // Onboarding completion endpoint
  app.post("/api/user/onboarding-complete", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.updateUser(req.user.id, { 
        onboardingCompleted: true 
      });

      res.json({
        success: true,
        user,
        message: "Onboarding completed successfully!"
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ error: "Failed to complete onboarding" });
    }
  });

  // Flight tracking routes
  app.get("/api/flights/search", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { query } = req.query as { query: string };
      if (!query) {
        return res.status(400).json({ error: "Flight number required" });
      }

      const { flightRadarService } = await import("./flightRadar");
      const flight = await flightRadarService.searchFlight(query);
      
      if (!flight) {
        return res.status(404).json({ error: "Flight not found" });
      }

      res.json(flight);
    } catch (error) {
      console.error("Error searching flight:", error);
      res.status(500).json({ error: "Failed to search flight" });
    }
  });

  // Completely removed - inbound flights endpoint disabled as per requirements

  // Enhanced flight tracking routes
  app.get("/api/flights/:flightNumber", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { flightNumber } = req.params;
      
      const { flightRadarService } = await import("./flightRadar");
      const flight = await flightRadarService.searchFlight(flightNumber);
      
      if (!flight) {
        return res.status(404).json({ error: "Flight not found" });
      }

      res.json(flight);
    } catch (error) {
      console.error("Error fetching flight details:", error);
      res.status(500).json({ error: "Failed to fetch flight details" });
    }
  });

  app.get("/api/flights/aircraft/:tailNumber", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { tailNumber } = req.params;
      
      const { flightRadarService } = await import("./flightRadar");
      const aircraftData = await flightRadarService.getAircraftInfo(tailNumber);
      
      if (!aircraftData) {
        return res.status(404).json({ error: "Aircraft not found" });
      }

      res.json(aircraftData);
    } catch (error) {
      console.error("Error fetching aircraft data:", error);
      res.status(500).json({ error: "Failed to fetch aircraft data" });
    }
  });

  // Completely removed - inbound flights by aircraft endpoint disabled as per requirements

  app.get("/api/flights/position/:flightId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { flightId } = req.params;
      
      const { flightRadarService } = await import("./flightRadar");
      const position = await flightRadarService.getFlightPosition(flightId);
      
      if (!position) {
        return res.status(404).json({ error: "Flight position not found" });
      }

      res.json(position);
    } catch (error) {
      console.error("Error fetching flight position:", error);
      res.status(500).json({ error: "Failed to fetch flight position" });
    }
  });

  // Referral system routes
  app.get("/api/referrals/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Import referralService here to avoid circular dependencies
      const { referralService } = await import('./referralService');
      const stats = await referralService.getReferralStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  app.post("/api/referrals/generate-link", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { referralService } = await import('./referralService');
      const referralCode = await referralService.ensureReferralCode(req.user!.id);
      const referralLink = referralService.generateReferralLink(referralCode, req.get('origin'));
      
      res.json({
        referralCode,
        referralLink,
        shareMessage: `Join me on TravelQuest and start earning XP for your travels! Use my referral code: ${referralCode}`
      });
    } catch (error) {
      console.error("Error generating referral link:", error);
      res.status(500).json({ message: "Failed to generate referral link" });
    }
  });

  app.post("/api/referrals/process", async (req, res) => {
    const { referralCode, newUserId } = req.body;
    
    if (!referralCode || !newUserId) {
      return res.status(400).json({ message: "Missing referral code or user ID" });
    }
    
    try {
      const { referralService } = await import('./referralService');
      await referralService.processReferral(newUserId, referralCode);
      res.json({ success: true, message: "Referral processed successfully" });
    } catch (error) {
      console.error("Error processing referral:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to process referral" });
    }
  });

  app.post("/api/referrals/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { referralService } = await import('./referralService');
      await referralService.completeReferral(req.user!.id);
      res.json({ success: true, message: "Referral completed successfully" });
    } catch (error) {
      console.error("Error completing referral:", error);
      res.status(500).json({ message: "Failed to complete referral" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
