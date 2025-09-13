import { useState } from 'react';
import { useApp } from '../store';
import { useTranslation } from '../i18n';

export default function Rewards() {
  const { profile, credits, pledges, addCredits, togglePledge, track } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');
  const [showCoachModal, setShowCoachModal] = useState(false);

  const levels = [
    { threshold: 0, name: 'Getting Started', icon: '🌱' },
    { threshold: 25, name: 'Energy Saver', icon: '💡' },
    { threshold: 50, name: 'Grid Helper', icon: '⚡' },
    { threshold: 100, name: 'Sustainability Champion', icon: '🏆' }
  ];

  const currentLevel = levels.reduce((acc, level) => 
    credits >= level.threshold ? level : acc
  );
  const nextLevel = levels.find(level => level.threshold > credits);

  const handlePledgeToggle = (pledgeKey: keyof typeof pledges) => {
    const wasActive = pledges[pledgeKey];
    togglePledge(pledgeKey);
    
    if (!wasActive) {
      addCredits(10);
      track({
        t: Date.now(),
        sid: crypto.randomUUID(),
        event: 'pledge_made',
        pc4: profile?.pc4 || '',
        payload: { type: pledgeKey }
      });
    }
  };

  const handleBookCoach = () => {
    setShowCoachModal(false);
    addCredits(25);
    track({
      t: Date.now(),
      sid: crypto.randomUUID(),
      event: 'coach_booked',
      pc4: profile?.pc4 || ''
    });
  };

  const progressPercentage = nextLevel 
    ? ((credits - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100
    : 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">{t('rewards.title')}</h1>
        <p className="text-slate-600">Earn credits for grid-friendly actions and pledges</p>
      </div>

      {/* Credits & Progress */}
      <div className="card p-6 mb-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{currentLevel.icon}</div>
          <h2 className="text-2xl font-bold text-[rgb(var(--brand))]">{credits} Credits</h2>
          <p className="text-slate-600">Current level: {currentLevel.name}</p>
        </div>

        {nextLevel && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>{currentLevel.name}</span>
              <span>{nextLevel.name}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-[rgb(var(--brand))] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-slate-600 mt-2">
              {nextLevel.threshold - credits} credits to {nextLevel.name}
            </p>
          </div>
        )}

        {/* Level Milestones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {levels.map((level) => (
            <div 
              key={level.threshold}
              className={`text-center p-3 rounded-xl ${
                credits >= level.threshold 
                  ? 'bg-[rgb(var(--brand))] bg-opacity-10 text-[rgb(var(--brand))]' 
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              <div className="text-2xl mb-1">{level.icon}</div>
              <div className="text-xs font-medium">{level.name}</div>
              <div className="text-xs">{level.threshold} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pledges */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('rewards.pledges')}</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">{t('rewards.pledge1')}</h3>
                <p className="text-sm text-slate-600">Help reduce peak demand</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[rgb(var(--brand))]">+10 credits</span>
              <button
                onClick={() => handlePledgeToggle('offPeakUsage')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pledges.offPeakUsage ? 'bg-[rgb(var(--brand))]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pledges.offPeakUsage ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">{t('rewards.pledge2')}</h3>
                <p className="text-sm text-slate-600">Save energy during night hours</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[rgb(var(--brand))]">+10 credits</span>
              <button
                onClick={() => handlePledgeToggle('nightSetback')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pledges.nightSetback ? 'bg-[rgb(var(--brand))]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pledges.nightSetback ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coach Booking */}
      <div className="bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand-700))] rounded-2xl p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Need Personal Guidance?</h2>
        <p className="text-green-50 mb-4">
          Book a free 15-minute consultation with an energy coach to create your personalized action plan.
        </p>
        <button
          onClick={() => setShowCoachModal(true)}
          className="btn-secondary bg-white"
        >
          {t('cta.book')} (+25 credits)
        </button>
      </div>

      {/* Coach Modal */}
      {showCoachModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Book Energy Coach</h3>
            <p className="text-slate-600 mb-6">
              Great! Your consultation request has been submitted. An energy coach will contact you within 24 hours to schedule your free session.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleBookCoach}
                className="flex-1 btn-primary"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => setShowCoachModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
