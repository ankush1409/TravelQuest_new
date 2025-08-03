import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

interface LocalGuidesSettingsProps {
  className?: string;
}

export function LocalGuidesSettings({ className }: LocalGuidesSettingsProps) {
  const { user } = useAuth();
  const [profileUrl, setProfileUrl] = useState(user?.localGuidesUrl || "");
  const [autoUpdate, setAutoUpdate] = useState(true);
  const { toast } = useToast();

  const updateLocalGuidesMutation = useMutation({
    mutationFn: async (data: { profileUrl: string; autoUpdate?: boolean }) => {
      const res = await apiRequest("POST", "/api/user/local-guides", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Google Local Guides Connected! 🗺️",
        description: "Your Local Guides stats have been synced successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Unable to fetch Local Guides data. Please check your profile URL.",
        variant: "destructive",
      });
    },
  });

  const refreshDataMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/local-guides/refresh");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Data Refreshed",
        description: "Your Local Guides statistics have been updated.",
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
        title: "Profile Disconnected",
        description: "Your Google Local Guides profile has been removed from TravelQuest.",
      });
    },
  });

  const handleConnect = () => {
    if (!profileUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter your Google Local Guides profile URL.",
        variant: "destructive",
      });
      return;
    }
    updateLocalGuidesMutation.mutate({ profileUrl: profileUrl.trim(), autoUpdate });
  };

  const handleRefresh = () => {
    refreshDataMutation.mutate();
  };

  const handleDisconnect = () => {
    removeLocalGuidesMutation.mutate();
  };

  const isConnected = !!user?.localGuidesUrl;
  const hasData = isConnected && (user?.localGuidesLevel || 0) > 0;

  return (
    <div className={className}>
      <Card className="neopop-card">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Globe className="h-6 w-6 mr-3 text-primary" />
            Google Local Guides Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Local Guides profile to showcase your contributions and earn bonus XP in TravelQuest.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">
                  {isConnected ? "Connected" : "Not Connected"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? "Profile synced successfully" : "No Local Guides profile linked"}
                </p>
              </div>
            </div>
            {isConnected && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>Level {user?.localGuidesLevel || 0}</span>
              </Badge>
            )}
          </div>

          {/* Profile URL Input */}
          <div className="space-y-2">
            <Label htmlFor="profile-url">Google Local Guides Profile URL</Label>
            <div className="flex space-x-2">
              <Input
                id="profile-url"
                type="url"
                placeholder="https://www.google.com/maps/contrib/..."
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="flex-1"
              />
              {isConnected && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => user?.localGuidesUrl && window.open(user.localGuidesUrl, '_blank')}
                  title="View profile"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Find your profile URL by going to Google Maps → Menu → Your contributions → View profile
            </p>
          </div>

          {/* Auto-update setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-update">Automatic Updates</Label>
              <p className="text-sm text-muted-foreground">
                Periodically refresh your Local Guides statistics
              </p>
            </div>
            <Switch
              id="auto-update"
              checked={autoUpdate}
              onCheckedChange={setAutoUpdate}
            />
          </div>

          <Separator />

          {/* Statistics Preview */}
          <AnimatePresence>
            {hasData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                    Your Contributions Preview
                  </h4>
                  {user?.localGuidesLastUpdate && (
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Updated {new Date(user?.localGuidesLastUpdate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                    <Star className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-blue-400">{user?.localGuidesPoints || 0}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 rounded-lg">
                    <Edit3 className="h-6 w-6 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-400">{user?.localGuidesReviews || 0}</p>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                  </div>
                  <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                    <Camera className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-400">{user?.localGuidesPhotos || 0}</p>
                    <p className="text-xs text-muted-foreground">Photos</p>
                  </div>
                  <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                    <MapPin className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-orange-400">{user?.localGuidesEdits || 0}</p>
                    <p className="text-xs text-muted-foreground">Edits</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {isConnected ? (
              <>
                <Button
                  onClick={handleRefresh}
                  disabled={refreshDataMutation.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  {refreshDataMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh Data
                </Button>
                <Button
                  onClick={handleDisconnect}
                  disabled={removeLocalGuidesMutation.isPending}
                  variant="destructive"
                  size="icon"
                  title="Disconnect profile"
                >
                  {removeLocalGuidesMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={updateLocalGuidesMutation.isPending}
                className="flex-1 neopop-button"
              >
                {updateLocalGuidesMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4 mr-2" />
                )}
                Connect Local Guides Profile
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              How it works
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Link your public Google Local Guides profile</li>
              <li>• Your contributions will be displayed alongside TravelQuest achievements</li>
              <li>• Earn bonus XP for your Local Guides activity</li>
              <li>• Data updates automatically based on your preferences</li>
              <li>• Only public profile information is accessed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}