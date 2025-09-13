// src/scoring.ts
import actions from './data/actions.json';
import constrained from './data/grid_constrained_pc4.json';
import type { ActionDefinition, Recommendation, UserProfile } from './types';

export const scoreActions = (profile: UserProfile): Recommendation[] => {
  const minSave = Math.min(...actions.map(a => a.annualSavingsEUR[0]));
  const maxSave = Math.max(...actions.map(a => a.annualSavingsEUR[1]));
  const inHotZone = constrained.includes(profile.pc4);

  // Filter by eligibility and investment capacity (keep low‑cost regardless)
  return actions
    .filter(a => isEligible(a, profile))
    .filter(a => a.category === 'low-cost' || a.costRangeEUR[0] <= (profile.investmentCapacityEUR ?? 0))
    .map(a => toRecommendation(a, profile, { minSave, maxSave, inHotZone }))
    .sort((a, b) => b.score - a.score);
};

const isEligible = (a: ActionDefinition, p: UserProfile): boolean => {
  if (a.audience && !a.audience.includes(p.tenure)) return false;
  if (a.requires?.heating && a.requires.heating !== p.heating) return false;
  // Add more eligibility checks as needed
  return true;
};

const toRecommendation = (
  a: ActionDefinition,
  p: UserProfile,
  ctx: { minSave: number; maxSave: number; inHotZone: boolean }
): Recommendation => {
  const peakMap = { low: 0.25, medium: 0.6, high: 1.0 } as const;
  const energyNorm = normalize(avg(a.annualSavingsEUR), ctx.minSave, ctx.maxSave);

  let wPeak = 0.5, wEnergy = 0.3, wEquity = 0.2;
  if (ctx.inHotZone) {
    wPeak = Math.min(0.5 * 1.3, 0.65);
    const sum = wPeak + wEnergy + wEquity;
    wPeak /= sum; 
    wEnergy /= sum; 
    wEquity /= sum; // re‑normalize to 1
  }

  const equity = (a.renterFriendly ? 0.7 : 0.3) + (avg(a.costRangeEUR) <= 100 ? 0.3 : 0);
  const score = 100 * (wPeak * peakMap[a.peakRelief] + wEnergy * energyNorm + wEquity * clamp01(equity));
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : 'D';

  return { ...a, score: Math.round(score), grade };
};

const avg = ([lo, hi]: [number, number]) => (lo + hi) / 2;
const normalize = (v: number, lo: number, hi: number) => (hi === lo ? 0.5 : (v - lo) / (hi - lo));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
