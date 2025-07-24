import { useState } from "react";
import { MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_COORDINATES } from "@/lib/constants";

interface TunisiaMapProps {
  onRegionSelect: (region: string) => void;
  selectedRegion?: string;
}

export function TunisiaMap({ onRegionSelect, selectedRegion }: TunisiaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Tunisia Map Visual */}
      <div className="relative">
        {/* Tunisia outline with gradient background */}
        <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl overflow-hidden shadow-lg">
          {/* Map background with Tunisia silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-80 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg opacity-40 transform rotate-12" />
          </div>
          
          {/* Interactive Region Markers */}
          <div className="absolute inset-0">
            {Object.entries(SAMPLE_COORDINATES).map(([region, data]) => (
              <div
                key={region}
                className={`absolute cursor-pointer transition-all duration-300 ${
                  selectedRegion === region ? 'z-20' : 'z-10'
                }`}
                style={{
                  left: `${((data.lng - 7) / 7) * 100}%`,
                  top: `${(40 - data.lat) / 10 * 100}%`,
                }}
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => onRegionSelect(region)}
              >
                <div className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full text-white cursor-pointer
                  transition-all duration-300 map-marker shadow-lg
                  ${selectedRegion === region 
                    ? 'bg-blue-600 ring-4 ring-white scale-110' 
                    : 'bg-blue-500 hover:bg-blue-600 hover:scale-110'
                  }
                `}>
                  <span className="text-xs font-bold">{data.count}</span>
                </div>
                
                {/* Region name tooltip */}
                <div className={`
                  absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                  bg-white px-3 py-1 rounded-lg shadow-md transition-all duration-200
                  ${hoveredRegion === region || selectedRegion === region 
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
        </div>

        {/* Map Legend */}
        <div className="mt-6 bg-white p-4 rounded-xl shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Légende</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full" />
              <span className="text-gray-600">Propriétés disponibles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full ring-2 ring-blue-200" />
              <span className="text-gray-600">Région sélectionnée</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Regions List */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Régions populaires</h3>
        <div className="space-y-4">
          {Object.entries(SAMPLE_COORDINATES).map(([region, data]) => (
            <div
              key={region}
              className={`
                bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 
                cursor-pointer hover-lift property-card
                ${selectedRegion === region ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
              `}
              onClick={() => onRegionSelect(region)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{region}</h4>
                    {selectedRegion === region && (
                      <Badge className="bg-blue-100 text-blue-800">Sélectionné</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>{data.count} propriétés</span>
                    <span>•</span>
                    <span>53% occupation</span>
                    <span>•</span>
                    <span>À partir de 40 TND/nuit</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>{data.lat.toFixed(4)}°N, {data.lng.toFixed(4)}°E</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">7K TND</div>
                  <div className="text-sm text-gray-500">revenus annuels</div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegionSelect(region);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
