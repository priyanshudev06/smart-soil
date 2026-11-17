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
  Globe2,
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
    { to: '/crops', label: language === 'mr' ? 'पीक नियोजन' : language === 'hi' ? 'फसल योजना' : 'Crop Planner', icon: Sprout },
    { to: '/mandi-weather', label: language === 'mr' ? 'बाजार व हवामान' : language === 'hi' ? 'मंडी व मौसम' : 'Markets', icon: CloudSun },
    { to: '/assistant', label: language === 'mr' ? 'AI सहाय्यक' : language === 'hi' ? 'AI सहायक' : 'Assistant', icon: Bot },
    { to: '/device', label: language === 'mr' ? 'डिव्हाइस' : language === 'hi' ? 'डिवाइस' : 'Device', icon: Cpu },
  ];

  return (
    <>
      {/* 1. Floating Top App Bar (Inspired by Lumio Design System) */}
      <header className="sticky top-3 z-50 px-4 max-w-7xl mx-auto w-full">
        <div className="bg-[#181818]/95 backdrop-blur-xl border border-white/10 text-white rounded-full px-4 py-2.5 shadow-float flex items-center justify-between gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-pulse/20 border border-emerald-pulse/40 flex items-center justify-center shrink-0">
              <span className="text-emerald-400 font-bold text-sm">🌱</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-sm leading-tight text-white tracking-tight">Smart Soil</div>
              <div className="text-[10px] text-white/60">IoT Soil Health Reader</div>
            </div>
          </div>

          {/* Active Plot Selector */}
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={selectedPlot?.plot_id || ''}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[180px] truncate text-xs"
            >
              {plots.map(p => (
                <option key={p.plot_id} value={p.plot_id} className="bg-[#222] text-white">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 6).map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-black font-semibold'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Controls: Role, Language Pill, Offline Status */}
          <div className="flex items-center gap-2">
            {/* Online/Offline indicator */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${isOffline ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span className="hidden md:inline">{isOffline ? 'Offline' : 'Online'}</span>
            </div>

            {/* Language Switcher Pill */}
            <div className="flex items-center bg-white/10 rounded-full p-0.5 text-xs font-medium">
              {(['mr', 'hi', 'en'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
                    language === l ? 'bg-white text-black font-bold shadow' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिंदी' : 'EN'}
                </button>
              ))}
            </div>

            {/* Role Switcher Pill */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-white/10 text-white/90 text-[11px] rounded-full px-2 py-1 font-medium focus:outline-none cursor-pointer hidden md:block"
              title="Switch Persona / Role"
            >
              <option value="farmer" className="bg-[#222]">Farmer (शेतकरी)</option>
              <option value="operator" className="bg-[#222]">Field Operator</option>
              <option value="agronomist" className="bg-[#222]">Agronomist</option>
              <option value="admin" className="bg-[#222]">Admin</option>
            </select>
          </div>

        </div>
      </header>

      {/* 2. Responsive Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-50 bg-[#181818]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-float px-2 py-2 flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-white font-bold bg-white/15 scale-105'
                    : 'text-white/60 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
