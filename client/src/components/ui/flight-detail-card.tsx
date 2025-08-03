import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plane, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Navigation,
  Gauge,
  Timer,
  Route,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";

interface FlightPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
}

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
  position?: FlightPosition;
  delay?: number;
  progress?: number;
  route?: {
    distance: number;
    flightTime: number;
  };
}

interface FlightDetailCardProps {
  flight: FlightData;
  onTrackFlight?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
    case 'boarding':
    case 'en-route':
    case 'landed':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'delayed':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'scheduled':
    case 'boarding':
      return <Clock className="h-4 w-4" />;
    case 'en-route':
    case 'landed':
      return <CheckCircle className="h-4 w-4" />;
    case 'delayed':
      return <AlertCircle className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getAirlineLogo = (airline: string) => {
  // Simple airline logo placeholder - in production, you'd use actual airline logos
  const logoMap: { [key: string]: string } = {
    'American Airlines': '🇺🇸',
    'United Airlines': '🔵',
    'Delta Air Lines': '🔺',
    'Southwest Airlines': '💚',
    'JetBlue Airways': '🔷',
  };
  return logoMap[airline] || '✈️';
};

const formatTime = (timeString: string) => {
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatDate = (timeString: string) => {
  return new Date(timeString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const calculateETA = (flight: FlightData) => {
  if (flight.status === 'landed') return 'Arrived';
  if (flight.status === 'cancelled') return 'Cancelled';
  
  const arrivalTime = new Date(flight.arrival.scheduledTime);
  const now = new Date();
  const diffMs = arrivalTime.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffMs <= 0) return 'Overdue';
  if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`;
  return `${diffMinutes}m`;
};

export function FlightDetailCard({ flight, onTrackFlight }: FlightDetailCardProps) {
  const statusColor = getStatusColor(flight.status);
  const statusIcon = getStatusIcon(flight.status);
  const airlineLogo = getAirlineLogo(flight.airline);
  const eta = calculateETA(flight);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="neopop-card bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30 overflow-hidden">
        {/* Header with Airline and Flight Info */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{airlineLogo}</div>
              <div>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  {flight.airline} 
                  <span className="text-cyan-400 font-mono">{flight.flightNumber}</span>
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  {flight.aircraftType}
                  {flight.tailNumber && (
                    <span className="text-cyan-300 font-mono ml-2">• {flight.tailNumber}</span>
                  )}
                </p>
              </div>
            </div>
            <Badge className={`${statusColor} font-semibold flex items-center gap-1 px-3 py-1`}>
              {statusIcon}
              {flight.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Departure */}
            <div className="text-center p-4 rounded-lg bg-gray-800/30 border border-gray-600/30">
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {flight.departure.airportCode}
              </div>
              <div className="text-sm text-gray-300 mb-2">{flight.departure.airport}</div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {formatDate(flight.departure.scheduledTime)}
                </div>
                <div className="text-sm text-white">
                  {formatTime(flight.departure.scheduledTime)}
                </div>
                {flight.departure.actualTime && (
                  <div className="text-xs text-green-400">
                    Actual: {formatTime(flight.departure.actualTime)}
                  </div>
                )}
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
              {flight.progress && (
                <div className="w-full space-y-1">
                  <Progress value={flight.progress} className="h-2" />
                  <div className="text-xs text-center text-gray-400">
                    {flight.progress}% Complete
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Timer className="h-3 w-3" />
                ETA: {eta}
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center p-4 rounded-lg bg-gray-800/30 border border-gray-600/30">
              <div className="text-2xl font-bold text-purple-400 font-mono">
                {flight.arrival.airportCode}
              </div>
              <div className="text-sm text-gray-300 mb-2">{flight.arrival.airport}</div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {formatDate(flight.arrival.scheduledTime)}
                </div>
                <div className="text-sm text-white">
                  {formatTime(flight.arrival.scheduledTime)}
                </div>
                {flight.arrival.gate && (
                  <div className="text-xs text-purple-400">
                    Gate {flight.arrival.gate}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delay Information */}
          {flight.delay && flight.delay > 0 && (
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center gap-2 text-orange-300">
                <AlertCircle className="h-4 w-4" />
                <span className="font-semibold">Delayed {flight.delay} minutes</span>
              </div>
            </div>
          )}

          {/* Live Position Data */}
          {flight.position && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-lg font-bold text-green-400">
                  {flight.position.altitude.toLocaleString()}
                </div>
                <div className="text-xs text-green-300">Altitude (ft)</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-lg font-bold text-blue-400">
                  {Math.round(flight.position.speed)}
                </div>
                <div className="text-xs text-blue-300">Speed (kts)</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="text-lg font-bold text-purple-400 flex items-center justify-center gap-1">
                  <Navigation className="h-4 w-4" style={{transform: `rotate(${flight.position.heading}deg)`}} />
                  {Math.round(flight.position.heading)}°
                </div>
                <div className="text-xs text-purple-300">Heading</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <div className="text-lg font-bold text-cyan-400">
                  <MapPin className="h-4 w-4 mx-auto mb-1" />
                </div>
                <div className="text-xs text-cyan-300">
                  {flight.position.latitude.toFixed(2)}°, {flight.position.longitude.toFixed(2)}°
                </div>
              </div>
            </div>
          )}

          {/* Route Information */}
          {flight.route && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-600/30">
              <div className="flex items-center gap-2 text-gray-300">
                <Route className="h-4 w-4" />
                <span className="text-sm">Route Distance:</span>
                <span className="font-semibold text-white">{flight.route.distance} nm</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Flight Time:</span>
                <span className="font-semibold text-white">
                  {Math.floor(flight.route.flightTime / 60)}h {flight.route.flightTime % 60}m
                </span>
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
                  <span className="text-xs">Current position: {flight.position?.latitude.toFixed(4)}°, {flight.position?.longitude.toFixed(4)}°</span>
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
  );
}