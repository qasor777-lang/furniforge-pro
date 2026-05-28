"use client";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export function PresenceIndicator({ roomId }: { roomId: string }) {
  const [count, setCount] = useState(1);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const userId = `user_${Math.random().toString(36).slice(2, 8)}`;
    // Join
    fetch("/api/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, userId, action: "join" }),
    });

    // SSE
    const evtSource = new EventSource("/api/presence");
    evtSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setCount(data.rooms[roomId] || 1);
        setConnected(true);
      } catch { /* ignore */ }
    };
    evtSource.onerror = () => setConnected(false);

    return () => {
      evtSource.close();
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, userId, action: "leave" }),
      }).catch(() => {});
    };
  }, [roomId]);

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted" title="Real-time foydalanuvchilar">
      <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
      <Users className="w-3.5 h-3.5" />
      <span>{count} onlayn</span>
    </div>
  );
}
