-- Create teams/workspaces table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Add team_id to scan_history for shared scans
ALTER TABLE public.scan_history ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Helper function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

-- Teams policies
CREATE POLICY "Users can view teams they belong to"
ON public.teams FOR SELECT
TO authenticated
USING (public.is_team_member(auth.uid(), id));

CREATE POLICY "Users can create teams"
ON public.teams FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team owners can update their teams"
ON public.teams FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = id AND user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "Team owners can delete their teams"
ON public.teams FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = id AND user_id = auth.uid() AND role = 'owner'
  )
);

-- Team members policies
CREATE POLICY "Users can view members of their teams"
ON public.team_members FOR SELECT
TO authenticated
USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team admins can add members"
ON public.team_members FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_members.team_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
  )
  OR NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_id = team_members.team_id)
);

CREATE POLICY "Team admins can remove members"
ON public.team_members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
  OR user_id = auth.uid()
);

-- Update scan_history RLS to allow team access
DROP POLICY IF EXISTS "Users can view their own scans" ON public.scan_history;
CREATE POLICY "Users can view their own or team scans"
ON public.scan_history FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR (team_id IS NOT NULL AND public.is_team_member(auth.uid(), team_id))
);

-- Function to add creator as owner when team is created
CREATE OR REPLACE FUNCTION public.handle_new_team()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_team();

-- Enable realtime for teams
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;