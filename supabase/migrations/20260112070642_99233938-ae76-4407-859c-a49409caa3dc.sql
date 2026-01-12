-- Create scan_history table to store dataset analysis results
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_name TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  feature_count INTEGER NOT NULL DEFAULT 0,
  vulnerability_score INTEGER NOT NULL DEFAULT 0,
  leakage_severity INTEGER NOT NULL DEFAULT 0,
  bias_exposure INTEGER NOT NULL DEFAULT 0,
  robustness_score INTEGER NOT NULL DEFAULT 0,
  exploitable_features INTEGER NOT NULL DEFAULT 0,
  ai_analysis TEXT,
  findings JSONB DEFAULT '[]'::jsonb,
  feature_risks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (no auth required for this demo)
CREATE POLICY "Allow public read access" ON public.scan_history
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON public.scan_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access" ON public.scan_history
  FOR DELETE USING (true);

-- Enable realtime for scan_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_history;