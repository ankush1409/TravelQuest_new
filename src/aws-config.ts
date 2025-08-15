// Environment variables with proper typing
const env = import.meta.env as Record<string, string>;

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: env.VITE_AWS_USER_POOL_ID || '',
      userPoolClientId: env.VITE_AWS_USER_POOL_WEB_CLIENT_ID || '',
      identityPoolId: env.VITE_AWS_IDENTITY_POOL_ID || '',
      loginWith: {
        oauth: {
          domain: env.VITE_AWS_COGNITO_DOMAIN || '',
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: [env.VITE_AWS_OAUTH_REDIRECT_SIGN_IN || 'http://localhost:3000/'],
          redirectSignOut: [env.VITE_AWS_OAUTH_REDIRECT_SIGN_OUT || 'http://localhost:3000/'],
          responseType: 'code' as const
        }
      }
    }
  },
  
  API: {
    GraphQL: {
      endpoint: env.VITE_AWS_APPSYNC_GRAPHQL_ENDPOINT || '',
      region: env.VITE_AWS_REGION || 'us-east-1',
      defaultAuthMode: 'userPool' as const
    }
  },
  
  Storage: {
    S3: {
      bucket: env.VITE_AWS_S3_BUCKET || '',
      region: env.VITE_AWS_REGION || 'us-east-1'
    }
  }
};

// Environment validation
const requiredEnvVars = [
  'VITE_AWS_USER_POOL_ID',
  'VITE_AWS_USER_POOL_WEB_CLIENT_ID',
  'VITE_AWS_APPSYNC_GRAPHQL_ENDPOINT'
];

const missingEnvVars = requiredEnvVars.filter(
  varName => !env[varName]
);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file and AWS Amplify configuration');
}

export default awsConfig;