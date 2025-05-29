import { NextResponse } from "next/server";
import { signIn } from "~/server/auth";

export async function GET() {
  try {
    // Generate Google OAuth URL
    const authUrl = await signIn("google", { redirect: false });

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.json(
      { error: "Failed to generate Google OAuth URL" },
      { status: 500 },
    );
  }
}
