import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  FilePlus,
  FilterIcon,
  FolderIcon,
  Search,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { Pagination } from "~/components/pagination";

export const metadata: Metadata = {
  title: "Filter Notes",
  description: "Find notes by categories and other criteria",
};

// Constants for pagination
const ITEMS_PER_PAGE = 12; // Notes per page

type SearchParams = {
  category?: string | string[];
  q?: string;
  public?: string;
  pinned?: string;
  page?: string;
};

export default async function FilterNotesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  // Redirect to sign in if not logged in
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Parse search parameters
  const selectedCategoryIds =
    typeof (await searchParams).category === "string"
      ? [(await searchParams).category]
      : (await searchParams).category || [];

  const searchQuery = (await searchParams).q || "";
  const showPublic = (await searchParams).public === "true";
  const showPinned = (await searchParams).pinned === "true";
  const currentPage = Number((await searchParams).page) || 1;

  // Pagination offset
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get all user categories
  const categories = await db.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Construct the database query
  const where: any = {
    userId: session.user.id,
  };

  // Add category filter if selected
  if (selectedCategoryIds.length > 0) {
    where.categoryId = {
      in: selectedCategoryIds,
    };
  }

  // Add public filter if selected
  if (showPublic) {
    where.isPublic = true;
  }

  // Add pinned filter if selected
  if (showPinned) {
    where.isPinned = true;
  }

  // Add search query if provided
  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery } },
      { content: { contains: searchQuery } },
    ];
  }

  // Count total notes for pagination
  const totalNotes = await db.note.count({
    where,
  });

  // Get filtered notes with pagination
  const notes = await db.note.findMany({
    where,
    orderBy: {
      updatedAt: "desc",
    },
    skip,
    take: ITEMS_PER_PAGE,
    include: {
      category: true,
    },
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Filter Notes</h1>
        <p className="text-muted-foreground mt-1">
          Find specific notes using various criteria
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-6">
            <form className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium">Search</h3>
                <div className="flex w-full items-center space-x-2">
                  <Input
                    type="text"
                    name="q"
                    placeholder="Search notes..."
                    defaultValue={searchQuery}
                    className="w-full"
                  />
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`category-${category.id}`}
                        name="category"
                        value={category.id}
                        defaultChecked={selectedCategoryIds.includes(
                          category.id,
                        )}
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="flex items-center gap-2 text-sm font-normal"
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: category.color || "#94a3b8",
                          }}
                        />
                        {category.name}
                      </Label>
                    </div>
                  ))}

                  {categories.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      No categories created yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="mb-2 text-lg font-medium">Status</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-public"
                    name="public"
                    value="true"
                    defaultChecked={showPublic}
                  />
                  <Label
                    htmlFor="filter-public"
                    className="text-sm font-normal"
                  >
                    Public notes only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-pinned"
                    name="pinned"
                    value="true"
                    defaultChecked={showPinned}
                  />
                  <Label
                    htmlFor="filter-pinned"
                    className="text-sm font-normal"
                  >
                    Pinned notes only
                  </Label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full gap-1">
                  <FilterIcon className="h-4 w-4" />
                  Apply Filters
                </Button>
                <Link href="/dashboard/notes/filter">
                  <Button variant="outline" className="w-full" type="button">
                    Clear Filters
                  </Button>
                </Link>
              </div>

              {/* Hidden input to preserve current page */}
              <input type="hidden" name="page" value="1" />
            </form>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {totalNotes} {totalNotes === 1 ? "note" : "notes"} found
            </h2>
            <Link href="/dashboard/notes/new">
              <Button className="gap-1">
                <FilePlus className="h-4 w-4" />
                New Note
              </Button>
            </Link>
          </div>

          {notes.length === 0 ? (
            <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border py-12 text-center">
              <div className="mx-auto max-w-[420px] text-center">
                <h2 className="mt-6 text-xl font-semibold">No notes found</h2>
                <p className="text-muted-foreground mt-2 mb-6 text-center">
                  Try adjusting your filters or create a new note.
                </p>
                <Link href="/dashboard/notes/new">
                  <Button className="gap-1">
                    <FilePlus className="h-4 w-4" />
                    Create New Note
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                      <div className="flex gap-1">
                        {note.isPinned && (
                          <Badge variant="secondary">Pinned</Badge>
                        )}
                        {note.isPublic && (
                          <Badge variant="outline">Public</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground line-clamp-3 flex-grow">
                      {note.content}
                    </p>
                    <div className="text-muted-foreground flex items-center justify-between pt-2 text-xs">
                      {note.category && (
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: note.category.color || "#94a3b8",
                            }}
                          />
                          <span>{note.category.name}</span>
                        </div>
                      )}
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
      </div>
    </div>
  );
}
