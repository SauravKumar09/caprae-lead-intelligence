"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bookmark,
  SlidersHorizontal,
  Database,
  ChevronDown,
  Menu,
  X,
  Target,
  Sparkles,
} from "lucide-react";
import { getSavedLeadIds, SYNC_EVENT_NAME } from "../lib/storage";

export default function TopNav() {
  const pathname = usePathname();
  const [savedCount, setSavedCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
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
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand & Workspace Switcher */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm tracking-tight shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
              L
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-base tracking-tight leading-none flex items-center gap-1">
                Leadwise
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-1 py-0.2 rounded">
                  ETA
                </span>
              </span>
              <span className="text-[9px] text-slate-400 font-medium tracking-wide">
                B2B Lead Intelligence
              </span>
            </div>
          </Link>

          <div className="hidden md:block h-5 w-[1px] bg-slate-800" />

          {/* Workspace Pill */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-200">Caprae ETA Fund I</span>
            <span className="text-slate-500 text-[10px]">• Lower-Middle Market</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  link.active
                    ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Icon
                  size={14}
                  className={link.active ? "text-indigo-400" : "text-slate-500"}
                />
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                      link.badge > 0
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Dataset Indicator & User Avatar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-400 text-[11px] font-medium border border-slate-800">
            <Database size={12} className="text-slate-500" />
            <span>Fictional sample dataset</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          {/* User Profile Tag */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                M&A Search Team
              </div>
              <div className="text-[10px] text-slate-500 leading-none">
                Caprae Operator
              </div>
            </div>
            <div
              title="Caprae Operator Profile"
              className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-700/80 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
            >
              CC
            </div>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Navigation
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold ${
                  link.active
                    ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-500 px-3">
            Demo workspace • Fictional sample records
          </div>
        </div>
      )}
    </header>
  );
}
