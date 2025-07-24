import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronLeft, ChevronRight, MapPin, Upload, X, Home,
  Bed, Bath, Users, Euro, Calendar, Settings, Check
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TUNISIA_REGIONS, AMENITIES, PROPERTY_TYPES } from "@/lib/constants";
import type { ListingFormData } from "@/lib/types";

const STEPS = [
  { id: 1, title: "Informations de base", icon: Home },
  { id: 2, title: "Détails", icon: Bed },
  { id: 3, title: "Équipements", icon: Settings },
  { id: 4, title: "Photos", icon: Upload },
  { id: 5, title: "Tarification", icon: Euro },
  { id: 6, title: "Disponibilité", icon: Calendar },
];

export default function PostListing() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    category: "house",
    type: "",
    region: "",
    location: "",
    pricePerNight: 0,
    pricePerMonth: 0,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    isFurnished: false,
    amenities: [],
    images: [],
    minStay: 1,
    maxStay: 365,
    isInstant: false,
    houseRules: "",
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-8">
            Vous devez être connecté pour publier une annonce.
          </p>
          <Button onClick={() => setLocation("/auth/login")}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  const createListingMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const response = await apiRequest("POST", "/api/properties", {
        ...data,
        pricePerNight: data.pricePerNight.toString(),
        pricePerMonth: data.pricePerMonth ? data.pricePerMonth.toString() : null,
        images: selectedImages,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Annonce publiée avec succès",
        description: "Votre propriété est maintenant en ligne",
      });
      setLocation("/dashboard/owner");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de publier l'annonce",
        variant: "destructive",
      });
    },
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addImage = (url: string) => {
    if (selectedImages.length < 10) {
      setSelectedImages(prev => [...prev, url]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title || !formData.description || !formData.region || !formData.location) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "Photos manquantes",
        description: "Ajoutez au moins une photo de votre propriété",
        variant: "destructive",
      });
      return;
    }

    if (formData.pricePerNight <= 0) {
      toast({
        title: "Prix invalide",
        description: "Veuillez définir un prix valide",
        variant: "destructive",
      });
      return;
    }

    createListingMutation.mutate(formData);
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Publier une annonce
          </h1>
          <p className="text-gray-600">
            Étape {currentStep} sur {STEPS.length}: {STEPS[currentStep - 1].title}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step.id <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs text-center max-w-20">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "h-5 w-5" })}
              {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <>
                <div>
                  <Label htmlFor="title">Titre de l'annonce *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Villa moderne avec piscine à Sidi Bou Said"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description détaillée *</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre propriété en détail..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">🏠 Logement</SelectItem>
                        <SelectItem value="equipment">🔧 Équipement</SelectItem>
                        <SelectItem value="student">🎓 Logement étudiant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type">Type de propriété *</Label>
                    <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">Région *</Label>
                    <Select value={formData.region} onValueChange={(value) => updateFormData("region", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une région" />
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

                  <div>
                    <Label htmlFor="location">Adresse précise *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="location"
                        placeholder="Ex: Avenue Habib Bourguiba, Tunis"
                        value={formData.location}
                        onChange={(e) => updateFormData("location", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Chambres</Label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => updateFormData("bedrooms", parseInt(e.target.value) || 0)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bathrooms">Salles de bain</Label>
                    <div className="relative">
                      <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="bathrooms"
                        type="number"
                        min="0"
                        value={formData.bathrooms}
                        onChange={(e) => updateFormData("bathrooms", parseInt(e.target.value) || 0)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="maxGuests">Invités max</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="maxGuests"
                        type="number"
                        min="1"
                        value={formData.maxGuests}
                        onChange={(e) => updateFormData("maxGuests", parseInt(e.target.value) || 1)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="furnished"
                    checked={formData.isFurnished}
                    onCheckedChange={(checked) => updateFormData("isFurnished", checked)}
                  />
                  <Label htmlFor="furnished">Logement meublé</Label>
                </div>
              </>
            )}

            {/* Step 3: Amenities */}
            {currentStep === 3 && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Équipements disponibles ({formData.amenities.length} sélectionnés)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AMENITIES.map((amenity) => (
                      <div
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.label)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          formData.amenities.includes(amenity.label)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-xl mb-1">{amenity.icon}</div>
                          <div className="text-sm font-medium">{amenity.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {formData.amenities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Équipements sélectionnés:</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => toggleAmenity(amenity)}
                        >
                          {amenity} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 4: Photos */}
            {currentStep === 4 && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Photos de votre propriété ({selectedImages.length}/10)
                  </h3>
                  
                  {/* Sample Image URLs for Demo */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {[
                      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                    ].map((url, index) => (
                      <div
                        key={index}
                        onClick={() => addImage(url)}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImages.includes(url)
                            ? 'border-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Sample ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        {selectedImages.includes(url) && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                            <Check className="h-8 w-8 text-blue-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedImages.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Photos sélectionnées:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedImages.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Selected ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            {index === 0 && (
                              <Badge className="absolute -top-2 -left-2 bg-green-500">
                                Photo principale
                              </Badge>
                            )}
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 5: Pricing */}
            {currentStep === 5 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pricePerNight">Prix par nuit (TND) *</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="pricePerNight"
                        type="number"
                        min="1"
                        placeholder="50"
                        value={formData.pricePerNight || ""}
                        onChange={(e) => updateFormData("pricePerNight", parseInt(e.target.value) || 0)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pricePerMonth">Prix par mois (TND) - Optionnel</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="pricePerMonth"
                        type="number"
                        min="1"
                        placeholder="1200"
                        value={formData.pricePerMonth || ""}
                        onChange={(e) => updateFormData("pricePerMonth", parseInt(e.target.value) || 0)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minStay">Séjour minimum (nuits)</Label>
                    <Input
                      id="minStay"
                      type="number"
                      min="1"
                      value={formData.minStay}
                      onChange={(e) => updateFormData("minStay", parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxStay">Séjour maximum (nuits)</Label>
                    <Input
                      id="maxStay"
                      type="number"
                      min="1"
                      value={formData.maxStay}
                      onChange={(e) => updateFormData("maxStay", parseInt(e.target.value) || 365)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 6: Availability */}
            {currentStep === 6 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="instant"
                      checked={formData.isInstant}
                      onCheckedChange={(checked) => updateFormData("isInstant", checked)}
                    />
                    <Label htmlFor="instant">
                      Réservation instantanée
                      <span className="block text-sm text-gray-600">
                        Les voyageurs peuvent réserver immédiatement sans attendre votre approbation
                      </span>
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="houseRules">Règles de la maison</Label>
                    <Textarea
                      id="houseRules"
                      placeholder="Ex: Non-fumeur, Animaux non autorisés, Pas de fêtes..."
                      rows={4}
                      value={formData.houseRules}
                      onChange={(e) => updateFormData("houseRules", e.target.value)}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Résumé de votre annonce</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Titre:</strong> {formData.title || "Non défini"}</div>
                    <div><strong>Type:</strong> {formData.type || "Non défini"}</div>
                    <div><strong>Région:</strong> {formData.region || "Non définie"}</div>
                    <div><strong>Prix par nuit:</strong> {formData.pricePerNight} TND</div>
                    <div><strong>Capacité:</strong> {formData.maxGuests} invités</div>
                    <div><strong>Photos:</strong> {selectedImages.length}/10</div>
                    <div><strong>Équipements:</strong> {formData.amenities.length} sélectionnés</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={nextStep}
              className="bg-mediterranean hover:bg-blue-700 text-white flex items-center gap-2 btn-mediterranean"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createListingMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              {createListingMutation.isPending ? (
                "Publication..."
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Publier l'annonce
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
