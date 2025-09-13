import constrainedAreas from '../data/grid_constrained_pc4.json';
import type { UserProfile } from '../types';

// Lightweight, offline stubs that simulate Kadaster and Municipal data fetches
// and simple AI-like extraction for demo purposes.

export type AutoFillData = NonNullable<UserProfile['autoFillData']>;

// Simulated external data fetch based on PC4 and simple heuristics
export async function prefillFromExternalSources(pc4Raw: string): Promise<AutoFillData> {
  const pc4 = (pc4Raw || '').trim();

  // Basic guards
  const validPc4 = /^[0-9]{4}$/.test(pc4) ? pc4 : '1000';

  // Heuristic energy label mapping by first digit
  const labelMap: Record<string, string> = { '1': 'D', '2': 'C', '3': 'B', '4': 'A', '5': 'B', '6': 'C', '7': 'E', '8': 'F', '9': 'G', '0': 'D' };
  const energyLabel = labelMap[validPc4[0]] || 'D';

  // Heuristic build year by last digit band
  const last = Number(validPc4[3]);
  const buildYear = last < 3 ? 1968 + last * 4 : last < 6 ? 1978 + (last - 3) * 5 : 1995 + (last - 6) * 4;

  // Home size heuristic
  const homeSize = `${70 + (Number(validPc4) % 40)}m²`;

  // Roof suitability heuristic
  const capacity = 6 + (Number(validPc4) % 4); // 6–9 panels
  const roofSuitability = `Good for ${capacity} panels`;

  // District heating availability heuristic (purely for demo)
  const districtHeatingAvailable = ['0', '2', '4', '6', '8'].includes(validPc4[3]);

  // Grid constrained flag using existing dataset
  const gridConstrained = constrainedAreas.includes(validPc4 as any);

  return {
    energyLabel,
    buildYear,
    homeSize,
    roofSuitability,
    districtHeatingAvailable,
    gridConstrained
  };
}

// Stubbed AI extraction from uploaded documents
export async function extractInfoFromUploads(_files: {
  energyLabelDoc?: File | null;
  floorplanImage?: File | null;
}): Promise<Partial<AutoFillData>> {
  // In a real implementation, this would call an OCR/vision endpoint.
  // Here we return deterministic demo values.
  const demoRooms = [
    { name: 'Living room', areaM2: 24 },
    { name: 'Bedroom', areaM2: 12 },
    { name: 'Kitchen', areaM2: 9 },
    { name: 'Storage/Utility', areaM2: 6 }
  ];

  return {
    // If energy label doc present, pretend we extracted a slightly better label
    energyLabel: 'C',
    homeSize: `${demoRooms.reduce((s, r) => s + r.areaM2, 0)}m²`,
    // @ts-expect-error: roomSizes is an optional extension we support at runtime
    roomSizes: demoRooms
  } as Partial<AutoFillData> as any;
}

