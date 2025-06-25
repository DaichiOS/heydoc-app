# Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file:

### JWT Configuration (NEW - REQUIRED)
```bash
# CRITICAL: Add this JWT secret to your environment
JWT_SECRET=291d811627c03f222beed6b0bbeafe00f69330bfb6bf4fd316f6cc590969fbf82c91ab01afa42b3c5799a564df194a7cd81d71c31bae614ffc
```

### Existing Variables
Ensure you also have all your existing environment variables:

```bash
# AWS Configuration
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# Cognito Configuration
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_client_id
COGNITO_CLIENT_SECRET=your_client_secret

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/heydoc

# S3 Configuration
S3_BUCKET_NAME=heydoc-bucket
S3_REGION=ap-southeast-2

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Security Notes

- **JWT_SECRET**: This is a 128-character hexadecimal string generated securely
- Never commit this secret to version control
- Use different secrets for development, staging, and production
- This secret is used to sign and verify authentication tokens

## Migration Steps

1. Add the JWT_SECRET to your `.env.local` file
2. Run database migration: `npm run db:migrate`
3. The login system now uses secure httpOnly cookies instead of localStorage

## What Changed

- 🔒 **Security**: Tokens now stored in httpOnly cookies (XSS protection)
- 🏥 **Doctor Status**: New comprehensive workflow status system
- 🛡️ **JWT**: Proper token signing and verification
- 🍪 **Cookies**: Automatic token management via secure cookies 