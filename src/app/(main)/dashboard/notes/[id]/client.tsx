"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

export default function NotePageClient({
  note,
  userId,
}: {
  note: {
    id: string;
    title: string;
    content: string;
    isPublic: boolean;
    updatedAt: Date;
    category?: {
      id: string;
      name: string;
      color: string | null;
    } | null;
  };
  userId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Show toast if note was created or updated
    if (searchParams?.get("created") === "true") {
      toast.success("Note created successfully!");
    }

    if (searchParams?.get("updated") === "true") {
      toast.success("Note updated successfully!");
    }
  }, [searchParams]);

  const togglePublic = async () => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: !note.isPublic }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle note visibility");
      }

      const updatedNote = await response.json();
      toast.success(
        updatedNote.isPublic ? "Note is now public" : "Note is now private",
      );
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  const deleteNote = async () => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      toast.success("Note deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h1 className="pr-4 text-3xl font-bold break-words">
              {note.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={note.isPublic}
                  onCheckedChange={togglePublic}
                />
                <label htmlFor="isPublic" className="text-sm whitespace-nowrap">
                  {note.isPublic ? "Public" : "Private"}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/notes/${note.id}/edit`}>
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your note.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteNote}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          <div className="text-muted-foreground flex items-center text-sm">
            {note.category && (
              <div className="mr-4 flex items-center gap-1">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: note.category.color || "#94a3b8",
                  }}
                />
                <span>{note.category.name}</span>
              </div>
            )}
            <time dateTime={note.updatedAt.toISOString()}>
              Last updated on {new Date(note.updatedAt).toLocaleDateString()}
            </time>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div
              className="ql-editor"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </div>

          {note.isPublic && (
            <div className="border-t pt-6">
              <h2 className="mb-2 text-lg font-semibold">Share Your Note</h2>
              <p className="text-muted-foreground mb-3">
                This note is public. Share the link below:
              </p>
              <div className="bg-muted flex flex-col items-center justify-between gap-3 rounded-md p-3 sm:flex-row">
                <code className="text-sm break-all">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/notes/${note.id}`
                    : `/notes/${note.id}`}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/notes/${note.id}`,
                    );
                    toast.success("Link copied to clipboard");
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
