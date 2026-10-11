"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Bookmark,
  ArrowDownToLine,
  Search,
  X,
  ArrowRight,
  Eye,
  Trash2,
} from "lucide-react";
import Topbar from "../../components/Topbar";
import LeadScore from "../../components/LeadScore";
import StatusSelect from "../../components/StatusSelect";
import EmptyState from "../../components/EmptyState";
import CompanyLogo from "../../components/CompanyLogo";
import { useToast } from "../../components/Toast";
import { initialLeads, ScoredLead, PipelineStatus } from "../../lib/leads";
import { calculateLeadScore, ScoringProfile } from "../../lib/scoring";
import {
  getSavedLeadIds,
  toggleSavedLead,
  getLeadStatuses,
  updateLeadStatus,
  getStoredScoringProfile,
  SYNC_EVENT_NAME,
} from "../../lib/storage";
import { exportLeadsToCsv } from "../../lib/export";

export default function SavedLeadsPage() {
  const { showToast } = useToast();

  const [scoringProfile, setScoringProfile] = useState<ScoringProfile>(getStoredScoringProfile());
  const [savedLeadIds, setSavedLeadIds] = useState<string[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<Record<string, PipelineStatus>>({});
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All industries");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [scoreFilter, setScoreFilter] = useState("All scores");

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

  // Saved leads only, with scores computed
  const savedLeads: ScoredLead[] = useMemo(() => {
    return initialLeads
      .filter((lead) => savedLeadIds.includes(lead.id))
      .map((lead) => {
        const currentStatus = leadStatuses[lead.id] || lead.status;
        return calculateLeadScore({ ...lead, status: currentStatus }, scoringProfile);
      });
  }, [savedLeadIds, leadStatuses, scoringProfile]);

  const industries = useMemo(() => {
    return Array.from(new Set(savedLeads.map((l) => l.industry))).sort();
  }, [savedLeads]);

  const filteredSavedLeads = useMemo(() => {
    const q = search.trim().toLowerCase();

    return savedLeads.filter((lead) => {
      if (q) {
        const match =
          lead.company.toLowerCase().includes(q) ||
          lead.website.toLowerCase().includes(q) ||
          lead.industry.toLowerCase().includes(q) ||
          lead.location.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (industryFilter !== "All industries" && lead.industry !== industryFilter) {
        return false;
      }
      if (statusFilter !== "All statuses" && lead.status !== statusFilter) {
        return false;
      }
      if (scoreFilter === "High fit" && lead.fitScore < 80) return false;
      if (scoreFilter === "Medium fit" && (lead.fitScore < 65 || lead.fitScore >= 80)) return false;
      if (scoreFilter === "Low fit" && lead.fitScore >= 65) return false;

      return true;
    });
  }, [savedLeads, search, industryFilter, statusFilter, scoreFilter]);

  const handleRemove = (id: string) => {
    const target = initialLeads.find((l) => l.id === id);
    toggleSavedLead(id);
    setSavedLeadIds(getSavedLeadIds());
    showToast(`Removed ${target?.company || "company"} from saved leads.`, "info");
  };

  const handleStatusChange = (id: string, newStatus: PipelineStatus) => {
    const target = initialLeads.find((l) => l.id === id);
    updateLeadStatus(id, newStatus);
    setLeadStatuses(getLeadStatuses());
    showToast(`Updated status for ${target?.company || "company"} to ${newStatus}.`, "success");
  };

  const handleExportSaved = () => {
    if (filteredSavedLeads.length === 0) {
      showToast("No saved leads to export.", "warning");
      return;
    }
    const success = exportLeadsToCsv(filteredSavedLeads, "leadwise-saved-leads.csv");
    if (success) {
      showToast(`Exported ${filteredSavedLeads.length} saved leads to CSV.`, "success");
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: "Saved Leads" }]} />

      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              Shortlisted Prospects
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              Saved Leads
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Your shortlist of companies worth reviewing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700 transition-colors shadow-2xs"
            >
              <span>Browse Leads</span>
              <ArrowRight size={13} />
            </Link>

            <button
              onClick={handleExportSaved}
              disabled={savedLeads.length === 0}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs ${
                savedLeads.length > 0
                  ? "bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shadow-indigo-600/30"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60"
              }`}
              aria-label="Export saved leads to CSV"
            >
              <ArrowDownToLine size={13} />
              <span>Export Shortlist ({savedLeads.length})</span>
            </button>
          </div>
        </div>

        {/* Empty State when no leads are saved */}
        {savedLeads.length === 0 ? (
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 shadow-md">
            <EmptyState
              title="No saved leads yet."
              description="Save promising companies from the lead intelligence workspace to build your shortlist."
              actionLabel="Browse leads"
              onAction={() => (window.location.href = "/")}
              icon={Bookmark}
            />
          </div>
        ) : (
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 shadow-md overflow-hidden">
            {/* Filter Toolbar for Saved Leads */}
            <div className="p-3.5 border-b border-slate-800 flex flex-wrap items-center gap-2 bg-slate-950/70">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter saved companies..."
                  aria-label="Filter saved companies"
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 pl-8 pr-7 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    aria-label="Clear filter search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {industries.length > 1 && (
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  aria-label="Filter by industry"
                  className="text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 px-2.5 text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option className="bg-slate-900 text-slate-200">All industries</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind} className="bg-slate-900 text-slate-200">
                      {ind}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 px-2.5 text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option className="bg-slate-900 text-slate-200">All statuses</option>
                <option value="New" className="bg-slate-900 text-slate-200">New</option>
                <option value="Contacted" className="bg-slate-900 text-slate-200">Contacted</option>
                <option value="Qualified" className="bg-slate-900 text-slate-200">Qualified</option>
                <option value="Disqualified" className="bg-slate-900 text-slate-200">Disqualified</option>
              </select>

              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                aria-label="Filter by score tier"
                className="text-xs bg-slate-900 border border-slate-800 rounded-md py-1.5 px-2.5 text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option className="bg-slate-900 text-slate-200">All scores</option>
                <option value="High fit" className="bg-slate-900 text-slate-200">High fit (80+)</option>
                <option value="Medium fit" className="bg-slate-900 text-slate-200">Medium fit (65-79)</option>
                <option value="Low fit" className="bg-slate-900 text-slate-200">Low fit (&lt;65)</option>
              </select>

              <div className="ml-auto text-xs text-slate-500 font-medium">
                {filteredSavedLeads.length} saved{" "}
                {filteredSavedLeads.length === 1 ? "lead" : "leads"}
              </div>
            </div>

            {/* Saved Leads Table */}
            {filteredSavedLeads.length === 0 ? (
              <EmptyState
                title="No saved leads match your filters."
                description="Try clearing your search term or filter dropdowns."
                actionLabel="Reset saved filters"
                onAction={() => {
                  setSearch("");
                  setIndustryFilter("All industries");
                  setStatusFilter("All statuses");
                  setScoreFilter("All scores");
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[880px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th scope="col" className="py-3 px-4 w-[280px]">Company</th>
                      <th scope="col" className="py-3 px-4 w-[180px]">Industry</th>
                      <th scope="col" className="py-3 px-4 w-[100px] text-right">Revenue</th>
                      <th scope="col" className="py-3 px-4 w-[90px] text-right">Headcount</th>
                      <th scope="col" className="py-3 px-4 w-[180px]">Fit Score</th>
                      <th scope="col" className="py-3 px-4 w-[130px]">Status</th>
                      <th scope="col" className="py-3 px-4 w-[90px] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs">
                    {filteredSavedLeads.map((lead) => {
                      return (
                        <tr
                          key={lead.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <CompanyLogo company={lead.company} industry={lead.industry} size="md" />
                              <div className="min-w-0">
                                <Link
                                  href={`/companies/${lead.id}`}
                                  className="font-bold text-white hover:text-indigo-400 transition-colors block truncate max-w-[200px]"
                                  title={lead.company}
                                >
                                  {lead.company}
                                </Link>
                                <span className="text-[11px] text-slate-400 block truncate max-w-[190px]">
                                  {lead.website}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-300 font-medium">
                            {lead.industry}
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-white tabular-nums">
                            ${lead.revenue.toFixed(1)}M
                          </td>

                          <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                            {lead.employees}
                          </td>

                          <td className="py-3 px-4">
                            <LeadScore score={lead.fitScore} tier={lead.fitTier} />
                          </td>

                          <td className="py-3 px-4">
                            <StatusSelect
                              status={lead.status}
                              leadId={lead.id}
                              leadName={lead.company}
                              onChange={(newStatus) => handleStatusChange(lead.id, newStatus)}
                            />
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Link
                                href={`/companies/${lead.id}`}
                                className="p-1.5 rounded-md border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 bg-slate-900 transition-colors"
                                aria-label={`View ${lead.company}`}
                                title="View intelligence"
                              >
                                <Eye size={13} />
                              </Link>
                              <button
                                onClick={() => handleRemove(lead.id)}
                                className="p-1.5 rounded-md border border-rose-900/60 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 hover:text-rose-200 transition-colors"
                                aria-label={`Remove ${lead.company} from saved leads`}
                                title="Remove from shortlist"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
