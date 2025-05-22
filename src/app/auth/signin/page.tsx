"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookText, AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="mt-6 w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}

function DiscordButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      variant="outline"
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Discord"
      )}
    </Button>
  );
}

export default function SignInPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already signed in
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (data.user) {
          window.location.href = "/dashboard";
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    }

    // Get error from URL if present
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    // Define error messages
    const errorMessages: Record<string, string> = {
      EmailAlreadyExists:
        "An account with this email already exists. Please sign in instead.",
      CredentialsSignin: "Invalid email or password. Please try again.",
      OAuthAccountNotLinked:
        "This email is already associated with another provider.",
      OAuthSignin: "Could not sign in with the provider. Please try again.",
      AccessDenied: "Access denied. You don't have permission to sign in.",
      Default: "Something went wrong. Please try again later.",
    };

    // Set error message if present
    if (error) {
      setErrorMessage(
        (errorMessages[error as keyof typeof errorMessages] ||
          errorMessages.Default) as string,
      );
    }

    checkSession();
  }, []);

  async function handleCredentialsSignIn(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        window.location.href = "/dashboard";
      } else {
        const data = await response.json();
        setErrorMessage(
          data.error || "Invalid email or password. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    }
  }

  async function handleDiscordSignIn() {
    try {
      const response = await fetch("/api/auth/discord");
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage("Could not sign in with Discord. Please try again.");
      }
    } catch (error) {
      console.error("Error signing in with Discord:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    }
  }

  return (
    <div className="bg-background flex min-h-screen w-full items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="mb-2 flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookText className="h-6 w-6" />
              <span className="text-2xl font-bold">NotePro</span>
            </Link>
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Sign in
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to sign in to your account
          </CardDescription>
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4 px-6">
          <form action={handleCredentialsSignIn}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="w-full"
                autoComplete="email"
              />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-primary text-sm hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="w-full"
                autoComplete="current-password"
              />
            </div>
            <SignInButton />
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">
                Or continue with
              </span>
            </div>
          </div>

          <form action={handleDiscordSignIn}>
            <DiscordButton />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center px-6 pb-6">
          <p className="text-muted-foreground text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
