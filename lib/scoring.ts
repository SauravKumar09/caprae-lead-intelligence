import { Lead, ScoredLead, FitTier, ScoreBreakdown } from "./leads";

export interface ScoringWeights {
  industry: number; // default 30
  revenue: number;  // default 30
  employees: number;// default 20
  location: number; // default 20
}

export interface ScoringCriteria {
  preferredIndustries: string[];
  revenueMin: number; // in Millions USD (e.g. 10)
  revenueMax: number; // in Millions USD (e.g. 30)
  employeesMin: number; // e.g. 50
  employeesMax: number; // e.g. 200
  targetCountry: string; // e.g. "US"
}

export interface ScoringProfile {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  weights: ScoringWeights;
  criteria: ScoringCriteria;
}

export const DEFAULT_SCORING_PROFILE: ScoringProfile = {
  id: "profile-default",
  name: "Core ETA Acquisition Profile",
  description: "Targets B2B light industrials, business services, and distributions in the US with $10M–$30M revenue and 50–200 employees.",
  updatedAt: "2026-10-11T00:00:00Z",
  weights: {
    industry: 30,
    revenue: 30,
    employees: 20,
    location: 20,
  },
  criteria: {
    preferredIndustries: [
      "Industrial Manufacturing",
      "Packaging",
      "Business Services",
      "Wholesale Distribution",
      "Industrial Services",
      "Environmental Services",
      "Transportation Services",
    ],
    revenueMin: 10,
    revenueMax: 30,
    employeesMin: 50,
    employeesMax: 200,
    targetCountry: "US",
  },
};

export function calculateLeadScore(lead: Lead, profile: ScoringProfile = DEFAULT_SCORING_PROFILE): ScoredLead {
  const { weights, criteria } = profile;

  // 1. Industry Scoring
  let industryEarned = 0;
  let industryReason = "";
  const isPreferred = criteria.preferredIndustries.includes(lead.industry);

  if (isPreferred) {
    industryEarned = weights.industry;
    industryReason = `Primary target sector (${lead.industry}).`;
  } else {
    // Partial credit for adjacent B2B services
    industryEarned = Math.round(weights.industry * 0.45);
    industryReason = `Secondary industry (${lead.industry}); outside priority target sectors.`;
  }

  // 2. Revenue Scoring
  let revenueEarned = 0;
  let revenueReason = "";
  const rev = lead.revenue;
  if (rev >= criteria.revenueMin && rev <= criteria.revenueMax) {
    revenueEarned = weights.revenue;
    revenueReason = `$${rev.toFixed(1)}M falls right inside target sweet spot ($${criteria.revenueMin}M–$${criteria.revenueMax}M).`;
  } else if (rev >= criteria.revenueMin * 0.6 && rev <= criteria.revenueMax * 1.5) {
    revenueEarned = Math.round(weights.revenue * 0.65);
    if (rev < criteria.revenueMin) {
      revenueReason = `$${rev.toFixed(1)}M is slightly below ideal $${criteria.revenueMin}M floor, but remains scalable.`;
    } else {
      revenueReason = `$${rev.toFixed(1)}M exceeds $${criteria.revenueMax}M target ceiling; may require larger capital syndicate.`;
    }
  } else {
    revenueEarned = Math.round(weights.revenue * 0.3);
    revenueReason = `$${rev.toFixed(1)}M significantly diverges from $${criteria.revenueMin}M–$${criteria.revenueMax}M acquisition criteria.`;
  }

  // 3. Employee Count Scoring
  let employeeEarned = 0;
  let employeeReason = "";
  const emp = lead.employees;
  if (emp >= criteria.employeesMin && emp <= criteria.employeesMax) {
    employeeEarned = weights.employees;
    employeeReason = `${emp} employees indicates mature middle management and established operational structure.`;
  } else if (emp >= criteria.employeesMin * 0.5 && emp <= criteria.employeesMax * 1.6) {
    employeeEarned = Math.round(weights.employees * 0.6);
    if (emp < criteria.employeesMin) {
      employeeReason = `${emp} employees is leaner than ideal ${criteria.employeesMin}+ headcount threshold.`;
    } else {
      employeeReason = `${emp} employees represents higher organizational complexity than the 50–200 sweet spot.`;
    }
  } else {
    employeeEarned = Math.round(weights.employees * 0.25);
    employeeReason = `${emp} headcount deviates from target organizational size band.`;
  }

  // 4. Location Scoring
  let locationEarned = 0;
  let locationReason = "";
  const isTargetLoc = criteria.targetCountry === "US"
    ? lead.location.endsWith(", US")
    : lead.location.toLowerCase().includes(criteria.targetCountry.toLowerCase());

  if (isTargetLoc) {
    locationEarned = weights.location;
    locationReason = `Located in priority domestic market (${lead.location}).`;
  } else {
    locationEarned = Math.round(weights.location * 0.25);
    locationReason = `Located in cross-border territory (${lead.location}); out of primary domestic mandate.`;
  }

  const rawTotal = industryEarned + revenueEarned + employeeEarned + locationEarned;
  const fitScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  let fitTier: FitTier = "Low Fit";
  if (fitScore >= 80) fitTier = "High Fit";
  else if (fitScore >= 65) fitTier = "Medium Fit";

  // Synthesize concise, explainable rationale
  const explanationPhrases: string[] = [];
  if (isPreferred) {
    explanationPhrases.push(`Operates in high-priority industry (${lead.industry})`);
  }
  if (rev >= criteria.revenueMin && rev <= criteria.revenueMax) {
    explanationPhrases.push(`falls in target revenue band ($${rev.toFixed(1)}M)`);
  } else if (rev < criteria.revenueMin) {
    explanationPhrases.push(`revenue ($${rev.toFixed(1)}M) is below preferred $${criteria.revenueMin}M floor`);
  } else {
    explanationPhrases.push(`revenue ($${rev.toFixed(1)}M) is above $${criteria.revenueMax}M cap`);
  }

  if (emp >= criteria.employeesMin && emp <= criteria.employeesMax) {
    explanationPhrases.push(`headcount (${emp}) matches operational sweet spot`);
  }

  if (isTargetLoc) {
    explanationPhrases.push(`headquartered in target US geography`);
  } else {
    explanationPhrases.push(`non-target domestic geography (${lead.location})`);
  }

  const scoreExplanation = explanationPhrases.length > 0
    ? `${explanationPhrases[0].charAt(0).toUpperCase() + explanationPhrases[0].slice(1)}, ${explanationPhrases.slice(1).join(", ")}.`
    : `Scored ${fitScore}/100 according to active acquisition profile criteria.`;

  const breakdown: ScoreBreakdown = {
    industry: { earned: industryEarned, max: weights.industry, reason: industryReason },
    revenue: { earned: revenueEarned, max: weights.revenue, reason: revenueReason },
    employees: { earned: employeeEarned, max: weights.employees, reason: employeeReason },
    location: { earned: locationEarned, max: weights.location, reason: locationReason },
  };

  return {
    ...lead,
    fitScore,
    fitTier,
    breakdown,
    scoreExplanation,
  };
}

export function scoreAllLeads(leads: Lead[], profile: ScoringProfile = DEFAULT_SCORING_PROFILE): ScoredLead[] {
  return leads.map((lead) => calculateLeadScore(lead, profile));
}
