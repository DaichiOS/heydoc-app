# Database Management Guide

This guide covers how to manage the HeyDoc database using Drizzle ORM with PostgreSQL.

## 📋 Table of Contents

- [Initial Setup](#initial-setup)
- [Database Commands](#database-commands)
- [Making Schema Changes](#making-schema-changes)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Schema Overview](#schema-overview)

## 🚀 Initial Setup

### 1. Prerequisites
- PostgreSQL installed locally
- Database `heydoc_local` created in PostgreSQL
- `.env.local` file configured

### 2. Environment Configuration
Create `.env.local` in project root:
```bash
# Database Configuration (Local PostgreSQL)
DATABASE_URL="postgresql://postgres@localhost:5432/heydoc_local"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="heydoc_local"
DB_USERNAME="postgres"
DB_PASSWORD=""

# Node Environment
NODE_ENV="development"
```

### 3. Initial Migration
If starting fresh, the initial migration should already be applied. If not:
```bash
npm run db:generate
npm run db:push
```

## 🛠 Database Commands

### Available NPM Scripts
```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to database (recommended for production)
npm run db:migrate

# Push schema changes directly to database (good for development)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Command Details

#### `npm run db:generate`
- **Purpose**: Creates migration files based on schema changes
- **When to use**: After modifying `schema.ts`
- **Output**: Creates SQL files in `migrations/` folder
- **Safe for**: All environments

#### `npm run db:push`
- **Purpose**: Directly applies schema changes to database
- **When to use**: During development for quick iterations
- **Warning**: ⚠️ Can cause data loss - use carefully
- **Safe for**: Development only

#### `npm run db:migrate`
- **Purpose**: Applies migration files to database
- **When to use**: Production deployments, team collaboration
- **Safe for**: All environments
- **Recommended**: ✅ For production

#### `npm run db:studio`
- **Purpose**: Opens Drizzle Studio web interface
- **Access**: Usually opens at `http://localhost:4983`
- **Features**: View data, run queries, edit records

## 🔄 Making Schema Changes

### Step-by-Step Workflow

1. **Modify Schema** (`schema.ts`)
   ```typescript
   // Example: Adding a new field
   export const doctors = pgTable('doctors', {
     // ... existing fields
     newField: varchar('new_field', { length: 100 }),
   })
   ```

2. **Generate Migration**
   ```bash
   npm run db:generate
   ```

3. **Review Migration**
   - Check the generated SQL in `migrations/` folder
   - Ensure it looks correct

4. **Apply Changes**
   
   **For Development:**
   ```bash
   npm run db:push
   ```
   
   **For Production:**
   ```bash
   npm run db:migrate
   ```

### Common Schema Operations

#### Adding a Field
```typescript
// In schema.ts
newField: varchar('new_field', { length: 100 }).notNull().default('default_value'),
```

#### Making Field Required
```typescript
// Change from:
field: varchar('field', { length: 100 }),
// To:
field: varchar('field', { length: 100 }).notNull(),
```

#### Adding Index
```typescript
// In table definition
}, (table) => ({
  // ... existing indexes
  newFieldIdx: index('idx_table_new_field').on(table.newField),
}))
```

#### Adding Foreign Key
```typescript
foreignKeyField: uuid('foreign_key_field').references(() => otherTable.id),
```

## 🔧 Development Workflow

### Daily Development
1. Pull latest code
2. Check if new migrations exist: `ls migrations/`
3. Apply migrations: `npm run db:migrate`
4. Start development
5. Make schema changes as needed
6. Use `npm run db:push` for quick testing
7. Generate proper migrations before committing: `npm run db:generate`

### Before Committing
1. **Always generate migrations**: `npm run db:generate`
2. **Review migration files** in `migrations/` folder
3. **Test migrations** on a fresh database
4. **Commit both schema changes AND migration files**

### Team Collaboration
1. **Pull latest changes**
2. **Run migrations**: `npm run db:migrate`
3. **Never modify existing migration files**
4. **Always generate new migrations for changes**

## 🐛 Troubleshooting

### Common Issues

#### "ENOTFOUND" Connection Error
```bash
Error: getaddrinfo ENOTFOUND base
```
**Solution**: Check your `.env.local` file has correct `DATABASE_URL`

#### PostgreSQL Not Running
```bash
connection to server failed
```
**Solution**: 
- Start PostgreSQL service
- Check connection with: `psql -h localhost -p 5432 -U postgres -d heydoc_local -c "SELECT 1"`

#### Migration Conflicts
```bash
Migration conflict detected
```
**Solution**: 
1. Resolve schema conflicts
2. Generate new migration
3. Apply in correct order

#### Schema Out of Sync
**Solution**: 
1. `npm run db:push` (development)
2. Or generate and apply proper migration

### Database Reset (Development Only)
```sql
-- Connect to PostgreSQL and run:
DROP DATABASE heydoc_local;
CREATE DATABASE heydoc_local;
```
Then run: `npm run db:push`

### Checking Database State
```bash
# Check tables
psql -h localhost -p 5432 -U postgres -d heydoc_local -c "\dt"

# Check specific table schema
psql -h localhost -p 5432 -U postgres -d heydoc_local -c "\d doctors"

# Check migration history
psql -h localhost -p 5432 -U postgres -d heydoc_local -c "SELECT * FROM drizzle.__drizzle_migrations"
```

## 📊 Schema Overview

### Current Tables

#### `users` - Authentication & User Management
- **Purpose**: Links to AWS Cognito users
- **Key Fields**: `cognitoUserId`, `email`, `role`, `status`
- **Roles**: `admin`, `doctor`, `patient`

#### `doctors` - Professional Information
- **Purpose**: Store doctor registration details
- **Required Fields**: `firstName`, `lastName`, `phone`, `ahpraNumber`, `ahpraRegistrationDate`
- **Status Flow**: `pending` → `approved`/`rejected`/`suspended`

#### `patients` - Patient Information
- **Purpose**: Future patient management
- **Status**: `active`, `inactive`

#### `admin_actions` - Audit Trail
- **Purpose**: Track all admin actions
- **Fields**: `action`, `targetType`, `reason`, `metadata`

#### `document_uploads` - File Management
- **Purpose**: Track uploaded documents (S3)
- **Links**: Documents to users/doctors

### Mandatory Fields Summary

**Doctor Registration Requirements:**
- ✅ First name*
- ✅ Last name*  
- ✅ Email* (via Users table)
- ✅ Phone number*
- ✅ AHPRA number*
- ✅ AHPRA registration date*

**Banking Information**: Optional (added later)
**Insurance Information**: Optional
**Address Information**: Optional

## 🎯 Best Practices

### DO ✅
- Always generate migrations for schema changes
- Review migration SQL before applying
- Test migrations on development database first
- Keep migration files in version control
- Use descriptive field names
- Add appropriate indexes
- Use transactions for complex changes

### DON'T ❌
- Modify existing migration files
- Use `db:push` in production
- Skip migration generation
- Delete migration files
- Make breaking changes without consideration
- Forget to add necessary indexes

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)

---

## 🆘 Need Help?

If you encounter issues not covered here:
1. Check Drizzle ORM documentation
2. Verify your `.env.local` configuration
3. Ensure PostgreSQL is running
4. Check migration files for conflicts 