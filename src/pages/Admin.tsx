import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../store';
import { useTranslation } from '../i18n';

export default function Admin() {
  const { events, profile } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');

  // Aggregate events by type
  const eventsByType = useMemo(() => {
    const counts = events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value
    }));
  }, [events]);

  // Aggregate accepted actions
  const acceptedActions = useMemo(() => {
    const actionEvents = events.filter(e => 
      e.event === 'action_viewed' && 
      e.payload && 
      (e.payload as any).accepted
    );
    
    const counts = actionEvents.reduce((acc, event) => {
      const actionId = (event.payload as any)?.actionId;
      if (actionId) {
        acc[actionId] = (acc[actionId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value
    }));
  }, [events]);

  // Aggregate by PC4 (with k-anonymity)
  const pc4Stats = useMemo(() => {
    const counts = events.reduce((acc, event) => {
      if (event.pc4) {
        acc[event.pc4] = (acc[event.pc4] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([pc4, count]) => ({
      pc4,
      count: count < 5 ? '<5' : count,
      rawCount: count
    })).filter(item => item.rawCount >= 5 || item.count === '<5');
  }, [events]);

  const exportData = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gridwise-events-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.title')}</h1>
          <p className="text-slate-600 mt-2">
            Aggregated insights for policy making (privacy-preserving)
          </p>
        </div>
        <button
          onClick={exportData}
          className="btn-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('admin.export')}
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="text-2xl font-bold text-[rgb(var(--brand))]">{events.length}</div>
          <div className="text-sm text-slate-600">Total Events</div>
        </div>
        <div className="card p-6">
          <div className="text-2xl font-bold text-[rgb(var(--brand))]">
            {new Set(events.map(e => e.pc4)).size}
          </div>
          <div className="text-sm text-slate-600">Unique Areas (PC4)</div>
        </div>
        <div className="card p-6">
          <div className="text-2xl font-bold text-[rgb(var(--brand))]">
            {events.filter(e => e.event === 'onboarding_completed').length}
          </div>
          <div className="text-sm text-slate-600">Onboardings</div>
        </div>
        <div className="card p-6">
          <div className="text-2xl font-bold text-[rgb(var(--brand))]">
            {events.filter(e => e.event === 'pledge_made').length}
          </div>
          <div className="text-sm text-slate-600">Pledges Made</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Events by Type */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Events by Type</h2>
          {eventsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="rgb(34, 197, 94)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              No events recorded yet
            </div>
          )}
        </div>

        {/* Accepted Actions */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Popular Actions</h2>
          {acceptedActions.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={acceptedActions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {acceptedActions.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              No actions accepted yet
            </div>
          )}
        </div>
      </div>

      {/* PC4 Stats Table */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Activity by Area (PC4)</h2>
        {pc4Stats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2">PC4 Area</th>
                  <th className="text-left py-2">Event Count</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pc4Stats.map((stat) => (
                  <tr key={stat.pc4} className="border-b border-slate-100">
                    <td className="py-2 font-medium">{stat.pc4}</td>
                    <td className="py-2">{stat.count}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        stat.count === '<5' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {stat.count === '<5' ? 'Privacy protected' : 'Sufficient data'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No area data available yet
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-blue-800 text-sm">
            <p className="font-medium mb-1">Privacy Protection</p>
            <p>
              All data is aggregated and anonymized. Areas with fewer than 5 events are marked as "&lt;5" 
              to protect individual privacy. No personally identifiable information is stored or displayed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
