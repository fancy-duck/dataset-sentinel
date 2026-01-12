import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

interface Team {
  id: string;
  name: string;
}

interface TeamSelectorProps {
  selectedTeamId: string | null;
  onTeamChange: (teamId: string | null) => void;
}

export function TeamSelector({ selectedTeamId, onTeamChange }: TeamSelectorProps) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTeams = async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name")
        .order("name");

      if (!error && data) {
        setTeams(data);
      }
      setLoading(false);
    };

    fetchTeams();
  }, [user]);

  if (loading || teams.length === 0) {
    return null;
  }

  return (
    <Select
      value={selectedTeamId || "personal"}
      onValueChange={(value) => onTeamChange(value === "personal" ? null : value)}
    >
      <SelectTrigger className="w-[180px] h-9 bg-secondary/50 border-border/50">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder="Personal" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="personal">Personal</SelectItem>
        {teams.map((team) => (
          <SelectItem key={team.id} value={team.id}>
            {team.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
