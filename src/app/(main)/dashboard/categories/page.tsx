import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { CategoryCard } from "~/components/category-card";
import { CreateCategoryDialog } from "~/components/create-category-dialog";

export const metadata: Metadata = {
  title: "Categories - Organize Your Notes",
  description: "Manage and organize your note categories",
};

export default async function CategoriesPage() {
  const session = await auth();

  // Redirect to sign in if not logged in
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get user's categories
  const categories = await db.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          notes: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your notes by categories
          </p>
        </div>
        <CreateCategoryDialog userId={session.user.id} />
      </div>

      {categories.length === 0 ? (
        <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
              <Plus className="text-muted-foreground h-10 w-10" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No categories yet</h2>
            <p className="text-muted-foreground mt-2 mb-6 text-center">
              Create categories to organize your notes better.
            </p>
            <CreateCategoryDialog userId={session.user.id} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              noteCount={category._count.notes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
