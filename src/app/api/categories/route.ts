import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  color: z.string().nullable(),
  userId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedBody = createCategorySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    const { name, description, color, userId } = parsedBody.data;

    // Verify user is creating a category for themselves
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only create categories for yourself" },
        { status: 403 },
      );
    }

    // Check if category already exists for this user
    const existingCategory = await db.category.findFirst({
      where: {
        name,
        userId,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 },
      );
    }

    // Create the category
    const category = await db.category.create({
      data: {
        name,
        description,
        color,
        userId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
