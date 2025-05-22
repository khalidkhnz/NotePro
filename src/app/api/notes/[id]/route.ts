import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

// Schema for updating a note
const updateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  isPublic: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
});

// GET a specific note
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = params.id;

    // Get the note with category
    const note = await db.note.findUnique({
      where: {
        id: noteId,
        userId: session.user.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 },
    );
  }
}

// PATCH (update) a note
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
    const existingNote = await db.note.findUnique({
      where: {
        id: noteId,
        userId: session.user.id,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateNoteSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error },
        { status: 400 },
      );
    }

    // Update the note
    const updatedNote = await db.note.update({
      where: {
        id: noteId,
      },
      data: validatedData.data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 },
    );
  }
}

// DELETE a note
export async function DELETE(
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
    const existingNote = await db.note.findUnique({
      where: {
        id: noteId,
        userId: session.user.id,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Delete the note
    await db.note.delete({
      where: {
        id: noteId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
}
