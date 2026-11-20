import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const room = searchParams.get("room");
    const username = searchParams.get("username");
    const canPublish = searchParams.get("canPublish") === "true";

    if (!room || !username) {
      return NextResponse.json(
        { error: "Query parameters 'room' and 'username' are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        { 
          token: null, 
          isConfigured: false,
          message: "LiveKit credentials not configured in environment variables." 
        },
        { status: 200 }
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      ttl: "2h",
    });

    at.addGrant({
      room,
      roomJoin: true,
      canPublish,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      isConfigured: true,
      url: livekitUrl,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("LiveKit token generation error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
