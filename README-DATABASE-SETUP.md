# Database Setup Guide for Laragon MySQL

## Step 1: Configure Database Connection

### 1.1 Create `.env.local` file

Create a file named `.env.local` in the root of your project (same level as `package.json`) with the following content:

```env
DATABASE_URL="mysql://root@127.0.0.1:3306/travellatvia"
```

**Important Notes:**
- If your Laragon MySQL has a password, use: `mysql://root:YOUR_PASSWORD@127.0.0.1:3306/travellatvia`
- Replace `travellatvia` with your actual database name if different
- Make sure Laragon MySQL is running (check Laragon dashboard)

### 1.2 Verify Laragon MySQL is Running

1. Open Laragon application
2. Click "Start All" or just "Start" for MySQL
3. Verify MySQL is running (green indicator)
4. Default MySQL port is 3306

### 1.3 Create Database (if not exists)

1. Open Laragon
2. Click "Database" button (or open HeidiSQL/phpMyAdmin)
3. Create a new database named `travellatvia` (or your preferred name)
4. Make sure the database name matches your `.env.local` file

## Step 2: Run Database Migrations

After setting up `.env.local`, run these commands:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push
```

This will create all the necessary tables in your database.

## Step 3: Create Admin User

### Option A: Using the Script (Recommended)

Run the provided script:

```bash
node scripts/create-admin.js
```

This will create an admin user with:
- **Email:** admin@gmail.com
- **Password:** adminpassword
- **Role:** admin

### Option B: Using SQL Directly

If you prefer to use SQL directly in Laragon's database tool:

1. Open Laragon → Database (HeidiSQL or phpMyAdmin)
2. Select your database (`travellatvia`)
3. Run this SQL (you'll need to generate the password hash first):

```sql
-- First, you need to hash the password 'adminpassword'
-- Use the script or this Node.js one-liner:
-- node -e "const bcrypt=require('bcryptjs');bcrypt.hash('adminpassword',10).then(h=>console.log(h))"

-- Then insert (replace YOUR_HASHED_PASSWORD with the hash from above):
INSERT INTO users (name, email, password, role, created_at, updated_at)
VALUES ('Admin', 'admin@gmail.com', 'YOUR_HASHED_PASSWORD', 'admin', NOW(), NOW());
```

### Option C: Using Prisma Studio

```bash
npx prisma studio
```

This opens a visual database browser. Navigate to the `users` table and add a new user manually.

## Step 4: Verify Connection

Test your database connection:

```bash
# Test connection
npx prisma db pull
```

If this works without errors, your connection is configured correctly.

## Troubleshooting

### Error: Can't reach database server at `127.0.0.1:3306`

**Solutions:**
1. ✅ Make sure Laragon MySQL is running (green indicator)
2. ✅ Check if MySQL port is 3306 (default)
3. ✅ Verify `.env.local` file exists and has correct DATABASE_URL
4. ✅ Restart your Next.js dev server after creating `.env.local`
5. ✅ Check if MySQL password is required (update DATABASE_URL if needed)

### Error: Database doesn't exist

**Solution:**
- Create the database in Laragon first, then run `npx prisma db push`

### Error: Tables don't exist

**Solution:**
- Run `npx prisma db push` to create all tables from your schema

### Admin user not working

**Solution:**
- Make sure the user has `role: 'admin'` in the database
- Check that the email matches exactly: `admin@gmail.com`
- Verify password is hashed correctly (use the script)

## Default Admin Credentials

After running the script:
- **Email:** admin@gmail.com
- **Password:** adminpassword

**⚠️ IMPORTANT:** Change these credentials in production!

