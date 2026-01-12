import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface CursorPosition {
  id: string;
  x: number;
  y: number;
  displayName: string;
  color: string;
  lastUpdate: number;
}

const CURSOR_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#06b6d4"
];

function hashStringToIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % max;
}

export function useLiveCursors(channelName: string = "live-cursors") {
  const { user } = useAuth();
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const throttleRef = useRef<number>(0);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "cursor-move" }, (payload) => {
        const { userId, x, y, displayName } = payload.payload;
        if (userId === user.id) return;

        setCursors((prev) => {
          const next = new Map(prev);
          next.set(userId, {
            id: userId,
            x,
            y,
            displayName,
            color: CURSOR_COLORS[hashStringToIndex(userId, CURSOR_COLORS.length)],
            lastUpdate: Date.now(),
          });
          return next;
        });
      })
      .on("broadcast", { event: "cursor-leave" }, (payload) => {
        const { userId } = payload.payload;
        setCursors((prev) => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });
      })
      .subscribe();

    channelRef.current = channel;

    // Clean up stale cursors every 3 seconds
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        const next = new Map(prev);
        for (const [id, cursor] of next) {
          if (now - cursor.lastUpdate > 5000) {
            next.delete(id);
          }
        }
        return next;
      });
    }, 3000);

    return () => {
      channel.unsubscribe();
      clearInterval(cleanupInterval);
    };
  }, [user, channelName]);

  const updateCursor = useCallback(
    (x: number, y: number, displayName: string) => {
      if (!channelRef.current || !user) return;

      const now = Date.now();
      if (now - throttleRef.current < 50) return; // Throttle to 20fps
      throttleRef.current = now;

      channelRef.current.send({
        type: "broadcast",
        event: "cursor-move",
        payload: {
          userId: user.id,
          x,
          y,
          displayName,
        },
      });
    },
    [user]
  );

  const leaveCursor = useCallback(() => {
    if (!channelRef.current || !user) return;
    channelRef.current.send({
      type: "broadcast",
      event: "cursor-leave",
      payload: { userId: user.id },
    });
  }, [user]);

  return {
    cursors: Array.from(cursors.values()),
    updateCursor,
    leaveCursor,
  };
}
