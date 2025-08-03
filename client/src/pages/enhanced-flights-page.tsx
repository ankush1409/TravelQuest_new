import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";  
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Search, MapPin, Clock, AlertCircle, RefreshCw, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FlightDetailCard } from "@/components/ui/flight-detail-card";
import { AircraftInfoCard } from "@/components/ui/aircraft-info-card";

// Enhanced flight data interfaces
interface FlightData {
  flightNumber: string;
  airline: string;
  aircraftType: string;
  tailNumber: string;
  departure: {
    airport: string;
    airportCode: string;
    scheduledTime: Date;
    actualTime?: Date;
  };
  arrival: {
    airport: string;
    airportCode: string;
    scheduledTime: Date;
    actualTime?: Date;
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

interface InboundFlight extends FlightData {
  distanceToDestination?: number;
  estimatedTimeToArrival?: number;
}

interface AircraftInfo {
  tailNumber: string;
  aircraftType: string;
  airline: string;
  currentFlights: FlightData[];
  inboundFlights: InboundFlight[];
}

export default function EnhancedFlightsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'flight' | 'aircraft'>('flight');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedAirport, setSelectedAirport] = useState('LAX');

  // Flight search query
  const { data: flightData, isLoading: flightLoading, error: flightError } = useQuery<FlightData>({
    queryKey: ['/api/flights', activeSearch],
    enabled: !!activeSearch && searchType === 'flight',
    retry: false,
    refetchInterval: 60000, // Refresh every minute
  });

  // Aircraft search query
  const { data: aircraftData, isLoading: aircraftLoading, error: aircraftError } = useQuery<AircraftInfo>({
    queryKey: ['/api/flights/aircraft', activeSearch],
    enabled: !!activeSearch && searchType === 'aircraft',
    retry: false,
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  // Inbound flights query
  const { data: inboundFlights, isLoading: inboundLoading } = useQuery<InboundFlight[]>({
    queryKey: ['/api/flights/inbound', selectedAirport],
    refetchInterval: 60000, // Refresh every minute
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim().toUpperCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
  };

  const transformFlightDates = (flight: any): FlightData => {
    return {
      ...flight,
      departure: {
        ...flight.departure,
        scheduledTime: new Date(flight.departure.scheduledTime),
        actualTime: flight.departure.actualTime ? new Date(flight.departure.actualTime) : undefined,
      },
      arrival: {
        ...flight.arrival,
        scheduledTime: new Date(flight.arrival.scheduledTime),
        actualTime: flight.arrival.actualTime ? new Date(flight.arrival.actualTime) : undefined,
      },
    };
  };

  const transformAircraftDates = (aircraft: any): AircraftInfo => {
    return {
      ...aircraft,
      currentFlights: aircraft.currentFlights?.map(transformFlightDates) || [],
      inboundFlights: aircraft.inboundFlights?.map((flight: any) => ({
        ...transformFlightDates(flight),
        distanceToDestination: flight.distanceToDestination,
        estimatedTimeToArrival: flight.estimatedTimeToArrival,
      })) || [],
    };
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-purple-500/20">
            <Plane className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">Flight Radar Tracking</h1>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Track flights in real-time with comprehensive aircraft details, tail number lookup, 
          and inbound flight monitoring powered by FlightRadar24
        </p>
      </div>

      {/* Search Section */}
      <Card className="neopop-card bg-gray-900/50 border-gray-700/50 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-cyan-400" />
            Flight & Aircraft Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Type Toggle */}
          <div className="flex gap-2">
            <Button
              variant={searchType === 'flight' ? 'default' : 'outline'}
              onClick={() => setSearchType('flight')}
              className="neopop-button"
            >
              <Plane className="h-4 w-4 mr-2" />
              Flight Number
            </Button>
            <Button
              variant={searchType === 'aircraft' ? 'default' : 'outline'}
              onClick={() => setSearchType('aircraft')}
              className="neopop-button"
            >
              <Settings className="h-4 w-4 mr-2" />
              Tail Number
            </Button>
          </div>

          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder={searchType === 'flight' ? 'Enter flight number (e.g., AA1234, UA567)' : 'Enter aircraft tail number (e.g., N1234AB)'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
            />
            <Button 
              onClick={handleSearch} 
              disabled={!searchQuery.trim()}
              className="neopop-button px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {activeSearch && (
              <Button 
                onClick={clearSearch} 
                variant="outline"
                className="px-4"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Active Search Indicator */}
          {activeSearch && (
            <div className="flex items-center gap-2 text-sm text-cyan-400">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Tracking: {searchType === 'flight' ? 'Flight' : 'Aircraft'} {activeSearch}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {activeSearch && (
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                {searchType === 'flight' ? 'Flight Details' : 'Aircraft Details'}
              </TabsTrigger>
              <TabsTrigger value="inbound" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Inbound Flights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-0">
              {searchType === 'flight' && (
                <>
                  {flightLoading && (
                    <Card className="neopop-card bg-gray-900/50 border-gray-700/50">
                      <CardContent className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mr-2" />
                        <span className="text-white">Loading flight details...</span>
                      </CardContent>
                    </Card>
                  )}

                  {flightError && (
                    <Card className="neopop-card bg-red-900/20 border-red-700/50">
                      <CardContent className="flex items-center gap-2 py-4">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <span className="text-red-400">
                          Flight {activeSearch} not found. Please check the flight number and try again.
                        </span>
                      </CardContent>
                    </Card>
                  )}

                  {flightData && (
                    <FlightDetailCard flight={transformFlightDates(flightData)} />
                  )}
                </>
              )}

              {searchType === 'aircraft' && (
                <>
                  {aircraftLoading && (
                    <Card className="neopop-card bg-gray-900/50 border-gray-700/50">
                      <CardContent className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mr-2" />
                        <span className="text-white">Loading aircraft information...</span>
                      </CardContent>
                    </Card>
                  )}

                  {aircraftError && (
                    <Card className="neopop-card bg-red-900/20 border-red-700/50">
                      <CardContent className="flex items-center gap-2 py-4">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <span className="text-red-400">
                          Aircraft {activeSearch} not found. Please check the tail number and try again.
                        </span>
                      </CardContent>
                    </Card>
                  )}

                  {aircraftData && (
                    <AircraftInfoCard aircraft={transformAircraftDates(aircraftData)} />
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="inbound" className="mt-0">
              {/* Airport Selector */}
              <Card className="neopop-card bg-gray-900/50 border-gray-700/50 mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-400" />
                    Airport Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {['LAX', 'JFK', 'ORD', 'MIA', 'SFO', 'SEA', 'ATL', 'DEN'].map(airport => (
                      <Button
                        key={airport}
                        variant={selectedAirport === airport ? 'default' : 'outline'}
                        onClick={() => setSelectedAirport(airport)}
                        className="neopop-button"
                      >
                        {airport}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Inbound Flights List */}
              {inboundLoading && (
                <Card className="neopop-card bg-gray-900/50 border-gray-700/50">
                  <CardContent className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mr-2" />
                    <span className="text-white">Loading inbound flights for {selectedAirport}...</span>
                  </CardContent>
                </Card>
              )}

              {inboundFlights && inboundFlights.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-white text-xl font-semibold">
                    Inbound Flights to {selectedAirport} ({inboundFlights.length})
                  </h3>
                  <div className="grid gap-4">
                    {inboundFlights.map((flight, index) => (
                      <FlightDetailCard 
                        key={index} 
                        flight={transformFlightDates(flight)} 
                        className="hover:border-cyan-400/50 transition-colors cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Default View - Inbound Flights */}
      {!activeSearch && (
        <div className="max-w-6xl mx-auto">
          <Card className="neopop-card bg-gray-900/50 border-gray-700/50 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-400" />
                Live Inbound Flights - {selectedAirport}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {['LAX', 'JFK', 'ORD', 'MIA', 'SFO', 'SEA', 'ATL', 'DEN'].map(airport => (
                  <Button
                    key={airport}
                    variant={selectedAirport === airport ? 'default' : 'outline'}
                    onClick={() => setSelectedAirport(airport)}
                    className="neopop-button"
                  >
                    {airport}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {inboundLoading && (
            <Card className="neopop-card bg-gray-900/50 border-gray-700/50">
              <CardContent className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mr-2" />
                <span className="text-white">Loading inbound flights...</span>
              </CardContent>
            </Card>
          )}

          {inboundFlights && inboundFlights.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white text-xl font-semibold">
                Live Inbound Flights ({inboundFlights.length})
              </h3>
              <div className="grid gap-4">
                {inboundFlights.slice(0, 8).map((flight, index) => (
                  <FlightDetailCard 
                    key={index} 
                    flight={transformFlightDates(flight)} 
                    className="hover:border-cyan-400/50 transition-colors"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}