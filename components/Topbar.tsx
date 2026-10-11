"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopbarProps {
  breadcrumbs: BreadcrumbItem[];
}

export default function Topbar({ breadcrumbs }: TopbarProps) {
  return (
    <div className="w-full bg-slate-950/60 border-b border-slate-800/60 px-4 sm:px-6 py-2.5">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between text-xs">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Workspace</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label + idx}>
              <ChevronRight size={11} className="text-slate-600" />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-slate-400 hover:text-slate-100 transition-colors font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-200 font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="text-[11px] text-slate-500 hidden sm:block">
          Caprae Capital Pre-Work Evaluation
        </div>
      </div>
    </div>
  );
}
