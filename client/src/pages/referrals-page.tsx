import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Gift, 
  Trophy,
  Zap,
  ArrowRight,
  Star,
  Target,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";
import { ReferralCard } from "@/components/ui/referral-card";
import { useReferrals } from "@/hooks/use-referrals";

export default function ReferralsPage() {
  const {
    stats,
    isLoading,
    error,
    generateLink,
    isGeneratingLink,
    generatedLink
  } = useReferrals();

  // Note: Removed automatic link generation to prevent infinite loops
  // Users can now manually generate links using the buttons in the interface

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Zap className="h-8 w-8 animate-pulse text-purple-600 mx-auto" />
          <p style={{ color: "hsl(var(--foreground))" }}>Loading your referral stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <Card className="neopop-card bg-red-50 border-red-200">
            <CardContent className="py-8 text-center">
              <p className="text-red-600">Failed to load referral system. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold" style={{ color: "hsl(var(--foreground))" }}>Invite Friends</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto text-lg"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Share TravelQuest with friends and earn <span className="text-yellow-600 font-bold">500 XP</span> for each new traveler who joins. 
            The more friends you invite, the closer you get to <span className="text-purple-600 font-bold">fulfilling your travels</span>!
          </motion.p>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="neopop-card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-center" style={{ color: "hsl(var(--foreground))" }}>
                <Gift className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                How Referrals Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>Share Your Link</h3>
                  <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Generate your unique referral link and share it with friends via WhatsApp, SMS, or social media
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>Friend Joins</h3>
                  <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Your friend creates an account using your referral link and completes their profile setup
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h3 className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>Earn XP Rewards</h3>
                  <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                    You automatically receive 500 XP that can be used for future travel perks and rewards
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Future Benefits Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="neopop-card bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-center" style={{ color: "hsl(var(--foreground))" }}>
                <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                Coming Soon: XP Travel Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p style={{ color: "hsl(var(--muted-foreground))" }}>
                  Your referral XP will soon unlock amazing travel benefits:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    <Heart className="h-3 w-3 mr-1" />
                    Hotel Discounts
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Target className="h-3 w-3 mr-1" />
                    Flight Deals
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Trophy className="h-3 w-3 mr-1" />
                    Exclusive Experiences
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Gift className="h-3 w-3 mr-1" />
                    Travel Gear
                  </Badge>
                </div>
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                  The more friends you refer, the better rewards you'll unlock!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Referral Interface */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ReferralCard
              stats={stats}
              referralLink={generatedLink}
              onGenerateLink={() => generateLink()}
              isGenerating={isGeneratingLink}
            />
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <Card className="neopop-card bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-500/30">
            <CardContent className="py-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  Ready to Fuel Your Next Adventure?
                </h3>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Every friend you invite brings you one step closer to unlocking exclusive travel rewards. 
                  Start sharing your referral link today and watch your XP grow!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={() => generateLink()}
                    disabled={isGeneratingLink}
                    className="neopop-button bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 px-8 py-3"
                  >
                    {isGeneratingLink ? (
                      <>
                        <Zap className="h-5 w-5 mr-2 animate-pulse" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Users className="h-5 w-5 mr-2" />
                        Start Inviting Friends
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}