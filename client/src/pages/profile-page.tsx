import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Star, 
  MapPin, 
  Medal, 
  Edit,
  Save,
  X,
  Trophy,
  Calendar,
  Target
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Badge as BadgeType, UserBadge } from "@shared/schema";

export default function ProfilePage() {
  const { user, updateProfileMutation } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || "",
    bio: user?.bio || "",
    travelStyle: user?.travelStyle || "SOLO",
  });

  // Fetch user badges
  const { data: userBadges = [], isLoading: badgesLoading } = useQuery<(UserBadge & { badge: BadgeType })[]>({
    queryKey: ["/api/user/badges"],
    queryFn: getQueryFn(),
    enabled: !!user,
  });

  // Fetch all badges to show unearned ones
  const { data: allBadges = [] } = useQuery<BadgeType[]>({
    queryKey: ["/api/badges"],
    queryFn: getQueryFn(),
  });

  if (!user) return null;

  const currentLevel = user.level;
  const currentLevelXP = (currentLevel - 1) * 1000;
  const nextLevelXP = currentLevel * 1000;
  const xpInCurrentLevel = user.totalXP - currentLevelXP;
  const xpToNextLevel = nextLevelXP - user.totalXP;
  const progressPercentage = (xpInCurrentLevel / 1000) * 100;

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
  const unearnedBadges = allBadges.filter(badge => !earnedBadgeIds.has(badge.id));

  const handleSave = () => {
    updateProfileMutation.mutate(editForm, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  const handleCancel = () => {
    setEditForm({
      displayName: user.displayName,
      bio: user.bio || "",
      travelStyle: user.travelStyle,
    });
    setIsEditing(false);
  };

  const getTravelStyleName = (style: string) => {
    switch (style) {
      case "SOLO": return "Solo Explorer";
      case "FAMILY": return "Family Adventures";
      case "COUPLE": return "Couple Getaways";
      case "BUSINESS": return "Business Travel";
      case "BACKPACKER": return "Backpacker";
      default: return "Solo Explorer";
    }
  };

  const getBadgeCategoryColor = (category: string) => {
    switch (category) {
      case "MILESTONE": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "EXPLORATION": return "bg-blue-100 text-blue-800 border-blue-200";
      case "SOCIAL": return "bg-purple-100 text-purple-800 border-purple-200";
      case "SPECIAL": return "bg-red-100 text-red-800 border-red-200";
      case "SEASONAL": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">
                <MapPin className="inline-block mr-2" />
                TravelQuest
              </h1>
            </div>
            <Button variant="ghost" onClick={() => window.history.back()}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
                <div className="flex-shrink-0 mb-6 md:mb-0">
                  <Avatar className="h-24 w-24 border-4 border-primary">
                    <AvatarImage src={user.profilePicture || ""} alt={user.displayName} />
                    <AvatarFallback className="text-2xl">{user.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1">
                  {!isEditing ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-3xl font-bold text-gray-900">{user.displayName}</h2>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="text-lg text-gray-600">@{user.username}</span>
                        <Badge variant="secondary">{getTravelStyleName(user.travelStyle)}</Badge>
                        <div className="flex items-center text-primary">
                          <Trophy className="h-4 w-4 mr-1" />
                          <span className="font-semibold">Level {currentLevel}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{user.bio || "No bio yet. Add one to tell others about your travel interests!"}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={editForm.displayName}
                          onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="travelStyle">Travel Style</Label>
                        <Select 
                          value={editForm.travelStyle} 
                          onValueChange={(value) => setEditForm({ ...editForm, travelStyle: value as any })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SOLO">🎒 Solo Explorer</SelectItem>
                            <SelectItem value="FAMILY">👨‍👩‍👧‍👦 Family Adventures</SelectItem>
                            <SelectItem value="COUPLE">💑 Couple Getaways</SelectItem>
                            <SelectItem value="BUSINESS">💼 Business Travel</SelectItem>
                            <SelectItem value="BACKPACKER">🏕️ Backpacker</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          placeholder="Tell us about your travel interests..."
                          className="mt-1 resize-none"
                          rows={3}
                          maxLength={500}
                        />
                        <p className="text-gray-500 text-xs mt-1">Maximum 500 characters</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* XP Progress */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Star className="h-5 w-5 mr-2 text-primary" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Level {currentLevel} → Level {currentLevel + 1}
                </span>
                <span className="text-sm text-gray-500">
                  {xpToNextLevel} XP to go
                </span>
              </div>
              <Progress value={progressPercentage} className="h-4" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{currentLevelXP} XP</span>
                <span className="font-medium">{user.totalXP} XP</span>
                <span>{nextLevelXP} XP</span>
              </div>
            </CardContent>
          </Card>

          {/* Badge Showcase */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Medal className="h-5 w-5 mr-2 text-primary" />
                Badge Collection ({userBadges.length} earned)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badgesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading badges...</p>
                </div>
              ) : (
                <>
                  {/* Earned Badges */}
                  {userBadges.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Earned Badges</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {userBadges.map((userBadge) => (
                          <div key={userBadge.id} className="group relative">
                            <Card className="text-center p-4 hover:shadow-lg transition-shadow border-2 border-green-200 bg-green-50">
                              <CardContent className="p-0">
                                <div className="text-3xl mb-2">{userBadge.badge.icon}</div>
                                <h5 className="font-semibold text-sm text-gray-900 mb-1">
                                  {userBadge.badge.name}
                                </h5>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs mb-2 ${getBadgeCategoryColor(userBadge.badge.category)}`}
                                >
                                  {userBadge.badge.category.toLowerCase()}
                                </Badge>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {userBadge.badge.description}
                                </p>
                                <div className="flex items-center justify-center mt-2 text-xs text-green-600">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(userBadge.earnedAt).toLocaleDateString()}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unearned Badges */}
                  {unearnedBadges.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Available Badges</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {unearnedBadges.map((badge) => (
                          <div key={badge.id} className="group relative">
                            <Card className="text-center p-4 hover:shadow-lg transition-shadow border-2 border-gray-200 bg-gray-50 opacity-75">
                              <CardContent className="p-0">
                                <div className="text-3xl mb-2 grayscale">{badge.icon}</div>
                                <h5 className="font-semibold text-sm text-gray-700 mb-1">
                                  {badge.name}
                                </h5>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs mb-2 bg-gray-100 text-gray-600 border-gray-300"
                                >
                                  {badge.category.toLowerCase()}
                                </Badge>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                  {badge.description}
                                </p>
                                <div className="flex items-center justify-center text-xs text-gray-500">
                                  <Target className="h-3 w-3 mr-1" />
                                  {badge.criteria}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {allBadges.length === 0 && (
                    <div className="text-center py-8">
                      <Medal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No badges available yet.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}