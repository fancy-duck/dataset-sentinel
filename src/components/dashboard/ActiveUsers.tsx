import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePresence, PresenceUser } from "@/hooks/usePresence";
import { Users } from "lucide-react";

export function ActiveUsers() {
  const { onlineUsers } = usePresence("dataset-redteam");

  const getInitials = (user: PresenceUser) => {
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.slice(0, 2).toUpperCase() || "U";
  };

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="w-3 h-3" />
        <span>{onlineUsers.length} online</span>
      </div>
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 5).map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="w-7 h-7 border-2 border-background ring-2 ring-primary/20">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.email} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-medium">{user.displayName || user.email}</p>
              <p className="text-muted-foreground">
                Viewing: {user.currentPage}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
        {onlineUsers.length > 5 && (
          <div className="w-7 h-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
