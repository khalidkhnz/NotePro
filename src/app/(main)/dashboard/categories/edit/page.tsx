"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ColorPicker } from "~/components/color-picker";

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#94a3b8");

  // Fetch category details
  useEffect(() => {
    if (!categoryId) {
      router.push("/dashboard/categories");
      return;
    }

    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${categoryId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch category");
        }

        const data = await response.json();
        setCategory(data);
        setName(data.name);
        setDescription(data.description || "");
        setColor(data.color || "#94a3b8");
      } catch (error) {
        console.error("Error fetching category:", error);
        toast.error("Could not load category details");
        router.push("/dashboard/categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || null,
          color,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      toast.success("Category updated successfully");
      router.push("/dashboard/categories");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this category? Notes in this category will no longer be categorized.",
      )
    ) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      toast.success("Category deleted successfully");
      router.push("/dashboard/categories");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <p>Loading category details...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold">Category not found</h2>
          <p className="text-muted-foreground mt-2">
            The requested category could not be found.
          </p>
          <Link href="/dashboard/categories" className="mt-4">
            <Button>Back to Categories</Button>
          </Link>
        </div>
      </div>
    );
  }

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

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Category</h1>
        <p className="text-muted-foreground mt-1">
          Update the details of your category
        </p>
      </div>

      <Card className="mx-auto max-w-2xl shadow">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description for this category"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <ColorPicker color={color} onChange={setColor} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              Delete Category
            </Button>
            <div className="flex gap-2">
              <Link href="/dashboard/categories">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
