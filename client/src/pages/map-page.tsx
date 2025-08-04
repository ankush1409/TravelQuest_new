import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Location, CheckIn, CheckInData } from "@shared/schema";
import { LocationPermissionPrompt } from "@/components/ui/location-permission-prompt";
import { PlaceRecommendationCard } from "@/components/ui/place-recommendation-card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Camera, 
  Star, 
  Navigation, 
  Clock, 
  Award, 
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

export default function MapPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Location state
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, address?: string} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');
  
  // UI state
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecommendation | null>(null);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
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
      setShowCheckInDialog(false);
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
    // Don't set default location - let user choose manually
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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Explore & Check-in</h1>
            <p className="text-muted-foreground">Discover amazing places and earn XP!</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <MapPin className="h-3 w-3 mr-1" />
              {locations.length} Locations
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Star className="h-3 w-3 mr-1" />
              {userCheckIns.length} Check-ins
            </Badge>
          </div>
        </div>

        {/* Location permission banner */}
        {locationPermission !== "granted" && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Navigation className="h-5 w-5 text-amber-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {locationPermission === "denied" ? "Location access denied" : "Enable location access"}
                  </p>
                  <p className="text-xs text-amber-700">
                    Allow location access to check in at nearby places and earn XP
                  </p>
                </div>
              </div>
              {locationPermission === "pending" && (
                <Button onClick={requestLocation} size="sm" variant="outline">
                  Enable
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Locations Grid */}
      <div className="flex-1 p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => {
            const locationInfo = getLocationInfo(location);
            const distance = getDistanceToLocation(location);
            const checkedIn = hasCheckedIn(location.id);
            const canCheck = canCheckIn(location);

            return (
              <Card key={location.id} className={`relative overflow-hidden ${checkedIn ? 'ring-2 ring-green-200 bg-green-50/50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{locationInfo.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                        <Badge variant="outline" className={`capitalize text-xs ${locationInfo.bgColor} ${locationInfo.color}`}>
                          {location.category}
                        </Badge>
                      </div>
                    </div>
                    {location.isDiscovery && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Star className="h-3 w-3 mr-1" />
                        Discovery
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {location.description && (
                    <p className="text-sm text-muted-foreground">{location.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">+{location.xpReward} XP</span>
                    </div>
                    {distance && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{distance}</span>
                      </div>
                    )}
                  </div>

                  {location.address && (
                    <p className="text-xs text-muted-foreground">{location.address}</p>
                  )}

                  <div className="pt-2">
                    {checkedIn ? (
                      <div className="flex items-center justify-center p-2 bg-green-100 text-green-800 rounded-md">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Already checked in</span>
                      </div>
                    ) : canCheck ? (
                      <Button
                        onClick={() => setSelectedLocation(location)}
                        className="w-full"
                        size="sm"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Check in here
                      </Button>
                    ) : locationPermission === "granted" ? (
                      <Button variant="outline" disabled className="w-full" size="sm">
                        <Navigation className="h-4 w-4 mr-2" />
                        Get closer to check in
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={requestLocation} className="w-full" size="sm">
                        <Navigation className="h-4 w-4 mr-2" />
                        Enable location to check in
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {locations.length === 0 && !locationsLoading && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No locations available</h3>
            <p className="text-muted-foreground">Check back later for new places to explore!</p>
          </div>
        )}

        {/* Check-in modal */}
        {selectedLocation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-2xl mr-2">{getLocationInfo(selectedLocation).icon}</span>
                  Check in at {selectedLocation.name}
                </CardTitle>
                <CardDescription>
                  Earn {selectedLocation.xpReward} XP by checking in at this location
                  {selectedLocation.isDiscovery && " and make a discovery!"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add a note about your visit (optional)"
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  rows={3}
                />
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedLocation(null);
                      setCheckInNotes("");
                      setIsCheckingIn(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCheckIn}
                    disabled={!canCheckIn(selectedLocation) || isCheckingIn || hasCheckedIn(selectedLocation.id)}
                    className="flex-1"
                  >
                    {isCheckingIn ? "Checking in..." : "Check In"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}