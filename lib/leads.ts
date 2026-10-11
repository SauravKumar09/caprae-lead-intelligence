import initialLeadsData from "../data/leads.json";

export type PipelineStatus = "New" | "Contacted" | "Qualified" | "Disqualified";
export type VerificationStatus = "Verified" | "Needs review" | "Incomplete";

export interface Lead {
  id: string;
  company: string;
  website: string;
  industry: string;
  location: string;
  revenue: number; // in Millions USD
  employees: number;
  description: string;
  source: string;
  status: PipelineStatus;
  verified: boolean;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string;
  dataCompleteness: number; // percentage (0-100)
}

export interface ScoreBreakdown {
  industry: {
    earned: number;
    max: number;
    reason: string;
  };
  revenue: {
    earned: number;
    max: number;
    reason: string;
  };
  employees: {
    earned: number;
    max: number;
    reason: string;
  };
  location: {
    earned: number;
    max: number;
    reason: string;
  };
}

export type FitTier = "High Fit" | "Medium Fit" | "Low Fit";

export interface ScoredLead extends Lead {
  fitScore: number;
  fitTier: FitTier;
  breakdown: ScoreBreakdown;
  scoreExplanation: string;
}

export const initialLeads: Lead[] = initialLeadsData as Lead[];

export const PIPELINE_STATUS_OPTIONS: PipelineStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Disqualified",
];

export const VERIFICATION_STATUS_OPTIONS: VerificationStatus[] = [
  "Verified",
  "Needs review",
  "Incomplete",
];

export function getCompanyInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CO";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
