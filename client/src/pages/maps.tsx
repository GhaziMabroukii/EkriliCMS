import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Filter, Search, Layers, Navigation, Maximize2, Minimize2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PropertyCard } from "@/components/listings/property-card";
import { SAMPLE_COORDINATES, TUNISIA_REGIONS, PROPERTY_CATEGORIES } from "@/lib/constants";
import type { PropertyWithOwner, SearchFilters } from "@/lib/types";

export default function Maps() {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithOwner | null>(null);
  const [mapFilters, setMapFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([20, 500]);

  // Fetch all properties for map display
  const { data: allProperties = [], isLoading } = useQuery({
    queryKey: ["/api/properties", mapFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(mapFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/properties?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json() as PropertyWithOwner[];
    },
  });

  // Get region-specific properties
  const regionProperties = selectedRegion 
    ? allProperties.filter(p => p.region === selectedRegion)
    : allProperties;

  const updateFilter = (key: string, value: any) => {
    setMapFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRegionClick = (region: string) => {
    setSelectedRegion(region === selectedRegion ? "" : region);
    updateFilter("region", region === selectedRegion ? undefined : region);
  };

  const handleSearch = () => {
    updateFilter("query", searchQuery || undefined);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    updateFilter("minPrice", values[0]);
    updateFilter("maxPrice", values[1]);
  };

  const clearFilters = () => {
    setMapFilters({});
    setSelectedRegion("");
    setSearchQuery("");
    setPriceRange([20, 500]);
  };

  const activeFiltersCount = Object.values(mapFilters).filter(v => 
    v !== undefined && v !== null && v !== ""
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}>
        {/* Map Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MapPin className="mr-2 h-6 w-6 text-blue-600" />
                Carte Interactive
              </h1>
              <Badge variant="secondary">
                {allProperties.length} propriétés
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher une région..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 w-64"
                />
              </div>

              {/* Filters Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px]">
                  <MapFiltersPanel
                    filters={mapFilters}
                    priceRange={priceRange}
                    onFilterChange={updateFilter}
                    onPriceChange={handlePriceChange}
                    onClearFilters={clearFilters}
                  />
                </SheetContent>
              </Sheet>

              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-140px)]">
          {/* Map Container */}
          <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-blue-100">
            {/* Tunisia Map with Interactive Regions */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Stylized Tunisia Map */}
              <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                {/* Map Background */}
                <div className="relative w-96 h-[500px] bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg opacity-40" />
                
                {/* Interactive Region Markers */}
                <div className="absolute inset-0">
                  {Object.entries(SAMPLE_COORDINATES).map(([region, data]) => (
                    <div
                      key={region}
                      className="absolute cursor-pointer transition-all duration-300"
                      style={{
                        left: `${((data.lng - 7) / 7) * 100}%`,
                        top: `${(40 - data.lat) / 10 * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={() => handleRegionClick(region)}
                    >
                      <div className={`
                        relative flex items-center justify-center rounded-full text-white cursor-pointer
                        transition-all duration-300 map-marker shadow-lg
                        ${selectedRegion === region 
                          ? 'bg-blue-600 ring-4 ring-white scale-110 w-16 h-16' 
                          : 'bg-blue-500 hover:bg-blue-600 hover:scale-110 w-12 h-12'
                        }
                      `}>
                        <span className="text-xs font-bold">
                          {allProperties.filter(p => p.region === region).length || data.count}
                        </span>
                      </div>
                      
                      {/* Region name tooltip */}
                      <div className={`
                        absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                        bg-white px-3 py-1 rounded-lg shadow-md transition-all duration-200
                        ${selectedRegion === region || region === selectedRegion 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-2 pointer-events-none'
                        }
                      `}>
                        <span className="text-sm font-semibold text-gray-900">{region}</span>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white p-4 rounded-xl shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Légende</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full" />
                      <span className="text-gray-600">Propriétés disponibles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-full ring-2 ring-blue-200" />
                      <span className="text-gray-600">Région sélectionnée</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full" />
                      <span className="text-gray-600">Propriétés vérifiées</span>
                    </div>
                  </div>
                </div>

                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="bg-white">
                    <Navigation className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    <Layers className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Selected Region Info */}
            {selectedRegion && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedRegion}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{regionProperties.length} propriétés disponibles</p>
                  <p>Prix moyen: {regionProperties.length > 0 
                    ? Math.round(regionProperties.reduce((sum, p) => sum + parseFloat(p.pricePerNight), 0) / regionProperties.length)
                    : 0} TND/nuit</p>
                  <p>Note moyenne: {regionProperties.length > 0
                    ? (regionProperties.reduce((sum, p) => sum + parseFloat(p.rating), 0) / regionProperties.length).toFixed(1)
                    : '0.0'} ⭐</p>
                </div>
                <Button 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={() => setSelectedRegion("")}
                >
                  Voir toutes les régions
                </Button>
              </div>
            )}
          </div>

          {/* Properties Sidebar */}
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto custom-scrollbar">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                {selectedRegion ? `Propriétés à ${selectedRegion}` : 'Toutes les propriétés'}
              </h2>
              <p className="text-sm text-gray-600">
                {regionProperties.length} résultat{regionProperties.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="p-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg shimmer" />
                  ))}
                </div>
              ) : regionProperties.length > 0 ? (
                <div className="space-y-4">
                  {regionProperties.map((property) => (
                    <div
                      key={property.id}
                      className={`cursor-pointer transition-all ${
                        selectedProperty?.id === property.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedProperty(property)}
                    >
                      <PropertyCard property={property} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucune propriété trouvée
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedRegion 
                      ? `Aucune propriété disponible à ${selectedRegion} avec les filtres actuels`
                      : 'Aucune propriété ne correspond à vos critères'
                    }
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Effacer les filtres
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isFullscreen && <Footer />}
    </div>
  );
}

interface MapFiltersPanelProps {
  filters: SearchFilters;
  priceRange: number[];
  onFilterChange: (key: string, value: any) => void;
  onPriceChange: (values: number[]) => void;
  onClearFilters: () => void;
}

function MapFiltersPanel({ 
  filters, 
  priceRange, 
  onFilterChange, 
  onPriceChange, 
  onClearFilters 
}: MapFiltersPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filtres de carte</h2>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Effacer tout
        </Button>
      </div>

      {/* Category Filter */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">
          Catégorie
        </Label>
        <Select 
          value={filters.category || ""} 
          onValueChange={(value) => onFilterChange("category", value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes les catégories</SelectItem>
            {PROPERTY_CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Region Filter */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">
          Région
        </Label>
        <Select 
          value={filters.region || ""} 
          onValueChange={(value) => onFilterChange("region", value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Toutes les régions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes les régions</SelectItem>
            {TUNISIA_REGIONS.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">
          Prix ({priceRange[0]} - {priceRange[1]} TND/nuit)
        </Label>
        <Slider
          value={priceRange}
          onValueChange={onPriceChange}
          max={1000}
          min={10}
          step={10}
          className="mb-2"
        />
      </div>

      {/* Special Options */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">
          Options spéciales
        </Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="verified" className="text-sm">
              ✅ Propriétés vérifiées uniquement
            </Label>
            <Switch
              id="verified"
              checked={filters.isVerified || false}
              onCheckedChange={(checked) => onFilterChange("isVerified", checked || undefined)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="instant" className="text-sm">
              ⚡ Réservation instantanée
            </Label>
            <Switch
              id="instant"
              checked={filters.isInstant || false}
              onCheckedChange={(checked) => onFilterChange("isInstant", checked || undefined)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="student" className="text-sm">
              🎓 Adapté aux étudiants
            </Label>
            <Switch
              id="student"
              checked={filters.isStudentFriendly || false}
              onCheckedChange={(checked) => onFilterChange("isStudentFriendly", checked || undefined)}
            />
          </div>
        </div>
      </div>

      {/* Map Display Options */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">
          Affichage
        </Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="showPrices" className="text-sm">
              Afficher les prix sur la carte
            </Label>
            <Switch id="showPrices" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showRatings" className="text-sm">
              Afficher les notes
            </Label>
            <Switch id="showRatings" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}
