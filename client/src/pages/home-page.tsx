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
  Settings,
  Plus,
  Zap
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // XP earning mutation
  const earnXPMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/user/xp", { amount });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Show XP notification
      toast({
        title: `+${data.xpGained} XP Earned! ⭐`,
        description: `Total XP: ${data.user.totalXP} (Level ${data.user.level})`,
      });

      // Show badge notifications
      if (data.newBadges && data.newBadges.length > 0) {
        setTimeout(() => {
          data.newBadges.forEach((badge: any, index: number) => {
            setTimeout(() => {
              toast({
                title: `🏆 New Badge: ${badge.name}!`,
                description: badge.description,
              });
            }, index * 1500);
          });
        }, 1000);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to earn XP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const currentLevel = user.level;
  const currentLevelXP = (currentLevel - 1) * 1000;
  const nextLevelXP = currentLevel * 1000;
  const xpInCurrentLevel = user.totalXP - currentLevelXP;
  const xpToNextLevel = nextLevelXP - user.totalXP;
  const progressPercentage = (xpInCurrentLevel / 1000) * 100;

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="neopop-card sticky top-0 z-40 border-0 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  <MapPin className="inline-block mr-2 text-primary" />
                  TravelQuest
                </h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              <Link href="/" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Profile
              </Link>
              <Link href="/challenges" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Challenges
              </Link>
              <Link href="/map" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Map & Check-ins
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-foreground">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">Level {currentLevel} Explorer</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary neon-glow-pink">
                  <AvatarImage src={user.profilePicture || ""} alt={user.displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                    {user.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="hover:bg-destructive/10 hover:text-destructive"
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
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-primary bg-primary/10 rounded-md text-base font-medium">
                Dashboard
              </Link>
              <Link href="/profile" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md text-base font-medium">
                Profile
              </Link>
              <Link href="/challenges" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md text-base font-medium">
                Challenges
              </Link>
              <Link href="/map" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md text-base font-medium">
                Map & Check-ins
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
            <div className="neopop-card gradient-animated p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="display-number">{currentLevel}</div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">
                    Welcome back, {user.displayName}!
                  </h1>
                  <p className="text-muted-foreground text-lg">Ready for your next adventure? Level up your journey!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="neopop-card p-6 text-center neon-glow-pink">
              <div className="mb-2">
                <Star className="h-8 w-8 mx-auto text-primary" />
              </div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent">
                {user.totalXP}
              </div>
              <div className="text-xs text-muted-foreground font-medium">TOTAL XP</div>
            </div>

            <div className="neopop-card p-6 text-center neon-glow-cyan">
              <div className="mb-2">
                <MapPin className="h-8 w-8 mx-auto text-accent" />
              </div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-accent to-primary">
                0
              </div>
              <div className="text-xs text-muted-foreground font-medium">PLACES VISITED</div>
            </div>

            <div className="neopop-card p-6 text-center neon-glow-yellow">
              <div className="mb-2">
                <Medal className="h-8 w-8 mx-auto text-yellow-400" />
              </div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-400">
                0
              </div>
              <div className="text-xs text-muted-foreground font-medium">BADGES EARNED</div>
            </div>

            <div className="neopop-card p-6 text-center">
              <div className="mb-2">
                <Users className="h-8 w-8 mx-auto text-green-400" />
              </div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-emerald-400">
                0
              </div>
              <div className="text-xs text-muted-foreground font-medium">FOLLOWING</div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Level Progress */}
            <div className="neopop-card p-6">
              <div className="mb-4">
                <h3 className="text-lg font-black text-foreground">LEVEL PROGRESS</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-foreground">
                    LEVEL {currentLevel} → LEVEL {currentLevel + 1}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">{xpToNextLevel} XP TO GO</span>
                </div>
                <div className="neopop-progress" style={{width: '100%'}}>
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out"
                    style={{width: `${progressPercentage}%`}}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>{currentLevelXP} XP</span>
                  <span>{nextLevelXP} XP</span>
                </div>
              </div>
            </div>

            {/* Travel Style Badge */}
            <div className="neopop-card p-6">
              <div className="mb-4">
                <h3 className="text-lg font-black text-foreground">TRAVEL STYLE</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center border border-primary/30">
                  <span className="text-2xl">{getTravelStyleEmoji(user.travelStyle)}</span>
                </div>
                <div>
                  <h4 className="font-black text-foreground">{getTravelStyleName(user.travelStyle)}</h4>
                  <p className="text-sm text-muted-foreground font-medium">Independent adventurer seeking unique experiences</p>
                  <button className="text-primary hover:text-accent text-sm font-bold mt-1 transition-colors">
                    CHANGE STYLE →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Challenges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* XP Activities */}
            <div className="neopop-card p-6">
              <div className="mb-6">
                <h3 className="text-lg font-black text-foreground flex items-center">
                  <Zap className="h-6 w-6 mr-2 text-accent" />
                  EARN XP ACTIVITIES
                </h3>
              </div>
              <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                        <Camera className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Share Travel Photo</p>
                        <p className="text-xs text-muted-foreground font-medium">Document your journey</p>
                      </div>
                    </div>
                    <button 
                      className="neopop-button"
                      onClick={() => earnXPMutation.mutate(100)}
                      disabled={earnXPMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      100 XP
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                        <Mountain className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Visit New Destination</p>
                        <p className="text-xs text-muted-foreground font-medium">Explore somewhere new</p>
                      </div>
                    </div>
                    <button 
                      className="neopop-button"
                      onClick={() => earnXPMutation.mutate(200)}
                      disabled={earnXPMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      200 XP
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                        <Building className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Cultural Experience</p>
                        <p className="text-xs text-muted-foreground font-medium">Try local food or traditions</p>
                      </div>
                    </div>
                    <button 
                      className="neopop-button"
                      onClick={() => earnXPMutation.mutate(150)}
                      disabled={earnXPMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      150 XP
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                        <Users className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Connect with Locals</p>
                        <p className="text-xs text-muted-foreground font-medium">Make new travel friends</p>
                      </div>
                    </div>
                    <button 
                      className="neopop-button"
                      onClick={() => earnXPMutation.mutate(300)}
                      disabled={earnXPMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      300 XP
                    </button>
                  </div>

                  {earnXPMutation.isPending && (
                    <div className="text-center py-4">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-sm font-bold text-primary">EARNING XP...</p>
                    </div>
                  )}
                </div>
            </div>

            {/* Active Challenges */}
            <div className="neopop-card p-6">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-black text-foreground">ACTIVE CHALLENGES</h3>
                <button className="text-primary hover:text-accent text-sm font-bold transition-colors">
                  BROWSE ALL →
                </button>
              </div>
              <div className="text-center py-8">
                <Medal className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium">No active challenges</p>
                <p className="text-sm text-muted-foreground/80 mt-1">Join challenges to earn XP and unlock achievements!</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 neopop-card border-0 rounded-none border-t border-border">
        <div className="grid grid-cols-4 gap-1 p-4 safe-area-pb">
          <Link 
            href="/" 
            className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-primary/10 border border-primary/20"
          >
            <div className="w-6 h-6 text-primary">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-primary">HOME</span>
          </Link>
          
          <Link 
            href="/profile" 
            className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-6 h-6 text-muted-foreground">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-medium text-muted-foreground">PROFILE</span>
          </Link>
          
          <Link 
            href="/challenges" 
            className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-6 h-6 text-muted-foreground">
              <Medal className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">CHALLENGES</span>
          </Link>
          
          <Link 
            href="/map" 
            className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-6 h-6 text-muted-foreground">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">MAP</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
