// src/types.ts
export type PC4 = string; // e.g. "1102"
export type HeatingType = 'district' | 'gas-boiler' | 'electric' | 'hybrid-heat-pump' | 'unknown';
export type Tenure = 'renter' | 'owner' | 'vve';
export type HomeType = 'apartment' | 'row' | 'detached' | 'semi-detached' | 'maisonette' | 'unknown';

export interface UserProfile {
  lang: 'en' | 'nl';
  pc4: PC4; // first 4 postcode digits
  homeType: HomeType;
  buildYearBand: 'pre-1992' | '1992-2005' | 'post-2005' | 'unknown';
  tenure: Tenure;
  heating: HeatingType;
  monthlyBillBand: 'under-100' | '100-200' | '200-300' | '300-plus' | 'unknown';
  comfortPriority: 'save-money' | 'warmer-home' | 'climate-impact';
  habits: { 
    laundryPerWeek: number; 
    dishwasher: boolean; 
    nightSetback: boolean; 
  }; // basic behavioral hooks
}

export interface ActionDefinition {
  id: string;
  category: 'low-cost' | 'medium' | 'major-investment';
  title: string;
  summary: string;
  audience: Tenure[]; // eligible tenures
  requires: Partial<UserProfile>; // coarse gates, e.g. { heating: 'gas-boiler' }
  costRangeEUR: [number, number];
  annualSavingsEUR: [number, number];
  annualCO2kg: [number, number];
  peakRelief: 'low' | 'medium' | 'high'; // peak hours 17:00–20:00 impact
  feasibility: 'easy' | 'moderate' | 'pro';
  renterFriendly: boolean;
  subsidies: SubsidyHint[]; // simple labels for demo
  howTo: string[]; // bullet steps
  evidence: string[]; // source labels only
}

export interface SubsidyHint { 
  code: 'ISDE' | 'Municipal' | 'Warmtefonds'; 
  note: string; 
}

export interface Recommendation extends ActionDefinition {
  score: number; // 0–100
  grade: 'A' | 'B' | 'C' | 'D';
}

export interface TelemetryEvent {
  t: number; // epoch ms
  sid: string; // anonymous session id
  event: 'onboarding_completed' | 'action_viewed' | 'pledge_made' | 'coach_booked';
  pc4: PC4;
  payload?: Record<string, unknown>;
}
