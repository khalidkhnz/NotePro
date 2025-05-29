"use client";

import Link from "next/link";
import { z } from "zod";
import {
  BookText,
  AlertCircle,
  Loader2,
  Mail,
  MessageCircle,
} from "lucide-react";
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

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function SignUpButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="mt-6 w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        "Sign Up"
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
        <>
          <MessageCircle className="mr-2 h-4 w-4" />
          Discord
        </>
      )}
    </Button>
  );
}

function GoogleButton() {
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
        <>
          <Mail className="mr-2 h-4 w-4" />
          Google
        </>
      )}
    </Button>
  );
}

export default function SignUpPage() {
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
      ValidationError: "Please check your information and try again.",
      ServerError: "Something went wrong. Please try again later.",
      EmailAlreadyExists:
        "An account with this email already exists. Please sign in instead.",
      PasswordTooShort: "Password must be at least 6 characters.",
      InvalidEmail: "Please enter a valid email address.",
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

  async function handleSignUp(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Client-side validation
      try {
        signUpSchema.parse({ name, email, password });
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          const firstError = validationError.errors[0];
          if (firstError?.message.includes("email")) {
            setErrorMessage("Please enter a valid email address.");
            return;
          } else if (firstError?.message.includes("password")) {
            setErrorMessage("Password must be at least 6 characters.");
            return;
          }
        }
        setErrorMessage("Please check your information and try again.");
        return;
      }

      // Send signup request
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        // If successful, sign in and redirect
        const signInResponse = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (signInResponse.ok) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/auth/signin?error=EmailAlreadyExists";
        }
      } else {
        const data = await response.json();
        if (data.error === "EmailAlreadyExists") {
          window.location.href = "/auth/signin?error=EmailAlreadyExists";
        } else {
          setErrorMessage(
            data.error || "Something went wrong. Please try again later.",
          );
        }
      }
    } catch (error) {
      console.error("Error signing up:", error);
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

  async function handleGoogleSignIn() {
    try {
      const response = await fetch("/api/auth/google");
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage("Could not sign in with Google. Please try again.");
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
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
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
          </CardDescription>
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4 px-6">
          <form action={handleSignUp}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                className="w-full"
                autoComplete="name"
              />
            </div>
            <div className="mt-4 space-y-2">
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="w-full"
                autoComplete="new-password"
                minLength={6}
              />
              <p className="text-muted-foreground text-xs">
                Password must be at least 6 characters long
              </p>
            </div>
            <SignUpButton />
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

          <form action={handleGoogleSignIn}>
            <GoogleButton />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center px-6 pb-6">
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
