import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import NotePageClient from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const note = await db.note.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!note) {
    return {
      title: "Note Not Found",
      description: "The requested note could not be found.",
    };
  }

  return {
    title: `${note.title} - NotePro`,
    description: note.content.substring(0, 160),
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  // Redirect to sign in if not logged in
  if (!session?.user) {
    return notFound();
  }

  // Await params before using
  const resolvedParams = await params;

  // Get the note with category
  const note = await db.note.findUnique({
    where: {
      id: resolvedParams.id,
    },
    include: {
      category: true,
    },
  });

  // Check if note exists and belongs to the user
  if (!note || note.userId !== session.user.id) {
    return notFound();
  }

  return <NotePageClient note={note} userId={session.user.id} />;
}
