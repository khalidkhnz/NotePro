"use client";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        "Update Note"
      )}
    </Button>
  );
}

function EditNoteForm({
  updateNote,
  note,
  categories,
}: {
  updateNote: (formData: FormData) => void;
  note: any;
  categories: any[];
}) {
  return (
    <form action={updateNote} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base">
          Title
        </Label>
        <Input
          id="title"
          name="title"
          defaultValue={note.title}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-base">
          Content
        </Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={note.content}
          className="min-h-[300px] w-full resize-y"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId" className="text-base">
          Category
        </Label>
        <Select name="categoryId" defaultValue={note.categoryId || "none"}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
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
      </div>

      <div className="space-y-4 sm:flex sm:items-center sm:justify-start sm:space-y-0 sm:space-x-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="isPublic"
            name="isPublic"
            defaultChecked={note.isPublic}
          />
          <Label htmlFor="isPublic" className="font-medium">
            Make this note public
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isPinned"
            name="isPinned"
            defaultChecked={note.isPinned}
          />
          <Label htmlFor="isPinned" className="font-medium">
            Pin this note
          </Label>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-4">
        <Link href={`/dashboard/notes/${note.id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}

export default function EditNotePage() {
  const [note, setNote] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Extract note ID from the URL path
    const path = window.location.pathname;
    const noteId = path.split("/").filter(Boolean).pop();

    // Check for URL parameters
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    setHasError(error === "true");

    // Fetch note and categories
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch the note
        const noteResponse = await fetch(`/api/notes/${noteId}`);
        if (!noteResponse.ok) {
          setNotFound(true);
          return;
        }

        const noteData = await noteResponse.json();
        setNote(noteData);

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  async function updateNote(formData: FormData) {
    if (!note) return;

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const isPublicValue = formData.get("isPublic");
    const isPinnedValue = formData.get("isPinned");
    const categoryId = formData.get("categoryId") as string;

    const isPublic = isPublicValue === "on";
    const isPinned = isPinnedValue === "on";

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          isPublic,
          isPinned,
          categoryId: categoryId === "none" ? null : categoryId || null,
        }),
      });

      if (response.ok) {
        window.location.href = `/dashboard/notes/${note.id}?updated=true`;
      } else {
        window.location.href = `/dashboard/notes/${note.id}/edit?error=true`;
      }
    } catch (error) {
      console.error("Error updating note:", error);
      window.location.href = `/dashboard/notes/${note.id}/edit?error=true`;
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center">
          <Loader2 className="text-primary mb-4 h-10 w-10 animate-spin" />
          <p className="text-muted-foreground">Loading note...</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (notFound || !note) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="py-16 text-center">
          <h1 className="mb-4 text-3xl font-bold">Note Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The note you're looking for doesn't exist or you don't have
            permission to edit it.
          </p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8">
        <Link href={`/dashboard/notes/${note.id}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Note
          </Button>
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Edit Note</h1>
        <p className="text-muted-foreground mt-1">Make changes to your note</p>
      </div>

      {hasError && (
        <div className="bg-destructive/10 text-destructive mb-6 flex items-center gap-2 rounded-lg p-4">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">
            Something went wrong while updating your note. Please try again.
          </p>
        </div>
      )}

      <div className="bg-card overflow-hidden rounded-lg border shadow-sm">
        <div className="bg-muted/40 border-b px-6 py-4">
          <h2 className="text-lg font-medium">Note Details</h2>
        </div>

        <div className="p-6">
          <EditNoteForm
            updateNote={updateNote}
            note={note}
            categories={categories}
          />
        </div>
      </div>
    </div>
  );
}
