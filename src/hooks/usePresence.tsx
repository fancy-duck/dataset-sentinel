import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface PresenceUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  onlineAt: string;
  currentPage: string;
}

export function usePresence(channelName: string = "global-presence") {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  // Fetch user profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  // Set up presence channel
  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const users: PresenceUser[] = [];

        Object.entries(state).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            const presence = presences[0] as any;
            users.push({
              id: key,
              email: presence.email || "",
              displayName: presence.displayName || null,
              avatarUrl: presence.avatarUrl || null,
              onlineAt: presence.onlineAt || new Date().toISOString(),
              currentPage: presence.currentPage || "/",
            });
          }
        });

        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            email: user.email,
            displayName: profile?.display_name || user.email?.split("@")[0],
            avatarUrl: profile?.avatar_url,
            onlineAt: new Date().toISOString(),
            currentPage: window.location.pathname,
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user, channelName, profile]);

  // Update presence when page changes
  const updatePresence = useCallback(
    async (currentPage: string) => {
      if (channel && user) {
        await channel.track({
          email: user.email,
          displayName: profile?.display_name || user.email?.split("@")[0],
          avatarUrl: profile?.avatar_url,
          onlineAt: new Date().toISOString(),
          currentPage,
        });
      }
    },
    [channel, user, profile]
  );

  return {
    onlineUsers,
    updatePresence,
  };
}
