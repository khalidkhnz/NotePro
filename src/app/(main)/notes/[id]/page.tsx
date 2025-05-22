import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const note = await db.note.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!note || !note.isPublic) {
    return {
      title: "Note Not Found",
      description: "The requested note could not be found.",
    };
  }

  return {
    title: `${note.title}`,
    description: note.content.substring(0, 160),
  };
}

export default async function PublicNotePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  // Get the note
  const note = await db.note.findUnique({
    where: {
      id: params.id,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  // Check if note exists and is public
  if (!note || !note.isPublic) {
    notFound();
  }

  const isOwner = session?.user?.id === note.userId;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href={isOwner ? "/dashboard" : "/notes/public"}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isOwner ? "Back to Dashboard" : "Back to Public Notes"}
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-3xl">
        <article className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="mb-4 text-3xl font-bold">{note.title}</h1>

          <div className="text-muted-foreground mb-8 flex flex-wrap items-center gap-2 text-sm sm:gap-4">
            <div>By {note.user.name || "Anonymous"}</div>
            <div className="hidden sm:block">•</div>
            <time dateTime={note.updatedAt.toISOString()}>
              {new Date(note.updatedAt).toLocaleDateString()}
            </time>
            {isOwner && (
              <>
                <div className="hidden sm:block">•</div>
                <div className="text-primary">You are the author</div>
              </>
            )}
          </div>

          <div className="leading-relaxed whitespace-pre-wrap">
            {note.content}
          </div>
        </article>

        {isOwner && (
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href={`/dashboard/notes/${params.id}/edit`}>
              <Button variant="outline">Edit Note</Button>
            </Link>
            <Link href={`/dashboard/notes/${params.id}`}>
              <Button>Manage Note</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
