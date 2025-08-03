import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Download, Upload, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OfflineData {
  id: string;
  type: "location" | "challenge" | "profile";
  data: any;
  timestamp: number;
  synced: boolean;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  networkStatus: "online" | "offline" | "slow";
  cacheHitRate: number;
}

/**
 * Service Worker registration and management for offline functionality
 */
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setIsRegistered(true);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });
    }
  }, []);

  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  }, []);

  return { isRegistered, updateAvailable, updateApp };
}

/**
 * Network status monitoring with adaptive loading
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'offline'>('fast');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Test connection speed
      const startTime = Date.now();
      fetch('/api/ping', { method: 'HEAD' })
        .then(() => {
          const duration = Date.now() - startTime;
          setConnectionSpeed(duration > 1000 ? 'slow' : 'fast');
        })
        .catch(() => setConnectionSpeed('offline'));
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionSpeed('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection test
    handleOnline();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionSpeed };
}

/**
 * Offline data synchronization manager
 */
export function useOfflineSync() {
  const [pendingData, setPendingData] = useState<OfflineData[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const { isOnline } = useNetworkStatus();

  // Load pending data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('travelquest-offline-data');
    if (stored) {
      try {
        setPendingData(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to parse offline data:', error);
      }
    }
  }, []);

  // Save pending data to localStorage
  useEffect(() => {
    localStorage.setItem('travelquest-offline-data', JSON.stringify(pendingData));
  }, [pendingData]);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && pendingData.length > 0 && !syncInProgress) {
      syncData();
    }
  }, [isOnline, pendingData.length, syncInProgress]);

  const addOfflineData = useCallback((type: OfflineData['type'], data: any) => {
    const offlineData: OfflineData = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };
    setPendingData(prev => [...prev, offlineData]);
  }, []);

  const syncData = useCallback(async () => {
    if (!isOnline || syncInProgress) return;

    setSyncInProgress(true);
    const syncPromises = pendingData.map(async (item) => {
      try {
        // Sync based on data type
        let endpoint = '';
        switch (item.type) {
          case 'location':
            endpoint = '/api/locations';
            break;
          case 'challenge':
            endpoint = '/api/challenges/join';
            break;
          case 'profile':
            endpoint = '/api/profile';
            break;
        }

        if (endpoint) {
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data)
          });
          return { ...item, synced: true };
        }
        return item;
      } catch (error) {
        console.warn(`Failed to sync ${item.type}:`, error);
        return item;
      }
    });

    const syncedData = await Promise.all(syncPromises);
    setPendingData(syncedData.filter(item => !item.synced));
    setSyncInProgress(false);
  }, [isOnline, syncInProgress, pendingData]);

  return {
    pendingData,
    syncInProgress,
    addOfflineData,
    syncData,
    hasPendingData: pendingData.length > 0
  };
}

/**
 * Performance monitoring component
 */
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const { isOnline, connectionSpeed } = useNetworkStatus();

  useEffect(() => {
    // Monitor performance metrics
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const loadTime = entries.find(entry => entry.entryType === 'navigation')?.duration || 0;
      const renderTime = entries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        networkStatus: !isOnline ? 'offline' : connectionSpeed === 'slow' ? 'slow' : 'online',
        cacheHitRate: 85 // Placeholder - would be calculated from actual cache hits
      });
    });

    observer.observe({ entryTypes: ['navigation', 'paint'] });

    return () => observer.disconnect();
  }, [isOnline, connectionSpeed]);

  if (!metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-xs" role="status" aria-live="polite">
      <Card className="neopop-card bg-background/95 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">Performance</span>
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi className={`w-3 h-3 ${connectionSpeed === 'slow' ? 'text-yellow-500' : 'text-green-500'}`} />
              ) : (
                <WifiOff className="w-3 h-3 text-red-500" />
              )}
            </div>
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Load Time:</span>
              <span className={metrics.loadTime > 3000 ? 'text-red-500' : 'text-green-500'}>
                {(metrics.loadTime / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cache Hit:</span>
              <span className="text-green-500">{metrics.cacheHitRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Offline status indicator and sync manager
 */
export function OfflineIndicator() {
  const { isOnline, connectionSpeed } = useNetworkStatus();
  const { pendingData, syncInProgress, syncData, hasPendingData } = useOfflineSync();
  const { updateAvailable, updateApp } = useServiceWorker();

  if (isOnline && !hasPendingData && !updateAvailable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
      >
        <Card className="neopop-card border-2">
          <CardContent className="p-4">
            {/* Update Available */}
            {updateAvailable && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-foreground">Update Available</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  A new version of TravelQuest is ready to install.
                </p>
                <Button 
                  onClick={updateApp} 
                  size="sm" 
                  className="neopop-button w-full"
                >
                  Update Now
                </Button>
              </div>
            )}

            {/* Offline Status */}
            {!isOnline && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-foreground">You're Offline</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your actions will be saved and synced when you're back online.
                </p>
              </div>
            )}

            {/* Slow Connection */}
            {isOnline && connectionSpeed === 'slow' && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-foreground">Slow Connection</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Some features may load slower than usual.
                </p>
              </div>
            )}

            {/* Pending Sync */}
            {hasPendingData && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-foreground">
                      {pendingData.length} item{pendingData.length !== 1 ? 's' : ''} to sync
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {syncInProgress ? 'Syncing...' : 'Pending'}
                  </Badge>
                </div>
                
                {syncInProgress && (
                  <Progress value={66} className="mb-3" />
                )}
                
                {isOnline && !syncInProgress && (
                  <Button 
                    onClick={syncData} 
                    size="sm" 
                    variant="outline"
                    className="w-full"
                  >
                    Sync Now
                  </Button>
                )}
                
                <div className="mt-2 space-y-1">
                  {pendingData.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground capitalize">
                        {item.type} update
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {pendingData.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{pendingData.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Lazy loading wrapper component for performance optimization
 */
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}

export function LazyWrapper({ children, fallback, threshold = 0.1 }: LazyWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref);
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return (
    <div ref={setRef}>
      {isVisible ? children : (fallback || (
        <div className="animate-pulse bg-muted/30 rounded-lg h-32" />
      ))}
    </div>
  );
}