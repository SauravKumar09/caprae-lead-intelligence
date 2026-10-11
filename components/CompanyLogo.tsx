"use client";

import React from "react";
import {
  Building2,
  Factory,
  Warehouse,
  Truck,
  HeartPulse,
  MonitorCheck,
  Briefcase,
  Trees,
} from "lucide-react";

interface CompanyLogoProps {
  company: string;
  industry?: string;
  size?: "sm" | "md" | "lg";
}

export default function CompanyLogo({
  company,
  industry = "",
  size = "md",
}: CompanyLogoProps) {
  // Map industry to appropriate architectural/corporate building icon
  const getIndustryIcon = () => {
    const ind = industry.toLowerCase();
    if (ind.includes("manufactur") || ind.includes("industrial") || ind.includes("packag")) {
      return Factory;
    }
    if (ind.includes("distribution") || ind.includes("wholesale")) {
      return Warehouse;
    }
    if (ind.includes("transport") || ind.includes("fleet") || ind.includes("logistics")) {
      return Truck;
    }
    if (ind.includes("health") || ind.includes("dental") || ind.includes("medical")) {
      return HeartPulse;
    }
    if (ind.includes("it") || ind.includes("software") || ind.includes("tech")) {
      return MonitorCheck;
    }
    if (ind.includes("environmental") || ind.includes("water")) {
      return Trees;
    }
    if (ind.includes("professional") || ind.includes("account") || ind.includes("advisory")) {
      return Briefcase;
    }
    return Building2;
  };

  const Icon = getIndustryIcon();

  const sizeClasses = {
    sm: "w-6 h-6 rounded-md p-1",
    md: "w-8 h-8 rounded-lg p-1.5",
    lg: "w-12 h-12 rounded-xl p-2.5",
  };

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 24,
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 bg-slate-800/90 text-slate-300 border border-slate-700/80 shadow-2xs group-hover:border-indigo-500/70 group-hover:text-indigo-400 group-hover:bg-indigo-950/50 transition-colors ${sizeClasses[size]}`}
      title={`${company} — ${industry || "Corporate Entity"}`}
      aria-hidden="true"
    >
      <Icon size={iconSizes[size]} className="stroke-[1.8]" />
    </div>
  );
}
