"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  className,
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get the current search query from URL
  const currentQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(currentQuery);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      // Set search query
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }

      // Reset to first page when searching
      params.delete("page");

      router.push(`?${params.toString()}`);
    });
  };

  // Clear search
  const handleClear = () => {
    setQuery("");

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      params.delete("page");
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className || ""}`}>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-12 pl-9"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground absolute top-1/2 right-9 h-5 w-5 -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
          disabled={isPending}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  );
}
