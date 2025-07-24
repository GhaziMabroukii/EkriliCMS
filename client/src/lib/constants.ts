export const TUNISIA_REGIONS = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia",
  "Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];

export const PROPERTY_CATEGORIES = [
  { id: 'house', label: 'Maisons & Villas', icon: '🏠', color: 'blue' },
  { id: 'apartment', label: 'Appartements', icon: '🏢', color: 'orange' },
  { id: 'studio', label: 'Studios', icon: '🏠', color: 'yellow' },
  { id: 'equipment', label: 'Équipements', icon: '🔧', color: 'green' },
  { id: 'student', label: 'Logement Étudiant', icon: '🎓', color: 'purple' },
];

export const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'cuisine', label: 'Cuisine', icon: '🍳' },
  { id: 'parking', label: 'Parking', icon: '🚗' },
  { id: 'climatisation', label: 'Climatisation', icon: '❄️' },
  { id: 'chauffage', label: 'Chauffage', icon: '🔥' },
  { id: 'machine_laver', label: 'Machine à laver', icon: '👕' },
  { id: 'tv', label: 'TV', icon: '📺' },
  { id: 'balcon', label: 'Balcon', icon: '🌿' },
  { id: 'jardin', label: 'Jardin', icon: '🌳' },
  { id: 'piscine', label: 'Piscine', icon: '🏊' },
  { id: 'gym', label: 'Gym', icon: '🏋️' },
  { id: 'ascenseur', label: 'Ascenseur', icon: '🛗' },
  { id: 'animaux', label: 'Animaux autorisés', icon: '🐕' },
  { id: 'fumeur', label: 'Fumeur autorisé', icon: '🚬' },
];

export const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳' },
];

export const SEARCH_PURPOSES = [
  { id: 'tourism', label: 'Tourisme', icon: '🏖️' },
  { id: 'family', label: 'Famille', icon: '👨‍👩‍👧‍👦' },
  { id: 'student', label: 'Étudiant', icon: '🎓' },
  { id: 'business', label: 'Affaires', icon: '💼' },
  { id: 'longterm', label: 'Long terme', icon: '🏡' },
];

export const SEARCH_PERIODS = [
  { id: 'night', label: 'Nuit' },
  { id: 'day', label: 'Jour' },
  { id: 'week', label: 'Semaine' },
  { id: 'month', label: 'Mois' },
  { id: 'year', label: 'Année' },
];

export const PROPERTY_TYPES = [
  'Villa', 'Appartement', 'Studio', 'Maison', 'Loft', 
  'Chambre', 'Équipement Audio-Visuel', 'Matériel Professionnel'
];

export const QUICK_FILTERS = [
  { id: 'verified', label: 'Vérifié', icon: '✅', color: 'green' },
  { id: 'instant', label: 'Instant', icon: '⚡', color: 'yellow' },
  { id: 'student', label: 'Étudiant', icon: '🎓', color: 'purple' },
  { id: 'popular', label: 'Populaire', icon: '🔥', color: 'red' },
];

export const DASHBOARD_STATS = {
  tenant: [
    { key: 'totalSpent', label: 'Total dépensé', suffix: ' TND', color: 'blue' },
    { key: 'bookings', label: 'Réservations', suffix: '', color: 'green' },
    { key: 'favorites', label: 'Favoris', suffix: '', color: 'red' },
    { key: 'reviews', label: 'Avis donnés', suffix: '', color: 'purple' },
  ],
  owner: [
    { key: 'totalRevenue', label: 'Revenus totaux', suffix: ' TND', color: 'green' },
    { key: 'properties', label: 'Annonces', suffix: '', color: 'blue' },
    { key: 'bookings', label: 'Réservations', suffix: '', color: 'orange' },
    { key: 'rating', label: 'Note moyenne', suffix: '⭐', color: 'yellow' },
  ],
};

export const SAMPLE_COORDINATES = {
  'Tunis': { lat: 36.8065, lng: 10.1815, count: 447 },
  'Sousse': { lat: 35.8256, lng: 10.6411, count: 203 },
  'Sfax': { lat: 34.7406, lng: 10.7603, count: 156 },
  'Djerba': { lat: 33.8076, lng: 10.8451, count: 189 },
  'Monastir': { lat: 35.7643, lng: 10.8113, count: 98 },
  'Nabeul': { lat: 36.4560, lng: 10.7373, count: 87 },
  'Bizerte': { lat: 37.2744, lng: 9.8739, count: 72 },
};
