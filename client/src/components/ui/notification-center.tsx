import { useState, useEffect } from "react";
import { Bell, X, Check, Info, AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "achievement";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "achievement",
      title: "Level Up!",
      message: "You've reached Level 5 and earned 500 XP!",
      timestamp: new Date(Date.now() - 300000),
      isRead: false,
    },
    {
      id: "2",
      type: "success",
      title: "Check-in Complete",
      message: "Successfully checked in at Central Park",
      timestamp: new Date(Date.now() - 900000),
      isRead: false,
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case "success":
        return <Check className="w-4 h-4" />;
      case "info":
        return <Info className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "achievement":
        return <Zap className="w-4 h-4" />;
    }
  };

  const getColorClasses = (type: Notification['type']) => {
    switch (type) {
      case "success":
        return "from-green-500 to-emerald-500";
      case "info":
        return "from-blue-500 to-cyan-500";
      case "warning":
        return "from-yellow-500 to-orange-500";
      case "achievement":
        return "from-purple-500 to-pink-500";
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-all duration-300 text-white"
        aria-label={`Notifications: ${unreadCount} unread`}
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center"
          >
            <span className="text-white text-xs font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </motion.div>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-xl z-50"
            style={{ 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              backgroundColor: "#ffffff",
              color: "#1a1a1a"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50 text-gray-400" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`relative p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                        notification.isRead 
                          ? "bg-muted/30" 
                          : "bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20"
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getColorClasses(notification.type)} flex items-center justify-center flex-shrink-0`}>
                          <div className="text-white">
                            {getIcon(notification.type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm truncate text-gray-900">
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {notification.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            
                            {notification.actionLabel && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.onAction?.();
                                }}
                                className="text-xs premium-button-secondary h-6 px-3"
                              >
                                {notification.actionLabel}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}