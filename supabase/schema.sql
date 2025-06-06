-- Manuscripts table - Core data about each manuscript
CREATE TABLE IF NOT EXISTS manuscripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  genre TEXT,
  status TEXT DEFAULT 'New',
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deadline TIMESTAMP WITH TIME ZONE,
  word_count INTEGER DEFAULT 0,
  progress FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters table - Chapters within manuscripts
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  number INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  progress FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table - Connects editors to manuscripts
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
  editor_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'assigned',
  priority TEXT DEFAULT 'Medium',
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deadline TIMESTAMP WITH TIME ZONE
);

-- Editor performance - Tracking editor metrics
CREATE TABLE IF NOT EXISTS editor_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  editor_id UUID REFERENCES profiles(id),
  month DATE NOT NULL,
  assigned_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  satisfaction_rating FLOAT DEFAULT 0,
  on_time_rate FLOAT DEFAULT 0
);

-- Overall platform metrics - For dashboard stats
CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  active_manuscripts INTEGER DEFAULT 0,
  active_editors INTEGER DEFAULT 0,
  completed_manuscripts INTEGER DEFAULT 0,
  avg_completion_days FLOAT DEFAULT 0,
  new_writers INTEGER DEFAULT 0,
  revenue FLOAT DEFAULT 0,
  editor_capacity FLOAT DEFAULT 0,
  satisfaction_score FLOAT DEFAULT 0
);

-- Historical metrics - For tracking changes and displaying growth indicators
CREATE TABLE IF NOT EXISTS metric_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  value FLOAT NOT NULL, 
  previous_value FLOAT,
  date DATE NOT NULL,
  change_percent FLOAT
);

-- Set up Row Level Security
ALTER TABLE manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_history ENABLE ROW LEVEL SECURITY;

-- Basic security policies
CREATE POLICY "Writers can view their own manuscripts" 
ON manuscripts FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Editors can view assigned manuscripts" 
ON manuscripts FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM assignments 
  WHERE manuscripts.id = assignments.manuscript_id 
  AND assignments.editor_id = auth.uid()
));

CREATE POLICY "Publishers can view all manuscripts" 
ON manuscripts FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'publisher'
)); 