// src/store.ts
import { create } from 'zustand';
import type { Recommendation, TelemetryEvent, UserProfile } from './types';

interface AppState {
  profile?: UserProfile;
  recs: Recommendation[];
  credits: number;
  pledges: { offPeakUsage: boolean; nightSetback: boolean };
  events: TelemetryEvent[];
  setProfile: (p: UserProfile) => void;
  setRecs: (r: Recommendation[]) => void;
  addCredits: (n: number) => void;
  togglePledge: (k: keyof AppState['pledges']) => void;
  track: (e: TelemetryEvent) => void;
}

export const useApp = create<AppState>((set, get) => ({
  profile: undefined,
  recs: [],
  credits: 0,
  pledges: { offPeakUsage: false, nightSetback: false },
  events: [],
  setProfile: (p) => set({ profile: p }),
  setRecs: (r) => set({ recs: r }),
  addCredits: (n) => set({ credits: get().credits + n }),
  togglePledge: (k) => set({ pledges: { ...get().pledges, [k]: !get().pledges[k] } }),
  track: (e) => set({ events: [...get().events, e] })
}));
