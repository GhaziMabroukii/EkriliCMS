import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart, Share2, Phone, MessageCircle, MapPin, Users, Bed, Bath,
  Star, Shield, Zap, GraduationCap, Wifi, Car, Waves, Calendar,
  ChevronLeft, ChevronRight, ExternalLink
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PropertyWithOwner, ReviewWithUser, BookingWithDetails } from "@/lib/types";

export default function ListingDetail() {
  const [, params] = useRoute("/listing/:id");
  const propertyId = parseInt(params?.id || "0");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch property details
  const { data: property, isLoading } = useQuery({
    queryKey: ["/api/properties", propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) throw new Error("Property not found");
      return response.json() as PropertyWithOwner;
    },
    enabled: !!propertyId,
  });

  // Fetch reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/reviews/property", propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/property/${propertyId}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json() as ReviewWithUser[];
    },
    enabled: !!propertyId,
  });

  // Book property mutation
  const bookPropertyMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Demande de réservation envoyée",
        description: "Le propriétaire va examiner votre demande",
      });
      // Clear form
      setCheckIn("");
      setCheckOut("");
      setGuests(1);
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de réservation",
        variant: "destructive",
      });
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${propertyId}`);
      } else {
        await apiRequest("POST", "/api/favorites", { propertyId });
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      toast({
        title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isFavorite 
          ? "La propriété a été retirée de vos favoris" 
          : "La propriété a été ajoutée à vos favoris",
      });
    },
  });

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour faire une réservation",
        variant: "destructive",
      });
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Dates manquantes",
        description: "Veuillez sélectionner les dates d'arrivée et de départ",
        variant: "destructive",
      });
      return;
    }

    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * parseFloat(property?.pricePerNight || "0");

    bookPropertyMutation.mutate({
      propertyId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests,
      totalPrice: totalPrice.toString(),
      message,
    });
  };

  const handleFavoriteToggle = () => {
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: property?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papiers",
      });
    }
  };

  const handleCall = () => {
    if (property?.owner.phone) {
      window.open(`tel:${property.owner.phone}`, '_self');
    }
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour envoyer un message",
        variant: "destructive",
      });
      return;
    }
    window.location.href = `/chat/${property?.owner.id}`;
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !property) return 0;
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return nights * parseFloat(property.pricePerNight);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded" />
                <div className="h-24 bg-gray-200 rounded" />
                <div className="h-48 bg-gray-200 rounded" />
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Propriété non trouvée
            </h1>
            <p className="text-gray-600">
              Cette propriété n'existe pas ou a été supprimée.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="relative mb-8">
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden">
            <img
              src={property.images[currentImageIndex] || property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800";
              }}
            />
            
            {/* Navigation arrows */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(
                    currentImageIndex === 0 ? property.images.length - 1 : currentImageIndex - 1
                  )}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(
                    currentImageIndex === property.images.length - 1 ? 0 : currentImageIndex + 1
                  )}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image indicators */}
            {property.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShare}
                className="bg-white/80 hover:bg-white"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleFavoriteToggle}
                disabled={toggleFavoriteMutation.isPending}
                className={`transition-colors ${
                  isFavorite 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-white/80 hover:bg-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Basic Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-100 text-blue-800">
                  {property.category === 'house' ? '🏠 Logement' : 
                   property.category === 'equipment' ? '🔧 Équipement' : 
                   property.category === 'student' ? '🎓 Étudiant' : '🏠 Logement'}
                </Badge>
                {property.isVerified && (
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
                {property.isInstant && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Zap className="h-3 w-3 mr-1" />
                    Réservation instantanée
                  </Badge>
                )}
                {property.isStudentFriendly && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Adapté aux étudiants
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {property.title}
              </h1>

              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </div>
                {property.gpsCoordinates && (
                  <div className="text-sm">
                    📍 {property.gpsCoordinates}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center text-yellow-500">
                  <Star className="h-5 w-5 fill-current mr-1" />
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-gray-600 ml-1">({property.reviewCount} avis)</span>
                </div>
                {(property.bedrooms > 0 || property.maxGuests > 0 || property.bathrooms > 0) && (
                  <>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-4 text-gray-600">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          {property.bedrooms} chambres
                        </div>
                      )}
                      {property.maxGuests > 0 && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {property.maxGuests} invités max
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          {property.bathrooms} SdB
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Équipements et services
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle>Votre hôte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-16 w-16 mr-4">
                      <AvatarFallback className="bg-gradient-mediterranean text-white text-lg font-bold">
                        {property.owner.firstName[0]}{property.owner.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {property.owner.firstName} {property.owner.lastName}
                      </h3>
                      {property.owner.isVerified && (
                        <div className="flex items-center text-green-600 text-sm">
                          <Shield className="h-3 w-3 mr-1" />
                          Hôte vérifié
                        </div>
                      )}
                      <p className="text-gray-600 text-sm">Membre depuis 2023</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCall}>
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                    <Button onClick={handleChat}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* House Rules */}
            {property.houseRules && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Règles de la maison
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">{property.houseRules}</p>
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Avis ({reviews.length})
                </h2>
                <div className="space-y-6">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-center mb-3">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>
                            {review.tenant.firstName[0]}{review.tenant.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.tenant.firstName} {review.tenant.lastName}
                          </h4>
                          <div className="flex items-center">
                            <div className="flex text-yellow-400 text-sm mr-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating ? 'fill-current' : ''
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-500 text-sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 ml-13">{review.comment}</p>
                      )}
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <Button variant="outline" className="w-full">
                      Voir tous les avis ({reviews.length})
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {parseFloat(property.pricePerNight).toFixed(0)} TND
                      <span className="text-base font-normal text-gray-600 ml-1">/nuit</span>
                    </div>
                    {property.pricePerMonth && (
                      <div className="text-gray-600">
                        {parseFloat(property.pricePerMonth).toFixed(0)} TND/mois
                      </div>
                    )}
                  </div>
                  {property.isInstant && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      ⚡ Instant
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="checkin">Arrivée</Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout">Départ</Label>
                    <Input
                      id="checkout"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <Label htmlFor="guests">Invités</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max={property.maxGuests}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  />
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Message au propriétaire (optionnel)</Label>
                  <Textarea
                    id="message"
                    placeholder="Présentez-vous et expliquez votre séjour..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {/* Price Calculation */}
                {checkIn && checkOut && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>
                        {parseFloat(property.pricePerNight).toFixed(0)} TND × {
                          Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
                        } nuits
                      </span>
                      <span>{calculateTotal().toFixed(0)} TND</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>{calculateTotal().toFixed(0)} TND</span>
                    </div>
                  </div>
                )}

                {/* Booking Button */}
                <Button
                  onClick={handleBooking}
                  disabled={bookPropertyMutation.isPending || !checkIn || !checkOut}
                  className="w-full bg-mediterranean hover:bg-blue-700 text-white btn-mediterranean"
                >
                  {bookPropertyMutation.isPending ? (
                    "Envoi en cours..."
                  ) : property.isInstant ? (
                    "Réserver maintenant"
                  ) : (
                    "Demander à réserver"
                  )}
                </Button>

                {/* Stay Requirements */}
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Séjour minimum: {property.minStay} nuits</div>
                  <div>Séjour maximum: {property.maxStay} nuits</div>
                  {property.isFurnished && (
                    <div className="text-green-600">✓ Logement meublé</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
