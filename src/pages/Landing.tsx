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
            Power Amsterdam's <br />
            <span className="text-[rgb(var(--brand))]">Energy Future</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-slate-600 mb-6 max-w-4xl mx-auto leading-relaxed">
            Make smart energy choices for your home while supporting Amsterdam's transition to sustainable power.
          </p>
          
          <p className="text-lg text-slate-500 mb-12 max-w-3xl mx-auto">
            Get personalized recommendations in 60 seconds. Help reduce grid congestion. Earn rewards for climate-friendly actions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/start" className="btn-primary text-lg px-8 py-4">
              {t('cta.start')}
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/coach" className="btn-secondary text-lg px-8 py-4">
              Talk to energy coach
            </Link>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-[rgb(var(--brand))]">60 sec</div>
              <div className="text-sm text-slate-600">Quick assessment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[rgb(var(--brand))]">€200+</div>
              <div className="text-sm text-slate-600">Avg. annual savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[rgb(var(--brand))]">100%</div>
              <div className="text-sm text-slate-600">Privacy protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Amsterdam's Energy Challenge
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our city's energy grid is under pressure. Rising demand, aging infrastructure, and the transition away from gas create complex challenges for residents.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Grid Congestion</h3>
                    <p className="text-slate-600">Multiple Amsterdam neighborhoods face delays in new connections due to network capacity limits.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Rising Energy Costs</h3>
                    <p className="text-slate-600">Inflation and market volatility make energy efficiency more important than ever for household budgets.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Complex Choices</h3>
                    <p className="text-slate-600">Heat pumps, solar panels, insulation, subsidies – the options are overwhelming for most residents.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <div className="bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-700))] rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">You Can Help</h3>
                <p className="text-green-50 mb-6">
                  Every smart energy choice by residents helps reduce peak demand, supports grid stability, and accelerates Amsterdam's path to climate neutrality by 2050.
                </p>
                <div className="bg-white/20 rounded-2xl p-4">
                  <div className="text-3xl font-bold">2050</div>
                  <div className="text-green-100 text-sm">Climate neutral Amsterdam</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Smart Choices Made Simple
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              GridWise gives you personalized recommendations that save money, improve comfort, and support Amsterdam's energy transition.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[rgb(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Tailored to Your Home</h3>
              <p className="text-slate-600 mb-6">
                Get recommendations based on your specific home type, budget, heating system, and priorities. No generic advice.
              </p>
              <div className="text-sm text-[rgb(var(--brand))] font-medium">
                Apartment • Row house • Detached home
              </div>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[rgb(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Grid-Smart Actions</h3>
              <p className="text-slate-600 mb-6">
                Prioritized actions that help reduce peak demand and support Amsterdam's energy infrastructure. Extra rewards for grid-constrained areas.
              </p>
              <div className="text-sm text-[rgb(var(--brand))] font-medium">
                Peak demand reduction • Load balancing
              </div>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[rgb(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Privacy by Design</h3>
              <p className="text-slate-600 mb-6">
                No personal data stored. All recommendations happen locally. Anonymous insights help improve city energy policy.
              </p>
              <div className="text-sm text-[rgb(var(--brand))] font-medium">
                Local processing • Anonymous analytics
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Three Steps to Action
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Quick Assessment</h3>
              <p className="text-slate-600">
                Answer 8 questions about your home, heating, and energy priorities. Takes less than 60 seconds.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Your Plan</h3>
              <p className="text-slate-600">
                Receive personalized recommendations with costs, savings, and payback times. Focus on actions that fit your budget.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Take Action</h3>
              <p className="text-slate-600">
                Implement changes at your own pace. Earn credits for sustainable choices. Book free energy coach support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Ready to Power Amsterdam's Future?
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of Amsterdam residents making smart energy choices. Start your personalized plan today.
          </p>
          
          <Link to="/start" className="btn-primary text-lg px-8 py-4 mb-8">
            {t('cta.start')}
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <div className="text-sm text-slate-500">
            Free • No account required • Privacy protected
          </div>
        </div>
      </section>
    </div>
  );
}