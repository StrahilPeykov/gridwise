import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { useTranslation } from '../i18n';
import { scoreActions } from '../scoring';
import type { UserProfile } from '../types';

export default function Start() {
  const navigate = useNavigate();
  const { setProfile, setRecs, track } = useApp();
  const { t } = useTranslation('en'); // Default to English for onboarding

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    const profile: UserProfile = {
      lang: (form.get('lang') as 'en' | 'nl') ?? 'en',
      pc4: String(form.get('pc4') ?? ''),
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
      }
    };

    setProfile(profile);
    setRecs(scoreActions(profile));
    track({ 
      t: Date.now(), 
      sid: crypto.randomUUID(), 
      event: 'onboarding_completed', 
      pc4: profile.pc4 
    });
    navigate('/plan');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Get Your Personalized Plan</h1>
        <p className="text-slate-600">Answer a few quick questions to get started</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6">
        {/* Language Selection */}
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

        {/* Home Details */}
        <fieldset className="card p-6">
          <legend className="font-semibold text-lg mb-4">Your Home</legend>
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="font-medium">{t('onboarding.pc4')}</span>
              <input 
                name="pc4" 
                required 
                pattern="\\d{4}" 
                className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none" 
                placeholder="1102" 
              />
            </label>
            
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-2">
                <span className="font-medium">{t('onboarding.hometype')}</span>
                <select name="homeType" className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none">
                  <option value="apartment">Apartment</option>
                  <option value="row">Row house</option>
                  <option value="detached">Detached</option>
                  <option value="semi-detached">Semi-detached</option>
                  <option value="maisonette">Maisonette</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="font-medium">{t('onboarding.buildyear')}</span>
                <select name="buildYearBand" className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none">
                  <option value="pre-1992">Before 1992</option>
                  <option value="1992-2005">1992-2005</option>
                  <option value="post-2005">After 2005</option>
                  <option value="unknown">Not sure</option>
                </select>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
                <select name="heating" className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none">
                  <option value="gas-boiler">Gas boiler</option>
                  <option value="district">District heating</option>
                  <option value="electric">Electric heating</option>
                  <option value="hybrid-heat-pump">Hybrid heat pump</option>
                  <option value="unknown">Not sure</option>
                </select>
              </label>
            </div>
          </div>
        </fieldset>

        {/* Energy & Comfort */}
        <fieldset className="card p-6">
          <legend className="font-semibold text-lg mb-4">Energy & Comfort</legend>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
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

              <label className="grid gap-2">
                <span className="font-medium">{t('onboarding.comfort')}</span>
                <select name="comfort" className="border border-slate-300 rounded-xl px-3 py-2 focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))] outline-none">
                  <option value="save-money">Save money</option>
                  <option value="warmer-home">Warmer home</option>
                  <option value="climate-impact">Climate impact</option>
                </select>
              </label>
            </div>

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
          </div>
        </fieldset>

        <button 
          type="submit"
          className="btn-primary text-lg"
        >
          {t('cta.getplan')}
        </button>
      </form>
    </div>
  );
}
