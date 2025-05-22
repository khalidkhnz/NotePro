import Link from "next/link";
import type { Metadata } from "next";
import { Globe } from "lucide-react";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { SearchInput } from "~/components/search-input";
import { Pagination } from "~/components/pagination";

export const metadata: Metadata = {
  title: "Public Notes",
  description: "Browse public notes shared by the community",
};

// Constants for pagination
const ITEMS_PER_PAGE = 12; // Notes per page

interface SearchParams {
  page?: string;
  q?: string;
}

export default async function PublicNotesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  // Parse search params
  const currentPage = Number(searchParams.page) || 1;
  const searchQuery = searchParams.q || "";

  // Pagination offset
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build query
  const whereClause = {
    isPublic: true,
    ...(searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery } },
            { content: { contains: searchQuery } },
          ],
        }
      : {}),
  };

  // Count total public notes for pagination
  const totalNotes = await db.note.count({
    where: whereClause,
  });

  // Get public notes with pagination
  const publicNotes = await db.note.findMany({
    where: whereClause,
    orderBy: {
      updatedAt: "desc",
    },
    skip,
    take: ITEMS_PER_PAGE,
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      category: true,
    },
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Public Notes</h1>
          <Globe className="text-muted-foreground h-6 w-6" />
        </div>
        <p className="text-muted-foreground mt-1">
          Discover notes shared by the community
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          placeholder="Search public notes..."
          className="w-full sm:max-w-md"
        />
        {searchQuery && (
          <p className="text-muted-foreground mt-2 text-sm">
            Showing public notes matching "{searchQuery}"
          </p>
        )}
      </div>

      {publicNotes.length === 0 ? (
        <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <div className="mx-auto max-w-[420px] text-center">
            <div className="bg-muted mx-auto flex h-20 w-20 items-center justify-center rounded-full">
              <Globe className="text-muted-foreground h-10 w-10" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">
              No public notes found
            </h2>
            <p className="text-muted-foreground mt-2 mb-6 text-center">
              {searchQuery
                ? `No public notes matching "${searchQuery}"`
                : "There are no public notes to display at the moment."}
            </p>
            {session?.user && (
              <Link href="/dashboard/notes/new">
                <button className="bg-primary hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
                  Create and share a note
                </button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shared Notes</h2>
            <p className="text-muted-foreground text-sm">
              Showing {skip + 1}-
              {Math.min(skip + publicNotes.length, totalNotes)} of {totalNotes}{" "}
              notes
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publicNotes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="hover:bg-muted/50 flex h-full flex-col space-y-2 rounded-lg border p-5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <h3 className="line-clamp-1 text-xl font-bold">
                    {note.title}
                  </h3>
                </div>
                <p className="text-muted-foreground line-clamp-3 flex-grow">
                  {note.content}
                </p>
                <div className="text-muted-foreground flex items-center justify-between pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    {note.user?.image ? (
                      <img
                        src={note.user.image}
                        alt={note.user.name || "User"}
                        className="h-5 w-5 rounded-full"
                      />
                    ) : (
                      <div className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                        {note.user?.name?.[0] || "U"}
                      </div>
                    )}
                    <span>{note.user?.name || "Anonymous"}</span>
                    {note.category && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: note.category.color || "#94a3b8",
                            }}
                          />
                          <span>{note.category.name}</span>
                        </div>
                      </>
                    )}
                  </div>
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
