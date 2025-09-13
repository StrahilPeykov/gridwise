import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { useTranslation } from '../i18n';
import constrainedAreas from '../data/grid_constrained_pc4.json';
import type { Recommendation } from '../types';

export default function Plan() {
  const { recs, profile, addCredits, track } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

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

  const handleActionAccept = (action: Recommendation) => {
    addCredits(25);
    track({
      t: Date.now(),
      sid: crypto.randomUUID(),
      event: 'action_viewed',
      pc4: profile.pc4,
      payload: { actionId: action.id, accepted: true }
    });
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{t('recs.top')}</h1>
        
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
              {profile.heating}
            </span>
            {isInHotZone && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                Grid constrained area
              </span>
            )}
          </div>
        </div>

        {/* Hot Zone Notice */}
        {isInHotZone && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-orange-800 font-medium">
                {t('recs.hotzone')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Recommendations */}
      <div className="grid gap-6">
        {top3.map((action, index) => (
          <div key={action.id} className="card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="lg:w-2/3">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[rgb(var(--brand))] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold">{action.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs border font-medium ${
                    action.grade === 'A' ? 'bg-green-50 text-green-700 border-green-200' :
                    action.grade === 'B' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    action.grade === 'C' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {t('recs.grade')} {action.grade}
                  </span>
                  <span className="text-sm text-slate-500">
                    Score: {action.score}
                  </span>
                </div>
                
                <p className="text-slate-600 mb-4">{action.summary}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    €{action.annualSavingsEUR[0]}–{action.annualSavingsEUR[1]}/yr
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                    {action.annualCO2kg[0]}–{action.annualCO2kg[1]} kg CO₂/yr
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    action.peakRelief === 'high' ? 'bg-red-100 text-red-700' :
                    action.peakRelief === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {t('recs.peak')}: {action.peakRelief}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    action.category === 'low-cost' ? 'bg-green-100 text-green-700' :
                    action.category === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {action.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    action.feasibility === 'easy' ? 'bg-green-100 text-green-700' :
                    action.feasibility === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {action.feasibility}
                  </span>
                  {action.renterFriendly && (
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      Renter-friendly
                    </span>
                  )}
                </div>
              </div>
              
              <div className="lg:w-1/3 flex flex-col gap-2">
                <button 
                  onClick={() => handleLearnMore(action.id)}
                  className="btn-secondary"
                >
                  {t('cta.learnmore')}
                </button>
                <button 
                  onClick={() => handleActionAccept(action)}
                  className="btn-primary"
                >
                  {t('cta.illdo')} (+25 credits)
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedAction === action.id && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">How to get started:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                      {action.howTo.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Subsidies & Support:</h4>
                    {action.subsidies.length > 0 ? (
                      <div className="space-y-2">
                        {action.subsidies.map((subsidy, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium text-[rgb(var(--brand))]">
                              {subsidy.code}:
                            </span>
                            <span className="text-slate-600 ml-1">
                              {subsidy.note}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">No specific subsidies available</p>
                    )}
                    
                    <div className="mt-4">
                      <h5 className="font-medium text-sm mb-1">Sources:</h5>
                      <p className="text-xs text-slate-500">
                        {action.evidence.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {recs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-600">No recommendations found. Please try adjusting your profile.</p>
        </div>
      )}
    </div>
  );
}
