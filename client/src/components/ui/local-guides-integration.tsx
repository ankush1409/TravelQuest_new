import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  MapPin, 
  Camera, 
  Video, 
  Edit3, 
  HelpCircle, 
  Info, 
  Route, 
  List, 
  Star,
  Trophy,
  Globe,
  Clock,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface LocalGuidesData {
  level: number;
  points: number;
  reviews: number;
  photos: number;
  videos: number;
  edits: number;
  questions: number;
  facts: number;
  roads: number;
  lists: number;
  lastUpdate?: string;
}

interface LocalGuidesIntegrationProps {
  userId: string;
  currentData?: LocalGuidesData & { url?: string };
}

export function LocalGuidesIntegration({ userId, currentData }: LocalGuidesIntegrationProps) {
  const [profileUrl, setProfileUrl] = useState(currentData?.url || "");
  const { toast } = useToast();

  const updateLocalGuidesMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/user/local-guides", { profileUrl: url });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Google Local Guides Connected! 🗺️",
        description: "Your Local Guides stats have been synced successfully.",
        className: "toast-success"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Unable to fetch Local Guides data. Please check your profile URL.",
        variant: "destructive",
        className: "toast-error"
      });
    },
  });

  const removeLocalGuidesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/user/local-guides");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setProfileUrl("");
      toast({
        title: "Local Guides Disconnected",
        description: "Your Google Local Guides integration has been removed.",
      });
    },
  });

  const handleConnect = () => {
    if (!profileUrl.trim()) {
      toast({
        title: "Profile URL Required",
        description: "Please enter your Google Local Guides profile URL.",
        variant: "destructive",
      });
      return;
    }

    if (!profileUrl.includes("google.com/maps/contrib/")) {
      toast({
        title: "Invalid URL Format",
        description: "Please enter a valid Google Local Guides profile URL (e.g., https://www.google.com/maps/contrib/123456789).",
        variant: "destructive",
      });
      return;
    }

    updateLocalGuidesMutation.mutate(profileUrl);
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color, 
    description 
  }: { 
    icon: any; 
    label: string; 
    value: number; 
    color: string; 
    description: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="neopop-card p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`display-number text-2xl font-black ${color.replace('bg-', 'text-')}`}>
          {value}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{label}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );

  return (
    <Card className="neopop-card">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Google Local Guides</span>
              {currentData && <CheckCircle className="w-5 h-5 text-green-500" />}
            </CardTitle>
            <CardDescription>
              {currentData ? "Showcase your community contributions" : "Connect your Local Guides profile"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!currentData ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Privacy-Respecting Integration</p>
                  <p className="text-muted-foreground">
                    This feature only accesses your public Google Local Guides profile data. 
                    Google doesn't provide an official API, so we use publicly available information.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileUrl">Google Local Guides Profile URL</Label>
              <Input
                id="profileUrl"
                placeholder="https://www.google.com/maps/contrib/123456789"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Find your profile URL by visiting Google Maps, clicking your profile picture, 
                and selecting "Your contributions".
              </p>
            </div>

            <Button 
              onClick={handleConnect}
              disabled={updateLocalGuidesMutation.isPending}
              className="neopop-button w-full"
            >
              {updateLocalGuidesMutation.isPending ? "Connecting..." : "Connect Local Guides"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Level and Points Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="neopop-card p-4 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="display-number text-4xl font-black text-yellow-500 mb-1">
                  {currentData.level}
                </div>
                <p className="text-sm font-medium text-foreground">Level</p>
                <p className="text-xs text-muted-foreground">Local Guide Level</p>
              </div>

              <div className="neopop-card p-4 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="display-number text-4xl font-black text-blue-500 mb-1">
                  {currentData.points.toLocaleString()}
                </div>
                <p className="text-sm font-medium text-foreground">Points</p>
                <p className="text-xs text-muted-foreground">Total Points Earned</p>
              </div>
            </div>

            <Separator />

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                icon={MapPin}
                label="Reviews"
                value={currentData.reviews}
                color="bg-green-500/10 text-green-500"
                description="Places reviewed"
              />
              
              <StatCard
                icon={Camera}
                label="Photos"
                value={currentData.photos}
                color="bg-blue-500/10 text-blue-500"
                description="Photos uploaded"
              />
              
              <StatCard
                icon={Video}
                label="Videos"
                value={currentData.videos}
                color="bg-red-500/10 text-red-500"
                description="Videos shared"
              />
              
              <StatCard
                icon={Edit3}
                label="Edits"
                value={currentData.edits}
                color="bg-purple-500/10 text-purple-500"
                description="Map edits made"
              />
              
              <StatCard
                icon={HelpCircle}
                label="Q&A"
                value={currentData.questions}
                color="bg-orange-500/10 text-orange-500"
                description="Questions answered"
              />
              
              <StatCard
                icon={List}
                label="Lists"
                value={currentData.lists}
                color="bg-cyan-500/10 text-cyan-500"
                description="Lists published"
              />
            </div>

            {/* Additional Stats */}
            {(currentData.facts > 0 || currentData.roads > 0) && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  {currentData.facts > 0 && (
                    <StatCard
                      icon={Info}
                      label="Facts"
                      value={currentData.facts}
                      color="bg-teal-500/10 text-teal-500"
                      description="Facts added"
                    />
                  )}
                  
                  {currentData.roads > 0 && (
                    <StatCard
                      icon={Route}
                      label="Roads"
                      value={currentData.roads}
                      color="bg-indigo-500/10 text-indigo-500"
                      description="Roads added"
                    />
                  )}
                </div>
              </>
            )}

            {/* Last Updated */}
            {currentData.lastUpdate && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Last updated: {new Date(currentData.lastUpdate).toLocaleDateString()}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateLocalGuidesMutation.mutate(currentData.url || "")}
                  disabled={updateLocalGuidesMutation.isPending}
                >
                  {updateLocalGuidesMutation.isPending ? "Updating..." : "Refresh"}
                </Button>
              </div>
            )}

            {/* Disconnect Option */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => removeLocalGuidesMutation.mutate()}
                disabled={removeLocalGuidesMutation.isPending}
                className="text-destructive hover:text-destructive"
              >
                {removeLocalGuidesMutation.isPending ? "Disconnecting..." : "Disconnect Local Guides"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}