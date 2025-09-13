import { useState } from 'react';
import { useApp } from '../store';
import { useTranslation } from '../i18n';
import constrainedAreas from '../data/grid_constrained_pc4.json';

export default function Rewards() {
  const { profile, credits, pledges, addCredits, togglePledge, track } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showRewardDetails, setShowRewardDetails] = useState(false);

  const isInHotZone = profile ? constrainedAreas.includes(profile.pc4) : false;

  const levels = [
    { threshold: 0, name: 'Getting Started', icon: '🌱', reward: 'Welcome guide & tips' },
    { threshold: 25, name: 'Energy Saver', icon: '💡', reward: '5% discount on smart plugs' },
    { threshold: 50, name: 'Grid Helper', icon: '⚡', reward: 'Free energy audit consultation' },
    { threshold: 100, name: 'Sustainability Champion', icon: '🏆', reward: 'Priority energy coach booking' },
    { threshold: 200, name: 'Amsterdam Climate Leader', icon: '🌍', reward: 'Municipal recognition certificate' }
  ];

  const currentLevel = levels.reduce((acc, level) => 
    credits >= level.threshold ? level : acc
  );
  const nextLevel = levels.find(level => level.threshold > credits);

  const pledgeOptions = [
    {
      id: 'offPeakUsage',
      title: t('rewards.pledge1'),
      description: 'Run dishwasher, washing machine after 20:00 (off-peak hours)',
      credits: isInHotZone ? 15 : 10,
      gridImpact: 'high',
      icon: '🌙'
    },
    {
      id: 'nightSetback',
      title: t('rewards.pledge2'), 
      description: 'Lower thermostat to 18.5°C during night hours (23:00-06:00)',
      credits: 10,
      gridImpact: 'medium',
      icon: '🌡️'
    },
    {
      id: 'solarOptimization',
      title: 'Solar-First Energy Use',
      description: 'Use high-energy appliances during sunny hours when solar production is high',
      credits: isInHotZone ? 20 : 15,
      gridImpact: 'high', 
      icon: '☀️'
    },
    {
      id: 'communitySharing',
      title: 'Energy Community Participation',
      description: 'Share energy usage data with local energy cooperative',
      credits: 25,
      gridImpact: 'community',
      icon: '🤝'
    }
  ];

  const availableRewards = [
    { cost: 50, title: 'Smart Energy Monitor', description: 'Track real-time energy usage', available: 12 },
    { cost: 75, title: 'Energy Coaching Session', description: '1-hour personalized consultation', available: 8 },
    { cost: 100, title: 'LED Lighting Kit', description: 'Complete home LED upgrade kit', available: 15 },
    { cost: 150, title: 'Smart Thermostat Discount', description: '€50 discount on certified models', available: 6 },
    { cost: 200, title: 'Solar Panel Assessment', description: 'Professional roof suitability analysis', available: 4 }
  ];

  const handlePledgeToggle = (pledgeKey: keyof typeof pledges) => {
    const wasActive = pledges[pledgeKey];
    const pledge = pledgeOptions.find(p => p.id === pledgeKey);
    
    togglePledge(pledgeKey);
    
    if (!wasActive && pledge) {
      addCredits(pledge.credits);
      track({
        t: Date.now(),
        sid: crypto.randomUUID(),
        event: 'pledge_made',
        pc4: profile?.pc4 || '',
        payload: { type: pledgeKey, credits: pledge.credits, gridConstrained: isInHotZone }
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

  const handleRewardClaim = (reward: any) => {
    if (credits >= reward.cost) {
      // In real implementation, this would process the reward
      alert(`Claiming ${reward.title}! Check your email for next steps.`);
      track({
        t: Date.now(),
        sid: crypto.randomUUID(),
        event: 'reward_claimed',
        pc4: profile?.pc4 || '',
        payload: { reward: reward.title, cost: reward.cost }
      });
    }
  };

  const progressPercentage = nextLevel 
    ? ((credits - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100
    : 100;

  const totalPossibleCredits = pledgeOptions.reduce((sum, pledge) => sum + pledge.credits, 0) + 100; // +100 for actions
  const sustainabilityScore = Math.min(100, Math.round((credits / totalPossibleCredits) * 100));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">{t('rewards.title')}</h1>
        <p className="text-slate-600">Earn credits for grid-friendly actions and help Amsterdam reach climate goals</p>
        
        {isInHotZone && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-orange-800 text-sm font-medium">
              🔥 Grid Hot Zone Bonus: Extra credits for peak demand relief in your area!
            </p>
          </div>
        )}
      </div>

      {/* Credits & Progress */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{currentLevel.icon}</div>
            <h2 className="text-2xl font-bold text-[rgb(var(--brand))]">{credits} Credits</h2>
            <p className="text-slate-600">Level: {currentLevel.name}</p>
            <p className="text-sm text-slate-500 mt-1">{currentLevel.reward}</p>
          </div>

          {nextLevel && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>{currentLevel.name}</span>
                <span>{nextLevel.name}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-[rgb(var(--brand))] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-slate-600 mt-2">
                {nextLevel.threshold - credits} credits to {nextLevel.name}
              </p>
            </div>
          )}

          <button
            onClick={() => setShowRewardDetails(true)}
            className="w-full btn-secondary text-sm"
          >
            View All Rewards & Levels
          </button>
        </div>

        {/* Amsterdam Impact */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Your Amsterdam Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Sustainability Score</span>
              <span className="font-bold text-[rgb(var(--brand))]">{sustainabilityScore}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                style={{ width: `${sustainabilityScore}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-bold text-blue-700">
                  {Math.round(credits * 0.8)}kg
                </div>
                <div className="text-blue-600">CO₂ Avoided</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-bold text-green-700">
                  €{Math.round(credits * 0.3)}
                </div>
                <div className="text-green-600">Grid Savings</div>
              </div>
            </div>

            <div className="text-xs text-center text-slate-500 mt-3">
              Contributing to Amsterdam's 2040 gas-free goal
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Pledges */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Grid-Friendly Behavior Pledges</h2>
        <p className="text-slate-600 text-sm mb-6">Make commitments to reduce peak demand and support Amsterdam's energy network</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {pledgeOptions.map((pledge) => {
            const isActive = pledges[pledge.id as keyof typeof pledges];
            const isPossible = pledge.id in pledges;
            
            if (!isPossible) return null; // Only show pledges that exist in the store
            
            return (
              <div 
                key={pledge.id}
                className={`p-4 border rounded-xl transition-all ${
                  isActive ? 'border-[rgb(var(--brand))] bg-green-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pledge.icon}</span>
                    <div>
                      <h3 className="font-medium">{pledge.title}</h3>
                      <p className="text-sm text-slate-600">{pledge.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePledgeToggle(pledge.id as keyof typeof pledges)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isActive ? 'bg-[rgb(var(--brand))]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    pledge.gridImpact === 'high' ? 'bg-red-100 text-red-700' :
                    pledge.gridImpact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    pledge.gridImpact === 'community' ? 'bg-purple-100 text-purple-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {pledge.gridImpact} impact
                  </span>
                  <span className="font-medium text-[rgb(var(--brand))]">
                    +{pledge.credits} credits
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Rewards */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Redeem Credits</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableRewards.map((reward, index) => (
            <div key={index} className="border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{reward.title}</h3>
                <span className="text-lg font-bold text-[rgb(var(--brand))]">
                  {reward.cost}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{reward.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  {reward.available} available
                </span>
                <button
                  onClick={() => handleRewardClaim(reward)}
                  disabled={credits < reward.cost}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    credits >= reward.cost 
                      ? 'bg-[rgb(var(--brand))] text-white hover:bg-[rgb(var(--brand-600))]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {credits >= reward.cost ? 'Claim' : 'Need more'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Energy Coach CTA */}
      <div className="bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand-700))] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Need Personal Guidance?</h2>
            <p className="text-green-50">
              Book a free consultation with Amsterdam's energy coaches for personalized advice on maximizing your energy savings.
            </p>
          </div>
          <button
            onClick={() => setShowCoachModal(true)}
            className="btn-secondary bg-white whitespace-nowrap"
          >
            {t('cta.book')} (+25 credits)
          </button>
        </div>
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

      {/* Rewards Details Modal */}
      {showRewardDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">All Levels & Rewards</h3>
              <button
                onClick={() => setShowRewardDetails(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {levels.map((level, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border ${
                    credits >= level.threshold 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <h4 className="font-semibold">{level.name}</h4>
                      <p className="text-sm text-slate-600">{level.threshold} credits required</p>
                    </div>
                    {credits >= level.threshold && (
                      <span className="ml-auto text-green-600 font-medium text-sm">Unlocked!</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 ml-11">{level.reward}</p>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowRewardDetails(false)}
              className="w-full mt-4 btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}