# TravelQuest AWS Amplify Migration Guide

This guide provides step-by-step instructions for migrating TravelQuest from the current Express.js/PostgreSQL architecture to a cloud-native AWS Amplify setup with AppSync, Lambda, and Cognito.

## 🎯 Migration Overview

### Current Architecture
- **Frontend**: React 18.3.1 + TypeScript + Vite
- **Backend**: Express.js + Node.js + TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **Authentication**: Passport.js (Local + Google OAuth)
- **Hosting**: Replit

### Target Architecture
- **Frontend**: React 18.3.1 + TypeScript + Vite (unchanged)
- **Backend**: AWS Lambda + AWS AppSync GraphQL
- **Database**: Amazon DynamoDB
- **Authentication**: AWS Cognito + Google OAuth
- **Hosting**: AWS Amplify Hosting
- **File Storage**: Amazon S3
- **Analytics**: Amazon Pinpoint (optional)

## 📋 Prerequisites

### Required Tools
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure AWS credentials
aws configure
```

### AWS Account Setup
1. Create AWS account if you don't have one
2. Set up IAM user with appropriate permissions
3. Configure AWS CLI with access keys
4. Ensure you have permissions for:
   - IAM roles and policies
   - CloudFormation stacks
   - AppSync APIs
   - Cognito User Pools
   - Lambda functions
   - DynamoDB tables
   - S3 buckets

## 🚀 Step-by-Step Migration

### Phase 1: Initialize Amplify Project

```bash
# Initialize Amplify in your project
amplify init

# Follow the prompts:
# ? Enter a name for the project: travelquest
# ? Initialize the project with the above configuration? Yes
# ? Select the authentication method you want to use: AWS profile
# ? Please choose the profile you want to use: default
```

### Phase 2: Set Up Authentication (Cognito)

```bash
# Add authentication
amplify add auth

# Configuration choices:
# ? Do you want to use the default authentication and security configuration? Manual configuration
# ? Select the authentication/authorization services that you want to use: User Sign-Up, Sign-In, connected with AWS IAM controls
# ? Please provide a friendly name for your resource that will be used to label this category in the cloud: travelquest
# ? Please enter a name for your identity pool: travelquest_identitypool
# ? Allow unauthenticated logins? No
# ? Do you want to enable 3rd party authentication providers in your identity pool? Yes
# ? Select the third party identity providers you want to configure for your identity pool: Google
# ? Please provide a Google Web Client ID for your identity pool: [Your Google Client ID]
# ? Please provide a Google Web Client Secret for your identity pool: [Your Google Client Secret]
```

### Phase 3: Set Up GraphQL API (AppSync)

```bash
# Add GraphQL API
amplify add api

# Configuration choices:
# ? Please select from one of the below mentioned services: GraphQL
# ? Provide API name: travelquest
# ? Choose the default authorization type for the API: Amazon Cognito User Pool
# ? Do you want to configure advanced settings for the GraphQL API: Yes
# ? Configure additional auth types? Yes
# ? Choose the additional authorization types you want to configure for the API: API key
# ? Enter a description for the API key: TravelQuest API Key
# ? After how many days from now the API key should expire: 365
# ? Configure conflict detection? No
# ? Do you have an annotated GraphQL schema? Yes
# ? Provide your schema file path: amplify/backend/api/travelquest/schema.graphql
```

### Phase 4: Add Lambda Functions

```bash
# Add Lambda functions for business logic
amplify add function

# Function 1: Main resolver
# ? Select which capability you want to add: Lambda function (serverless function)
# ? Provide a friendly name for your resource to be used as a label for this category in the cloud: travelquestResolver
# ? Provide the AWS Lambda function name: travelquestResolver
# ? Choose the runtime that you want to use: NodeJS
# ? Choose the function template that you want to use: Hello World

# Function 2: Streak processor
amplify add function
# ? Provide a friendly name for your resource: travelquestStreakProcessor
# ? Provide the AWS Lambda function name: travelquestStreakProcessor
# [Same configuration as above]

# Function 3: Places service
amplify add function
# ? Provide a friendly name for your resource: travelquestPlacesService
# ? Provide the AWS Lambda function name: travelquestPlacesService
# [Same configuration as above]
```

### Phase 5: Add Storage (DynamoDB + S3)

```bash
# Add DynamoDB storage
amplify add storage

# Configuration:
# ? Please select from one of the below mentioned services: NoSQL Database
# ? Please provide a friendly name for your resource: travelquestdb
# ? Please provide table name: TravelQuest

# Add S3 storage for files
amplify add storage

# Configuration:
# ? Please select from one of the below mentioned services: Content (Images, audio, video, etc.)
# ? Please provide a friendly name for your resource: travelquestassets
# ? Please provide bucket name: travelquest-assets
# ? Who should have access: Auth users only
# ? What kind of access do you want for Authenticated users? create/update, read, delete
```

### Phase 6: Configure Environment Variables

Create `.env` file with AWS configuration:

```bash
# Copy the example file
cp .env.example .env

# Fill in the values after running 'amplify push'
```

### Phase 7: Deploy Infrastructure

```bash
# Deploy all Amplify resources
amplify push

# This will:
# 1. Create CloudFormation stacks
# 2. Deploy Lambda functions
# 3. Create DynamoDB tables
# 4. Set up AppSync GraphQL API
# 5. Configure Cognito User Pool
# 6. Create S3 buckets
```

### Phase 8: Data Migration

#### Backup Existing Data
```bash
# Export existing PostgreSQL data
pg_dump $DATABASE_URL > travelquest_backup.sql

# Create migration scripts (see data-migration/ directory)
node scripts/migrate-users.js
node scripts/migrate-locations.js
node scripts/migrate-checkins.js
node scripts/migrate-streaks.js
```

#### Import to DynamoDB
```bash
# Use AWS CLI to import data
aws dynamodb batch-write-item --request-items file://data/users.json
aws dynamodb batch-write-item --request-items file://data/locations.json
aws dynamodb batch-write-item --request-items file://data/checkins.json
```

### Phase 9: Update Frontend Code

#### 1. Configure Amplify in main app
```typescript
// client/src/main.tsx
import { Amplify } from 'aws-amplify';
import awsConfig from '../src/aws-config';

Amplify.configure(awsConfig);
```

#### 2. Replace authentication
```typescript
// Replace server/auth.ts usage with:
import { useAuth } from './hooks/use-amplify-auth';
```

#### 3. Replace API calls
```typescript
// Replace fetch() calls with GraphQL
import { amplifyQueries, amplifyMutations } from './lib/amplify-queries';
```

### Phase 10: Deploy Frontend

```bash
# Add hosting
amplify add hosting

# Configuration:
# ? Select the plugin module to execute: Amazon CloudFront and S3
# ? Select the environment setup: PROD (S3 with CloudFront using HTTPS)
# ? hosting bucket name: travelquest-hosting

# Publish the app
amplify publish
```

## 🔧 Configuration Files Created

### Key Files Added:
- `amplify.yml` - Build configuration for Amplify CI/CD
- `amplify/backend/` - All AWS resource definitions
- `src/aws-config.ts` - Amplify configuration
- `client/src/lib/amplify-client.ts` - GraphQL client setup
- `client/src/hooks/use-amplify-auth.tsx` - Authentication hook
- `client/src/lib/amplify-queries.ts` - GraphQL operations

### Environment Variables Required:
```
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_AWS_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AWS_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_AWS_COGNITO_DOMAIN=travelquest-auth.auth.us-east-1.amazoncognito.com
VITE_AWS_APPSYNC_GRAPHQL_ENDPOINT=https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-east-1.amazonaws.com/graphql
VITE_AWS_S3_BUCKET=travelquest-storage-xxxxxx
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 🛡️ Security Best Practices

### 1. IAM Roles and Policies
- Use least privilege principle
- Separate roles for different functions
- Enable CloudTrail for audit logging

### 2. API Security
- Enable AWS WAF for AppSync
- Set up proper CORS policies
- Use API rate limiting

### 3. Data Protection
- Enable encryption at rest for DynamoDB
- Use S3 bucket policies for file access
- Enable VPC endpoints for internal traffic

### 4. Environment Management
- Use AWS Systems Manager Parameter Store for secrets
- Separate dev/staging/prod environments
- Enable AWS Config for compliance monitoring

## 📊 Cost Optimization

### Expected Monthly Costs (Estimated):
- **AppSync**: $4-10 (queries/mutations)
- **Lambda**: $5-15 (execution time)
- **DynamoDB**: $10-25 (read/write units)
- **Cognito**: $5-15 (monthly active users)
- **S3**: $5-20 (storage/bandwidth)
- **CloudFront**: $5-15 (CDN)

**Total Estimated**: $35-100/month for moderate usage

### Cost Optimization Tips:
1. Use DynamoDB on-demand pricing for variable workloads
2. Implement Lambda function optimization (cold starts)
3. Use S3 Intelligent Tiering for cost-effective storage
4. Monitor usage with AWS Cost Explorer

## 🚦 Testing Strategy

### 1. Local Development
```bash
# Start local Amplify mock services
amplify mock api
amplify mock function travelquestResolver
```

### 2. Integration Testing
- Test all GraphQL operations
- Verify authentication flows
- Test file upload/download
- Validate data consistency

### 3. Performance Testing
- Load test AppSync endpoints
- Monitor Lambda cold starts
- Test DynamoDB performance
- Verify CDN cache behavior

## 🔄 Rollback Plan

### Emergency Rollback
1. Switch DNS back to old infrastructure
2. Scale up original servers
3. Restore database from backup if needed

### Data Rollback
1. Export data from DynamoDB
2. Transform back to PostgreSQL format
3. Import to original database

## 📈 Post-Migration Monitoring

### AWS CloudWatch Metrics
- API Gateway latency and errors
- Lambda function performance
- DynamoDB read/write capacity
- S3 request metrics

### Application Metrics
- User authentication success rates
- API response times
- Error rates by operation
- User engagement metrics

## 🎉 Go-Live Checklist

- [ ] All AWS resources deployed successfully
- [ ] Environment variables configured
- [ ] Data migration completed and verified
- [ ] Authentication flows tested
- [ ] All API endpoints functional
- [ ] File upload/download working
- [ ] Real-time features (subscriptions) tested
- [ ] Monitoring and alerting configured
- [ ] DNS updated to point to Amplify
- [ ] SSL certificates configured
- [ ] Performance testing completed
- [ ] Security review completed

## 📞 Support and Troubleshooting

### Common Issues
1. **CORS errors**: Check AppSync CORS configuration
2. **Authentication failures**: Verify Cognito User Pool settings
3. **Lambda timeouts**: Optimize function code and increase timeout
4. **DynamoDB throttling**: Adjust read/write capacity

### AWS Support Resources
- AWS Support Center
- AWS re:Post community
- AWS documentation
- Amplify Discord community

This migration transforms TravelQuest into a fully cloud-native application with improved scalability, security, and maintainability while preserving all existing functionality.