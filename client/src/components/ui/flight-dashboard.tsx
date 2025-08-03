import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Plane, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  MapPin,
  Navigation,
  Gauge,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";

interface FlightDashboardProps {
  inboundFlights?: any[];
  isLoading?: boolean;
}

export function FlightDashboard({ inboundFlights = [], isLoading = false }: FlightDashboardProps) {
  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  return (
    <Card className="neopop-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Plane className="w-5 h-5 mr-2 text-primary" />
            Flight Tracker
          </CardTitle>
          <Link href="/flights">
            <Button variant="outline" size="sm" className="neopop-button">
              View All
            </Button>
          </Link>
        </div>
        <CardDescription>
          Real-time flight tracking and arrivals
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : inboundFlights.length > 0 ? (
          <div className="space-y-3">
            {inboundFlights.slice(0, 3).map((flight, index) => (
              <motion.div
                key={`${flight.flightNumber}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{flight.flightNumber}</span>
                      <span className="text-xs text-muted-foreground">{flight.airline}</span>
                    </div>
                    <div className="hidden sm:flex items-center text-muted-foreground text-xs">
                      <span>{flight.departure?.airportCode}</span>
                      <div className="w-4 border-t border-dashed mx-2"></div>
                      <Plane className="w-3 h-3" />
                      <div className="w-4 border-t border-dashed mx-2"></div>
                      <span>{flight.arrival?.airportCode}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {flight.estimatedTimeToArrival && (
                      <div className="text-right">
                        <div className="text-xs font-medium text-primary">
                          {flight.estimatedTimeToArrival} min
                        </div>
                      </div>
                    )}
                    <Badge className={`${getStatusColor(flight.status)} border-0 text-xs`}>
                      {getStatusIcon(flight.status)}
                      <span className="ml-1 capitalize">{flight.status}</span>
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <div className="pt-2 text-center">
              <Link href="/flights">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  View all flights →
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No flights tracked</p>
            <Link href="/flights">
              <Button variant="ghost" size="sm" className="mt-2 text-primary">
                Start tracking flights
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}