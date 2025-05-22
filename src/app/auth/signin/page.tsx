import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookText } from "lucide-react";

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
import { auth, signIn } from "~/server/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  // Redirect to dashboard if already signed in
  if (session?.user) {
    redirect("/dashboard");
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
          {params?.error === "EmailAlreadyExists" && (
            <div className="bg-destructive/15 rounded-md p-3">
              <p className="text-destructive text-center text-sm">
                An account with this email already exists. Please sign in
                instead.
              </p>
            </div>
          )}
          {params?.error === "CredentialsSignin" && (
            <div className="bg-destructive/15 rounded-md p-3">
              <p className="text-destructive text-center text-sm">
                Invalid email or password. Please try again.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4 px-6">
          <form
            action={async (formData: FormData) => {
              "use server";

              const email = formData.get("email") as string;
              const password = formData.get("password") as string;

              await signIn("credentials", {
                email,
                password,
                redirect: true,
                redirectTo: "/dashboard",
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="w-full"
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
              />
            </div>
            <Button type="submit" className="mt-6 w-full">
              Sign In
            </Button>
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

          <form
            action={async () => {
              "use server";
              await signIn("discord", {
                redirect: true,
                redirectTo: "/dashboard",
              });
            }}
          >
            <Button className="w-full" variant="outline" type="submit">
              Discord
            </Button>
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
