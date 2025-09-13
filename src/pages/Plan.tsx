import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { useTranslation } from '../i18n';
import constrainedAreas from '../data/grid_constrained_pc4.json';
import type { Recommendation } from '../types';

// Mock neighborhood data for comparison
const mockNeighborhoodData = {
  averageMonthlyBill: 165,
  solarAdoptionRate: 23,
  heatPumpAdoptionRate: 8,
  energyCooperativeMembers: 145,
  avgEnergyScore: 'C'
};

type ActionStatus = 'considering' | 'will-do' | 'will-not-do' | 'completed';
type ActionFeedback = 'too-expensive' | 'not-suitable' | 'no-time' | 'need-more-info' | 'other';

export default function Plan() {
  const { recs, profile, addCredits, track } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [actionStatuses, setActionStatuses] = useState<Record<string, ActionStatus>>({});
  const [actionFeedback, setActionFeedback] = useState<Record<string, ActionFeedback>>({});
  const [showNeighborhoodComparison, setShowNeighborhoodComparison] = useState(false);

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 mb-4">Please complete the onboarding first.</p>
        <Link to="/start" className="text-[rgb(var(--brand))] hover:underline">
          Start here
        </Link>
      </div>
    );
  }

  const top3 = recs.slice(0, 3);
  const isInHotZone = constrainedAreas.includes(profile.pc4);
  const budget = profile.investmentCapacityEUR || 0;

  const handleActionStatus = (actionId: string, status: ActionStatus, feedback?: ActionFeedback) => {
    setActionStatuses(prev => ({ ...prev, [actionId]: status }));
    if (feedback) {
      setActionFeedback(prev => ({ ...prev, [actionId]: feedback }));
    }

    if (status === 'will-do') {
      addCredits(25);
      track({
        t: Date.now(),
        sid: crypto.randomUUID(),
        event: 'action_viewed',
        pc4: profile.pc4,
        payload: { actionId, accepted: true, status }
      });
    } else if (status === 'will-not-do' && feedback) {
      track({
        t: Date.now(),
        sid: crypto.randomUUID(),
        event: 'action_viewed',
        pc4: profile.pc4,
        payload: { actionId, accepted: false, status, feedback }
      });
    }
  };

  const handleLearnMore = (actionId: string) => {
    setExpandedAction(expandedAction === actionId ? null : actionId);
    track({
      t: Date.now(),
      sid: crypto.randomUUID(),
      event: 'action_viewed',
      pc4: profile.pc4,
      payload: { actionId, expanded: true }
    });
  };

  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case 'will-do': return 'bg-green-100 text-green-800';
      case 'will-not-do': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const estimatedMonthlySavings = top3
    .filter(action => actionStatuses[action.id] === 'will-do' || actionStatuses[action.id] === 'completed')
    .reduce((sum, action) => sum + ((action.annualSavingsEUR[0] + action.annualSavingsEUR[1]) / 2 / 12), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">My Energy Transition Plan</h1>
          <button
            onClick={() => setShowNeighborhoodComparison(!showNeighborhoodComparison)}
            className="btn-secondary"
          >
            {showNeighborhoodComparison ? 'Hide' : 'Compare with'} Neighborhood
          </button>
        </div>
        
        {/* Profile Summary */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-slate-100 px-3 py-1 rounded-full">
              PC4: <strong>{profile.pc4}</strong>
            </span>
            <span className="bg-slate-100 px-3 py-1 rounded-full">
              {profile.homeType} • {profile.tenure}
            </span>
            <span className="bg-slate-100 px-3 py-1 rounded-full">
              Budget: up to €{budget.toLocaleString()}
            </span>
            {isInHotZone && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                Grid constrained area - Extra rewards for peak relief actions!
              </span>
            )}
          </div>
          
          {/* Progress Summary */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(actionStatuses).filter(s => s === 'will-do').length}
              </div>
              <div className="text-sm text-slate-600">Actions Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                €{Math.round(estimatedMonthlySavings)}
              </div>
              <div className="text-sm text-slate-600">Est. Monthly Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(estimatedMonthlySavings * 12 * 0.4)}kg
              </div>
              <div className="text-sm text-slate-600">CO₂ Reduction/year</div>
            </div>
          </div>
        </div>

        {/* Neighborhood Comparison Panel */}
        {showNeighborhoodComparison && (
          <div className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-green-50">
            <h2 className="text-xl font-semibold mb-4">Your Neighborhood (PC4 {profile.pc4})</h2>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">€{mockNeighborhoodData.averageMonthlyBill}</div>
                <div className="text-slate-600">Avg Monthly Bill</div>
                <div className="text-xs text-slate-500 mt-1">
                  {parseInt(profile.monthlyBillBand?.split('-')[0] || '150') < mockNeighborhoodData.averageMonthlyBill ? '↓ Below avg' : '↑ Above avg'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{mockNeighborhoodData.solarAdoptionRate}%</div>
                <div className="text-slate-600">Have Solar Panels</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{mockNeighborhoodData.heatPumpAdoptionRate}%</div>
                <div className="text-slate-600">Have Heat Pumps</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{mockNeighborhoodData.energyCooperativeMembers}</div>
                <div className="text-slate-600">Energy Coop Members</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Interested in joining an energy cooperative?</span>
                <button className="btn-primary text-sm">Find Local Groups</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Recommendations */}
      <div className="grid gap-6">
        {top3.map((action, index) => {
          const status = actionStatuses[action.id] || 'considering';
          const feedback = actionFeedback[action.id];

          return (
            <div key={action.id} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="lg:w-2/3">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-[rgb(var(--brand))] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold">{action.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status === 'considering' ? 'Considering' : 
                       status === 'will-do' ? 'Will Do' :
                       status === 'will-not-do' ? 'Not For Me' : 'Completed'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border font-medium ${
                      action.grade === 'A' ? 'bg-green-50 text-green-700 border-green-200' :
                      action.grade === 'B' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      action.grade === 'C' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      Grade {action.grade}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 mb-4">{action.summary}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      💰 €{action.costRangeEUR[0]}–{action.costRangeEUR[1]} upfront
                    </span>
                    <span className="flex items-center gap-1">
                      💚 €{action.annualSavingsEUR[0]}–{action.annualSavingsEUR[1]}/yr savings
                    </span>
                    <span className="flex items-center gap-1">
                      🌍 {action.annualCO2kg[0]}–{action.annualCO2kg[1]} kg CO₂/yr
                    </span>
                    {action.renterFriendly && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        Renter-friendly
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="lg:w-1/3 flex flex-col gap-2">
                  {status === 'considering' && (
                    <>
                      <button 
                        onClick={() => handleLearnMore(action.id)}
                        className="btn-secondary"
                      >
                        Learn More
                      </button>
                      <button 
                        onClick={() => handleActionStatus(action.id, 'will-do')}
                        className="btn-primary"
                      >
                        I'll Do This (+25 credits)
                      </button>
                      <div className="relative">
                        <select 
                          onChange={(e) => {
                            if (e.target.value) {
                              handleActionStatus(action.id, 'will-not-do', e.target.value as ActionFeedback);
                            }
                          }}
                          className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white"
                          defaultValue=""
                        >
                          <option value="">Not for me because...</option>
                          <option value="too-expensive">Too expensive</option>
                          <option value="not-suitable">Not suitable for my home</option>
                          <option value="no-time">No time right now</option>
                          <option value="need-more-info">Need more information</option>
                          <option value="other">Other reason</option>
                        </select>
                      </div>
                    </>
                  )}

                  {status === 'will-do' && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-green-700">Great choice! Next steps:</div>
                      <button className="btn-primary text-sm w-full">Find Subsidies</button>
                      <button className="btn-secondary text-sm w-full">Find Professionals</button>
                      <button 
                        onClick={() => setActionStatuses(prev => ({ ...prev, [action.id]: 'completed' }))}
                        className="btn-secondary text-sm w-full"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}

                  {status === 'will-not-do' && feedback && (
                    <div className="text-sm text-slate-600 p-2 bg-slate-50 rounded">
                      Feedback noted: {feedback.replace('-', ' ')}
                      <button 
                        onClick={() => setActionStatuses(prev => ({ ...prev, [action.id]: 'considering' }))}
                        className="block mt-2 text-[rgb(var(--brand))] hover:underline"
                      >
                        Reconsider
                      </button>
                    </div>
                  )}

                  {status === 'completed' && (
                    <div className="text-sm font-medium text-blue-700 p-2 bg-blue-50 rounded">
                      ✅ Completed! Great work.
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedAction === action.id && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* How To */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        📋 How to Get Started:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                        {action.howTo.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Subsidies & Financing */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        💸 Subsidies & Financing:
                      </h4>
                      {action.subsidies.length > 0 ? (
                        <div className="space-y-2">
                          {action.subsidies.map((subsidy, i) => (
                            <div key={i} className="text-sm p-2 bg-green-50 rounded">
                              <span className="font-medium text-green-800">
                                {subsidy.code}:
                              </span>
                              <span className="text-green-700 ml-1">
                                {subsidy.note}
                              </span>
                            </div>
                          ))}
                          <button className="text-sm text-[rgb(var(--brand))] hover:underline">
                            Apply for subsidies →
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600">No specific subsidies, but check general energy loans</p>
                      )}
                    </div>

                    {/* Practical Info */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        🔧 Practical Info:
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-blue-50 rounded">
                          <strong>Difficulty:</strong> {action.feasibility}
                        </div>
                        <div className="p-2 bg-yellow-50 rounded">
                          <strong>Grid Impact:</strong> {action.peakRelief} peak relief
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <strong>Payback:</strong> ~{Math.round((action.costRangeEUR[0] + action.costRangeEUR[1]) / 2 / ((action.annualSavingsEUR[0] + action.annualSavingsEUR[1]) / 2))} years
                        </div>
                        <button className="text-[rgb(var(--brand))] hover:underline">
                          Connect with energy coach for help →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {recs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-600">No recommendations found. Please try updating your profile.</p>
        </div>
      )}
    </div>
  );
}