# Supabase Setup for Mystery Publishers

This guide explains how to set up Supabase for the Mystery Publishers manuscript management platform.

## Schema Setup

### 1. Create the Profile Table

Copy and execute the SQL from `profiles_schema.sql` in your Supabase SQL Editor to create:
- The `profiles` table linked to Supabase Auth
- Row-Level Security policies
- Database triggers for updated timestamps
- Public views for user data

### 2. Configure Authentication

In your Supabase dashboard:

1. **Enable Email Authentication**
   - Go to Authentication → Providers
   - Ensure "Email" provider is enabled
   - Configure settings (confirm emails, secure passwords)

2. **Site URL & Redirect Settings**
   - Go to Authentication → URL Configuration
   - Set Site URL to your application URL
   - Add authorized redirect URLs for post-login/signup redirects

3. **Email Templates (Optional)**
   - Customize email templates for confirmation emails

## Application Environment

Create `.env` file with the following variables:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Role-Based Access

Our authentication system supports three role types:
- **Writer**: Regular users who can upload manuscripts
- **Editor**: Users who can review and edit manuscripts
- **Publisher**: Admin users with full system access

Roles are stored in the user's profile in the `role` field.

## Security Considerations

- Supabase RLS policies restrict user access to appropriate data
- Each user can only manage their own profile
- Authentication uses industry-standard practices via Supabase Auth

## Next Steps

After setting up authentication:

1. Create additional tables for manuscripts, chapters, and other data
2. Implement RLS policies for these tables
3. Replace mock data services with Supabase queries 