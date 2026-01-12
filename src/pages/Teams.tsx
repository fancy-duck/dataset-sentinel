import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Users,
  Loader2,
  UserPlus,
  Crown,
  Shield,
  User as UserIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export default function Teams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    fetchTeams();
  }, [user]);

  useEffect(() => {
    if (selectedTeam) {
      fetchMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeams(data || []);
      if (data && data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0]);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (teamId: string) => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId);

      if (membersError) throw membersError;

      // Fetch profiles for each member
      const memberIds = membersData?.map((m) => m.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", memberIds);

      const membersWithProfiles = membersData?.map((member) => ({
        ...member,
        profile: profiles?.find((p) => p.user_id === member.user_id),
      }));

      setMembers(membersWithProfiles || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleCreateTeam = async () => {
    if (!user || !newTeamName.trim()) return;
    setCreating(true);

    try {
      const { data, error } = await supabase
        .from("teams")
        .insert({
          name: newTeamName.trim(),
          description: newTeamDescription.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTeams((prev) => [data, ...prev]);
      setSelectedTeam(data);
      setShowCreateDialog(false);
      setNewTeamName("");
      setNewTeamDescription("");
      toast.success("Team created successfully");
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleInviteMember = async () => {
    if (!selectedTeam || !inviteEmail.trim()) return;
    setInviting(true);

    try {
      // Find user by email through profiles
      // Note: In production, you'd want an invite system instead
      toast.info("Invite system coming soon! Share the team ID with your colleague.");
      setShowInviteDialog(false);
      setInviteEmail("");
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error("Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Member removed");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;

    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", selectedTeam.id);

      if (error) throw error;

      setTeams((prev) => prev.filter((t) => t.id !== selectedTeam.id));
      setSelectedTeam(teams.find((t) => t.id !== selectedTeam.id) || null);
      toast.success("Team deleted");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-3 h-3" />;
      case "admin":
        return <Shield className="w-3 h-3" />;
      default:
        return <UserIcon className="w-3 h-3" />;
    }
  };

  const getInitials = (member: TeamMember) => {
    const name = member.profile?.display_name;
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  const userRole = members.find((m) => m.user_id === user?.id)?.role;
  const isOwner = userRole === "owner";

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="fixed inset-0 pointer-events-none scanline opacity-50" />
      <div className="fixed inset-0 pointer-events-none bg-gradient-radial" />

      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Team Workspaces
              </h1>
              <p className="text-sm text-muted-foreground">
                Collaborate with your team on dataset analysis
              </p>
            </div>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="My Awesome Team"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamDescription">Description (optional)</Label>
                  <Textarea
                    id="teamDescription"
                    placeholder="What does this team work on?"
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateTeam}
                  disabled={creating || !newTeamName.trim()}
                  className="w-full"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <div className="glass-panel glow-border p-4 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Your Teams
            </h2>
            {teams.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No teams yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a team to start collaborating
                </p>
              </div>
            ) : (
              teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedTeam?.id === team.id
                      ? "bg-primary/20 border border-primary/30"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{team.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {team.description || "No description"}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2 space-y-4">
            {selectedTeam ? (
              <>
                {/* Team Info */}
                <div className="glass-panel glow-border p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedTeam.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTeam.description || "No description"}
                      </p>
                    </div>
                    {isOwner && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteTeam}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Members */}
                <div className="glass-panel glow-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Members ({members.length})
                    </h3>
                    {(isOwner || userRole === "admin") && (
                      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            Invite
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invite Team Member</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="colleague@company.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                              />
                            </div>
                            <Button
                              onClick={handleInviteMember}
                              disabled={inviting || !inviteEmail.trim()}
                              className="w-full"
                            >
                              {inviting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : null}
                              Send Invite
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {getInitials(member)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.profile?.display_name || "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Joined {new Date(member.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1">
                            {getRoleIcon(member.role)}
                            {member.role}
                          </Badge>
                          {isOwner && member.user_id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-panel glow-border p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Select a team or create a new one
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-8 font-mono">
          AUTONOMOUS DATASET RED TEAM v1.0.0 • Powered by AI
        </p>
      </div>
    </div>
  );
}
