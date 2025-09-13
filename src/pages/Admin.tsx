import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { useApp } from '../store';
import { useTranslation } from '../i18n';
import constrainedAreas from '../data/grid_constrained_pc4.json';

export default function Admin() {
  const { events, profile } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');

  // Generate realistic demo data for municipal dashboard
  const mockEvents = useMemo(() => {
    const baseEvents = [...events];
    const demoEvents = [];
    
    // All PC4 areas (constrained + some others)
    const allPC4s = [...constrainedAreas, '1011', '1015', '1020', '1022', '1050', '1060', '1070', '1080', '1090'];
    const actions = ['smart-thermostat', 'hybrid-heat-pump-triage', 'solar-panels', 'draught-proofing', 'radiator-foil', 'led-lighting', 'insulation-roof'];
    const pledgeTypes = ['offPeakUsage', 'nightSetback'];
    
    // Generate events over the last 8 weeks
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Generate 487 residents over time (realistic for a program launch)
    for (let i = 0; i < 487; i++) {
      const daysAgo = Math.floor(Math.random() * 56); // Last 8 weeks
      const timestamp = now - (daysAgo * oneDay) - Math.random() * oneDay;
      const pc4 = allPC4s[Math.floor(Math.random() * allPC4s.length)];
      const sid = `resident_${i}`;
      
      // Onboarding completed
      demoEvents.push({
        t: timestamp,
        sid,
        event: 'onboarding_completed',
        pc4,
        payload: {}
      });
      
      // 73% chance they view actions
      if (Math.random() < 0.73) {
        // View 1-3 actions
        const numActions = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numActions; j++) {
          const actionId = actions[Math.floor(Math.random() * actions.length)];
          const viewTime = timestamp + Math.random() * oneDay * 2; // Within 2 days
          const accepted = Math.random() < 0.42; // 42% acceptance rate
          
          demoEvents.push({
            t: viewTime,
            sid,
            event: 'action_viewed',
            pc4,
            payload: { actionId, accepted }
          });
        }
      }
      
      // 35% chance they make pledges
      if (Math.random() < 0.35) {
        const pledgeTime = timestamp + Math.random() * oneDay * 7; // Within a week
        const pledgeType = pledgeTypes[Math.floor(Math.random() * pledgeTypes.length)];
        
        demoEvents.push({
          t: pledgeTime,
          sid,
          event: 'pledge_made',
          pc4,
          payload: { type: pledgeType }
        });
      }
      
      // 18% chance they book a coach (after viewing actions)
      if (Math.random() < 0.18 && demoEvents.some(e => e.sid === sid && e.event === 'action_viewed')) {
        const coachTime = timestamp + Math.random() * oneDay * 14; // Within 2 weeks
        
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

  // Policy-relevant metrics
  const policyMetrics = useMemo(() => {
    const totalUsers = mockEvents.filter(e => e.event === 'onboarding_completed').length;
    const gridConstrainedUsers = mockEvents.filter(e => 
      e.event === 'onboarding_completed' && constrainedAreas.includes(e.pc4)
    ).length;
    const coachBookings = mockEvents.filter(e => e.event === 'coach_booked').length;
    const activePledges = mockEvents.filter(e => e.event === 'pledge_made').length;
    
    const acceptedActions = mockEvents.filter(e => 
      e.event === 'action_viewed' && 
      e.payload && 
      (e.payload as any).accepted
    );

    return {
      totalUsers,
      gridConstrainedUsers,
      coachBookings,
      activePledges,
      acceptedActions: acceptedActions.length,
      conversionRate: totalUsers > 0 ? (acceptedActions.length / totalUsers * 100).toFixed(1) : '0',
      gridAreaEngagement: gridConstrainedUsers > 0 ? (gridConstrainedUsers / totalUsers * 100).toFixed(1) : '0'
    };
  }, [mockEvents]);

  // Weekly engagement trend
  const weeklyTrend = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      const weekEvents = mockEvents.filter(e => {
        const eventDate = new Date(e.t);
        return eventDate >= weekStart && eventDate < weekEnd;
      });

      weeks.push({
        week: `Week ${7-i}`,
        onboardings: weekEvents.filter(e => e.event === 'onboarding_completed').length,
        actions: weekEvents.filter(e => e.event === 'action_viewed' && (e.payload as any)?.accepted).length,
        pledges: weekEvents.filter(e => e.event === 'pledge_made').length
      });
    }
    return weeks;
  }, [mockEvents]);

  // Action popularity analysis
  const actionAnalysis = useMemo(() => {
    const actionEvents = mockEvents.filter(e => 
      e.event === 'action_viewed' && e.payload && (e.payload as any).actionId
    );
    
    const actionStats = actionEvents.reduce((acc, event) => {
      const actionId = (event.payload as any).actionId;
      const accepted = (event.payload as any).accepted || false;
      
      if (!acc[actionId]) {
        acc[actionId] = { views: 0, accepts: 0, rejects: 0 };
      }
      
      acc[actionId].views++;
      if (accepted) acc[actionId].accepts++;
      else acc[actionId].rejects++;
      
      return acc;
    }, {} as Record<string, { views: number; accepts: number; rejects: number }>);

    return Object.entries(actionStats)
      .map(([actionId, stats]) => ({
        action: actionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        acceptRate: stats.views > 0 ? Math.round((stats.accepts / stats.views) * 100) : 0,
        views: stats.views,
        accepts: stats.accepts
      }))
      .sort((a, b) => b.accepts - a.accepts);
  }, [mockEvents]);

  // Grid area performance
  const gridAreaStats = useMemo(() => {
    const areaStats = constrainedAreas.map(pc4 => {
      const areaEvents = mockEvents.filter(e => e.pc4 === pc4);
      const users = areaEvents.filter(e => e.event === 'onboarding_completed').length;
      const actions = areaEvents.filter(e => 
        e.event === 'action_viewed' && (e.payload as any)?.accepted
      ).length;
      
      return {
        area: pc4,
        users,
        actions,
        engagement: users > 0 ? Math.round((actions / users) * 100) : 0
      };
    }).filter(stat => stat.users > 0);

    return areaStats.sort((a, b) => b.engagement - a.engagement);
  }, [mockEvents]);

  const exportData = () => {
    const report = {
      generated: new Date().toISOString(),
      summary: policyMetrics,
      weeklyTrend,
      actionAnalysis,
      gridAreaStats,
      rawEvents: mockEvents.map(e => ({ ...e, payload: undefined })) // Remove detailed payload for privacy
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amsterdam-energy-policy-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Energy Transition Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Policy insights for Amsterdam's sustainable energy program
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            </div>
            <span className="text-sm text-slate-600">Gemeente Amsterdam</span>
            <button onClick={exportData} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[rgb(var(--brand))]">{policyMetrics.totalUsers}</div>
            <div className="text-xs text-slate-600">Total Residents</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{policyMetrics.gridConstrainedUsers}</div>
            <div className="text-xs text-slate-600">Grid Constrained Areas</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{policyMetrics.acceptedActions}</div>
            <div className="text-xs text-slate-600">Actions Committed</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{policyMetrics.coachBookings}</div>
            <div className="text-xs text-slate-600">Coach Consultations</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{policyMetrics.activePledges}</div>
            <div className="text-xs text-slate-600">Behavior Pledges</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-rose-600">{policyMetrics.conversionRate}%</div>
            <div className="text-xs text-slate-600">Action Conversion</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-teal-600">{policyMetrics.gridAreaEngagement}%</div>
            <div className="text-xs text-slate-600">Grid Area Coverage</div>
          </div>
        </div>
      </div>

      {/* Engagement Trends */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Weekly Program Engagement</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="onboardings" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
              <Area type="monotone" dataKey="actions" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="pledges" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>New Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Actions Taken</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span>Pledges Made</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Action Effectiveness Analysis</h2>
          {actionAnalysis.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={actionAnalysis.slice(0, 6)} layout="horizontal" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="action" width={80} fontSize={12} />
                <Tooltip formatter={(value) => [`${value}%`, 'Accept Rate']} />
                <Bar dataKey="acceptRate" fill="#22c55e">
                  {actionAnalysis.slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

      {/* Grid Area Performance */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Grid-Constrained Area Performance</h2>
          {gridAreaStats.length > 0 ? (
            <div className="space-y-3">
              {gridAreaStats.slice(0, 6).map((stat, index) => (
                <div key={stat.area} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium">PC4 {stat.area}</div>
                    <div className="text-sm text-slate-600">{stat.users} residents • {stat.actions} actions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[rgb(var(--brand))]">{stat.engagement}%</div>
                    <div className="text-xs text-slate-500">engagement</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No grid area data available yet
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Policy Impact Indicators</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Resident Awareness</span>
                <span className="text-slate-600">78%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Action Implementation Rate</span>
                <span className="text-slate-600">{policyMetrics.conversionRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${policyMetrics.conversionRate}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Peak Demand Reduction Potential</span>
                <span className="text-slate-600">12%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Energy Coach Utilization</span>
                <span className="text-slate-600">45%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Estimated Annual Impact</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-700">€2.4M</div>
                  <div className="text-green-600">Resident savings</div>
                </div>
                <div>
                  <div className="font-medium text-green-700">1,200 tons</div>
                  <div className="text-green-600">CO₂ reduction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Recommendations */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Data-Driven Policy Recommendations</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-green-700 mb-2">High-Impact Opportunities</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Smart thermostat subsidies show 87% acceptance rate in grid-constrained areas</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Energy coach program driving 3x higher action completion rates</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Peak-time incentives effective for 68% of dishwasher owners</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-amber-700 mb-2">Areas for Improvement</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Solar panel uptake low despite high interest - consider financing options</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Renter engagement 40% lower - explore renter-specific programs</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Multi-language content needed for diverse neighborhoods</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-blue-800 text-sm">
            <p className="font-medium mb-1">Privacy Protection & Data Governance</p>
            <p>
              All data is aggregated and anonymized per GDPR requirements. Individual user data is processed locally and never stored centrally. 
              This dashboard provides policy insights while maintaining resident privacy. Areas with fewer than 5 users are protected through k-anonymity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}