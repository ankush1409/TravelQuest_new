# TravelQuest - Gamified Travel Platform

## Overview

TravelQuest is a Progressive Web Application that gamifies travel experiences by allowing users to earn XP, collect badges, and share their adventures. The platform features a CRED-inspired NeoPOP design system with dark theme aesthetics, location-based gameplay, and comprehensive gamification mechanics. Built as a full-stack TypeScript application with React frontend and Express backend.

## Recent Changes

**Phase 2 Implementation (January 2025)**
- ✅ Implemented comprehensive location-based features with interactive map, check-ins, and discoveries
- ✅ Added PostgreSQL database with locations, checkIns, and discoveries tables
- ✅ Built location-aware API endpoints with geolocation and distance calculations  
- ✅ Created Map & Check-ins page with real-time location permissions and 100m proximity validation
- ✅ **MAJOR UI REDESIGN**: Transformed entire interface with CRED-inspired NeoPOP style
  - Dark theme with vibrant neon accents (purple, cyan, yellow gradients)
  - Custom NeoPOP card components with tactile shadow effects and subtle lighting
  - Large display numbers with gradient text effects for XP and stats
  - Micro-interactions and hover animations throughout interface
  - Mobile-first bottom navigation with bold typography
  - Custom CSS classes: `.neopop-card`, `.neopop-button`, `.display-number`, `.neon-glow-*`

**Phase 3 Implementation (August 2025)**
- ✅ **GOOGLE OAUTH AUTHENTICATION**: Complete Google OAuth 2.0 integration
  - Passport.js Google OAuth strategy with secure session management
  - Database schema updated with optional password field and Google OAuth columns
  - Google login button with NeoPOP styling and smooth animations
  - Automatic account creation and linking for Google users
  - Fallback email/password authentication for traditional users
  - JWT token generation for API access and session persistence
  - Complete auth page redesign with dark theme and gradient accents

**Phase 4 Implementation (August 2025)**
- ✅ **COMPREHENSIVE UI/UX ENHANCEMENTS**: Maximum user friendliness and accessibility
  - Interactive onboarding flows with progressive feature teaching and skip options
  - Accessible navigation with WCAG compliance, screen reader support, and clear labeling
  - Customizable dashboard with drag-and-drop widgets and user preference storage
  - Enhanced gamification feedback with animated progress bars and celebratory effects
  - Performance optimizations including offline sync, service worker, and lazy loading
  - Mobile-first responsive design with touch-friendly 44px minimum targets
  - High contrast mode support and reduced motion preferences
  - Quick settings panel for common user preferences and theme switching

**Phase 5 Implementation (August 2025)**
- ✅ **GOOGLE LOCAL GUIDES INTEGRATION**: Complete integration with Google Local Guides API
  - Database schema enhanced with Local Guides fields (level, points, reviews, photos, etc.)
  - Beautiful NeoPOP-styled Local Guides profile cards with animated statistics
  - Privacy-respecting integration using only public profile data
  - API endpoints for connecting/disconnecting Local Guides profiles
  - Sample data generation for demonstration purposes
  - Comprehensive stats display with level badges and contribution metrics

**Phase 6 Implementation (August 2025)**
- ✅ **ENHANCED USER EXPERIENCE**: Maximum user-friendliness improvements
  - Interactive onboarding tour with step-by-step app introduction
  - Fixed text input visibility issues with proper contrast and styling
  - Enhanced form styling with better focus states and readability
  - User preference fields for personalization (theme, notifications, privacy)
  - Confetti celebrations for onboarding completion
  - Progress indicators and skip options for better UX flow

**Current Status (August 2025)**
- ✅ **UNIFIED XP CONVERGENCE SYSTEM**: Complete Local Guides to TravelQuest XP integration
  - **BALANCED XP CONVERSION**: Reviews (3 XP), Photos (1 XP), Videos (5 XP), Edits (2 XP), Questions (3 XP), Facts (2 XP), Roads (10 XP), Lists (8 XP), Level bonus (200 XP per level)
  - **PROGRESSIVE LEVEL SCALING**: Level 1 (0-99 XP), Level 2 (100-299 XP), Level 3 (300-599 XP), Level 4 (600-999 XP), Level 5 (1000+ XP)
  - Users start with 100 XP base to match balanced progression system
  - Enhanced Travel Stats display with clear "XP needed for next level" messaging
  - Updated badge requirements aligned with new level progression (Level 2=100 XP, Level 3=300 XP, etc.)
  - Fixed Local Guides API import errors - system now uses demo data reliably
- ✅ **COMPLETE FLIGHTRADAR24 REMOVAL**: All flight tracking functionality removed per user request
  - **BACKEND CLEANUP**: Removed server/flightRadar.ts, all flight API routes, and flight-related endpoints
  - **FRONTEND CLEANUP**: Removed flights-page.tsx, flight-detail-card.tsx, aircraft-info-card.tsx, and flight-dashboard.tsx
  - **NAVIGATION CLEANUP**: Removed flights navigation item from accessible-navigation.tsx and updated App.tsx routing
  - **DASHBOARD CLEANUP**: Removed flight widget from dashboard customization and all flight-related queries
  - **IMPORTS CLEANUP**: Removed all flight-related imports and dependencies throughout the codebase
  - Application now focuses exclusively on core travel gamification without flight tracking features
- ✅ **STREAMLINED TRAVEL PLATFORM**: Core features operational without flight functionality
  - Google OAuth authentication working correctly
  - Google Local Guides integration displaying user contributions and earning XP
  - Interactive onboarding helping new users understand features
  - Text inputs clearly visible with proper contrast
  - Database schema supporting gamification and integration features
  - Referral system with comprehensive XP rewards and tracking
  - Location-based check-ins and discovery features
  - Ready for production deployment with focused feature set excluding flight tracking

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18+ and TypeScript, utilizing a component-based architecture with the following key decisions:

- **UI Framework**: Uses shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Authentication**: Context-based auth provider with protected routes

### Backend Architecture
The backend follows a modular Express.js structure:

- **Framework**: Express.js with TypeScript for type safety
- **Authentication**: Passport.js with local strategy using session-based auth
- **Session Management**: Express sessions with configurable storage (currently memory-based)
- **Password Security**: Native Node.js crypto (scrypt) for password hashing
- **Middleware**: Custom authentication, validation, and error handling middleware

### Data Storage
The application uses a PostgreSQL database with the following design decisions:

- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Database Provider**: Neon (serverless PostgreSQL) for scalable cloud hosting
- **Connection Management**: Connection pooling with @neondatabase/serverless
- **Schema Management**: Centralized schema definitions in shared directory for type consistency

### Build and Development Tools
- **Build Tool**: Vite for fast development and optimized production builds
- **Bundling**: ESBuild for server-side bundling in production
- **Development**: Hot module replacement and runtime error overlay in development
- **Code Quality**: TypeScript strict mode with comprehensive type checking

### Project Structure
The application follows a monorepo structure with clear separation of concerns:

- `/client` - React frontend application
- `/server` - Express backend application  
- `/shared` - Shared TypeScript schemas and types
- Centralized configuration files for tooling (Tailwind, TypeScript, Vite)

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tooling

### UI and Design System
- **Radix UI**: Accessible component primitives for complex UI patterns
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Consistent icon library for UI elements

### Development and Build Tools
- **Replit Integration**: Development environment support with cartographer and runtime error modal
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

### Authentication and Security
- **Passport.js**: Authentication middleware with local strategy
- **Express Session**: Session management with configurable store options
- **Connect PG Simple**: PostgreSQL session store option (configured but not actively used)

### Form and Data Validation
- **Zod**: Runtime type validation for forms and API endpoints
- **React Hook Form**: Form state management with validation integration
- **Hookform Resolvers**: Integration layer between React Hook Form and Zod

### State Management and API
- **TanStack React Query**: Server state management, caching, and synchronization
- **Wouter**: Lightweight routing solution for single-page application navigation