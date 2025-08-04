import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Navigation, 
  Search, 
  AlertCircle, 
  CheckCircle,
  Smartphone,
  Globe
} from "lucide-react";

interface LocationPermissionPromptProps {
  onLocationGranted: (location: { lat: number; lng: number }) => void;
  onLocationDenied: () => void;
  onManualLocationSet: (location: { lat: number; lng: number; address: string }) => void;
  permissionStatus: 'pending' | 'granted' | 'denied' | 'unsupported';
}

export function LocationPermissionPrompt({
  onLocationGranted,
  onLocationDenied,
  onManualLocationSet,
  permissionStatus
}: LocationPermissionPromptProps) {
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      onLocationDenied();
      return;
    }

    setIsRequestingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationGranted({ lat: latitude, lng: longitude });
        setIsRequestingLocation(false);
      },
      (error) => {
        console.error("Location access denied:", error);
        onLocationDenied();
        setIsRequestingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleManualLocationSubmit = async () => {
    if (!manualAddress.trim()) return;
    
    setIsGeocodingAddress(true);
    
    // For demo purposes, we'll use a simple geocoding fallback
    // In production, you'd use the Google Geocoding API
    const commonLocations: Record<string, { lat: number; lng: number }> = {
      'new york': { lat: 40.7589, lng: -73.9851 },
      'london': { lat: 51.5074, lng: -0.1278 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'tokyo': { lat: 35.6762, lng: 139.6503 },
      'san francisco': { lat: 37.7749, lng: -122.4194 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'miami': { lat: 25.7617, lng: -80.1918 },
    };

    const normalizedAddress = manualAddress.toLowerCase().trim();
    const matchedLocation = commonLocations[normalizedAddress];
    
    if (matchedLocation) {
      onManualLocationSet({
        ...matchedLocation,
        address: manualAddress
      });
    } else {
      // Default to New York if no match found
      onManualLocationSet({
        lat: 40.7589,
        lng: -73.9851,
        address: manualAddress
      });
    }
    
    setIsGeocodingAddress(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="neopop-card border-primary/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            
            <CardTitle className="text-2xl gradient-text">
              Enable Location Access
            </CardTitle>
            
            <CardDescription className="text-base">
              TravelQuest uses your location to discover amazing places nearby and provide personalized recommendations.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Indicator */}
            <div className="flex items-center justify-center">
              {permissionStatus === 'pending' && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-500/50 bg-yellow-500/10">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Location access needed
                </Badge>
              )}
              
              {permissionStatus === 'denied' && (
                <Badge variant="outline" className="text-red-600 border-red-500/50 bg-red-500/10">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Location access denied
                </Badge>
              )}
              
              {permissionStatus === 'unsupported' && (
                <Badge variant="outline" className="text-gray-600 border-gray-500/50 bg-gray-500/10">
                  <Globe className="w-4 h-4 mr-1" />
                  Location not supported
                </Badge>
              )}
            </div>

            {/* Benefits List */}
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="p-2 rounded-full bg-primary/20">
                  <Search className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Discover nearby places</p>
                  <p className="text-sm text-muted-foreground">Find restaurants, landmarks, and attractions around you</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="p-2 rounded-full bg-green-500/20">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Smart check-ins</p>
                  <p className="text-sm text-muted-foreground">Earn XP by checking in at places you visit</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="p-2 rounded-full bg-purple-500/20">
                  <Smartphone className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Personalized recommendations</p>
                  <p className="text-sm text-muted-foreground">Get suggestions based on your travel style</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {permissionStatus !== 'unsupported' && (
                <Button
                  onClick={requestLocation}
                  disabled={isRequestingLocation}
                  className="w-full neopop-button"
                  size="lg"
                >
                  {isRequestingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Requesting location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5 mr-2" />
                      Enable Location Access
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={() => setShowManualInput(!showManualInput)}
                variant="outline"
                className="w-full neopop-button-outline"
                size="lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Set Location Manually
              </Button>
            </div>

            {/* Manual Location Input */}
            {showManualInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-4 border-t border-border/50"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enter your city or address
                  </label>
                  <Input
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="e.g., New York, London, Paris..."
                    className="neopop-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleManualLocationSubmit();
                      }
                    }}
                  />
                </div>
                
                <Button
                  onClick={handleManualLocationSubmit}
                  disabled={!manualAddress.trim() || isGeocodingAddress}
                  className="w-full neopop-button"
                >
                  {isGeocodingAddress ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Finding location...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Set This Location
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Privacy Note */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>🔒 Your location data is only used for place recommendations</p>
              <p>We never store or share your precise location</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}