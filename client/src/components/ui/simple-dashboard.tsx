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
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400"
    },
    {
      title: "Locations",
      value: userData.locations.toString(),
      subtitle: "Places Visited",
      icon: MapPin,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-400"
    },
    {
      title: "Challenges",
      value: userData.challenges.toString(),
      subtitle: "Completed",
      icon: Trophy,
      gradient: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      iconColor: "text-yellow-400"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Header with Travel Background */}
      <motion.div 
        className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 border border-primary/20"
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
                className="text-3xl md:text-4xl font-black text-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome back, {userData.name}! 
                <Sparkles className="inline-block w-8 h-8 ml-2 text-primary animate-pulse" />
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
              
              <p className="text-muted-foreground text-lg">
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
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(139, 92, 246, 0.3)",
                      "0 0 30px rgba(139, 92, 246, 0.6)",
                      "0 0 20px rgba(139, 92, 246, 0.3)"
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
              <Badge variant="secondary" className="mt-2 font-semibold">
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
              <span className="text-muted-foreground">Level {userData.level}</span>
              <span className="text-muted-foreground">Level {userData.level + 1}</span>
            </div>
            <Progress value={userData.levelProgress} className="h-3 bg-muted" />
            <div className="text-center">
              <span className="text-sm font-medium text-primary">
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
            <Card className="neopop-card group cursor-pointer overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className={`p-3 rounded-2xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {card.title}
                    </h3>
                    <motion.div 
                      className="text-3xl font-black text-foreground"
                      initial={{ scale: 1 }}
                      whileInView={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    >
                      {card.value}
                    </motion.div>
                    <p className="text-xs text-muted-foreground">
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
        <Card className="neopop-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Current Streak</span>
              <Badge variant="secondary" className="ml-auto">
                {userData.streak} days
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Progress value={(userData.streak / 7) * 100} className="h-2" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {7 - userData.streak} days to weekly badge
              </span>
            </div>
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
          <Card className="neopop-card group cursor-pointer bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    Start a New Journey
                  </h3>
                  <p className="text-muted-foreground">
                    Discover amazing places nearby
                  </p>
                </div>
                <motion.div
                  className="p-3 bg-primary rounded-full group-hover:bg-accent transition-colors duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Navigation className="h-6 w-6 text-white" />
                </motion.div>
              </div>
              <Button className="w-full mt-4 premium-button">
                Explore Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mini Map Preview */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="neopop-card group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">
                    Recent Locations
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    3 new places discovered
                  </p>
                </div>
                <Globe className="h-6 w-6 text-primary group-hover:text-accent transition-colors duration-300" />
              </div>
              
              {/* Mock recent locations */}
              <div className="space-y-2">
                {[
                  { name: "Central Park", xp: "+25 XP" },
                  { name: "Brooklyn Bridge", xp: "+30 XP" },
                  { name: "Times Square", xp: "+20 XP" }
                ].map((location, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{location.name}</span>
                    <Badge variant="outline" className="text-primary">
                      {location.xp}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                View Map
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}