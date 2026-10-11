"use client";

import React from "react";
import { ScoreBreakdown as BreakdownType } from "../lib/leads";
import { Factory, DollarSign, Users, MapPin } from "lucide-react";

interface ScoreBreakdownProps {
  breakdown: BreakdownType;
  totalScore: number;
}

export default function ScoreBreakdown({ breakdown, totalScore }: ScoreBreakdownProps) {
  const categories = [
    {
      key: "industry",
      label: "Industry Alignment",
      icon: Factory,
      data: breakdown.industry,
    },
    {
      key: "revenue",
      label: "Revenue Scale Fit",
      icon: DollarSign,
      data: breakdown.revenue,
    },
    {
      key: "employees",
      label: "Headcount & Maturity",
      icon: Users,
      data: breakdown.employees,
    },
    {
      key: "location",
      label: "Target Geography",
      icon: MapPin,
      data: breakdown.location,
    },
  ];

  return (
    <div className="space-y-3.5">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const percentage = Math.round((cat.data.earned / cat.data.max) * 100);
        return (
          <div key={cat.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <Icon size={13} className="text-indigo-400" />
                <span>{cat.label}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-white tabular-nums">
                <span>{cat.data.earned}</span>
                <span className="text-slate-500 font-normal">/ {cat.data.max} pts</span>
              </div>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              {cat.data.reason}
            </p>
          </div>
        );
      })}

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-white">
        <span className="text-slate-400">Total Weighted Score</span>
        <span className="tabular-nums text-sm text-indigo-400 font-bold">
          {totalScore} / 100
        </span>
      </div>
    </div>
  );
}
