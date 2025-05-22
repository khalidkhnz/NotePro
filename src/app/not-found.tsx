import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
          <FileQuestion className="text-muted-foreground h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Not Found</h1>
          <p className="text-muted-foreground max-w-[500px]">
            The page you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/notes/public">Public Notes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
