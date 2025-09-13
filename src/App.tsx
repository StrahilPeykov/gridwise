import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useApp } from './store';
import { useTranslation } from './i18n';
import Landing from './pages/Landing';
import Start from './pages/Start';
import Plan from './pages/Plan';
import Rewards from './pages/Rewards';
import Coach from './pages/Coach';
import Admin from './pages/Admin';

export default function App() {
  const { profile } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-base font-semibold text-[rgb(var(--brand))]">
            GridWise Amsterdam
          </Link>
          <nav className="flex gap-1 text-sm">
            <Link 
              to="/start" 
              className={`nav-pill ${location.pathname === '/start' ? 'bg-slate-100 font-semibold' : ''}`}
            >
              {t('nav.start')}
            </Link>
            <Link 
              to="/plan" 
              className={`nav-pill ${location.pathname === '/plan' ? 'bg-slate-100 font-semibold' : ''}`}
            >
              {t('nav.plan')}
            </Link>
            <Link 
              to="/rewards" 
              className={`nav-pill ${location.pathname === '/rewards' ? 'bg-slate-100 font-semibold' : ''}`}
            >
              {t('nav.rewards')}
            </Link>
            <Link 
              to="/coach" 
              className={`nav-pill ${location.pathname === '/coach' ? 'bg-slate-100 font-semibold' : ''}`}
            >
              {t('nav.coach')}
            </Link>
            <Link 
              to="/admin" 
              className={`nav-pill ${location.pathname === '/admin' ? 'bg-slate-100 font-semibold' : ''}`}
            >
              {t('nav.admin')}
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/start" element={<Start />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <footer className="mt-12 border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[rgb(var(--brand))]"></span>
            <span>GridWise Amsterdam</span>
          </div>
          <div className="flex items-center gap-4">
            <a className="hover:underline" href="/start">{t('nav.start')}</a>
            <a className="hover:underline" href="/plan">{t('nav.plan')}</a>
            <a className="hover:underline" href="/rewards">{t('nav.rewards')}</a>
            <a className="hover:underline" href="/coach">{t('nav.coach')}</a>
            <a className="hover:underline" href="/admin">{t('nav.admin')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
