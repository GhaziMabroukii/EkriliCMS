import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Filter, Grid, List, Map, SlidersHorizontal, Search } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PropertyCard } from "@/components/listings/property-card";
import { VisualSearch } from "@/components/search/visual-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TUNISIA_REGIONS, PROPERTY_CATEGORIES, QUICK_FILTERS } from "@/lib/constants";
import type { SearchFilters, PropertyWithOwner } from "@/lib/types";

type ViewMode = "grid" | "list" | "map";

export default function Listings() {
  const [location] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: SearchFilters = {};
    
    urlParams.forEach((value, key) => {
      if (key === 'minPrice' || key === 'maxPrice') {
        initialFilters[key] = parseInt(value);
      } else if (key === 'isStudentFriendly' || key === 'isVerified' || key === 'isInstant') {
        initialFilters[key] = value === 'true';
      } else {
        (initialFilters as any)[key] = value;
      }
    });
    
    setFilters(initialFilters);
    if (initialFilters.query) {
      setSearchQuery(initialFilters.query);
    }
  }, [location]);

  // Fetch properties with filters
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, value.toString());
        }
      });
      
      const endpoint = filters.query ? "/api/search" : "/api/properties";
      const response = await fetch(`${endpoint}?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
  });

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString());
      }
    });
    window.history.pushState({}, "", `/listings?${params.toString()}`);
  };

  const handleQuickSearch = () => {
    handleSearch({ ...filters, query: searchQuery });
  };

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    handleSearch(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    window.history.pushState({}, "", "/listings");
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== undefined && v !== null && v !== ""
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Quick Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleQuickSearch()}
                  className="pl-10 search-input"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="p-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="p-2"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="p-2"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Button (Mobile) */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                <FiltersPanel
                  filters={filters}
                  onFilterChange={updateFilter}
                  onClearFilters={clearFilters}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-32">
              <FiltersPanel
                filters={filters}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {properties.length} propriétés trouvées
                </h1>
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(filters).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => updateFilter(key, undefined)}
                        >
                          {key}: {value.toString()} ×
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <Select defaultValue="relevance">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Pertinence</SelectItem>
                  <SelectItem value="price_low">Prix croissant</SelectItem>
                  <SelectItem value="price_high">Prix décroissant</SelectItem>
                  <SelectItem value="rating">Note</SelectItem>
                  <SelectItem value="newest">Plus récent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Properties Grid/List */}
            {isLoading ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-2xl h-96 shimmer" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune propriété trouvée
                </h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button onClick={clearFilters}>
                  Effacer tous les filtres
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {properties.map((property: PropertyWithOwner) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

interface FiltersPanelProps {
  filters: SearchFilters;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

function FiltersPanel({ filters, onFilterChange, onClearFilters }: FiltersPanelProps) {
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 20,
    filters.maxPrice || 500
  ]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFilterChange("minPrice", values[0]);
    onFilterChange("maxPrice", values[1]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
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
          onValueChange={handlePriceChange}
          max={1000}
          min={10}
          step={10}
          className="mb-2"
        />
      </div>

      {/* Quick Filters */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">
          Options spéciales
        </Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="verified" className="text-sm">
              ✅ Propriétés vérifiées
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

      {/* Advanced Search */}
      <div className="pt-6 border-t">
        <VisualSearch onSearch={(newFilters) => {
          Object.entries(newFilters).forEach(([key, value]) => {
            onFilterChange(key, value);
          });
        }} initialFilters={filters} />
      </div>
    </div>
  );
}
