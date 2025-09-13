import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'gridwise-app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        recs: state.recs,
        credits: state.credits,
        pledges: state.pledges
        // Intentionally not persisting events to avoid unbounded growth
      })
    }
  )
);
