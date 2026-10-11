"use client";

import { PipelineStatus } from "./leads";
import { ScoringProfile, DEFAULT_SCORING_PROFILE } from "./scoring";

const STORAGE_KEYS = {
  SAVED: "leadwise_saved_leads_v2",
  STATUSES: "leadwise_statuses_v2",
  PROFILE: "leadwise_scoring_profile_v2",
};

export const SYNC_EVENT_NAME = "leadwise:sync";

function notifySync() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME));
  }
}

// ----------------- Saved Leads -----------------

export function getSavedLeadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isLeadSaved(id: string): boolean {
  return getSavedLeadIds().includes(id);
}

export function toggleSavedLead(id: string): { isSaved: boolean; count: number } {
  const current = getSavedLeadIds();
  let updated: string[];
  let isSaved = false;

  if (current.includes(id)) {
    updated = current.filter((x) => x !== id);
    isSaved = false;
  } else {
    updated = [...current, id];
    isSaved = true;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(updated));
    notifySync();
  } catch (e) {
    console.error("Failed to save lead in localStorage", e);
  }

  return { isSaved, count: updated.length };
}

// ----------------- Lead Pipeline Statuses -----------------

export function getLeadStatuses(): Record<string, PipelineStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATUSES);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function updateLeadStatus(id: string, status: PipelineStatus): void {
  const current = getLeadStatuses();
  current[id] = status;
  try {
    localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(current));
    notifySync();
  } catch (e) {
    console.error("Failed to update status in localStorage", e);
  }
}

// ----------------- Scoring Profile -----------------

export function getStoredScoringProfile(): ScoringProfile {
  if (typeof window === "undefined") return DEFAULT_SCORING_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_SCORING_PROFILE;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.weights && parsed.criteria) {
      return parsed;
    }
    return DEFAULT_SCORING_PROFILE;
  } catch {
    return DEFAULT_SCORING_PROFILE;
  }
}

export function saveStoredScoringProfile(profile: ScoringProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    notifySync();
  } catch (e) {
    console.error("Failed to save profile in localStorage", e);
  }
}

export function resetStoredScoringProfile(): ScoringProfile {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    notifySync();
  } catch (e) {
    console.error("Failed to reset profile", e);
  }
  return DEFAULT_SCORING_PROFILE;
}
