import { ScoredLead } from "./leads";

export function exportLeadsToCsv(leads: ScoredLead[], filename = "leadwise-leads.csv"): boolean {
  if (!leads || leads.length === 0) return false;

  const headers = [
    "Company",
    "Website",
    "Industry",
    "Location",
    "Estimated Revenue ($M)",
    "Employees",
    "Fit Score",
    "Fit Tier",
    "Verification",
    "Status",
    "Description",
    "Score Explanation",
  ];

  const escapeField = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map((l) => [
    escapeField(l.company),
    escapeField(l.website),
    escapeField(l.industry),
    escapeField(l.location),
    escapeField(l.revenue.toFixed(1)),
    escapeField(l.employees),
    escapeField(l.fitScore),
    escapeField(l.fitTier),
    escapeField(l.verificationStatus || (l.verified ? "Verified" : "Needs review")),
    escapeField(l.status),
    escapeField(l.description),
    escapeField(l.scoreExplanation),
  ]);

  const csvContent = [headers.map((h) => `"${h}"`).join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
