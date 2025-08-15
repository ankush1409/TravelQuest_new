import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function SimpleDashboard() {

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