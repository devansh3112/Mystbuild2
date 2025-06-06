-- Insert sample platform metrics data
-- This provides dashboard-level statistics

INSERT INTO platform_metrics (
  date, 
  active_manuscripts, 
  active_editors, 
  completed_manuscripts, 
  avg_completion_days, 
  new_writers, 
  revenue, 
  editor_capacity, 
  satisfaction_score
) VALUES 
  ('2025-05-20', 24, 8, 18, 6.2, 32, 8240.50, 0.78, 4.8),
  ('2025-05-19', 23, 8, 17, 6.5, 31, 8100.25, 0.75, 4.7),
  ('2025-05-18', 22, 7, 16, 6.8, 30, 7950.00, 0.72, 4.6),
  ('2025-05-17', 21, 7, 15, 7.0, 29, 7800.75, 0.70, 4.5),
  ('2025-05-16', 20, 6, 14, 7.2, 28, 7650.50, 0.68, 4.4);

-- Insert metric history data for tracking changes
INSERT INTO metric_history (metric_name, value, previous_value, date, change_percent) VALUES 
  ('active_manuscripts', 24, 21, '2025-05-20', 14.3),
  ('active_editors', 8, 7, '2025-05-20', 14.3),
  ('completed_manuscripts', 18, 15, '2025-05-20', 20.0),
  ('avg_completion_days', 6.2, 7.0, '2025-05-20', -11.4),
  ('new_writers', 32, 29, '2025-05-20', 10.3),
  ('revenue', 8240.50, 7800.75, '2025-05-20', 5.6),
  ('editor_capacity', 0.78, 0.70, '2025-05-20', 11.4),
  ('satisfaction_score', 4.8, 4.5, '2025-05-20', 6.7);

-- Insert previous day's history for comparison
INSERT INTO metric_history (metric_name, value, previous_value, date, change_percent) VALUES 
  ('active_manuscripts', 23, 20, '2025-05-19', 15.0),
  ('active_editors', 8, 6, '2025-05-19', 33.3),
  ('completed_manuscripts', 17, 14, '2025-05-19', 21.4),
  ('avg_completion_days', 6.5, 7.2, '2025-05-19', -9.7),
  ('new_writers', 31, 28, '2025-05-19', 10.7),
  ('revenue', 8100.25, 7650.50, '2025-05-19', 5.9),
  ('editor_capacity', 0.75, 0.68, '2025-05-19', 10.3),
  ('satisfaction_score', 4.7, 4.4, '2025-05-19', 6.8);

-- Insert more historical data for trends
INSERT INTO metric_history (metric_name, value, previous_value, date, change_percent) VALUES 
  ('active_manuscripts', 22, 19, '2025-05-18', 15.8),
  ('active_editors', 7, 6, '2025-05-18', 16.7),
  ('completed_manuscripts', 16, 13, '2025-05-18', 23.1),
  ('avg_completion_days', 6.8, 7.5, '2025-05-18', -9.3),
  ('new_writers', 30, 27, '2025-05-18', 11.1),
  ('revenue', 7950.00, 7500.00, '2025-05-18', 6.0),
  ('editor_capacity', 0.72, 0.65, '2025-05-18', 10.8),
  ('satisfaction_score', 4.6, 4.2, '2025-05-18', 9.5); 