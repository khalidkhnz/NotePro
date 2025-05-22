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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.log("📝 GET Note API called with params:", params);
    const session = await auth();
    console.log("📝 Session:", session?.user?.id);

    // Await params before using
    const resolvedParams = await params;
    console.log("📝 Resolved params:", resolvedParams);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = resolvedParams.id;
    console.log("📝 Looking for note with ID:", noteId);

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

    console.log("📝 Note found:", note ? "Yes" : "No");

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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.log("📝 PATCH Note API called with params:", params);
    const session = await auth();
    console.log("📝 Session:", session?.user?.id);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before using
    const resolvedParams = await params;
    console.log("📝 Resolved params:", resolvedParams);
    const noteId = resolvedParams.id;
    console.log("📝 Updating note with ID:", noteId);

    // Check if note exists and belongs to the user
    const existingNote = await db.note.findUnique({
      where: {
        id: noteId,
        userId: session.user.id,
      },
    });

    console.log("📝 Note found:", existingNote ? "Yes" : "No");

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    console.log("📝 Request body:", body);
    const validatedData = updateNoteSchema.safeParse(body);

    if (!validatedData.success) {
      console.log("📝 Validation error:", validatedData.error);
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

    console.log("📝 Note updated successfully");
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before using
    const resolvedParams = await params;
    const noteId = resolvedParams.id;

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

// Add PUT method to support client component updates
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Log the PUT request
  console.log("📝 PUT Note API called with params:", params);

  // Reuse the same logic as PATCH for the PUT method
  return PATCH(request, { params });
}
