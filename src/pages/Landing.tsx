import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { useTranslation } from '../i18n';

export default function Landing() {
  const { profile } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');

  return (
    <div className="py-16 text-center">
      <div className="max-w-3xl mx-auto relative">
        <h1 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">
          {t('landing.title')}
        </h1>
        <p className="text-xl text-slate-600 mb-12 leading-relaxed">
          {t('landing.subtitle')}
        </p>
        
        <Link to="/start" className="btn-primary text-lg">
          {t('cta.start')}
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
        <div className="card p-6">
          <div className="w-12 h-12 bg-[rgb(var(--brand))] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[rgb(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Personalized</h3>
          <p className="text-slate-600 text-sm">
            Recommendations tailored to your home, budget, and priorities.
          </p>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-[rgb(var(--brand))] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[rgb(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Grid-friendly</h3>
          <p className="text-slate-600 text-sm">
            Actions that help balance Amsterdam's energy network.
          </p>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-[rgb(var(--brand))] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[rgb(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Privacy-first</h3>
          <p className="text-slate-600 text-sm">
            No personal data stored. Your information stays private.
          </p>
        </div>
      </div>
    </div>
  );
}
