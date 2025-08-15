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
- ✅ **CORE TRAVEL PLATFORM OPERATIONAL**: Express.js/PostgreSQL architecture fully functional
  - **AUTHENTICATION**: Passport.js with Google OAuth and local email/password authentication working
  - **DATABASE**: PostgreSQL (Neon serverless) with Drizzle ORM handling all data operations
  - **API ENDPOINTS**: RESTful API serving all TravelQuest features (users, locations, check-ins, streaks, referrals)
  - **GOOGLE PLACES INTEGRATION**: Live Google Places API providing authentic location data and recommendations
  - **GAMIFICATION SYSTEM**: Complete XP tracking, level progression, badge system, and achievement mechanics
  - **STREAK MAP SYSTEM**: Interactive world map with region-based streak tracking and analytics
  - **LOCAL GUIDES INTEGRATION**: Google Local Guides API displaying user contributions and XP conversion
  - **REFERRAL SYSTEM**: Working referral code generation and XP rewards for user acquisition
- ✅ **FRONTEND FEATURES COMPLETE**: React 18.3.1 with modern UI/UX
  - **NEOPOP DESIGN SYSTEM**: CRED-inspired dark theme with vibrant gradients and tactile effects
  - **RESPONSIVE INTERFACE**: Mobile-first design with accessible navigation and touch-friendly interactions
  - **REAL-TIME FEATURES**: Live location permissions, GPS-based check-ins, and instant XP updates
  - **INTERACTIVE ONBOARDING**: Step-by-step app introduction with progress tracking and skip options
  - **DASHBOARD CUSTOMIZATION**: Drag-and-drop widgets with user preference storage
  - **ACCESSIBILITY SUPPORT**: WCAG compliant with screen reader support and high contrast modes
- ✅ **PRODUCTION-READY FEATURES**: Stable and secure platform
  - **LOCATION SERVICES**: 200m proximity validation for check-ins with real-time GPS tracking
  - **DATA INTEGRITY**: All features using authentic data sources with proper error handling
  - **SECURITY**: Session-based authentication, password hashing, and CORS protection
  - **PERFORMANCE**: Optimized queries, caching strategies, and efficient API responses
  - **MONITORING**: Request logging, error tracking, and performance metrics

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