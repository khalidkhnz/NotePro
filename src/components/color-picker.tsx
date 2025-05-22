"use client";

import { Check } from "lucide-react";
import { cn } from "~/lib/utils";

const PREDEFINED_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#94a3b8", // slate
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PREDEFINED_COLORS.map((colorOption) => (
        <button
          key={colorOption}
          type="button"
          className={cn(
            "relative h-8 w-8 rounded-full border border-neutral-200 transition-transform hover:scale-110 focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:outline-none dark:border-neutral-700",
          )}
          style={{ backgroundColor: colorOption }}
          onClick={() => onChange(colorOption)}
        >
          {color === colorOption && (
            <Check className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white" />
          )}
          <span className="sr-only">Select color {colorOption}</span>
        </button>
      ))}
    </div>
  );
}
