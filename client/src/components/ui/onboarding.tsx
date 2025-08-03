import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Trophy, Users, Camera, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  ctaText: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to TravelQuest!",
    description: "Turn your travel adventures into an exciting game with XP, badges, and achievements.",
    icon: <Trophy className="w-12 h-12 text-yellow-500" />,
    features: [
      "Earn XP for every adventure",
      "Unlock exclusive travel badges",
      "Level up your explorer status",
      "Compete with fellow travelers"
    ],
    ctaText: "Start Your Journey"
  },
  {
    id: "locations",
    title: "Discover Amazing Places",
    description: "Check in at locations worldwide and discover hidden gems in your area.",
    icon: <MapPin className="w-12 h-12 text-cyan-500" />,
    features: [
      "Interactive map exploration",
      "Location-based check-ins",
      "Discover nearby attractions",
      "Earn location badges"
    ],
    ctaText: "Explore Locations"
  },
  {
    id: "community",
    title: "Connect with Travelers",
    description: "Join challenges, share experiences, and connect with the travel community.",
    icon: <Users className="w-12 h-12 text-purple-500" />,
    features: [
      "Join exciting challenges",
      "Share travel photos",
      "Follow other explorers",
      "Create travel groups"
    ],
    ctaText: "Join Community"
  },
  {
    id: "gamification",
    title: "Level Up Your Adventures",
    description: "Complete challenges, earn badges, and track your progress as you explore the world.",
    icon: <Camera className="w-12 h-12 text-pink-500" />,
    features: [
      "Photo-based challenges",
      "Achievement milestones",
      "Progress tracking",
      "Reward celebrations"
    ],
    ctaText: "Get Started"
  }
];

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleNext = () => {
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const step = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        <Card className="neopop-card border-2">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-muted-foreground">
                  Step {currentStep + 1} of {onboardingSteps.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip Tutorial
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="neopop-card p-6 rounded-full bg-gradient-to-br from-accent/10 to-primary/10">
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black text-foreground mb-4">
                  {step.title}
                </h2>

                {/* Description */}
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {step.description}
                </p>

                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {step.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 text-left"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleNext}
                  className="neopop-button w-full sm:w-auto px-8 py-3"
                  size="lg"
                >
                  {step.ctaText}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </AnimatePresence>

            {/* Step Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentStep
                      ? "bg-primary scale-125"
                      : completedSteps.has(index)
                      ? "bg-primary/60"
                      : "bg-muted"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Hook to manage onboarding state
 */
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("travelquest-onboarding-completed");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("travelquest-onboarding-completed", "true");
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem("travelquest-onboarding-completed", "true");
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    completeOnboarding,
    skipOnboarding,
  };
}