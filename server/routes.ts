import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPropertySchema, insertBookingSchema, insertMessageSchema, insertFavoriteSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'ekrili-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      (req.session as any).userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const { category, region, minPrice, maxPrice, isStudentFriendly, isVerified, isInstant } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (region) filters.region = region as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (isStudentFriendly) filters.isStudentFriendly = isStudentFriendly === 'true';
      if (isVerified) filters.isVerified = isVerified === 'true';
      if (isInstant) filters.isInstant = isInstant === 'true';

      const properties = await storage.getProperties(filters);
      
      // Include owner information for each property
      const propertiesWithOwners = await Promise.all(
        properties.map(async (property) => {
          const owner = await storage.getUser(property.ownerId);
          if (owner) {
            const { password, ...ownerWithoutPassword } = owner;
            return { ...property, owner: ownerWithoutPassword };
          }
          return property;
        })
      );
      
      res.json(propertiesWithOwners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      // Get owner info
      const owner = await storage.getUser(property.ownerId);
      const { password, ...ownerWithoutPassword } = owner!;

      res.json({
        ...property,
        owner: ownerWithoutPassword,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        ownerId: userId,
      });

      const property = await storage.createProperty(propertyData);
      res.json(property);
    } catch (error) {
      res.status(400).json({ error: "Invalid property data" });
    }
  });

  app.get("/api/properties/owner/:ownerId", async (req, res) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      const properties = await storage.getPropertiesByOwner(ownerId);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner properties" });
    }
  });

  // Search route
  app.get("/api/search", async (req, res) => {
    try {
      const { q, category, region, minPrice, maxPrice, purpose } = req.query;
      
      const filters: any = {};
      if (category && category !== 'both') filters.category = category as string;
      if (region) filters.region = region as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      
      // Map purpose to categories
      if (purpose) {
        switch (purpose) {
          case 'student':
            filters.isStudentFriendly = true;
            break;
          case 'tourism':
            filters.category = 'house';
            break;
        }
      }

      let properties = await storage.getProperties(filters);

      // Text search if query provided
      if (q) {
        const query = (q as string).toLowerCase();
        properties = properties.filter(p => 
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
        );
      }

      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Booking routes
  app.post("/api/bookings", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        tenantId: userId,
      });

      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  app.get("/api/bookings/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const bookings = await storage.getBookingsByTenant(tenantId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/property/:propertyId", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const bookings = await storage.getBookingsByProperty(propertyId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Message routes
  app.get("/api/messages/:userId", requireAuth, async (req, res) => {
    try {
      const currentUserId = (req.session as any).userId;
      const otherUserId = parseInt(req.params.userId);
      
      const messages = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const senderId = (req.session as any).userId;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });

      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Favorite routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getFavoritesByUser(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId,
      });

      const favorite = await storage.addFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ error: "Invalid favorite data" });
    }
  });

  app.delete("/api/favorites/:propertyId", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const propertyId = parseInt(req.params.propertyId);
      
      const success = await storage.removeFavorite(userId, propertyId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // Reviews routes
  app.get("/api/reviews/property/:propertyId", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const reviews = await storage.getReviewsByProperty(propertyId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Stats routes
  app.get("/api/stats/overview", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      const stats = {
        totalProperties: properties.length,
        propertiesByCategory: {
          house: properties.filter(p => p.category === 'house').length,
          apartment: properties.filter(p => p.category === 'apartment').length,
          equipment: properties.filter(p => p.category === 'equipment').length,
          student: properties.filter(p => p.category === 'student').length,
        },
        propertiesByRegion: {
          'Tunis': properties.filter(p => p.region === 'Tunis').length,
          'Sousse': properties.filter(p => p.region === 'Sousse').length,
          'Sfax': properties.filter(p => p.region === 'Sfax').length,
          'Djerba': properties.filter(p => p.region === 'Djerba').length,
        }
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
