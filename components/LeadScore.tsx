"use client";

import React from "react";
import { FitTier } from "../lib/leads";

interface LeadScoreProps {
  score: number;
  tier: FitTier;
  showBar?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function LeadScore({
  score,
  tier,
  showBar = true,
  size = "md",
}: LeadScoreProps) {
  const getBadgeStyle = () => {
    switch (tier) {
      case "High Fit":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-800/80";
      case "Medium Fit":
        return "bg-amber-950/80 text-amber-300 border-amber-800/80";
      case "Low Fit":
      default:
        return "bg-slate-800/90 text-slate-400 border-slate-700/80";
    }
  };

  const getBarColor = () => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 65) return "bg-amber-500";
    return "bg-slate-500";
  };

  if (size === "lg") {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
            {score}
          </span>
          <span className="text-sm font-semibold text-slate-500">/ 100</span>
          <span
            className={`ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle()}`}
          >
            {tier}
          </span>
        </div>
        {showBar && (
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-bold text-white tabular-nums min-w-[20px]">
        {score}
      </span>
      {showBar && (
        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700/60">
          <div
            className={`h-full rounded-full ${getBarColor()}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      )}
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none ${getBadgeStyle()}`}
      >
        {tier}
      </span>
    </div>
  );
}
