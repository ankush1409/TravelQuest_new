import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, Target, Award, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  xpReward: number;
}

interface XPGainProps {
  amount: number;
  reason: string;
  onComplete?: () => void;
}

interface LevelUpProps {
  newLevel: number;
  oldLevel: number;
  onComplete?: () => void;
}

interface BadgeUnlockedProps {
  badge: Achievement;
  onComplete?: () => void;
}

interface ProgressBarProps {
  current: number;
  max: number;
  label: string;
  color?: string;
  animated?: boolean;
  showPercentage?: boolean;
}

/**
 * Animated XP gain notification with particle effects
 */
export function XPGainFeedback({ amount, reason, onComplete }: XPGainProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="travel-card bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30 p-4 shadow-2xl">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center"
          >
            <Zap className="w-5 h-5 text-yellow-500" />
          </motion.div>
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-xl font-bold text-yellow-500"
            >
              +{amount} XP
            </motion.div>
            <div className="text-sm text-muted-foreground">{reason}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Level up celebration with confetti and animation
 */
export function LevelUpFeedback({ newLevel, oldLevel, onComplete }: LevelUpProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    });

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-black text-foreground mb-4"
        >
          LEVEL UP!
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6"
        >
          {newLevel}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xl text-muted-foreground mb-8"
        >
          You've reached Level {newLevel}! Keep exploring to unlock new adventures.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          onClick={() => setVisible(false)}
          className="neopop-button px-8 py-3"
        >
          CONTINUE ADVENTURE
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/**
 * Badge unlock notification with celebration effects
 */
export function BadgeUnlockedFeedback({ badge, onComplete }: BadgeUnlockedProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Trigger small confetti burst
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.4 },
      colors: [badge.color, '#FFD700', '#FF6B6B']
    });

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [badge.color, onComplete]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      className="fixed top-0 left-0 right-0 z-50 p-4"
    >
      <div className="max-w-md mx-auto">
        <div className="travel-card bg-gradient-to-r from-blue-500/20 to-teal-500/20 border-blue-500/30 p-6 shadow-2xl">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${badge.color}20`, border: `2px solid ${badge.color}` }}
            >
              {badge.icon}
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg font-bold text-foreground mb-2"
            >
              Badge Unlocked!
            </motion.h3>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-4"
            >
              <div className="font-bold text-foreground">{badge.title}</div>
              <div className="text-sm text-muted-foreground">{badge.description}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="text-yellow-500 font-bold"
            >
              +{badge.xpReward} XP
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Animated progress bar with smooth transitions
 */
export function AnimatedProgressBar({ 
  current, 
  max, 
  label, 
  color = "primary", 
  animated = true,
  showPercentage = true 
}: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-foreground">{label}</span>
        {showPercentage && (
          <span className="text-sm text-muted-foreground">
            {current}/{max} {showPercentage && `(${Math.round(percentage)}%)`}
          </span>
        )}
      </div>
      
      <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${
            color === "primary" 
              ? "from-primary to-primary/80" 
              : `from-${color}-500 to-${color}-400`
          } relative overflow-hidden`}
        >
          {animated && (
            <motion.div
              animate={{ x: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Achievement celebration component
 */
export function AchievementCelebration({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.6, times: [0, 0.5, 1] }}
      className="relative"
    >
      {children}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
        transition={{ duration: 1.5 }}
        className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 rounded-lg pointer-events-none"
      />
      <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 animate-pulse" />
    </motion.div>
  );
}