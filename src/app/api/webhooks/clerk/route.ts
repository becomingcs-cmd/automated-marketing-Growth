import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { applyClerkUserEvent } from "@/lib/db/auth-repository";

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);
    const eventId = request.headers.get("svix-id");
    if (!eventId) return Response.json({ received: false }, { status: 400 });
    const result = await applyClerkUserEvent(eventId, event);
    return Response.json({ received: true, result });
  } catch (error) {
    console.error("Clerk webhook rejected", error instanceof Error ? error.message : "unknown error");
    return Response.json({ received: false }, { status: 400 });
  }
}
