"use client";

import Link from "next/link";
import { FolderIcon, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
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
import { Badge } from "~/components/ui/badge";
import { EditCategoryDialog } from "~/components/edit-category-dialog";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
  };
  noteCount: number;
}

export function CategoryCard({ category, noteCount }: CategoryCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const deleteCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      toast.success("Category deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  const categoryColor = category.color || "#94a3b8"; // Default slate color

  return (
    <div className="hover:bg-muted/50 flex flex-col space-y-2 rounded-lg border p-5 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: categoryColor }}
          >
            <FolderIcon className="h-4 w-4 text-white" />
          </div>
          <h3 className="line-clamp-1 text-xl font-bold">{category.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive h-8 w-8"
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the category. Notes in this category will not
                  be deleted but will no longer be categorized.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteCategory}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {category.description && (
        <p className="text-muted-foreground line-clamp-2">
          {category.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4">
        <Badge variant="outline">
          {noteCount} {noteCount === 1 ? "note" : "notes"}
        </Badge>
        <Link href={`/dashboard/categories/${category.id}`}>
          <Button variant="outline" size="sm">
            View Notes
          </Button>
        </Link>
      </div>

      {isEditOpen && (
        <EditCategoryDialog
          category={category}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </div>
  );
}
