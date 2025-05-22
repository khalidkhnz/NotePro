"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookText,
  FilterIcon,
  Home,
  LogOut,
  Menu,
  UserCircle,
  Users,
  FilePlus,
  FolderIcon,
} from "lucide-react";

import { ModeToggle } from "./toggle-dark-light-mode";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
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
    if (path === "/") {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(path);
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
                  isActive("/dashboard")
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
                isActive("/notes/public")
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
                    <Link href="/dashboard">
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/notes/new">
                      <FilePlus className="mr-2 h-4 w-4" />
                      New Note
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/categories">
                      <FolderIcon className="mr-2 h-4 w-4" />
                      Categories
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/notes/filter">
                      <FilterIcon className="mr-2 h-4 w-4" />
                      Filter Notes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle className="flex items-center">
                    <BookText className="mr-2 h-5 w-5" />
                    NotePro
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-4">
                  <Link
                    href="/"
                    className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                      isActive("/")
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>

                  {user && (
                    <>
                      <Link
                        href="/dashboard"
                        className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                          isActive("/dashboard")
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        <UserCircle className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/notes/new"
                        className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                          isActive("/dashboard/notes/new")
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        <FilePlus className="h-4 w-4" />
                        Create Note
                      </Link>
                      <Link
                        href="/dashboard/categories"
                        className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                          isActive("/dashboard/categories")
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        <FolderIcon className="h-4 w-4" />
                        Categories
                      </Link>
                      <Link
                        href="/dashboard/notes/filter"
                        className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                          isActive("/dashboard/notes/filter")
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        <FilterIcon className="h-4 w-4" />
                        Filter Notes
                      </Link>
                    </>
                  )}

                  <Link
                    href="/notes/public"
                    className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                      isActive("/notes/public")
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Public Notes
                  </Link>

                  {user ? (
                    <div className="mt-4 border-t pt-4">
                      <Button
                        onClick={handleSignOut}
                        className="w-full justify-start"
                        variant="ghost"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 border-t pt-4">
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                        className="w-full"
                      >
                        <Link href="/auth/signin">Sign In</Link>
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 flex justify-center">
                    <ModeToggle />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
