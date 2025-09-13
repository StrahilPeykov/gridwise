import { useApp } from '../store';
import { useTranslation } from '../i18n';

export default function Coach() {
  const { profile, recs, credits, pledges } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 mb-4">Please complete the onboarding first.</p>
        <a href="/start" className="text-[rgb(var(--brand))] hover:underline">
          Start here
        </a>
      </div>
    );
  }

  const top3 = recs.slice(0, 3);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Print Header - only visible when printing */}
      <div className="print:block hidden text-center mb-8">
        <h1 className="text-2xl font-bold">GridWise Amsterdam - Energy Action Plan</h1>
        <p className="text-slate-600">Generated: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Screen Header */}
      <div className="print:hidden mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('coach.title')}</h1>
          <button
            onClick={handlePrint}
            className="btn-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {t('coach.print')}
          </button>
        </div>
        <p className="text-slate-600 mt-2">Complete summary sheet for your energy coach consultation</p>
      </div>

      {/* Profile Overview */}
      <div className="card p-6 mb-6 print:shadow-none print:border-2">
        <h2 className="text-xl font-semibold mb-4">Profile Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Home Details</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Postcode:</strong> {profile.pc4}</div>
              <div><strong>Home Type:</strong> {profile.homeType}</div>
              <div><strong>Build Year:</strong> {profile.buildYearBand}</div>
              <div><strong>Tenure:</strong> {profile.tenure}</div>
              <div><strong>Heating:</strong> {profile.heating}</div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Energy & Preferences</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Monthly Bill:</strong> {profile.monthlyBillBand}</div>
              <div><strong>Priority:</strong> {profile.comfortPriority}</div>
              <div><strong>Laundry/week:</strong> {profile.habits.laundryPerWeek}</div>
              <div><strong>Dishwasher:</strong> {profile.habits.dishwasher ? 'Yes' : 'No'}</div>
              <div><strong>Thermostat:</strong> {profile.habits.nightSetback ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="card p-6 mb-6 print:shadow-none print:border-2">
        <h2 className="text-xl font-semibold mb-4">Current Progress</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(var(--brand))]">{credits}</div>
            <div className="text-sm text-slate-600">Credits Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(var(--brand))]">
              {Object.values(pledges).filter(Boolean).length}/2
            </div>
            <div className="text-sm text-slate-600">Active Pledges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(var(--brand))]">{top3.length}/3</div>
            <div className="text-sm text-slate-600">Top Recommendations</div>
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="card p-6 mb-6 print:shadow-none print:border-2">
        <h2 className="text-xl font-semibold mb-4">Top 3 Recommended Actions</h2>
        <div className="space-y-4">
          {top3.map((action, index) => (
            <div key={action.id} className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start gap-3">
                <span className="bg-[rgb(var(--brand))] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{action.title}</h3>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">Grade {action.grade}</span>
                    <span className="text-xs text-slate-500">Score: {action.score}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-2">{action.summary}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong>Financial Impact:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• Cost: €{action.costRangeEUR[0]}–{action.costRangeEUR[1]}</li>
                        <li>• Annual savings: €{action.annualSavingsEUR[0]}–{action.annualSavingsEUR[1]}</li>
                        <li>• CO₂ reduction: {action.annualCO2kg[0]}–{action.annualCO2kg[1]} kg/year</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Implementation:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• Feasibility: {action.feasibility}</li>
                        <li>• Peak relief: {action.peakRelief}</li>
                        <li>• Renter-friendly: {action.renterFriendly ? 'Yes' : 'No'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Steps Checklist */}
      <div className="card p-6 mb-6 print:shadow-none print:border-2">
        <h2 className="text-xl font-semibold mb-4">Action Checklist</h2>
        <div className="space-y-3">
          {top3.map((action, index) => (
            <div key={action.id}>
              <h3 className="font-medium mb-2">{index + 1}. {action.title}</h3>
              <ul className="space-y-1 ml-4">
                {action.howTo.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Subsidy Information */}
      <div className="card p-6 mb-6 print:shadow-none print:border-2">
        <h2 className="text-xl font-semibold mb-4">Available Subsidies</h2>
        <div className="space-y-3">
          {top3.flatMap(action => action.subsidies).filter((subsidy, index, self) => 
            self.findIndex(s => s.code === subsidy.code) === index
          ).map((subsidy, index) => (
            <div key={index} className="text-sm">
              <strong className="text-[rgb(var(--brand))]">{subsidy.code}:</strong>
              <span className="ml-1">{subsidy.note}</span>
            </div>
          ))}
          {top3.every(action => action.subsidies.length === 0) && (
            <p className="text-sm text-slate-600">No specific subsidies available for your top recommendations.</p>
          )}
        </div>
      </div>

      {/* Notes Section for Coach */}
      <div className="card p-6 print:shadow-none print:border-2">
        <h2 className="text-xl font-semibold mb-4">Coach Notes</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Discussion Points:</label>
            <div className="border border-slate-300 rounded p-3 min-h-[80px] bg-slate-50">
              {/* Empty space for handwritten notes */}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Action Plan & Timeline:</label>
            <div className="border border-slate-300 rounded p-3 min-h-[80px] bg-slate-50">
              {/* Empty space for handwritten notes */}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Follow-up Items:</label>
            <div className="border border-slate-300 rounded p-3 min-h-[60px] bg-slate-50">
              {/* Empty space for handwritten notes */}
            </div>
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="print:block hidden text-center text-xs text-slate-500 mt-8 pt-4 border-t">
        <p>GridWise Amsterdam - Energy Action Plan</p>
        <p>For more information: visit gridwise.amsterdam</p>
      </div>
    </div>
  );
}
