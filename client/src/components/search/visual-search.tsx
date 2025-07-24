import { useState } from "react";
import { Search, MapPin, Calendar, Users, Target, Filter, ChevronDown } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { TUNISIA_REGIONS, SEARCH_PURPOSES, QUICK_FILTERS, PROPERTY_CATEGORIES } from "@/lib/constants";
import type { SearchFilters } from "@/lib/types";

interface VisualSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export function VisualSearch({ onSearch, initialFilters = {} }: VisualSearchProps) {
  const [activeType, setActiveType] = useState(initialFilters.category || "house");
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || "");
  const [selectedRegion, setSelectedRegion] = useState(initialFilters.region || "");
  const [priceRange, setPriceRange] = useState([
    initialFilters.minPrice || 20,
    initialFilters.maxPrice || 500
  ]);
  const [selectedPurpose, setSelectedPurpose] = useState(initialFilters.purpose || "");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleSearch = () => {
    const filters: SearchFilters = {
      query: searchQuery || undefined,
      category: activeType !== "both" ? activeType : undefined,
      region: selectedRegion || undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      purpose: selectedPurpose || undefined,
      isVerified: selectedFilters.includes("verified") || undefined,
      isInstant: selectedFilters.includes("instant") || undefined,
      isStudentFriendly: selectedFilters.includes("student") || undefined,
    };
    onSearch(filters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-gray-900 max-w-6xl mx-auto">
      {/* Search Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeType === "house" ? "default" : "secondary"}
          onClick={() => setActiveType("house")}
          className="flex items-center gap-2"
        >
          🏠 Logements
        </Button>
        <Button
          variant={activeType === "equipment" ? "default" : "secondary"}
          onClick={() => setActiveType("equipment")}
          className="flex items-center gap-2"
        >
          🔧 Équipements
        </Button>
        <Button
          variant={activeType === "both" ? "default" : "secondary"}
          onClick={() => setActiveType("both")}
          className="flex items-center gap-2"
        >
          🎯 Les deux
        </Button>
      </div>

      {/* Main Search Bar */}
      <div className="relative mb-6">
        <div className="flex items-center bg-gray-50 rounded-xl p-4 border-2 border-transparent hover:border-blue-500 focus-within:border-blue-500 transition-colors search-input">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <Input
            type="text"
            placeholder="Où souhaitez-vous séjourner ? (Tunis, Sousse, Djerba...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-lg p-0 focus-visible:ring-0"
          />
          <MapPin className="h-5 w-5 text-blue-500 ml-3" />
        </div>
      </div>

      {/* Interactive Search Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Region Selector */}
        <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Région</h3>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-transparent border-none p-0 h-auto">
                  <SelectValue placeholder="24 gouvernorats" />
                </SelectTrigger>
                <SelectContent>
                  {TUNISIA_REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <MapPin className="h-6 w-6 text-blue-500" />
          </div>
        </div>

        {/* Budget Range */}
        <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">Budget</h3>
              <p className="text-gray-600 text-sm">
                {priceRange[0]} - {priceRange[1]} TND/nuit
              </p>
            </div>
            <div className="text-orange-500 text-xl">💰</div>
          </div>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            min={10}
            step={10}
            className="mt-2"
          />
        </div>

        {/* Dates Placeholder */}
        <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Dates</h3>
              <p className="text-gray-600">Quand ?</p>
            </div>
            <Calendar className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Purpose-Driven Search */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Objectif de votre séjour :</h3>
        <div className="flex flex-wrap gap-3">
          {SEARCH_PURPOSES.map((purpose) => (
            <Button
              key={purpose.id}
              variant={selectedPurpose === purpose.id ? "default" : "outline"}
              onClick={() => setSelectedPurpose(purpose.id === selectedPurpose ? "" : purpose.id)}
              className="flex items-center gap-2"
            >
              <span>{purpose.icon}</span>
              {purpose.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Filtres rapides :</h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((filter) => (
            <Badge
              key={filter.id}
              variant={selectedFilters.includes(filter.id) ? "default" : "secondary"}
              className={`cursor-pointer text-sm px-3 py-1 ${
                selectedFilters.includes(filter.id)
                  ? `bg-${filter.color}-100 text-${filter.color}-800`
                  : "hover:bg-gray-100"
              }`}
              onClick={() => toggleFilter(filter.id)}
            >
              {filter.icon} {filter.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="mb-4 p-0 h-auto text-gray-600 hover:text-gray-900">
            <Filter className="h-4 w-4 mr-2" />
            Options avancées
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période de location
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="night">Nuit</SelectItem>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="year">Année</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pertinence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Pertinence</SelectItem>
                  <SelectItem value="price_low">Prix croissant</SelectItem>
                  <SelectItem value="price_high">Prix décroissant</SelectItem>
                  <SelectItem value="rating">Note</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        className="w-full bg-gradient-mediterranean text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all btn-mediterranean"
      >
        <Search className="h-5 w-5 mr-2" />
        Rechercher (4,247 propriétés disponibles)
      </Button>
    </div>
  );
}
