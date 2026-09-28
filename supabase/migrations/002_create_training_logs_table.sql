-- Create training_logs table for ML model training results
CREATE TABLE training_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metrics JSONB NOT NULL,
  config JSONB NOT NULL,
  training_data_size INTEGER NOT NULL,
  test_data_size INTEGER NOT NULL,
  training_time INTEGER NOT NULL, -- in milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_training_logs_created_at ON training_logs(created_at);

-- Enable Row Level Security
ALTER TABLE training_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (allow all authenticated users to read, but only system to write)
CREATE POLICY "Anyone can view training logs" ON training_logs
  FOR SELECT USING (true);

-- Note: Insert/Update/Delete policies would be restricted to service role in production
