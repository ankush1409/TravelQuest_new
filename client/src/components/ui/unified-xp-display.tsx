import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Zap,
  Star,
  Globe,
  Camera,
  Edit3,
  Video,
  List,
  Route,
  HelpCircle,
  Info,
  TrendingUp,
  Award,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Link } from "wouter";

interface User {
  id: string;
  totalXP: number;
  localGuidesLevel?: number;
  localGuidesPoints?: number;
  localGuidesReviews?: number;
  localGuidesPhotos?: number;
  localGuidesVideos?: number;
  localGuidesEdits?: number;
  localGuidesQuestions?: number;
  localGuidesFacts?: number;
  localGuidesRoads?: number;
  localGuidesLists?: number;
  localGuidesUrl?: string;
  localGuidesLastUpdate?: Date;
}

interface UnifiedXPDisplayProps {
  user: User;
  recentXpGain?: number;
}

// XP calculation function (matching server-side)
const calculateLocalGuidesXP = (user: User) => {
  const baseXP = 
    (user.localGuidesPoints || 0) * 1 +
    (user.localGuidesReviews || 0) * 10 +
    (user.localGuidesPhotos || 0) * 5 +
    (user.localGuidesVideos || 0) * 15 +
    (user.localGuidesEdits || 0) * 8 +
    (user.localGuidesQuestions || 0) * 12 +
    (user.localGuidesFacts || 0) * 6 +
    (user.localGuidesRoads || 0) * 20 +
    (user.localGuidesLists || 0) * 25;
  
  const levelBonus = (user.localGuidesLevel || 0) * 500;
  return baseXP + levelBonus;
};

// Calculate level from total XP
const calculateLevelFromXP = (xp: number) => {
  return Math.floor(xp / 1000) + 1;
};

const getXPForLevel = (level: number) => {
  return (level - 1) * 1000;
};

export function UnifiedXPDisplay({ user, recentXpGain = 0 }: UnifiedXPDisplayProps) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  const totalXP = user.totalXP || 0;
  const currentLevel = calculateLevelFromXP(totalXP);
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const xpToNextLevel = nextLevelXP - totalXP;
  const progressPercentage = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  // Calculate XP breakdown
  const localGuidesXP = user.localGuidesUrl ? calculateLocalGuidesXP(user) : 0;
  // If Local Guides XP is greater than total XP, show Local Guides as the total and TravelQuest as 0
  // This happens when Local Guides integration adds significant XP
  const adjustedTravelQuestXP = Math.max(0, totalXP - localGuidesXP);
  const adjustedLocalGuidesXP = totalXP - adjustedTravelQuestXP;
  
  // Check for level up
  useEffect(() => {
    if (recentXpGain > 0 && recentXpGain >= xpToNextLevel) {
      setShowLevelUp(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#06B6D4', '#F59E0B']
      });
      setTimeout(() => setShowLevelUp(false), 4000);
    }
  }, [recentXpGain, xpToNextLevel]);

  return (
    <div className="space-y-6">
      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <Card className="neopop-card bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-2xl">
              <CardContent className="text-center p-8">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
                <h2 className="text-3xl font-black mb-2">LEVEL UP!</h2>
                <p className="text-xl">You reached Level {currentLevel}!</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main XP Progress Card */}
      <Card className="neopop-card bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span>Level {currentLevel}</span>
                <Badge variant="secondary" className="text-xs">
                  {totalXP.toLocaleString()} XP Total
                </Badge>
              </div>
              <CardDescription className="text-base mt-1">
                {xpToNextLevel} XP to Level {currentLevel + 1}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {currentLevel}</span>
              <span>Level {currentLevel + 1}</span>
            </div>
            <Progress value={progressPercentage} className="h-4 neon-glow-purple" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentLevelXP.toLocaleString()} XP</span>
              <span className="font-medium text-foreground">{totalXP.toLocaleString()} XP</span>
              <span>{nextLevelXP.toLocaleString()} XP</span>
            </div>
          </div>

          {/* XP Sources Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TravelQuest XP */}
            <div className="flex items-center space-x-3 p-4 bg-blue-500/10 rounded-lg">
              <MapPin className="h-8 w-8 text-blue-400" />
              <div>
                <p className="font-medium text-blue-400">TravelQuest</p>
                <p className="text-2xl font-bold">{adjustedTravelQuestXP.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Adventures & Challenges</p>
              </div>
            </div>

            {/* Local Guides XP */}
            {user.localGuidesUrl ? (
              <div className="flex items-center space-x-3 p-4 bg-green-500/10 rounded-lg">
                <Globe className="h-8 w-8 text-green-400" />
                <div>
                  <p className="font-medium text-green-400">Local Guides</p>
                  <p className="text-2xl font-bold">{adjustedLocalGuidesXP.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    Level {user.localGuidesLevel} • {user.localGuidesPoints} pts
                  </p>
                </div>
              </div>
            ) : (
              <Link href="/settings">
                <div className="flex items-center space-x-3 p-4 bg-yellow-500/10 rounded-lg border-2 border-dashed border-yellow-500/30 hover:border-yellow-500/50 transition-colors cursor-pointer">
                  <Globe className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="font-medium text-yellow-400">Connect Local Guides</p>
                    <p className="text-sm text-muted-foreground">Earn bonus XP from your contributions</p>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Recent XP Gain */}
          {recentXpGain > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg"
            >
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <span className="font-medium text-purple-400">
                +{recentXpGain} XP earned recently!
              </span>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Local Guides Detailed Breakdown */}
      {user.localGuidesUrl && (
        <Card className="neopop-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Globe className="h-5 w-5 mr-2 text-primary" />
              Local Guides Contributions
            </CardTitle>
            <CardDescription>
              Your Google Maps contributions earning you XP in TravelQuest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <Edit3 className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-400">{user.localGuidesReviews || 0}</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
                <Badge variant="outline" className="text-xs">+{(user.localGuidesReviews || 0) * 10} XP</Badge>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                <Camera className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-purple-400">{user.localGuidesPhotos || 0}</p>
                <p className="text-xs text-muted-foreground">Photos</p>
                <Badge variant="outline" className="text-xs">+{(user.localGuidesPhotos || 0) * 5} XP</Badge>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <Video className="h-6 w-6 text-green-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-400">{user.localGuidesVideos || 0}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
                <Badge variant="outline" className="text-xs">+{(user.localGuidesVideos || 0) * 15} XP</Badge>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                <Route className="h-6 w-6 text-orange-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-orange-400">{user.localGuidesEdits || 0}</p>
                <p className="text-xs text-muted-foreground">Edits</p>
                <Badge variant="outline" className="text-xs">+{(user.localGuidesEdits || 0) * 8} XP</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-400" />
                <span className="text-muted-foreground">
                  Last synced: {user.localGuidesLastUpdate ? 
                    new Date(user.localGuidesLastUpdate).toLocaleDateString() : 'Never'}
                </span>
              </div>
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  Manage Connection
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}