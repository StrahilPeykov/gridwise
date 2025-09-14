// Updated Landing.tsx - Better aligned with Amsterdam's official language

import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { useTranslation } from '../i18n';

export default function Landing() {
  const { profile } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        {/* Amsterdam-inspired geometric pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-16 h-16 border-2 border-red-600 rotate-45"></div>
          <div className="absolute top-32 right-20 w-12 h-12 border-2 border-red-600"></div>
          <div className="absolute bottom-20 left-32 w-20 h-20 border-2 border-red-600 rotate-12"></div>
          <div className="absolute bottom-40 right-10 w-14 h-14 border-2 border-red-600 rotate-45"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 text-center relative">
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight leading-tight">
            Amsterdam's <br />
            <span className="text-[rgb(var(--brand))]">Sustainable Future</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-slate-600 mb-6 max-w-4xl mx-auto leading-relaxed">
            Join the energy transition. Get personalized guidance that saves money, reduces grid congestion, and helps Amsterdam reach climate neutrality by 2050.
          </p>
          
          <p className="text-lg text-slate-500 mb-12 max-w-3xl mx-auto">
            Fair access to energy solutions for all residents. Privacy-protected recommendations that support city-wide sustainability goals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/start" className="btn-primary text-lg px-8 py-4">
              {t('cta.start')}
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a 
              href="https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/gratis-hulp-huis-energie-besparen/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary text-lg px-8 py-4"
            >
              Free energy coach consultation
            </a>
          </div>

          {/* Key Stats - Updated to reflect Amsterdam's goals */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-[rgb(var(--brand))]">2050</div>
              <div className="text-sm text-slate-600">Climate neutral Amsterdam</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[rgb(var(--brand))]">60%</div>
              <div className="text-sm text-slate-600">CO₂ reduction by 2030</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[rgb(var(--brand))]">100%</div>
              <div className="text-sm text-slate-600">Privacy by design</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Updated with Amsterdam's specific challenges */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Amsterdam's Energy Transition Challenge
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our city faces urgent challenges: grid congestion, rising costs, and the need to phase out natural gas by 2040. 
              Every resident's choice matters for our collective sustainable future.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Grid Capacity Constraints</h3>
                    <p className="text-slate-600">Multiple neighborhoods face connection delays. New housing and business developments are postponed due to insufficient grid capacity.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Energy Poverty & Inequality</h3>
                    <p className="text-slate-600">Rising energy costs disproportionately affect vulnerable residents in poorly insulated homes. The energy transition must be fair for all Amsterdammers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Complex Transition Choices</h3>
                    <p className="text-slate-600">Heat pumps, solar panels, insulation, district heating, subsidies – residents need clear, personalized guidance to navigate options.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <div className="bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-700))] rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Our City of Tomorrow</h3>
                <p className="text-green-50 mb-6">
                  Amsterdam is committed to <strong>unequal investment for equal opportunities</strong> – 
                  prioritizing support for the most vulnerable while ensuring all residents can participate in the energy transition.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-2xl p-3">
                    <div className="text-2xl font-bold">2030</div>
                    <div className="text-green-100 text-xs">Zero-emission transport</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-3">
                    <div className="text-2xl font-bold">2040</div>
                    <div className="text-green-100 text-xs">Natural gas phase-out</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Features - Updated with Amsterdam's specific approach */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Supporting Your Energy Transition
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Personalized recommendations that align with Amsterdam's climate goals and support grid stability. 
              Fair access to sustainable solutions for every resident.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[rgb(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Fair & Accessible</h3>
              <p className="text-slate-600 mb-6">
                Priority recommendations for renters and vulnerable residents. Low-cost actions available regardless of income or housing situation.
              </p>
              <div className="text-sm text-[rgb(var(--brand))] font-medium">
                Renter-friendly • Low-income support • VVE guidance
              </div>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[rgb(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Grid-Conscious Solutions</h3>
              <p className="text-slate-600 mb-6">
                Actions prioritized by their impact on peak demand reduction and grid stability. Extra rewards for residents in capacity-constrained areas.
              </p>
              <div className="text-sm text-[rgb(var(--brand))] font-medium">
                Peak shifting • Load balancing • Grid relief
              </div>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[rgb(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Privacy & Policy Insights</h3>
              <p className="text-slate-600 mb-6">
                No personal data stored. Anonymous insights help Amsterdam improve energy policy and subsidies based on real resident needs.
              </p>
              <div className="text-sm text-[rgb(var(--brand))] font-medium">
                GDPR compliant • Municipal insights • Policy feedback
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Updated to include Amsterdam's energy coach program */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Three Steps to Your Energy Transition
            </h2>
            <p className="text-slate-600">
              Connected to Amsterdam's existing energy support programs and coaches
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Quick Assessment</h3>
              <p className="text-slate-600">
                Tell us about your home, heating system, and priorities. Anonymous data helps improve Amsterdam's energy policy.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Personalized Recommendations</h3>
              <p className="text-slate-600">
                Get actions ranked by grid impact, cost-effectiveness, and eligibility for Amsterdam subsidies and support programs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Take Action & Get Support</h3>
              <p className="text-slate-600">
                Connect with Amsterdam's free energy coaches for personal guidance. Earn rewards for grid-friendly choices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Ready to Join Amsterdam's Energy Transition?
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Be part of the solution. Help Amsterdam reach climate neutrality by 2050 while saving money on your energy bills.
          </p>
          
          <Link to="/start" className="btn-primary text-lg px-8 py-4 mb-8">
            {t('cta.start')}
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <div className="text-sm text-slate-500">
            Free • Privacy-protected • Connected to municipal energy support
          </div>
        </div>
      </section>
    </div>
  );
}
