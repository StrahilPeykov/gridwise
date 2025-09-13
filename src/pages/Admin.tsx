import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useApp } from '../store';
import { useTranslation } from '../i18n';
import constrainedAreas from '../data/grid_constrained_pc4.json';

// A10 ring road postal codes
const A10_INNER_POSTCODES = [
  '1011', '1012', '1013', '1014', '1015', '1016', '1017', '1018', '1019', 
  '1020', '1021', '1071', '1072', '1073', '1074', '1075', '1076', '1077'
];

export default function AmsterdamAdmin() {
  const { events, profile } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');

  // Generate Amsterdam-specific demo data
  const mockEvents = useMemo(() => {
    const baseEvents = [...events];
    const demoEvents = [];
    
    // Amsterdam PC4 areas (constrained + A10 + others)
    const allPC4s = [...constrainedAreas, ...A10_INNER_POSTCODES, '1050', '1060', '1080', '1090', '1100', '1110'];
    const uniquePC4s = [...new Set(allPC4s)];
    
    // Amsterdam priority actions
    const actions = [
      'gas-to-district-heating', 'hybrid-heat-pump-gas-transition', 'amsterdam-solar-roofs',
      'circular-insulation-materials', 'climate-adaptive-windows', 'smart-thermostat-grid-friendly',
      'amsterdam-repair-cafe', 'led-lighting-efficient', 'draught-proofing-climate-adaptive'
    ];
    
    const pledgeTypes = ['offPeakUsage', 'nightSetback'];
    
    // Generate events over the last 12 weeks (program expansion)
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Generate 1,247 Amsterdammers over time
    for (let i = 0; i < 1247; i++) {
      const daysAgo = Math.floor(Math.random() * 84); // Last 12 weeks
      const timestamp = now - (daysAgo * oneDay) - Math.random() * oneDay;
      const pc4 = uniquePC4s[Math.floor(Math.random() * uniquePC4s.length)];
      const sid = `amsterdammer_${i}`;
      
      // Onboarding completed
      demoEvents.push({
        t: timestamp,
        sid,
        event: 'onboarding_completed',
        pc4,
        payload: {}
      });
      
      // 78% chance they view actions (higher engagement for Amsterdam-specific messaging)
      if (Math.random() < 0.78) {
        const numActions = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numActions; j++) {
          const actionId = actions[Math.floor(Math.random() * actions.length)];
          const viewTime = timestamp + Math.random() * oneDay * 3;
          
          // Higher acceptance for Amsterdam priority actions
          const isAmsterdamPriority = ['gas-to-district-heating', 'amsterdam-solar-roofs', 'amsterdam-repair-cafe'].includes(actionId);
          const baseAcceptanceRate = isAmsterdamPriority ? 0.52 : 0.38;
          const accepted = Math.random() < baseAcceptanceRate;
          
          demoEvents.push({
            t: viewTime,
            sid,
            event: 'action_viewed',
            pc4,
            payload: { actionId, accepted, amsterdamPriority: isAmsterdamPriority }
          });
        }
      }
      
      // 42% chance they make pledges (climate justice engagement)
      if (Math.random() < 0.42) {
        const pledgeTime = timestamp + Math.random() * oneDay * 7;
        const pledgeType = pledgeTypes[Math.floor(Math.random() * pledgeTypes.length)];
        
        demoEvents.push({
          t: pledgeTime,
          sid,
          event: 'pledge_made',
          pc4,
          payload: { type: pledgeType }
        });
      }
      
      // 22% chance they book a coach
      if (Math.random() < 0.22 && demoEvents.some(e => e.sid === sid && e.event === 'action_viewed')) {
        const coachTime = timestamp + Math.random() * oneDay * 14;
        
        demoEvents.push({
          t: coachTime,
          sid,
          event: 'coach_booked',
          pc4,
          payload: {}
        });
      }
    }
    
    return [...baseEvents, ...demoEvents].sort((a, b) => a.t - b.t);
  }, [events]);

  // Amsterdam Climate Roadmap metrics
  const amsterdamMetrics = useMemo(() => {
    const totalAmsterdammers = mockEvents.filter(e => e.event === 'onboarding_completed').length;
    const gridConstrainedParticipants = mockEvents.filter(e => 
      e.event === 'onboarding_completed' && constrainedAreas.includes(e.pc4)
    ).length;
    const a10ZoneParticipants = mockEvents.filter(e => 
      e.event === 'onboarding_completed' && A10_INNER_POSTCODES.includes(e.pc4)
    ).length;
    const coachConsultations = mockEvents.filter(e => e.event === 'coach_booked').length;
    const activePledges = mockEvents.filter(e => e.event === 'pledge_made').length;
    
    const acceptedActions = mockEvents.filter(e => 
      e.event === 'action_viewed' && 
      e.payload && 
      (e.payload as any).accepted
    );

    // Gas phase-out actions specifically
    const gasPhaseOutActions = acceptedActions.filter(e => 
      ['gas-to-district-heating', 'hybrid-heat-pump-gas-transition'].includes((e.payload as any).actionId)
    );

    // Solar roof actions
    const solarActions = acceptedActions.filter(e => 
      (e.payload as any).actionId === 'amsterdam-solar-roofs'
    );

    // Circular economy actions
    const circularActions = acceptedActions.filter(e => 
      ['circular-insulation-materials', 'amsterdam-repair-cafe'].includes((e.payload as any).actionId)
    );

    return {
      totalAmsterdammers,
      gridConstrainedParticipants,
      a10ZoneParticipants,
      coachConsultations,
      activePledges,
      acceptedActions: acceptedActions.length,
      gasPhaseOutActions: gasPhaseOutActions.length,
      solarActions: solarActions.length,
      circularActions: circularActions.length,
      climateMovementEngagement: totalAmsterdammers > 0 ? (acceptedActions.length / totalAmsterdammers * 100).toFixed(1) : '0',
      gasTransitionRate: totalAmsterdammers > 0 ? (gasPhaseOutActions.length / totalAmsterdammers * 100).toFixed(1) : '0'
    };
  }, [mockEvents]);

  // Weekly progress toward Amsterdam climate goals
  const weeklyClimateProgress = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      const weekEvents = mockEvents.filter(e => {
        const eventDate = new Date(e.t);
        return eventDate >= weekStart && eventDate < weekEnd;
      });

      const gasActions = weekEvents.filter(e => 
        e.event === 'action_viewed' && 
        (e.payload as any)?.accepted &&
        ['gas-to-district-heating', 'hybrid-heat-pump-gas-transition'].includes((e.payload as any).actionId)
      ).length;

      const solarActions = weekEvents.filter(e => 
        e.event === 'action_viewed' && 
        (e.payload as any)?.accepted &&
        (e.payload as any).actionId === 'amsterdam-solar-roofs'
      ).length;

      const circularActions = weekEvents.filter(e => 
        e.event === 'action_viewed' && 
        (e.payload as any)?.accepted &&
        ['circular-insulation-materials', 'amsterdam-repair-cafe'].includes((e.payload as any).actionId)
      ).length;

      weeks.push({
        week: `W${12-i}`,
        newAmsterdammers: weekEvents.filter(e => e.event === 'onboarding_completed').length,
        gasPhaseOut: gasActions,
        solarRoofs: solarActions,
        circularEconomy: circularActions
      });
    }
    return weeks;
  }, [mockEvents]);

  // Amsterdam priority action analysis
  const amsterdamActionAnalysis = useMemo(() => {
    const actionEvents = mockEvents.filter(e => 
      e.event === 'action_viewed' && e.payload && (e.payload as any).actionId
    );
    
    const actionStats = actionEvents.reduce((acc, event) => {
      const actionId = (event.payload as any).actionId;
      const accepted = (event.payload as any).accepted || false;
      const isAmsterdamPriority = (event.payload as any).amsterdamPriority || false;
      
      if (!acc[actionId]) {
        acc[actionId] = { views: 0, accepts: 0, rejects: 0, isAmsterdamPriority };
      }
      
      acc[actionId].views++;
      if (accepted) acc[actionId].accepts++;
      else acc[actionId].rejects++;
      
      return acc;
    }, {} as Record<string, { views: number; accepts: number; rejects: number; isAmsterdamPriority: boolean }>);

    return Object.entries(actionStats)
      .map(([actionId, stats]) => ({
        action: actionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        acceptRate: stats.views > 0 ? Math.round((stats.accepts / stats.views) * 100) : 0,
        views: stats.views,
        accepts: stats.accepts,
        amsterdamPriority: stats.isAmsterdamPriority
      }))
      .sort((a, b) => {
        // Priority actions first, then by acceptance count
        if (a.amsterdamPriority !== b.amsterdamPriority) {
          return a.amsterdamPriority ? -1 : 1;
        }
        return b.accepts - a.accepts;
      });
  }, [mockEvents]);

  const exportAmsterdamReport = () => {
    const report = {
      generated: new Date().toISOString(),
      amsterdamClimateGoals: {
        "2030": "55% CO₂ reduction, emission-free A10 traffic",
        "2040": "Natural gas completely phased out",
        "2050": "95% CO₂ reduction, fully climate neutral"
      },
      summary: amsterdamMetrics,
      weeklyProgress: weeklyClimateProgress,
      actionAnalysis: amsterdamActionAnalysis,
      climateJusticeNote: "Strongest shoulders bear heaviest burdens - ensure low/medium income households face no extra costs",
      newAmsterdamClimateMovement: "Part of 200+ initiative platform for collective climate action"
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amsterdam-climate-roadmap-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const AMSTERDAM_COLORS = ['#22c55e', '#dc2626', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Amsterdam Climate Roadmap Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Progress tracking toward 2030, 2040, and 2050 climate neutrality goals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            </div>
            <span className="text-sm text-slate-600">Gemeente Amsterdam</span>
            <button onClick={exportAmsterdamReport} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Climate Report
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

          <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <h3 className="font-bold text-green-800 mb-2">2050 Goals</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Climate Neutral Progress</span>
                <span className="font-bold text-green-800">8.7%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '9%' }}></div>
              </div>
              <div className="text-xs text-green-600">Target: 95% CO₂ reduction</div>
            </div>
          </div>
        </div>

        {/* Key Amsterdam Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[rgb(var(--brand))]">{amsterdamMetrics.totalAmsterdammers}</div>
            <div className="text-xs text-slate-600">Participating Amsterdammers</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{amsterdamMetrics.gridConstrainedParticipants}</div>
            <div className="text-xs text-slate-600">Grid Constrained Areas</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{amsterdamMetrics.a10ZoneParticipants}</div>
            <div className="text-xs text-slate-600">A10 Ring Residents</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{amsterdamMetrics.gasPhaseOutActions}</div>
            <div className="text-xs text-slate-600">Gas Phase-Out Actions</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{amsterdamMetrics.solarActions}</div>
            <div className="text-xs text-slate-600">Solar Roof Installations</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{amsterdamMetrics.circularActions}</div>
            <div className="text-xs text-slate-600">Circular Economy Actions</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{amsterdamMetrics.coachConsultations}</div>
            <div className="text-xs text-slate-600">Energy Coach Sessions</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-teal-600">{amsterdamMetrics.climateMovementEngagement}%</div>
            <div className="text-xs text-slate-600">Climate Action Rate</div>
          </div>
        </div>
      </div>

      {/* Amsterdam Climate Progress Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Weekly Amsterdam Climate Action Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyClimateProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="gasPhaseOut" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.7} />
              <Area type="monotone" dataKey="solarRoofs" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.7} />
              <Area type="monotone" dataKey="circularEconomy" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.7} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span>Gas Phase-Out (2040)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span>Solar Roofs (400k+ target)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Circular Economy</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Amsterdam Priority Action Effectiveness</h2>
          {amsterdamActionAnalysis.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={amsterdamActionAnalysis.slice(0, 6)} layout="horizontal" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="action" width={120} fontSize={11} />
                <Tooltip formatter={(value, name) => [`${value}%`, 'Accept Rate']} />
                <Bar dataKey="acceptRate">
                  {amsterdamActionAnalysis.slice(0, 6).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.amsterdamPriority ? '#dc2626' : AMSTERDAM_COLORS[index % AMSTERDAM_COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              No action data available yet
            </div>
          )}
        </div>
      </div>

      {/* Climate Justice & Amsterdam-Specific Insights */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Climate Justice Indicators</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Equal Access to Climate Actions</span>
                <span className="text-slate-600">73%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '73%' }}></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">Participation across income levels</div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Low-Cost Action Adoption</span>
                <span className="text-slate-600">84%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">Actions accessible to all income levels</div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Energy Coach Accessibility</span>
                <span className="text-slate-600">67%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">Support reaching all communities</div>
            </div>

            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Amsterdam Climate Justice Principle</h3>
              <p className="text-sm text-red-700">
                "The strongest shoulders bear the heaviest burdens" - ensuring low and medium-income households 
                face no extra costs from the energy transition.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">New Amsterdam Climate Movement Impact</h2>
          <div className="space-y-6">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-green-700 mb-2">200+</div>
              <div className="text-sm text-green-600">Climate initiatives in platform</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-700">€3.2M</div>
                <div className="text-blue-600">Annual Amsterdammer savings</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-700">1,850 tons</div>
                <div className="text-green-600">CO₂ reduction potential</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-slate-800">Four Transition Path Progress:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Built Environment</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricity Generation</span>
                  <span className="font-medium">23%</span>
                </div>
                <div className="flex justify-between">
                  <span>Sustainable Mobility</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Harbor & Industry</span>
                  <span className="font-medium">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amsterdam Climate Agreement Footer */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Collective Climate Movement Progress</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-green-700 mb-3">Amsterdam 2030/2040/2050 Acceleration Factors</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>District heating rollout accelerating gas phase-out ahead of 2040 target</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Solar roof potential reaching toward 400,000+ household target</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Circular economy actions establishing new standard behaviors</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Climate adaptation measures building resilience for all Amsterdammers</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-amber-700 mb-3">Areas Needing Amsterdam Policy Attention</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Higher investment actions need stronger municipal loan support</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>VVE coordination needed for apartment building collective action</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Multilingual outreach for diverse Amsterdam neighborhoods</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}