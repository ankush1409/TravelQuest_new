import { CustomizableDashboard } from "@/components/ui/dashboard-customization";
import { Breadcrumb } from "@/components/ui/accessible-navigation";
import { motion } from "framer-motion";
import { Zap, MapPin, Trophy, Users, Sparkles } from "lucide-react";

export default function HomePage() {
  const breadcrumbItems = [
    { label: "Dashboard" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className="min-h-screen pb-20 md:pb-8"
      style={{
        background: "linear-gradient(135deg, var(--background) 0%, hsl(225, 18%, 8%) 50%, var(--background) 100%)"
      }}
      id="main-content"
    >
      {/* Premium Hero Section */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Floating Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 rounded-full blur-xl"
            style={{ background: "var(--gradient-primary)" }}
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-24 h-24 rounded-full blur-lg"
            style={{ background: "var(--gradient-secondary)" }}
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -40, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full blur-md"
            style={{ background: "var(--gradient-accent)" }}
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.1, 0.8],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-8 md:py-12">
          <motion.div
            className="text-center mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mr-4"
                style={{ background: "var(--gradient-primary)" }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-left">
                <h1 className="text-4xl md:text-6xl font-black leading-tight">
                  <span 
                    className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-slow"
                  >
                    Travel
                  </span>
                  <span className="text-foreground">Quest</span>
                </h1>
                <p className="text-sm md:text-base text-muted-foreground font-semibold">
                  For the <span className="text-primary">New Generation</span>
                </p>
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            >
              {[
                { icon: MapPin, label: "Places", count: "1.2M+", gradient: "from-blue-500 to-cyan-500" },
                { icon: Trophy, label: "Challenges", count: "500+", gradient: "from-purple-500 to-pink-500" },
                { icon: Users, label: "Travelers", count: "50K+", gradient: "from-green-500 to-emerald-500" },
                { icon: Zap, label: "XP Earned", count: "10M+", gradient: "from-yellow-500 to-orange-500" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="premium-card text-center p-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xl md:text-2xl font-black text-foreground">{stat.count}</div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />
        <CustomizableDashboard />
      </div>
    </motion.div>
  );
}