import { NextResponse } from "next/server";
import { signIn } from "~/server/auth";

export async function GET() {
  try {
    // Generate Discord OAuth URL
    const authUrl = await signIn("discord", { redirect: false });

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Discord OAuth error:", error);
    return NextResponse.json(
      { error: "Failed to generate Discord OAuth URL" },
      { status: 500 },
    );
  }
}
