import Link from "next/link";
import { ArrowRight, BookOpen, Lock, Share2 } from "lucide-react";
import type { Note } from "@prisma/client";

import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Home() {
  const session = await auth();
  const publicNotes = await api.note.getAllPublic();

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Your thoughts, organized and accessible.
                </h1>
                <p className="text-muted-foreground max-w-[600px] md:text-xl">
                  NotePro helps you capture ideas, organize thoughts, and share
                  knowledge with the world.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href={session ? "/dashboard" : "/auth/signup"}>
                  <Button size="lg" className="w-full">
                    {session ? "Go to Dashboard" : "Get Started"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!session && (
                  <Link href="/auth/signin">
                    <Button size="lg" variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="bg-background relative w-full max-w-[500px] overflow-hidden rounded-lg border p-2 shadow-xl">
                <div className="space-y-4 p-4">
                  <div className="bg-muted h-5 w-1/2 animate-pulse rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="bg-muted h-4 animate-pulse rounded-lg"></div>
                    <div className="bg-muted h-4 animate-pulse rounded-lg"></div>
                    <div className="bg-muted h-4 w-3/4 animate-pulse rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Features
              </h2>
              <p className="text-muted-foreground max-w-[900px] md:text-xl">
                Everything you need to organize your thoughts and share your
                ideas.
              </p>
            </div>
          </div>
          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="bg-primary/10 rounded-full p-3">
                <BookOpen className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Capture Ideas</h3>
              <p className="text-muted-foreground text-center">
                Quickly jot down your thoughts and ideas before they slip away.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Lock className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Private Notes</h3>
              <p className="text-muted-foreground text-center">
                Keep your personal notes secure and accessible only to you.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Share2 className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Share Knowledge</h3>
              <p className="text-muted-foreground text-center">
                Make selected notes public to share your insights with the
                world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Notes Section */}
      {publicNotes.length > 0 && (
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Public Notes
                </h2>
                <p className="text-muted-foreground max-w-[900px] md:text-xl">
                  Explore notes shared by our community.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicNotes.slice(0, 6).map((note: Note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="hover:bg-muted/50 flex flex-col space-y-2 rounded-lg border p-4 transition-colors"
                >
                  <h3 className="line-clamp-1 text-xl font-bold">
                    {note.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-3">
                    {note.content}
                  </p>
                  <div className="text-muted-foreground mt-auto flex items-center pt-2 text-sm">
                    <time dateTime={note.updatedAt.toISOString()}>
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
            {publicNotes.length > 6 && (
              <div className="mt-8 flex justify-center">
                <Link href="/notes/public">
                  <Button variant="outline">View All Public Notes</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to get started?
              </h2>
              <p className="max-w-[600px] md:text-xl">
                Join thousands of users who organize their thoughts with
                NotePro.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href={session ? "/dashboard" : "/auth/signup"}>
                <Button size="lg" variant="secondary" className="w-full">
                  {session ? "Go to Dashboard" : "Sign Up Now"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
