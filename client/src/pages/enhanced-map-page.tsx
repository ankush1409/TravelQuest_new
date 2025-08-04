import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { CheckIn, CheckInData, Location } from "@shared/schema";
import { LocationPermissionPrompt } from "@/components/ui/location-permission-prompt";
import { PlaceRecommendationCard } from "@/components/ui/place-recommendation-card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  RefreshCw, 
  Filter,
  Search,
  Compass,
  Zap,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";

// Enhanced place recommendation interface
interface PlaceRecommendation {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  rating?: number;
  priceLevel?: number;
  photoUrl?: string;
  distance?: number;
  isOpen?: boolean;
  website?: string;
  phone?: string;
  xpReward: number;
  personalizedScore: number;
  badges?: string[];
  tips?: string[];
}

export default function EnhancedMapPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Location state
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, address?: string} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');
  
  // UI state
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecommendation | null>(null);
  const [checkInNotes, setCheckInNotes] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch personalized place recommendations
  const { data: recommendations = [], isLoading: recommendationsLoading, refetch: refetchRecommendations } = useQuery<PlaceRecommendation[]>({
    queryKey: ["/api/places/recommendations", userLocation?.lat, userLocation?.lng, refreshKey],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user && !!userLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch user's check-ins to know which places they've already visited
  const { data: userCheckIns = [] } = useQuery<(CheckIn & { location: Location })[]>({
    queryKey: ["/api/user/checkins"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  // Enhanced check-in mutation with proximity validation
  const checkInMutation = useMutation({
    mutationFn: async (place: PlaceRecommendation) => {
      if (!userLocation) throw new Error("Location required for check-in");
      
      // First validate proximity
      const proximityRes = await apiRequest("POST", "/api/places/can-checkin", {
        userLat: userLocation.lat,
        userLng: userLocation.lng,
        placeLat: place.latitude,
        placeLng: place.longitude,
        maxDistance: 200 // 200 meters
      });
      const { canCheckIn } = await proximityRes.json();
      
      if (!canCheckIn) {
        throw new Error("You must be within 200 meters to check in!");
      }

      // Create the check-in
      const checkInData: CheckInData = {
        locationId: place.id,
        latitude: place.latitude,
        longitude: place.longitude,
        notes: checkInNotes || undefined,
      };

      const res = await apiRequest("POST", "/api/checkins", checkInData);
      return await res.json();
    },
    onSuccess: (checkIn) => {
      // Celebrate with confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#06B6D4', '#F59E0B']
      });

      // Update cache
      queryClient.invalidateQueries({ queryKey: ["/api/user/checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/places/recommendations"] });
      
      // Reset state
      setSelectedPlace(null);
      setCheckInNotes("");
      setIsCheckingIn(false);
      
      toast({
        title: "🎉 Check-in successful!",
        description: `You earned ${checkIn.xpEarned} XP at ${selectedPlace?.name}!`,
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
      setIsCheckingIn(false);
    },
  });

  const handleCheckIn = useCallback((place: PlaceRecommendation) => {
    if (!userLocation) return;
    
    setSelectedPlace(place);
    setIsCheckingIn(true);
    checkInMutation.mutate(place);
  }, [userLocation, checkInMutation]);

  const handleGetDirections = useCallback((place: PlaceRecommendation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    window.open(url, '_blank');
  }, []);

  const handleRefreshRecommendations = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    refetchRecommendations();
  }, [refetchRecommendations]);

  // Location permission handlers
  const handleLocationGranted = useCallback((location: { lat: number; lng: number }) => {
    setUserLocation(location);
    setLocationPermission('granted');
  }, []);

  const handleLocationDenied = useCallback(() => {
    setLocationPermission('denied');
  }, []);

  const handleManualLocationSet = useCallback((location: { lat: number; lng: number; address: string }) => {
    setUserLocation({ ...location, address });
    setLocationPermission('granted');
  }, []);

  // Helper functions
  const hasCheckedIn = useCallback((placeId: string) => {
    return userCheckIns.some(checkIn => checkIn.locationId === placeId);
  }, [userCheckIns]);

  const canCheckIn = useCallback((place: PlaceRecommendation) => {
    if (!userLocation) return false;
    const distance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      place.latitude, 
      place.longitude
    );
    return distance <= 200; // 200 meters
  }, [userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter recommendations based on search and category
  const filteredRecommendations = recommendations.filter(place => {
    const matchesSearch = searchFilter === "" || 
      place.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      place.address?.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || place.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const availableCategories = Array.from(new Set(recommendations.map(p => p.category)));

  // Show location permission prompt if needed
  if (locationPermission !== 'granted' || !userLocation) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <LocationPermissionPrompt
          onLocationGranted={handleLocationGranted}
          onLocationDenied={handleLocationDenied}
          onManualLocationSet={handleManualLocationSet}
          permissionStatus={locationPermission}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with location info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Compass className="w-8 h-8 text-primary" />
            Explore & Check-in
          </h1>
          {userLocation?.address && (
            <p className="text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {userLocation.address}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRefreshRecommendations}
            variant="outline"
            size="sm"
            className="neopop-button-outline flex items-center gap-1"
            disabled={recommendationsLoading}
          >
            <RefreshCw className={`w-4 h-4 ${recommendationsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Badge variant="outline" className="text-sm">
            <Sparkles className="w-4 h-4 mr-1 text-primary" />
            {filteredRecommendations.length} places found
          </Badge>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search places by name or address..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="neopop-input pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={categoryFilter === "all" ? "default" : "outline"}
            onClick={() => setCategoryFilter("all")}
            size="sm"
            className="neopop-button-sm"
          >
            All
          </Button>
          {availableCategories.slice(0, 3).map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? "default" : "outline"}
              onClick={() => setCategoryFilter(category)}
              size="sm"
              className="neopop-button-sm capitalize"
            >
              {category}
            </Button>
          ))}
          {availableCategories.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              className="neopop-button-outline"
            >
              <Filter className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {recommendationsLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i} className="neopop-card">
              <div className="h-48 bg-muted/30 animate-pulse rounded-t-lg"></div>
              <CardHeader>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted/50 rounded"></div>
                  <div className="h-3 bg-muted/30 rounded w-2/3"></div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!recommendationsLoading && filteredRecommendations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="neopop-card">
            <CardContent className="text-center py-12">
              <Compass className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No places found</h3>
              <p className="text-muted-foreground mb-6">
                {searchFilter || categoryFilter !== "all" 
                  ? "Try adjusting your search or filters to discover more places."
                  : "We're working on finding amazing places for you to explore!"
                }
              </p>
              {(searchFilter || categoryFilter !== "all") && (
                <Button 
                  onClick={() => {
                    setSearchFilter("");
                    setCategoryFilter("all");
                  }}
                  variant="outline"
                  className="neopop-button-outline"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Place Recommendations Grid */}
      <AnimatePresence mode="wait">
        {!recommendationsLoading && filteredRecommendations.length > 0 && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredRecommendations.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PlaceRecommendationCard
                  place={place}
                  canCheckIn={canCheckIn(place)}
                  hasCheckedIn={hasCheckedIn(place.id)}
                  onCheckIn={handleCheckIn}
                  onGetDirections={handleGetDirections}
                  isCheckingIn={isCheckingIn && selectedPlace?.id === place.id}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivational Call-to-Action */}
      {!recommendationsLoading && filteredRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="neopop-card bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10 border-primary/30">
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold gradient-text">Start Your Adventure!</h3>
              </div>
              <p className="text-muted-foreground">
                Visit these places to earn XP, unlock badges, and discover hidden gems in your area.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}