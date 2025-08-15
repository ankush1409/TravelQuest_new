import { motion } from "framer-motion";
import { Gift, Star, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Gift className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            Rewards Store
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Redeem your XP for amazing rewards and exclusive travel benefits
          </p>
        </motion.div>

        {/* Coming Soon Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Coming Soon!</CardTitle>
              <CardDescription className="text-slate-400">
                We're building an amazing rewards store with exclusive travel benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-300 mb-6">
                Keep earning XP and stay tuned for exciting rewards including:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-white mb-1">Premium Features</h3>
                  <p className="text-sm text-slate-400">Unlock exclusive app features</p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <Gift className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-white mb-1">Travel Vouchers</h3>
                  <p className="text-sm text-slate-400">Discounts on hotels & flights</p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-white mb-1">XP Boosters</h3>
                  <p className="text-sm text-slate-400">Accelerate your progress</p>
                </div>
              </div>
              
              <Button 
                disabled
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed"
              >
                Launching Soon...
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current XP Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Your Current XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">1,250 XP</div>
                <p className="text-slate-300">Keep exploring to earn more rewards!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}