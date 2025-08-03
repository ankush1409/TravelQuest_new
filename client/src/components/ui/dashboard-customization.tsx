import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UnifiedXPDisplay } from "@/components/ui/unified-xp-display";
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings, 
  Trophy, 
  Map, 
  Camera, 
  Users,
  BarChart3,
  Calendar,
  Target,
  Zap,
  Plus,
  X,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedProgressBar } from "./gamification-feedback";
import { useAuth } from "@/hooks/use-auth";

interface DashboardWidget {
  id: string;
  type: 'stats' | 'progress' | 'activity' | 'challenges' | 'locations' | 'social' | 'calendar';
  title: string;
  description: string;
  icon: React.ReactNode;
  visible: boolean;
  size: 'small' | 'medium' | 'large';
  position: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  visible: boolean;
  color: string;
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: 'stats-overview',
    type: 'stats',
    title: 'Travel Stats',
    description: 'Your XP, level, and achievements overview',
    icon: <BarChart3 className="w-5 h-5" />,
    visible: true,
    size: 'large',
    position: 0
  },
  {
    id: 'progress-tracker',
    type: 'progress',
    title: 'Progress Tracker',
    description: 'Track your progress toward next level and goals',
    icon: <Target className="w-5 h-5" />,
    visible: true,
    size: 'medium',
    position: 1
  },
  {
    id: 'recent-activity',
    type: 'activity',
    title: 'Recent Activity',
    description: 'Your latest check-ins and achievements',
    icon: <Zap className="w-5 h-5" />,
    visible: true,
    size: 'medium',
    position: 2
  },
  {
    id: 'active-challenges',
    type: 'challenges',
    title: 'Active Challenges',
    description: 'Challenges you\'re currently participating in',
    icon: <Trophy className="w-5 h-5" />,
    visible: true,
    size: 'small',
    position: 3
  },
  {
    id: 'nearby-locations',
    type: 'locations',
    title: 'Nearby Locations',
    description: 'Discover places to visit near you',
    icon: <Map className="w-5 h-5" />,
    visible: true,
    size: 'small',
    position: 4
  },
  {
    id: 'social-feed',
    type: 'social',
    title: 'Community Feed',
    description: 'Updates from travelers you follow',
    icon: <Users className="w-5 h-5" />,
    visible: false,
    size: 'medium',
    position: 5
  },
  {
    id: 'travel-calendar',
    type: 'calendar',
    title: 'Travel Calendar',
    description: 'Your upcoming trips and events',
    icon: <Calendar className="w-5 h-5" />,
    visible: false,
    size: 'medium',
    position: 6
  }
];

const defaultQuickActions: QuickAction[] = [
  {
    id: 'check-in',
    label: 'Quick Check-in',
    icon: <Map className="w-4 h-4" />,
    action: () => console.log('Quick check-in'),
    visible: true,
    color: 'bg-blue-500'
  },
  {
    id: 'photo',
    label: 'Take Photo',
    icon: <Camera className="w-4 h-4" />,
    action: () => console.log('Take photo'),
    visible: true,
    color: 'bg-purple-500'
  },
  {
    id: 'challenge',
    label: 'Join Challenge',
    icon: <Trophy className="w-4 h-4" />,
    action: () => console.log('Join challenge'),
    visible: true,
    color: 'bg-yellow-500'
  },
  {
    id: 'share',
    label: 'Share Update',
    icon: <Users className="w-4 h-4" />,
    action: () => console.log('Share update'),
    visible: false,
    color: 'bg-green-500'
  }
];

/**
 * Customizable dashboard with drag-and-drop widgets
 */
export function CustomizableDashboard() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(defaultQuickActions);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedWidgets = items.map((item, index) => ({
      ...item,
      position: index
    }));

    setWidgets(updatedWidgets);
  }, [widgets]);

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: !widget.visible }
        : widget
    ));
  }, []);

  const toggleQuickActionVisibility = useCallback((actionId: string) => {
    setQuickActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, visible: !action.visible }
        : action
    ));
  }, []);

  const visibleWidgets = widgets.filter(widget => widget.visible).sort((a, b) => a.position - b.position);
  const visibleQuickActions = quickActions.filter(action => action.visible);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your travel adventure!</p>
        </div>
        <Button
          variant={isCustomizing ? "destructive" : "outline"}
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="flex items-center space-x-2"
        >
          {isCustomizing ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          <span>{isCustomizing ? 'Done' : 'Customize'}</span>
        </Button>
      </div>

      {/* Quick Actions */}
      <Card className="neopop-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Quick Actions</span>
            </CardTitle>
            {isCustomizing && (
              <Button size="sm" variant="ghost">
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <AnimatePresence>
              {visibleQuickActions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={action.action}
                    className={`w-full h-20 flex flex-col items-center justify-center space-y-2 ${action.color} hover:opacity-90 text-white border-0`}
                    disabled={isCustomizing}
                  >
                    {action.icon}
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Customization Panel */}
      <AnimatePresence>
        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="neopop-card border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Customize Your Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Widget Visibility */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Dashboard Widgets</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {widgets.map((widget) => (
                      <div key={widget.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {widget.icon}
                          <div>
                            <div className="font-medium text-sm">{widget.title}</div>
                            <div className="text-xs text-muted-foreground">{widget.description}</div>
                          </div>
                        </div>
                        <Switch
                          checked={widget.visible}
                          onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions Visibility */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quickActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${action.color}`}>
                            {action.icon}
                          </div>
                          <span className="font-medium text-sm">{action.label}</span>
                        </div>
                        <Switch
                          checked={action.visible}
                          onCheckedChange={() => toggleQuickActionVisibility(action.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Widgets */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-widgets">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {visibleWidgets.map((widget, index) => (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                    isDragDisabled={!isCustomizing}
                  >
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`${
                          widget.size === 'large' 
                            ? 'lg:col-span-3' 
                            : widget.size === 'medium' 
                            ? 'lg:col-span-2' 
                            : 'lg:col-span-1'
                        } ${snapshot.isDragging ? 'z-50' : ''}`}
                      >
                        <DashboardWidget 
                          widget={widget} 
                          isCustomizing={isCustomizing}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </motion.div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

/**
 * Individual dashboard widget component
 */
interface DashboardWidgetProps {
  widget: DashboardWidget;
  isCustomizing: boolean;
  dragHandleProps?: any;
}

function DashboardWidget({ widget, isCustomizing, dragHandleProps }: DashboardWidgetProps) {
  const { user } = useAuth();
  
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'stats':
        return user ? (
          <UnifiedXPDisplay user={user} />
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading your travel stats...</p>
          </div>
        );
      
      case 'progress':
        return (
          <div className="space-y-4">
            <AnimatedProgressBar
              current={750}
              max={1000}
              label="Progress to Level 9"
              color="primary"
              animated={true}
            />
            <AnimatedProgressBar
              current={3}
              max={5}
              label="Weekly Challenge"
              color="yellow"
              animated={true}
            />
          </div>
        );
      
      case 'activity':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <Map className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <div className="font-medium">Checked in at Central Park</div>
                <div className="text-sm text-muted-foreground">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Trophy className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <div className="font-medium">Earned Explorer Badge</div>
                <div className="text-sm text-muted-foreground">1 day ago</div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">{widget.icon}</div>
            <div>Coming Soon</div>
          </div>
        );
    }
  };

  return (
    <Card className={`neopop-card transition-all duration-200 ${
      isCustomizing ? 'border-primary/30 shadow-lg' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {widget.icon}
            <CardTitle className="text-lg">{widget.title}</CardTitle>
          </div>
          {isCustomizing && (
            <div 
              {...dragHandleProps} 
              className="p-1 hover:bg-muted/50 rounded cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
}