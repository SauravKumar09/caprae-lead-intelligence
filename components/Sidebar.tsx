"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bookmark,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Info,
  Menu,
  X,
} from "lucide-react";
import { getSavedLeadIds, SYNC_EVENT_NAME } from "../lib/storage";

export default function Sidebar() {
  const pathname = usePathname();
  const [savedCount, setSavedCount] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateCount = () => {
      setSavedCount(getSavedLeadIds().length);
    };

    updateCount();
    window.addEventListener(SYNC_EVENT_NAME, updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    {
      href: "/",
      label: "Lead Intelligence",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      href: "/saved",
      label: "Saved Leads",
      icon: Bookmark,
      active: pathname === "/saved",
      badge: savedCount,
    },
    {
      href: "/scoring",
      label: "Scoring Profile",
      icon: SlidersHorizontal,
      active: pathname === "/scoring",
    },
  ];

  return (
    <>
      {/* Mobile Top Toggle Button */}
      <div className="lg:hidden fixed top-3 left-3 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-slate-900 text-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 z-30 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-35 w-60 bg-slate-950 text-slate-300 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          {/* Brand */}
          <div className="px-5 py-5 border-b border-slate-800/60 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
                L
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-base tracking-tight leading-none">
                  Leadwise
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                  Acquisition Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4">
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Pipeline Workspace
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      item.active
                        ? "bg-slate-800 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={15}
                        className={item.active ? "text-indigo-400" : "text-slate-500"}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          item.badge > 0
                            ? "bg-indigo-950 text-indigo-300 border border-indigo-800/60"
                            : "bg-slate-800/60 text-slate-500"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 mt-6 mb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Platform
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-slate-400 cursor-not-allowed">
                <div className="flex items-center gap-2.5">
                  <Layers size={15} className="text-slate-500" />
                  <span>Enrichment Sources</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-mono">
                  v1 demo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Workspace Context */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950">
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold mb-1">
              <Sparkles size={13} className="text-indigo-400 shrink-0" />
              <span>Prioritize with Purpose</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-tight">
              Scores reflect your active target acquisition profile.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Demo workspace
              </span>
              <span className="text-slate-400">v1.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
