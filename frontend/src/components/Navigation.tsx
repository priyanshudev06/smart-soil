import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  FileSpreadsheet,
  Sprout,
  CloudSun,
  Bot,
  Cpu,
  MapPin,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Language, UserRole } from '../types';

export const Navigation: React.FC = () => {
  const { language, setLanguage, role, setRole, selectedPlot, plots, setSelectedPlotId } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: language === 'mr' ? 'डॅशबोर्ड' : language === 'hi' ? 'डैशबोर्ड' : 'Dashboard' },
    { to: '/test', label: language === 'mr' ? 'माती चाचणी' : language === 'hi' ? 'मृदा जांच' : 'Soil Analysis' },
    { to: '/report', label: language === 'mr' ? 'अहवाल' : language === 'hi' ? 'रिपोर्ट' : 'Health Card' },
    { to: '/crops', label: language === 'mr' ? 'पीक नियोजन' : language === 'hi' ? 'फसल योजना' : 'Crop Yield' },
    { to: '/mandi-weather', label: language === 'mr' ? 'बाजारभाव' : language === 'hi' ? 'मंडी भाव' : 'Mandi Rates' },
    { to: '/assistant', label: language === 'mr' ? 'AI सल्लागार' : language === 'hi' ? 'AI सलाहकार' : 'AI Advisory' },
    { to: '/device', label: language === 'mr' ? 'डिव्हाइस' : language === 'hi' ? 'डिवाइस' : 'IoT Device' },
  ];

  return (
    <>
      {/* 1. Vertex Architectural Header */}
      <header className="sticky top-0 z-50 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Monogram */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate('/')}
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#111827] text-white flex items-center justify-center font-serif font-black text-lg shadow-sm group-hover:bg-[#B02310] transition-colors">
                V
              </div>
              <div>
                <span className="font-serif font-bold text-xl tracking-tight text-[#111827]">
                  VERTEX
                </span>
                <span className="text-[10px] block font-sans tracking-widest uppercase text-[#B02310] font-bold -mt-1">
                  Soil Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-semibold tracking-tight transition-all relative py-1 ${
                    isActive
                      ? 'text-[#111827] font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#B02310]'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Controls: Plot Dropdown, Language & Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active Plot Pill */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-full px-3 py-1.5 shadow-sm text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#B02310] shrink-0" />
              <select
                value={selectedPlot?.plot_id || ''}
                onChange={(e) => setSelectedPlotId(e.target.value)}
                className="bg-transparent text-[#111827] font-bold focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[170px] truncate"
              >
                {plots.map(p => (
                  <option key={p.plot_id} value={p.plot_id} className="text-black">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-white border border-[#E5E7EB] rounded-full p-1 shadow-sm text-xs font-bold">
              {(['mr', 'hi', 'en'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-1 rounded-full transition-all text-xs ${
                    language === l
                      ? 'bg-[#111827] text-white shadow-sm'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिंदी' : 'EN'}
                </button>
              ))}
            </div>

            {/* Action CTA Button */}
            <button
              onClick={() => navigate('/test')}
              className="bg-[#B02310] hover:bg-[#8F1A0A] text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
            >
              <span>{language === 'mr' ? 'चाचणी' : 'New Test'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* 2. Responsive Bottom Nav for Mobile */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-50 bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-2 py-2 flex items-center justify-around">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-white font-extrabold bg-[#B02310] shadow-sm scale-105'
                  : 'text-white/60 hover:text-white'
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
