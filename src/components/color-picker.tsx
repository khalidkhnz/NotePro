"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "~/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const COLORS = [
  "#94a3b8", // slate
  "#64748b", // slate darker
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
];

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isCustomColorVisible, setIsCustomColorVisible] = useState(false);
  const [customColor, setCustomColor] = useState(
    !COLORS.includes(color) ? color : "#000000",
  );

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
        {COLORS.map((colorOption) => (
          <button
            key={colorOption}
            type="button"
            className={cn(
              "h-8 w-8 rounded-full border border-gray-200 transition-all hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none",
              color === colorOption && "ring-2 ring-offset-2",
            )}
            style={{ backgroundColor: colorOption }}
            onClick={() => handleColorChange(colorOption)}
          >
            {color === colorOption && (
              <Check
                className={cn(
                  "h-4 w-4 text-white",
                  ["#f59e0b", "#eab308", "#84cc16"].includes(colorOption) &&
                    "text-gray-900",
                )}
              />
            )}
            <span className="sr-only">Select color {colorOption}</span>
          </button>
        ))}
        <button
          type="button"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-gray-300 text-xs text-gray-500 transition-all hover:border-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-offset-2 focus:outline-none",
            isCustomColorVisible && "bg-gray-100",
          )}
          onClick={() => {
            setIsCustomColorVisible(!isCustomColorVisible);
            if (!isCustomColorVisible && !COLORS.includes(color)) {
              handleColorChange(customColor);
            }
          }}
        >
          {isCustomColorVisible ? "×" : "+"}
          <span className="sr-only">
            {isCustomColorVisible ? "Hide" : "Show"} custom color
          </span>
        </button>
      </div>

      {isCustomColorVisible && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="h-8 w-8 cursor-pointer appearance-none rounded-md border border-gray-200 bg-transparent p-0"
            style={{ backgroundColor: customColor }}
          />
          <span className="text-sm text-gray-600">{customColor}</span>
        </div>
      )}
    </div>
  );
}
