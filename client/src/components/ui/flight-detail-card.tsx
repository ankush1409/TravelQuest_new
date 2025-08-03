import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Clock, Gauge, Compass, Mountain } from "lucide-react";

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

interface FlightDetailCardProps {
  flight: FlightData;
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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export function FlightDetailCard({ flight, className = "" }: FlightDetailCardProps) {
  return (
    <Card className={`neopop-card bg-gray-900/50 border-gray-700/50 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Plane className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-white font-bold">
                {flight.flightNumber}
              </CardTitle>
              <p className="text-gray-400 text-sm">{flight.airline}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(flight.status)} font-medium`}>
            {flight.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Aircraft Information */}
        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Plane className="h-4 w-4 text-cyan-400" />
            Aircraft Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Tail Number</p>
              <p className="text-white font-mono font-bold text-lg neon-glow-cyan">
                {flight.tailNumber}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Aircraft Type</p>
              <p className="text-white font-medium">{flight.aircraftType}</p>
            </div>
          </div>
        </div>

        {/* Route Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-400" />
              Departure
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-green-400 font-bold text-lg">{flight.departure.airportCode}</p>
                <p className="text-gray-300 text-sm">{flight.departure.airport}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-gray-400">Scheduled:</span>
                <span className="text-white">
                  {formatTime(flight.departure.scheduledTime)} - {formatDate(flight.departure.scheduledTime)}
                </span>
              </div>
              {flight.departure.actualTime && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3 text-green-400" />
                  <span className="text-gray-400">Actual:</span>
                  <span className="text-green-400">
                    {formatTime(flight.departure.actualTime)} - {formatDate(flight.departure.actualTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-400" />
              Arrival
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-red-400 font-bold text-lg">{flight.arrival.airportCode}</p>
                <p className="text-gray-300 text-sm">{flight.arrival.airport}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-gray-400">Scheduled:</span>
                <span className="text-white">
                  {formatTime(flight.arrival.scheduledTime)} - {formatDate(flight.arrival.scheduledTime)}
                </span>
              </div>
              {flight.arrival.gate && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Gate:</span>
                  <span className="text-yellow-400 font-bold">{flight.arrival.gate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Position Data */}
        {flight.position && (
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Compass className="h-4 w-4 text-purple-400" />
              Live Position
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Mountain className="h-3 w-3 text-blue-400" />
                  <span className="text-gray-400">Altitude</span>
                </div>
                <p className="text-blue-400 font-bold">
                  {flight.position.altitude.toLocaleString()} ft
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Gauge className="h-3 w-3 text-green-400" />
                  <span className="text-gray-400">Speed</span>
                </div>
                <p className="text-green-400 font-bold">
                  {Math.round(flight.position.speed)} kt
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Compass className="h-3 w-3 text-yellow-400" />
                  <span className="text-gray-400">Heading</span>
                </div>
                <p className="text-yellow-400 font-bold">
                  {Math.round(flight.position.heading)}°
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MapPin className="h-3 w-3 text-purple-400" />
                  <span className="text-gray-400">Coords</span>
                </div>
                <p className="text-purple-400 font-bold text-xs">
                  {flight.position.latitude.toFixed(2)}, {flight.position.longitude.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Flight Progress */}
        {flight.progress !== undefined && (
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Flight Progress</span>
              <span className="text-cyan-400 font-bold">{flight.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${flight.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Route Stats */}
        {flight.route && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <p className="text-gray-400 text-sm mb-1">Distance</p>
              <p className="text-white font-bold text-lg">
                {flight.route.distance.toLocaleString()} nm
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <p className="text-gray-400 text-sm mb-1">Flight Time</p>
              <p className="text-white font-bold text-lg">
                {Math.floor(flight.route.flightTime / 60)}h {flight.route.flightTime % 60}m
              </p>
            </div>
          </div>
        )}

        {/* Delay Information */}
        {flight.delay && flight.delay > 0 && (
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-400/30">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400 font-semibold">
                Delayed by {flight.delay} minutes
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}