import { useState } from "react";
import { Link } from "wouter";
import { Heart, Phone, MessageCircle, MapPin, Users, Bed, Bath, Star, Shield, Zap, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PropertyWithOwner } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface PropertyCardProps {
  property: PropertyWithOwner;
  isFavorite?: boolean;
}

export function PropertyCard({ property, isFavorite = false }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(isFavorite);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/favorites/${property.id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { propertyId: property.id });
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isLiked ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isLiked 
          ? "La propriété a été retirée de vos favoris" 
          : "La propriété a été ajoutée à vos favoris",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des favoris",
        variant: "destructive",
      });
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (property.owner?.phone) {
      window.open(`tel:${property.owner.phone}`, '_self');
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour envoyer un message",
        variant: "destructive",
      });
      return;
    }
    window.location.href = `/chat/${property.owner?.id}`;
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'house': return 'bg-blue-100 text-blue-800';
      case 'apartment': return 'bg-orange-100 text-orange-800';
      case 'equipment': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'house': return '🏠';
      case 'apartment': return '🏢';
      case 'equipment': return '🔧';
      case 'student': return '🎓';
      default: return '🏠';
    }
  };

  return (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 property-card">
      <Link href={`/listing/${property.id}`}>
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images[currentImageIndex] || property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
            }}
          />
          
          {/* Image indicators */}
          {property.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {property.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            disabled={toggleFavoriteMutation.isPending}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <CardContent className="p-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={`text-xs font-medium ${getBadgeColor(property.category)}`}>
              {getCategoryIcon(property.category)} {property.category === 'house' ? 'Logement' : 
               property.category === 'equipment' ? 'Équipement' : 
               property.category === 'student' ? 'Étudiant' : 'Logement'}
            </Badge>
            {property.isVerified && (
              <Badge className="bg-green-100 text-green-800 text-xs font-medium badge-verified">
                <Shield className="h-3 w-3 mr-1" />
                Vérifié
              </Badge>
            )}
            {property.isInstant && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs font-medium badge-instant">
                <Zap className="h-3 w-3 mr-1" />
                Instant
              </Badge>
            )}
            {property.isStudentFriendly && (
              <Badge className="bg-purple-100 text-purple-800 text-xs font-medium badge-student">
                <GraduationCap className="h-3 w-3 mr-1" />
                Étudiant
              </Badge>
            )}
          </div>

          {/* Title & Location */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{property.title}</h3>
          <p className="text-sm text-gray-600 mb-3 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {property.location}
            {property.gpsCoordinates && (
              <span className="ml-2 text-xs text-gray-500">• {property.gpsCoordinates}</span>
            )}
          </p>

          {/* Property Details */}
          {(property.bedrooms > 0 || property.maxGuests > 0 || property.bathrooms > 0) && (
            <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
              {property.bedrooms > 0 && (
                <div className="flex items-center">
                  <Bed className="h-3 w-3 mr-1" />
                  <span>{property.bedrooms} chambres</span>
                </div>
              )}
              {property.maxGuests > 0 && (
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{property.maxGuests} invités</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center">
                  <Bath className="h-3 w-3 mr-1" />
                  <span>{property.bathrooms} SdB</span>
                </div>
              )}
            </div>
          )}

          {/* Amenities */}
          <div className="flex flex-wrap gap-1 mb-3">
            {property.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{property.amenities.length - 3}
              </Badge>
            )}
          </div>

          {/* Owner Info */}
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gradient-mediterranean rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
              {property.owner?.firstName?.[0] || 'U'}{property.owner?.lastName?.[0] || 'N'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {property.owner ? `${property.owner.firstName} ${property.owner.lastName}` : 'Propriétaire'}
              </p>
              <div className="flex items-center">
                <div className="flex text-yellow-400 text-xs mr-1">
                  <Star className="h-3 w-3 fill-current" />
                </div>
                <span className="text-xs text-gray-600">
                  {property.rating} ({property.reviewCount} avis)
                </span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {parseFloat(property.pricePerNight).toFixed(0)} TND{" "}
                <span className="text-sm font-normal text-gray-600">/nuit</span>
              </div>
              {property.pricePerMonth && (
                <div className="text-sm text-gray-600">
                  {parseFloat(property.pricePerMonth).toFixed(0)} TND/mois
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Séjour min: {property.minStay} {property.minStay === 1 ? 'nuit' : 'nuits'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleCallClick}
              className="flex-1 bg-mediterranean text-white hover:bg-blue-700 transition-colors btn-mediterranean"
              size="sm"
            >
              <Phone className="h-3 w-3 mr-1" />
              Appeler
            </Button>
            <Button
              onClick={handleChatClick}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
