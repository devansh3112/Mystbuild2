-- Insert sample chapters for existing manuscripts
-- This script uses proper UUID references from the manuscripts table

-- First, let's get the manuscript UUIDs by title and insert chapters accordingly

-- Chapters for "The Silent Symphony" (or first manuscript if title doesn't match)
INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'The Concert Hall',
  1,
  'Reviewed'
FROM manuscripts m 
WHERE m.title = 'The Silent Symphony' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at LIMIT 1)
LIMIT 1;

INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'The Composer''s Challenge',
  2,
  'In Review'
FROM manuscripts m 
WHERE m.title = 'The Silent Symphony' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at LIMIT 1)
LIMIT 1;

INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'Parisian Nights',
  3,
  'Not Started'
FROM manuscripts m 
WHERE m.title = 'The Silent Symphony' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at LIMIT 1)
LIMIT 1;

INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'The Revelation',
  4,
  'Not Started'
FROM manuscripts m 
WHERE m.title = 'The Silent Symphony' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at LIMIT 1)
LIMIT 1;

-- Chapters for "Echoes of Tomorrow" (or second manuscript)
INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'The Discovery',
  1,
  'Reviewed'
FROM manuscripts m 
WHERE m.title = 'Echoes of Tomorrow' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at OFFSET 1 LIMIT 1)
LIMIT 1;

INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'Temporal Shifts',
  2,
  'Reviewed'
FROM manuscripts m 
WHERE m.title = 'Echoes of Tomorrow' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at OFFSET 1 LIMIT 1)
LIMIT 1;

INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'The Paradox',
  3,
  'In Review'
FROM manuscripts m 
WHERE m.title = 'Echoes of Tomorrow' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at OFFSET 1 LIMIT 1)
LIMIT 1;

INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'Future Perfect',
  4,
  'Not Started'
FROM manuscripts m 
WHERE m.title = 'Echoes of Tomorrow' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at OFFSET 1 LIMIT 1)
LIMIT 1;

-- Chapters for "Quantum Dreams" (or third manuscript)
INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'The Experiment',
  1,
  'Reviewed'
FROM manuscripts m 
WHERE m.title = 'Quantum Dreams' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at OFFSET 2 LIMIT 1)
LIMIT 1;

INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'Dreamscape',
  2,
  'In Review'
FROM manuscripts m 
WHERE m.title = 'Quantum Dreams' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at OFFSET 2 LIMIT 1)
LIMIT 1;

INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'The Collision',
  3,
  'Not Started'
FROM manuscripts m 
WHERE m.title = 'Quantum Dreams' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at OFFSET 2 LIMIT 1)
LIMIT 1;

-- Chapters for "The Mountain's Secret" (or fourth manuscript)
INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'The Ascent',
  1,
  'Reviewed'
FROM manuscripts m 
WHERE m.title = 'The Mountain''s Secret' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at OFFSET 3 LIMIT 1)
LIMIT 1;

INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'Ancient Ruins',
  2,
  'Reviewed'
FROM manuscripts m 
WHERE m.title = 'The Mountain''s Secret' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at OFFSET 3 LIMIT 1)
LIMIT 1;

INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'The Hidden Valley',
  3,
  'In Review'
FROM manuscripts m 
WHERE m.title = 'The Mountain''s Secret' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at OFFSET 3 LIMIT 1)
LIMIT 1;

INSERT INTO chapters (manuscript_id, title, number, status)
SELECT 
  m.id,
  'Secrets Revealed',
  4,
  'Not Started'
FROM manuscripts m 
WHERE m.title = 'The Mountain''s Secret' 
   OR m.id = (SELECT id FROM manuscripts ORDER BY created_at OFFSET 3 LIMIT 1)
LIMIT 1; 