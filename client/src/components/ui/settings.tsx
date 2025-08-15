import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { LocalGuidesSettings } from "@/components/ui/local-guides-settings";
import { 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Volume2, 
  Eye, 
  Download, 
  Trash2,
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "select" | "slider" | "button";
  value?: boolean | string | number;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  action?: () => void;
  variant?: "default" | "destructive";
}

const settingsSections: SettingsSection[] = [
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect external services and platforms",
    icon: <MapPin className="w-5 h-5" />,
    items: []
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Manage how you receive updates and alerts",
    icon: <Bell className="w-5 h-5" />,
    items: [
      {
        id: "push-notifications",
        label: "Push Notifications",
        description: "Receive notifications about new challenges and achievements",
        type: "toggle",
        value: true
      },
      {
        id: "email-notifications",
        label: "Email Updates",
        description: "Get weekly summaries and important updates via email",
        type: "toggle",
        value: false
      },
      {
        id: "achievement-sounds",
        label: "Achievement Sounds",
        description: "Play sounds when you unlock badges or level up",
        type: "toggle",
        value: true
      },
      {
        id: "notification-frequency",
        label: "Notification Frequency",
        description: "How often you want to receive notifications",
        type: "select",
        value: "normal",
        options: [
          { value: "minimal", label: "Minimal - Only important updates" },
          { value: "normal", label: "Normal - Regular updates" },
          { value: "frequent", label: "Frequent - All activities" }
        ]
      }
    ]
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    description: "Control your privacy settings and data sharing",
    icon: <Shield className="w-5 h-5" />,
    items: [
      {
        id: "profile-visibility",
        label: "Profile Visibility",
        description: "Who can see your profile and activities",
        type: "select",
        value: "public",
        options: [
          { value: "public", label: "Public - Anyone can see" },
          { value: "friends", label: "Friends Only" },
          { value: "private", label: "Private - Only you" }
        ]
      },
      {
        id: "location-sharing",
        label: "Location Sharing",
        description: "Share your check-ins with other travelers",
        type: "toggle",
        value: true
      },
      {
        id: "analytics",
        label: "Analytics & Insights",
        description: "Help improve the app by sharing anonymous usage data",
        type: "toggle",
        value: true
      },
      {
        id: "two-factor-auth",
        label: "Two-Factor Authentication",
        description: "Add an extra layer of security to your account",
        type: "button",
        action: () => console.log("Setup 2FA")
      }
    ]
  },
  {
    id: "appearance",
    title: "Appearance",
    description: "Customize the look and feel of the app",
    icon: <Palette className="w-5 h-5" />,
    items: [
      {
        id: "theme",
        label: "Theme",
        description: "Choose your preferred color scheme",
        type: "select",
        value: "dark",
        options: [
          { value: "light", label: "Light Mode" },
          { value: "dark", label: "Dark Mode" },
          { value: "system", label: "System Default" }
        ]
      },
      {
        id: "animations",
        label: "Animations",
        description: "Enable smooth animations and transitions",
        type: "toggle",
        value: true
      },
      {
        id: "font-size",
        label: "Font Size",
        description: "Adjust text size for better readability",
        type: "slider",
        value: 16,
        min: 12,
        max: 24,
        step: 1
      },
      {
        id: "high-contrast",
        label: "High Contrast Mode",
        description: "Improve readability with higher contrast colors",
        type: "toggle",
        value: false
      }
    ]
  },
  {
    id: "data",
    title: "Data & Storage",
    description: "Manage your data usage and storage preferences",
    icon: <Download className="w-5 h-5" />,
    items: [
      {
        id: "offline-mode",
        label: "Offline Mode",
        description: "Download content for offline access",
        type: "toggle",
        value: false
      },
      {
        id: "auto-sync",
        label: "Auto-Sync",
        description: "Automatically sync your data when connected",
        type: "toggle",
        value: true
      },
      {
        id: "photo-quality",
        label: "Photo Upload Quality",
        description: "Choose quality for uploaded photos",
        type: "select",
        value: "high",
        options: [
          { value: "low", label: "Low - Save data" },
          { value: "medium", label: "Medium - Balanced" },
          { value: "high", label: "High - Best quality" }
        ]
      },
      {
        id: "clear-cache",
        label: "Clear Cache",
        description: "Free up storage by clearing cached data",
        type: "button",
        action: () => console.log("Clear cache"),
        variant: "destructive"
      }
    ]
  }
];

/**
 * Comprehensive settings interface with accessibility features
 */
export function SettingsInterface() {
  const [selectedSection, setSelectedSection] = useState<string>("notifications");
  const [settings, setSettings] = useState<Record<string, any>>({});

  const handleSettingChange = (settingId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
  };

  const selectedSectionData = settingsSections.find(section => section.id === selectedSection);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "hsl(var(--foreground))" }}>Settings</h1>
        <p style={{ color: "hsl(var(--muted-foreground))" }}>
          Customize your TravelQuest experience and manage your preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="neopop-card">
            <CardContent className="p-4">
              <nav role="tablist" aria-label="Settings categories">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    role="tab"
                    aria-selected={selectedSection === section.id}
                    aria-controls={`${section.id}-panel`}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                      selectedSection === section.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedSection === section.id
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/50 text-muted-foreground"
                    }`}>
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{section.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {section.description}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {selectedSection === "integrations" ? (
            <motion.div
              key="integrations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LocalGuidesSettings />
            </motion.div>
          ) : (
            <motion.div
              key={selectedSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="neopop-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {selectedSectionData?.icon}
                  </div>
                  <div>
                    <CardTitle>{selectedSectionData?.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedSectionData?.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent 
                className="space-y-6" 
                role="tabpanel" 
                id={`${selectedSection}-panel`}
                aria-labelledby={`${selectedSection}-tab`}
              >
                {selectedSectionData?.items.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-start justify-between space-x-4">
                      <div className="flex-1">
                        <Label 
                          htmlFor={item.id} 
                          className="text-base font-medium text-foreground"
                        >
                          {item.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>

                      {/* Setting Control */}
                      <div className="flex-shrink-0">
                        {item.type === "toggle" && (
                          <Switch
                            id={item.id}
                            checked={settings[item.id] ?? item.value}
                            onCheckedChange={(checked) => handleSettingChange(item.id, checked)}
                            aria-describedby={`${item.id}-description`}
                          />
                        )}

                        {item.type === "select" && (
                          <Select
                            value={settings[item.id] ?? item.value?.toString()}
                            onValueChange={(value) => handleSettingChange(item.id, value)}
                          >
                            <SelectTrigger className="w-48" id={item.id}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {item.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {item.type === "slider" && (
                          <div className="w-48">
                            <Slider
                              id={item.id}
                              value={[settings[item.id] ?? item.value ?? item.min ?? 0]}
                              onValueChange={([value]) => handleSettingChange(item.id, value)}
                              min={item.min}
                              max={item.max}
                              step={item.step}
                              className="w-full"
                              aria-label={item.label}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>{item.min}</span>
                              <span className="font-medium">
                                {settings[item.id] ?? item.value}
                              </span>
                              <span>{item.max}</span>
                            </div>
                          </div>
                        )}

                        {item.type === "button" && (
                          <Button
                            variant={item.variant === "destructive" ? "destructive" : "outline"}
                            onClick={item.action}
                            className="min-w-32"
                          >
                            {item.variant === "destructive" ? (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                {item.label}
                              </>
                            ) : (
                              item.label
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    {index < selectedSectionData.items.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}

                {/* Section Actions */}
                <div className="pt-6 border-t border-border">
                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Support
                    </Button>
                    <Button className="neopop-button">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Quick settings toggle for common preferences
 */
export function QuickSettings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  return (
    <Card className="neopop-card">
      <CardHeader>
        <CardTitle className="text-lg">Quick Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <Label htmlFor="dark-mode">Dark Mode</Label>
          </div>
          <Switch
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-4 h-4" />
            <Label htmlFor="notifications">Notifications</Label>
          </div>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4" />
            <Label htmlFor="sounds">Sounds</Label>
          </div>
          <Switch
            id="sounds"
            checked={sounds}
            onCheckedChange={setSounds}
          />
        </div>
      </CardContent>
    </Card>
  );
}