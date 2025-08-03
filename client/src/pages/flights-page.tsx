import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Tabs component not needed for current implementation
import { 
  Plane, 
  Search, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Loader2,
  Navigation,
  Gauge,
  BarChart3
} from "lucide-react";
import { FlightDetailCard } from "@/components/ui/flight-detail-card";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FlightData {
  flightNumber: string;
  airline: string;
  aircraftType: string;
  tailNumber?: string;
  departure: {
    airport: string;
    airportCode: string;
    scheduledTime: string;
    actualTime?: string;
  };
  arrival: {
    airport: string;
    airportCode: string;
    scheduledTime: string;
    actualTime?: string;
    gate?: string;
  };
  status: 'scheduled' | 'boarding' | 'departed' | 'en-route' | 'delayed' | 'landed' | 'cancelled';
  position?: {
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    heading: number;
  };
  delay?: number;
  progress?: number;
  route?: {
    distance: number;
    flightTime: number;
  };
}

export default function FlightsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const { toast } = useToast();

  // Debug effect to track selectedFlight changes
  useEffect(() => {
    console.log("selectedFlight state changed:", selectedFlight);
  }, [selectedFlight]);

  // Search for specific flight
  const searchFlightMutation = useMutation({
    mutationFn: async (flightNumber: string) => {
      const res = await apiRequest("GET", `/api/flights/search?q=${flightNumber}`);
      return await res.json();
    },
    onSuccess: (data: FlightData) => {
      console.log("Flight data received:", data);
      console.log("Setting selectedFlight state");
      setSelectedFlight(data);
      toast({
        title: "Flight Found",
        description: `Found ${data.flightNumber} - ${data.airline}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Flight Not Found",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Removed inbound flights functionality as per requirements

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchFlightMutation.mutate(searchQuery.toUpperCase());
    }
  };

  // Removed redundant formatting functions as they are now in FlightDetailCard

  return (
    <div className="min-h-screen bg-background pt-20 pb-32 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center neopop-card">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-foreground">Flight Tracker</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search and track any flight by flight number with detailed real-time information
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="neopop-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2 text-primary" />
                Flight Search
              </CardTitle>
              <CardDescription>
                Search for any flight by flight number (e.g., AA1234, UA567)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter flight number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={searchFlightMutation.isPending || !searchQuery.trim()}
                  className="neopop-button"
                >
                  {searchFlightMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Flight Details with New Card */}
        {selectedFlight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            <Card className="neopop-card bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🇺🇸</div>
                    <div>
                      <CardTitle className="text-white text-xl flex items-center gap-2">
                        {selectedFlight.airline} 
                        <span className="text-cyan-400 font-mono">{selectedFlight.flightNumber}</span>
                      </CardTitle>
                      <p className="text-gray-400 text-sm">
                        {selectedFlight.aircraftType}
                        {selectedFlight.tailNumber && (
                          <span className="text-cyan-300 font-mono ml-2">• {selectedFlight.tailNumber}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 font-semibold flex items-center gap-1 px-3 py-1">
                    <CheckCircle className="h-4 w-4" />
                    {selectedFlight.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Route Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Departure */}
                  <div className="text-center p-4 rounded-lg bg-gray-800/30 border border-gray-600/30">
                    <div className="text-2xl font-bold text-cyan-400 font-mono">
                      {selectedFlight.departure.airportCode}
                    </div>
                    <div className="text-sm text-gray-300 mb-2">{selectedFlight.departure.airport}</div>
                    <div className="space-y-1">
                      <div className="text-sm text-white">
                        {new Date(selectedFlight.departure.scheduledTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Flight Progress */}
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                      <Plane className="h-4 w-4 text-blue-400 transform rotate-90" />
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    </div>
                    {selectedFlight.progress && (
                      <div className="w-full space-y-1">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedFlight.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-center text-gray-400">
                          {selectedFlight.progress}% Complete
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrival */}
                  <div className="text-center p-4 rounded-lg bg-gray-800/30 border border-gray-600/30">
                    <div className="text-2xl font-bold text-purple-400 font-mono">
                      {selectedFlight.arrival.airportCode}
                    </div>
                    <div className="text-sm text-gray-300 mb-2">{selectedFlight.arrival.airport}</div>
                    <div className="space-y-1">
                      <div className="text-sm text-white">
                        {new Date(selectedFlight.arrival.scheduledTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                      {selectedFlight.arrival.gate && (
                        <div className="text-xs text-purple-400">
                          Gate {selectedFlight.arrival.gate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Position Data */}
                {selectedFlight.position && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="text-lg font-bold text-green-400">
                        {selectedFlight.position.altitude.toLocaleString()}
                      </div>
                      <div className="text-xs text-green-300">Altitude (ft)</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-lg font-bold text-blue-400">
                        {Math.round(selectedFlight.position.speed)}
                      </div>
                      <div className="text-xs text-blue-300">Speed (kts)</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="text-lg font-bold text-purple-400 flex items-center justify-center gap-1">
                        <Navigation className="h-4 w-4" style={{transform: `rotate(${selectedFlight.position.heading}deg)`}} />
                        {Math.round(selectedFlight.position.heading)}°
                      </div>
                      <div className="text-xs text-purple-300">Heading</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <div className="text-lg font-bold text-cyan-400">
                        <MapPin className="h-4 w-4 mx-auto mb-1" />
                      </div>
                      <div className="text-xs text-cyan-300">
                        {selectedFlight.position.latitude.toFixed(2)}°, {selectedFlight.position.longitude.toFixed(2)}°
                      </div>
                    </div>
                  </div>
                )}

                {/* Map Placeholder */}
                <div className="p-6 rounded-lg bg-gray-800/30 border border-gray-600/30">
                  <div className="text-center space-y-3">
                    <div className="text-gray-400 text-sm flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Live Flight Map
                    </div>
                    <div className="h-32 bg-gray-900/50 rounded-lg flex items-center justify-center border border-gray-700/50">
                      <div className="text-gray-500 text-sm">
                        Interactive flight path visualization
                        <br />
                        <span className="text-xs">Current position: {selectedFlight.position?.latitude.toFixed(4)}°, {selectedFlight.position?.longitude.toFixed(4)}°</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Map shows real-time aircraft position and planned route
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Debug info */}
        <div className="mt-4 p-4 bg-gray-800 rounded text-xs text-gray-400">
          Debug: selectedFlight = {selectedFlight ? `${selectedFlight.flightNumber} (${selectedFlight.airline})` : 'null'}
        </div>

        {/* Removed Inbound Flights section as per requirements */}
      </div>
    </div>
  );
}