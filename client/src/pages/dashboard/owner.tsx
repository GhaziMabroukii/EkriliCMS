import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Home, DollarSign, Calendar, MessageSquare, Star, TrendingUp,
  Users, Eye, Edit, Trash2, Phone, Mail, MapPin, BarChart3
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import type { Property, Booking, Message } from "@shared/schema";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch owner's properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties/owner", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/properties/owner/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json() as Property[];
    },
    enabled: !!user?.id,
  });

  // Fetch bookings for owner's properties
  const { data: allBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings/owner", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const bookings = [];
      for (const property of properties) {
        const response = await fetch(`/api/bookings/property/${property.id}`);
        if (response.ok) {
          const propertyBookings = await response.json();
          bookings.push(...propertyBookings);
        }
      }
      return bookings;
    },
    enabled: !!user?.id && properties.length > 0,
  });

  // Calculate statistics
  const totalRevenue = allBookings.reduce((sum, booking) => 
    sum + parseFloat(booking.totalPrice), 0
  );
  const totalBookings = allBookings.length;
  const averageRating = properties.length > 0 
    ? properties.reduce((sum, prop) => sum + parseFloat(prop.rating), 0) / properties.length
    : 0;
  const activeProperties = properties.filter(p => p.isActive).length;

  const stats = [
    {
      title: "Revenus totaux",
      value: `${totalRevenue.toFixed(0)} TND`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Propriétés actives",
      value: activeProperties.toString(),
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Réservations totales",
      value: totalBookings.toString(),
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Note moyenne",
      value: `${averageRating.toFixed(1)} ⭐`,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ];

  if (user?.role !== "owner" && user?.role !== "both") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Accès non autorisé
          </h1>
          <p className="text-gray-600 mb-8">
            Vous devez être propriétaire pour accéder à cette page.
          </p>
          <Link href="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                  <Home className="mr-3 h-8 w-8" />
                  Ekrili Pro
                  <Badge className="ml-3 bg-white/20 text-white">
                    Propriétaire vérifié
                  </Badge>
                </h1>
                <p className="text-green-100 text-lg">
                  Bienvenue, {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{totalRevenue.toFixed(0)} TND</div>
                <div className="text-green-100">Revenus ce mois</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="properties">Mes Annonces</TabsTrigger>
            <TabsTrigger value="bookings">Réservations</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Réservations récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded shimmer" />
                      ))}
                    </div>
                  ) : allBookings.slice(0, 5).length > 0 ? (
                    <div className="space-y-3">
                      {allBookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Réservation #{booking.id}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{parseFloat(booking.totalPrice).toFixed(0)} TND</p>
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' : 
                              booking.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">Aucune réservation récente</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Conseils d'amélioration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Ajouter plus de photos</p>
                        <p className="text-sm text-gray-600">
                          Les propriétés avec 5+ photos reçoivent 40% plus de réservations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Répondre rapidement</p>
                        <p className="text-sm text-gray-600">
                          Répondez en moins d'une heure pour améliorer votre classement
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Vérifier la localisation GPS</p>
                        <p className="text-sm text-gray-600">
                          Assurez-vous que vos coordonnées GPS sont exactes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Activer la réservation instantanée</p>
                        <p className="text-sm text-gray-600">
                          Augmentez vos réservations de 30% en moyenne
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mes Annonces ({properties.length})</h2>
              <Link href="/post-listing">
                <Button className="bg-mediterranean hover:bg-blue-700 text-white">
                  Ajouter une propriété
                </Button>
              </Link>
            </div>

            {propertiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 rounded-2xl shimmer" />
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="hover-lift overflow-hidden">
                    <div className="relative h-48">
                      <img
                        src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className={property.category === 'house' ? 'bg-blue-100 text-blue-800' : 
                                        property.category === 'equipment' ? 'bg-green-100 text-green-800' : 
                                        'bg-purple-100 text-purple-800'}>
                          {property.category === 'house' ? '🏠 Logement' : 
                           property.category === 'equipment' ? '🔧 Équipement' : 
                           '🎓 Étudiant'}
                        </Badge>
                        {property.isVerified && (
                          <Badge className="bg-green-100 text-green-800">✅</Badge>
                        )}
                        {property.isInstant && (
                          <Badge className="bg-yellow-100 text-yellow-800">⚡</Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant={property.isActive ? "default" : "secondary"}>
                          {property.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.location}
                        {property.gpsCoordinates && (
                          <span className="ml-2">• {property.gpsCoordinates}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-600">Prix/nuit</p>
                          <p className="font-semibold">{parseFloat(property.pricePerNight).toFixed(0)} TND</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Revenus générés</p>
                          <p className="font-semibold text-green-600">
                            {allBookings
                              .filter(b => b.propertyId === property.id)
                              .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0)
                              .toFixed(0)} TND
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Réservations</p>
                          <p className="font-semibold">
                            {allBookings.filter(b => b.propertyId === property.id).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Note</p>
                          <p className="font-semibold flex items-center">
                            {property.rating} 
                            <Star className="h-3 w-3 text-yellow-500 ml-1 fill-current" />
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <p>Séjour: {property.minStay}-{property.maxStay} nuits</p>
                        {property.bedrooms > 0 && (
                          <p>{property.bedrooms} ch. • {property.maxGuests} invités • {property.bathrooms} SdB</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/listing/${property.id}`}>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Stats
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Home className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune propriété
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par ajouter votre première propriété
                </p>
                <Link href="/post-listing">
                  <Button className="bg-mediterranean hover:bg-blue-700 text-white">
                    Ajouter une propriété
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold">Réservations reçues ({allBookings.length})</h2>
            
            {bookingsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg shimmer" />
                ))}
              </div>
            ) : allBookings.length > 0 ? (
              <div className="space-y-4">
                {allBookings.map((booking) => {
                  const property = properties.find(p => p.id === booking.propertyId);
                  return (
                    <Card key={booking.id} className="hover-lift">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                #{booking.id}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">Réservation #{booking.id}</h3>
                              <p className="text-sm text-gray-600">
                                {property?.title || "Propriété inconnue"}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>📅 {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                                <span>👥 {booking.guests} invités</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {parseFloat(booking.totalPrice).toFixed(0)} TND
                            </p>
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' : 
                              booking.status === 'pending' ? 'secondary' : 
                              booking.status === 'active' ? 'default' :
                              booking.status === 'completed' ? 'default' : 'destructive'
                            }>
                              {booking.status === 'confirmed' ? 'Confirmé' :
                               booking.status === 'pending' ? 'En attente' :
                               booking.status === 'active' ? 'Actif' :
                               booking.status === 'completed' ? 'Terminé' : 'Annulé'}
                            </Badge>
                          </div>
                        </div>
                        
                        {booking.message && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Message du client:</strong> {booking.message}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Détails
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3 mr-1" />
                            Appeler
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune réservation
                </h3>
                <p className="text-gray-600">
                  Vos réservations apparaîtront ici une fois reçues
                </p>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analyses et Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Revenus ce mois
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        2,340 TND
                      </p>
                      <p className="text-xs text-green-600">+12% vs mois dernier</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Taux d'occupation
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        78%
                      </p>
                      <p className="text-xs text-blue-600">+5% vs mois dernier</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-100">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Temps de réponse
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        12 min
                      </p>
                      <p className="text-xs text-green-600">-3 min vs mois dernier</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-100">
                      <MessageSquare className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Satisfaction client
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        4.8 ⭐
                      </p>
                      <p className="text-xs text-green-600">+0.2 vs mois dernier</p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-100">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Graphique des revenus mensuels</p>
                    <p className="text-sm text-gray-500">Intégration prochainement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
