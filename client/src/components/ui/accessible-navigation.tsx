import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, Map, Trophy, User, Users, Menu, X, Settings, Bell, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

import { NotificationCenter } from "@/components/ui/notification-center";

// Calculate user level from total XP - matches the system from unified-xp-display
const calculateUserLevel = (xp: number) => {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  if (xp < 2100) return 6;
  if (xp < 2800) return 7;
  if (xp < 3600) return 8;
  if (xp < 4500) return 9;
  // Level 10+: every 1000 XP
  return Math.floor((xp - 4500) / 1000) + 10;
};

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: <Home className="w-5 h-5" />,
    description: "View your dashboard and recent activity"
  },
  {
    id: "map",
    label: "Explore",
    href: "/map",
    icon: <Map className="w-5 h-5" />,
    description: "Discover locations and check-in to places"
  },
  {
    id: "streak-map",
    label: "Streak Map",
    href: "/streak-map",
    icon: <Trophy className="w-5 h-5" />,
    description: "View your travel streaks on an interactive world map"
  },
  {
    id: "challenges",
    label: "Challenges",
    href: "/challenges",
    icon: <Trophy className="w-5 h-5" />,
    description: "Join challenges and compete with other travelers"
  },

  {
    id: "referrals",
    label: "Referrals",
    href: "/referrals",
    icon: <Users className="w-5 h-5" />,
    description: "Invite friends and earn 500 XP per referral"
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    icon: <User className="w-5 h-5" />,
    description: "Manage your profile and view achievements"
  }
];

/**
 * Modern Premium Mobile Navigation with Bold Colors and Smooth Animations
 */
export function MobileNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <motion.nav 
      className="bottom-nav safe-area-pb"
      role="navigation" 
      aria-label="Main navigation"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navigationItems.map((item, index) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <motion.div
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring", 
                stiffness: 400, 
                damping: 25 
              }}
            >
              <Link
                href={item.href}
                className={`nav-item group ${isActive ? 'active' : ''}`}
                role="tab"
                aria-selected={isActive}
                aria-label={`${item.label}: ${item.description}`}
                tabIndex={0}
              >
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-white group-hover:text-purple-300'
                  }`}>
                    {item.icon}
                  </div>
                  
                  {/* Notification Badge */}
                  {item.badge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center"
                      aria-label={`${item.badge} notifications`}
                    >
                      <span className="text-white text-xs font-bold">{item.badge}</span>
                    </motion.div>
                  )}
                  
                  {/* Active Glow Effect */}
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-glow"
                      className="absolute inset-0 -z-10 rounded-2xl"
                      style={{
                        background: "var(--gradient-primary)",
                        filter: "blur(8px)",
                        opacity: 0.6,
                      }}
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
                
                <span className={`text-xs font-semibold mt-1 transition-colors duration-300 ${
                  isActive ? "text-white" : "text-white group-hover:text-purple-300"
                }`}>
                  {item.label}
                </span>
                
                {/* Ripple Effect on Touch */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  initial={false}
                  whileTap={{
                    background: "radial-gradient(circle, rgba(98, 70, 234, 0.3) 0%, transparent 70%)",
                    transition: { duration: 0.2 }
                  }}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>
      
      {/* Central Floating Action Button */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          delay: 0.5,
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
      </motion.div>
    </motion.nav>
  );
}

/**
 * Desktop navigation with dropdown menus and keyboard navigation
 */
export function DesktopNavigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMenuOpen(false);
  };

  return (
    <motion.nav 
      className="sticky top-0 z-50 menu-gradient border-b border-blue-200"
      style={{
        boxShadow: "var(--shadow-lg)",
      }}
      role="navigation"
      aria-label="Main navigation"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Premium Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl p-2 transition-all duration-300 hover:scale-105"
            aria-label="Home"
          >
            <motion.div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm"
              style={{ background: "var(--gradient-primary)" }}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <motion.span 
              className="text-xl font-black ml-3 text-white"
              whileHover={{ scale: 1.05 }}
            >
              TravelQuest
            </motion.span>
          </Link>

          {/* Premium Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.slice(0, 4).map((item, index) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-4 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 group ${
                      isActive
                        ? "text-white bg-white/20 font-bold"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`${item.label}: ${item.description}`}
                  >
                  <div className="flex items-center space-x-2">
                    <div className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                      {item.icon}
                    </div>
                    <span className={`font-medium ${isActive ? 'text-white font-semibold' : 'text-white/80 group-hover:text-white'}`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge 
                        className="h-5 text-xs font-semibold bg-red-500 hover:bg-red-500 text-white border-0 ml-1" 
                        aria-label={`${item.badge} notifications`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-indicator"
                      className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Actions Bar */}
          <div className="flex items-center gap-3">
            {/* Enhanced Notification Bell with Pulse */}
            <NotificationCenter />
          </div>

          {/* Enhanced User Menu with Progress Ring */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-3 focus:ring-2 focus:ring-primary p-2 rounded-2xl hover:bg-primary/5 transition-all duration-300"
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              aria-label={`User menu for ${user?.displayName || 'User'}`}
            >
              {/* Avatar with XP Progress Ring */}
              <div className="relative">
                {/* Progress Ring */}
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="2"
                  />
                  <motion.path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="75, 100" // 75% progress to next level
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: "75, 100" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </svg>
                
                {/* Avatar */}
                <div className="absolute inset-1 rounded-full overflow-hidden">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.displayName}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Level Badge */}
                <motion.div
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-background"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  <span className="text-xs font-bold text-white">8</span>
                </motion.div>
              </div>

              {/* User Info with Quick Actions Preview */}
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-white">
                  {user?.displayName || user?.email?.split('@')[0] || "Traveler"}
                </div>
                <div className="text-xs flex items-center gap-1 text-slate-300">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  1,250 XP • Level 8
                </div>
              </div>

              <Menu className="w-4 h-4 md:hidden" />
            </Button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-64 bg-background border border-border rounded-xl py-2 z-50"
                  style={{ boxShadow: "var(--shadow-xl)" }}
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* Mobile Navigation Links (visible on mobile only) */}
                  <div className="md:hidden">
                    {navigationItems.map((item) => {
                      const isActive = location === item.href;
                      return (
                        <Link
                          key={`mobile-${item.id}`}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                            isActive ? "text-primary bg-primary/10" : "text-foreground"
                          }`}
                          role="menuitem"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                          {item.badge && (
                            <Badge variant="destructive" className="ml-auto h-5 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                    <hr className="my-2 border-border" />
                  </div>

                  {/* Quick Actions Section */}
                  <div className="px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "hsl(var(--foreground))" }}>
                      QUICK ACTIONS
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex flex-col items-center p-4 rounded-lg hover:bg-primary/8 transition-all duration-200 group border border-transparent hover:border-primary/20"
                        role="menuitem"
                      >
                        <User className="w-6 h-6 text-primary group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>Profile</span>
                      </Link>
                      
                      <Link
                        href="/challenges"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex flex-col items-center p-4 rounded-lg hover:bg-amber-50 transition-all duration-200 group border border-transparent hover:border-amber-200"
                        role="menuitem"
                      >
                        <Trophy className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>Badges</span>
                      </Link>
                    </div>
                  </div>

                  <hr className="my-2 border-border" />

                  {/* User Menu Items */}
                  <Link
                    href="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-4 hover:bg-muted/50 transition-colors group rounded-lg mx-2"
                    style={{ color: "hsl(var(--foreground))" }}
                    role="menuitem"
                  >
                    <Settings className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:rotate-90 transition-all duration-300" />
                    <span className="font-medium">Settings</span>
                  </Link>
                  
                  <Link
                    href="/notifications"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-4 hover:bg-muted/50 transition-colors rounded-lg mx-2"
                    style={{ color: "hsl(var(--foreground))" }}
                    role="menuitem"
                  >
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Notifications</span>
                    <Badge 
                      className="ml-auto h-5 text-xs font-semibold bg-red-500 hover:bg-red-500 text-white border-0"
                    >
                      3
                    </Badge>
                  </Link>

                  <hr className="my-3 border-border mx-2" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-4 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg mx-2 font-medium"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                    role="menuitem"
                  >
                    <X className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

/**
 * Skip link for screen readers and keyboard navigation
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50 font-medium"
    >
      Skip to main content
    </a>
  );
}

/**
 * Breadcrumb navigation for better context
 */
interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-muted-foreground">/</span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}