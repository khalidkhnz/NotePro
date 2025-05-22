import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

// Schema for creating a new note
const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  isPublic: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  categoryId: z.string().nullable().optional(),
});

// Query params schema
const getNotesQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(9),
  q: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  isPublic: z.enum(["true", "false"]).optional().nullable(),
  isPinned: z.enum(["true", "false"]).optional().nullable(),
});

// GET notes with pagination, filtering and search
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse URL search params
    const url = new URL(request.url);

    // Validate and parse query parameters
    const queryParams = getNotesQuerySchema.safeParse({
      page: url.searchParams.get("page"),
      perPage: url.searchParams.get("perPage"),
      q: url.searchParams.get("q"),
      categoryId: url.searchParams.get("categoryId"),
      isPublic: url.searchParams.get("isPublic"),
      isPinned: url.searchParams.get("isPinned"),
    });

    if (!queryParams.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryParams.error },
        { status: 400 },
      );
    }

    const { page, perPage, q, categoryId, isPublic, isPinned } =
      queryParams.data;

    // Calculate pagination
    const skip = (page - 1) * perPage;

    // Build where clause for filtering
    const whereClause: any = {
      userId: session.user.id,
    };

    // Add search query if provided
    if (q) {
      whereClause.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
      ];
    }

    // Add category filter if provided
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Add public filter if provided
    if (isPublic) {
      whereClause.isPublic = isPublic === "true";
    }

    // Add pinned filter if provided
    if (isPinned) {
      whereClause.isPinned = isPinned === "true";
    }

    // Get total count for pagination
    const total = await db.note.count({
      where: whereClause,
    });

    // Get pinned notes
    const pinnedNotes = await db.note.findMany({
      where: {
        ...whereClause,
        isPinned: true,
      },
      orderBy: {
        updatedAt: "desc",
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

    // Get regular notes with pagination
    const notes = await db.note.findMany({
      where: {
        ...whereClause,
        isPinned: false,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: perPage,
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
      pinnedNotes,
      total,
      page,
      perPage,
      totalPages: Math.ceil((total - pinnedNotes.length) / perPage),
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 },
    );
  }
}

// POST to create a new note
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createNoteSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error },
        { status: 400 },
      );
    }

    // Create the note
    const note = await db.note.create({
      data: {
        ...validatedData.data,
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

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
}
