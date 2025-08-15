// AWS Amplify integration temporarily disabled for development
// This prevents runtime errors while maintaining the AWS architecture ready for deployment

// Mock functions for development mode
const getCurrentUser = async () => { 
  throw new Error('AWS Amplify not configured'); 
};

const signIn = async () => { 
  throw new Error('AWS Amplify not configured'); 
};

const signOut = async () => { 
  throw new Error('AWS Amplify not configured'); 
};

const signUp = async () => { 
  throw new Error('AWS Amplify not configured'); 
};

const confirmSignUp = async () => { 
  throw new Error('AWS Amplify not configured'); 
};

const fetchAuthSession = async () => { 
  throw new Error('AWS Amplify not configured'); 
};

// Mock GraphQL client
const graphqlClient = null;

// Helper functions
const getAuthHeaders = async () => {
  console.warn('AWS Amplify not configured - using development mode');
  return {};
};

const isAuthenticated = async (): Promise<boolean> => {
  return false;
};

const getCurrentUserInfo = async () => {
  return {
    user: null,
    session: null,
    isAuthenticated: false
  };
};

// Export all functions
export {
  graphqlClient,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  fetchAuthSession,
  getAuthHeaders,
  isAuthenticated,
  getCurrentUserInfo
};