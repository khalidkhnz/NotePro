import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = (await params).id;

    const note = await db.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedNote = await db.note.update({
      where: {
        id: noteId,
      },
      data: {
        isPublic: !note.isPublic,
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error toggling note visibility:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
