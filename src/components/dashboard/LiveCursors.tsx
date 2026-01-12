import { useEffect, useState } from "react";
import { useLiveCursors, CursorPosition } from "@/hooks/useLiveCursors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface CursorProps {
  cursor: CursorPosition;
}

function Cursor({ cursor }: CursorProps) {
  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-all duration-75"
      style={{
        left: cursor.x,
        top: cursor.y,
        transform: "translate(-2px, -2px)",
      }}
    >
      {/* Cursor arrow */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
      >
        <path
          d="M5 3L19 12L12 13L9 20L5 3Z"
          fill={cursor.color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      {/* Name label */}
      <div
        className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: cursor.color }}
      >
        {cursor.displayName}
      </div>
    </div>
  );
}

export function LiveCursors() {
  const { user } = useAuth();
  const { cursors, updateCursor, leaveCursor } = useLiveCursors("dataset-redteam-cursors");
  const [displayName, setDisplayName] = useState<string>("");

  // Fetch display name
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      setDisplayName(data?.display_name || user.email?.split("@")[0] || "User");
    };

    fetchProfile();
  }, [user]);

  // Track mouse movement
  useEffect(() => {
    if (!displayName) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateCursor(e.clientX, e.clientY, displayName);
    };

    const handleMouseLeave = () => {
      leaveCursor();
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("beforeunload", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("beforeunload", handleMouseLeave);
      leaveCursor();
    };
  }, [displayName, updateCursor, leaveCursor]);

  return (
    <>
      {cursors.map((cursor) => (
        <Cursor key={cursor.id} cursor={cursor} />
      ))}
    </>
  );
}
