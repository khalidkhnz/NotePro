import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

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

  // Get user's notes directly from the database
  const notes = await db.note.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
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
        <Link href="/dashboard/notes/new">
          <Button className="w-full gap-1 sm:w-auto">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
              <Plus className="text-muted-foreground h-10 w-10" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No notes yet</h2>
            <p className="text-muted-foreground mt-2 mb-6 text-center">
              You haven't created any notes yet. Start creating your first note.
            </p>
            <Link href="/dashboard/notes/new">
              <Button className="w-full gap-1 sm:w-auto">
                <Plus className="h-4 w-4" />
                Create Your First Note
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/dashboard/notes/${note.id}`}
              className="hover:bg-muted/50 flex h-full flex-col space-y-2 rounded-lg border p-5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <h3 className="line-clamp-1 text-xl font-bold">{note.title}</h3>
                {note.isPublic && (
                  <span className="text-foreground focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
                    Public
                  </span>
                )}
              </div>
              <p className="text-muted-foreground line-clamp-3 flex-grow">
                {note.content}
              </p>
              <div className="text-muted-foreground flex items-center pt-2 text-xs">
                <time dateTime={note.updatedAt.toISOString()}>
                  Last updated {new Date(note.updatedAt).toLocaleDateString()}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
