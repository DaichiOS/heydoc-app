# Deployment Guide: Vercel + AWS RDS

This guide explains how to deploy HeyDoc to Vercel with AWS RDS PostgreSQL database.

## 🚀 Automated Deployment Setup

### **1. Vercel Environment Variables**

In your Vercel dashboard, add these environment variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@your-rds-endpoint.amazonaws.com:5432/heydoc_prod?sslmode=require

# Application
NODE_ENV=production
JWT_SECRET=your-256-bit-secret-key-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# AWS (for S3, Cognito, etc.)
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Cognito
COGNITO_USER_POOL_ID=ap-southeast-2_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx

# S3
S3_BUCKET_NAME=heydoc-prod-bucket
```

### **2. Automatic Migration During Build**

Migrations run automatically during deployment via the `postbuild` script:

```json
{
  "scripts": {
    "postbuild": "npm run db:migrate:prod:auto"
  }
}
```

**How it works:**
1. Vercel runs `npm run build`
2. Next.js builds your application
3. `postbuild` runs automatically after build
4. Migrations apply to AWS RDS
5. If migrations fail, deployment fails (safe!)

### **3. Manual Migration Options**

If you need to run migrations manually:

#### **Option A: Vercel CLI (Local)**
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Run migration with production env
vercel env pull .env.production
NODE_ENV=production npm run db:migrate:prod:auto
```

#### **Option B: Vercel Functions**
Create a serverless function for manual migrations:

```typescript
// pages/api/migrate.ts
import { runAutomatedMigrations } from '../../scripts/migrate-prod-auto.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  // Add authentication here!
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  try {
    await runAutomatedMigrations()
    res.status(200).json({ success: true, message: 'Migrations completed' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

Then trigger via HTTP:
```bash
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "Authorization: Bearer your-migration-secret"
```

## 🗄️ AWS RDS Setup

### **1. Security Group Configuration**

Your RDS security group must allow connections from Vercel:

```bash
# Allow all IPs (Vercel uses dynamic IPs)
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: 0.0.0.0/0

# Or use Vercel's IP ranges (more secure but complex)
# https://vercel.com/docs/concepts/edge-network/regions
```

### **2. Database URL Format**

```bash
# Standard format
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Example with actual values
DATABASE_URL=postgresql://heydoc_admin:SecurePass123@heydoc-prod.cluster-abc123.ap-southeast-2.rds.amazonaws.com:5432/heydoc_production?sslmode=require
```

### **3. SSL Configuration**

AWS RDS requires SSL. Our scripts handle this automatically:

```javascript
// Automatic SSL configuration for RDS
ssl: {
  rejectUnauthorized: false // Required for AWS RDS
}
```

## 📋 Deployment Checklist

### **Pre-Deployment**
- [ ] AWS RDS instance created and accessible
- [ ] Database user created with migration permissions
- [ ] Security groups configured for Vercel access
- [ ] All environment variables set in Vercel dashboard
- [ ] Test migrations in staging environment

### **First Deployment**
- [ ] Push code to connected Git repository
- [ ] Vercel automatically builds and deploys
- [ ] Check Vercel function logs for migration output
- [ ] Verify database schema was created correctly
- [ ] Test application functionality

### **Subsequent Deployments**
- [ ] Generate new migrations locally: `npm run db:generate`
- [ ] Test migrations locally: `npm run db:migrate:safe`
- [ ] Commit and push migration files
- [ ] Vercel automatically runs migrations during build
- [ ] Monitor deployment logs for any issues

## 🔍 Monitoring & Troubleshooting

### **View Migration Logs**
```bash
# Via Vercel CLI
vercel logs

# Or check Vercel dashboard > Functions > Build Logs
```

### **Common Issues**

#### **"The server does not support SSL connections"**
- Check DATABASE_URL includes `?sslmode=require`
- Verify RDS instance has SSL enabled

#### **"Connection timeout"**
- Check RDS security groups allow Vercel IPs
- Verify RDS instance is publicly accessible
- Check VPC and subnet configuration

#### **"Migration failed"**
- Check migration file syntax
- Verify database permissions
- Check Vercel function timeout limits

#### **"Database does not exist"**
- Create database manually in RDS
- Verify DATABASE_URL database name is correct

### **Manual Database Access**
```bash
# Connect to RDS from local machine
psql "postgresql://username:password@your-rds-endpoint.amazonaws.com:5432/heydoc_prod?sslmode=require"

# Check migration status
SELECT * FROM drizzle.__drizzle_migrations ORDER BY id;
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **Database User**: Create dedicated user with minimal permissions
3. **VPC**: Consider using VPC for additional security
4. **Backup**: Enable automated RDS backups
5. **Monitoring**: Set up CloudWatch alerts for RDS
6. **SSL**: Always use SSL for production database connections

## 🚀 Advanced: Zero-Downtime Deployments

For zero-downtime deployments:

1. **Blue-Green Deployments**: Use Vercel preview deployments
2. **Migration Strategy**: Design backward-compatible migrations
3. **Health Checks**: Add database health check endpoints
4. **Rollback Plan**: Keep previous deployment ready

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify RDS connectivity
3. Test migrations locally first
4. Review AWS RDS logs in CloudWatch 