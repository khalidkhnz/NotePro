import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { FolderIcon, FilterIcon, Plus, PinIcon, Search } from "lucide-react";

import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Badge } from "~/components/ui/badge";
import { SearchInput } from "~/components/search-input";
import { Pagination } from "~/components/pagination";

export const metadata: Metadata = {
  title: "Dashboard - Manage Your Notes",
  description: "View and manage your personal notes",
};

// Constants for pagination
const ITEMS_PER_PAGE = 9; // Notes per page

interface SearchParams {
  page?: string;
  q?: string;
}

export default async function DashboardPage({
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

  // Get user's categories
  const categories = await db.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: "asc",
    },
    take: 4, // Only get a few for the dashboard
  });

  // Base query for notes
  const whereClause = {
    userId: session.user.id,
    ...(searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery } },
            { content: { contains: searchQuery } },
          ],
        }
      : {}),
  };

  // Get total count for pagination
  const totalNotes = await db.note.count({
    where: whereClause,
  });

  // Get user's pinned notes
  const pinnedNotes = await db.note.findMany({
    where: {
      ...whereClause,
      isPinned: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      category: true,
    },
  });

  // Get user's recent notes with pagination
  const recentNotes = await db.note.findMany({
    where: {
      ...whereClause,
      isPinned: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
    skip,
    take: ITEMS_PER_PAGE,
    include: {
      category: true,
    },
  });

  // Calculate total pages for pagination
  const unpinnedCount = totalNotes - pinnedNotes.length;
  const totalPages = Math.ceil(unpinnedCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal notes and ideas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/categories">
            <Button variant="outline" className="gap-1">
              <FolderIcon className="h-4 w-4" />
              Categories
            </Button>
          </Link>
          <Link href="/dashboard/notes/filter">
            <Button variant="outline" className="gap-1">
              <FilterIcon className="h-4 w-4" />
              Filter Notes
            </Button>
          </Link>
          <Link href="/dashboard/notes/new">
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
          placeholder="Search notes..."
          className="w-full sm:max-w-md"
        />
        {searchQuery && (
          <p className="text-muted-foreground mt-2 text-sm">
            Showing results for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Quick access to categories */}
      {categories.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Categories</h2>
            <Link
              href="/dashboard/categories"
              className="text-primary text-sm hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/dashboard/categories/${category.id}`}
                className="hover:bg-muted inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors"
              >
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: category.color || "#94a3b8" }}
                />
                {category.name}
              </Link>
            ))}
            <Link
              href="/dashboard/categories"
              className="hover:bg-muted inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors"
            >
              <Plus className="h-3 w-3" />
              More
            </Link>
          </div>
        </div>
      )}

      {/* Pinned notes section */}
      {pinnedNotes.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center">
            <h2 className="text-xl font-semibold">Pinned Notes</h2>
            <PinIcon className="ml-2 h-4 w-4" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pinnedNotes.map((note) => (
              <Link
                key={note.id}
                href={`/dashboard/notes/${note.id}`}
                className="hover:bg-muted/50 flex h-full flex-col space-y-2 rounded-lg border p-5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <h3 className="line-clamp-1 text-xl font-bold">
                    {note.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {note.isPublic && (
                      <span className="text-foreground focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
                        Public
                      </span>
                    )}
                    <PinIcon className="h-4 w-4" />
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
        </div>
      )}

      {/* Recent notes section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Notes</h2>
          {recentNotes.length > 0 && unpinnedCount > 0 && (
            <p className="text-muted-foreground text-sm">
              Showing {skip + 1}-
              {Math.min(skip + recentNotes.length, unpinnedCount)} of{" "}
              {unpinnedCount} notes
            </p>
          )}
        </div>

        {totalNotes === 0 ? (
          <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border py-12 text-center">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
                <Plus className="text-muted-foreground h-10 w-10" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">No notes yet</h2>
              <p className="text-muted-foreground mt-2 mb-6 text-center">
                {searchQuery
                  ? `No notes found matching "${searchQuery}"`
                  : "You haven't created any notes yet. Start creating your first note."}
              </p>
              <Link href="/dashboard/notes/new">
                <Button className="w-full gap-1 sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Create Your First Note
                </Button>
              </Link>
            </div>
          </div>
        ) : recentNotes.length === 0 && pinnedNotes.length > 0 ? (
          <p className="text-muted-foreground py-4 text-center">
            {searchQuery
              ? `No unpinned notes found matching "${searchQuery}"`
              : "No recent notes. All your notes are pinned."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentNotes.map((note) => (
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
        )}

        {/* Pagination */}
        {recentNotes.length > 0 && unpinnedCount > ITEMS_PER_PAGE && (
          <div className="mt-8">
            <Pagination
              totalItems={unpinnedCount}
              pageSize={ITEMS_PER_PAGE}
              currentPage={currentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
