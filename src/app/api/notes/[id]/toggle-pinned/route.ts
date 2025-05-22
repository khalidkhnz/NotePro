import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = params.id;

    // Check if note exists and belongs to the user
    const note = await db.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only toggle pin status of your own notes" },
        { status: 403 },
      );
    }

    // Toggle the isPinned state
    const updatedNote = await db.note.update({
      where: {
        id: noteId,
      },
      data: {
        isPinned: !note.isPinned,
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error toggling pin status:", error);
    return NextResponse.json(
      { error: "Failed to toggle pin status" },
      { status: 500 },
    );
  }
}
