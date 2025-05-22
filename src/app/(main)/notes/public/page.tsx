import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Public Notes",
  description: "Browse public notes shared by the community",
};

export default async function PublicNotesPage() {
  const session = await auth();

  // Get all public notes
  const publicNotes = await db.note.findMany({
    where: {
      isPublic: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Public Notes</h1>
        <p className="text-muted-foreground mt-1">
          Browse notes shared by the community
        </p>
      </div>

      {publicNotes.length === 0 ? (
        <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
              <BookOpen className="text-muted-foreground h-10 w-10" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No public notes yet</h2>
            <p className="text-muted-foreground mt-2 mb-6 text-center">
              There are no public notes available at the moment.
              {session?.user &&
                " Create a note and make it public to share with others."}
            </p>
            {session?.user && (
              <Link href="/dashboard/notes/new">
                <Button>Create a Note</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publicNotes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="hover:bg-muted/50 flex h-full flex-col space-y-2 rounded-lg border p-5 transition-colors"
            >
              <h3 className="line-clamp-1 text-xl font-bold">{note.title}</h3>
              <p className="text-muted-foreground line-clamp-3 flex-grow">
                {note.content}
              </p>
              <div className="text-muted-foreground flex items-center justify-between pt-2 text-xs">
                <div>By {note.user.name || "Anonymous"}</div>
                <time dateTime={note.updatedAt.toISOString()}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
