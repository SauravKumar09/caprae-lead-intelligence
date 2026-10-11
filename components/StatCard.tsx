"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  supportingContext?: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

export default function StatCard({
  label,
  value,
  subtext,
  supportingContext,
  icon: Icon,
  badge,
  highlight = false,
}: StatCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${
        highlight
          ? "border-indigo-800/80 bg-gradient-to-br from-indigo-950/30 to-slate-900/90 shadow-sm shadow-indigo-950/40"
          : "border-slate-800/90 bg-slate-900/80 hover:border-slate-700/80"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-1.5 rounded-lg border ${
          highlight
            ? "bg-indigo-950/80 border-indigo-800/80 text-indigo-400"
            : "bg-slate-800/80 border-slate-700/60 text-slate-400"
        }`}>
          <Icon size={14} />
        </div>
      </div>

      <div className="my-2.5 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
          {value}
        </span>
        {badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 leading-tight">
        <span>{subtext}</span>
        {supportingContext && (
          <span className="text-[11px] text-slate-500 font-medium">
            {supportingContext}
          </span>
        )}
      </div>
    </div>
  );
}
