import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import NotePageClient from "./client";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const note = await db.note.findUnique({
    where: { id: params.id },
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

export default async function NotePage({ params }: { params: { id: string } }) {
  const session = await auth();

  // Redirect to sign in if not logged in
  if (!session?.user) {
    return notFound();
  }

  // Get the note
  const note = await db.note.findUnique({
    where: {
      id: params.id,
    },
  });

  // Check if note exists and belongs to the user
  if (!note || note.userId !== session.user.id) {
    return notFound();
  }

  return <NotePageClient note={note} userId={session.user.id} />;
}
