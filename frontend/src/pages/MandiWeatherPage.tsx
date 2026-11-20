import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CloudSun,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Droplets,
  Wind
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { MandiItem, WeatherDay } from '../types';
import { Card3D } from '../components/Card3D';
import { PopUpModal } from '../components/PopUpModal';

export const MandiWeatherPage: React.FC = () => {
  const { language, farmer } = useApp();

  const [district, setDistrict] = useState<string>(farmer?.district || 'Pune');
  const [mandi, setMandi] = useState<MandiItem[]>([]);
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pop-up modal state
  const [activeWeatherModal, setActiveWeatherModal] = useState<WeatherDay | null>(null);
  const [activeMandiModal, setActiveMandiModal] = useState<MandiItem | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getMandiPrices(district),
      api.getWeather(district)
    ]).then(([m, w]) => {
      setMandi(m);
      setWeather(w);
      setLoading(false);
    });
  }, [district]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 pt-6 px-4 sm:px-8">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-8 sm:p-10 text-white shadow-xl border border-slate-800 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {language === 'mr' ? 'बाजारभाव व ५-दिवसीय हवामान' : 'Mandi Rates & 5-Day Weather'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium">
            Real-time market arrivals and meteorological spraying advisories for <strong className="text-white">{district}</strong>
          </p>
        </div>

        {/* District Selector Pill */}
        <div className="z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300">District:</span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-slate-900 text-white rounded-lg px-2 py-1 font-bold text-xs focus:outline-none border border-slate-700 cursor-pointer"
          >
            <option value="Pune">Pune (पुणे)</option>
            <option value="Nashik">Nashik (नाशिक)</option>
            <option value="Nagpur">Nagpur (नागपूर)</option>
            <option value="Solapur">Solapur (सोलापूर)</option>
          </select>
        </div>
      </div>

      {/* 2. 5-Day Weather Forecast */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CloudSun className="w-7 h-7 text-cyan-600" />
          <span>5-Day Agro-Weather Forecast</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {weather.map((w, idx) => (
            <Card3D
              key={idx}
              glowColor="blue"
              onClick={() => setActiveWeatherModal(w)}
              className="p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-extrabold uppercase">
                  <span className="text-slate-900 font-black text-sm">{w.day}</span>
                  <span>{w.date}</span>
                </div>

                <div className="text-sm font-black text-cyan-700">
                  {language === 'mr' ? w.condition_local : w.condition}
                </div>

                <div className="text-3xl font-black text-slate-900">
                  {w.temp_max}° <span className="text-xs font-normal text-slate-400">/ {w.temp_min}°C</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold pt-1">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" /> {w.rainfall_probability}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-cyan-500" /> {w.humidity}%
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 rounded-xl p-2.5 text-[11px] font-semibold text-slate-700 leading-snug line-clamp-2">
                {w.advisory}
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* 3. Mandi Market Prices */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-emerald-600" />
          <span>Live APMC Market Rates</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {mandi.map((item, idx) => {
            const isHigh = item.modal_price >= (item.min_price + item.max_price) / 2;
            const displayName = language === 'mr' ? item.commodity_mr : language === 'hi' ? item.commodity_hi : item.commodity;
            return (
              <Card3D
                key={idx}
                glowColor={isHigh ? 'emerald' : 'amber'}
                onClick={() => setActiveMandiModal(item)}
                className="p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {item.market}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">
                        {displayName}
                      </h3>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
                      isHigh
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <TrendingUp className="w-3.5 h-3.5" />
                      {isHigh ? '+High' : 'Steady'}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-500 block">Modal Price ({item.unit})</span>
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                      ₹{item.modal_price.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold mt-1">
                      Range: ₹{item.min_price} – ₹{item.max_price}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span>View Trade Intel</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </Card3D>
            );
          })}
        </div>
      </div>

      {/* PopUp Modal for Weather Advisory */}
      <PopUpModal
        isOpen={!!activeWeatherModal}
        onClose={() => setActiveWeatherModal(null)}
        title={`${activeWeatherModal?.day} (${activeWeatherModal?.date})`}
        subtitle="Agrometeorological Advisory & Spraying Window"
      >
        {activeWeatherModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200">
              <span className="text-xs font-black text-cyan-800 uppercase tracking-wider block mb-1">
                Official Recommendation
              </span>
              <p className="text-sm font-bold text-slate-800 leading-relaxed">
                {activeWeatherModal.advisory}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Temperature Range</span>
                <span className="text-base font-black text-slate-900">
                  {activeWeatherModal.temp_min}°C to {activeWeatherModal.temp_max}°C
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Rainfall Probability</span>
                <span className="text-base font-black text-slate-900">
                  {activeWeatherModal.rainfall_probability}% Chance
                </span>
              </div>
            </div>
          </div>
        )}
      </PopUpModal>

      {/* PopUp Modal for Mandi Commodity Details */}
      <PopUpModal
        isOpen={!!activeMandiModal}
        onClose={() => setActiveMandiModal(null)}
        title={activeMandiModal?.commodity || 'Market Price'}
        subtitle={`APMC Mandi: ${activeMandiModal?.market}`}
      >
        {activeMandiModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block mb-1">
                Prevailing Modal Price
              </span>
              <div className="text-3xl font-black text-emerald-700">
                ₹{activeMandiModal.modal_price} / {activeMandiModal.unit}
              </div>
              <p className="text-xs font-medium text-slate-600 mt-1">
                Freshness: {activeMandiModal.freshness} &bull; Source: {activeMandiModal.source}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Minimum Price</span>
                <span className="text-base font-black text-slate-900">₹{activeMandiModal.min_price}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Maximum Price</span>
                <span className="text-base font-black text-slate-900">₹{activeMandiModal.max_price}</span>
              </div>
            </div>
          </div>
        )}
      </PopUpModal>

    </div>
  );
};
