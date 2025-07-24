# Ekrili - Plateforme de Location Tunisienne

## Overview

Ekrili is a comprehensive rental platform specifically designed for Tunisia, featuring a full-stack web application with property listings, user management, and messaging capabilities. The platform allows users to rent properties (houses, apartments, studios) and equipment with location-based search, real-time chat, and multi-language support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Session-based auth with bcrypt password hashing

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared TypeScript schemas and types
├── migrations/      # Database migration files
└── attached_assets/ # Documentation and assets
```

## Key Components

### Database Schema
- **Users**: Authentication, profiles, roles (tenant/owner/both)
- **Properties**: Listings with categories, pricing, amenities, images
- **Bookings**: Reservation system with date ranges and status tracking
- **Messages**: Real-time messaging between users
- **Reviews**: Property rating and feedback system
- **Favorites**: User bookmark functionality

### Core Features
1. **Multi-language Support**: French, English, Arabic
2. **Property Categories**: Houses, apartments, studios, equipment, student housing
3. **Advanced Search**: Region-based, price filtering, amenity selection
4. **Interactive Map**: Tunisia regions with property visualization
5. **User Roles**: Tenant, property owner, or both
6. **Real-time Chat**: User-to-user messaging system
7. **Booking System**: Date-based reservations
8. **Verification System**: Property and user verification badges

### API Architecture
- RESTful API design with `/api` prefix
- Authentication middleware for protected routes
- Error handling with standardized responses
- Session-based authentication with secure cookies

## Data Flow

1. **User Registration/Login**: Session creation with bcrypt password verification
2. **Property Search**: Filter-based queries with regional mapping
3. **Property Listing**: Multi-step form with image upload and validation
4. **Messaging**: Real-time chat with message persistence
5. **Booking Process**: Date validation and availability checking
6. **Favorites Management**: User-specific property bookmarking

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with custom color palette
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for localization

### Backend Dependencies
- **Database**: Neon Database (PostgreSQL serverless)
- **ORM**: Drizzle ORM with Zod schema validation
- **Session Storage**: connect-pg-simple for PostgreSQL session store
- **Security**: bcrypt for password hashing

### Development Tools
- **TypeScript**: Strict type checking across the stack
- **ESBuild**: Fast bundling for production
- **Vite**: Development server with HMR
- **TSX**: TypeScript execution for development

## Deployment Strategy

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: ESBuild bundles server to `dist/index.js`
- **Database**: Drizzle migrations with `db:push` command

### Environment Configuration
- **Development**: `NODE_ENV=development` with tsx execution
- **Production**: `NODE_ENV=production` with bundled output
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **Sessions**: Configurable secret key for session security

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (Neon Database recommended)
- Static file serving for React build
- Environment variables for database and session configuration

The application follows a monorepo structure with shared TypeScript definitions, enabling type safety across the full stack while maintaining clear separation between frontend and backend concerns.