import { 
  users, properties, bookings, reviews, messages, favorites,
  type User, type InsertUser, type Property, type InsertProperty,
  type Booking, type InsertBooking, type Review, type InsertReview,
  type Message, type InsertMessage, type Favorite, type InsertFavorite
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Properties
  getProperty(id: number): Promise<Property | undefined>;
  getProperties(filters?: {
    category?: string;
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    isStudentFriendly?: boolean;
    isVerified?: boolean;
    isInstant?: boolean;
  }): Promise<Property[]>;
  getPropertiesByOwner(ownerId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, updates: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;

  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByProperty(propertyId: number): Promise<Booking[]>;
  getBookingsByTenant(tenantId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | undefined>;

  // Reviews
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByProperty(propertyId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Messages
  getMessagesBetweenUsers(senderId: number, receiverId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<boolean>;

  // Favorites
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, propertyId: number): Promise<boolean>;
  isFavorite(userId: number, propertyId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private properties: Map<number, Property> = new Map();
  private bookings: Map<number, Booking> = new Map();
  private reviews: Map<number, Review> = new Map();
  private messages: Map<number, Message> = new Map();
  private favorites: Map<number, Favorite> = new Map();

  private currentUserId = 1;
  private currentPropertyId = 1;
  private currentBookingId = 1;
  private currentReviewId = 1;
  private currentMessageId = 1;
  private currentFavoriteId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const sampleUsers: User[] = [
      {
        id: 1,
        email: "ahmed.khaled@email.com",
        password: "hashed_password",
        firstName: "Ahmed",
        lastName: "Khaled",
        phone: "+216 20 123 456",
        role: "owner",
        avatar: null,
        isVerified: true,
        phoneVerified: true,
        language: "fr",
        createdAt: new Date("2023-01-15"),
      },
      {
        id: 2,
        email: "leila.benali@email.com",
        password: "hashed_password",
        firstName: "Leila",
        lastName: "Benali",
        phone: "+216 25 789 012",
        role: "owner",
        avatar: null,
        isVerified: true,
        phoneVerified: true,
        language: "fr",
        createdAt: new Date("2023-02-20"),
      },
      {
        id: 3,
        email: "med.tarek@email.com",
        password: "hashed_password",
        firstName: "Mohamed",
        lastName: "Tarek",
        phone: "+216 22 345 678",
        role: "owner",
        avatar: null,
        isVerified: true,
        phoneVerified: true,
        language: "fr",
        createdAt: new Date("2023-03-10"),
      },
      {
        id: 4,
        email: "salma.fourati@email.com",
        password: "hashed_password",
        firstName: "Salma",
        lastName: "Fourati",
        phone: "+216 26 901 234",
        role: "owner",
        avatar: null,
        isVerified: true,
        phoneVerified: true,
        language: "fr",
        createdAt: new Date("2023-04-05"),
      }
    ];

    // Create sample properties
    const sampleProperties: Property[] = [
      {
        id: 1,
        ownerId: 1,
        title: "Villa Moderne avec Piscine - Sidi Bou Said",
        description: "Magnifique villa moderne avec piscine privée, vue mer exceptionnelle et finitions haut de gamme. Parfaite pour des vacances en famille ou entre amis.",
        category: "house",
        type: "Villa",
        region: "Tunis",
        location: "Sidi Bou Said, Tunis",
        gpsCoordinates: "36.8684°N, 10.3479°E",
        pricePerNight: "150.00",
        pricePerMonth: "3800.00",
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        isFurnished: true,
        amenities: ["WiFi", "Piscine", "Parking", "Climatisation", "Cuisine", "TV", "Balcon", "Jardin"],
        images: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        isVerified: true,
        isInstant: true,
        isStudentFriendly: false,
        minStay: 2,
        maxStay: 30,
        houseRules: "Non-fumeur, Animaux non autorisés, Fêtes interdites",
        isActive: true,
        rating: "4.9",
        reviewCount: 23,
        createdAt: new Date("2024-01-10"),
      },
      {
        id: 2,
        ownerId: 2,
        title: "Appartement Moderne Centre-ville",
        description: "Appartement moderne et bien équipé au cœur de Tunis, proche de toutes commodités et transports en commun.",
        category: "apartment",
        type: "Appartement",
        region: "Tunis",
        location: "Avenue Habib Bourguiba, Tunis",
        gpsCoordinates: "36.8065°N, 10.1815°E",
        pricePerNight: "65.00",
        pricePerMonth: "1750.00",
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        isFurnished: true,
        amenities: ["WiFi", "Climatisation", "Balcon", "Cuisine", "TV", "Ascenseur"],
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        isVerified: true,
        isInstant: false,
        isStudentFriendly: true,
        minStay: 1,
        maxStay: 365,
        houseRules: "Non-fumeur, Animaux acceptés avec caution",
        isActive: true,
        rating: "4.7",
        reviewCount: 18,
        createdAt: new Date("2024-01-15"),
      },
      {
        id: 3,
        ownerId: 3,
        title: "Matériel Professionnel Événements",
        description: "Location de matériel professionnel pour événements : sonorisation, éclairage, vidéoprojecteurs. Service de livraison et installation inclus.",
        category: "equipment",
        type: "Matériel Audio-Visuel",
        region: "Sousse",
        location: "Zone Industrielle, Sousse",
        gpsCoordinates: "35.8256°N, 10.6411°E",
        pricePerNight: "120.00",
        pricePerMonth: "2400.00",
        bedrooms: 0,
        bathrooms: 0,
        maxGuests: 0,
        isFurnished: false,
        amenities: ["Livraison", "Installation", "Support technique", "Maintenance"],
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        isVerified: true,
        isInstant: true,
        isStudentFriendly: false,
        minStay: 1,
        maxStay: 30,
        houseRules: "Manipulation par professionnels uniquement",
        isActive: true,
        rating: "5.0",
        reviewCount: 31,
        createdAt: new Date("2024-01-20"),
      },
      {
        id: 4,
        ownerId: 4,
        title: "Studio Étudiant Proche Université",
        description: "Studio meublé spécialement aménagé pour étudiants, proche du campus universitaire avec espace de travail et connexion haut débit.",
        category: "student",
        type: "Studio",
        region: "Tunis",
        location: "Campus Universitaire, Tunis",
        gpsCoordinates: "36.8434°N, 10.2111°E",
        pricePerNight: "28.00",
        pricePerMonth: "750.00",
        bedrooms: 0,
        bathrooms: 1,
        maxGuests: 1,
        isFurnished: true,
        amenities: ["WiFi", "Bureau", "Cuisine équipée", "Chauffage", "Parking vélo"],
        images: [
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        isVerified: true,
        isInstant: false,
        isStudentFriendly: true,
        minStay: 30,
        maxStay: 365,
        houseRules: "Étudiants uniquement, Calme respecté après 22h",
        isActive: true,
        rating: "4.6",
        reviewCount: 12,
        createdAt: new Date("2024-01-25"),
      }
    ];

    // Populate data
    sampleUsers.forEach(user => this.users.set(user.id, user));
    sampleProperties.forEach(property => this.properties.set(property.id, property));

    // Update counters
    this.currentUserId = Math.max(...sampleUsers.map(u => u.id)) + 1;
    this.currentPropertyId = Math.max(...sampleProperties.map(p => p.id)) + 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isVerified: false,
      phoneVerified: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Property methods
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getProperties(filters?: {
    category?: string;
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    isStudentFriendly?: boolean;
    isVerified?: boolean;
    isInstant?: boolean;
  }): Promise<Property[]> {
    let properties = Array.from(this.properties.values()).filter(p => p.isActive);

    if (filters) {
      if (filters.category) {
        properties = properties.filter(p => p.category === filters.category);
      }
      if (filters.region) {
        properties = properties.filter(p => p.region === filters.region);
      }
      if (filters.minPrice) {
        properties = properties.filter(p => parseFloat(p.pricePerNight) >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        properties = properties.filter(p => parseFloat(p.pricePerNight) <= filters.maxPrice!);
      }
      if (filters.isStudentFriendly !== undefined) {
        properties = properties.filter(p => p.isStudentFriendly === filters.isStudentFriendly);
      }
      if (filters.isVerified !== undefined) {
        properties = properties.filter(p => p.isVerified === filters.isVerified);
      }
      if (filters.isInstant !== undefined) {
        properties = properties.filter(p => p.isInstant === filters.isInstant);
      }
    }

    return properties;
  }

  async getPropertiesByOwner(ownerId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.ownerId === ownerId);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = {
      ...insertProperty,
      id,
      isVerified: false,
      rating: "0.0",
      reviewCount: 0,
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, updates: Partial<Property>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty = { ...property, ...updates };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByProperty(propertyId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.propertyId === propertyId);
  }

  async getBookingsByTenant(tenantId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.tenantId === tenantId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByProperty(propertyId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.propertyId === propertyId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  // Message methods
  async getMessagesBetweenUsers(senderId: number, receiverId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      m => (m.senderId === senderId && m.receiverId === receiverId) ||
           (m.senderId === receiverId && m.receiverId === senderId)
    ).sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;
    
    message.isRead = true;
    this.messages.set(id, message);
    return true;
  }

  // Favorite methods
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(f => f.userId === userId);
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      createdAt: new Date(),
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: number, propertyId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      f => f.userId === userId && f.propertyId === propertyId
    );
    if (!favorite) return false;
    
    return this.favorites.delete(favorite.id);
  }

  async isFavorite(userId: number, propertyId: number): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      f => f.userId === userId && f.propertyId === propertyId
    );
  }
}

export const storage = new MemStorage();
