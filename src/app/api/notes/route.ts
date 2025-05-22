import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

// Schema for creating a note
const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  isPublic: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  categoryId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createNoteSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error },
        { status: 400 },
      );
    }

    const { title, content, isPublic, isPinned, categoryId } =
      validatedData.data;

    // Create note
    const note = await db.note.create({
      data: {
        title,
        content,
        isPublic,
        isPinned,
        userId: session.user.id,
        categoryId,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const query = searchParams.get("q") || "";

    const skip = (page - 1) * limit;

    // Build query conditions
    const whereConditions: any = {
      userId: session.user.id,
    };

    if (query) {
      whereConditions.OR = [
        { title: { contains: query } },
        { content: { contains: query } },
      ];
    }

    // Get notes count
    const totalNotes = await db.note.count({
      where: whereConditions,
    });

    // Get notes with pagination
    const notes = await db.note.findMany({
      where: whereConditions,
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
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

    return NextResponse.json({
      notes,
      pagination: {
        total: totalNotes,
        page,
        limit,
        pages: Math.ceil(totalNotes / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 },
    );
  }
}
