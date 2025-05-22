import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

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
    title: `Edit: ${note.title}`,
    description: `Edit your note: ${note.title}`,
  };
}

export default async function EditNotePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  // Redirect to sign in if not logged in
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get the note
  const note = await db.note.findUnique({
    where: {
      id: params.id,
    },
  });

  // Check if note exists and belongs to the user
  if (!note || note.userId !== session.user.id) {
    notFound();
  }

  async function updateNote(formData: FormData) {
    "use server";

    if (!session?.user?.id) {
      redirect("/auth/signin");
    }

    // Get form data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const isPublicValue = formData.get("isPublic");
    const isPublic = isPublicValue === "on";

    // Check if note exists and belongs to the user
    const noteToUpdate = await db.note.findUnique({
      where: { id: params.id },
    });

    if (!noteToUpdate || noteToUpdate.userId !== session.user.id) {
      notFound();
    }

    try {
      // Update the note
      await db.note.update({
        where: { id: params.id },
        data: {
          title,
          content,
          isPublic,
        },
      });

      // Redirect to note page with success parameter
      redirect(`/dashboard/notes/${params.id}?updated=true`);
    } catch (error) {
      console.error("Error updating note:", error);
      redirect(`/dashboard/notes/${params.id}/edit?error=true`);
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href={`/dashboard/notes/${params.id}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Note
          </Button>
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Edit Note</h1>
        <p className="text-muted-foreground mt-1">Make changes to your note</p>
      </div>

      <Card className="mx-auto max-w-2xl shadow">
        <CardHeader>
          <h2 className="text-xl font-semibold">Note Details</h2>
        </CardHeader>
        <CardContent>
          <form action={updateNote} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={note.title}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                defaultValue={note.content}
                className="min-h-[300px] w-full resize-none"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                name="isPublic"
                defaultChecked={note.isPublic}
              />
              <Label htmlFor="isPublic">Make this note public</Label>
            </div>

            <div className="flex flex-wrap justify-end gap-4">
              <Link href={`/dashboard/notes/${params.id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">Update Note</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
