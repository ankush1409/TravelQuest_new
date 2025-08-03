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

  // Search for specific flight
  const searchFlightMutation = useMutation({
    mutationFn: async (flightNumber: string) => {
      const res = await apiRequest("GET", `/api/flights/search?q=${flightNumber}`);
      return await res.json();
    },
    onSuccess: (data: FlightData) => {
      console.log("Flight data received:", data);
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
        <AnimatePresence>
          {selectedFlight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <FlightDetailCard flight={selectedFlight} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Removed Inbound Flights section as per requirements */}
      </div>
    </div>
  );
}