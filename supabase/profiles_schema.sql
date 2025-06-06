-- Create profiles table that connects to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('writer', 'editor', 'publisher')),
  avatar_url TEXT,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profile access
-- Users can read any profile
CREATE POLICY "Allow users to view all profiles" ON public.profiles 
FOR SELECT USING (true);

-- Users can update only their own profiles
CREATE POLICY "Allow users to update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- Allow users to create their own profile (fixed WITH CHECK syntax)
CREATE POLICY "Allow users to create own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to auto-update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a secure view for user data that excludes sensitive information
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT
  id,
  name,
  role,
  avatar_url,
  created_at
FROM profiles; 