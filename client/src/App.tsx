import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { Suspense, lazy } from "react";

// Lazy load heavy components for better performance
const HomePage = lazy(() => import("@/pages/home-page"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const ChallengesPage = lazy(() => import("@/pages/challenges-page"));
const EnhancedMapPage = lazy(() => import("@/pages/enhanced-map-page"));
const StreakMapPage = lazy(() => import("@/pages/streak-map-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
const ReferralsPage = lazy(() => import("@/pages/referrals-page"));
const NotFound = lazy(() => import("@/pages/not-found"));

// UI/UX Enhancement Components - load only essential ones initially
import { DesktopNavigation, MobileNavigation, SkipLink } from "@/components/ui/accessible-navigation";
import { useOnboarding } from "@/components/ui/onboarding";
const OnboardingFlow = lazy(() => import("@/components/ui/onboarding").then(m => ({ default: m.OnboardingFlow })));
const OfflineIndicator = lazy(() => import("@/components/ui/performance-optimizations").then(m => ({ default: m.OfflineIndicator })));
const PerformanceMonitor = lazy(() => import("@/components/ui/performance-optimizations").then(m => ({ default: m.PerformanceMonitor })));

function AppContent() {
  const { user, isLoading } = useAuth();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
          <h2 style={{ 
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            Loading TravelQuest...
          </h2>
          <p className="text-slate-400 mt-2">Preparing your premium travel experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
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
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-purple-500"></div>
          </div>
        }>
          <Switch>
            <ProtectedRoute path="/" component={() => <HomePage />} />
            <ProtectedRoute path="/profile" component={() => <ProfilePage />} />
            <ProtectedRoute path="/challenges" component={() => <ChallengesPage />} />
            <ProtectedRoute path="/map" component={() => <EnhancedMapPage />} />
            <ProtectedRoute path="/streak-map" component={() => <StreakMapPage />} />
            <ProtectedRoute path="/referrals" component={() => <ReferralsPage />} />
            <ProtectedRoute path="/settings" component={() => <SettingsPage />} />
            <Route path="/auth" component={() => <AuthPage />} />
            <Route component={() => <NotFound />} />
          </Switch>
        </Suspense>
      </main>

      {/* Onboarding Flow */}
      {user && showOnboarding && (
        <Suspense fallback={null}>
          <OnboardingFlow 
            onComplete={completeOnboarding} 
            onSkip={skipOnboarding} 
          />
        </Suspense>
      )}

      {/* Performance and Offline Features */}
      {user && (
        <Suspense fallback={null}>
          <OfflineIndicator />
          <PerformanceMonitor />
        </Suspense>
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
