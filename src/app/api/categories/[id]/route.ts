import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categoryId = params.id;

    // Verify category exists and belongs to the user
    const category = await db.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (category.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own categories" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsedBody = updateCategorySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    const { name, description, color } = parsedBody.data;

    // If name is being updated, check for duplicates
    if (name && name !== category.name) {
      const existingCategory = await db.category.findFirst({
        where: {
          name,
          userId: session.user.id,
          NOT: {
            id: categoryId,
          },
        },
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: "A category with this name already exists" },
          { status: 409 },
        );
      }
    }

    // Update the category
    const updatedCategory = await db.category.update({
      where: {
        id: categoryId,
      },
      data: {
        ...(name && { name }),
        description,
        color,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categoryId = params.id;

    // Verify category exists and belongs to the user
    const category = await db.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (category.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own categories" },
        { status: 403 },
      );
    }

    // Remove category from notes (set categoryId to null)
    await db.note.updateMany({
      where: {
        categoryId,
        userId: session.user.id,
      },
      data: {
        categoryId: null,
      },
    });

    // Delete the category
    await db.category.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
