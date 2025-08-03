import { storage } from './storage';

export interface FlightData {
  flightNumber: string;
  airline: string;
  aircraftType: string;
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
  delay?: number; // minutes
  progress?: number; // 0-100%
}

export interface InboundFlight extends FlightData {
  distanceToDestination?: number; // km
  estimatedTimeToArrival?: number; // minutes
}

export class FlightRadarService {
  private apiKey: string;
  private baseUrl = 'https://fr24api.flightradar24.com';
  private useSandbox = true; // Use sandbox for testing

  constructor() {
    this.apiKey = process.env.FLIGHTRADAR24_API_KEY || '';
    if (!this.apiKey && this.useSandbox) {
      console.log('Using FlightRadar24 sandbox environment for testing');
    } else if (!this.apiKey) {
      console.warn('FlightRadar24 API key not found. Using demo data for development.');
    }
  }

  /**
   * Search flights by flight number
   */
  async searchFlight(flightNumber: string): Promise<FlightData | null> {
    // Use sandbox environment for testing
    if (this.useSandbox) {
      return this.generateDemoFlightData(flightNumber);
    }

    if (!this.apiKey) {
      return this.generateDemoFlightData(flightNumber);
    }

    try {
      const response = await fetch(`${this.baseUrl}/flights/search?query=${flightNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`FlightRadar24 API returned ${response.status}, falling back to demo data`);
        return this.generateDemoFlightData(flightNumber);
      }

      const data = await response.json();
      return this.transformApiResponse(data);
    } catch (error) {
      console.error('Error fetching flight data:', error);
      return this.generateDemoFlightData(flightNumber);
    }
  }

  /**
   * Get inbound flights for a specific airport
   */
  async getInboundFlights(airportCode: string): Promise<InboundFlight[]> {
    // Use sandbox environment for testing
    if (this.useSandbox) {
      return this.generateDemoInboundFlights(airportCode);
    }

    if (!this.apiKey) {
      return this.generateDemoInboundFlights(airportCode);
    }

    try {
      const response = await fetch(`${this.baseUrl}/airports/arrivals?airport=${airportCode}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`FlightRadar24 API returned ${response.status}, falling back to demo data`);
        return this.generateDemoInboundFlights(airportCode);
      }

      const data = await response.json();
      return this.transformInboundFlights(data);
    } catch (error) {
      console.error('Error fetching inbound flights:', error);
      return this.generateDemoInboundFlights(airportCode);
    }
  }

  /**
   * Get real-time flight position and status
   */
  async getFlightPosition(flightId: string): Promise<FlightData['position'] | null> {
    // Use sandbox environment for testing
    if (this.useSandbox) {
      return this.generateDemoPosition();
    }

    if (!this.apiKey) {
      return this.generateDemoPosition();
    }

    try {
      const response = await fetch(`${this.baseUrl}/flights/track?flight=${flightId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`FlightRadar24 API returned ${response.status}, falling back to demo data`);
        return this.generateDemoPosition();
      }

      const data = await response.json();
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        speed: data.speed,
        heading: data.heading
      };
    } catch (error) {
      console.error('Error fetching flight position:', error);
      return this.generateDemoPosition();
    }
  }

  /**
   * Transform API response to our FlightData format
   */
  private transformApiResponse(apiData: any): FlightData {
    return {
      flightNumber: apiData.flight?.identification?.number?.default || 'N/A',
      airline: apiData.flight?.airline?.name || 'Unknown Airline',
      aircraftType: apiData.flight?.aircraft?.model?.text || 'Unknown Aircraft',
      departure: {
        airport: apiData.flight?.airport?.origin?.name || 'Unknown',
        airportCode: apiData.flight?.airport?.origin?.code?.iata || 'N/A',
        scheduledTime: new Date(apiData.flight?.time?.scheduled?.departure * 1000),
        actualTime: apiData.flight?.time?.real?.departure ? 
          new Date(apiData.flight?.time?.real?.departure * 1000) : undefined
      },
      arrival: {
        airport: apiData.flight?.airport?.destination?.name || 'Unknown',
        airportCode: apiData.flight?.airport?.destination?.code?.iata || 'N/A',
        scheduledTime: new Date(apiData.flight?.time?.scheduled?.arrival * 1000),
        actualTime: apiData.flight?.time?.real?.arrival ? 
          new Date(apiData.flight?.time?.real?.arrival * 1000) : undefined,
        gate: apiData.flight?.airport?.destination?.info?.gate
      },
      status: this.mapStatus(apiData.flight?.status?.text),
      position: apiData.flight?.trail ? {
        latitude: apiData.flight.trail[apiData.flight.trail.length - 1]?.lat,
        longitude: apiData.flight.trail[apiData.flight.trail.length - 1]?.lng,
        altitude: apiData.flight.trail[apiData.flight.trail.length - 1]?.alt,
        speed: apiData.flight?.trail[apiData.flight.trail.length - 1]?.spd,
        heading: apiData.flight?.trail[apiData.flight.trail.length - 1]?.hd
      } : undefined,
      delay: apiData.flight?.time?.real?.departure && apiData.flight?.time?.scheduled?.departure ?
        Math.round((apiData.flight.time.real.departure - apiData.flight.time.scheduled.departure) / 60) : undefined
    };
  }

  /**
   * Transform inbound flights API response
   */
  private transformInboundFlights(apiData: any): InboundFlight[] {
    if (!apiData?.arrivals) return [];

    return apiData.arrivals.map((flight: any) => ({
      ...this.transformApiResponse({ flight }),
      distanceToDestination: flight.distance,
      estimatedTimeToArrival: flight.eta
    }));
  }

  /**
   * Map API status to our status enum
   */
  private mapStatus(apiStatus: string): FlightData['status'] {
    const status = apiStatus?.toLowerCase() || '';
    if (status.includes('scheduled')) return 'scheduled';
    if (status.includes('boarding')) return 'boarding';
    if (status.includes('departed') || status.includes('airborne')) return 'en-route';
    if (status.includes('delayed')) return 'delayed';
    if (status.includes('landed') || status.includes('arrived')) return 'landed';
    if (status.includes('cancelled')) return 'cancelled';
    return 'scheduled';
  }

  /**
   * Generate demo flight data for development/testing
   */
  private generateDemoFlightData(flightNumber: string): FlightData {
    const airlines = ['American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines', 'JetBlue Airways'];
    const aircraftTypes = ['Boeing 737-800', 'Airbus A320', 'Boeing 777-200', 'Airbus A330-300', 'Boeing 787-9'];
    const airports = [
      { name: 'Los Angeles International', code: 'LAX' },
      { name: 'John F. Kennedy International', code: 'JFK' },
      { name: 'Chicago O\'Hare International', code: 'ORD' },
      { name: 'Miami International', code: 'MIA' },
      { name: 'San Francisco International', code: 'SFO' }
    ];
    
    const now = new Date();
    const departureTime = new Date(now.getTime() - Math.random() * 3 * 60 * 60 * 1000); // 0-3 hours ago
    const arrivalTime = new Date(departureTime.getTime() + (2 + Math.random() * 4) * 60 * 60 * 1000); // 2-6 hours flight
    
    const departure = airports[Math.floor(Math.random() * airports.length)];
    const arrival = airports[Math.floor(Math.random() * airports.length)];
    
    return {
      flightNumber: flightNumber || `AA${Math.floor(Math.random() * 9000) + 1000}`,
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      aircraftType: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
      departure: {
        airport: departure.name,
        airportCode: departure.code,
        scheduledTime: departureTime,
        actualTime: new Date(departureTime.getTime() + (Math.random() - 0.5) * 30 * 60 * 1000) // ±30 min
      },
      arrival: {
        airport: arrival.name,
        airportCode: arrival.code,
        scheduledTime: arrivalTime,
        actualTime: Math.random() > 0.7 ? new Date(arrivalTime.getTime() + (Math.random() - 0.5) * 60 * 60 * 1000) : undefined,
        gate: `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 30) + 1}`
      },
      status: ['en-route', 'delayed', 'scheduled', 'landed'][Math.floor(Math.random() * 4)] as FlightData['status'],
      position: {
        latitude: 34.0522 + (Math.random() - 0.5) * 20, // Around LA area
        longitude: -118.2437 + (Math.random() - 0.5) * 20,
        altitude: 35000 + Math.random() * 5000,
        speed: 450 + Math.random() * 100,
        heading: Math.random() * 360
      },
      delay: Math.random() > 0.7 ? Math.floor(Math.random() * 120) : undefined,
      progress: Math.floor(Math.random() * 100)
    };
  }

  /**
   * Generate demo inbound flights
   */
  private generateDemoInboundFlights(airportCode: string): InboundFlight[] {
    const flights: InboundFlight[] = [];
    const flightCount = 8 + Math.floor(Math.random() * 12); // 8-20 flights
    
    for (let i = 0; i < flightCount; i++) {
      const baseData = this.generateDemoFlightData('');
      flights.push({
        ...baseData,
        arrival: {
          ...baseData.arrival,
          airportCode: airportCode,
          airport: `${airportCode} International Airport`
        },
        distanceToDestination: Math.floor(Math.random() * 500) + 50, // 50-550 km
        estimatedTimeToArrival: Math.floor(Math.random() * 180) + 10 // 10-190 minutes
      });
    }
    
    // Sort by arrival time
    return flights.sort((a, b) => 
      a.arrival.scheduledTime.getTime() - b.arrival.scheduledTime.getTime()
    );
  }

  /**
   * Generate demo position data
   */
  private generateDemoPosition(): FlightData['position'] {
    return {
      latitude: 34.0522 + (Math.random() - 0.5) * 20,
      longitude: -118.2437 + (Math.random() - 0.5) * 20,
      altitude: 35000 + Math.random() * 5000,
      speed: 450 + Math.random() * 100,
      heading: Math.random() * 360
    };
  }
}

export const flightRadarService = new FlightRadarService();