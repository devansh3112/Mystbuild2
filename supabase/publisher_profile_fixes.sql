-- Publisher Profile Completion Migration
-- This migration adds missing tables and fields for publisher functionality

-- Add missing fields to manuscripts table
ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS publisher_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS synopsis TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS content_url TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS original_filename TEXT;

-- Create publisher_purchases table (missing from current schema)
CREATE TABLE IF NOT EXISTS publisher_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publisher_id UUID REFERENCES profiles(id) NOT NULL,
  manuscript_id UUID REFERENCES manuscripts(id) NOT NULL,
  purchase_price DECIMAL(12,2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'purchased',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security for publisher_purchases
ALTER TABLE publisher_purchases ENABLE ROW LEVEL SECURITY;

-- Publishers can view their own purchases
CREATE POLICY "Publishers can view their own purchases" 
ON publisher_purchases FOR SELECT 
USING (auth.uid() = publisher_id);

-- Publishers can insert their own purchases
CREATE POLICY "Publishers can insert their own purchases" 
ON publisher_purchases FOR INSERT 
WITH CHECK (auth.uid() = publisher_id);

-- Publishers can update their own purchases
CREATE POLICY "Publishers can update their own purchases" 
ON publisher_purchases FOR UPDATE 
USING (auth.uid() = publisher_id)
WITH CHECK (auth.uid() = publisher_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all publisher purchases" 
ON publisher_purchases FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_publisher_purchases_publisher_id ON publisher_purchases(publisher_id);
CREATE INDEX IF NOT EXISTS idx_publisher_purchases_manuscript_id ON publisher_purchases(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_manuscripts_payment_status ON manuscripts(payment_status);
CREATE INDEX IF NOT EXISTS idx_manuscripts_publisher_id ON manuscripts(publisher_id);

-- Extend profiles table for enhanced publisher information
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS publishing_specialties TEXT[],
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create publisher_settings table for additional publisher configuration
CREATE TABLE IF NOT EXISTS publisher_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publisher_id UUID REFERENCES profiles(id) UNIQUE NOT NULL,
  auto_assign_editors BOOLEAN DEFAULT false,
  preferred_genres TEXT[],
  max_concurrent_projects INTEGER DEFAULT 10,
  notification_preferences JSONB DEFAULT '{}',
  payment_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for publisher_settings
ALTER TABLE publisher_settings ENABLE ROW LEVEL SECURITY;

-- Publishers can manage their own settings
CREATE POLICY "Publishers can manage their own settings" 
ON publisher_settings FOR ALL 
USING (auth.uid() = publisher_id)
WITH CHECK (auth.uid() = publisher_id);

-- Function to auto-update the updated_at column for publisher_purchases
CREATE OR REPLACE FUNCTION update_publisher_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for publisher_purchases
CREATE TRIGGER update_publisher_purchases_updated_at
BEFORE UPDATE ON publisher_purchases
FOR EACH ROW
EXECUTE FUNCTION update_publisher_purchases_updated_at();

-- Function to auto-update the updated_at column for publisher_settings
CREATE OR REPLACE FUNCTION update_publisher_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for publisher_settings
CREATE TRIGGER update_publisher_settings_updated_at
BEFORE UPDATE ON publisher_settings
FOR EACH ROW
EXECUTE FUNCTION update_publisher_settings_updated_at(); 