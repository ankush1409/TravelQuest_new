import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Location, CheckIn, CheckInData } from "@shared/schema";
import { MapPin, Camera, Star, Navigation, Clock, Award } from "lucide-react";

// Location category icons and colors
const locationCategoryInfo = {
  park: { icon: "🌳", color: "text-green-600", bgColor: "bg-green-50 border-green-200" },
  landmark: { icon: "🏛️", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
  restaurant: { icon: "🍽️", color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
  bar: { icon: "🍸", color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200" },
  attraction: { icon: "🎯", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" },
  default: { icon: "📍", color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200" },
};

export default function MapPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [checkInNotes, setCheckInNotes] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [locationPermission, setLocationPermission] = useState<string>("pending");

  // Fetch all locations
  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch user's check-ins
  const { data: userCheckIns = [] } = useQuery<(CheckIn & { location: Location })[]>({
    queryKey: ["/api/user/checkins"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (checkInData: CheckInData) => {
      const res = await apiRequest("POST", "/api/checkins", checkInData);
      return await res.json();
    },
    onSuccess: (checkIn) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setSelectedLocation(null);
      setCheckInNotes("");
      setIsCheckingIn(false);
      toast({
        title: "Check-in successful!",
        description: `You earned ${checkIn.xpEarned} XP for checking in at ${selectedLocation?.name}!`,
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

  const handleCheckIn = () => {
    if (!selectedLocation || !userLocation) return;

    setIsCheckingIn(true);
    checkInMutation.mutate({
      locationId: selectedLocation.id,
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      notes: checkInNotes || undefined,
    });
  };

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationPermission("granted");
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationPermission("denied");
          // Default to New York if location access denied
          setUserLocation({ lat: 40.7589, lng: -73.9851 });
        }
      );
    } else {
      setLocationPermission("unsupported");
      // Default location if geolocation not supported
      setUserLocation({ lat: 40.7589, lng: -73.9851 });
    }
  }, []);

  const hasCheckedIn = (locationId: string) => {
    return userCheckIns.some(checkIn => checkIn.locationId === locationId);
  };

  const getLocationInfo = (location: Location) => {
    return locationCategoryInfo[location.category as keyof typeof locationCategoryInfo] || locationCategoryInfo.default;
  };

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

  const canCheckIn = (location: Location) => {
    if (!userLocation || locationPermission !== "granted") return false;
    
    // Calculate distance to location
    const distance = calculateDistance(
      userLocation.lat, userLocation.lng,
      location.latitude, location.longitude
    );
    return distance <= 100; // Allow check-in within 100 meters
  };

  const getDistanceToLocation = (location: Location) => {
    if (!userLocation) return null;
    
    const distance = calculateDistance(
      userLocation.lat, userLocation.lng,
      location.latitude, location.longitude
    );
    
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    } else {
      return `${(distance / 1000).toFixed(1)}km away`;
    }
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationPermission("granted");
          toast({
            title: "Location access granted",
            description: "You can now check in at nearby locations!",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationPermission("denied");
          toast({
            title: "Location access denied",
            description: "Enable location access to check in at places.",
            variant: "destructive",
          });
        }
      );
    }
  };

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