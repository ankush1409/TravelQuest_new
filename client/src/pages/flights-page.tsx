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
}

export default function FlightsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const { toast } = useToast();

  // Search for specific flight
  const searchFlightMutation = useMutation({
    mutationFn: async (flightNumber: string) => {
      const res = await apiRequest("GET", `/api/flights/search?query=${flightNumber}`);
      return await res.json();
    },
    onSuccess: (data: FlightData) => {
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

  const getStatusColor = (status: FlightData['status']) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-500/10';
      case 'boarding': return 'text-yellow-400 bg-yellow-500/10';
      case 'departed': 
      case 'en-route': return 'text-green-400 bg-green-500/10';
      case 'delayed': return 'text-orange-400 bg-orange-500/10';
      case 'landed': return 'text-emerald-400 bg-emerald-500/10';
      case 'cancelled': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: FlightData['status']) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'boarding': return <AlertCircle className="w-4 h-4" />;
      case 'departed':
      case 'en-route': return <Plane className="w-4 h-4" />;
      case 'delayed': return <AlertCircle className="w-4 h-4" />;
      case 'landed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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

        {/* Selected Flight Details */}
        <AnimatePresence>
          {selectedFlight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card className="neopop-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Plane className="w-5 h-5 mr-2 text-primary" />
                      {selectedFlight.flightNumber} - {selectedFlight.airline}
                    </CardTitle>
                    <Badge className={`${getStatusColor(selectedFlight.status)} border-0`}>
                      {getStatusIcon(selectedFlight.status)}
                      <span className="ml-1 capitalize">{selectedFlight.status}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    {selectedFlight.aircraftType}
                    {selectedFlight.tailNumber && (
                      <span className="ml-2 text-primary font-medium">• {selectedFlight.tailNumber}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Departure Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-green-400" />
                        Departure
                      </h3>
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Airport:</span>
                          <span className="font-medium">{selectedFlight.departure.airport}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Code:</span>
                          <span className="font-bold text-primary">{selectedFlight.departure.airportCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Scheduled:</span>
                          <span>{formatTime(selectedFlight.departure.scheduledTime)}</span>
                        </div>
                        {selectedFlight.departure.actualTime && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Actual:</span>
                            <span className="text-green-400">{formatTime(selectedFlight.departure.actualTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrival Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-red-400" />
                        Arrival
                      </h3>
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Airport:</span>
                          <span className="font-medium">{selectedFlight.arrival.airport}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Code:</span>
                          <span className="font-bold text-primary">{selectedFlight.arrival.airportCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Scheduled:</span>
                          <span>{formatTime(selectedFlight.arrival.scheduledTime)}</span>
                        </div>
                        {selectedFlight.arrival.actualTime && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Actual:</span>
                            <span className="text-green-400">{formatTime(selectedFlight.arrival.actualTime)}</span>
                          </div>
                        )}
                        {selectedFlight.arrival.gate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gate:</span>
                            <span className="font-bold text-yellow-400">{selectedFlight.arrival.gate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flight Progress & Position */}
                  {selectedFlight.position && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-400">{selectedFlight.position.altitude?.toLocaleString()} ft</p>
                        <p className="text-xs text-muted-foreground">Altitude</p>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <Gauge className="w-6 h-6 text-green-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-green-400">{selectedFlight.position.speed} mph</p>
                        <p className="text-xs text-muted-foreground">Speed</p>
                      </div>
                      <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                        <Navigation className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-purple-400">{selectedFlight.position.heading}°</p>
                        <p className="text-xs text-muted-foreground">Heading</p>
                      </div>
                      {selectedFlight.progress && (
                        <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                          <Clock className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                          <p className="text-lg font-bold text-orange-400">{selectedFlight.progress}%</p>
                          <p className="text-xs text-muted-foreground">Progress</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedFlight.delay && selectedFlight.delay > 0 && (
                    <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-orange-400 mr-2" />
                        <span className="text-orange-400 font-medium">
                          Flight delayed by {selectedFlight.delay} minutes
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Removed Inbound Flights section as per requirements */}
      </div>
    </div>
  );
}