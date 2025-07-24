export interface SearchFilters {
  category?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  purpose?: string;
  period?: string;
  isStudentFriendly?: boolean;
  isVerified?: boolean;
  isInstant?: boolean;
  query?: string;
}

export interface PropertyWithOwner {
  id: number;
  ownerId: number;
  title: string;
  description: string;
  category: string;
  type: string;
  region: string;
  location: string;
  gpsCoordinates: string | null;
  pricePerNight: string;
  pricePerMonth: string | null;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  isFurnished: boolean;
  amenities: string[];
  images: string[];
  isVerified: boolean;
  isInstant: boolean;
  isStudentFriendly: boolean;
  minStay: number;
  maxStay: number;
  houseRules: string | null;
  isActive: boolean;
  rating: string;
  reviewCount: number;
  createdAt: Date;
  owner: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string | null;
    phone: string | null;
    isVerified: boolean;
  };
}

export interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  title: string;
  price: string;
  category: string;
  isVerified: boolean;
  isInstant: boolean;
}

export interface CategoryStats {
  id: string;
  label: string;
  icon: string;
  count: number;
  startingPrice: string;
  color: string;
}

export interface RegionStats {
  name: string;
  count: number;
  occupation: number;
  startingPrice: string;
  avgRevenue: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface UserStats {
  totalSpent?: number;
  totalRevenue?: number;
  bookings: number;
  favorites?: number;
  properties?: number;
  rating?: number;
  reviews?: number;
  responseRate?: number;
  occupancyRate?: number;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  propertyId?: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface BookingWithDetails {
  id: number;
  propertyId: number;
  tenantId: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  message: string | null;
  createdAt: Date;
  property: {
    title: string;
    images: string[];
    category: string;
    location: string;
  };
  tenant?: {
    firstName: string;
    lastName: string;
    phone: string | null;
    avatar: string | null;
  };
}

export interface ReviewWithUser {
  id: number;
  propertyId: number;
  tenantId: number;
  bookingId: number;
  rating: number;
  comment: string | null;
  photos: string[];
  createdAt: Date;
  tenant: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

export interface ListingFormData {
  title: string;
  description: string;
  category: string;
  type: string;
  region: string;
  location: string;
  pricePerNight: number;
  pricePerMonth?: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  isFurnished: boolean;
  amenities: string[];
  images: string[];
  minStay: number;
  maxStay: number;
  isInstant: boolean;
  houseRules?: string;
}
