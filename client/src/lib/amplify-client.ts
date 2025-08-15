import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, signIn, signOut, signUp, confirmSignUp, fetchAuthSession } from 'aws-amplify/auth';
import awsConfig from '../../../src/aws-config';

// Configure Amplify
Amplify.configure(awsConfig);

// Create GraphQL client
export const graphqlClient = generateClient();

// Export auth functions
export {
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  fetchAuthSession
};

// Helper function to get authenticated headers
export const getAuthHeaders = async () => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (token) {
      return {
        Authorization: `Bearer ${token}`
      };
    }
    
    return {};
  } catch (error) {
    console.warn('Failed to get auth headers:', error);
    return {};
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
};

// Helper function to get current user info
export const getCurrentUserInfo = async () => {
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();
    
    return {
      user,
      session,
      isAuthenticated: true
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      isAuthenticated: false
    };
  }
};