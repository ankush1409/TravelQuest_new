import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, Map, Trophy, User, Menu, X, Settings, Bell, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

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
    id: "challenges",
    label: "Challenges",
    href: "/challenges",
    icon: <Trophy className="w-5 h-5" />,
    description: "Join challenges and compete with other travelers"
  },
  {
    id: "flights",
    label: "Flights",
    href: "/flights",
    icon: <Plane className="w-5 h-5" />,
    description: "Track flights and monitor arrivals in real-time"
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
 * Accessible mobile navigation component with proper ARIA labels
 */
export function MobileNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-40 safe-area-pb"
      role="navigation" 
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-0 flex-1 group ${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              role="tab"
              aria-selected={isActive}
              aria-label={`${item.label}: ${item.description}`}
              tabIndex={0}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                    aria-label={`${item.badge} notifications`}
                  >
                    {item.badge}
                  </Badge>
                )}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-xs font-medium mt-1 truncate max-w-full ${
                isActive ? "text-primary" : "text-inherit"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
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
    <nav 
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1"
            aria-label="TravelQuest home"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-foreground">TravelQuest</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${item.label}: ${item.description}`}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="h-5 text-xs" aria-label={`${item.badge} notifications`}>
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-indicator"
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 focus:ring-2 focus:ring-primary"
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              aria-label={`User menu for ${user?.displayName || 'User'}`}
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.displayName}'s profile`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
              <span className="hidden sm:block font-medium text-foreground">
                {user?.displayName || "User"}
                {user?.totalXP && user.totalXP >= 100 && (
                  <span className="ml-1 text-yellow-500" title={`Level ${calculateUserLevel(user.totalXP)} Explorer`}>
                    🏅
                  </span>
                )}
              </span>
              <Menu className="w-4 h-4 md:hidden" />
            </Button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-2xl py-2 z-50"
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

                  {/* User Menu Items */}
                  <Link
                    href="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-colors text-foreground"
                    role="menuitem"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  
                  <Link
                    href="/notifications"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-colors text-foreground"
                    role="menuitem"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </Link>

                  <hr className="my-2 border-border" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-colors text-destructive"
                    role="menuitem"
                  >
                    <X className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
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