import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Map, ZoomIn, ZoomOut, Settings, Filter, Download, Award, Eye, EyeOff, Share2, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import confetti from "canvas-confetti";

interface StreakRegion {
  id: string;
  name: string;
  type: string;
  countryCode?: string;
  stateCode?: string;
  centerLatitude: number;
  centerLongitude: number;
  boundingBox?: any;
  polygon?: any;
}

interface UserStreak {
  id: string;
  regionId: string;
  streakType: string;
  count: number;
  maxStreak: number;
  lastActivity: string;
  firstActivity: string;
  metadata?: any;
  region?: StreakRegion;
}

interface StreakMapConfig {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isGlobal: boolean;
  defaultZoomLevel: number;
  centerLatitude: number;
  centerLongitude: number;
  colorScheme: string;
  customColors?: any;
  showLabels: boolean;
  showStats: boolean;
  animateAchievements: boolean;
  enableSocialExport: boolean;
  enableFilters: boolean;
  enablePersonalization: boolean;
}

interface MapStatistics {
  totalRegionsVisited: number;
  totalStreaks: number;
  longestStreak: number;
  countriesVisited: number;
  citiesVisited: number;
  totalXPFromStreaks: number;
  recentAchievements: any[];
}

export default function StreakMapPage() {
  const queryClient = useQueryClient();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [mapFilters, setMapFilters] = useState({
    regionTypes: [] as string[],
    streakTypes: [] as string[],
    minStreak: 0,
    showLabels: true,
    showStats: true
  });
  const [sidebarTab, setSidebarTab] = useState("stats");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch map configurations
  const { data: configs } = useQuery({
    queryKey: ["/api/streak-map/configs"],
    queryFn: async () => {
      const response = await apiRequest("/api/streak-map/configs?isGlobal=true");
      return response;
    }
  });

  // Fetch default config
  const { data: defaultConfig } = useQuery({
    queryKey: ["/api/streak-map/configs/default"],
    queryFn: async () => {
      const response = await apiRequest("/api/streak-map/configs/default");
      return response;
    }
  });

  // Fetch user streaks (using demo endpoint)
  const { data: userStreaks } = useQuery({
    queryKey: ["/api/streak-map/demo/user-streaks", mapFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (mapFilters.regionTypes.length) params.append("regionTypes", mapFilters.regionTypes.join(","));
      if (mapFilters.streakTypes.length) params.append("streakTypes", mapFilters.streakTypes.join(","));
      if (mapFilters.minStreak > 0) params.append("minStreak", mapFilters.minStreak.toString());
      
      const response = await apiRequest(`/api/streak-map/demo/user-streaks?${params.toString()}`);
      return response;
    }
  });

  // Fetch map statistics (using demo endpoint)
  const { data: mapStats } = useQuery({
    queryKey: ["/api/streak-map/demo/statistics"],
    queryFn: async () => {
      const response = await apiRequest("/api/streak-map/demo/statistics");
      return response;
    }
  });

  // Fetch regions
  const { data: regions } = useQuery({
    queryKey: ["/api/streak-map/regions"],
    queryFn: async () => {
      const response = await apiRequest("/api/streak-map/regions");
      return response;
    }
  });

  // Initialize streak map system
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/streak-map/initialize", { method: "POST" });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streak-map"] });
    }
  });

  // ========================================
  // TODO: REMOVE THIS SECTION - TEST DATA ONLY
  // These mutations are for testing purposes only
  // Remove before production deployment
  // ========================================
  
  const initializeTestDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/streak-map/test-data/initialize", { method: "POST" });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streak-map"] });
      triggerAchievementAnimation();
    }
  });

  const removeTestDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/streak-map/test-data/remove", { method: "DELETE" });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streak-map"] });
    }
  });
  
  // ========================================
  // END OF TEST DATA SECTION
  // ========================================

  // Export map mutation
  const exportMapMutation = useMutation({
    mutationFn: async (exportData: any) => {
      const response = await apiRequest("/api/streak-map/export", {
        method: "POST",
        body: exportData
      });
      return response;
    },
    onSuccess: (data) => {
      // Handle successful export
      console.log("Map exported successfully", data);
    }
  });

  useEffect(() => {
    if (defaultConfig && !selectedConfig) {
      setSelectedConfig((defaultConfig as any)?.id);
    }
  }, [defaultConfig, selectedConfig]);

  // Initialize if no data exists
  useEffect(() => {
    if ((regions as any)?.length === 0) {
      initializeMutation.mutate();
    }
  }, [regions]);

  const getStreakColor = (streak: UserStreak) => {
    const count = streak.count;
    if (count >= 50) return "rgb(245, 158, 11)"; // amber-500
    if (count >= 25) return "rgb(225, 29, 72)"; // rose-600
    if (count >= 10) return "rgb(192, 38, 211)"; // fuchsia-600
    if (count >= 5) return "rgb(124, 58, 237)"; // violet-600
    return "rgb(79, 70, 229)"; // indigo-600
  };

  const getStreakLevel = (count: number) => {
    if (count >= 50) return "Master";
    if (count >= 25) return "Expert";
    if (count >= 10) return "Advanced";
    if (count >= 5) return "Intermediate";
    return "Beginner";
  };

  const handleExportMap = () => {
    exportMapMutation.mutate({
      format: "PNG",
      quality: 0.9,
      width: 1200,
      height: 800,
      includeStats: true,
      includeTitle: true
    });
  };

  const triggerAchievementAnimation = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const currentConfig = (configs as any)?.find((c: StreakMapConfig) => c.id === selectedConfig) || defaultConfig;

  return (
    <div className={`min-h-screen bg-black text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Streak Map
            </h1>
            <p className="text-gray-400">Visualize your travel journey</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="border-gray-700 hover:border-purple-500"
          >
            {isFullscreen ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-700 hover:border-purple-500">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle>Map Filters & Settings</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Map Configuration</Label>
                  <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select configuration" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {(configs as any)?.map((config: StreakMapConfig) => (
                        <SelectItem key={config.id} value={config.id}>
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Show Labels</Label>
                  <Switch
                    checked={mapFilters.showLabels}
                    onCheckedChange={(checked) => 
                      setMapFilters(prev => ({ ...prev, showLabels: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Show Statistics</Label>
                  <Switch
                    checked={mapFilters.showStats}
                    onCheckedChange={(checked) => 
                      setMapFilters(prev => ({ ...prev, showStats: checked }))
                    }
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMap}
            className="border-gray-700 hover:border-purple-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 hover:border-purple-500"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          {/* ========================================
              TEST DATA SECTION - SUCCESS!
              Test data has been added successfully via SQL
              ======================================== */}
          <div className="flex gap-2 ml-4 border-l border-gray-700 pl-4">
            <div className="text-green-400 text-sm px-3 py-1 bg-green-900/20 rounded border border-green-600">
              ✓ Test Data Active
            </div>
          </div>
          {/* ======================================== */}
        </div>
      </div>

      <div className="flex flex-1 h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-80 bg-gray-900 border-r border-gray-800 overflow-y-auto"
        >
          <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="streaks">Streaks</TabsTrigger>
              <TabsTrigger value="achievements">Awards</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats" className="p-4 space-y-4">
              <Card className="neopop-card bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Map Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mapStats && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="display-number text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            {mapStats.totalRegionsVisited}
                          </div>
                          <div className="text-sm text-gray-400">Regions Visited</div>
                        </div>
                        <div className="text-center">
                          <div className="display-number text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            {mapStats.countriesVisited}
                          </div>
                          <div className="text-sm text-gray-400">Countries</div>
                        </div>
                      </div>
                      
                      <Separator className="bg-gray-700" />
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Longest Streak</span>
                          <span className="text-yellow-400">{mapStats.longestStreak}</span>
                        </div>
                        <Progress 
                          value={(mapStats.longestStreak / 100) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Total XP from Streaks</span>
                          <span className="text-green-400">{mapStats.totalXPFromStreaks}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="streaks" className="p-4 space-y-4">
              <div className="space-y-3">
                {(userStreaks as any)?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No streaks yet!</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Click "Add Test Data" above to see how the streak map works
                    </p>
                  </div>
                )}
                {(userStreaks as any)?.map((streak: UserStreak) => (
                  <Card key={streak.id} className="neopop-card bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{streak.region?.name}</h3>
                        <Badge 
                          style={{ backgroundColor: getStreakColor(streak) }}
                          className="text-white"
                        >
                          {streak.count}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        {getStreakLevel(streak.count)} • {streak.streakType.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Max: {streak.maxStreak} • Last: {new Date(streak.lastActivity).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="achievements" className="p-4 space-y-4">
              <div className="space-y-3">
                {(mapStats as any)?.recentAchievements?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No achievements yet!</p>
                    <p className="text-sm text-gray-500">
                      Start exploring to unlock achievements and earn XP
                    </p>
                  </div>
                )}
                {(mapStats as any)?.recentAchievements?.map((achievement: any, index: number) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="neopop-card bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold">{achievement.achievementType}</div>
                            <div className="text-sm text-gray-400">
                              +{achievement.xpEarned} XP
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Map Container */}
        <div className="flex-1 relative bg-gray-950">
          <div
            ref={mapContainerRef}
            className="w-full h-full relative overflow-hidden"
          >
            {/* Map placeholder with interactive elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              <div className="absolute inset-0 opacity-20">
                <div className="h-full w-full bg-gradient-to-r from-purple-600/20 to-cyan-600/20"></div>
              </div>
              
              {/* Interactive map regions would be rendered here */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                    <Map className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                    <h2 className="text-2xl font-bold mb-2">Interactive World Map</h2>
                    <p className="text-gray-400 mb-4">
                      Your streak map will display here with interactive regions
                    </p>
                    <p className="text-sm text-gray-500">
                      Regions visited: {userStreaks?.length || 0}
                    </p>
                  </div>
                </motion.div>
              </div>
              
              {/* Streak visualization overlays */}
              {userStreaks?.map((streak: UserStreak, index: number) => (
                <motion.div
                  key={streak.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="absolute"
                  style={{
                    left: `${((streak.region?.centerLongitude || 0) + 180) / 360 * 100}%`,
                    top: `${((90 - (streak.region?.centerLatitude || 0)) / 180) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: getStreakColor(streak) }}
                    title={`${streak.region?.name}: ${streak.count} streaks`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button size="sm" variant="outline" className="bg-gray-800/80 border-gray-700">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="bg-gray-800/80 border-gray-700">
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Map Stats Overlay */}
          {mapFilters.showStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <Card className="neopop-card bg-gray-900/90 backdrop-blur-sm border-gray-700">
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-purple-400">
                        {(mapStats as any)?.totalRegionsVisited || 0}
                      </div>
                      <div className="text-xs text-gray-400">Regions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-cyan-400">
                        {(mapStats as any)?.countriesVisited || 0}
                      </div>
                      <div className="text-xs text-gray-400">Countries</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-400">
                        {(mapStats as any)?.longestStreak || 0}
                      </div>
                      <div className="text-xs text-gray-400">Best Streak</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">
                        {(mapStats as any)?.totalXPFromStreaks || 0}
                      </div>
                      <div className="text-xs text-gray-400">XP Earned</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}