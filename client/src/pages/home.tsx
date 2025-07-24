import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star, Users, MapPin, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { VisualSearch } from "@/components/search/visual-search";
import { TunisiaMap } from "@/components/search/tunisia-map";
import { PropertyCard } from "@/components/listings/property-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PROPERTY_CATEGORIES, SAMPLE_COORDINATES } from "@/lib/constants";
import type { SearchFilters, PropertyWithOwner } from "@/lib/types";

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  // Fetch featured properties
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties");
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
  });

  // Fetch platform stats
  const { data: stats } = useQuery({
    queryKey: ["/api/stats/overview"],
    queryFn: async () => {
      const response = await fetch("/api/stats/overview");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const handleSearch = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString());
      }
    });
    window.location.href = `/listings?${params.toString()}`;
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    handleSearch({ region });
  };

  const featuredProperties = properties.slice(0, 4);
  const categoryStats = PROPERTY_CATEGORIES.map(category => ({
    ...category,
    count: stats?.propertiesByCategory?.[category.id] || 0,
    startingPrice: category.id === 'equipment' ? '15 TND/jour' : 
                   category.id === 'student' ? '28 TND/nuit' : '35 TND/nuit'
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section with Visual Search */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow hero-title">
              Trouvez votre <span className="text-orange-300">logement idéal</span><br />
              en Tunisie
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              La plateforme de location N°1 en Tunisie avec plus de {stats?.totalProperties || '4,000'} propriétés vérifiées
            </p>
          </div>

          <VisualSearch onSearch={handleSearch} />
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explorez par catégorie
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez notre sélection de propriétés en Tunisie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryStats.map((category) => (
              <Link
                key={category.id}
                href={`/listings?category=${category.id}`}
                className="group"
              >
                <Card className="hover-lift transition-all duration-300 group-hover:shadow-xl">
                  <CardContent className={`p-8 bg-gradient-to-br from-${category.color}-50 to-${category.color}-100`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        {category.label}
                      </h3>
                      <Badge className={`bg-${category.color}-600 text-white px-3 py-1`}>
                        {category.count}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {category.id === 'house' && "Des villas luxueuses aux maisons traditionnelles"}
                      {category.id === 'apartment' && "Appartements modernes en centre-ville"}
                      {category.id === 'studio' && "Studios cosy et bien équipés"}
                      {category.id === 'equipment' && "Matériel professionnel et équipements"}
                      {category.id === 'student' && "Spécialement conçu pour les étudiants"}
                    </p>
                    <div className="text-sm text-gray-500">
                      À partir de {category.startingPrice}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tunisia Map */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explorez la Tunisie
            </h2>
            <p className="text-xl text-gray-600">
              Cliquez sur une région pour découvrir les propriétés disponibles
            </p>
          </div>

          <TunisiaMap 
            onRegionSelect={handleRegionSelect}
            selectedRegion={selectedRegion}
          />
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sélections populaires
            </h2>
            <p className="text-xl text-gray-600">
              Les meilleures propriétés recommandées par nos hôtes
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-96 shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/listings">
              <Button className="bg-mediterranean text-white px-8 py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition-all btn-mediterranean">
                Voir toutes les annonces ({stats?.totalProperties || '4,247'} propriétés)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Student Special Section */}
      <section className="py-16 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white bg-opacity-20 rounded-full px-6 py-2 mb-6 glass-effect">
              <span className="text-2xl mr-2">🎓</span>
              <span className="font-semibold">Offre Spéciale Étudiants</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Jusqu'à <span className="text-yellow-300">30% de réduction</span><br />
              pour les étudiants
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Des logements abordables et adaptés aux besoins des étudiants dans toute la Tunisie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 glass-effect">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Réductions exclusives</h3>
              <p className="opacity-90">Jusqu'à 30% de réduction sur les logements longue durée</p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 glass-effect">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Proximité universités</h3>
              <p className="opacity-90">Logements sélectionnés près des campus universitaires</p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 glass-effect">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Colocation possible</h3>
              <p className="opacity-90">Options de partage pour réduire les coûts</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/listings?isStudentFriendly=true">
              <Button className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                <Star className="mr-2 h-5 w-5" />
                Découvrir les offres étudiants ({stats?.propertiesByCategory?.student || '800'}+ logements)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Gestion simplifiée
            </h2>
            <p className="text-xl text-gray-600">
              Dashboards intuitifs pour locataires et propriétaires
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Tenant Dashboard Preview */}
            <Card className="hover-lift overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Dashboard Locataire</h3>
                <p className="opacity-90">Gérez vos réservations et favoris</p>
              </div>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">3,200 TND</div>
                    <div className="text-sm text-gray-600">Total dépensé</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-gray-600">Réservations</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                    <span>Mes réservations</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                    <span>Mes favoris (8 propriétés)</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    <span>Messages avec propriétaires</span>
                  </div>
                </div>

                <Link href="/dashboard/tenant" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    Accéder au dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Owner Dashboard Preview */}
            <Card className="hover-lift overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Dashboard Propriétaire</h3>
                <p className="opacity-90">Suivez vos revenus et réservations</p>
              </div>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">15,420 TND</div>
                    <div className="text-sm text-gray-600">Revenus totaux</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">4.8 ⭐</div>
                    <div className="text-sm text-gray-600">Note moyenne</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    <span>Mes annonces (8 propriétés)</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                    <span>Analyses et performance</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                    <span>Réservations reçues (47)</span>
                  </div>
                </div>

                <Link href="/dashboard/owner" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white">
                    Accéder au dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
