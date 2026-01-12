-- Add user_id column to scan_history
ALTER TABLE public.scan_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON public.scan_history;
DROP POLICY IF EXISTS "Allow public insert access" ON public.scan_history;
DROP POLICY IF EXISTS "Allow public delete access" ON public.scan_history;

-- Create user-specific RLS policies
CREATE POLICY "Users can view their own scans"
ON public.scan_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans"
ON public.scan_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans"
ON public.scan_history
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans"
ON public.scan_history
FOR UPDATE
USING (auth.uid() = user_id);