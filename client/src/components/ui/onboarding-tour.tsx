import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Trophy, 
  Users, 
  Target, 
  Star,
  Globe,
  ArrowRight,
  Skip,
  CheckCircle,
  X,
  Play,
  Award,
  Camera
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import confetti from "canvas-confetti";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action?: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to TravelQuest! 🌍",
    description: "Transform your travels into an exciting adventure. Earn XP, collect badges, and connect with fellow explorers worldwide.",
    icon: Globe,
    color: "from-blue-500 to-purple-600"
  },
  {
    id: "explore",
    title: "Discover Amazing Places 📍",
    description: "Check-in at locations, find hidden gems, and discover special places near you. Each visit earns you valuable XP!",
    icon: MapPin,
    color: "from-green-500 to-blue-500"
  },
  {
    id: "challenges",
    title: "Complete Epic Challenges 🎯",
    description: "Join location-based challenges, photo contests, and cultural adventures. Complete them to earn amazing rewards!",
    icon: Target,
    color: "from-orange-500 to-red-500"
  },
  {
    id: "badges",
    title: "Collect Prestigious Badges 🏆",
    description: "Unlock beautiful badges as you level up and achieve milestones. Show off your travel expertise to the community!",
    icon: Award,
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "social",
    title: "Connect with Travelers 👥",
    description: "Share your adventures, follow other explorers, and build your travel network. Make lasting connections worldwide!",
    icon: Users,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "ready",
    title: "You're Ready to Explore! ✨",
    description: "Your adventure begins now. Start by exploring the map, joining a challenge, or updating your profile!",
    icon: Star,
    color: "from-pink-500 to-purple-600"
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/onboarding-complete");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onComplete();
    },
  });

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    completeOnboardingMutation.mutate();
  };

  const handleSkip = () => {
    completeOnboardingMutation.mutate();
    onSkip();
  };

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="neopop-card relative overflow-hidden">
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentStepData.color} opacity-5`} />
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="text-xs">
                  Step {currentStep + 1} of {onboardingSteps.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Skip className="w-4 h-4 mr-1" />
                  Skip
                </Button>
              </div>

              <Progress value={progress} className="mb-6" />

              <div className="text-center mb-4">
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentStepData.color} flex items-center justify-center mx-auto mb-4`}
                >
                  <currentStepData.icon className="w-10 h-10 text-white" />
                </motion.div>

                <motion.div
                  key={`title-${currentStep}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <CardTitle className="text-xl mb-2">{currentStepData.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {currentStepData.description}
                  </CardDescription>
                </motion.div>
              </div>
            </CardHeader>

            <CardContent className="relative">
              {/* Interactive Elements Based on Step */}
              <motion.div
                key={`content-${currentStep}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                {currentStep === 0 && user && (
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Welcome, {user.displayName}!</p>
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>Level {user.level}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-blue-500" />
                        <span>{user.totalXP} XP</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">Check-in Locations</p>
                        <p className="text-xs text-muted-foreground">Visit places and earn XP instantly</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg">
                      <Camera className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Discover Hidden Gems</p>
                        <p className="text-xs text-muted-foreground">Find special places off the beaten path</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                      <Target className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                      <p className="text-xs font-medium">Photo Challenges</p>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 rounded-lg">
                      <MapPin className="w-6 h-6 text-red-500 mx-auto mb-1" />
                      <p className="text-xs font-medium">Location Quests</p>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="flex justify-center space-x-2">
                    {["🏆", "🌟", "📸", "🗺️"].map((emoji, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center text-xl"
                      >
                        {emoji}
                      </motion.div>
                    ))}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                    <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Join a Global Community</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Connect with travelers from around the world
                    </p>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="text-center p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg">
                    <Star className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Your Adventure Awaits!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ready to become a TravelQuest legend?
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="opacity-70"
                >
                  Previous
                </Button>

                <div className="flex space-x-1">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index <= currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={completeOnboardingMutation.isPending}
                  className="neopop-button"
                >
                  {currentStep === onboardingSteps.length - 1 ? (
                    completeOnboardingMutation.isPending ? (
                      "Starting..."
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Exploring!
                      </>
                    )
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Quick onboarding trigger component for first-time users
interface OnboardingTriggerProps {
  user: any;
}

export function OnboardingTrigger({ user }: OnboardingTriggerProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding for new users who haven't completed it
    if (user && !user.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [user]);

  if (!showOnboarding || user?.onboardingCompleted) {
    return null;
  }

  return (
    <OnboardingTour
      onComplete={() => setShowOnboarding(false)}
      onSkip={() => setShowOnboarding(false)}
    />
  );
}