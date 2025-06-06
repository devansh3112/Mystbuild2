-- Insert sample profiles (ensure these match any existing test users)
INSERT INTO profiles (id, name, role, avatar_url)
VALUES 
  ('d0c27400-3c27-4bba-b65c-5fa9e5bf9798', 'Alex Publisher', 'publisher', 'https://i.pravatar.cc/150?u=publisher@mystpub.com'),
  ('e9be5d0d-53e1-4730-8222-74789e224902', 'Emma Editor', 'editor', 'https://i.pravatar.cc/150?u=editor1@mystpub.com'),
  ('f8a8e1c2-3b9d-4c4e-9a0c-61d2c7a56789', 'James Editor', 'editor', 'https://i.pravatar.cc/150?u=editor2@mystpub.com'),
  ('a2b6e4c8-1234-5678-9abc-def012345678', 'Sarah Writer', 'writer', 'https://i.pravatar.cc/150?u=writer1@example.com'),
  ('b3c7f5d9-2345-6789-0123-456789abcdef', 'Michael Writer', 'writer', 'https://i.pravatar.cc/150?u=writer2@example.com');

-- Insert sample manuscripts
INSERT INTO manuscripts (id, title, author_id, genre, status, submission_date, deadline, word_count, progress)
VALUES
  ('1a2b3c4d-5e6f-7890-abcd-ef1234567890', 'The Last Echo', 'a2b6e4c8-1234-5678-9abc-def012345678', 'Mystery', 'In Review', '2023-10-15', '2023-12-30', 68000, 0.75),
  ('2b3c4d5e-6f78-90ab-cdef-123456789012', 'Distant Horizons', 'b3c7f5d9-2345-6789-0123-456789abcdef', 'Science Fiction', 'New', '2023-11-01', '2024-01-15', 52000, 0.3),
  ('3c4d5e6f-7890-abcd-ef12-3456789012ab', 'Midnight Shadows', 'a2b6e4c8-1234-5678-9abc-def012345678', 'Thriller', 'Editing', '2023-09-20', '2023-11-30', 74000, 0.9),
  ('4d5e6f78-90ab-cdef-1234-567890123456', 'Ocean Dreams', 'b3c7f5d9-2345-6789-0123-456789abcdef', 'Romance', 'Published', '2023-08-05', '2023-10-20', 61000, 1.0),
  ('5e6f7890-abcd-ef12-3456-789012345678', 'Forest Whispers', 'a2b6e4c8-1234-5678-9abc-def012345678', 'Fantasy', 'In Review', '2023-10-25', '2023-12-15', 83000, 0.6);

-- Insert sample chapters
INSERT INTO chapters (manuscript_id, title, number, status, progress)
VALUES
  ('1a2b3c4d-5e6f-7890-abcd-ef1234567890', 'The Beginning', 1, 'complete', 1.0),
  ('1a2b3c4d-5e6f-7890-abcd-ef1234567890', 'The Discovery', 2, 'complete', 1.0),
  ('1a2b3c4d-5e6f-7890-abcd-ef1234567890', 'The Revelation', 3, 'in-progress', 0.5),
  ('3c4d5e6f-7890-abcd-ef12-3456789012ab', 'Darkness Falls', 1, 'complete', 1.0),
  ('3c4d5e6f-7890-abcd-ef12-3456789012ab', 'Hidden Truths', 2, 'complete', 1.0),
  ('3c4d5e6f-7890-abcd-ef12-3456789012ab', 'The Chase', 3, 'complete', 1.0);

-- Insert sample assignments
INSERT INTO assignments (manuscript_id, editor_id, status, priority, assigned_date, deadline)
VALUES
  ('1a2b3c4d-5e6f-7890-abcd-ef1234567890', 'e9be5d0d-53e1-4730-8222-74789e224902', 'in-progress', 'High', '2023-10-20', '2023-12-25'),
  ('2b3c4d5e-6f78-90ab-cdef-123456789012', 'f8a8e1c2-3b9d-4c4e-9a0c-61d2c7a56789', 'assigned', 'Medium', '2023-11-05', '2024-01-10'),
  ('3c4d5e6f-7890-abcd-ef12-3456789012ab', 'e9be5d0d-53e1-4730-8222-74789e224902', 'reviewing', 'High', '2023-09-25', '2023-11-25'),
  ('5e6f7890-abcd-ef12-3456-789012345678', 'f8a8e1c2-3b9d-4c4e-9a0c-61d2c7a56789', 'in-progress', 'Medium', '2023-10-30', '2023-12-10');

-- Insert sample editor metrics
INSERT INTO editor_metrics (editor_id, month, assigned_count, completed_count, satisfaction_rating, on_time_rate)
VALUES
  ('e9be5d0d-53e1-4730-8222-74789e224902', '2023-11-01', 8, 6, 4.7, 0.92),
  ('e9be5d0d-53e1-4730-8222-74789e224902', '2023-10-01', 7, 5, 4.5, 0.85),
  ('f8a8e1c2-3b9d-4c4e-9a0c-61d2c7a56789', '2023-11-01', 6, 4, 4.3, 0.80),
  ('f8a8e1c2-3b9d-4c4e-9a0c-61d2c7a56789', '2023-10-01', 5, 4, 4.2, 0.78);

-- Insert platform metrics
INSERT INTO platform_metrics (date, active_manuscripts, active_editors, completed_manuscripts, 
                            avg_completion_days, new_writers, revenue, editor_capacity, satisfaction_score)
VALUES
  ('2023-11-01', 45, 12, 8, 53.5, 15, 12500.00, 0.78, 4.6),
  ('2023-10-01', 42, 10, 7, 55.2, 12, 11800.00, 0.82, 4.5),
  ('2023-09-01', 40, 10, 6, 56.8, 10, 10900.00, 0.75, 4.4),
  ('2023-08-01', 38, 9, 6, 58.1, 8, 10200.00, 0.70, 4.3);

-- Insert metric history data
INSERT INTO metric_history (metric_name, value, previous_value, date, change_percent)
VALUES
  ('active_manuscripts', 45, 42, '2023-11-01', 7.14),
  ('active_editors', 12, 10, '2023-11-01', 20.0),
  ('revenue', 12500, 11800, '2023-11-01', 5.93),
  ('satisfaction', 4.6, 4.5, '2023-11-01', 2.22),
  ('active_manuscripts', 42, 40, '2023-10-01', 5.0),
  ('active_editors', 10, 10, '2023-10-01', 0.0),
  ('revenue', 11800, 10900, '2023-10-01', 8.26),
  ('satisfaction', 4.5, 4.4, '2023-10-01', 2.27); 