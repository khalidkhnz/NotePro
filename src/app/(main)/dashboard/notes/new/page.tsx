"use client";

import { redirect } from "next/navigation";
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
          Creating...
        </>
      ) : (
        "Create Note"
      )}
    </Button>
  );
}

function NoteForm({
  createNote,
  categories,
  preselectedCategory,
}: {
  createNote: (formData: FormData) => void;
  categories: any[];
  preselectedCategory: any | null;
}) {
  return (
    <form action={createNote} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base">
          Title
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter note title"
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
          placeholder="Write your note here..."
          className="min-h-[300px] w-full resize-y"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId" className="text-base">
          Category
        </Label>
        <Select
          name="categoryId"
          defaultValue={preselectedCategory ? preselectedCategory.id : "none"}
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
        {preselectedCategory && (
          <p className="text-muted-foreground text-xs">
            Pre-selected category: {preselectedCategory.name}
          </p>
        )}
      </div>

      <div className="space-y-4 sm:flex sm:items-center sm:justify-start sm:space-y-0 sm:space-x-6">
        <div className="flex items-center space-x-2">
          <Switch id="isPublic" name="isPublic" />
          <Label htmlFor="isPublic" className="font-medium">
            Make this note public
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="isPinned" name="isPinned" />
          <Label htmlFor="isPinned" className="font-medium">
            Pin this note
          </Label>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

export default function NewNotePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [preselectedCategory, setPreselectedCategory] = useState<any | null>(
    null,
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check for URL parameters
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("categoryId");
    const error = params.get("error");

    setHasError(error === "true");

    // Fetch categories and preselected category if needed
    async function fetchData() {
      try {
        // Fetch all categories
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Fetch preselected category if categoryId exists
        if (categoryId) {
          const categoryResponse = await fetch(`/api/categories/${categoryId}`);
          if (categoryResponse.ok) {
            const categoryData = await categoryResponse.json();
            setPreselectedCategory(categoryData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  async function createNote(formData: FormData) {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const isPublicValue = formData.get("isPublic");
    const isPinnedValue = formData.get("isPinned");
    const categoryId = formData.get("categoryId") as string;

    const isPublic = isPublicValue === "on";
    const isPinned = isPinnedValue === "on";

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
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
        const data = await response.json();
        window.location.href = `/dashboard/notes/${data.id}?created=true`;
      } else {
        window.location.href = "/dashboard/notes/new?error=true";
      }
    } catch (error) {
      console.error("Error creating note:", error);
      window.location.href = "/dashboard/notes/new?error=true";
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
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

      {hasError && (
        <div className="bg-destructive/10 text-destructive mb-6 flex items-center gap-2 rounded-lg p-4">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">
            Something went wrong while creating your note. Please try again.
          </p>
        </div>
      )}

      <div className="bg-card overflow-hidden rounded-lg border shadow-sm">
        <div className="bg-muted/40 border-b px-6 py-4">
          <h2 className="text-lg font-medium">Note Details</h2>
        </div>

        <div className="p-6">
          <NoteForm
            createNote={createNote}
            categories={categories}
            preselectedCategory={preselectedCategory}
          />
        </div>
      </div>
    </div>
  );
}
