# 🚀 TravelQuest AWS Amplify Deployment

## 📋 Quick Start Guide

TravelQuest has been completely refactored for AWS Amplify deployment. This guide will get you up and running in the cloud within 30 minutes.

### Prerequisites
- AWS Account with billing enabled
- AWS CLI installed and configured
- Node.js 18+ installed
- Amplify CLI installed globally

```bash
npm install -g @aws-amplify/cli
amplify configure
```

## 🛠️ Deployment Steps

### 1. Initialize Amplify Project
```bash
# Clone and setup
git clone <your-repo>
cd travelquest
npm install

# Initialize Amplify
amplify init
# Follow prompts:
# - Project name: travelquest
# - Environment: dev
# - Default editor: Visual Studio Code
# - App type: javascript
# - Framework: react
# - Source directory: client/src
# - Build command: npm run build
# - Start command: npm run dev
```

### 2. Deploy AWS Infrastructure
```bash
# Deploy all resources (takes 10-15 minutes)
amplify push --yes

# This creates:
# ✅ Cognito User Pool for authentication
# ✅ AppSync GraphQL API
# ✅ 3 Lambda functions for business logic
# ✅ DynamoDB tables for data storage
# ✅ S3 bucket for file storage
# ✅ IAM roles and policies
```

### 3. Configure Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Amplify will generate these values:
# - VITE_AWS_USER_POOL_ID
# - VITE_AWS_USER_POOL_WEB_CLIENT_ID
# - VITE_AWS_APPSYNC_GRAPHQL_ENDPOINT
# - VITE_AWS_S3_BUCKET

# Add your Google API key:
# - GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

### 4. Set Up Google OAuth
```bash
# In AWS Cognito console:
# 1. Go to User Pools > travelquest > Sign-in experience
# 2. Add Google as identity provider
# 3. Configure Google OAuth credentials
# 4. Set redirect URLs for your domain
```

### 5. Migrate Data (Optional)
```bash
# If migrating from existing PostgreSQL database:
npm run migrate:data

# This will transfer:
# - Users and authentication data
# - Locations and place data
# - Check-ins and discoveries
# - Streak tracking data
# - Referral system data
```

### 6. Deploy Frontend
```bash
# Add hosting
amplify add hosting
# Choose: Amazon CloudFront and S3

# Deploy application
amplify publish

# Your app will be available at:
# https://dev.d1234567890abcd.amplifyapp.com
```

## 🔧 Configuration Details

### AWS Services Used
- **AWS Amplify**: Hosting and CI/CD
- **AWS AppSync**: GraphQL API
- **AWS Cognito**: User authentication
- **AWS Lambda**: Serverless functions
- **Amazon DynamoDB**: NoSQL database
- **Amazon S3**: File storage
- **Amazon CloudFront**: CDN

### Cost Estimation (Monthly)
- **Free Tier Eligible**: First 12 months
- **Estimated Cost**: $20-60/month for moderate usage
- **Scaling**: Automatic based on demand

### Environment Management
```bash
# Create staging environment
amplify env add staging

# Deploy to production
amplify env add prod
amplify env checkout prod
amplify push
```

## 🛡️ Security Features

### Built-in Security
- ✅ AWS IAM role-based access control
- ✅ API rate limiting and throttling
- ✅ HTTPS/TLS encryption in transit
- ✅ Data encryption at rest
- ✅ CORS protection
- ✅ Input validation and sanitization

### API Security
```typescript
// All GraphQL operations require authentication
@auth(rules: [{ allow: owner }])

// Public data uses read-only access
@auth(rules: [{ allow: private, operations: [read] }])
```

## 📊 Monitoring and Analytics

### CloudWatch Integration
- API request metrics
- Lambda function performance
- DynamoDB read/write capacity
- Error rates and latency

### Custom Metrics
```typescript
// Built-in application metrics
- User engagement tracking
- Feature usage analytics
- Performance monitoring
- Error reporting
```

## 🔄 CI/CD Pipeline

### Automatic Deployment
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist/public
    files:
      - '**/*'
```

### Branch-based Deployments
- `main` → Production
- `staging` → Staging environment
- `dev` → Development environment

## 🧪 Testing

### Local Development
```bash
# Start local mock services
amplify mock api
amplify mock function travelquestResolver

# Run development server
npm run dev
```

### Integration Testing
```bash
# Test GraphQL operations
npm run test:graphql

# Test authentication flows
npm run test:auth

# Test file uploads
npm run test:storage
```

## 📞 Support and Troubleshooting

### Common Issues

#### 1. Authentication Errors
```bash
# Check Cognito configuration
amplify auth console

# Verify OAuth settings
# Check redirect URLs match your domain
```

#### 2. API Errors
```bash
# Check AppSync console
amplify api console

# Verify Lambda function logs
amplify function logs travelquestResolver
```

#### 3. Database Issues
```bash
# Check DynamoDB tables
amplify storage console

# Verify table schema and indexes
```

### Performance Optimization
- Enable Lambda provisioned concurrency for high traffic
- Use DynamoDB auto-scaling
- Configure CloudFront caching rules
- Implement efficient GraphQL queries

### Useful Commands
```bash
# View all resources
amplify status

# View environment info
amplify env list

# Update single category
amplify update auth
amplify update api
amplify update function

# Remove resources
amplify delete
```

## 🎯 Production Checklist

### Before Go-Live
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring alerts set up
- [ ] Backup strategy in place
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Error handling verified
- [ ] Documentation updated

### Post-Launch
- [ ] Monitor CloudWatch metrics
- [ ] Check error rates
- [ ] Verify user authentication
- [ ] Test all features
- [ ] Monitor costs
- [ ] Plan regular backups

## 🌟 Key Benefits

### Scalability
- ♾️ Automatic scaling based on demand
- 🌍 Global content delivery via CloudFront
- ⚡ Serverless architecture eliminates server management

### Reliability
- 🔄 Multi-AZ deployment for high availability
- 🛡️ Built-in disaster recovery
- 📊 Real-time monitoring and alerting

### Cost Efficiency
- 💰 Pay only for what you use
- 📉 No upfront infrastructure costs
- 🎯 Optimized resource utilization

### Developer Experience
- 🚀 One-command deployment
- 🔧 Infrastructure as code
- 🧪 Built-in testing environment

---

Your TravelQuest application is now ready for global scale on AWS! 🎉

For detailed technical documentation, see `MIGRATION_GUIDE.md`.
For API documentation, visit your AppSync console after deployment.