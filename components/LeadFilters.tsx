"use client";

import React from "react";
import { Search, X, Bookmark, RotateCcw } from "lucide-react";

export interface FilterState {
  search: string;
  industry: string;
  location: string;
  revenueRange: string;
  employeeRange: string;
  fitScore: string;
  pipelineStatus: string;
  verificationStatus: string;
  savedOnly: boolean;
  sort: string;
}

interface LeadFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  industries: string[];
  locations: string[];
  savedCount: number;
  totalFilteredCount: number;
  totalCount: number;
}

export default function LeadFilters({
  filters,
  onChange,
  onReset,
  industries,
  locations,
  savedCount,
  totalFilteredCount,
  totalCount,
}: LeadFiltersProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.industry !== "All industries" ||
    filters.location !== "All locations" ||
    filters.revenueRange !== "All revenue" ||
    filters.employeeRange !== "All team sizes" ||
    filters.fitScore !== "All scores" ||
    filters.pipelineStatus !== "All statuses" ||
    filters.verificationStatus !== "All verification" ||
    filters.savedOnly ||
    filters.sort !== "score-desc";

  return (
    <div className="bg-slate-900/95 border-b border-slate-800/90 p-3.5 space-y-2.5">
      {/* Primary Row: Search, Saved Toggle, Sort & Reset */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search company, industry, domain, description..."
            aria-label="Search leads"
            className="w-full text-xs bg-slate-950/80 border border-slate-800 rounded-md py-1.5 pl-8 pr-7 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter("search", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Saved Leads Toggle */}
        <button
          onClick={() => updateFilter("savedOnly", !filters.savedOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
            filters.savedOnly
              ? "bg-indigo-950/90 border-indigo-700 text-indigo-300"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
          }`}
          aria-pressed={filters.savedOnly}
        >
          <Bookmark
            size={13}
            className={filters.savedOnly ? "fill-indigo-400 text-indigo-400" : "text-slate-500"}
          />
          <span>Saved Only</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
            {savedCount}
          </span>
        </button>

        {/* Sort Select */}
        <select
          value={filters.sort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          aria-label="Sort leads by"
          className="text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 px-2.5 text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="score-desc" className="bg-slate-900 text-slate-200">Sort: Fit Score (High to Low)</option>
          <option value="score-asc" className="bg-slate-900 text-slate-200">Sort: Fit Score (Low to High)</option>
          <option value="revenue-desc" className="bg-slate-900 text-slate-200">Sort: Revenue (High to Low)</option>
          <option value="revenue-asc" className="bg-slate-900 text-slate-200">Sort: Revenue (Low to High)</option>
          <option value="employees-desc" className="bg-slate-900 text-slate-200">Sort: Headcount (High to Low)</option>
          <option value="name-asc" className="bg-slate-900 text-slate-200">Sort: Company Name (A to Z)</option>
        </select>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Reset all filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Secondary Row: Specific Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* Industry */}
        <select
          value={filters.industry}
          onChange={(e) => updateFilter("industry", e.target.value)}
          aria-label="Filter by industry"
          className="text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 px-2.5 text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[180px] truncate"
        >
          <option className="bg-slate-900 text-slate-200">All industries</option>
          {industries.map((ind) => (
            <option key={ind} value={ind} className="bg-slate-900 text-slate-200">
              {ind}
            </option>
          ))}
        </select>

        {/* Location */}
        <select
          value={filters.location}
          onChange={(e) => updateFilter("location", e.target.value)}
          aria-label="Filter by location"
          className="text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 px-2.5 text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[160px] truncate"
        >
          <option className="bg-slate-900 text-slate-200">All locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc} className="bg-slate-900 text-slate-200">
              {loc}
            </option>
          ))}
        </select>

        {/* Fit Score */}
        <select
          value={filters.fitScore}
          onChange={(e) => updateFilter("fitScore", e.target.value)}
          aria-label="Filter by fit score tier"
          className="text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 px-2.5 text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option className="bg-slate-900 text-slate-200">All scores</option>
          <option value="High fit" className="bg-slate-900 text-slate-200">High fit (80–100)</option>
          <option value="Medium fit" className="bg-slate-900 text-slate-200">Medium fit (65–79)</option>
          <option value="Low fit" className="bg-slate-900 text-slate-200">Low fit (&lt;65)</option>
        </select>

        {/* Revenue Range */}
        <select
          value={filters.revenueRange}
          onChange={(e) => updateFilter("revenueRange", e.target.value)}
          aria-label="Filter by revenue range"
          className="text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 px-2.5 text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option className="bg-slate-900 text-slate-200">All revenue</option>
          <option value="target" className="bg-slate-900 text-slate-200">$10M – $30M (Target)</option>
          <option value="under10" className="bg-slate-900 text-slate-200">Under $10M</option>
          <option value="over30" className="bg-slate-900 text-slate-200">Over $30M</option>
        </select>

        {/* Employee Range */}
        <select
          value={filters.employeeRange}
          onChange={(e) => updateFilter("employeeRange", e.target.value)}
          aria-label="Filter by employee headcount"
          className="text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 px-2.5 text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option className="bg-slate-900 text-slate-200">All team sizes</option>
          <option value="target" className="bg-slate-900 text-slate-200">50 – 200 (Target)</option>
          <option value="under50" className="bg-slate-900 text-slate-200">Under 50</option>
          <option value="over200" className="bg-slate-900 text-slate-200">Over 200</option>
        </select>

        {/* Pipeline Status */}
        <select
          value={filters.pipelineStatus}
          onChange={(e) => updateFilter("pipelineStatus", e.target.value)}
          aria-label="Filter by pipeline status"
          className="text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 px-2.5 text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option className="bg-slate-900 text-slate-200">All statuses</option>
          <option value="New" className="bg-slate-900 text-slate-200">New</option>
          <option value="Contacted" className="bg-slate-900 text-slate-200">Contacted</option>
          <option value="Qualified" className="bg-slate-900 text-slate-200">Qualified</option>
          <option value="Disqualified" className="bg-slate-900 text-slate-200">Disqualified</option>
        </select>

        {/* Verification Status */}
        <select
          value={filters.verificationStatus}
          onChange={(e) => updateFilter("verificationStatus", e.target.value)}
          aria-label="Filter by verification status"
          className="text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 px-2.5 text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option className="bg-slate-900 text-slate-200">All verification</option>
          <option value="Verified" className="bg-slate-900 text-slate-200">Verified</option>
          <option value="Needs review" className="bg-slate-900 text-slate-200">Needs review</option>
          <option value="Incomplete" className="bg-slate-900 text-slate-200">Incomplete</option>
        </select>

        {/* Match count indicator */}
        <div className="ml-auto text-xs text-slate-500 font-medium whitespace-nowrap">
          Showing <span className="text-slate-200 font-semibold">{totalFilteredCount}</span> of {totalCount}
        </div>
      </div>
    </div>
  );
}
