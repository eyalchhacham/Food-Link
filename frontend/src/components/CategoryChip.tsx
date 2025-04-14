import React from "react";

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function CategoryChip({
  label,
  selected = false,
  onClick,
}: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
        ${
          selected
            ? "bg-teal-500 text-white"
            : "bg-teal-100 text-teal-700 hover:bg-teal-200"
        }`}
    >
      {label}
    </button>
  );
}
