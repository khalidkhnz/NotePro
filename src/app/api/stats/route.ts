import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  try {
    // Count total users
    const usersCount = await db.user.count();

    // Count total notes
    const notesCount = await db.note.count();

    // Count public notes
    const publicNotesCount = await db.note.count({
      where: {
        isPublic: true,
      },
    });

    return NextResponse.json({
      users: usersCount,
      notes: notesCount,
      publicNotes: publicNotesCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
