import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// AWS Amplify imports disabled for development
// import { getCurrentUser, signIn, signOut, signUp, confirmSignUp, fetchAuthSession } from 'aws-amplify/auth';
// import { Hub } from 'aws-amplify/utils';

interface User {
  userId: string;
  username: string;
  attributes?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<any>;
  signUp: (username: string, password: string, email: string) => Promise<any>;
  signOut: () => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      // AWS Amplify auth disabled for development
      console.log('AWS Amplify auth not configured - using development mode');
      setUser(null);
    } catch (error) {
      console.log('User not authenticated');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();
    
    // AWS Amplify event listeners disabled for development
    // const unsubscribe = Hub.listen('auth', ({ payload }) => { ... });
    // return unsubscribe;
  }, []);

  const handleSignIn = async (username: string, password: string) => {
    console.warn('AWS Amplify sign in not configured - using development mode');
    throw new Error('AWS Amplify not configured');
  };

  const handleSignUp = async (username: string, password: string, email: string) => {
    console.warn('AWS Amplify sign up not configured - using development mode');
    throw new Error('AWS Amplify not configured');
  };

  const handleSignOut = async () => {
    console.warn('AWS Amplify sign out not configured - using development mode');
    setUser(null);
  };

  const handleConfirmSignUp = async (username: string, code: string) => {
    console.warn('AWS Amplify confirm sign up not configured - using development mode');
    throw new Error('AWS Amplify not configured');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    confirmSignUp: handleConfirmSignUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}