"use client";

import React from "react";
import { SearchX, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = SearchX,
}: EmptyStateProps) {
  return (
    <div className="py-14 px-6 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-slate-800/90 text-slate-400 flex items-center justify-center mb-3 border border-slate-700/60">
        <Icon size={22} />
      </div>
      <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-750 hover:text-white transition-colors shadow-2xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
