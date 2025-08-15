import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Calendar,
  Trophy,
  Star,
  CheckCircle,
  Play,
  Clock,
  Target,
  Camera,
  Mountain,
  Users,
  Globe
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Challenge, UserChallenge } from "@shared/schema";

export default function ChallengesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all challenges
  const { data: allChallenges = [], isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch user challenges
  const { data: userChallenges = [], isLoading: userChallengesLoading } = useQuery<(UserChallenge & { challenge: Challenge })[]>({
    queryKey: ["/api/user/challenges"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  // Join challenge mutation
  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const res = await apiRequest("POST", "/api/challenges/join", { challengeId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/challenges"] });
      toast({
        title: "Challenge Joined! 🎯",
        description: "You've successfully joined the challenge. Good luck!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Complete challenge mutation
  const completeChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const res = await apiRequest("POST", "/api/challenges/complete", { challengeId });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Challenge Completed! 🏆",
        description: `Congratulations! You've earned XP and unlocked new achievements.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const userChallengeMap = new Map(userChallenges.map(uc => [uc.challengeId, uc]));
  const availableChallenges = allChallenges.filter(challenge => !userChallengeMap.has(challenge.id));
  const activeChallenges = userChallenges.filter(uc => uc.status === "JOINED" || uc.status === "IN_PROGRESS");
  const completedChallenges = userChallenges.filter(uc => uc.status === "COMPLETED");

  const getChallengeIcon = (category: string) => {
    switch (category) {
      case "EXPLORATION": return <Mountain className="h-5 w-5" />;
      case "PHOTO": return <Camera className="h-5 w-5" />;
      case "SOCIAL": return <Users className="h-5 w-5" />;
      case "CULTURAL": return <Globe className="h-5 w-5" />;
      case "ADVENTURE": return <Target className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getCategoryCouor = (category: string) => {
    switch (category) {
      case "EXPLORATION": return "bg-blue-100 text-blue-800 border-blue-200";
      case "PHOTO": return "bg-purple-100 text-purple-800 border-purple-200";
      case "SOCIAL": return "bg-pink-100 text-pink-800 border-pink-200";
      case "CULTURAL": return "bg-green-100 text-green-800 border-green-200";
      case "ADVENTURE": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const ChallengeCard = ({ 
    challenge, 
    userChallenge, 
    showActions = true 
  }: { 
    challenge: Challenge; 
    userChallenge?: UserChallenge; 
    showActions?: boolean; 
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {getChallengeIcon(challenge.category)}
            </div>
            <div>
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className={getCategoryCouor(challenge.category)}>
                  {challenge.category.toLowerCase()}
                </Badge>
                <div className="flex items-center text-primary text-sm">
                  <Star className="h-3 w-3 mr-1" />
                  {challenge.xpReward} XP
                </div>
              </div>
            </div>
          </div>
          {userChallenge && (
            <Badge 
              variant={userChallenge.status === "COMPLETED" ? "default" : "secondary"}
              className={
                userChallenge.status === "COMPLETED" 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
              }
            >
              {userChallenge.status.toLowerCase().replace("_", " ")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>{challenge.description}</p>
        
        <div className="flex items-center justify-between text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
          </div>
          {userChallenge?.completedAt && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed {formatDate(userChallenge.completedAt)}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex space-x-2">
            {!userChallenge && (
              <Button 
                onClick={() => joinChallengeMutation.mutate(challenge.id)}
                disabled={joinChallengeMutation.isPending}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Join Challenge
              </Button>
            )}
            
            {userChallenge && userChallenge.status !== "COMPLETED" && (
              <Button 
                onClick={() => completeChallengeMutation.mutate(challenge.id)}
                disabled={completeChallengeMutation.isPending}
                className="flex-1"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}

            {userChallenge?.status === "COMPLETED" && (
              <Button variant="outline" disabled className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--primary))" }}>
                <MapPin className="inline-block mr-2" />
                TravelQuest
              </h1>
            </div>
            <Button variant="ghost" onClick={() => window.history.back()}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>Challenges</h2>
            <p style={{ color: "hsl(var(--muted-foreground))" }}>Take on exciting challenges to earn XP, unlock badges, and discover new adventures!</p>
          </div>

          {/* Challenge Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{activeChallenges.length}</p>
                    <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Active Challenges</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{completedChallenges.length}</p>
                    <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{availableChallenges.length}</p>
                    <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Challenges Tabs */}
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available Challenges</TabsTrigger>
              <TabsTrigger value="active">My Active Challenges</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            {/* Available Challenges */}
            <TabsContent value="available" className="space-y-6">
              {challengesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4" style={{ color: "hsl(var(--muted-foreground))" }}>Loading challenges...</p>
                </div>
              ) : availableChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableChallenges.map((challenge) => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No available challenges</h3>
                  <p className="text-gray-500">You've joined all available challenges! Check back later for new ones.</p>
                </div>
              )}
            </TabsContent>

            {/* Active Challenges */}
            <TabsContent value="active" className="space-y-6">
              {userChallengesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading your challenges...</p>
                </div>
              ) : activeChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeChallenges.map((userChallenge) => (
                    <ChallengeCard 
                      key={userChallenge.id} 
                      challenge={userChallenge.challenge}
                      userChallenge={userChallenge}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active challenges</h3>
                  <p className="text-gray-500">Join some challenges to start your adventure!</p>
                </div>
              )}
            </TabsContent>

            {/* Completed Challenges */}
            <TabsContent value="completed" className="space-y-6">
              {userChallengesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading completed challenges...</p>
                </div>
              ) : completedChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedChallenges.map((userChallenge) => (
                    <ChallengeCard 
                      key={userChallenge.id} 
                      challenge={userChallenge.challenge}
                      userChallenge={userChallenge}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed challenges</h3>
                  <p className="text-gray-500">Complete your first challenge to see your achievements here!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}