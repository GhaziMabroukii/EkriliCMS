import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Shield, Phone, Mail, MapPin, Star, Calendar, MessageSquare,
  Home, Users, DollarSign, Heart, Flag, Award
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
import type { Property, User } from "@shared/schema";

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const profileId = parseInt(params?.id || "0");
  const { user: currentUser } = useAuth();

  // Fetch profile user data (simulated since we don't have a direct user endpoint)
  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/profile", profileId],
    queryFn: async () => {
      // Try to get user info from their properties
      const response = await fetch(`/api/properties/owner/${profileId}`);
      if (!response.ok) return null;
      const properties = await response.json();
      
      if (properties.length > 0) {
        // Get owner info from the first property
        const propertyResponse = await fetch(`/api/properties/${properties[0].id}`);
        if (propertyResponse.ok) {
          const propertyData = await propertyResponse.json();
          return {
            ...propertyData.owner,
            propertiesCount: properties.length,
            properties: properties
          };
        }
      }
      return null;
    },
    enabled: !!profileId,
  });

  // Fetch user's properties
  const { data: userProperties = [] } = useQuery({
    queryKey: ["/api/properties/owner", profileId],
    queryFn: async () => {
      const response = await fetch(`/api/properties/owner/${profileId}`);
      if (!response.ok) return [];
      return response.json() as Property[];
    },
    enabled: !!profileId,
  });

  // Calculate statistics
  const totalProperties = userProperties.length;
  const averageRating = userProperties.length > 0 
    ? userProperties.reduce((sum, prop) => sum + parseFloat(prop.rating), 0) / userProperties.length
    : 0;
  const totalReviews = userProperties.reduce((sum, prop) => sum + prop.reviewCount, 0);

  const isOwner = userProperties.length > 0;
  const isCurrentUser = currentUser?.id === profileId;

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-gray-200 rounded" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
              <div className="h-96 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Profil non trouvé
          </h1>
          <p className="text-gray-600 mb-8">
            Ce profil n'existe pas ou a été supprimé.
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
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-20" />
            <img
              src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400"
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Info */}
          <div className="absolute -bottom-16 left-8">
            <div className="flex items-end space-x-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarFallback className="bg-gradient-mediterranean text-white text-3xl font-bold">
                  {profileUser.firstName[0]}{profileUser.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="bg-white rounded-lg p-4 shadow-lg mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileUser.firstName} {profileUser.lastName}
                  </h1>
                  {profileUser.isVerified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Vérifié
                    </Badge>
                  )}
                  {isOwner && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Home className="h-3 w-3 mr-1" />
                      {totalProperties > 5 ? 'Super Hôte' : 'Propriétaire'}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    <span className="ml-1">({totalReviews} avis)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>Tunis, Tunisie</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Membre depuis 2023</span>
                  </div>
                </div>

                {/* Languages */}
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">🇫🇷 Français</Badge>
                  <Badge variant="outline">🇬🇧 English</Badge>
                  <Badge variant="outline">🇹🇳 العربية</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isCurrentUser && (
            <div className="absolute top-4 right-4 flex gap-2">
              <Link href={`/chat/${profileId}`}>
                <Button className="bg-mediterranean hover:bg-blue-700 text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </Link>
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
              <Button variant="outline">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mt-20">
          {isOwner ? (
            <>
              <Card className="text-center hover-lift">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    15,420 TND
                  </div>
                  <div className="text-sm text-gray-600">Revenus totaux</div>
                </CardContent>
              </Card>
              <Card className="text-center hover-lift">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {totalProperties}
                  </div>
                  <div className="text-sm text-gray-600">Propriétés</div>
                </CardContent>
              </Card>
              <Card className="text-center hover-lift">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    78%
                  </div>
                  <div className="text-sm text-gray-600">Taux d'occupation</div>
                </CardContent>
              </Card>
              <Card className="text-center hover-lift">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    47
                  </div>
                  <div className="text-sm text-gray-600">Clients fidèles</div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="text-center hover-lift">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    15
                  </div>
                  <div className="text-sm text-gray-600">Réservations</div>
                </CardContent>
              </Card>
              <Card className="text-center hover-lift">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    3,200 TND
                  </div>
                  <div className="text-sm text-gray-600">Total dépensé</div>
                </CardContent>
              </Card>
              <Card className="text-center hover-lift">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    8
                  </div>
                  <div className="text-sm text-gray-600">Propriétés favorites</div>
                </CardContent>
              </Card>
              <Card className="text-center hover-lift">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    12
                  </div>
                  <div className="text-sm text-gray-600">Avis donnés</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value={isOwner ? "properties" : "history"}>
                  {isOwner ? "Propriétés" : "Historique"}
                </TabsTrigger>
                <TabsTrigger value="reviews">Avis</TabsTrigger>
                <TabsTrigger value="achievements">Réalisations</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>À propos de {profileUser.firstName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      {isOwner 
                        ? `Propriétaire passionné avec ${totalProperties} propriétés exceptionnelles en Tunisie. Je m'engage à offrir la meilleure expérience possible à mes invités avec des logements soigneusement sélectionnés et un service personnalisé.`
                        : "Voyageur passionné qui apprécie la découverte de nouveaux lieux et la rencontre de personnes authentiques. J'aime explorer la richesse culturelle de la Tunisie à travers des séjours mémorables."
                      }
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Centres d'intérêt</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">🏛️ Histoire</Badge>
                          <Badge variant="outline">🌊 Mer</Badge>
                          <Badge variant="outline">🍴 Gastronomie</Badge>
                          <Badge variant="outline">📸 Photographie</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Régions préférées</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Sidi Bou Said</Badge>
                          <Badge variant="outline">Hammamet</Badge>
                          <Badge variant="outline">Djerba</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Properties/History Tab */}
              <TabsContent value={isOwner ? "properties" : "history"}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isOwner ? `Propriétés (${totalProperties})` : "Historique des séjours"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isOwner ? (
                      userProperties.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {userProperties.slice(0, 3).map((property) => (
                            <div key={property.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                              <img
                                src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150"}
                                alt={property.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold line-clamp-1">{property.title}</h4>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {property.location}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm font-medium">{parseFloat(property.pricePerNight).toFixed(0)} TND/nuit</span>
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                                    <span className="text-sm">{property.rating} ({property.reviewCount})</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {totalProperties > 3 && (
                            <p className="text-center text-sm text-gray-600 mt-4">
                              +{totalProperties - 3} autres propriétés
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600">Aucune propriété publique</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">Historique des séjours privé</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Avis reçus ({totalReviews})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Sample reviews */}
                      {[
                        {
                          id: 1,
                          user: "Marie Dubois",
                          rating: 5,
                          comment: "Séjour exceptionnel ! La propriété était exactement comme décrite et {0} a été un hôte parfait.".replace("{0}", profileUser.firstName),
                          date: "Il y a 2 semaines"
                        },
                        {
                          id: 2,
                          user: "Ahmed Ben Ali",
                          rating: 5,
                          comment: "Très bon accueil, logement propre et bien situé. Je recommande vivement !",
                          date: "Il y a 1 mois"
                        },
                        {
                          id: 3,
                          user: "Sarah Johnson",
                          rating: 4,
                          comment: "Belle expérience, {0} répond rapidement et est très serviable.".replace("{0}", profileUser.firstName),
                          date: "Il y a 2 mois"
                        }
                      ].map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>{review.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{review.user}</p>
                                <div className="flex items-center">
                                  <div className="flex text-yellow-400 mr-2">
                                    {[...Array(review.rating)].map((_, i) => (
                                      <Star key={i} className="h-3 w-3 fill-current" />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">{review.date}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <CardTitle>Réalisations et badges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isOwner ? [
                        {
                          icon: Shield,
                          title: "Hôte vérifié",
                          description: "Identité et propriétés vérifiées",
                          color: "bg-green-100 text-green-600"
                        },
                        {
                          icon: Star,
                          title: "Super Hôte",
                          description: "Note moyenne supérieure à 4.8",
                          color: "bg-yellow-100 text-yellow-600"
                        },
                        {
                          icon: MessageSquare,
                          title: "Réponse rapide",
                          description: "Répond en moins de 30 minutes",
                          color: "bg-blue-100 text-blue-600"
                        },
                        {
                          icon: Home,
                          title: "Multi-propriétaire",
                          description: "Plus de 3 propriétés gérées",
                          color: "bg-purple-100 text-purple-600"
                        }
                      ] : [
                        {
                          icon: Heart,
                          title: "Voyageur fréquent",
                          description: "Plus de 10 séjours réalisés",
                          color: "bg-red-100 text-red-600"
                        },
                        {
                          icon: Star,
                          title: "Invité apprécié",
                          description: "Excellents avis des hôtes",
                          color: "bg-yellow-100 text-yellow-600"
                        },
                        {
                          icon: Shield,
                          title: "Profil vérifié",
                          description: "Identité vérifiée",
                          color: "bg-green-100 text-green-600"
                        },
                        {
                          icon: Award,
                          title: "Membre fidèle",
                          description: "Membre depuis plus d'un an",
                          color: "bg-blue-100 text-blue-600"
                        }
                      ].map((achievement, index) => {
                        const Icon = achievement.icon;
                        return (
                          <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                            <div className={`p-2 rounded-lg ${achievement.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Vérifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Identité vérifiée</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">Téléphone vérifié</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-sm">Email vérifié</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">✓</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            {!isCurrentUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/chat/${profileId}`}>
                    <Button className="w-full bg-mediterranean hover:bg-blue-700 text-white">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Envoyer un message
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Taux de réponse</span>
                  <span className="font-semibold">98%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Temps de réponse</span>
                  <span className="font-semibold">12 min</span>
                </div>
                {isOwner && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taux d'acceptation</span>
                    <span className="font-semibold">95%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Langues</span>
                  <span className="font-semibold">3</span>
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
