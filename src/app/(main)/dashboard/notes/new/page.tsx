import { redirect } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const metadata: Metadata = {
  title: "Create Note",
  description: "Create a new note",
};

type SearchParams = {
  categoryId?: string;
};

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  // Redirect to sign in if not logged in
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get category ID from search params if it exists
  const selectedCategoryId = (await searchParams).categoryId;

  // Verify if the category exists and belongs to the user
  let preselectedCategory = null;
  if (selectedCategoryId) {
    preselectedCategory = await db.category.findUnique({
      where: {
        id: selectedCategoryId,
        userId: session.user.id,
      },
    });
  }

  // Get user's categories
  const categories = await db.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  async function createNote(formData: FormData) {
    "use server";

    if (!session?.user?.id) {
      redirect("/auth/signin");
    }

    // Get form data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const isPublicValue = formData.get("isPublic");
    const isPinnedValue = formData.get("isPinned");
    const categoryId = formData.get("categoryId") as string;

    const isPublic = isPublicValue === "on";
    const isPinned = isPinnedValue === "on";

    try {
      // Create note directly in the database
      const note = await db.note.create({
        data: {
          title,
          content,
          isPublic,
          isPinned,
          userId: session.user.id,
          categoryId: categoryId === "none" ? null : categoryId || null,
        },
      });

      // Redirect to the note page with success parameter
      redirect(`/dashboard/notes/${note.id}?created=true`);
    } catch (error) {
      console.error("Error creating note:", error);
      redirect("/dashboard/notes/new?error=true");
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Create New Note</h1>
        <p className="text-muted-foreground mt-1">
          Capture your thoughts and ideas
        </p>
      </div>

      <Card className="mx-auto max-w-2xl shadow">
        <CardHeader>
          <h2 className="text-xl font-semibold">Note Details</h2>
        </CardHeader>
        <CardContent>
          <form action={createNote} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter note title"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your note here..."
                className="min-h-[300px] w-full resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                name="categoryId"
                defaultValue={
                  preselectedCategory ? preselectedCategory.id : "none"
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: category.color || "#94a3b8",
                          }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preselectedCategory && (
                <p className="text-muted-foreground text-xs">
                  Pre-selected category: {preselectedCategory.name}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-2">
                <Switch id="isPublic" name="isPublic" />
                <Label htmlFor="isPublic">Make this note public</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isPinned" name="isPinned" />
                <Label htmlFor="isPinned">Pin this note</Label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Create Note</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
