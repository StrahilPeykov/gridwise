export type PC4 = string; // e.g. "1102"
export type HeatingType = 'district' | 'gas-boiler' | 'electric' | 'hybrid-heat-pump' | 'unknown';
export type Tenure = 'renter' | 'owner' | 'vve';
export type HomeType = 'apartment' | 'row' | 'detached' | 'semi-detached' | 'maisonette' | 'unknown';
export type DataConsent = 'none' | 'temporary' | 'full';
export type PriorityKey = 'save-money' | 'warmer-home' | 'climate-impact' | 'grid-stability';

export interface UserProfile {
  lang: 'en' | 'nl';
  pc4: PC4; // first 4 postcode digits
  investmentCapacityEUR: number; // upfront budget
  homeType: HomeType;
  buildYearBand: 'pre-1992' | '1992-2005' | 'post-2005' | 'unknown';
  tenure: Tenure;
  heating: HeatingType;
  monthlyBillBand: 'under-100' | '100-200' | '200-300' | '300-plus' | 'unknown';
  comfortPriority: PriorityKey; // Primary priority (derived if not explicitly chosen)
  priorities: string[]; // Multiple priorities allowed
  priorityRatings?: Partial<Record<PriorityKey, 1 | 2 | 3 | 4 | 5>>; // 1–5 range
  dataConsent: DataConsent; // Privacy preference
  consentExpiresAt?: number; // Epoch ms; only for 'temporary'
  habits: { 
    laundryPerWeek: number; 
    dishwasher: boolean; 
    nightSetback: boolean; 
  };
  autoFillData?: {
    energyLabel: string;
    buildYear: number;
    homeSize: string;
    roofSuitability: string;
    districtHeatingAvailable: boolean;
    gridConstrained: boolean;
    roomSizes?: { name: string; areaM2: number }[];
  };
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
  event: 'onboarding_completed' | 'action_viewed' | 'pledge_made' | 'coach_booked' | 'action_status_changed';
  pc4: PC4;
  payload?: Record<string, unknown>;
}

// Policy insight types for Admin dashboard
export interface PolicyInsight {
  id: string;
  category: 'subsidy_gap' | 'barrier_identification' | 'success_pattern' | 'demographic_trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  affectedAreas: PC4[];
  recommendation: string;
  dataPoints: number;
}

export interface DistrictStats {
  pc4: PC4;
  participantCount: number;
  topActions: string[];
  averageInvestmentCapacity: number;
  gridConstrained: boolean;
  completionRate: number;
  commonBarriers: string[];
  energyCooperativeInterest: number;
}
