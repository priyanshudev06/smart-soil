import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  FileSpreadsheet,
  Sprout,
  CloudSun,
  Bot,
  Cpu,
  MapPin,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Language, UserRole } from '../types';

export const Navigation: React.FC = () => {
  const { language, setLanguage, role, setRole, selectedPlot, plots, setSelectedPlotId, isOffline } = useApp();

  const navItems = [
    { to: '/', label: language === 'mr' ? 'डॅशबोर्ड' : language === 'hi' ? 'डैशबोर्ड' : 'Dashboard', icon: LayoutDashboard },
    { to: '/test', label: language === 'mr' ? 'माती चाचणी' : language === 'hi' ? 'मृदा जांच' : 'Soil Test', icon: FlaskConical },
    { to: '/report', label: language === 'mr' ? 'अहवाल' : language === 'hi' ? 'रिपोर्ट' : 'Report', icon: FileSpreadsheet },
    { to: '/crops', label: language === 'mr' ? 'पीक नियोजन' : language === 'hi' ? 'फसल योजना' : 'Crops', icon: Sprout },
    { to: '/mandi-weather', label: language === 'mr' ? 'बाजार व हवामान' : language === 'hi' ? 'मंडी व मौसम' : 'Markets', icon: CloudSun },
    { to: '/assistant', label: language === 'mr' ? 'AI सल्लागार' : language === 'hi' ? 'AI सलाहकार' : 'AI Help', icon: Bot },
    { to: '/device', label: language === 'mr' ? 'डिव्हाइस' : language === 'hi' ? 'डिवाइस' : 'Device', icon: Cpu },
  ];

  return (
    <>
      {/* Floating Top App Bar */}
      <header className="sticky top-4 z-50 px-4 max-w-7xl mx-auto w-full">
        <div className="bg-[#181818]/95 backdrop-blur-xl border-2 border-white/15 text-white rounded-full px-5 py-3 shadow-float flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
              <span className="text-xl">🌱</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-black text-base leading-tight text-white tracking-tight">Smart Soil</div>
              <div className="text-xs text-emerald-400 font-bold">IoT Assistant</div>
            </div>
          </div>

          {/* Active Plot Selector Pill */}
          <div className="flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full text-sm font-semibold border border-white/10">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedPlot?.plot_id || ''}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[200px] truncate text-sm"
            >
              {plots.map(p => (
                <option key={p.plot_id} value={p.plot_id} className="bg-[#222] text-white">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.slice(0, 6).map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-white text-black shadow-md scale-105'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Controls: Language & Persona Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-white/15 rounded-full p-1 text-xs font-bold border border-white/10">
              {(['mr', 'hi', 'en'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-3 py-1 rounded-full transition-all text-xs ${
                    language === l ? 'bg-white text-black font-black shadow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिंदी' : 'EN'}
                </button>
              ))}
            </div>

            {/* Persona Switcher */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-white/15 text-white text-xs font-bold rounded-full px-3 py-1.5 focus:outline-none cursor-pointer hidden md:block border border-white/10"
              title="Switch Persona / Role"
            >
              <option value="farmer" className="bg-[#222]">Farmer</option>
              <option value="operator" className="bg-[#222]">Operator</option>
              <option value="agronomist" className="bg-[#222]">Agronomist</option>
              <option value="admin" className="bg-[#222]">Admin</option>
            </select>
          </div>

        </div>
      </header>

      {/* Responsive Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 bg-[#181818]/95 backdrop-blur-xl border-2 border-white/15 rounded-3xl shadow-float px-3 py-2.5 flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'text-white font-black bg-white/20 scale-105'
                    : 'text-white/60 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-bold mt-1 leading-none">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
