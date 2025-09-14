import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { useTranslation } from '../i18n';
import { scoreActions } from '../scoring';
import type { PriorityKey, UserProfile } from '../types';
import { prefillFromExternalSources, extractInfoFromUploads } from '../services/prefill';

export default function Start() {
  const navigate = useNavigate();
  const { setProfile, setRecs, track } = useApp();
  const [startLang, setStartLang] = useState<'en' | 'nl' | 'tr'>('en');
  const [langLevel, setLangLevel] = useState<'normal' | 'simple'>('normal');
  const { t } = useTranslation(startLang);
  const [step, setStep] = useState(1);
  const [autoFillData, setAutoFillData] = useState<any>(null);
  const [dataConsent, setDataConsent] = useState<'none' | 'temporary' | 'full'>('none');

  // Explicit integration permission + demo progress
  const [integrationConsent, setIntegrationConsent] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [integrationError, setIntegrationError] = useState<string | null>(null);
  const [integrationSteps, setIntegrationSteps] = useState<
    { id: string; label: string; status: 'pending' | 'running' | 'done' }[]
  >([
    { id: 'smart-meter-fetch', label: 'Fetching meter information from energy provider', status: 'pending' },
    { id: 'smart-meter-analyse', label: 'Analysing energy consumption…', status: 'pending' },
    { id: 'kadaster-fetch', label: 'Fetching data from Kadaster', status: 'pending' },
    { id: 'housing-insulation', label: 'Determine isolation possibilities...', status: 'pending' },
    { id: 'housing-space', label: 'Determine available spaces for energy options', status: 'pending' },
    { id: 'municipality-analyse', label: 'Fetching and analysing municipal data (demo)', status: 'pending' }
  ]);

  const handleAutoFill = async () => {
    const pc4Input = document.querySelector('input[name="pc4"]') as HTMLInputElement | null;
    const pc4 = pc4Input?.value?.trim() || '';
    const data = await prefillFromExternalSources(pc4);
    setAutoFillData(prev => ({ ...prev, ...data }));
  };

  const handleAIExtract = async () => {
    const energyLabelDoc = (document.querySelector('input[name="energyLabelDoc"]') as HTMLInputElement | null)?.files?.[0] || null;
    const floorplanImage = (document.querySelector('input[name="floorplanImage"]') as HTMLInputElement | null)?.files?.[0] || null;
    const extracted = await extractInfoFromUploads({ energyLabelDoc, floorplanImage });
    setAutoFillData((prev: any) => ({ ...prev, ...extracted }));
  };

  const startIntegrations = async () => {
    const pc4Input = document.querySelector('input[name="pc4"]') as HTMLInputElement | null;
    const pc4 = pc4Input?.value?.trim() || '';
    if (!/^[0-9]{4}$/.test(pc4)) {
      setIntegrationError('Please enter your PC4 (first 4 postcode digits) to proceed.');
      return;
    }
    setIntegrationError(null);
    setIntegrationConsent(true);
    setIntegrationStatus('running');
    // reset steps
    setIntegrationSteps((prev) => prev.map(s => ({ ...s, status: 'pending' })));

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    const runStep = async (id: string, fn?: () => Promise<void> | void) => {
      setIntegrationSteps(prev => prev.map(s => s.id === id ? { ...s, status: 'running' } : s));
      await delay(600);
      if (fn) await fn();
      setIntegrationSteps(prev => prev.map(s => s.id === id ? { ...s, status: 'done' } : s));
    };

    try {
      await runStep('smart-meter-fetch');
      await runStep('smart-meter-analyse', async () => {
        const baseLoad = 0.25 + ((Number(pc4[3]) % 4) * 0.1); // 0.25–0.55 kWh baseline
        setAutoFillData((prev: any) => ({
          ...prev,
          smartMeterInsights: {
            peakWindow: '18:00–21:00',
            nightBaseLoadKwh: Number(baseLoad.toFixed(2)),
            notes: 'Suggest shifting laundry/dishwasher to after 21:00. Smart thermostat can pre-heat off-peak.'
          }
        }));
      });
      await runStep('kadaster-fetch', async () => {
        const data = await prefillFromExternalSources(pc4);
        setAutoFillData(prev => ({ ...prev, ...data }));
      });
      await runStep('housing-insulation', async () => {
        setAutoFillData((prev: any) => ({
          ...prev,
          insulationCandidates: ['Roof insulation', 'Floor insulation', 'Window sealing'],
        }));
      });
      await runStep('housing-space', async () => {
        setAutoFillData((prev: any) => ({
          ...prev,
          spaceNotes: 'Utility/storage has ~0.5m² for indoor unit; balcony suitable for small outdoor unit.'
        }));
      });
      await runStep('municipality-analyse');
      setIntegrationStatus('done');
    } catch (e) {
      setIntegrationError('Integration failed. Please try again.');
      setIntegrationStatus('idle');
    }
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

    // Priority ratings 1–5 (optional)
    const ratingsMap: Record<PriorityKey, number> = {
      'save-money': Number(form.get('rating-money') || 3),
      'warmer-home': Number(form.get('rating-comfort') || 3),
      'climate-impact': Number(form.get('rating-climate') || 3),
      'grid-stability': Number(form.get('rating-grid') || 3)
    } as const as any;

    // Derive primary comfortPriority from highest-rated key
    const topPriority = (Object.keys(ratingsMap) as PriorityKey[])
      .sort((a, b) => (ratingsMap[b] ?? 0) - (ratingsMap[a] ?? 0))[0] || (priorities[0] as PriorityKey) || 'save-money';
    
    const profile: UserProfile = {
      lang: (form.get('lang') as 'en' | 'nl' | 'tr') ?? 'en',
      pc4: String(form.get('pc4') ?? ''),
      investmentCapacityEUR: Number(form.get('investment') ?? 0),
      homeType: form.get('homeType') as any,
      buildYearBand: form.get('buildYearBand') as any,
      tenure: form.get('tenure') as any,
      heating: form.get('heating') as any,
      monthlyBillBand: form.get('bill') as any,
      comfortPriority: topPriority,
      habits: {
        laundryPerWeek: Number(form.get('laundry') ?? 3),
        dishwasher: Boolean(form.get('dishwasher')),
        nightSetback: Boolean(form.get('nightSetback'))
      },
      // New fields based on your notes
      priorities: priorities.length > 0 ? priorities : ['save-money'],
      priorityRatings: {
        'save-money': ratingsMap['save-money'] as any,
        'warmer-home': ratingsMap['warmer-home'] as any,
        'climate-impact': ratingsMap['climate-impact'] as any,
        'grid-stability': ratingsMap['grid-stability'] as any
      },
      dataConsent,
      consentExpiresAt: dataConsent === 'temporary' ? (Date.now() + 90 * 24 * 60 * 60 * 1000) : undefined,
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
              <div className="flex items-center justify-between mb-4">
                <legend className="font-semibold text-lg">Language / Taal</legend>
                <button type="button" className="text-sm text-[rgb(var(--brand))] hover:underline">See more</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="grid gap-2">
                  <span className="font-medium">Choose language</span>
                  <select 
                    name="lang"
                    value={startLang}
                    onChange={(e) => setStartLang(e.target.value as 'en' | 'nl' | 'tr')}
                    className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none"
                  >
                    <option value="en">English</option>
                    <option value="nl">Nederlands</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </label>

                <div className="grid gap-2">
                  <span className="font-medium">Language level</span>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setLangLevel('normal')}
                      className={`nav-pill border ${langLevel === 'normal' ? 'bg-slate-100 border-[rgb(var(--brand))] text-[rgb(var(--brand))] font-semibold' : 'border-slate-300'}`}
                    >
                      Normal
                    </button>
                    <button 
                      type="button"
                      onClick={() => setLangLevel('simple')}
                      className={`nav-pill border ${langLevel === 'simple' ? 'bg-slate-100 border-[rgb(var(--brand))] text-[rgb(var(--brand))] font-semibold' : 'border-slate-300'}`}
                    >
                      Simple
                    </button>
                  </div>
                  <input type="hidden" name="langLevel" value={langLevel} />
                </div>
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
                  {autoFillData.roomSizes && (
                    <div className="mt-3 text-sm">
                      <div className="font-medium mb-1">Detected Rooms:</div>
                      <ul className="list-disc list-inside text-slate-700">
                        {autoFillData.roomSizes.map((r: any, i: number) => (
                          <li key={i}>{r.name}: {r.areaM2} m²</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Explicit permission + transparent integration demo */}
              <div className="card p-4 mb-4">
                <h4 className="font-semibold mb-2">Data Integrations (optional)</h4>
                <p className="text-sm text-slate-600 mb-3">
                  With your explicit permission, we can fetch data to improve recommendations:
                </p>
                <ul className="list-disc list-inside text-sm text-slate-700 mb-3">
                  <li>Smart meter: analyse consumption patterns to suggest peak‑relief and savings.</li>
                  <li>Kadaster housing: assess insulation options and solar/heat‑pump feasibility.</li>
                  <li>Municipality: check local constraints and program eligibility (demo only).</li>
                </ul>
                {integrationError && (
                  <div className="mb-3 p-2 text-sm bg-red-50 text-red-700 rounded">
                    {integrationError}
                  </div>
                )}
                {integrationStatus === 'idle' && (
                  <button onClick={startIntegrations} type="button" className="btn-primary">
                    Give Permission & Start
                  </button>
                )}
                {integrationStatus !== 'idle' && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">
                      {integrationStatus === 'running' ? 'Working…' : 'Completed'}
                    </div>
                    <div className="space-y-2">
                      {integrationSteps.map(step => (
                        <div key={step.id} className="flex items-center gap-2 text-sm">
                          {step.status === 'done' ? (
                            <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.414 0L3.293 9.828a1 1 0 111.414-1.414l3.222 3.222 6.657-6.657a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                          ) : step.status === 'running' ? (
                            <svg className="w-4 h-4 text-blue-600 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-300 inline-block"></span>
                          )}
                          <span className={step.status === 'done' ? 'text-slate-600' : step.status === 'running' ? 'text-slate-800' : 'text-slate-500'}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {integrationStatus === 'done' && autoFillData?.smartMeterInsights && (
                  <div className="mt-3 p-3 bg-green-50 rounded text-sm text-green-800">
                    <div className="font-medium mb-1">Smart meter insights:</div>
                    <div>Peak window: <strong>{autoFillData.smartMeterInsights.peakWindow}</strong></div>
                    <div>Night base load: <strong>{autoFillData.smartMeterInsights.nightBaseLoadKwh} kWh</strong></div>
                    <div className="text-green-900 mt-1">{autoFillData.smartMeterInsights.notes}</div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <label className="grid gap-2">
                  <span className="font-medium">Upload Energy Label (PDF/image)</span>
                  <input name="energyLabelDoc" type="file" accept=".pdf,image/*" className="block" />
                </label>
                <label className="grid gap-2">
                  <span className="font-medium">Upload Floor Plan (image)</span>
                  <input name="floorplanImage" type="file" accept="image/*" className="block" />
                </label>
              </div>
              <div>
                <button type="button" onClick={handleAIExtract} className="btn-secondary">Extract details with AI (demo)</button>
              </div>

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
                    <div className="text-sm text-slate-600">Help improve city-wide programs, receive personalized future recommendations. Kept up to 24 months from last use; deleted/anonymised within 30 days or on withdrawal.</div>
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
