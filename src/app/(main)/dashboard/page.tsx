"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { FolderIcon, FilterIcon, Plus, PinIcon, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Badge } from "~/components/ui/badge";
import { SearchInput } from "~/components/search-input";
import { Pagination } from "~/components/pagination";

// Constants for pagination
const ITEMS_PER_PAGE = 9; // Notes per page

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [notes, setNotes] = useState<any[]>([]);
  const [pinnedNotes, setPinnedNotes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalNotes, setTotalNotes] = useState(0);
  const [unpinnedCount, setUnpinnedCount] = useState(0);

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("q") || "";

  // Calculate pagination
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;
  const totalPages = Math.ceil(unpinnedCount / ITEMS_PER_PAGE);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // First check if user is authenticated
        const sessionResponse = await fetch(
          `${window.location.origin}/api/auth/session`,
        );
        const sessionData = await sessionResponse.json();

        if (!sessionData.user) {
          router.push("/auth/signin");
          return;
        }

        // Get categories
        const categoriesResponse = await fetch(
          `${window.location.origin}/api/categories`,
        );
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.slice(0, 4)); // Just get first 4

        // Build the notes API URL with search params
        const notesUrl = new URL(`${window.location.origin}/api/notes`);
        if (searchQuery) {
          notesUrl.searchParams.append("q", searchQuery);
        }
        notesUrl.searchParams.append("page", currentPage.toString());
        notesUrl.searchParams.append("perPage", ITEMS_PER_PAGE.toString());

        // Get notes
        const notesResponse = await fetch(notesUrl.toString());
        const notesData = await notesResponse.json();

        // Set state
        setTotalNotes(notesData.total || 0);
        setPinnedNotes(notesData.pinnedNotes || []);
        setNotes(notesData.notes || []);
        setUnpinnedCount(
          (notesData.total || 0) - (notesData.pinnedNotes || []).length,
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [searchQuery, currentPage, router]);

  return (
    <motion.div
      className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.div
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        variants={headerVariants}
      >
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal notes and ideas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/dashboard/categories">
              <Button variant="outline" className="gap-1">
                <FolderIcon className="h-4 w-4" />
                Categories
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/dashboard/notes/filter">
              <Button variant="outline" className="gap-1">
                <FilterIcon className="h-4 w-4" />
                Filter Notes
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/dashboard/notes/new">
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                New Note
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div className="mb-6" variants={fadeInVariants}>
        <SearchInput
          placeholder="Search notes..."
          className="w-full sm:max-w-md"
          defaultValue={searchQuery}
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.p
              className="text-muted-foreground mt-2 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              Showing results for "{searchQuery}"
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick access to categories */}
      <AnimatePresence>
        {categories.length > 0 && (
          <motion.div className="mb-8" variants={fadeInVariants}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Categories</h2>
              <Link
                href="/dashboard/categories"
                className="text-primary text-sm hover:underline"
              >
                View all
              </Link>
            </div>
            <motion.div
              className="flex flex-wrap gap-2"
              variants={containerVariants}
            >
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={`/dashboard/categories/${category.id}`}
                    className="hover:bg-muted inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors"
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: category.color || "#94a3b8" }}
                    />
                    {category.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/dashboard/categories"
                  className="hover:bg-muted inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  More
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned notes section */}
      <AnimatePresence>
        {pinnedNotes.length > 0 && (
          <motion.div className="mb-8" variants={fadeInVariants}>
            <div className="mb-4 flex items-center">
              <h2 className="text-xl font-semibold">Pinned Notes</h2>
              <PinIcon className="ml-2 h-4 w-4" />
            </div>
            <motion.div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
            >
              {pinnedNotes.map((note) => (
                <motion.div
                  key={note.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Link
                    href={`/dashboard/notes/${note.id}`}
                    className="hover:bg-muted/50 flex h-full flex-col space-y-2 rounded-lg border p-5 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="line-clamp-1 text-xl font-bold">
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {note.isPublic && (
                          <span className="text-foreground focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
                            Public
                          </span>
                        )}
                        <PinIcon className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-muted-foreground line-clamp-3 flex-grow">
                      {note.content}
                    </p>
                    <div className="text-muted-foreground flex items-center justify-between pt-2 text-xs">
                      {note.category && (
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: note.category.color || "#94a3b8",
                            }}
                          />
                          <span>{note.category.name}</span>
                        </div>
                      )}
                      <time dateTime={note.updatedAt}>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </time>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent notes section */}
      <motion.div variants={fadeInVariants}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Notes</h2>
          {notes.length > 0 && unpinnedCount > 0 && (
            <p className="text-muted-foreground text-sm">
              Showing {skip + 1}-{Math.min(skip + notes.length, unpinnedCount)}{" "}
              of {unpinnedCount} notes
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
            </motion.div>
          ) : totalNotes === 0 ? (
            <motion.div
              key="empty"
              variants={fadeInVariants}
              className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border py-12 text-center"
            >
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <motion.div
                  className="bg-muted flex h-20 w-20 items-center justify-center rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Plus className="text-muted-foreground h-10 w-10" />
                </motion.div>
                <motion.h2
                  className="mt-6 text-xl font-semibold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  No notes yet
                </motion.h2>
                <motion.p
                  className="text-muted-foreground mt-2 mb-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {searchQuery
                    ? `No notes found matching "${searchQuery}"`
                    : "You haven't created any notes yet. Start creating your first note."}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/dashboard/notes/new">
                    <Button className="w-full gap-1 sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Create Your First Note
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ) : notes.length === 0 && pinnedNotes.length > 0 ? (
            <motion.p
              key="all-pinned"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground py-4 text-center"
            >
              {searchQuery
                ? `No unpinned notes found matching "${searchQuery}"`
                : "No recent notes. All your notes are pinned."}
            </motion.p>
          ) : (
            <motion.div
              key="notes-grid"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
            >
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Link
                    href={`/dashboard/notes/${note.id}`}
                    className="hover:bg-muted/50 flex h-full flex-col space-y-2 rounded-lg border p-5 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="line-clamp-1 text-xl font-bold">
                        {note.title}
                      </h3>
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
                      {note.category && (
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: note.category.color || "#94a3b8",
                            }}
                          />
                          <span>{note.category.name}</span>
                        </div>
                      )}
                      <time dateTime={note.updatedAt}>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </time>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        <AnimatePresence>
          {notes.length > 0 && unpinnedCount > ITEMS_PER_PAGE && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Pagination
                totalItems={unpinnedCount}
                pageSize={ITEMS_PER_PAGE}
                currentPage={currentPage}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
