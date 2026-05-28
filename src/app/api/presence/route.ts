import { NextResponse } from "next/server";

// Simple in-memory presence store (roomId -> Set of userIds)
const presence = new Map<string, Set<string>>();

export async function GET() {
  // SSE endpoint for real-time presence
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        const counts: Record<string, number> = {};
        for (const [room, users] of presence) {
          counts[room] = users.size;
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "presence", rooms: counts, total: [...presence.values()].reduce((a, s) => a + s.size, 0) })}\n\n`));
      };
      send();
      const interval = setInterval(send, 5000);
      // Cleanup when client disconnects
      const cleanup = () => clearInterval(interval);
      // Note: Next.js will close the stream when client disconnects
      return cleanup;
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(req: Request) {
  const { roomId, userId, action } = await req.json();
  if (!roomId || !userId) return NextResponse.json({ error: "Missing roomId or userId" }, { status: 400 });

  if (action === "join") {
    if (!presence.has(roomId)) presence.set(roomId, new Set());
    presence.get(roomId)!.add(userId);
  } else if (action === "leave") {
    presence.get(roomId)?.delete(userId);
    if (presence.get(roomId)?.size === 0) presence.delete(roomId);
  }

  return NextResponse.json({ ok: true, count: presence.get(roomId)?.size || 0 });
}
