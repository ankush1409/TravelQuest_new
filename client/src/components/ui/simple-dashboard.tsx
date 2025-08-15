import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, MapPin, Trophy, Users, Settings, X } from "lucide-react";
import { useState } from "react";

export function SimpleDashboard() {
  const [isCustomizing, setIsCustomizing] = useState(false);

  const quickActions = [
    { id: 'checkin', label: 'Check In', icon: <MapPin className="w-5 h-5" />, color: 'bg-blue-500' },
    { id: 'challenge', label: 'Challenge', icon: <Trophy className="w-5 h-5" />, color: 'bg-purple-500' },
    { id: 'explore', label: 'Explore', icon: <Users className="w-5 h-5" />, color: 'bg-green-500' },
    { id: 'rewards', label: 'Rewards', icon: <Zap className="w-5 h-5" />, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Dashboard Header */}
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground font-medium">Welcome back to your travel adventure!</p>
        </div>
        <Button
          variant={isCustomizing ? "destructive" : "ghost"}
          onClick={() => setIsCustomizing(!isCustomizing)}
          className={`premium-button flex items-center space-x-2 ${
            isCustomizing ? 'premium-button-secondary' : ''
          }`}
        >
          {isCustomizing ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          <span>{isCustomizing ? 'Done' : 'Customize'}</span>
        </Button>
      </motion.div>

      {/* Premium Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className={`premium-button w-full h-20 flex flex-col items-center justify-center space-y-2 ${action.color} text-white border-0`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {action.icon}
                    </motion.div>
                    <span className="text-xs font-semibold">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Total XP</h3>
              <div className="display-number">1,250</div>
              <p className="text-sm text-muted-foreground">Level 8 Explorer</p>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Locations</h3>
              <div className="display-number">24</div>
              <p className="text-sm text-muted-foreground">Places Visited</p>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Challenges</h3>
              <div className="display-number">7</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}