"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Target,
  Sparkles,
} from "lucide-react";
import Topbar from "../../components/Topbar";
import { useToast } from "../../components/Toast";
import { initialLeads } from "../../lib/leads";
import {
  ScoringProfile,
  DEFAULT_SCORING_PROFILE,
  calculateLeadScore,
} from "../../lib/scoring";
import {
  getStoredScoringProfile,
  saveStoredScoringProfile,
  resetStoredScoringProfile,
} from "../../lib/storage";

export default function ScoringProfilePage() {
  const { showToast } = useToast();

  const [profile, setProfile] = useState<ScoringProfile>(DEFAULT_SCORING_PROFILE);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    const loaded = getStoredScoringProfile();
    setProfile(loaded);
  }, []);

  // All available unique industries from data
  const allIndustries = useMemo(() => {
    return Array.from(new Set(initialLeads.map((l) => l.industry))).sort();
  }, []);

  // Weights sum calculation
  const totalWeight =
    (profile.weights.industry || 0) +
    (profile.weights.revenue || 0) +
    (profile.weights.employees || 0) +
    (profile.weights.location || 0);

  const isValidWeight = totalWeight === 100;

  // Live simulation of how current profile scores the dataset
  const simulationResults = useMemo(() => {
    const simulated = initialLeads.map((l) => calculateLeadScore(l, profile));
    const high = simulated.filter((l) => l.fitScore >= 80).length;
    const medium = simulated.filter((l) => l.fitScore >= 65 && l.fitScore < 80).length;
    const low = simulated.filter((l) => l.fitScore < 65).length;
    return { high, medium, low, total: simulated.length };
  }, [profile]);

  // Handlers for profile updates
  const handleWeightChange = (key: keyof ScoringProfile["weights"], val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setProfile((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: clamped,
      },
    }));
  };

  const toggleIndustry = (ind: string) => {
    setProfile((prev) => {
      const current = prev.criteria.preferredIndustries;
      const updated = current.includes(ind)
        ? current.filter((i) => i !== ind)
        : [...current, ind];
      return {
        ...prev,
        criteria: {
          ...prev.criteria,
          preferredIndustries: updated,
        },
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidWeight) {
      showToast(
        `Weights must total exactly 100% (currently ${totalWeight}%).`,
        "warning"
      );
      return;
    }

    const updatedProfile: ScoringProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };

    saveStoredScoringProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsSavedRecently(true);
    showToast("Scoring profile saved. Leads recalculated across workspace.", "success");
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const handleReset = () => {
    const defaultProf = resetStoredScoringProfile();
    setProfile(defaultProf);
    showToast("Reset to default acquisition profile.", "info");
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: "Scoring Profile" }]} />

      <main className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal size={12} className="text-indigo-400" />
              Profile Configuration
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              Scoring Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Define what a high-value company looks like for your current search.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700 transition-colors shadow-2xs"
            >
              <RotateCcw size={13} className="text-slate-400" />
              <span>Reset to Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isValidWeight}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                isValidWeight
                  ? "bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shadow-indigo-600/30"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60"
              }`}
            >
              <Save size={13} />
              <span>Save Scoring Profile</span>
            </button>
          </div>
        </div>

        {/* Live Impact Simulation Box */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800/80 text-indigo-400 flex items-center justify-center shrink-0">
              <Target size={20} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Simulation on Dataset
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Estimated distribution of {simulationResults.total} companies under current configuration:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3.5 py-2 rounded-lg bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 font-medium">
              <span className="font-extrabold text-sm text-emerald-200 mr-1.5">
                {simulationResults.high}
              </span>
              High Fit (80+)
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-amber-950/70 border border-amber-800/80 text-amber-300 font-medium">
              <span className="font-extrabold text-sm text-amber-200 mr-1.5">
                {simulationResults.medium}
              </span>
              Medium Fit (65–79)
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-300 font-medium">
              <span className="font-extrabold text-sm text-white mr-1.5">
                {simulationResults.low}
              </span>
              Low Fit (&lt;65)
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Weights */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-white">
                  1. Component Scoring Weights
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allocate percentage weights to each intelligence dimension. The total must equal 100%.
                </p>
              </div>

              {/* Validation Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${
                  isValidWeight
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/80"
                    : "bg-rose-950/80 text-rose-300 border-rose-800/80"
                }`}
              >
                {isValidWeight ? (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Total: 100% (Valid)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={13} />
                    <span>Total: {totalWeight}% (Must equal 100%)</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Industry Weight */}
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  Industry Fit Weight
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={profile.weights.industry}
                    onChange={(e) =>
                      handleWeightChange("industry", parseInt(e.target.value))
                    }
                    className="w-full text-xs font-bold bg-slate-900 border border-slate-750 rounded px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">%</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Prioritizes companies in selected target industries.
                </p>
              </div>

              {/* Revenue Weight */}
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  Revenue Fit Weight
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={profile.weights.revenue}
                    onChange={(e) =>
                      handleWeightChange("revenue", parseInt(e.target.value))
                    }
                    className="w-full text-xs font-bold bg-slate-900 border border-slate-750 rounded px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">%</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Rewards financial scale within your deal size parameters.
                </p>
              </div>

              {/* Company Size Weight */}
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  Company Size Weight
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={profile.weights.employees}
                    onChange={(e) =>
                      handleWeightChange("employees", parseInt(e.target.value))
                    }
                    className="w-full text-xs font-bold bg-slate-900 border border-slate-750 rounded px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">%</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Rewards established headcount and operational delegation.
                </p>
              </div>

              {/* Location Weight */}
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  Location Fit Weight
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={profile.weights.location}
                    onChange={(e) =>
                      handleWeightChange("location", parseInt(e.target.value))
                    }
                    className="w-full text-xs font-bold bg-slate-900 border border-slate-750 rounded px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">%</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Evaluates alignment with priority target geographical boundaries.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Preferred Industries */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-3.5">
            <div>
              <h2 className="text-sm font-bold text-white">
                2. Preferred Industries
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click industries to mark them as high-priority target sectors. Unselected industries receive lower tier points.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {allIndustries.map((ind) => {
                const isSelected = profile.criteria.preferredIndustries.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleIndustry(ind)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 ${
                      isSelected
                        ? "bg-indigo-950/90 border-indigo-600 text-indigo-300 font-bold shadow-xs"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? "bg-indigo-400" : "bg-slate-600"
                      }`}
                    />
                    <span>{ind}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Target Revenue & Headcount Bands */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Revenue */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-3.5">
              <div>
                <h2 className="text-sm font-bold text-white">
                  3. Target Revenue Range ($M USD)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sweet spot annual revenue for standard ETA platform investment.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Minimum Revenue ($M)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={profile.criteria.revenueMin}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        criteria: {
                          ...prev.criteria,
                          revenueMin: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full text-xs font-bold bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Maximum Revenue ($M)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={profile.criteria.revenueMax}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        criteria: {
                          ...prev.criteria,
                          revenueMax: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full text-xs font-bold bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Target Headcount */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-3.5">
              <div>
                <h2 className="text-sm font-bold text-white">
                  4. Target Headcount Range
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Optimal employee size to ensure operational continuity.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Minimum Employees
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={profile.criteria.employeesMin}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        criteria: {
                          ...prev.criteria,
                          employeesMin: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full text-xs font-bold bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Maximum Employees
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={profile.criteria.employeesMax}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        criteria: {
                          ...prev.criteria,
                          employeesMax: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full text-xs font-bold bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button & Transparency Note */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-start gap-2 max-w-xl">
              <Info size={15} className="text-slate-500 shrink-0 mt-0.5" />
              <span>
                Scores are a prioritization heuristic based on the current profile. They are not a prediction of acquisition likelihood.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Back to Leads
              </Link>

              <button
                type="submit"
                disabled={!isValidWeight}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                  isValidWeight
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shadow-indigo-600/30"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60"
                }`}
              >
                <Save size={14} />
                <span>Save Scoring Profile</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
