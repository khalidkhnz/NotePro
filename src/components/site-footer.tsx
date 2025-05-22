import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:h-16 md:flex-row lg:px-8">
        <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
          © {new Date().getFullYear()} NotePro. All rights reserved.
        </p>
        <div className="flex items-center space-x-4">
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
