import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginSchema, type InsertUser, type LoginData } from "@shared/schema";
import { Redirect } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Redirect to="/" />;
  }

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      displayName: "",
      password: "",
      bio: "",
      travelStyle: "SOLO",
      isPrivate: false,
    },
  });

  const handleLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: InsertUser) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {isSignUp ? "Start Your Adventure" : "Welcome back!"}
            </h2>
            <p className="mt-2 text-gray-600">
              {isSignUp ? "Create your account and begin earning XP" : "Sign in to continue your travel quest"}
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8">
              {!isSignUp ? (
                // Login Form
                <form className="space-y-6" onSubmit={loginForm.handleSubmit(handleLogin)}>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      {...loginForm.register("username")}
                      placeholder="Enter your username"
                      className="mt-2"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-red-500 text-sm mt-1">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...loginForm.register("password")}
                        placeholder="Enter your password"
                        className="pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              ) : (
                // Register Form
                <form className="space-y-6" onSubmit={registerForm.handleSubmit(handleRegister)}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        {...registerForm.register("username")}
                        placeholder="Username"
                        className="mt-2"
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-red-500 text-sm mt-1">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        type="text"
                        {...registerForm.register("displayName")}
                        placeholder="Your Name"
                        className="mt-2"
                      />
                      {registerForm.formState.errors.displayName && (
                        <p className="text-red-500 text-sm mt-1">
                          {registerForm.formState.errors.displayName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerForm.register("email")}
                      placeholder="Enter your email"
                      className="mt-2"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        {...registerForm.register("password")}
                        placeholder="Create a password"
                        className="pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="travelStyle">Travel Style</Label>
                    <Select onValueChange={(value) => registerForm.setValue("travelStyle", value as any)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your travel style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOLO">🎒 Solo Explorer</SelectItem>
                        <SelectItem value="FAMILY">👨‍👩‍👧‍👦 Family Adventures</SelectItem>
                        <SelectItem value="COUPLE">💑 Couple Getaways</SelectItem>
                        <SelectItem value="BUSINESS">💼 Business Travel</SelectItem>
                        <SelectItem value="BACKPACKER">🏕️ Backpacker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      {...registerForm.register("bio")}
                      placeholder="Tell us about your travel interests..."
                      className="mt-2 resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-gray-500 text-xs mt-1">Maximum 500 characters</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      required
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <a href="#terms" className="text-primary hover:text-blue-700">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#privacy" className="text-primary hover:text-blue-700">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <Button
                    variant="link"
                    className="text-primary hover:text-blue-700 font-medium p-0"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? "Sign in here" : "Sign up here"}
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "linear-gradient(rgba(37, 99, 235, 0.7), rgba(37, 99, 235, 0.7)), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-8 max-w-lg">
              <MapPin className="h-16 w-16 mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">Turn Your Adventures Into Achievements</h1>
              <p className="text-xl text-blue-100 mb-8">
                Earn XP, unlock badges, and level up your travel experiences with TravelQuest
              </p>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">🏆</span>
                  </div>
                  Earn XP & Level Up
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">🏅</span>
                  </div>
                  Collect Achievement Badges
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">👥</span>
                  </div>
                  Connect with Fellow Travelers
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
