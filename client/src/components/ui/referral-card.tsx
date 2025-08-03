import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Share2, 
  Copy, 
  MessageSquare, 
  Users, 
  Gift, 
  Trophy,
  ExternalLink,
  Check,
  Star,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ReferralStats {
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
    createdAt: string;
    status: string;
  }>;
}

interface ReferralLink {
  referralCode: string;
  referralLink: string;
  shareMessage: string;
}

interface ReferralCardProps {
  stats: ReferralStats;
  referralLink: ReferralLink;
  onGenerateLink: () => void;
  isGenerating: boolean;
}

export function ReferralCard({ stats, referralLink, onGenerateLink, isGenerating }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState<'link' | 'code'>('link');
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the text manually",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(referralLink.shareMessage);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(referralLink.shareMessage);
    window.open(`sms:?body=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join TravelQuest with me!");
    const body = encodeURIComponent(referralLink.shareMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  // Calculate next milestone
  const milestones = [
    { count: 1, reward: "First Friend Badge", xp: 500 },
    { count: 5, reward: "Social Butterfly", xp: 2500 },
    { count: 10, reward: "Community Builder", xp: 5000 },
    { count: 25, reward: "Travel Ambassador", xp: 12500 },
    { count: 50, reward: "Elite Recruiter", xp: 25000 },
  ];

  const currentMilestone = milestones.find(m => stats.referralCount < m.count);
  const progress = currentMilestone ? (stats.referralCount / currentMilestone.count) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Main Referral Stats Card */}
      <Card className="neopop-card bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Invite Friends</h3>
              <p className="text-gray-400 text-sm font-normal">
                Earn 500 XP for each friend who joins and completes onboarding
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* XP Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="display-number text-yellow-400 text-2xl font-bold">
                {stats.referralXp.toLocaleString()}
              </div>
              <p className="text-yellow-300 text-sm">Total XP Earned</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="display-number text-green-400 text-2xl font-bold">
                {stats.referralCount}
              </div>
              <p className="text-green-300 text-sm">Friends Joined</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="display-number text-blue-400 text-2xl font-bold">
                {stats.pendingReferrals}
              </div>
              <p className="text-blue-300 text-sm">Pending</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="display-number text-purple-400 text-2xl font-bold">
                500
              </div>
              <p className="text-purple-300 text-sm">XP per Referral</p>
            </div>
          </div>

          {/* Next Milestone */}
          {currentMilestone && (
            <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-600/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  Next Milestone: {currentMilestone.reward}
                </h4>
                <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                  {currentMilestone.count - stats.referralCount} more needed
                </Badge>
              </div>
              <Progress value={progress} className="h-2 mb-2" />
              <p className="text-gray-400 text-sm">
                {stats.referralCount}/{currentMilestone.count} friends • +{currentMilestone.xp.toLocaleString()} XP reward
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Your Link Card */}
      <Card className="neopop-card bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            Share Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Share Type Toggle */}
          <div className="flex gap-2">
            <Button
              variant={shareType === 'link' ? 'default' : 'outline'}
              onClick={() => setShareType('link')}
              className="neopop-button flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button
              variant={shareType === 'code' ? 'default' : 'outline'}
              onClick={() => setShareType('code')}
              className="neopop-button flex-1"
            >
              <Star className="h-4 w-4 mr-2" />
              Share Code
            </Button>
          </div>

          {/* Generate Link Button */}
          {!referralLink && (
            <Button
              onClick={onGenerateLink}
              disabled={isGenerating}
              className="neopop-button w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              {isGenerating ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Generate Referral Link
                </>
              )}
            </Button>
          )}

          {/* Share Content */}
          {referralLink && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Link/Code Display */}
                <div className="flex gap-2">
                  <Input
                    value={shareType === 'link' ? referralLink.referralLink : referralLink.referralCode}
                    readOnly
                    className="flex-1 bg-gray-800/50 border-gray-600 text-white font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(
                      shareType === 'link' ? referralLink.referralLink : referralLink.referralCode,
                      shareType === 'link' ? 'Link' : 'Code'
                    )}
                    className="neopop-button px-4"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Share Message Preview */}
                <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-600/30">
                  <p className="text-gray-300 text-sm italic">
                    "{referralLink.shareMessage}"
                  </p>
                </div>

                {/* Share Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button
                    onClick={shareViaWhatsApp}
                    className="neopop-button bg-green-600/20 hover:bg-green-600/30 border-green-500/30"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={shareViaSMS}
                    className="neopop-button bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    onClick={shareViaEmail}
                    className="neopop-button bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      {stats.recentReferrals.length > 0 && (
        <Card className="neopop-card bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              Recent Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentReferrals.slice(0, 5).map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-600/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {referral.referredUser.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{referral.referredUser.displayName}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        referral.status === 'completed'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }
                    >
                      {referral.status === 'completed' ? '+500 XP' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}