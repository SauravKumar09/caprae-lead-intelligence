"use client";

import React from "react";
import { PipelineStatus, PIPELINE_STATUS_OPTIONS } from "../lib/leads";

interface StatusSelectProps {
  status: PipelineStatus;
  leadId: string;
  leadName?: string;
  onChange: (newStatus: PipelineStatus) => void;
  size?: "sm" | "md";
}

export default function StatusSelect({
  status,
  leadId,
  leadName,
  onChange,
  size = "sm",
}: StatusSelectProps) {
  const getStatusColor = (s: PipelineStatus) => {
    switch (s) {
      case "New":
        return "text-sky-300 bg-sky-950/80 border-sky-800/80 hover:border-sky-700";
      case "Contacted":
        return "text-indigo-300 bg-indigo-950/80 border-indigo-800/80 hover:border-indigo-700";
      case "Qualified":
        return "text-emerald-300 bg-emerald-950/80 border-emerald-800/80 hover:border-emerald-700";
      case "Disqualified":
        return "text-slate-400 bg-slate-800/80 border-slate-700/80 hover:border-slate-600";
      default:
        return "text-slate-300 bg-slate-900 border-slate-700";
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as PipelineStatus)}
        aria-label={leadName ? `Change pipeline status for ${leadName}` : "Change pipeline status"}
        className={`font-semibold rounded-md border appearance-none transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
          size === "sm"
            ? "text-xs py-1 pl-2.5 pr-6"
            : "text-xs py-1.5 pl-3 pr-7 font-bold"
        } ${getStatusColor(status)}`}
      >
        {PIPELINE_STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt} className="text-slate-200 bg-slate-900">
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2 flex items-center text-slate-400">
        <svg
          className="w-3 h-3 fill-current"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}
