import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, signIn, signOut, signUp, confirmSignUp, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

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
      const currentUser = await getCurrentUser();
      setUser({
        userId: currentUser.userId,
        username: currentUser.username,
        attributes: currentUser.attributes
      });
    } catch (error) {
      console.log('User not authenticated');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();

    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;
      
      switch (event) {
        case 'signedIn':
          checkAuthState();
          break;
        case 'signedOut':
          setUser(null);
          break;
        case 'tokenRefresh':
          // Token refresh succeeded
          break;
        case 'tokenRefresh_failure':
          // Token refresh failed, user needs to sign in again
          setUser(null);
          break;
        default:
          break;
      }
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async (username: string, password: string) => {
    try {
      const result = await signIn({ username, password });
      
      if (result.isSignedIn) {
        await checkAuthState();
      }
      
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignUp = async (username: string, password: string, email: string) => {
    try {
      const result = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const handleConfirmSignUp = async (username: string, code: string) => {
    try {
      const result = await confirmSignUp({ username, confirmationCode: code });
      return result;
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
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