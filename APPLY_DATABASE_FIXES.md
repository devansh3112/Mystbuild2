# Database Fixes for Manuscripts Upload Issue

## Problem
The error "new row violates row-level security policy for table 'manuscripts'" occurs because the database is missing INSERT and UPDATE policies for the manuscripts table.

## Solution
Apply the SQL migration below to your Supabase database.

## How to Apply

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire SQL script below
4. Click "Run" to execute

## SQL Migration Script

```sql
-- Fix manuscripts table Row Level Security policies
-- This migration adds missing INSERT and UPDATE policies for manuscripts

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Writers can insert their own manuscripts" ON manuscripts;
DROP POLICY IF EXISTS "Writers can update their own manuscripts" ON manuscripts;
DROP POLICY IF EXISTS "Publishers can insert any manuscript" ON manuscripts;
DROP POLICY IF EXISTS "Publishers can update any manuscript" ON manuscripts;

-- Add INSERT policy for writers to create their own manuscripts
CREATE POLICY "Writers can insert their own manuscripts" 
ON manuscripts FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- Add UPDATE policy for writers to update their own manuscripts
CREATE POLICY "Writers can update their own manuscripts" 
ON manuscripts FOR UPDATE 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Add INSERT policy for publishers to create any manuscript
CREATE POLICY "Publishers can insert any manuscript" 
ON manuscripts FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'publisher'
));

-- Add UPDATE policy for publishers to update any manuscript
CREATE POLICY "Publishers can update any manuscript" 
ON manuscripts FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'publisher'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'publisher'
));

-- Fix profiles table RLS policies to allow reading author information
-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profiles policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Allow users to view all profiles (needed for author names)
CREATE POLICY "Users can view all profiles" 
ON profiles FOR SELECT 
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);
```

## What This Fixes

1. **Script Upload Issue**: Writers can now insert manuscripts into the database
2. **Manuscripts Page Issue**: Users can now read author information from profiles
3. **Update Permissions**: Writers can update their own manuscripts
4. **Publisher Permissions**: Publishers can manage all manuscripts

## After Applying

1. Restart your development server: `npm run dev`
2. Try uploading a script again
3. Check that the manuscripts page loads properly

## Verification

After applying the migration, you should be able to:
- Upload scripts without RLS policy errors
- View the manuscripts page without errors
- See author names in manuscript listings 