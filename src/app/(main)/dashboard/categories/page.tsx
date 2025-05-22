import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Search } from "lucide-react";

import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { CategoryCard } from "~/components/category-card";
import { CreateCategoryDialog } from "~/components/create-category-dialog";
import { SearchInput } from "~/components/search-input";
import { Pagination } from "~/components/pagination";

export const metadata: Metadata = {
  title: "Categories - Organize Your Notes",
  description: "Manage and organize your note categories",
};

// Constants for pagination
const ITEMS_PER_PAGE = 15; // Categories per page

interface SearchParams {
  page?: string;
  q?: string;
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  // Redirect to sign in if not logged in
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Parse search params
  const currentPage = Number(searchParams.page) || 1;
  const searchQuery = searchParams.q || "";

  // Pagination offset
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build query
  const whereClause = {
    userId: session.user.id,
    ...(searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery } },
            { description: { contains: searchQuery } },
          ],
        }
      : {}),
  };

  // Count total categories for pagination
  const totalCategories = await db.category.count({
    where: whereClause,
  });

  // Get user's categories with pagination
  const categories = await db.category.findMany({
    where: whereClause,
    orderBy: {
      name: "asc",
    },
    skip,
    take: ITEMS_PER_PAGE,
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

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          placeholder="Search categories..."
          className="w-full sm:max-w-md"
        />
        {searchQuery && (
          <p className="text-muted-foreground mt-2 text-sm">
            Showing categories matching "{searchQuery}"
          </p>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
              <Plus className="text-muted-foreground h-10 w-10" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">
              {searchQuery
                ? `No categories found matching "${searchQuery}"`
                : "No categories yet"}
            </h2>
            <p className="text-muted-foreground mt-2 mb-6 text-center">
              {searchQuery
                ? "Try a different search term or create a new category."
                : "Create categories to organize your notes better."}
            </p>
            <CreateCategoryDialog userId={session.user.id} />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Categories</h2>
            {totalCategories > 0 && (
              <p className="text-muted-foreground text-sm">
                Showing {skip + 1}-
                {Math.min(skip + categories.length, totalCategories)} of{" "}
                {totalCategories} categories
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                noteCount={category._count.notes}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalCategories > ITEMS_PER_PAGE && (
            <div className="mt-8">
              <Pagination
                totalItems={totalCategories}
                pageSize={ITEMS_PER_PAGE}
                currentPage={currentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
