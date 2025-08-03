import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MapPin, 
  Medal, 
  Users, 
  TrendingUp,
  Camera,
  Mountain,
  Waves,
  Building,
  LogOut,
  Menu,
  User,
  Settings
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const currentLevel = Math.floor(user.totalXP / 100);
  const xpInCurrentLevel = user.totalXP % 100;
  const xpToNextLevel = 100 - xpInCurrentLevel;
  const progressPercentage = (xpInCurrentLevel / 100) * 100;

  const getTravelStyleEmoji = (style: string) => {
    switch (style) {
      case "SOLO": return "🎒";
      case "FAMILY": return "👨‍👩‍👧‍👦";
      case "COUPLE": return "💑";
      case "BUSINESS": return "💼";
      case "BACKPACKER": return "🏕️";
      default: return "🎒";
    }
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">
                  <MapPin className="inline-block mr-2" />
                  TravelQuest
                </h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Profile
              </Link>
              <Link href="/challenges" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Challenges
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                  <p className="text-xs text-gray-500">Level {currentLevel} Explorer</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={user.profilePicture || ""} alt={user.displayName} />
                  <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-primary rounded-md text-base font-medium">
                Dashboard
              </Link>
              <Link href="/profile" className="block px-3 py-2 text-gray-700 hover:text-primary rounded-md text-base font-medium">
                Profile
              </Link>
              <Link href="/challenges" className="block px-3 py-2 text-gray-700 hover:text-primary rounded-md text-base font-medium">
                Challenges
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Welcome Header */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-primary to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      Welcome back, {user.displayName}! 🌍
                    </h1>
                    <p className="text-blue-100">Ready for your next adventure? You're doing amazing!</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-center">
                    <div className="text-3xl font-bold">{currentLevel}</div>
                    <div className="text-sm text-blue-200">Current Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Star className="text-primary text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{user.totalXP}</p>
                    <p className="text-sm text-gray-600">Total XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="text-secondary text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600">Places Visited</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Medal className="text-accent text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600">Badges Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="text-purple-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600">Following</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Level Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Level {currentLevel} → Level {currentLevel + 1}
                  </span>
                  <span className="text-sm text-gray-500">{xpToNextLevel} XP to go</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{currentLevel * 100} XP</span>
                  <span>{(currentLevel + 1) * 100} XP</span>
                </div>
              </CardContent>
            </Card>

            {/* Travel Style Badge */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Travel Style</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">{getTravelStyleEmoji(user.travelStyle)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{getTravelStyleName(user.travelStyle)}</h4>
                    <p className="text-sm text-gray-600">Independent adventurer seeking unique experiences</p>
                    <Button variant="link" className="text-primary hover:text-blue-700 text-sm font-medium mt-1 p-0">
                      Change Style
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Challenges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <Button variant="link" className="text-primary hover:text-blue-700 text-sm font-medium">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Start your journey to see your progress here!</p>
                </div>
              </CardContent>
            </Card>

            {/* Active Challenges */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Active Challenges</CardTitle>
                  <Button variant="link" className="text-primary hover:text-blue-700 text-sm font-medium">
                    Browse All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Medal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active challenges</p>
                  <p className="text-sm text-gray-400">Join challenges to earn XP and unlock achievements!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
