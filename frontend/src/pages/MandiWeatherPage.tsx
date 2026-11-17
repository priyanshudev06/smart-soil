import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CloudSun,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { MandiItem, WeatherDay } from '../types';

export const MandiWeatherPage: React.FC = () => {
  const { language, farmer } = useApp();

  const [district, setDistrict] = useState<string>(farmer?.district || 'Pune');
  const [mandi, setMandi] = useState<MandiItem[]>([]);
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-4 px-4">
      {/* Header */}
      <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <CloudSun className="w-3.5 h-3.5" />
            Verified Agmarknet & IMD Feeds
          </div>
          <h1 className="text-2xl font-black text-[#1B1B1B]">
            {language === 'mr' ? 'बाजारभाव व हवामान अंदाज' : 'Live Mandi Prices & 5-Day Weather'}
          </h1>
          <p className="text-xs text-muted mt-1">
            Daily market arrivals and meteorological advisories for {district} district
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-[#D9D7D0] rounded-full px-4 py-2 text-xs">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-muted">District:</span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-transparent font-bold text-[#1B1B1B] focus:outline-none cursor-pointer"
          >
            <option value="Pune">Pune (पुणे)</option>
            <option value="Nashik">Nashik (नाशिक)</option>
            <option value="Nagpur">Nagpur (नागपूर)</option>
            <option value="Solapur">Solapur (सोलापूर)</option>
          </select>
        </div>
      </div>

      {/* 5-Day Agro-Weather Forecast */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1B1B1B] flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-blue-600" />
          <span>5-Day Weather Forecast & Farm Action Advisories:</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {weather.map((w, i) => (
            <div
              key={i}
              className="bg-white border border-[#D9D7D0] rounded-2xl p-4 shadow-soft space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="font-bold text-[#1B1B1B]">{w.day}</span>
                  <span>{w.date}</span>
                </div>
                <div className="text-sm font-extrabold text-blue-900 mt-2">
                  {language === 'mr' ? w.condition_local : w.condition}
                </div>
                <div className="text-2xl font-black text-[#1B1B1B] mt-1">
                  {w.temp_max}° <span className="text-xs font-normal text-muted">/ {w.temp_min}°C</span>
                </div>
                <div className="text-[11px] text-muted mt-1">
                  Humidity: {w.humidity}% • Rain: {w.rainfall_probability}%
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-line/60 bg-[#F0EFEB] rounded-xl p-2 text-[10px] text-[#1B1B1B] leading-tight">
                <strong>Advisory:</strong> {w.advisory}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandi Rates Table */}
      <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-[#1B1B1B]">
              {language === 'mr' ? 'अधिकृत कृषी उत्पन्न बाजार समिती (APMC) भाव' : 'Official APMC Mandi Market Prices'}
            </h2>
          </div>
          <span className="text-xs text-muted">Source: AGMARKNET (agmarknet.gov.in)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D9D7D0] text-muted uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Commodity</th>
                <th className="py-2.5 px-3">Market Yard</th>
                <th className="py-2.5 px-3">Modal Price (मध्यम)</th>
                <th className="py-2.5 px-3">Min / Max Range</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Date & Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {mandi.map((item, idx) => (
                <tr key={idx} className="hover:bg-black/[0.02]">
                  <td className="py-3 px-3 font-bold text-[#1B1B1B]">
                    {language === 'mr' ? item.commodity_mr : item.commodity}
                  </td>
                  <td className="py-3 px-3 text-muted">{item.market}</td>
                  <td className="py-3 px-3">
                    <span className="text-base font-black text-emerald-800">
                      ₹{item.modal_price.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted">
                    ₹{item.min_price} - ₹{item.max_price}
                  </td>
                  <td className="py-3 px-3 text-muted">{item.unit}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-300">
                      {item.observed_date}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
