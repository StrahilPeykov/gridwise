import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApp } from './store';
import { useTranslation } from './i18n';
import Landing from './pages/Landing';
import Start from './pages/Start';
import Plan from './pages/Plan';
import Rewards from './pages/Rewards';
import Admin from './pages/Admin';

export default function App() {
  const { profile, setProfile } = useApp();
  const { t } = useTranslation(profile?.lang || 'en');
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Close mobile menu on route change
    setMobileOpen(false);
  }, [location.pathname]);

  // Enforce temporary consent expiry on app load and route changes
  useEffect(() => {
    if (profile?.dataConsent === 'temporary' && profile.consentExpiresAt && Date.now() > profile.consentExpiresAt) {
      setProfile({ ...profile, dataConsent: 'none', consentExpiresAt: undefined });
    }
  }, [profile?.dataConsent, profile?.consentExpiresAt, location.pathname]);

  const navItems = [
    { path: '/start', label: 'Energy Assessment', key: 'nav.start' },
    { path: '/plan', label: 'My Transition Plan', key: 'nav.plan' },
    { path: '/rewards', label: 'Credits & Rewards', key: 'nav.rewards' },
    { path: '/admin', label: 'Policy Insights', key: 'nav.admin' }
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-700))] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-base font-semibold text-[rgb(var(--brand))]">
              GridWise Amsterdam
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1 text-sm">
            {navItems.map(({ path, label, key }) => (
              <Link 
                key={path}
                to={path} 
                className={`nav-pill ${location.pathname === path ? 'bg-slate-100 font-semibold' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(o => !o)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Menu</span>
          </button>
        </div>

        {/* Mobile nav panel */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                {navItems.map(({ path, label }) => (
                  <Link 
                    key={path}
                    to={path} 
                    className={`nav-pill ${location.pathname === path ? 'bg-slate-100 font-semibold' : ''}`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className={`max-w-6xl mx-auto px-4 ${location.pathname === '/' ? 'pb-6' : 'py-6'}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/start" element={<Start />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <footer className="mt-12 border-t bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-700))] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-[rgb(var(--brand))]">GridWise Amsterdam</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Supporting Amsterdam's energy transition through personalized guidance and community action.
              </p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>Privacy by design</span>
                <span>•</span>
                <span>GDPR compliant</span>
                <span>•</span>
                <span>Open source</span>
              </div>
            </div>

            {/* Amsterdam Goals */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Amsterdam Climate Goals</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>2030: 55% CO₂ reduction</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  <span>2040: Natural gas phase-out</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>2050: Climate neutrality</span>
                </li>
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Platform</h3>
              <div className="space-y-2">
                {navItems.map(({ path, label }) => (
                  <div key={path}>
                    <Link 
                      to={path}
                      className="text-sm text-slate-600 hover:text-[rgb(var(--brand))] hover:underline block"
                    >
                      {label}
                    </Link>
                  </div>
                ))}
                <div className="pt-2 mt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Created for Amsterdam Policy Hackathon 2025
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Built with Amsterdam's climate justice principles: "Unequal investment for equal opportunities"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
