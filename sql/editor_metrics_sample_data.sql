-- Insert sample editor metrics data
-- This provides performance tracking data for editors

-- Insert editor metrics for May 2025
INSERT INTO editor_metrics (editor_id, month, assigned_count, completed_count, satisfaction_rating, on_time_rate)
SELECT 
  p.id,
  '2025-05-01'::date,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 4
    WHEN p.name = 'Mark Davis' THEN 5  
    WHEN p.name = 'James Wilson' THEN 6
    ELSE 3
  END,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 4
    WHEN p.name = 'Mark Davis' THEN 3
    WHEN p.name = 'James Wilson' THEN 5
    ELSE 2
  END,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 4.9
    WHEN p.name = 'Mark Davis' THEN 4.8
    WHEN p.name = 'James Wilson' THEN 4.7
    ELSE 4.5
  END,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 1.0
    WHEN p.name = 'Mark Davis' THEN 1.0
    WHEN p.name = 'James Wilson' THEN 0.95
    ELSE 0.9
  END
FROM profiles p 
WHERE p.role = 'editor';

-- Insert metrics for April 2025
INSERT INTO editor_metrics (editor_id, month, assigned_count, completed_count, satisfaction_rating, on_time_rate)
SELECT 
  p.id,
  '2025-04-01'::date,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 3
    WHEN p.name = 'Mark Davis' THEN 4  
    WHEN p.name = 'James Wilson' THEN 5
    ELSE 2
  END,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 3
    WHEN p.name = 'Mark Davis' THEN 4
    WHEN p.name = 'James Wilson' THEN 4
    ELSE 2
  END,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 4.8
    WHEN p.name = 'Mark Davis' THEN 4.9
    WHEN p.name = 'James Wilson' THEN 4.6
    ELSE 4.4
  END,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 0.95
    WHEN p.name = 'Mark Davis' THEN 1.0
    WHEN p.name = 'James Wilson' THEN 0.90
    ELSE 0.85
  END
FROM profiles p 
WHERE p.role = 'editor';

-- Insert metrics for March 2025
INSERT INTO editor_metrics (editor_id, month, assigned_count, completed_count, satisfaction_rating, on_time_rate)
SELECT 
  p.id,
  '2025-03-01'::date,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 5
    WHEN p.name = 'Mark Davis' THEN 3  
    WHEN p.name = 'James Wilson' THEN 4
    ELSE 3
  END,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 5
    WHEN p.name = 'Mark Davis' THEN 2
    WHEN p.name = 'James Wilson' THEN 4
    ELSE 2
  END,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 4.7
    WHEN p.name = 'Mark Davis' THEN 4.6
    WHEN p.name = 'James Wilson' THEN 4.8
    ELSE 4.3
  END,
  CASE 
    WHEN p.name = 'Priya Sharma' THEN 1.0
    WHEN p.name = 'Mark Davis' THEN 0.85
    WHEN p.name = 'James Wilson' THEN 0.92
    ELSE 0.80
  END
FROM profiles p 
WHERE p.role = 'editor'; 