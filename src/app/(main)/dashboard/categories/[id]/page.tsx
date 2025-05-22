import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, FolderIcon, Plus, Pencil } from "lucide-react";

import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { SearchInput } from "~/components/search-input";
import { Pagination } from "~/components/pagination";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const category = await db.category.findUnique({
    where: { id: (await params).id },
  });

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `${category.name} - Notes`,
    description:
      category.description || `Notes in the ${category.name} category`,
  };
}

// Constants for pagination
const ITEMS_PER_PAGE = 12; // Notes per page

interface SearchParams {
  page?: string;
  q?: string;
}

export default async function CategoryNotesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  // Redirect to sign in if not logged in
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Parse search params
  const currentPage = Number((await searchParams).page) || 1;
  const searchQuery = (await searchParams).q || "";

  // Pagination offset
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get the category
  const category = await db.category.findUnique({
    where: {
      id: (await params).id,
    },
  });

  // Check if category exists and belongs to the user
  if (!category || category.userId !== session.user.id) {
    notFound();
  }

  // Base query for notes
  const whereClause = {
    userId: session.user.id,
    categoryId: (await params).id,
    ...(searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery } },
            { content: { contains: searchQuery } },
          ],
        }
      : {}),
  };

  // Count total notes for pagination
  const totalNotes = await db.note.count({
    where: whereClause,
  });

  // Get notes in this category with pagination
  const notes = await db.note.findMany({
    where: whereClause,
    orderBy: {
      updatedAt: "desc",
    },
    skip,
    take: ITEMS_PER_PAGE,
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/dashboard/categories">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: category.color || "#94a3b8" }}
          >
            <FolderIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground mt-1">
                {category.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/categories/edit?id=${category.id}`}>
            <Button variant="outline" className="gap-1">
              <Pencil className="h-4 w-4" />
              Edit Category
            </Button>
          </Link>
          <Link
            href={{
              pathname: "/dashboard/notes/new",
              query: { categoryId: category.id },
            }}
          >
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          placeholder={`Search in ${category.name}...`}
          className="w-full sm:max-w-md"
        />
        {searchQuery && (
          <p className="text-muted-foreground mt-2 text-sm">
            Showing results for "{searchQuery}" in {category.name}
          </p>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
              <Plus className="text-muted-foreground h-10 w-10" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">
              {searchQuery
                ? `No notes found matching "${searchQuery}"`
                : `No notes in this category`}
            </h2>
            <p className="text-muted-foreground mt-2 mb-6 text-center">
              {searchQuery
                ? "Try a different search term or create a new note."
                : `Create a new note in the ${category.name} category.`}
            </p>
            <Link
              href={{
                pathname: "/dashboard/notes/new",
                query: { categoryId: category.id },
              }}
            >
              <Button className="w-full gap-1 sm:w-auto">
                <Plus className="h-4 w-4" />
                Create Note
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Notes</h2>
            {totalNotes > 0 && (
              <p className="text-muted-foreground text-sm">
                Showing {skip + 1}-{Math.min(skip + notes.length, totalNotes)}{" "}
                of {totalNotes} notes
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/dashboard/notes/${note.id}`}
                className="hover:bg-muted/50 flex h-full flex-col space-y-2 rounded-lg border p-5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <h3 className="line-clamp-1 text-xl font-bold">
                    {note.title}
                  </h3>
                  {note.isPublic && (
                    <span className="text-foreground focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
                      Public
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-3 flex-grow">
                  {note.content}
                </p>
                <div className="text-muted-foreground flex items-center justify-between pt-2 text-xs">
                  <time dateTime={note.updatedAt.toISOString()}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </time>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalNotes > ITEMS_PER_PAGE && (
            <div className="mt-8">
              <Pagination
                totalItems={totalNotes}
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
