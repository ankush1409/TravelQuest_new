# TravelQuest MVP - Phase 1 Foundation
Build a Progressive Web Application for TravelQuest, a gamified travel platform where users earn XP, collect badges, and share travel experiences.

## Project Setup & Architecture

Create a modern React.js + Node.js application with the following structure:

### Frontend (React 18+ with TypeScript)
```
/frontend
  /src
    /components
      /auth
        - LoginForm.tsx (email/password + social login buttons)
        - SignUpForm.tsx (registration with travel preferences)
        - AuthGuard.tsx (protected route wrapper)
      /common
        - Header.tsx (navigation with user avatar/login button)
        - LoadingSpinner.tsx (loading states)
        - Toast.tsx (notification system)
    /pages
      - Dashboard.tsx (main landing page after login)
      - Login.tsx (authentication page)
      - Profile.tsx (basic user profile view)
    /hooks
      - useAuth.tsx (authentication state management)
      - useApi.tsx (API calling hook with error handling)
    /utils
      - api.ts (axios configuration with interceptors)
      - constants.ts (app constants and enums)
    /styles
      - globals.css (Tailwind CSS imports and custom styles)
```

### Backend (Node.js + Express + TypeScript)
```
/backend
  /src
    /routes
      - auth.ts (login, register, profile endpoints)
      - users.ts (user CRUD operations)
    /middleware
      - auth.ts (JWT verification middleware)
      - validation.ts (input validation with Joi)
    /models
      - User.ts (user schema with Prisma)
    /utils
      - jwt.ts (JWT token generation/verification)
      - hash.ts (password hashing with bcrypt)
    - app.ts (Express app configuration)
    - server.ts (server startup)
```

## Core Features for Phase 1

### 1. User Authentication System
- Email/password registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Basic form validation
- Protected routes with authentication guards
- User session management

### 2. User Profile System
- User registration with basic info:
  - email (required, unique)
  - username (required, unique)
  - displayName (required)
  - bio (optional, max 500 characters)
  - profilePicture (optional URL field for now)
  - travelStyle (enum: Solo, Family, Couple, Business, Backpacker)
- Profile viewing and editing
- Basic privacy settings (profile visibility: Public/Private)

### 3. Basic XP System Foundation
- totalXP field in user model (integer, default 0)
- currentLevel calculated field (XP / 100 = Level)
- Simple XP display component showing current XP and level
- Function to award XP (will be used in future phases)

### 4. Responsive UI Foundation
- Mobile-first responsive design using Tailwind CSS
- Clean, modern interface with travel-inspired color scheme
- Toast notification system for user feedback
- Loading states and error handling
- Navigation system with user authentication state

## Technical Requirements

### Database Schema (PostgreSQL with Prisma)
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  username      String   @unique
  displayName   String
  password      String
  bio           String?
  profilePicture String?
  travelStyle   TravelStyle @default(SOLO)
  totalXP       Int      @default(0)
  isPrivate     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("users")
}

enum TravelStyle {
  SOLO
  FAMILY
  COUPLE
  BUSINESS
  BACKPACKER
}
```

### API Endpoints
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
GET  /api/users/:id
```

### Frontend Dependencies
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router v6 for routing
- React Query for API state management
- Axios for HTTP requests
- React Hook Form for form handling
- Zod for client-side validation

### Backend Dependencies
- Node.js 18+
- Express.js with TypeScript
- Prisma ORM with PostgreSQL
- JWT for authentication
- bcrypt for password hashing
- Joi for input validation
- CORS middleware
- helmet for security headers

## Design Guidelines

### Color Scheme
- Primary: Blue (#2563eb) - trust and travel
- Secondary: Green (#16a34a) - adventure and growth  
- Accent: Orange (#ea580c) - energy and achievement
- Neutral: Gray scale for text and backgrounds
- Success: Green for XP gains and achievements
- Warning: Yellow for notifications

### UI Components
- Card-based layout for content sections
- Rounded corners (rounded-lg) for modern feel
- Consistent spacing using Tailwind's spacing scale
- Touch-friendly buttons (min 44px height)
- Clear typography hierarchy
- Smooth transitions and hover effects

### Mobile-First Approach
- Design for mobile screens first (320px+)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly navigation and interactions
- Optimized loading and performance

## User Experience Flow

### New User Registration
1. User visits landing page
2. Clicks "Sign Up" button
3. Fills registration form (email, username, displayName, password, travelStyle)
4. Form validation and submission
5. Automatic login after successful registration
6. Redirect to dashboard with welcome message
7. Profile setup reminder (can be completed later)

### Returning User Login
1. User visits login page
2. Enters email/password
3. Form validation and submission
4. JWT token stored in localStorage
5. Redirect to dashboard
6. Header shows user avatar/name

### Dashboard Experience
1. Welcome message with user's name and level
2. Current XP and progress bar to next level
3. Basic stats display (member since date, level)
4. Navigation to profile editing
5. Placeholder sections for future features (challenges, activity feed)

## Development Instructions

### Setup Process
1. Create new React + Node.js project structure
2. Initialize both frontend and backend with TypeScript
3. Set up Prisma with PostgreSQL database
4. Configure Tailwind CSS for styling
5. Implement basic routing and authentication
6. Create responsive layout components
7. Add form handling and validation
8. Implement JWT authentication flow
9. Add error handling and loading states
10. Test on mobile and desktop viewports

### Success Criteria
- Users can register and login successfully
- Profile creation and editing works properly
- Responsive design works on mobile and desktop
- XP system displays correctly (even if XP is 0)
- All pages load quickly (<2 seconds)
- Forms have proper validation and error messages
- JWT authentication protects routes properly
- Code is clean, typed, and well-organized

Build this as a solid foundation that we can extend with gamification, social features, and advanced functionality in subsequent phases. Focus on code quality, user experience, and mobile responsiveness.