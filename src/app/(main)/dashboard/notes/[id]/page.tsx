"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Edit,
  Trash,
  Globe,
  Lock,
  Pin,
  PinOff,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  Calendar,
  Tag,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
};

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, y: 20 },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
};

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const [note, setNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPublicToggling, setIsPublicToggling] = useState(false);
  const [isPinToggling, setIsPinToggling] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function fetchNote() {
      setIsLoading(true);
      try {
        // Check if authenticated
        const sessionResponse = await fetch(
          `${window.location.origin}/api/auth/session`,
        );
        const sessionData = await sessionResponse.json();

        if (!sessionData.user) {
          router.push("/auth/signin");
          return;
        }

        // Fetch the note
        const response = await fetch(
          `${window.location.origin}/api/notes/${noteId}`,
        );

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Failed to load note");
          setIsLoading(false);
          return;
        }

        const noteData = await response.json();
        setNote(noteData);
      } catch (error) {
        console.error("Error fetching note:", error);
        setError("An error occurred while fetching the note");
      } finally {
        setIsLoading(false);
      }
    }

    fetchNote();
  }, [noteId, router]);

  // Handle note deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${window.location.origin}/api/notes/${noteId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete note");
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      setError("An error occurred while deleting the note");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Handle toggling public status
  const handleTogglePublic = async () => {
    setIsPublicToggling(true);
    try {
      const response = await fetch(
        `${window.location.origin}/api/notes/${noteId}/toggle-public`,
        {
          method: "PATCH",
        },
      );

      if (response.ok) {
        const updatedNote = await response.json();
        setNote(updatedNote);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to toggle visibility");
      }
    } catch (error) {
      console.error("Error toggling note visibility:", error);
      setError("An error occurred while updating the note");
    } finally {
      setIsPublicToggling(false);
    }
  };

  // Handle toggling pinned status
  const handleTogglePin = async () => {
    setIsPinToggling(true);
    try {
      const response = await fetch(
        `${window.location.origin}/api/notes/${noteId}/toggle-pinned`,
        {
          method: "PATCH",
        },
      );

      if (response.ok) {
        const updatedNote = await response.json();
        setNote(updatedNote);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to toggle pin status");
      }
    } catch (error) {
      console.error("Error toggling pin status:", error);
      setError("An error occurred while updating the note");
    } finally {
      setIsPinToggling(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/notes/${noteId}`);
    setIsCopied(true);
    toast.success("Link copied to clipboard");

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex max-w-5xl justify-center px-4 py-16">
        <div className="flex flex-col items-center">
          <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="text-destructive mb-6 h-16 w-16" />
          <h1 className="mb-2 text-2xl font-bold">Note Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error ||
              "The note you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={containerVariants}
    >
      <motion.div className="mb-6" variants={headerVariants}>
        <Link href="/dashboard">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>

      {/* Note header */}
      <motion.div
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        variants={headerVariants}
      >
        <div>
          <motion.h1
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
              delay: 0.1,
            }}
          >
            {note.title}
          </motion.h1>

          <motion.div
            className="text-muted-foreground mt-3 flex flex-wrap items-center gap-3 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={note.updatedAt}>
                {new Date(note.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>

            {note.category && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: note.category.color || "#94a3b8",
                    }}
                  />
                  <span>{note.category.name}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              {note.isPublic ? (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 px-2 py-0.5"
                >
                  <Globe className="h-3.5 w-3.5" /> Public
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 px-2 py-0.5"
                >
                  <Lock className="h-3.5 w-3.5" /> Private
                </Badge>
              )}
            </div>

            {note.isPinned && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-2 py-0.5"
              >
                <Pin className="h-3.5 w-3.5" /> Pinned
              </Badge>
            )}
          </motion.div>
        </div>

        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            delay: 0.2,
          }}
        >
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleTogglePublic}
            disabled={isPublicToggling}
          >
            {isPublicToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : note.isPublic ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            {note.isPublic ? "Make Private" : "Make Public"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleTogglePin}
            disabled={isPinToggling}
          >
            {isPinToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : note.isPinned ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
            {note.isPinned ? "Unpin" : "Pin"}
          </Button>

          <Link href={`/dashboard/notes/${noteId}/edit`}>
            <Button className="gap-1">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Note content */}
      <motion.div
        className="bg-card mb-8 overflow-hidden rounded-lg border shadow-sm"
        variants={fadeInVariants}
      >
        <div className="p-6">
          <motion.div
            className="prose prose-gray dark:prose-invert max-w-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="whitespace-pre-wrap">{note.content}</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Public note link */}
      <AnimatePresence>
        {note.isPublic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="text-primary h-5 w-5" />
                  Share this note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  This note is public. Anyone with the link below can view it:
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      readOnly
                      value={`${window.location.origin}/notes/${noteId}`}
                      className="bg-background pr-10 font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    variant="default"
                    className="shrink-0 gap-2 transition-all"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this note?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              note and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
