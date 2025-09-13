import React, { useEffect, useMemo, useRef, useState } from 'react';

type Mode = 'participation' | 'barriers' | 'success';

type TileDatum = {
  pc4: string;
  value: number; // 0..1 normalized
  meta?: Record<string, unknown>;
};

declare global {
  interface Window {
    L?: any;
    __leafletLoading?: boolean;
  }
}

function ensureLeaflet(): Promise<any> {
  if (window.L) return Promise.resolve(window.L);
  if (window.__leafletLoading) {
    return new Promise((resolve) => {
      const iv = setInterval(() => {
        if (window.L) {
          clearInterval(iv);
          resolve(window.L);
        }
      }, 50);
    });
  }
  window.__leafletLoading = true;
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function mixColor(a: string, b: string, t: number) {
  // a,b as #rrggbb
  const ah = a.replace('#', '');
  const bh = b.replace('#', '');
  const ai = [parseInt(ah.slice(0, 2), 16), parseInt(ah.slice(2, 4), 16), parseInt(ah.slice(4, 6), 16)];
  const bi = [parseInt(bh.slice(0, 2), 16), parseInt(bh.slice(2, 4), 16), parseInt(bh.slice(4, 6), 16)];
  const ci = ai.map((v, i) => Math.round(v + (bi[i] - v) * t));
  return `#${ci.map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export default function Pc4LeafletMap({
  data,
  mode,
  geometrySourceUrl = '/pc4.geojson',
  center = [52.37, 4.90],
  zoom = 11,
}: {
  data: TileDatum[];
  mode: Mode;
  geometrySourceUrl?: string;
  center?: [number, number];
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);

  // Lookup table for PC4 -> value/meta
  const lookup = useMemo(() => {
    const m = new Map<string, TileDatum>();
    data.forEach((d) => m.set(String(d.pc4), d));
    return m;
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    ensureLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;
        if (!mapRef.current) {
          const map = L.map(containerRef.current, { zoomControl: true }).setView(center, zoom);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);
          mapRef.current = map;
        }
        setMapReady(true);
      })
      .catch(() => setMapReady(false));
    return () => {
      cancelled = true;
    };
  }, [center[0], center[1], zoom]);

  // Update overlay when data/mode changes or when map becomes ready
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map || !mapReady) return;

    // Remove old overlay if present
    if (overlayRef.current) {
      overlayRef.current.remove();
      overlayRef.current = null;
    }

    const greenStart = '#dcfce7', greenEnd = '#22c55e';
    const redStart = '#fee2e2', redEnd = '#ef4444';
    const start = mode === 'barriers' ? redStart : greenStart;
    const end = mode === 'barriers' ? redEnd : greenEnd;

    const colorFor = (v: number) => mixColor(start, end, Math.max(0, Math.min(1, v)));

    const pc4PropCandidates = ['pc4', 'PC4', 'postcode', 'PC4_CODE'];

    const addGeoJson = (geojson: any) => {
      const layer = L.geoJSON(geojson, {
        style: (feat: any) => {
          const props = feat.properties || {};
          const pc4 = String(pc4PropCandidates.map((k) => props[k]).find((v: any) => v != null) ?? '');
          const val = lookup.get(pc4)?.value ?? 0;
          return {
            color: '#334155',
            weight: 0.5,
            fillColor: colorFor(val),
            fillOpacity: 0.7,
          };
        },
        onEachFeature: (feat: any, lyr: any) => {
          const props = feat.properties || {};
          const pc4 = String(pc4PropCandidates.map((k) => props[k]).find((v: any) => v != null) ?? '');
          const d = lookup.get(pc4);
          const pct = Math.round((d?.value ?? 0) * 100);
          const title = mode === 'barriers' ? `Non-adoption` : `Adoption`;
          lyr.bindTooltip(`PC4 ${pc4}<br/>${title}: ${pct}%`, { sticky: true });
        },
      });
      overlayRef.current = layer.addTo(map);
      // Fit bounds if features available
      try {
        const b = layer.getBounds();
        if (b && b.isValid()) map.fitBounds(b, { padding: [20, 20] });
      } catch {}
    };

    // Try loading GeoJSON from public path
    fetch(geometrySourceUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no-geojson'))))
      .then((gj) => addGeoJson(gj))
      .catch(async () => {
        // Fallback: if a centroid file exists, draw circles
        try {
          const centroids = (await import('../data/pc4_centroids.json')).default as Record<string, [number, number]>;
          const group = L.layerGroup();
          Object.entries(centroids).forEach(([pc4, latlng]) => {
            const d = lookup.get(String(pc4));
            if (!d) return;
            const val = Math.max(0, Math.min(1, d.value));
            const color = colorFor(val);
            const radius = 150 + 850 * val; // meters
            const circle = L.circle(latlng as any, { radius, color: '#334155', weight: 0.5, fillColor: color, fillOpacity: 0.6 });
            const pct = Math.round(val * 100);
            const title = mode === 'barriers' ? `Non-adoption` : `Adoption`;
            circle.bindTooltip(`PC4 ${pc4}<br/>${title}: ${pct}%`, { sticky: true });
            group.addLayer(circle);
          });
          overlayRef.current = group.addTo(map);
        } catch {
          // No overlay available
        }
      });
  }, [data, mode, geometrySourceUrl, mapReady, lookup]);

  return (
    <div>
      <div ref={containerRef} className="w-full h-80 rounded-lg overflow-hidden border border-slate-200"></div>
      <div className="mt-2 text-xs text-slate-600">
        Basemap: OpenStreetMap. Overlays use anonymized PC4 aggregates.
      </div>
    </div>
  );
}

