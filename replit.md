# TravelQuest - Gamified Travel Platform

## Overview

TravelQuest is a Progressive Web Application that gamifies travel experiences by allowing users to earn XP, collect badges, and share their adventures. The platform is built as a full-stack TypeScript application with a React frontend and Express backend, featuring user authentication, gamification elements, and a modern UI design system.

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