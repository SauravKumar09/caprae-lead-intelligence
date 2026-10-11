"use client";

import React from "react";
import Link from "next/link";
import { ScoredLead, PipelineStatus } from "../lib/leads";
import LeadScore from "./LeadScore";
import StatusSelect from "./StatusSelect";
import SaveLeadButton from "./SaveLeadButton";
import EmptyState from "./EmptyState";
import CompanyLogo from "./CompanyLogo";
import { ArrowUpRight, CheckCircle2, AlertCircle, HelpCircle, Eye } from "lucide-react";

interface LeadTableProps {
  leads: ScoredLead[];
  savedLeadIds: string[];
  onToggleSave: (id: string) => void;
  onStatusChange: (id: string, status: PipelineStatus) => void;
  onClearFilters?: () => void;
}

export default function LeadTable({
  leads,
  savedLeadIds,
  onToggleSave,
  onStatusChange,
  onClearFilters,
}: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <EmptyState
        title="No companies match your current filters."
        description="Try broadening your industry, location, revenue, or fit score criteria to surface more prospects."
        actionLabel="Clear all filters"
        onAction={onClearFilters}
      />
    );
  }

  const getVerificationBadge = (lead: ScoredLead) => {
    const v = lead.verificationStatus || (lead.verified ? "Verified" : "Needs review");
    if (v === "Verified") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-800/70 px-1.5 py-0.5 rounded">
          <CheckCircle2 size={11} className="text-emerald-400" />
          <span>Verified</span>
        </span>
      );
    }
    if (v === "Needs review") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/70 border border-amber-800/70 px-1.5 py-0.5 rounded">
          <AlertCircle size={11} className="text-amber-400" />
          <span>Review</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
        <HelpCircle size={11} className="text-slate-500" />
        <span>Incomplete</span>
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[980px]">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <th scope="col" className="py-3 px-4 w-[250px]">Company</th>
            <th scope="col" className="py-3 px-4 w-[160px]">Industry</th>
            <th scope="col" className="py-3 px-4 w-[120px]">Location</th>
            <th scope="col" className="py-3 px-4 w-[90px] text-right">Revenue</th>
            <th scope="col" className="py-3 px-4 w-[85px] text-right">Headcount</th>
            <th scope="col" className="py-3 px-4 w-[170px]">Fit Score</th>
            <th scope="col" className="py-3 px-4 w-[110px]">Verification</th>
            <th scope="col" className="py-3 px-4 w-[120px]">Pipeline Status</th>
            <th scope="col" className="py-3 px-4 w-[75px] text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70 text-xs">
          {leads.map((lead) => {
            const isSaved = savedLeadIds.includes(lead.id);

            return (
              <tr
                key={lead.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* Company Name & Domain */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <CompanyLogo company={lead.company} industry={lead.industry} size="md" />
                    <div className="min-w-0">
                      <Link
                        href={`/companies/${lead.id}`}
                        className="font-bold text-white hover:text-indigo-400 transition-colors block truncate max-w-[190px]"
                        title={lead.company}
                      >
                        {lead.company}
                      </Link>
                      <a
                        href={`https://${lead.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors truncate max-w-[160px]"
                        title={lead.website}
                      >
                        <span>{lead.website}</span>
                        <ArrowUpRight size={10} className="shrink-0" />
                      </a>
                    </div>
                  </div>
                </td>

                {/* Industry */}
                <td className="py-3 px-4 text-slate-300 font-medium truncate max-w-[160px]">
                  {lead.industry}
                </td>

                {/* Location */}
                <td className="py-3 px-4 text-slate-400 truncate max-w-[120px]">
                  {lead.location}
                </td>

                {/* Revenue */}
                <td className="py-3 px-4 text-right font-bold text-white tabular-nums">
                  ${lead.revenue.toFixed(1)}M
                </td>

                {/* Headcount */}
                <td className="py-3 px-4 text-right text-slate-300 font-medium tabular-nums">
                  {lead.employees}
                </td>

                {/* Fit Score */}
                <td className="py-3 px-4">
                  <LeadScore score={lead.fitScore} tier={lead.fitTier} />
                </td>

                {/* Data Quality / Verification */}
                <td className="py-3 px-4">
                  {getVerificationBadge(lead)}
                </td>

                {/* Pipeline Status Dropdown */}
                <td className="py-3 px-4">
                  <StatusSelect
                    status={lead.status}
                    leadId={lead.id}
                    leadName={lead.company}
                    onChange={(newStatus) => onStatusChange(lead.id, newStatus)}
                  />
                </td>

                {/* Actions: View Company & Bookmark */}
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      href={`/companies/${lead.id}`}
                      className="p-1.5 rounded-md border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 bg-slate-900 transition-colors"
                      aria-label={`View details for ${lead.company}`}
                      title="View intelligence detail"
                    >
                      <Eye size={13} />
                    </Link>
                    <SaveLeadButton
                      isSaved={isSaved}
                      onToggle={() => onToggleSave(lead.id)}
                      leadName={lead.company}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
