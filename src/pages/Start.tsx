import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { useTranslation } from '../i18n';
import { scoreActions } from '../scoring';
import type { UserProfile } from '../types';

export default function Start() {
  const navigate = useNavigate();
  const { setProfile, setRecs, track } = useApp();
  const { t } = useTranslation('en');
  const [step, setStep] = useState(1);
  const [autoFillData, setAutoFillData] = useState<any>(null);
  const [dataConsent, setDataConsent] = useState<'none' | 'temporary' | 'full'>('none');

  // Mock auto-fill data (in real implementation, this would come from Kadaster/Municipality APIs)
  const mockAutoFillData = {
    energyLabel: 'D',
    buildYear: 1978,
    homeSize: '85m²',
    roofSuitability: 'Good for 8 panels',
    districtHeatingAvailable: false,
    gridConstrained: true
  };

  const handleAutoFill = () => {
    setAutoFillData(mockAutoFillData);
  };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    // Get energy priorities (allow multiple)
    const priorities: string[] = [];
    if (form.get('priority-money')) priorities.push('save-money');
    if (form.get('priority-comfort')) priorities.push('warmer-home');
    if (form.get('priority-climate')) priorities.push('climate-impact');
    if (form.get('priority-grid')) priorities.push('grid-stability');
    
    const profile: UserProfile = {
      lang: (form.get('lang') as 'en' | 'nl') ?? 'en',
      pc4: String(form.get('pc4') ?? ''),
      investmentCapacityEUR: Number(form.get('investment') ?? 0),
      homeType: form.get('homeType') as any,
      buildYearBand: form.get('buildYearBand') as any,
      tenure: form.get('tenure') as any,
      heating: form.get('heating') as any,
      monthlyBillBand: form.get('bill') as any,
      comfortPriority: form.get('comfort') as any,
      habits: {
        laundryPerWeek: Number(form.get('laundry') ?? 3),
        dishwasher: Boolean(form.get('dishwasher')),
        nightSetback: Boolean(form.get('nightSetback'))
      },
      // New fields based on your notes
      priorities: priorities.length > 0 ? priorities : ['save-money'],
      dataConsent,
      autoFillData
    };

    setProfile(profile);
    setRecs(scoreActions(profile));
    track({ 
      t: Date.now(), 
      sid: crypto.randomUUID(), 
      event: 'onboarding_completed', 
      pc4: profile.pc4,
      payload: { dataConsent, autoFillUsed: !!autoFillData }
    });
    navigate('/plan');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Get Your Personalized Energy Plan</h1>
        <p className="text-slate-600">Answer a few quick questions to get started with Amsterdam's energy transition</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-2 h-2 rounded-full ${s <= step ? 'bg-[rgb(var(--brand))]' : 'bg-slate-300'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6">
        {/* Step 1: Basic Info & Auto-fill (kept mounted so FormData captures values) */}
        <div className={step === 1 ? '' : 'hidden'}>
            <fieldset className="card p-6">
              <legend className="font-semibold text-lg mb-4">Language / Taal</legend>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="lang" value="en" defaultChecked className="text-[rgb(var(--brand))]" />
                  <span>English</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="lang" value="nl" className="text-[rgb(var(--brand))]" />
                  <span>Nederlands</span>
                </label>
              </div>
            </fieldset>

            <fieldset className="card p-6">
              <legend className="font-semibold text-lg mb-4">Your Address & Home</legend>
              
              <label className="grid gap-2 mb-4">
                <span className="font-medium">{t('onboarding.pc4')}</span>
                <div className="flex gap-2">
                  <input 
                    name="pc4" 
                    required 
                    pattern="[0-9]{4}"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={4}
                    className="flex-1 border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none" 
                    placeholder="1102"
                    title="Enter the first 4 digits of your postcode"
                  />
                  <button 
                    type="button"
                    onClick={handleAutoFill}
                    className="btn-secondary"
                  >
                    Auto-fill from Kadaster
                  </button>
                </div>
              </label>

              {autoFillData && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <h4 className="font-medium text-green-800 mb-2">Data Retrieved:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Energy Label: <strong>{autoFillData.energyLabel}</strong></div>
                    <div>Built: <strong>{autoFillData.buildYear}</strong></div>
                    <div>Size: <strong>{autoFillData.homeSize}</strong></div>
                    <div>Solar Potential: <strong>{autoFillData.roofSuitability}</strong></div>
                    <div>District Heating: <strong>{autoFillData.districtHeatingAvailable ? 'Available' : 'Not Available'}</strong></div>
                    <div>Grid Status: <strong>{autoFillData.gridConstrained ? 'Constrained' : 'Normal'}</strong></div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <label className="grid gap-2">
                  <span className="font-medium">{t('onboarding.hometype')}</span>
                  <select name="homeType" defaultValue={autoFillData ? 'apartment' : ''} className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none">
                    <option value="apartment">Apartment</option>
                    <option value="row">Row house</option>
                    <option value="detached">Detached</option>
                    <option value="semi-detached">Semi-detached</option>
                    <option value="maisonette">Maisonette</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="font-medium">{t('onboarding.buildyear')}</span>
                  <select name="buildYearBand" defaultValue={autoFillData ? 'pre-1992' : ''} className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none">
                    <option value="pre-1992">Before 1992</option>
                    <option value="1992-2005">1992-2005</option>
                    <option value="post-2005">After 2005</option>
                    <option value="unknown">Not sure</option>
                  </select>
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <label className="grid gap-2">
                  <span className="font-medium">{t('onboarding.tenure')}</span>
                  <select name="tenure" className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none">
                    <option value="renter">Renter</option>
                    <option value="owner">Owner</option>
                    <option value="vve">VVE (apartment owner)</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="font-medium">{t('onboarding.heating')}</span>
                  <select name="heating" defaultValue={autoFillData?.districtHeatingAvailable ? 'district' : 'gas-boiler'} className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none">
                    <option value="gas-boiler">Gas boiler</option>
                    <option value="district">District heating</option>
                    <option value="electric">Electric heating</option>
                    <option value="hybrid-heat-pump">Hybrid heat pump</option>
                    <option value="unknown">Not sure</option>
                  </select>
                </label>
              </div>
            </fieldset>

            <button 
              type="button"
              onClick={() => setStep(2)}
              className="btn-primary"
            >
              Next: Your Priorities
            </button>
        </div>

        {/* Step 2: Priorities & Budget (kept mounted) */}
        <div className={step === 2 ? '' : 'hidden'}>
            <fieldset className="card p-6">
              <legend className="font-semibold text-lg mb-4">Your Energy Priorities</legend>
              <p className="text-slate-600 mb-4">Select all that apply to you:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" name="priority-money" className="text-[rgb(var(--brand))]" />
                  <div>
                    <div className="font-medium">Save Money</div>
                    <div className="text-sm text-slate-600">Reduce monthly energy bills</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" name="priority-comfort" className="text-[rgb(var(--brand))]" />
                  <div>
                    <div className="font-medium">Improve Comfort</div>
                    <div className="text-sm text-slate-600">Warmer, more comfortable home</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" name="priority-climate" className="text-[rgb(var(--brand))]" />
                  <div>
                    <div className="font-medium">Climate Impact</div>
                    <div className="text-sm text-slate-600">Help Amsterdam reach 2050 goals</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" name="priority-grid" className="text-[rgb(var(--brand))]" />
                  <div>
                    <div className="font-medium">Support Grid</div>
                    <div className="text-sm text-slate-600">Reduce peak demand & congestion</div>
                  </div>
                </label>
              </div>
            </fieldset>

            <fieldset className="card p-6">
              <legend className="font-semibold text-lg mb-4">Budget & Bills</legend>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="grid gap-2">
                  <span className="font-medium">{t('onboarding.invest')}</span>
                  <select name="investment" className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none">
                    <option value="0">€0 (no upfront budget)</option>
                    <option value="50">Up to €50</option>
                    <option value="100">Up to €100</option>
                    <option value="500">Up to €500</option>
                    <option value="2000">Up to €2,000</option>
                    <option value="5000">Up to €5,000</option>
                    <option value="10000">€10,000+</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="font-medium">{t('onboarding.bill')}</span>
                  <select name="bill" className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none">
                    <option value="under-100">Under €100</option>
                    <option value="100-200">€100-200</option>
                    <option value="200-300">€200-300</option>
                    <option value="300-plus">€300+</option>
                    <option value="unknown">Not sure</option>
                  </select>
                </label>
              </div>
            </fieldset>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary"
              >
                Back
              </button>
              <button 
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 btn-primary"
              >
                Next: Privacy & Habits
              </button>
            </div>
        </div>

        {/* Step 3: Privacy & Habits (kept mounted) */}
        <div className={step === 3 ? '' : 'hidden'}>
            <fieldset className="card p-6">
              <legend className="font-semibold text-lg mb-4">Data Privacy Preferences</legend>
              <p className="text-slate-600 mb-4">Help us provide better recommendations while respecting your privacy:</p>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input 
                    type="radio" 
                    name="dataConsent" 
                    value="none" 
                    checked={dataConsent === 'none'}
                    onChange={(e) => setDataConsent(e.target.value as any)}
                    className="text-[rgb(var(--brand))] mt-1" 
                  />
                  <div>
                    <div className="font-medium">Minimal Data</div>
                    <div className="text-sm text-slate-600">Basic recommendations only, no data sharing with municipality</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input 
                    type="radio" 
                    name="dataConsent" 
                    value="temporary" 
                    checked={dataConsent === 'temporary'}
                    onChange={(e) => setDataConsent(e.target.value as any)}
                    className="text-[rgb(var(--brand))] mt-1" 
                  />
                  <div>
                    <div className="font-medium">Temporary Sharing (3 months)</div>
                    <div className="text-sm text-slate-600">Anonymous area-level data to improve Amsterdam energy policy, automatically deleted</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input 
                    type="radio" 
                    name="dataConsent" 
                    value="full" 
                    checked={dataConsent === 'full'}
                    onChange={(e) => setDataConsent(e.target.value as any)}
                    className="text-[rgb(var(--brand))] mt-1" 
                  />
                  <div>
                    <div className="font-medium">Full Insights Sharing</div>
                    <div className="text-sm text-slate-600">Help improve city-wide programs, receive personalized future recommendations</div>
                  </div>
                </label>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-800">
                <strong>Privacy guarantee:</strong> All data is anonymized at neighborhood level before analysis. Your specific address is never shared.
              </div>
            </fieldset>

            <fieldset className="card p-6">
              <legend className="font-semibold text-lg mb-4">Your Energy Habits</legend>
              <div className="grid md:grid-cols-3 gap-4">
                <label className="grid gap-2">
                  <span className="font-medium">{t('onboarding.laundry')}</span>
                  <input 
                    name="laundry" 
                    type="number" 
                    min="0" 
                    max="10" 
                    defaultValue="3" 
                    className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none" 
                  />
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    name="dishwasher" 
                    type="checkbox" 
                    className="text-[rgb(var(--brand))]" 
                  />
                  <span className="font-medium">{t('onboarding.dishwasher')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    name="nightSetback" 
                    type="checkbox" 
                    className="text-[rgb(var(--brand))]" 
                  />
                  <span className="font-medium">{t('onboarding.nightsetback')}</span>
                </label>
              </div>
            </fieldset>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="btn-secondary"
              >
                Back
              </button>
              <button 
                type="submit"
                className="flex-1 btn-primary text-lg"
              >
                {t('cta.getplan')}
              </button>
            </div>
        </div>
      </form>
    </div>
  );
}
