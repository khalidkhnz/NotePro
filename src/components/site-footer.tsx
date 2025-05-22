export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:h-16 md:flex-row lg:px-8">
        <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
          © {new Date().getFullYear()} NotePro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
