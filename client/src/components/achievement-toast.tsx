import { Trophy, Star, Medal, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Badge as BadgeType } from "@shared/schema";

interface AchievementToastProps {
  type: "xp" | "level" | "badge" | "challenge";
  data: {
    xpGained?: number;
    newLevel?: number;
    badge?: BadgeType;
    challengeTitle?: string;
  };
  onClose: () => void;
}

export function AchievementToast({ type, data, onClose }: AchievementToastProps) {
  const getIcon = () => {
    switch (type) {
      case "xp": return <Star className="h-6 w-6 text-yellow-500" />;
      case "level": return <Zap className="h-6 w-6 text-blue-500" />;
      case "badge": return <Medal className="h-6 w-6 text-orange-500" />;
      case "challenge": return <Trophy className="h-6 w-6 text-green-500" />;
      default: return <Star className="h-6 w-6 text-primary" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "xp": return `+${data.xpGained} XP Earned!`;
      case "level": return `Level Up! Level ${data.newLevel}`;
      case "badge": return "New Badge Unlocked!";
      case "challenge": return "Challenge Completed!";
      default: return "Achievement Unlocked!";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "xp": return "Great job! Keep exploring to earn more XP.";
      case "level": return "You've reached a new level! Your adventure continues.";
      case "badge": return data.badge ? data.badge.description : "You've earned a new badge!";
      case "challenge": return data.challengeTitle ? `Completed: ${data.challengeTitle}` : "Amazing work on completing this challenge!";
      default: return "Congratulations on your achievement!";
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "xp": return "bg-gradient-to-r from-yellow-400 to-orange-500";
      case "level": return "bg-gradient-to-r from-blue-400 to-purple-500";
      case "badge": return "bg-gradient-to-r from-orange-400 to-red-500";
      case "challenge": return "bg-gradient-to-r from-green-400 to-teal-500";
      default: return "bg-gradient-to-r from-primary to-blue-500";
    }
  };

  return (
    <Card className="max-w-sm shadow-lg border-0 overflow-hidden animate-in slide-in-from-right duration-300">
      <div className={`${getBgColor()} p-1`}>
        <CardContent className="bg-white p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 rounded-full bg-gray-100">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {getTitle()}
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                {getDescription()}
              </p>
              
              {data.badge && (
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg">{data.badge.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{data.badge.name}</div>
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      {data.badge.category.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-xs h-6 px-2 ml-auto"
              >
                Awesome!
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}