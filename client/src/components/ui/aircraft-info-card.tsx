import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Clock, ArrowRight } from "lucide-react";

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

interface AircraftInfoCardProps {
  aircraft: AircraftInfo;
  className?: string;
}

const getStatusColor = (status: FlightData['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
    case 'boarding': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
    case 'en-route': return 'bg-green-500/20 text-green-400 border-green-400/30';
    case 'delayed': return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
    case 'landed': return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-400/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
  }
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

export function AircraftInfoCard({ aircraft, className = "" }: AircraftInfoCardProps) {
  return (
    <Card className={`neopop-card bg-gray-900/50 border-gray-700/50 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-500/20">
            <Plane className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white font-bold neon-glow-purple">
              {aircraft.tailNumber}
            </CardTitle>
            <p className="text-gray-400">{aircraft.aircraftType}</p>
            <p className="text-gray-300 text-sm">{aircraft.airline}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Flights */}
        {aircraft.currentFlights.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Plane className="h-4 w-4 text-green-400" />
              Current Flights
            </h3>
            <div className="space-y-3">
              {aircraft.currentFlights.map((flight, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-purple-400/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-lg">{flight.flightNumber}</span>
                      <Badge className={`${getStatusColor(flight.status)} text-xs`}>
                        {flight.status.toUpperCase()}
                      </Badge>
                    </div>
                    {flight.delay && flight.delay > 0 && (
                      <span className="text-orange-400 text-sm font-medium">
                        +{flight.delay}min
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-green-400" />
                      <span className="text-green-400 font-medium">{flight.departure.airportCode}</span>
                      <span className="text-gray-400">{formatTime(flight.departure.scheduledTime)}</span>
                    </div>
                    
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-red-400" />
                      <span className="text-red-400 font-medium">{flight.arrival.airportCode}</span>
                      <span className="text-gray-400">{formatTime(flight.arrival.scheduledTime)}</span>
                    </div>
                    
                    {flight.arrival.gate && (
                      <span className="text-yellow-400 text-xs font-medium ml-2">
                        Gate {flight.arrival.gate}
                      </span>
                    )}
                  </div>

                  {flight.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-xs">Progress</span>
                        <span className="text-cyan-400 text-xs font-bold">{flight.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${flight.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inbound Flights */}
        {aircraft.inboundFlights.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              Inbound Flights Using This Aircraft
            </h3>
            <div className="space-y-3">
              {aircraft.inboundFlights.slice(0, 6).map((flight, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-cyan-400/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-lg">{flight.flightNumber}</span>
                      <Badge className={`${getStatusColor(flight.status)} text-xs`}>
                        {flight.status.toUpperCase()}
                      </Badge>
                    </div>
                    {flight.estimatedTimeToArrival && (
                      <span className="text-cyan-400 text-sm font-medium">
                        ETA: {flight.estimatedTimeToArrival}min
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-green-400" />
                        <span className="text-green-400 font-medium">{flight.departure.airportCode}</span>
                      </div>
                      
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-400" />
                        <span className="text-red-400 font-medium">{flight.arrival.airportCode}</span>
                      </div>
                    </div>

                    {flight.distanceToDestination && (
                      <span className="text-gray-400 text-xs">
                        {flight.distanceToDestination}km away
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    Scheduled: {formatTime(flight.arrival.scheduledTime)}
                    {flight.arrival.gate && (
                      <span className="text-yellow-400 ml-2">Gate {flight.arrival.gate}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No flights message */}
        {aircraft.currentFlights.length === 0 && aircraft.inboundFlights.length === 0 && (
          <div className="text-center py-8">
            <Plane className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No active flights found for this aircraft</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}