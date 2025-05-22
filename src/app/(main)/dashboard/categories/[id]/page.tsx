import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, FolderIcon, Plus, Pencil } from "lucide-react";

import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const category = await db.category.findUnique({
    where: { id: params.id },
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

export default async function CategoryNotesPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  // Redirect to sign in if not logged in
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get the category
  const category = await db.category.findUnique({
    where: {
      id: params.id,
    },
  });

  // Check if category exists and belongs to the user
  if (!category || category.userId !== session.user.id) {
    notFound();
  }

  // Get notes in this category
  const notes = await db.note.findMany({
    where: {
      userId: session.user.id,
      categoryId: params.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
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

      {notes.length === 0 ? (
        <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
              <Plus className="text-muted-foreground h-10 w-10" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">
              No notes in this category
            </h2>
            <p className="text-muted-foreground mt-2 mb-6 text-center">
              Create a new note in the {category.name} category.
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
              <div className="text-muted-foreground flex items-center justify-between pt-2 text-xs">
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
