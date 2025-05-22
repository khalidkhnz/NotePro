import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

export async function GET() {
  try {
    // Get the user's session
    const session = await auth();

    if (session?.user) {
      // Return user info without sensitive data
      return NextResponse.json({
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        },
      });
    }

    // No session found
    return NextResponse.json({ user: null });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 },
    );
  }
}
