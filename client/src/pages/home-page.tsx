import { SimpleDashboard } from "@/components/ui/simple-dashboard";
import { Breadcrumb } from "@/components/ui/accessible-navigation";
import { motion } from "framer-motion";
import { Zap, MapPin, Trophy, Users } from "lucide-react";

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

            

          </motion.div>
        </div>
      </motion.div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />
        <SimpleDashboard />
      </div>
    </motion.div>
  );
}