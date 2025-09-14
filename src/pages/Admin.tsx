import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { useApp } from '../store';
import { useTranslation } from '../i18n';
import constrainedAreas from '../data/grid_constrained_pc4.json';
import actions from '../data/actions.json';
import Pc4LeafletMap from '../components/Pc4LeafletMap';

// Enhanced policy insights for Amsterdam
const policyInsights = [
  {
    id: 'subsidy-gap-heat-pumps',
    category: 'subsidy_gap',
    title: 'Heat Pump Adoption Gap in Social Housing',
    description: 'Low uptake of heat pump installations in postcodes with high social housing concentration, despite 78% interest',
    impact: 'high',
    actionable: true,
    affectedAreas: ['1102', '1103', '1021'],
    recommendation: 'Increase VVE-specific support and collective installation programs',
    dataPoints: 340
  },
  {
    id: 'language-barrier',
    category: 'barrier_identification', 
    title: 'Language Accessibility Issues',
    description: 'Energy coach booking rates 60% lower in areas with high non-Dutch speaking populations',
    impact: 'high',
    actionable: true,
    affectedAreas: ['1012', '1013', '1016'],
    recommendation: 'Deploy multilingual energy coaches and translated materials',
    dataPoints: 180
  },
  {
    id: 'renter-energy-poverty',
    category: 'demographic_trend',
    title: 'Renter Energy Poverty Concentration',
    description: 'Renters in pre-1992 housing report 40% higher energy costs but lower action completion rates',
    impact: 'high',
    actionable: true,
    affectedAreas: ['1017', '1019', '1075'],
    recommendation: 'Strengthen tenant rights for energy improvements and landlord incentives',
    dataPoints: 295
  },
  {
    id: 'grid-smart-behavior',
    category: 'success_pattern',
    title: 'Peak-Shifting Success in Grid-Constrained Areas',
    description: 'Residents in grid-constrained areas show 85% higher adoption of off-peak energy behaviors',
    impact: 'medium',
    actionable: true,
    affectedAreas: constrainedAreas,
    recommendation: 'Expand grid-friendly behavior incentives city-wide',
    dataPoints: 420
  }
];

export default function EnhancedAdmin() {
  const { events, profile } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [mapView, setMapView] = useState<'participation' | 'barriers' | 'success'>('participation');
  const [selectedActionId, setSelectedActionId] = useState<string>('all');
  const [barrierFilter, setBarrierFilter] = useState<string>('all');

  // Enhanced mock data generation for demo
  const amsterdamAnalytics = useMemo(() => {
    const totalParticipants = 2847;
    const completedActions = 1205;
    const activeCoachConsultations = 380;
    const energyCooperativeInterest = 623;
    
    // Demographic breakdown
    const demographics = [
      { group: 'Renters', count: 1420, avgBudget: 180, completionRate: 34 },
      { group: 'Owners', count: 980, avgBudget: 4200, completionRate: 67 },
      { group: 'VVE Members', count: 447, avgBudget: 2800, completionRate: 52 }
    ];

    // Action effectiveness by category
    const actionEffectiveness = [
      { category: 'Low-Cost', views: 2340, accepts: 1870, completionRate: 80 },
      { category: 'Medium Investment', views: 1560, accepts: 680, completionRate: 45 },
      { category: 'Major Investment', views: 890, accepts: 250, completionRate: 28 }
    ];

    // Barrier analysis
    const topBarriers = [
      { barrier: 'Too expensive', count: 450, percentage: 38 },
      { barrier: 'Not suitable for my home', count: 320, percentage: 27 },
      { barrier: 'Need more information', count: 180, percentage: 15 },
      { barrier: 'No time right now', count: 150, percentage: 13 },
      { barrier: 'Other', count: 85, percentage: 7 }
    ];

    // District-level insights
    const districtInsights = [
      { pc4: '1012', name: 'Centrum-West', participants: 340, completionRate: 45, avgIncome: 'Medium', gridStrain: 'High' },
      { pc4: '1021', name: 'Noord', participants: 280, completionRate: 38, avgIncome: 'Low-Medium', gridStrain: 'Medium' },
      { pc4: '1075', name: 'Willemspark', participants: 220, completionRate: 72, avgIncome: 'High', gridStrain: 'Low' },
      { pc4: '1102', name: 'Zuidoost', participants: 410, completionRate: 35, avgIncome: 'Low', gridStrain: 'High' }
    ];

    return {
      totalParticipants,
      completedActions,
      activeCoachConsultations,
      energyCooperativeInterest,
      demographics,
      actionEffectiveness,
      topBarriers,
      districtInsights
    };
  }, []);

  // Derive top barrier insights from anonymized events (PC4-level only)
  const derivedTopBarriers = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      if (e.event === 'action_status_changed') {
        const p = (e.payload || {}) as any;
        if (p.status === 'will-not-do' && p.feedback) {
          const key = String(p.feedback)
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts).map(([barrier, count]) => ({
      barrier,
      count,
      percentage: total ? Math.round((count / total) * 100) : 0
    }));
  }, [events]);

  // Aggregate anonymized usage by PC4 and action from events
  const usageByPc4 = useMemo(() => {
    type ActionAgg = { willDo: number; willNotDo: number; reasons: Record<string, number> };
    const map = new Map<string, { pc4: string; actions: Record<string, ActionAgg>; totalWillDo: number; totalWillNotDo: number }>();

    const normReason = (r: unknown) => (r ? String(r) : 'other');

    events.forEach((e) => {
      if (e.event !== 'action_status_changed') return;
      const p = (e.payload || {}) as any;
      const pc4 = e.pc4;
      const actionId = p.actionId as string | undefined;
      const status = p.status as string | undefined;
      if (!pc4 || !actionId || !status) return;

      if (!map.has(pc4)) map.set(pc4, { pc4, actions: {}, totalWillDo: 0, totalWillNotDo: 0 });
      const entry = map.get(pc4)!;
      if (!entry.actions[actionId]) entry.actions[actionId] = { willDo: 0, willNotDo: 0, reasons: {} };
      const aa = entry.actions[actionId];

      if (status === 'will-do') {
        aa.willDo += 1;
        entry.totalWillDo += 1;
      } else if (status === 'will-not-do') {
        aa.willNotDo += 1;
        entry.totalWillNotDo += 1;
        const r = normReason(p.feedback);
        aa.reasons[r] = (aa.reasons[r] || 0) + 1;
      }
    });

    return map;
  }, [events]);

  // Map coverage: union of known districts, constrained areas, and any PC4 in events
  const pc4List = useMemo(() => {
    const set = new Set<string>();
    amsterdamAnalytics.districtInsights.forEach((d) => set.add(d.pc4));
    constrainedAreas.forEach((pc4) => set.add(pc4));
    events.forEach((e) => set.add(e.pc4));
    return Array.from(set).sort();
  }, [events, amsterdamAnalytics.districtInsights]);

  // Filter options
  const actionOptions = useMemo(() => [{ id: 'all', title: 'All actions' }, ...actions.map((a) => ({ id: a.id, title: a.title }))], []);
  const barrierOptions = useMemo(() => {
    const set = new Set<string>();
    usageByPc4.forEach((entry) => {
      Object.values(entry.actions).forEach((aa) => Object.keys(aa.reasons).forEach((r) => set.add(r)));
    });
    const pretty = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return ['all', ...Array.from(set)].map((r) => ({ id: r, title: r === 'all' ? 'All reasons' : pretty(r) }));
  }, [usageByPc4]);

  // Dataset for the map view
  const mapDataset = useMemo(() => {
    const hasEventUsage = (() => {
      let sum = 0;
      usageByPc4.forEach((e) => (sum += e.totalWillDo + e.totalWillNotDo));
      return sum > 0;
    })();

    return pc4List.map((pc4) => {
      const entry = usageByPc4.get(pc4);
      let willDo = 0;
      let willNotDo = 0;
      let reasons: Record<string, number> = {};
      if (entry && hasEventUsage) {
        if (selectedActionId === 'all') {
          Object.values(entry.actions).forEach((aa) => {
            willDo += aa.willDo;
            willNotDo += aa.willNotDo;
            Object.entries(aa.reasons).forEach(([r, c]) => (reasons[r] = (reasons[r] || 0) + c));
          });
        } else {
          const aa = entry.actions[selectedActionId];
          if (aa) {
            willDo = aa.willDo;
            willNotDo = aa.willNotDo;
            reasons = aa.reasons;
          }
        }
      } else {
        // Fallback: synthesize from district insights to avoid empty map
        const di = amsterdamAnalytics.districtInsights.find((d) => d.pc4 === pc4);
        if (di) {
          const total = di.participants || 0;
          willDo = Math.round((di.completionRate / 100) * total);
          willNotDo = Math.max(0, total - willDo);
          reasons = {};
        }
      }

      const total = willDo + willNotDo;
      const adoptionRate = total > 0 ? willDo / total : 0;
      const barrierRate = total > 0 ? willNotDo / total : 0;
      const topReason = Object.entries(reasons).sort((a, b) => b[1] - a[1])[0]?.[0];
      const topReasonPretty = topReason ? topReason.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

      let reasonMatchRate = 0;
      if (barrierFilter !== 'all') {
        const match = reasons[barrierFilter] || 0;
        reasonMatchRate = total > 0 ? match / total : 0;
      }

      return { pc4, adoptionRate, barrierRate, reasonMatchRate, willDo, willNotDo, topReason: topReasonPretty };
    });
  }, [pc4List, usageByPc4, selectedActionId, barrierFilter]);

  // Lightweight AI-style insights (heuristics based on aggregates)
  const aiStyleInsights = useMemo(() => {
    const lowAdoption = mapDataset.filter((d) => d.adoptionRate > 0 || d.barrierRate > 0).filter((d) => d.adoptionRate < 0.35);
    const highBarriers = mapDataset.filter((d) => d.barrierRate > 0.5);
    const districtMap = new Map(amsterdamAnalytics.districtInsights.map((d) => [d.pc4, d]));
    const notes: string[] = [];

    if (selectedActionId !== 'all') {
      const actionTitle = actions.find((a) => a.id === selectedActionId)?.title || selectedActionId;
      notes.push(`Focus action: ${actionTitle}`);
    }
    if (lowAdoption.length) notes.push(`Low adoption in PC4: ${lowAdoption.map((d) => d.pc4).join(', ')}`);
    if (highBarriers.length) notes.push(`High non-adoption in PC4: ${highBarriers.map((d) => d.pc4).join(', ')}`);

    const lowIncomeOverlap = lowAdoption
      .map((d) => districtMap.get(d.pc4))
      .filter((x) => x && String(x.avgIncome).toLowerCase().includes('low')).length;
    if (lowIncomeOverlap > 0) {
      notes.push('Pattern: Lower-income districts show lower adoption. Suggest boosting subsidy awareness and financing (Warmtefonds).');
    }

    const constrainedOverlap = mapDataset.filter((d) => constrainedAreas.includes(d.pc4) && d.adoptionRate < 0.4).length;
    if (constrainedOverlap > 0) {
      notes.push('Pattern: Grid-constrained areas could benefit from peak-relief actions and incentives (e.g., smart thermostats).');
    }

    if (barrierFilter !== 'all') {
      const pretty = barrierFilter.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      notes.push(`Barrier focus: "${pretty}" appears frequently in selected areas.`);
    } else {
      const globalTop = derivedTopBarriers.slice().sort((a, b) => b.count - a.count)[0];
      if (globalTop) notes.push(`Top barrier overall: ${globalTop.barrier}`);
    }

    return notes.slice(0, 5);
  }, [mapDataset, amsterdamAnalytics.districtInsights, derivedTopBarriers, selectedActionId, barrierFilter]);

  // Additional metrics used in the goals section
  const amsterdamMetrics = useMemo(() => ({
    // Percentage of gas phase-out progress (mock value for demo)
    gasTransitionRate: 36
  }), []);

  const exportPolicyReport = () => {
    const report = {
      generated: new Date().toISOString(),
      summary: 'Amsterdam Energy Transition Platform - Policy Analysis Report',
      participants: amsterdamAnalytics.totalParticipants,
      keyFindings: policyInsights,
      demographics: amsterdamAnalytics.demographics,
      districtAnalysis: amsterdamAnalytics.districtInsights,
      recommendations: [
        'Increase multilingual support in diverse neighborhoods',
        'Strengthen VVE collective action programs',  
        'Expand renter-friendly energy measures',
        'Scale successful grid-friendly behavior programs city-wide'
      ],
      nextSteps: [
        'Deploy targeted outreach in underserved postcodes',
        'Pilot collective heat pump programs for social housing',
        'Launch multilingual energy coach training',
        'Develop stronger tenant protection for energy improvements'
      ]
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amsterdam-energy-policy-insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-red-700 bg-red-100';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Amsterdam Energy Transition</h1>
            <p className="text-slate-600 mt-2">Policy Insights Dashboard - Real-time platform analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            </div>
            <span className="text-sm text-slate-600">Gemeente Amsterdam</span>
            <button onClick={exportPolicyReport} className="btn-primary">
              Export Policy Report
            </button>
          </div>
        </div>
        
        
        {/* Amsterdam Climate Goals Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">2030 Goals</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">CO₂ Reduction Progress</span>
                <span className="font-bold text-blue-800">12.3%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '22%' }}></div>
              </div>
              <div className="text-xs text-blue-600">Target: 55% reduction vs 1990</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <h3 className="font-bold text-amber-800 mb-2">2040 Goals</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-amber-700">Gas Phase-Out</span>
                <span className="font-bold text-amber-800">{amsterdamMetrics.gasTransitionRate}%</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${amsterdamMetrics.gasTransitionRate}%` }}></div>
              </div>
              <div className="text-xs text-amber-600">Target: Natural gas-free city</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <h3 className="font-bold text-red-800 mb-2">2050 Goals</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-700">Climate Neutral Progress</span>
                <span className="font-bold text-red-800">8.7%</span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '9%' }}></div>
              </div>
              <div className="text-xs text-red-600">Target: 95% CO₂ reduction</div>
            </div>
          </div>
        </div>


        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[rgb(var(--brand))]">{amsterdamAnalytics.totalParticipants.toLocaleString()}</div>
            <div className="text-xs text-slate-600">Platform Participants</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{amsterdamAnalytics.completedActions.toLocaleString()}</div>
            <div className="text-xs text-slate-600">Actions Completed</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{amsterdamAnalytics.activeCoachConsultations}</div>
            <div className="text-xs text-slate-600">Coach Consultations</div>
          </div>
          <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{amsterdamAnalytics.energyCooperativeInterest}</div>
            <div className="text-xs text-slate-600">Energy Coop Interest</div>
          </div>
        </div>
      </div>

      {/* Policy Insights */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Actionable Policy Insights</h2>
        <div className="grid gap-4">
          {policyInsights.map((insight) => (
            <div 
              key={insight.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedInsight === insight.id 
                  ? 'border-[rgb(var(--brand))] bg-red-50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setSelectedInsight(selectedInsight === insight.id ? null : insight.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{insight.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                    {insight.impact} impact
                  </span>
                  <span className="text-xs text-slate-500">{insight.dataPoints} data points</span>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-2">{insight.description}</p>
              
              {selectedInsight === insight.id && (
                <div className="mt-4 p-4 bg-white rounded border-l-4 border-[rgb(var(--brand))]">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Affected Areas:</h4>
                      <div className="flex flex-wrap gap-1">
                        {insight.affectedAreas.map(pc4 => (
                          <span key={pc4} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                            PC4 {pc4}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recommended Action:</h4>
                      <p className="text-sm text-slate-700">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Demographics Analysis */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Participation by Housing Situation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={amsterdamAnalytics.demographics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis />
              <Tooltip formatter={(value, name) => {
                if (name === 'count') return [value, 'Participants'];
                if (name === 'completionRate') return [`${value}%`, 'Completion Rate'];
                return [value, name];
              }} />
              <Bar dataKey="count" fill="#EC0000" />
              <Bar dataKey="completionRate" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Barrier Analysis */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Top Implementation Barriers</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={derivedTopBarriers.length ? derivedTopBarriers : amsterdamAnalytics.topBarriers}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="count"
                label={({ barrier, percentage }) => `${barrier}: ${percentage}%`}
              >
                {(derivedTopBarriers.length ? derivedTopBarriers : amsterdamAnalytics.topBarriers).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#6b7280'][index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Analysis */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">District-Level Analysis</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setMapView('participation')}
              className={`px-3 py-1 rounded text-sm ${mapView === 'participation' ? 'bg-[rgb(var(--brand))] text-white' : 'bg-slate-100'}`}
            >
              Participation
            </button>
            <button 
              onClick={() => setMapView('barriers')}
              className={`px-3 py-1 rounded text-sm ${mapView === 'barriers' ? 'bg-[rgb(var(--brand))] text-white' : 'bg-slate-100'}`}
            >
              Barriers
            </button>
            <button 
              onClick={() => setMapView('success')}
              className={`px-3 py-1 rounded text-sm ${mapView === 'success' ? 'bg-[rgb(var(--brand))] text-white' : 'bg-slate-100'}`}
            >
              Success Rates
            </button>
          </div>
        </div>

        {/* Map controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="text-sm text-slate-600">Action</label>
          <select
            className="text-sm border rounded px-2 py-1"
            value={selectedActionId}
            onChange={(e) => setSelectedActionId(e.target.value)}
          >
            {actionOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.title}</option>
            ))}
          </select>
          {mapView === 'barriers' && (
            <>
              <label className="text-sm text-slate-600">Reason</label>
              <select
                className="text-sm border rounded px-2 py-1"
                value={barrierFilter}
                onChange={(e) => setBarrierFilter(e.target.value)}
              >
                {barrierOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.title}</option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* PC4 map (Leaflet) */}
        <div className="mb-6">
          <Pc4LeafletMap
            data={mapDataset.map((d) => ({
              pc4: d.pc4,
              value: mapView === 'participation' ? d.adoptionRate : (mapView === 'barriers' ? (barrierFilter === 'all' ? d.barrierRate : d.reasonMatchRate) : d.adoptionRate),
              meta: d,
            }))}
            mode={mapView}
          />
        </div>

        {/* AI-style insights summary (anonymized, heuristic) */}
        {aiStyleInsights.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
            <div className="font-semibold text-blue-800 mb-2">Usage Pattern Insights</div>
            <ul className="list-disc list-inside text-sm text-blue-900 space-y-1">
              {aiStyleInsights.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
            <div className="text-xs text-blue-700 mt-2">
              Aggregated at PC4 level. No personal data processed.
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2">District</th>
                <th className="text-left py-2">Participants</th>
                <th className="text-left py-2">Completion Rate</th>
                <th className="text-left py-2">Income Level</th>
                <th className="text-left py-2">Grid Status</th>
                <th className="text-left py-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {amsterdamAnalytics.districtInsights.map((district) => (
                <tr key={district.pc4} className="border-b border-slate-100">
                  <td className="py-2 font-medium">
                    {district.name}
                    <span className="text-slate-500 ml-1">({district.pc4})</span>
                  </td>
                  <td className="py-2">{district.participants}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            district.completionRate > 60 ? 'bg-red-500' :
                            district.completionRate > 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${district.completionRate}%` }}
                        ></div>
                      </div>
                      <span>{district.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-2">{district.avgIncome}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      district.gridStrain === 'High' ? 'bg-red-100 text-red-700' :
                      district.gridStrain === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {district.gridStrain}
                    </span>
                  </td>
                  <td className="py-2">
                    {district.completionRate < 40 && district.gridStrain === 'High' ? (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">High Priority</span>
                    ) : district.avgIncome === 'Low' ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Social Support</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Performing Well</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations Summary */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Municipal Action Recommendations</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-red-700 mb-3">Immediate Actions (0-3 months)</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Deploy multilingual energy coaches in postcodes 1012, 1013, 1016</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Launch VVE collective heat pump pilot program in Zuidoost</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Expand grid-friendly behavior incentives to all constrained areas</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-amber-700 mb-3">Medium-term Policy Changes (3-12 months)</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Strengthen tenant rights for energy improvements citywide</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Develop income-based subsidy tiers for major investments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Create neighborhood-level energy transition coordinators</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Platform Impact Summary</h4>
          <p className="text-sm text-blue-700">
            This platform has identified key barriers preventing equitable energy transition access across Amsterdam's diverse neighborhoods. 
            The data shows clear patterns requiring targeted policy interventions, particularly around language accessibility, 
            social housing collective action, and renter protection frameworks.
          </p>
        </div>
      </div>
    </div>
  );
}
