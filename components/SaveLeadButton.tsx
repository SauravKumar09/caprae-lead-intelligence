"use client";

import React from "react";
import { Bookmark } from "lucide-react";

interface SaveLeadButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  leadName?: string;
  variant?: "icon" | "button";
}

export default function SaveLeadButton({
  isSaved,
  onToggle,
  leadName,
  variant = "icon",
}: SaveLeadButtonProps) {
  const label = isSaved
    ? leadName
      ? `Remove ${leadName} from saved leads`
      : "Remove from saved leads"
    : leadName
    ? `Save ${leadName} to shortlisted leads`
    : "Save lead to shortlist";

  if (variant === "button") {
    return (
      <button
        onClick={onToggle}
        aria-label={label}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
          isSaved
            ? "bg-indigo-950/90 border-indigo-700/90 text-indigo-300 hover:bg-indigo-900/90"
            : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-850 hover:text-white"
        }`}
      >
        <Bookmark
          size={14}
          className={isSaved ? "fill-indigo-400 text-indigo-400" : "text-slate-400"}
        />
        <span>{isSaved ? "Saved" : "Save Lead"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      aria-label={label}
      title={isSaved ? "Remove from saved" : "Save lead"}
      className={`p-1.5 rounded-md border transition-colors ${
        isSaved
          ? "bg-indigo-950/90 border-indigo-700/90 text-indigo-400 hover:bg-indigo-900"
          : "bg-slate-900 border-slate-750 text-slate-400 hover:text-slate-200 hover:border-slate-600"
      }`}
    >
      <Bookmark
        size={14}
        className={isSaved ? "fill-indigo-400 text-indigo-400" : "currentColor"}
      />
    </button>
  );
}
