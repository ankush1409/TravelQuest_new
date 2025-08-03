import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import ChallengesPage from "@/pages/challenges-page";
import MapPage from "@/pages/map-page";
import SettingsPage from "@/pages/settings-page";
import EnhancedFlightsPage from "@/pages/enhanced-flights-page";
import NotFound from "@/pages/not-found";

// UI/UX Enhancement Components
import { DesktopNavigation, MobileNavigation, SkipLink } from "@/components/ui/accessible-navigation";
import { OnboardingFlow, useOnboarding } from "@/components/ui/onboarding";
import { OfflineIndicator, PerformanceMonitor } from "@/components/ui/performance-optimizations";

function AppContent() {
  const { user, isLoading } = useAuth();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      
      {/* Navigation */}
      {user && (
        <>
          <DesktopNavigation />
          <MobileNavigation />
        </>
      )}

      {/* Main Content */}
      <main className={user ? "pb-20 md:pb-0" : ""}>
        <Switch>
          <ProtectedRoute path="/" component={() => <HomePage />} />
          <ProtectedRoute path="/profile" component={() => <ProfilePage />} />
          <ProtectedRoute path="/challenges" component={() => <ChallengesPage />} />
          <ProtectedRoute path="/map" component={() => <MapPage />} />
          <ProtectedRoute path="/flights" component={() => <EnhancedFlightsPage />} />
          <ProtectedRoute path="/settings" component={() => <SettingsPage />} />
          <Route path="/auth" component={() => <AuthPage />} />
          <Route component={() => <NotFound />} />
        </Switch>
      </main>

      {/* Onboarding Flow */}
      {user && showOnboarding && (
        <OnboardingFlow 
          onComplete={completeOnboarding} 
          onSkip={skipOnboarding} 
        />
      )}

      {/* Performance and Offline Features */}
      {user && (
        <>
          <OfflineIndicator />
          <PerformanceMonitor />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
