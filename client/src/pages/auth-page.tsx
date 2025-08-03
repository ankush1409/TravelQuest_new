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

  // Redirect if already authenticated
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-foreground">
              {isSignUp ? "START YOUR ADVENTURE" : "WELCOME BACK!"}
            </h2>
            <p className="mt-2 text-muted-foreground font-medium">
              {isSignUp ? "Create your account and begin earning XP" : "Sign in to continue your travel quest"}
            </p>
          </div>

          <div className="neopop-card p-8">
            {/* Google OAuth Button */}
            <div className="mb-6">
              <a 
                href="/auth/google"
                className="w-full flex items-center justify-center px-4 py-3 border border-border rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02] text-gray-900 dark:text-white font-bold shadow-lg"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </a>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground font-medium">OR</span>
              </div>
            </div>
            {!isSignUp ? (
              // Login Form
              <form className="space-y-6" onSubmit={loginForm.handleSubmit(handleLogin)}>
                <div>
                  <Label htmlFor="username" className="text-foreground font-bold">Username</Label>
                  <Input
                    {...loginForm.register("username")}
                    id="username"
                    type="text"
                    required
                    className="mt-1 bg-muted/30 border-border"
                    placeholder="Enter your username"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground font-bold">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      {...loginForm.register("password")}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="bg-muted/30 border-border pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="neopop-button w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      SIGNING IN...
                    </>
                  ) : (
                    "SIGN IN"
                  )}
                </button>
              </form>
            ) : (
              // Register Form
              <form className="space-y-6" onSubmit={registerForm.handleSubmit(handleRegister)}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reg-username" className="text-foreground font-bold">Username</Label>
                    <Input
                      {...registerForm.register("username")}
                      id="reg-username"
                      type="text"
                      required
                      className="mt-1 bg-muted/30 border-border"
                      placeholder="Username"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="reg-displayName" className="text-foreground font-bold">Display Name</Label>
                    <Input
                      {...registerForm.register("displayName")}
                      id="reg-displayName"
                      type="text"
                      required
                      className="mt-1 bg-muted/30 border-border"
                      placeholder="Your Name"
                    />
                    {registerForm.formState.errors.displayName && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.displayName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="reg-email" className="text-foreground font-bold">Email Address</Label>
                  <Input
                    {...registerForm.register("email")}
                    id="reg-email"
                    type="email"
                    required
                    className="mt-1 bg-muted/30 border-border"
                    placeholder="Enter your email"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reg-password" className="text-foreground font-bold">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      {...registerForm.register("password")}
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="bg-muted/30 border-border pr-10"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reg-travelStyle" className="text-foreground font-bold">Travel Style</Label>
                  <Select onValueChange={(value) => registerForm.setValue("travelStyle", value as any)}>
                    <SelectTrigger className="mt-1 bg-muted/30 border-border">
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

                <button
                  type="submit"
                  className="neopop-button w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      CREATING ACCOUNT...
                    </>
                  ) : (
                    "CREATE ACCOUNT"
                  )}
                </button>
                </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  className="text-primary hover:text-accent font-bold underline"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "SIGN IN HERE" : "SIGN UP HERE"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-8 max-w-lg">
            <div className="neopop-card p-8 mb-8">
              <MapPin className="h-16 w-16 mx-auto mb-6 text-primary" />
              <h1 className="text-4xl font-black text-foreground mb-6">TURN YOUR ADVENTURES INTO ACHIEVEMENTS</h1>
              <p className="text-lg text-muted-foreground mb-8 font-medium">
                Earn XP, unlock badges, and level up your travel experiences with TravelQuest
              </p>
              <div className="grid grid-cols-1 gap-4 text-left">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mr-4 border border-yellow-500/30">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <span className="font-bold text-foreground">EARN XP & LEVEL UP</span>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mr-4 border border-purple-500/30">
                    <span className="text-2xl">🏅</span>
                  </div>
                  <span className="font-bold text-foreground">COLLECT ACHIEVEMENT BADGES</span>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mr-4 border border-cyan-500/30">
                    <span className="text-2xl">👥</span>
                  </div>
                  <span className="font-bold text-foreground">CONNECT WITH FELLOW TRAVELERS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
