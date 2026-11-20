import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Language, UserRole } from '../types';

export const Navigation: React.FC = () => {
  const { language, setLanguage, role, setRole, selectedPlot, plots, setSelectedPlotId } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: language === 'mr' ? 'डॅशबोर्ड' : language === 'hi' ? 'डैशबोर्ड' : 'Dashboard' },
    { to: '/test', label: language === 'mr' ? 'माती चाचणी' : language === 'hi' ? 'मृदा जांच' : 'Soil Test' },
    { to: '/report', label: language === 'mr' ? 'आरोग्य पत्रिका' : language === 'hi' ? 'स्वास्थ्य कार्ड' : 'Soil Card' },
    { to: '/crops', label: language === 'mr' ? 'पीक नफा' : language === 'hi' ? 'फसल लाभ' : 'Crop Yield' },
    { to: '/mandi-weather', label: language === 'mr' ? 'बाजारभाव' : language === 'hi' ? 'मंडी भाव' : 'Mandi Rates' },
    { to: '/assistant', label: language === 'mr' ? 'AI सहाय्यक' : language === 'hi' ? 'AI सहायक' : 'AI Help' },
    { to: '/device', label: language === 'mr' ? 'डिव्हाइस' : language === 'hi' ? 'डिवाइस' : 'Device' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-[0_4px_12px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
              🌱
            </div>
            <div>
              <div className="font-black text-lg leading-tight text-slate-900 tracking-tight">
                <span>Smart Soil</span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Plot Selector */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-bold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <select
                value={selectedPlot?.plot_id || ''}
                onChange={(e) => setSelectedPlotId(e.target.value)}
                className="bg-transparent text-slate-900 font-black focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                {plots.map(p => (
                  <option key={p.plot_id} value={p.plot_id} className="text-black">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full p-1 text-xs font-black">
              {(['mr', 'hi', 'en'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-1 rounded-full transition-all text-xs ${
                    language === l
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिंदी' : 'EN'}
                </button>
              ))}
            </div>

            {/* 3D Push CTA Button */}
            <button
              onClick={() => navigate('/test')}
              className="btn-3d-emerald px-5 py-2.5 text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{language === 'mr' ? 'चाचणी' : 'New Test'}</span>
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-50 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-2 py-2 flex items-center justify-around">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-white font-black bg-emerald-600 shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`
            }
          >
            <span className="text-xs font-bold">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
