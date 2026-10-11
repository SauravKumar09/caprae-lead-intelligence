"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Target,
  CheckCircle2,
  Bookmark,
  ArrowDownToLine,
  SlidersHorizontal,
  Info,
  Sparkles,
} from "lucide-react";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import LeadFilters, { FilterState } from "../components/LeadFilters";
import LeadTable from "../components/LeadTable";
import { useToast } from "../components/Toast";
import { initialLeads, ScoredLead, PipelineStatus } from "../lib/leads";
import { calculateLeadScore, ScoringProfile } from "../lib/scoring";
import {
  getSavedLeadIds,
  toggleSavedLead,
  getLeadStatuses,
  updateLeadStatus,
  getStoredScoringProfile,
  SYNC_EVENT_NAME,
} from "../lib/storage";
import { exportLeadsToCsv } from "../lib/export";

const INITIAL_FILTERS: FilterState = {
  search: "",
  industry: "All industries",
  location: "All locations",
  revenueRange: "All revenue",
  employeeRange: "All team sizes",
  fitScore: "All scores",
  pipelineStatus: "All statuses",
  verificationStatus: "All verification",
  savedOnly: false,
  sort: "score-desc",
};

export default function LeadIntelligencePage() {
  const { showToast } = useToast();

  const [scoringProfile, setScoringProfile] = useState<ScoringProfile>(getStoredScoringProfile());
  const [savedLeadIds, setSavedLeadIds] = useState<string[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<Record<string, PipelineStatus>>({});
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Sync state with storage
  const syncFromStorage = useCallback(() => {
    setSavedLeadIds(getSavedLeadIds());
    setLeadStatuses(getLeadStatuses());
    setScoringProfile(getStoredScoringProfile());
  }, []);

  useEffect(() => {
    syncFromStorage();
    window.addEventListener(SYNC_EVENT_NAME, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [syncFromStorage]);

  // Combine base leads with overridden statuses and calculate scores based on active profile
  const scoredLeads: ScoredLead[] = useMemo(() => {
    return initialLeads.map((lead) => {
      const currentStatus = leadStatuses[lead.id] || lead.status;
      const leadWithCurrentStatus = { ...lead, status: currentStatus };
      return calculateLeadScore(leadWithCurrentStatus, scoringProfile);
    });
  }, [leadStatuses, scoringProfile]);

  // Available unique options for filters
  const industries = useMemo(() => {
    return Array.from(new Set(initialLeads.map((l) => l.industry))).sort();
  }, []);

  const locations = useMemo(() => {
    return Array.from(new Set(initialLeads.map((l) => l.location))).sort();
  }, []);

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    return scoredLeads
      .filter((lead) => {
        // Search filter
        if (q) {
          const match =
            lead.company.toLowerCase().includes(q) ||
            lead.website.toLowerCase().includes(q) ||
            lead.industry.toLowerCase().includes(q) ||
            lead.location.toLowerCase().includes(q) ||
            lead.description.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Industry filter
        if (filters.industry !== "All industries" && lead.industry !== filters.industry) {
          return false;
        }

        // Location filter
        if (filters.location !== "All locations" && lead.location !== filters.location) {
          return false;
        }

        // Revenue range filter
        if (filters.revenueRange === "target" && (lead.revenue < 10 || lead.revenue > 30)) {
          return false;
        }
        if (filters.revenueRange === "under10" && lead.revenue >= 10) {
          return false;
        }
        if (filters.revenueRange === "over30" && lead.revenue <= 30) {
          return false;
        }

        // Employee range filter
        if (filters.employeeRange === "target" && (lead.employees < 50 || lead.employees > 200)) {
          return false;
        }
        if (filters.employeeRange === "under50" && lead.employees >= 50) {
          return false;
        }
        if (filters.employeeRange === "over200" && lead.employees <= 200) {
          return false;
        }

        // Fit score filter
        if (filters.fitScore === "High fit" && lead.fitScore < 80) return false;
        if (
          filters.fitScore === "Medium fit" &&
          (lead.fitScore < 65 || lead.fitScore >= 80)
        )
          return false;
        if (filters.fitScore === "Low fit" && lead.fitScore >= 65) return false;

        // Pipeline status filter
        if (
          filters.pipelineStatus !== "All statuses" &&
          lead.status !== filters.pipelineStatus
        ) {
          return false;
        }

        // Verification status filter
        if (filters.verificationStatus !== "All verification") {
          const v = lead.verificationStatus || (lead.verified ? "Verified" : "Needs review");
          if (v !== filters.verificationStatus) return false;
        }

        // Saved only filter
        if (filters.savedOnly && !savedLeadIds.includes(lead.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sort) {
          case "score-desc":
            return b.fitScore - a.fitScore;
          case "score-asc":
            return a.fitScore - b.fitScore;
          case "revenue-desc":
            return b.revenue - a.revenue;
          case "revenue-asc":
            return a.revenue - b.revenue;
          case "employees-desc":
            return b.employees - a.employees;
          case "name-asc":
            return a.company.localeCompare(b.company);
          default:
            return b.fitScore - a.fitScore;
        }
      });
  }, [scoredLeads, filters, savedLeadIds]);

  // KPI Calculations
  const highFitCount = useMemo(
    () => scoredLeads.filter((l) => l.fitScore >= 80).length,
    [scoredLeads]
  );
  const verifiedCount = useMemo(
    () => scoredLeads.filter((l) => l.verified).length,
    [scoredLeads]
  );

  // Handlers
  const handleToggleSave = (id: string) => {
    const target = initialLeads.find((l) => l.id === id);
    const { isSaved } = toggleSavedLead(id);
    setSavedLeadIds(getSavedLeadIds());
    showToast(
      isSaved
        ? `Added ${target?.company || "lead"} to shortlist.`
        : `Removed ${target?.company || "lead"} from saved list.`,
      "info"
    );
  };

  const handleStatusChange = (id: string, newStatus: PipelineStatus) => {
    const target = initialLeads.find((l) => l.id === id);
    updateLeadStatus(id, newStatus);
    setLeadStatuses(getLeadStatuses());
    showToast(`Updated ${target?.company || "lead"} status to ${newStatus}.`, "success");
  };

  const handleExportCsv = () => {
    if (filteredLeads.length === 0) {
      showToast("No leads to export under current filters.", "warning");
      return;
    }
    const success = exportLeadsToCsv(filteredLeads, "leadwise-leads.csv");
    if (success) {
      showToast(`Exported ${filteredLeads.length} leads to leadwise-leads.csv`, "success");
    }
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: "Lead Intelligence" }]} />

      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-indigo-400" />
              Prioritization Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              Lead Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Prioritize the companies most aligned with your target acquisition profile.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/scoring"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700 transition-colors shadow-2xs"
            >
              <SlidersHorizontal size={13} className="text-indigo-400" />
              <span>Scoring Profile</span>
            </Link>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/30"
              aria-label="Export filtered leads to CSV"
            >
              <ArrowDownToLine size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Compact KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            label="Total Companies"
            value={initialLeads.length}
            subtext="In active workspace"
            supportingContext="Fictional set"
            icon={Building2}
          />
          <StatCard
            label="High-Fit Leads"
            value={highFitCount}
            subtext="Fit score ≥ 80 / 100"
            supportingContext={`${Math.round((highFitCount / initialLeads.length) * 100)}% of total`}
            icon={Target}
            highlight
          />
          <StatCard
            label="Verified Records"
            value={verifiedCount}
            subtext={`${verifiedCount} of ${initialLeads.length} flagged`}
            supportingContext="Registry checked"
            icon={CheckCircle2}
          />
          <StatCard
            label="Saved Leads"
            value={savedLeadIds.length}
            subtext="Shortlisted for review"
            supportingContext="Saved in local state"
            icon={Bookmark}
          />
        </div>

        {/* Lead Table Container */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 shadow-md overflow-hidden">
          {/* Filter Toolbar */}
          <LeadFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            industries={industries}
            locations={locations}
            savedCount={savedLeadIds.length}
            totalFilteredCount={filteredLeads.length}
            totalCount={scoredLeads.length}
          />

          {/* Table */}
          <LeadTable
            leads={filteredLeads}
            savedLeadIds={savedLeadIds}
            onToggleSave={handleToggleSave}
            onStatusChange={handleStatusChange}
            onClearFilters={handleResetFilters}
          />

          {/* Footer Line */}
          <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>
              Showing <b className="text-slate-200">{filteredLeads.length}</b> of{" "}
              {scoredLeads.length} sample companies
            </span>
            <span className="text-slate-500">
              Lead Fit Score is calculated deterministically via your active Scoring Profile.
            </span>
          </div>
        </div>

        {/* Disclaimers & Methodology Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex items-start gap-2.5 leading-relaxed">
          <Info size={15} className="text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Demo dataset:</span> All company
            records, financial metrics, and headcounts are fictional sample data constructed
            for evaluation. Scores are a prioritization heuristic based on target search
            criteria, not a predictive probability of transaction completion.
          </div>
        </div>
      </main>
    </>
  );
}
