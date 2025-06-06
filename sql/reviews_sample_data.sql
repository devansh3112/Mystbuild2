-- Add manuscript reviews for better detail view
-- Check the actual table and column names in your database

-- This assumes a table named 'manuscript_reviews' with columns:
-- manuscript_id, reviewer_id, date, rating, comment

INSERT INTO manuscript_reviews (manuscript_id, reviewer_id, date, rating, comment)
VALUES
  (1, (SELECT id FROM profiles WHERE name = 'Priya Sharma' LIMIT 1), '2025-05-20T14:30:00', 4, 'Strong premise with well-developed characters. The historical research is evident throughout.'),
  (1, (SELECT id FROM profiles WHERE name = 'Mark Davis' LIMIT 1), '2025-05-22T10:15:00', 5, 'Exceptional narrative voice. The protagonist''s journey is compelling and authentic.'),
  (2, (SELECT id FROM profiles WHERE name = 'Priya Sharma' LIMIT 1), '2025-05-15T09:45:00', 5, 'Innovative concept with excellent execution. The time travel elements are handled with exceptional skill.'),
  (3, (SELECT id FROM profiles WHERE name = 'James Wilson' LIMIT 1), '2025-05-10T16:20:00', 4, 'The scientific concepts are complex but explained clearly. Character motivations need strengthening in chapter 2.'),
  (4, (SELECT id FROM profiles WHERE name = 'Mark Davis' LIMIT 1), '2025-05-05T11:30:00', 5, 'Outstanding adventure narrative with excellent pacing and atmosphere.');

-- Alternative version if the table is named differently or has different columns:
/*
INSERT INTO reviews (manuscript_id, reviewer_id, review_date, score, review_text)
VALUES
  (1, (SELECT id FROM profiles WHERE name = 'Priya Sharma' LIMIT 1), '2025-05-20T14:30:00', 4, 'Strong premise with well-developed characters. The historical research is evident throughout.'),
  (1, (SELECT id FROM profiles WHERE name = 'Mark Davis' LIMIT 1), '2025-05-22T10:15:00', 5, 'Exceptional narrative voice. The protagonist''s journey is compelling and authentic.'),
  (2, (SELECT id FROM profiles WHERE name = 'Priya Sharma' LIMIT 1), '2025-05-15T09:45:00', 5, 'Innovative concept with excellent execution. The time travel elements are handled with exceptional skill.'),
  (3, (SELECT id FROM profiles WHERE name = 'James Wilson' LIMIT 1), '2025-05-10T16:20:00', 4, 'The scientific concepts are complex but explained clearly. Character motivations need strengthening in chapter 2.'),
  (4, (SELECT id FROM profiles WHERE name = 'Mark Davis' LIMIT 1), '2025-05-05T11:30:00', 5, 'Outstanding adventure narrative with excellent pacing and atmosphere.');
*/ 