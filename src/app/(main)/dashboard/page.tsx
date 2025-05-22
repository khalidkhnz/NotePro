import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { FolderIcon, FilterIcon, Plus, PinIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Badge } from "~/components/ui/badge";

export const metadata: Metadata = {
  title: "Dashboard - Manage Your Notes",
  description: "View and manage your personal notes",
};

export default async function DashboardPage() {
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
    take: 4, // Only get a few for the dashboard
  });

  // Get user's pinned notes
  const pinnedNotes = await db.note.findMany({
    where: {
      userId: session.user.id,
      isPinned: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      category: true,
    },
  });

  // Get user's recent notes
  const recentNotes = await db.note.findMany({
    where: {
      userId: session.user.id,
      isPinned: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 6,
    include: {
      category: true,
    },
  });

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
        <h2 className="mb-4 text-xl font-semibold">Recent Notes</h2>
        {recentNotes.length === 0 && pinnedNotes.length === 0 ? (
          <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border py-12 text-center">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
                <Plus className="text-muted-foreground h-10 w-10" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">No notes yet</h2>
              <p className="text-muted-foreground mt-2 mb-6 text-center">
                You haven't created any notes yet. Start creating your first
                note.
              </p>
              <Link href="/dashboard/notes/new">
                <Button className="w-full gap-1 sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Create Your First Note
                </Button>
              </Link>
            </div>
          </div>
        ) : recentNotes.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center">
            No recent notes. All your notes are pinned.
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
      </div>
    </div>
  );
}
