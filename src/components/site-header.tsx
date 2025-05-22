"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, LogOut, Menu, UserCircle } from "lucide-react";

import { ModeToggle } from "./toggle-dark-light-mode";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

interface SiteHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    toast.success("Signed out successfully");
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <BookText className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">NotePro</span>
          </Link>
          <nav className="ml-10 hidden space-x-8 md:flex">
            <Link
              href="/"
              className={`flex items-center text-sm font-medium ${
                isActive("/")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`flex items-center text-sm font-medium ${
                  isActive("/dashboard") || pathname.startsWith("/dashboard")
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/notes/public"
              className={`flex items-center text-sm font-medium ${
                isActive("/notes/public") || pathname.startsWith("/notes/")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Public Notes
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-4">
            <ModeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User avatar"}
                        className="h-9 w-9 rounded-full"
                      />
                    ) : (
                      <UserCircle className="h-6 w-6" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.name || user.email || "My Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
          </nav>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="mt-6 flex flex-col gap-4">
                  <Link
                    href="/"
                    className="flex items-center text-sm font-medium"
                  >
                    Home
                  </Link>
                  {user && (
                    <Link
                      href="/dashboard"
                      className="flex items-center text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/notes/public"
                    className="flex items-center text-sm font-medium"
                  >
                    Public Notes
                  </Link>
                  {!user && (
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="mt-4"
                    >
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
