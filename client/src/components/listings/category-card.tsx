import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Star } from "lucide-react";

interface CategoryCardProps {
  id: string;
  label: string;
  icon: string;
  count: number;
  startingPrice: string;
  color: string;
  description?: string;
  isPopular?: boolean;
  growthRate?: string;
}

export function CategoryCard({
  id,
  label,
  icon,
  count,
  startingPrice,
  color,
  description,
  isPopular = false,
  growthRate
}: CategoryCardProps) {
  const getColorClasses = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 hover:border-blue-300",
      orange: "from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 hover:border-orange-300",
      green: "from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 hover:border-green-300",
      purple: "from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 hover:border-purple-300",
      yellow: "from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border-yellow-200 hover:border-yellow-300",
      teal: "from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 border-teal-200 hover:border-teal-300",
    };
    return colorMap[colorName] || colorMap.blue;
  };

  const getBadgeColor = (colorName: string) => {
    const badgeMap: { [key: string]: string } = {
      blue: "bg-blue-600 text-white",
      orange: "bg-orange-600 text-white",
      green: "bg-green-600 text-white",
      purple: "bg-purple-600 text-white",
      yellow: "bg-yellow-600 text-white",
      teal: "bg-teal-600 text-white",
    };
    return badgeMap[colorName] || badgeMap.blue;
  };

  const getDefaultDescription = (categoryId: string) => {
    const descriptions: { [key: string]: string } = {
      house: "Des villas luxueuses aux maisons traditionnelles",
      apartment: "Appartements modernes en centre-ville",
      studio: "Studios cosy et bien équipés",
      equipment: "Matériel professionnel et équipements",
      student: "Spécialement conçu pour les étudiants",
    };
    return descriptions[categoryId] || "Découvrez notre sélection";
  };

  return (
    <Link href={`/listings?category=${id}`} className="group block">
      <Card className={`
        relative overflow-hidden transition-all duration-300 hover-lift group-hover:shadow-xl
        bg-gradient-to-br ${getColorClasses(color)} border-2 property-card
      `}>
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-red-500 text-white shadow-md">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Populaire
            </Badge>
          </div>
        )}

        {/* Growth Indicator */}
        {growthRate && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary" className="bg-white/80 text-green-600 shadow-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              {growthRate}
            </Badge>
          </div>
        )}

        <CardContent className="p-8 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 text-6xl">
              {icon}
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            {/* Icon and Count */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800">
                  {label}
                </h3>
              </div>
              <Badge className={`${getBadgeColor(color)} px-3 py-1 text-sm font-semibold shadow-sm`}>
                {count.toLocaleString()}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
              {description || getDefaultDescription(id)}
            </p>

            {/* Stats Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                À partir de <span className="font-semibold text-gray-700">{startingPrice}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                <span>{Math.floor(Math.random() * 50) + 10}% réservé</span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="flex flex-wrap gap-2">
              {id === 'house' && (
                <>
                  <Badge variant="outline" className="text-xs">🏊 Avec piscine</Badge>
                  <Badge variant="outline" className="text-xs">🌊 Vue mer</Badge>
                </>
              )}
              {id === 'apartment' && (
                <>
                  <Badge variant="outline" className="text-xs">🏢 Centre-ville</Badge>
                  <Badge variant="outline" className="text-xs">🚊 Transport</Badge>
                </>
              )}
              {id === 'equipment' && (
                <>
                  <Badge variant="outline" className="text-xs">🔧 Pro</Badge>
                  <Badge variant="outline" className="text-xs">🚚 Livraison</Badge>
                </>
              )}
              {id === 'student' && (
                <>
                  <Badge variant="outline" className="text-xs">🎓 -30%</Badge>
                  <Badge variant="outline" className="text-xs">📚 Campus</Badge>
                </>
              )}
              {id === 'studio' && (
                <>
                  <Badge variant="outline" className="text-xs">🏠 Meublé</Badge>
                  <Badge variant="outline" className="text-xs">📶 WiFi</Badge>
                </>
              )}
            </div>

            {/* Hover Arrow */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                <svg 
                  className="w-4 h-4 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Animated Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        </CardContent>
      </Card>
    </Link>
  );
}
