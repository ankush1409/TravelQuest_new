import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  TrendingUp,
  Compass,
  Calendar,
  Award,
  Globe,
  Sparkles,
  Navigation
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function SimpleDashboard() {
  const { user } = useAuth();
  
  // Mock user data for demonstration - in production this would come from API
  const userData = {
    name: user?.email?.split('@')[0] || 'Traveler',
    totalXP: 1250,
    level: 8,
    levelProgress: 75, // percentage to next level
    xpToNextLevel: 150,
    locations: 24,
    challenges: 7,
    streak: 5,
    recentXPGain: 50
  };

  const statsCards = [
    {
      title: "Total XP",
      value: userData.totalXP.toLocaleString(),
      subtitle: `Level ${userData.level} Explorer`,
      icon: Zap,
      gradient: "xp-badge",
      bgColor: "bg-red-50 border-red-100",
      iconColor: "text-red-600",
      textColor: "text-red-900"
    },
    {
      title: "Locations",
      value: userData.locations.toString(),
      subtitle: "Places Visited",
      icon: MapPin,
      gradient: "location-badge",
      bgColor: "bg-blue-50 border-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-900"
    },
    {
      title: "Challenges",
      value: userData.challenges.toString(),
      subtitle: "Completed",
      icon: Trophy,
      gradient: "challenge-badge",
      bgColor: "bg-yellow-50 border-yellow-100",
      iconColor: "text-yellow-600",
      textColor: "text-yellow-900"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Header with Travel Background */}
      <motion.div 
        className="relative overflow-hidden rounded-lg p-8 border menu-gradient"
        style={{
          borderColor: "hsl(var(--border))",
          boxShadow: "var(--shadow-md)"
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-4 left-8 w-12 h-12 rounded-full bg-primary"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-6 right-12 w-8 h-8 rounded-full bg-accent"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-6 h-6 rounded-full bg-primary"
            animate={{
              y: [0, -10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <motion.h1 
                className="text-3xl md:text-4xl font-black text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome back, {userData.name}! 
                <Sparkles className="inline-block w-8 h-8 ml-2 text-yellow-400 animate-pulse" />
              </motion.h1>
              
              {userData.recentXPGain > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-lg font-semibold text-green-500">
                    +{userData.recentXPGain} XP earned since last week!
                  </span>
                </motion.div>
              )}
              
              <p className="text-lg text-white opacity-90">
                Your next adventure awaits. Ready to explore?
              </p>
            </div>

            {/* Level Badge with Effects */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <motion.div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--gradient-primary)",
                    boxShadow: "var(--shadow-lg)"
                  }}
                  animate={{
                    boxShadow: [
                      "var(--shadow-lg)",
                      "0 0 30px hsl(var(--primary) / 0.6)",
                      "var(--shadow-lg)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-2xl font-black text-white">{userData.level}</span>
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <Star className="w-4 h-4 text-white" />
                </motion.div>
              </div>
              <Badge variant="secondary" className="mt-2 font-semibold" style={{ 
                color: "hsl(var(--foreground))",
                backgroundColor: "hsl(var(--muted))"
              }}>
                Level {userData.level} Explorer
              </Badge>
            </motion.div>
          </div>

          {/* Progress Bar for Next Level */}
          <motion.div
            className="mt-6 space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-between text-sm">
              <span className="text-white opacity-80">Level {userData.level}</span>
              <span className="text-white opacity-80">Level {userData.level + 1}</span>
            </div>
            <Progress 
              value={userData.levelProgress} 
              className="h-3 progress-bar" 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
            />
            <div className="text-center">
              <span className="text-sm font-bold text-white">
                {userData.xpToNextLevel} XP to next level
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Stats Cards with Hover Effects */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              transition: { type: "spring", stiffness: 300 }
            }}
          >
            <Card className={`group cursor-pointer overflow-hidden ${card.bgColor} border-0`}
                  style={{ boxShadow: "var(--shadow-md)" }}>
              <CardContent className="p-8">
                <div className="flex items-center space-x-6">
                  <motion.div 
                    className="p-4 rounded-2xl bg-white shadow-sm group-hover:scale-105 transition-transform duration-300 border border-white/50"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <card.icon className={`h-8 w-8 ${card.iconColor}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {card.title}
                    </h3>
                    <motion.div 
                      className="text-4xl font-black mb-1"
                      style={{ color: "hsl(var(--foreground))" }}
                      initial={{ scale: 1 }}
                      whileInView={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    >
                      {card.value}
                    </motion.div>
                    <p className="text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Streak Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
              style={{ boxShadow: "var(--shadow-md)" }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Current Streak</span>
              </div>
              <Badge className="bg-green-500 hover:bg-green-500 text-white font-bold px-3 py-1">
                {userData.streak} days
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span style={{ color: "hsl(var(--foreground))" }}>Progress to weekly badge</span>
                <span style={{ color: "hsl(var(--foreground))" }}>{userData.streak}/7 days</span>
              </div>
              <Progress 
                value={(userData.streak / 7) * 100} 
                className="h-3 progress-bar" 
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                }}
              />
            </div>
            <p className="text-sm font-medium text-white opacity-90">
              {7 - userData.streak} more days to earn your weekly badge!
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Call-to-Action Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {/* Start New Journey */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="menu-gradient group cursor-pointer border-0"
                style={{ boxShadow: "var(--shadow-md)" }}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">
                    Start a New Journey
                  </h3>
                  <p className="font-medium text-base text-white opacity-90">
                    Discover amazing places nearby and earn XP
                  </p>
                </div>
                <motion.div
                  className="p-4 rounded-2xl shadow-lg"
                  style={{ background: "var(--gradient-primary)" }}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Navigation className="h-8 w-8 text-white" />
                </motion.div>
              </div>
              <Button className="w-full travel-button text-base py-4">
                Explore Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-blue-100 group cursor-pointer border-0"
                style={{ boxShadow: "var(--shadow-md)" }}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
                    Recent Activity
                  </h3>
                  <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
                    3 new places discovered this week
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-2xl">
                  <Globe className="h-8 w-8 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              
              {/* Recent locations with better styling */}
              <div className="space-y-4 mb-6">
                {[
                  { name: "Central Park", xp: "+25 XP", icon: "🌳" },
                  { name: "Brooklyn Bridge", xp: "+30 XP", icon: "🌉" },
                  { name: "Times Square", xp: "+20 XP", icon: "🏙️" }
                ].map((location, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{location.icon}</span>
                      <span className="font-medium" style={{ color: "hsl(var(--foreground))" }}>{location.name}</span>
                    </div>
                    <Badge className="bg-purple-500 hover:bg-purple-500 text-white font-semibold">
                      {location.xp}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-medium py-3 bg-white/80 backdrop-blur-sm transition-all duration-200"
                style={{
                  boxShadow: "0 2px 8px rgba(0, 124, 255, 0.1)",
                  borderColor: "#007cff",
                  color: "#1e40af"
                }}
              >
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}