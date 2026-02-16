import { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';

function VectaLogo() {
  return (
    <svg width="28" height="24" viewBox="0 0 85.64 73.71" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nav-vg1" x1="14.94" y1="79.54" x2="39.97" y2="20.28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f1dcaa" />
          <stop offset="1" stopColor="#f8ad63" />
        </linearGradient>
        <linearGradient id="nav-vg2" x1="13.18" y1="78.8" x2="38.21" y2="19.54" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f1dcaa" />
          <stop offset="1" stopColor="#f8ad63" />
        </linearGradient>
        <linearGradient id="nav-vg3" x1="40.55" y1="90.36" x2="65.58" y2="31.1" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f1dcaa" />
          <stop offset="1" stopColor="#f8ad63" />
        </linearGradient>
      </defs>
      <path fill="url(#nav-vg1)" d="M51.59,18.65l-8.96,12.41c-.36.5-1.11.5-1.47,0l-8.95-12.41c-1.26-1.75-1.26-4.1,0-5.85L41.16.38c.36-.5,1.11-.5,1.47,0l8.96,12.41c1.26,1.75,1.26,4.11,0,5.85Z" />
      <path fill="url(#nav-vg2)" d="M51.97,73.71h-17.42c-2.59,0-4.95-1.47-6.1-3.78L0,12.62h19.57c.34,0,.66.2.81.5l19.36,38.98c.58,1.16,1.76,1.89,3.05,1.89h18.4c1.56,0,3.06-.58,4.21-1.63h0s-7.19,17.19-7.19,17.19c-1.05,2.52-3.51,4.15-6.24,4.15Z" />
      <path fill="url(#nav-vg3)" d="M85.64,12.62h-16.98c-4.58,0-8.71,2.75-10.48,6.97l-12.88,30.81h15.93c2.75,0,5.22-1.65,6.28-4.18l11.64-27.82c1.17-2.81,3.56-4.93,6.48-5.78h0Z" />
    </svg>
  );
}

const NAV_LINKS = [
  { to: '/', label: 'Converter' },
  { to: '/compress', label: 'Comprimir' },
  { to: '/resize', label: 'Redimensionar' },
];

function HamburgerIcon({ isOpen }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {isOpen ? (
        <>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </>
      ) : (
        <>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </>
      )}
    </svg>
  );
}

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors duration-200 pb-0.5 border-b-2 ${
    isActive
      ? 'text-primary-700 border-primary-500'
      : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:border-neutral-300'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200 ${
    isActive
      ? 'text-primary-700 bg-primary-50'
      : 'text-neutral-600 hover:bg-neutral-100'
  }`;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <NavLink to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <VectaLogo />
            <span
              className="text-lg font-bold tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #3dbff2, #020f59)' }}
            >
              Vecta Convert
            </span>
          </NavLink>

          <div className="hidden sm:flex items-center gap-6">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass} end={to === '/'}>
                {label}
              </NavLink>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="sm:hidden p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <HamburgerIcon isOpen={isMenuOpen} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden border-t border-neutral-100 bg-white px-4 py-2 animate-fade-in">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={mobileLinkClass} end={to === '/'} onClick={closeMenu}>
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
