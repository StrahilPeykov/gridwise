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
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
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

            {/* For residents */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">For residents</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="https://www.amsterdam.nl/en/housing/sustainable-living/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Sustainable living (EN)</a>
                </li>
                <li>
                  <a href="https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/gratis-hulp-huis-energie-besparen/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Energy help at home – Energiehulp (NL)</a>
                </li>
                <li>
                  <a href="https://www.amsterdam.nl/en/waste-recycling/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Waste & recycling (EN)</a>
                </li>
                <li>
                  <a href="https://www.amsterdam.nl/en/work-income/benefits-low-income/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Benefits for residents with low incomes (EN)</a>
                </li>
              </ul>
            </div>

            {/* Policy & goals */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Policy & goals</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="https://www.amsterdam.nl/en/policy/sustainability/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Sustainability & energy (EN)</a>
                </li>
                <li>
                  <a href="https://www.amsterdam.nl/en/policy/sustainability/policy-climate-neutrality/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Climate neutrality (EN)</a>
                </li>
                <li>
                  <a href="https://www.amsterdam.nl/en/policy/sustainability/policy-climate-adaptation/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Climate adaptation (EN)</a>
                </li>
                <li>
                  <a href="https://www.amsterdam.nl/en/policy/sustainability/circular-economy/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Circular economy (EN)</a>
                </li>
                <li>
                  <a href="https://www.amsterdam.nl/en/policy/sustainability/renewable-energy/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Renewable energy (EN)</a>
                </li>
              </ul>
            </div>

            {/* Transport & mobility */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Transport & mobility</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="https://www.amsterdam.nl/en/traffic-transport/low-emission-zone/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Low & zero-emission zones (EN)</a>
                </li>
                <li>
                  <a href="https://www.amsterdam.nl/en/traffic-transport/boating/emission-free-zone/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Emission-free waterways (EN)</a>
                </li>
              </ul>
            </div>

            {/* Contact & site */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Contact & site</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="https://www.amsterdam.nl/en/contact-city-amsterdam/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Contact the City (EN)</a>
                </li>
                <li>
                  <a href="https://www.amsterdam.nl/en/general-items/items-footer/privacy-city-of-amsterdam/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Privacy (EN)</a>
                </li>
                <li>
                  <a href="https://www.amsterdam.nl/en/general-items/items-footer/cookies/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">Cookies (EN)</a>
                </li>
                <li>
                  <a href="https://www.amsterdam.nl/en/general-items/items-footer/about-website/" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--brand))] hover:underline">About this website (Accessibility) (EN)</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Sustainable energy • Circular economy • Climate adaptation.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Created for
              {' '}
              <a 
                href="https://amsterdampolicyhackathon.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Amsterdam Policy Hackathon 2025
              </a>
              . Site developed by Strahil Peykov.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
