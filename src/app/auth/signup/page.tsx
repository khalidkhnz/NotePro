import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
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
import { db } from "~/server/db";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default async function SignUpPage() {
  const session = await auth();

  // Redirect to dashboard if already signed in
  if (session?.user) {
    redirect("/dashboard");
  }

  async function signUp(formData: FormData): Promise<void> {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Validate input
      signUpSchema.parse({ name, email, password });

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return redirect("/auth/signin?error=EmailAlreadyExists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user directly
      await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Sign in the user after successful registration
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        redirectTo: "/dashboard",
      });
    } catch (error) {
      if (
        error instanceof z.ZodError &&
        error.errors &&
        error.errors.length > 0
      ) {
        console.error("Validation error:", error.errors);
        console.error(error.errors[0]?.message || "Validation error");
        return redirect("/auth/signup?error=ValidationError");
      } else {
        console.error("Registration error:", error);
        console.error((error as Error).message || "Something went wrong");
        return redirect("/auth/signup?error=ServerError");
      }
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
        </CardHeader>
        <CardContent className="space-y-4 px-6">
          <form action={signUp}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                className="w-full"
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
              />
            </div>
            <Button type="submit" className="mt-6 w-full">
              Sign Up
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
