"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Lock,
  Share2,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useInView,
} from "motion/react";
import Image from "next/image";

import { Button } from "~/components/ui/button";

const FeatureItem = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="bg-card flex flex-col items-center space-y-3 rounded-xl border p-6 shadow-sm"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={isInView ? { scale: 1 } : { scale: 0.8 }}
        transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
        className="bg-primary/10 rounded-full p-3"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </motion.div>
  );
};

const PublicNoteCard = ({ note, index }: { note: any; index: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/notes/${note.id}`}
        className="bg-card flex h-full flex-col space-y-3 rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
      >
        <h3 className="line-clamp-1 text-xl font-bold">{note.title}</h3>
        <p className="text-muted-foreground line-clamp-3 flex-grow">
          {note.content}
        </p>
        <div className="text-muted-foreground mt-auto flex items-center pt-2 text-sm">
          <time dateTime={note?.updatedAt?.toISOString?.()}>
            {new Date(note?.updatedAt).toLocaleDateString()}
          </time>
        </div>
      </Link>
    </motion.div>
  );
};

const HeroAnimation = () => {
  return (
    <div className="bg-card relative flex h-[350px] w-full max-w-[500px] items-center justify-center overflow-hidden rounded-2xl border shadow-xl">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-blue-500/30 blur-2xl"></div>
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/30 blur-2xl"></div>
        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-pink-500/30 blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-green-500/30 blur-2xl"></div>
      </div>

      <div className="z-10 w-full space-y-4 p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-2"
        >
          <div className="h-4 w-4 rounded-full bg-green-500"></div>
          <div className="text-lg font-semibold">Meeting Notes</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-3"
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
              className="flex items-start space-x-2"
            >
              <CheckCircle className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <div className="bg-muted h-4 w-full rounded-lg"></div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-6 flex justify-end"
        >
          <div className="bg-primary text-primary-foreground rounded-lg px-3 py-1 text-sm font-medium">
            Save Note
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function Home() {
  const [publicNotes, setPublicNotes] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is logged in
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        setIsLoggedIn(!!sessionData?.user);

        // Get public notes
        const notesRes = await fetch("/api/notes?public=true");
        const notesData = await notesRes.json();
        setPublicNotes(notesData?.notes || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="flex flex-col">
      {/* Progress bar */}
      <motion.div
        className="bg-primary fixed top-0 right-0 left-0 z-50 h-1"
        style={{ scaleX, transformOrigin: "0%" }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
        <div className="absolute inset-0 z-0">
          <div className="bg-primary/10 absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl"></div>
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col justify-center space-y-6"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-primary/10 inline-flex items-center space-x-2 rounded-full px-3 py-1 text-sm font-medium"
                >
                  <Sparkles className="text-primary h-4 w-4" />
                  <span>The ultimate note-taking experience</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                >
                  Your thoughts, <span className="text-primary">organized</span>{" "}
                  and accessible.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="text-muted-foreground max-w-[600px] text-lg md:text-xl"
                >
                  NotePro helps you capture ideas, organize thoughts, and share
                  knowledge with the world, all in one beautiful and intuitive
                  platform.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href={isLoggedIn ? "/dashboard" : "/auth/signup"}
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" className="w-full gap-2">
                    {isLoggedIn ? "Go to Dashboard" : "Get Started for Free"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {!isLoggedIn && (
                  <Link href="/auth/signin" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                )}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <HeroAnimation />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Features you'll love
              </h2>
              <p className="text-muted-foreground mx-auto max-w-[800px] text-lg md:text-xl">
                Everything you need to organize your thoughts and share your
                ideas with the world.
              </p>
            </div>
          </motion.div>

          <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            <FeatureItem
              icon={<BookOpen className="text-primary h-6 w-6" />}
              title="Capture Ideas"
              description="Quickly jot down your thoughts and ideas before they slip away, with rich text formatting."
            />
            <FeatureItem
              icon={<Lock className="text-primary h-6 w-6" />}
              title="Private Notes"
              description="Keep your personal notes secure and accessible only to you, with end-to-end encryption."
            />
            <FeatureItem
              icon={<Share2 className="text-primary h-6 w-6" />}
              title="Share Knowledge"
              description="Make selected notes public to share your insights with the world or specific people."
            />
          </div>
        </div>
      </section>

      {/* Public Notes Section */}
      {publicNotes.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  Public Notes
                </h2>
                <p className="text-muted-foreground mx-auto max-w-[800px] text-lg md:text-xl">
                  Explore notes shared by our community of passionate thinkers.
                </p>
              </div>
            </motion.div>

            <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicNotes.slice(0, 6).map((note, index) => (
                <PublicNoteCard key={note.id} note={note} index={index} />
              ))}
            </div>

            {publicNotes.length > 6 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-12 flex justify-center"
              >
                <Link href="/notes/public">
                  <Button variant="outline" size="lg" className="gap-2">
                    View All Public Notes
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { count: "10,000+", label: "Active Users" },
              { count: "1M+", label: "Notes Created" },
              { count: "100K+", label: "Public Notes" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center justify-center space-y-2 text-center"
              >
                <div className="text-primary text-4xl font-bold md:text-5xl lg:text-6xl">
                  {stat.count}
                </div>
                <div className="text-muted-foreground text-lg font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute right-1/4 -bottom-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center space-y-6 text-center"
          >
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Ready to get started?
              </h2>
              <p className="mx-auto max-w-[600px] text-lg md:text-xl">
                Join thousands of users who organize their thoughts with
                NotePro. Your first 30 days are on us.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link href={isLoggedIn ? "/dashboard" : "/auth/signup"}>
                <Button size="lg" variant="secondary" className="gap-2">
                  {isLoggedIn ? "Go to Dashboard" : "Sign Up Now"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
