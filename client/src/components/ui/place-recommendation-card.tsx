import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Star, 
  Navigation, 
  Camera, 
  Clock,
  Award,
  ExternalLink,
  Phone,
  DollarSign,
  Sparkles,
  Target,
  CheckCircle
} from "lucide-react";

interface PlaceRecommendation {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  rating?: number;
  priceLevel?: number;
  photoUrl?: string;
  distance?: number;
  isOpen?: boolean;
  website?: string;
  phone?: string;
  xpReward: number;
  personalizedScore: number;
  badges?: string[];
  tips?: string[];
}

interface PlaceRecommendationCardProps {
  place: PlaceRecommendation;
  canCheckIn: boolean;
  hasCheckedIn: boolean;
  onCheckIn: (place: PlaceRecommendation) => void;
  onGetDirections: (place: PlaceRecommendation) => void;
  isCheckingIn: boolean;
}

const categoryConfig = {
  restaurant: { icon: "🍽️", color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
  landmark: { icon: "🏛️", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
  park: { icon: "🌳", color: "text-green-600", bgColor: "bg-green-50 border-green-200" },
  attraction: { icon: "🎯", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" },
  bar: { icon: "🍸", color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200" },
  cafe: { icon: "☕", color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" },
  museum: { icon: "🏛️", color: "text-indigo-600", bgColor: "bg-indigo-50 border-indigo-200" },
  shopping: { icon: "🛍️", color: "text-pink-600", bgColor: "bg-pink-50 border-pink-200" },
  entertainment: { icon: "🎭", color: "text-violet-600", bgColor: "bg-violet-50 border-violet-200" },
  hotel: { icon: "🏨", color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200" },
  default: { icon: "📍", color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200" },
};

export function PlaceRecommendationCard({
  place,
  canCheckIn,
  hasCheckedIn,
  onCheckIn,
  onGetDirections,
  isCheckingIn
}: PlaceRecommendationCardProps) {
  const categoryInfo = categoryConfig[place.category as keyof typeof categoryConfig] || categoryConfig.default;
  
  const formatDistance = (distance?: number) => {
    if (!distance) return null;
    return distance < 1000 ? `${Math.round(distance)}m` : `${(distance/1000).toFixed(1)}km`;
  };

  const getPriceLevelText = (level?: number) => {
    if (!level) return null;
    return "$".repeat(level);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`neopop-card overflow-hidden ${hasCheckedIn ? 'border-green-500/50 bg-green-500/5' : ''}`}>
        {/* Photo Header */}
        {place.photoUrl && (
          <div className="relative h-48 bg-muted/30">
            <img 
              src={place.photoUrl} 
              alt={place.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            
            {/* Overlay Badges */}
            <div className="absolute top-3 left-3">
              <Badge className={`${categoryInfo.bgColor} ${categoryInfo.color} border font-medium`}>
                <span className="mr-1">{categoryInfo.icon}</span>
                {place.category}
              </Badge>
            </div>
            
            <div className="absolute top-3 right-3 space-y-2">
              {place.personalizedScore >= 80 && (
                <Badge className="bg-gradient-to-r from-primary to-purple-500 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Perfect Match
                </Badge>
              )}
              
              {place.isOpen !== undefined && (
                <Badge variant={place.isOpen ? "default" : "secondary"} className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {place.isOpen ? "Open" : "Closed"}
                </Badge>
              )}
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg flex items-start gap-2">
                {!place.photoUrl && <span className="text-2xl">{categoryInfo.icon}</span>}
                <span className="line-clamp-2">{place.name}</span>
              </CardTitle>
              
              {place.address && (
                <CardDescription className="mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="line-clamp-1">{place.address}</span>
                </CardDescription>
              )}
            </div>

            {hasCheckedIn && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 fill-current" />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          {place.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {place.description}
            </p>
          )}

          {/* Metrics Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {/* XP Reward */}
              <div className="flex items-center text-primary">
                <Award className="w-4 h-4 mr-1" />
                <span className="font-medium">{place.xpReward} XP</span>
              </div>
              
              {/* Distance */}
              {place.distance && (
                <div className="flex items-center text-muted-foreground">
                  <Navigation className="w-4 h-4 mr-1" />
                  <span>{formatDistance(place.distance)}</span>
                </div>
              )}
              
              {/* Rating */}
              {place.rating && (
                <div className="flex items-center text-yellow-600">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span>{place.rating.toFixed(1)}</span>
                </div>
              )}
              
              {/* Price Level */}
              {place.priceLevel && (
                <div className="flex items-center text-green-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>{getPriceLevelText(place.priceLevel)}</span>
                </div>
              )}
            </div>

            {/* Personalized Score */}
            {place.personalizedScore > 70 && (
              <div className="flex items-center text-primary">
                <Target className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">{place.personalizedScore}% match</span>
              </div>
            )}
          </div>

          {/* Tips */}
          {place.tips && place.tips.length > 0 && (
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2">
              <span className="font-medium">💡 Tip:</span> {place.tips[0]}
            </div>
          )}

          {/* Potential Badges */}
          {place.badges && place.badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {place.badges.slice(0, 2).map((badge, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                  <Award className="w-3 h-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {hasCheckedIn ? (
              <Button disabled className="flex-1 bg-green-500/20 text-green-600 border-green-500/30">
                <CheckCircle className="w-4 h-4 mr-2 fill-current" />
                Already Visited
              </Button>
            ) : canCheckIn ? (
              <Button 
                onClick={() => onCheckIn(place)}
                disabled={isCheckingIn}
                className="flex-1 neopop-button"
              >
                {isCheckingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Checking in...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Check In
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => onGetDirections(place)}
                variant="outline"
                className="flex-1 neopop-button-outline"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            )}

            {/* Additional Actions */}
            <div className="flex gap-1">
              {place.website && (
                <Button
                  onClick={() => window.open(place.website, '_blank')}
                  variant="outline"
                  size="sm"
                  className="neopop-button-outline"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              
              {place.phone && (
                <Button
                  onClick={() => window.open(`tel:${place.phone}`, '_blank')}
                  variant="outline"
                  size="sm"
                  className="neopop-button-outline"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}