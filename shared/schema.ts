import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["tenant", "owner", "both"] }).notNull().default("tenant"),
  avatar: text("avatar"),
  isVerified: boolean("is_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  language: text("language", { enum: ["fr", "en", "ar"] }).default("fr"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category", { enum: ["house", "apartment", "studio", "equipment", "student"] }).notNull(),
  type: text("type").notNull(), // Villa, Appartement, Studio, etc.
  region: text("region").notNull(),
  location: text("location").notNull(),
  gpsCoordinates: text("gps_coordinates"),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  pricePerMonth: decimal("price_per_month", { precision: 10, scale: 2 }),
  bedrooms: integer("bedrooms").default(0),
  bathrooms: integer("bathrooms").default(0),
  maxGuests: integer("max_guests").notNull(),
  isFurnished: boolean("is_furnished").default(false),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  images: jsonb("images").$type<string[]>().default([]),
  isVerified: boolean("is_verified").default(false),
  isInstant: boolean("is_instant").default(false),
  isStudentFriendly: boolean("is_student_friendly").default(false),
  minStay: integer("min_stay").default(1), // in nights
  maxStay: integer("max_stay").default(365),
  houseRules: text("house_rules"),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  tenantId: integer("tenant_id").references(() => users.id).notNull(),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  guests: integer("guests").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["pending", "confirmed", "active", "completed", "cancelled"] }).notNull().default("pending"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  tenantId: integer("tenant_id").references(() => users.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  photos: jsonb("photos").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isVerified: true,
  phoneVerified: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  isVerified: true,
  rating: true,
  reviewCount: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
