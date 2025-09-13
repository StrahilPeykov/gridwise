import React from 'react';

type Mode = 'participation' | 'barriers' | 'success';

type Tile = {
  pc4: string;
  value: number; // normalized 0..1
  meta?: {
    adoptionRate?: number;
    barrierRate?: number;
    reasonMatchRate?: number;
    willDo?: number;
    willNotDo?: number;
    topReason?: string;
  };
};

export default function Pc4TileMap({ data, mode }: { data: Tile[]; mode: Mode }) {
  const cols = Math.ceil(Math.sqrt(Math.max(1, data.length)));

  const colorFor = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    if (mode === 'barriers') {
      // light red -> strong red
      const alpha = 0.15 + clamped * 0.75;
      return `rgba(239, 68, 68, ${alpha})`; // tailwind red-500 base
    }
    // participation/success: light green -> strong green
    const alpha = 0.15 + clamped * 0.75;
    return `rgba(34, 197, 94, ${alpha})`; // tailwind green-500 base
  };

  const labelFor = (t: Tile) => {
    if (mode === 'barriers') {
      const rate = t.meta?.reasonMatchRate ?? t.meta?.barrierRate ?? t.value;
      return `${Math.round(rate * 100)}%`;
    }
    const rate = t.meta?.adoptionRate ?? t.value;
    return `${Math.round(rate * 100)}%`;
  };

  return (
    <div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {data.map((tile) => (
          <div key={tile.pc4} className="p-3 rounded-lg border border-slate-200 bg-white hover:shadow-sm">
            <div
              className="rounded-md h-20 w-full flex items-center justify-center text-sm font-medium"
              style={{ backgroundColor: colorFor(tile.value) }}
              title={
                `PC4 ${tile.pc4}\n` +
                (mode === 'barriers'
                  ? `Non-adoption: ${Math.round((tile.meta?.barrierRate ?? tile.value) * 100)}%\n` +
                    (tile.meta?.topReason ? `Top reason: ${tile.meta.topReason}` : '')
                  : `Adoption: ${Math.round((tile.meta?.adoptionRate ?? tile.value) * 100)}%`)
              }
            >
              <div className="text-center">
                <div className="text-xs text-slate-700">PC4 {tile.pc4}</div>
                <div className="text-base">{labelFor(tile)}</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
              <span>
                ✓ {tile.meta?.willDo ?? 0}
              </span>
              <span>
                ✕ {tile.meta?.willNotDo ?? 0}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
        <span>Legend:</span>
        {mode === 'barriers' ? (
          <>
            <span className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}></span>
              Low
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)' }}></span>
              High
            </span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}></span>
              Low
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.9)' }}></span>
              High
            </span>
          </>
        )}
      </div>
    </div>
  );
}

