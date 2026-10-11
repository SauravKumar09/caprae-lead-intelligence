"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  ShieldCheck,
  SlidersHorizontal,
  ArrowDownToLine,
  Activity,
  FileText,
} from "lucide-react";
import Topbar from "../../../components/Topbar";
import LeadScore from "../../../components/LeadScore";
import ScoreBreakdown from "../../../components/ScoreBreakdown";
import StatusSelect from "../../../components/StatusSelect";
import SaveLeadButton from "../../../components/SaveLeadButton";
import CompanyLogo from "../../../components/CompanyLogo";
import { useToast } from "../../../components/Toast";
import { initialLeads, ScoredLead, PipelineStatus } from "../../../lib/leads";
import { calculateLeadScore, ScoringProfile } from "../../../lib/scoring";
import {
  getSavedLeadIds,
  toggleSavedLead,
  getLeadStatuses,
  updateLeadStatus,
  getStoredScoringProfile,
  SYNC_EVENT_NAME,
} from "../../../lib/storage";
import { exportLeadsToCsv } from "../../../lib/export";

export default function CompanyDetailPage() {
  const params = useParams();
  const { showToast } = useToast();

  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [scoringProfile, setScoringProfile] = useState<ScoringProfile>(getStoredScoringProfile());
  const [savedLeadIds, setSavedLeadIds] = useState<string[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<Record<string, PipelineStatus>>({});

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

  const rawLead = useMemo(() => {
    return initialLeads.find((l) => l.id === id);
  }, [id]);

  const scoredLead: ScoredLead | null = useMemo(() => {
    if (!rawLead) return null;
    const currentStatus = leadStatuses[rawLead.id] || rawLead.status;
    const leadWithStatus = { ...rawLead, status: currentStatus };
    return calculateLeadScore(leadWithStatus, scoringProfile);
  }, [rawLead, leadStatuses, scoringProfile]);

  if (!rawLead || !scoredLead) {
    return (
      <>
        <Topbar breadcrumbs={[{ label: "Lead Intelligence", href: "/" }, { label: "Not Found" }]} />
        <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-3 border border-slate-700">
            <Building2 size={24} />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Company Record Not Found</h1>
          <p className="text-xs text-slate-400 mb-4 max-w-sm">
            We couldn&apos;t locate a lead record matching ID &quot;{id}&quot;. It may have been removed or never existed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Lead Intelligence</span>
          </Link>
        </main>
      </>
    );
  }

  const isSaved = savedLeadIds.includes(scoredLead.id);

  const handleToggleSave = () => {
    const { isSaved: nowSaved } = toggleSavedLead(scoredLead.id);
    setSavedLeadIds(getSavedLeadIds());
    showToast(
      nowSaved
        ? `Added ${scoredLead.company} to shortlist.`
        : `Removed ${scoredLead.company} from saved leads.`,
      "info"
    );
  };

  const handleStatusChange = (newStatus: PipelineStatus) => {
    updateLeadStatus(scoredLead.id, newStatus);
    setLeadStatuses(getLeadStatuses());
    showToast(`Updated status for ${scoredLead.company} to ${newStatus}.`, "success");
  };

  const handleExportSingle = () => {
    const success = exportLeadsToCsv([scoredLead], `${scoredLead.company.toLowerCase().replace(/[^a-z0-9]/g, "-")}-lead.csv`);
    if (success) {
      showToast(`Exported lead intelligence for ${scoredLead.company}.`, "success");
    }
  };

  const getVerificationDisplay = () => {
    const v = scoredLead.verificationStatus || (scoredLead.verified ? "Verified" : "Needs review");
    if (v === "Verified") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
          <CheckCircle2 size={12} className="text-emerald-400" />
          <span>Verified Record</span>
        </span>
      );
    }
    if (v === "Needs review") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded">
          <AlertCircle size={12} className="text-amber-400" />
          <span>Needs Review</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
        <HelpCircle size={12} className="text-slate-500" />
        <span>Incomplete Data</span>
      </span>
    );
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: "Lead Intelligence", href: "/" },
          { label: scoredLead.company },
        ]}
      />

      <main className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Breadcrumb Back Button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Lead Intelligence</span>
          </Link>
        </div>

        {/* Company Header Card */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <CompanyLogo company={scoredLead.company} industry={scoredLead.industry} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {scoredLead.company}
                </h1>
                {getVerificationDisplay()}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                <a
                  href={`https://${scoredLead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>{scoredLead.website}</span>
                  <ArrowUpRight size={11} />
                </a>
                <span>•</span>
                <span className="text-slate-300 font-medium">{scoredLead.industry}</span>
                <span>•</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin size={11} className="text-slate-500" />
                  {scoredLead.location}
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <SaveLeadButton
              isSaved={isSaved}
              onToggle={handleToggleSave}
              leadName={scoredLead.company}
              variant="button"
            />

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <StatusSelect
                status={scoredLead.status}
                leadId={scoredLead.id}
                leadName={scoredLead.company}
                onChange={handleStatusChange}
                size="md"
              />
            </div>

            <button
              onClick={handleExportSingle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-900 border border-slate-750 text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Export lead record"
            >
              <ArrowDownToLine size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Column (2 spans): Fit Engine & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Fit Score & Breakdown Panel */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Proprietary Heuristic
                  </div>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    Lead Fit Evaluation
                  </h2>
                </div>
                <Link
                  href="/scoring"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <SlidersHorizontal size={12} />
                  <span>Adjust Profile Weights</span>
                </Link>
              </div>

              {/* Large Score Indicator */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <LeadScore
                    score={scoredLead.fitScore}
                    tier={scoredLead.fitTier}
                    size="lg"
                  />
                </div>
                <div className="sm:text-right text-xs text-slate-400 max-w-xs">
                  <span className="font-semibold text-slate-200">Target Profile: </span>
                  {scoringProfile.name}
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Weights: {scoringProfile.weights.industry}% Ind, {scoringProfile.weights.revenue}% Rev, {scoringProfile.weights.employees}% Size, {scoringProfile.weights.location}% Loc
                  </p>
                </div>
              </div>

              {/* Explainable Factor Breakdown */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Score Contribution Breakdown
                </h3>
                <ScoreBreakdown
                  breakdown={scoredLead.breakdown}
                  totalScore={scoredLead.fitScore}
                />
              </div>
            </div>

            {/* Why This Lead (Explainable Rationale) */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                  <Activity size={14} />
                </div>
                <h2 className="text-sm font-bold text-white">
                  Why This Lead Matters
                </h2>
              </div>
              <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-900/60 text-xs text-slate-200 leading-relaxed font-medium">
                {scoredLead.scoreExplanation}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                This analysis is generated directly from your active target acquisition parameters. It clarifies whether a company represents a primary sweet-spot opportunity or an adjacent expansion target before outreach begins.
              </p>
            </div>

            {/* Business Description */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-2.5">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-indigo-400" />
                <h2 className="text-sm font-bold text-white">
                  Business Description & Commercial Focus
                </h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {scoredLead.description}
              </p>
            </div>
          </div>

          {/* Right Column (1 span): Quick Facts & Data Quality */}
          <div className="space-y-6">
            {/* Quick Metrics Card */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-md space-y-3.5">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
                Operating Profile
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <DollarSign size={13} className="text-slate-500" />
                    Est. Revenue
                  </span>
                  <span className="font-bold text-white tabular-nums">
                    ${scoredLead.revenue.toFixed(1)}M USD
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users size={13} className="text-slate-500" />
                    Headcount
                  </span>
                  <span className="font-bold text-white tabular-nums">
                    {scoredLead.employees} employees
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Building2 size={13} className="text-slate-500" />
                    Primary Sector
                  </span>
                  <span className="font-semibold text-slate-200 text-right max-w-[150px] truncate">
                    {scoredLead.industry}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-500" />
                    Headquarters
                  </span>
                  <span className="font-semibold text-slate-200">
                    {scoredLead.location}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Pipeline Stage</span>
                  <span className="font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 rounded text-[11px]">
                    {scoredLead.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Quality & Provenance Card */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-md space-y-3.5">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
                <ShieldCheck size={14} className="text-indigo-400" />
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Data Quality & Provenance
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Data Completeness</span>
                    <span className="font-bold text-emerald-400">
                      {scoredLead.dataCompleteness}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${scoredLead.dataCompleteness}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Source</span>
                  <span className="font-medium text-slate-200 text-right max-w-[150px] truncate">
                    {scoredLead.source}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar size={11} className="text-slate-500" />
                    Last Snapshot
                  </span>
                  <span className="font-medium text-slate-200">
                    {scoredLead.lastVerifiedAt}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Field Verification Flags:
                  </span>
                  <ul className="text-[11px] text-slate-300 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      Domain & website active
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      Industry categorization confirmed
                    </li>
                    <li className="flex items-center gap-1.5">
                      {scoredLead.verified ? (
                        <CheckCircle2 size={11} className="text-emerald-400" />
                      ) : (
                        <AlertCircle size={11} className="text-amber-400" />
                      )}
                      Financial scale estimate: {scoredLead.verified ? "Validated" : "Unconfirmed model"}
                    </li>
                  </ul>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-500 leading-tight">
                  <b>Evaluation note:</b> This sample company record is fictional. Real-world enrichment requires authorized API connections, automated deduplication, and regulatory compliance.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
