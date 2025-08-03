import { nanoid } from 'nanoid';
import { storage } from './storage';
import type { User } from '@shared/schema';

export class ReferralService {
  /**
   * Generate a unique referral code for a user
   */
  generateReferralCode(): string {
    return `TQ-${nanoid(8).toUpperCase()}`;
  }

  /**
   * Create or get referral code for user
   */
  async ensureReferralCode(userId: string): Promise<string> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.referralCode) {
      return user.referralCode;
    }

    // Generate new referral code
    const referralCode = this.generateReferralCode();
    await storage.updateUser(userId, { 
      referralCode,
      updatedAt: new Date()
    });

    return referralCode;
  }

  /**
   * Process a referral when someone signs up with a referral code
   */
  async processReferral(newUserId: string, referralCode: string): Promise<void> {
    // Find the referrer by code
    const referrer = await storage.getUserByReferralCode(referralCode);
    if (!referrer) {
      throw new Error('Invalid referral code');
    }

    // Prevent self-referral
    if (referrer.id === newUserId) {
      throw new Error('Cannot refer yourself');
    }

    // Check if user was already referred
    const newUser = await storage.getUser(newUserId);
    if (newUser?.referredBy) {
      throw new Error('User already has a referrer');
    }

    // Create referral record
    await storage.createReferral({
      referrerId: referrer.id,
      referredUserId: newUserId,
      xpAwarded: 500,
      status: 'pending'
    });

    // Update new user's referredBy field
    await storage.updateUser(newUserId, {
      referredBy: referrer.id,
      updatedAt: new Date()
    });
  }

  /**
   * Complete a referral when the new user finishes onboarding
   */
  async completeReferral(newUserId: string): Promise<void> {
    const newUser = await storage.getUser(newUserId);
    if (!newUser?.referredBy) {
      return; // No referrer, nothing to do
    }

    // Find pending referral
    const referral = await storage.getPendingReferral(newUser.referredBy, newUserId);
    if (!referral) {
      return; // No pending referral found
    }

    // Award XP to referrer
    const referrer = await storage.getUser(newUser.referredBy);
    if (referrer) {
      const newXp = referrer.totalXP + 500;
      const newReferralXp = (referrer.referralXp || 0) + 500;
      const newReferralCount = (referrer.referralCount || 0) + 1;
      const newLevel = this.calculateLevel(newXp);

      await storage.updateUser(referrer.id, {
        totalXP: newXp,
        level: newLevel,
        referralXp: newReferralXp,
        referralCount: newReferralCount,
        updatedAt: new Date()
      });

      // Mark referral as completed
      await storage.completeReferral(referral.id);
    }
  }

  /**
   * Get referral stats for a user
   */
  async getReferralStats(userId: string): Promise<{
    referralCode: string;
    referralCount: number;
    referralXp: number;
    pendingReferrals: number;
    recentReferrals: Array<{
      id: string;
      referredUser: {
        displayName: string;
        profilePicture?: string;
      };
      xpAwarded: number;
      createdAt: Date;
      status: string;
    }>;
  }> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Ensure user has a referral code
    const referralCode = await this.ensureReferralCode(userId);

    // Get recent referrals
    const recentReferrals = await storage.getUserReferrals(userId);

    // Count pending referrals
    const pendingReferrals = recentReferrals.filter(r => r.status === 'pending').length;

    return {
      referralCode,
      referralCount: user.referralCount || 0,
      referralXp: user.referralXp || 0,
      pendingReferrals,
      recentReferrals: recentReferrals.map(r => ({
        id: r.id,
        referredUser: {
          displayName: r.referredUser?.displayName || 'Unknown',
          profilePicture: r.referredUser?.profilePicture,
        },
        xpAwarded: r.xpAwarded || 500,
        createdAt: r.createdAt,
        status: r.status || 'pending'
      }))
    };
  }

  /**
   * Generate shareable referral link
   */
  generateReferralLink(referralCode: string, baseUrl?: string): string {
    const base = baseUrl || 'https://travelquest.replit.app';
    return `${base}/auth?ref=${referralCode}`;
  }

  /**
   * Calculate user level based on XP (matches existing XP system)
   */
  private calculateLevel(xp: number): number {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    return 5;
  }

  /**
   * Get referral milestones and progress
   */
  getReferralMilestones(referralCount: number): {
    current: { count: number; reward: string; completed: boolean };
    next: { count: number; reward: string; progress: number } | null;
    milestones: Array<{ count: number; reward: string; completed: boolean }>;
  } {
    const milestones = [
      { count: 1, reward: "First Friend Badge", completed: referralCount >= 1 },
      { count: 5, reward: "Social Butterfly Badge", completed: referralCount >= 5 },
      { count: 10, reward: "Community Builder Badge", completed: referralCount >= 10 },
      { count: 25, reward: "Travel Ambassador Badge", completed: referralCount >= 25 },
      { count: 50, reward: "Elite Recruiter Badge", completed: referralCount >= 50 },
    ];

    const current = milestones.find(m => m.completed && referralCount >= m.count) || milestones[0];
    const next = milestones.find(m => !m.completed);

    return {
      current,
      next: next ? {
        ...next,
        progress: (referralCount / next.count) * 100
      } : null,
      milestones
    };
  }
}

export const referralService = new ReferralService();