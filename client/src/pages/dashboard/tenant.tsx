import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Heart, Calendar, MessageSquare, User, Star, MapPin, Phone,
  Eye, CreditCard, Clock, CheckCircle
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
import type { Booking, Favorite, Property } from "@shared/schema";

export default function TenantDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user's bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings/tenant", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/bookings/tenant/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json() as Booking[];
    },
    enabled: !!user?.id,
  });

  // Fetch user's favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ["/api/favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/favorites/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch favorites");
      return response.json() as Favorite[];
    },
    enabled: !!user?.id,
  });

  // Fetch favorite properties details
  const { data: favoriteProperties = [] } = useQuery({
    queryKey: ["/api/properties", "favorites", favorites],
    queryFn: async () => {
      const properties = [];
      for (const favorite of favorites) {
        const response = await fetch(`/api/properties/${favorite.propertyId}`);
        if (response.ok) {
          const property = await response.json();
          properties.push(property);
        }
      }
      return properties;
    },
    enabled: favorites.length > 0,
  });

  // Calculate statistics
  const totalSpent = bookings.reduce((sum, booking) => 
    sum + parseFloat(booking.totalPrice), 0
  );
  const totalBookings = bookings.length;
  const favoritesCount = favorites.length;

  const stats = [
    {
      title: "Total dépensé",
      value: `${totalSpent.toFixed(0)} TND`,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Réservations",
      value: totalBookings.toString(),
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Favoris sauvegardés",
      value: favoritesCount.toString(),
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Membre depuis",
      value: "2024",
      icon: User,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  if (user?.role !== "tenant" && user?.role !== "both") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Accès non autorisé
          </h1>
          <p className="text-gray-600 mb-8">
            Vous devez être locataire pour accéder à cette page.
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
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                  <User className="mr-3 h-8 w-8" />
                  Mon Espace
                </h1>
                <p className="text-blue-100 text-lg">
                  Bienvenue, {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{totalSpent.toFixed(0)} TND</div>
                <div className="text-blue-100">Total dépensé</div>
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
            <TabsTrigger value="bookings">Mes Réservations</TabsTrigger>
            <TabsTrigger value="favorites">Mes Favoris</TabsTrigger>
            <TabsTrigger value="profile">Mon Profil</TabsTrigger>
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
                  ) : bookings.slice(0, 5).length > 0 ? (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking) => (
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
                              {booking.status === 'confirmed' ? 'Confirmé' :
                               booking.status === 'pending' ? 'En attente' :
                               booking.status === 'active' ? 'Actif' :
                               booking.status === 'completed' ? 'Terminé' : 'Annulé'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Aucune réservation récente</p>
                      <Link href="/listings">
                        <Button size="sm">Explorer les propriétés</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Favorite Properties Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5" />
                    Mes Favoris ({favoritesCount})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favoritesLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded shimmer" />
                      ))}
                    </div>
                  ) : favoriteProperties.slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {favoriteProperties.slice(0, 3).map((property) => (
                        <div key={property.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                            alt={property.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">{property.title}</p>
                            <p className="text-xs text-gray-600">{parseFloat(property.pricePerNight).toFixed(0)} TND/nuit</p>
                          </div>
                          <Link href={`/listing/${property.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                      {favoritesCount > 3 && (
                        <p className="text-center text-sm text-gray-600">
                          +{favoritesCount - 3} autres favoris
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Aucun favori sauvegardé</p>
                      <Link href="/listings">
                        <Button size="sm">Découvrir des propriétés</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold">Mes Réservations ({bookings.length})</h2>
            
            {bookingsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg shimmer" />
                ))}
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Réservation #{booking.id}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-blue-100 text-blue-800">
                                🏠 Logement
                              </Badge>
                              <Badge variant="outline">
                                {booking.status === 'confirmed' ? 'Confirmé' :
                                 booking.status === 'pending' ? 'En attente' :
                                 booking.status === 'active' ? 'Actif' :
                                 booking.status === 'completed' ? 'Terminé' : 'Annulé'}
                              </Badge>
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-4">
                                <span>📅 {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                                <span>👥 {booking.guests} invités</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span>Propriété #{booking.propertyId}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {parseFloat(booking.totalPrice).toFixed(0)} TND
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Voir sur carte
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune réservation
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par explorer nos propriétés
                </p>
                <Link href="/listings">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Explorer les propriétés
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-2xl font-bold">Mes Favoris ({favoritesCount})</h2>
            
            {favoritesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-gray-200 rounded-2xl shimmer" />
                ))}
              </div>
            ) : favoriteProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProperties.map((property) => (
                  <Card key={property.id} className="hover-lift overflow-hidden">
                    <div className="relative h-48">
                      <img
                        src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-blue-100 text-blue-800">
                          🏠 Logement
                        </Badge>
                      </div>
                      <button className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full">
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.location}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {parseFloat(property.pricePerNight).toFixed(0)} TND
                            <span className="text-sm font-normal text-gray-600 ml-1">/nuit</span>
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                          <span className="text-sm font-medium">{property.rating}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/listing/${property.id}`} className="flex-1">
                          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            Réserver
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun favori
                </h3>
                <p className="text-gray-600 mb-6">
                  Sauvegardez vos propriétés préférées pour les retrouver facilement
                </p>
                <Link href="/listings">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Découvrir des propriétés
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold">Mon Profil</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h3>
                      <p className="text-gray-600">{user?.email}</p>
                      <div className="flex items-center mt-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">Email vérifié</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.firstName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.lastName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        defaultValue={user?.phone || ""}
                        placeholder="+216 XX XXX XXX"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sauvegarder les modifications
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Membre depuis</span>
                      <span className="font-semibold">2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Réservations</span>
                      <span className="font-semibold">{totalBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total dépensé</span>
                      <span className="font-semibold">{totalSpent.toFixed(0)} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Favoris</span>
                      <span className="font-semibold">{favoritesCount}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Vérifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Email vérifié</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Téléphone en attente</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Vérifier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
