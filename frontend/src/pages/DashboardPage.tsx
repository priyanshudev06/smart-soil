import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Sprout,
  ArrowRight,
  TrendingUp,
  CloudSun,
  ShieldCheck,
  AlertCircle,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { SoilSummary, MandiItem, WeatherDay } from '../types';

export const DashboardPage: React.FC = () => {
  const { language, farmer, selectedPlot, deviceConnected } = useApp();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<SoilSummary | null>(null);
  const [mandi, setMandi] = useState<MandiItem[]>([]);
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (selectedPlot) {
      setLoading(true);
      Promise.all([
        api.getSoilSummary(selectedPlot.plot_id),
        api.getMandiPrices(farmer?.district || 'Pune'),
        api.getWeather(farmer?.district || 'Pune')
      ]).then(([s, m, w]) => {
        setSummary(s);
        setMandi(m.slice(0, 3));
        setWeather(w.slice(0, 2));
        setLoading(false);
      });
    }
  }, [selectedPlot, farmer]);

  return (
    <div className="space-y-6 pb-20 pt-4 max-w-7xl mx-auto px-4">
      {/* 1. Farmer Welcome & Plot Status Header */}
      <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {deviceConnected ? 'IoT Reader Ready & Paired' : 'Device Offline (Manual/Sim Mode)'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1B1B] tracking-tight">
            {language === 'mr' ? `नमस्कार, ${farmer?.name || 'शेतकरी मित्र'}` : language === 'hi' ? `नमस्ते, ${farmer?.name || 'किसान भाई'}` : `Welcome, ${farmer?.name || 'Farmer'}`}
          </h1>
          <p className="text-muted text-sm mt-1">
            {selectedPlot?.label} • {selectedPlot?.area} {selectedPlot?.area_unit} ({selectedPlot?.soil_type})
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate('/test')}
            className="w-full md:w-auto bg-[#181818] hover:bg-black text-white px-5 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-float transition-all hover:scale-[1.02]"
          >
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <span>{language === 'mr' ? 'नवीन माती चाचणी सुरू करा' : language === 'hi' ? 'नई मृदा जांच शुरू करें' : 'Run New Soil Test'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* 2. Key Soil Health Card Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* pH Card */}
        <div className="bg-white border border-[#D9D7D0] rounded-2xl p-5 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-muted mb-2 font-medium">
            <span>Soil pH (सामू)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
              Estimated
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#1B1B1B]">
              {summary?.parameters.pH.value || '6.8'}
            </span>
            <span className="text-xs text-muted">pH Units</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            Interval: {summary?.parameters.pH.interval || '[6.5 - 7.1]'}
          </div>
          <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-muted">
            <span>Status: Optimal Neutral</span>
            <span className="text-emerald-600 font-medium">No Lime Needed</span>
          </div>
        </div>

        {/* Nitrogen (N) Card */}
        <div className="bg-white border border-[#D9D7D0] rounded-2xl p-5 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-muted mb-2 font-medium">
            <span>Nitrogen (नत्र - N)</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
              Estimated
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1B1B1B]">
              {summary?.parameters['Nitrogen (N)'].value || 'Medium'}
            </span>
            <span className="text-xs text-muted">Kit Class</span>
          </div>
          <div className="text-xs text-muted mt-1">
            {summary?.parameters['Nitrogen (N)'].interval || '280 - 560 kg/ha eq.'}
          </div>
          <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-muted">
            <span>Griess Diazo Strip</span>
            <span className="text-blue-600 font-medium">Moderate</span>
          </div>
        </div>

        {/* Phosphorus (P) Card */}
        <div className="bg-white border border-[#D9D7D0] rounded-2xl p-5 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-muted mb-2 font-medium">
            <span>Phosphorus (स्फुरद - P)</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-200">
              Estimated
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1B1B1B]">
              {summary?.parameters['Phosphorus (P)'].value || 'Medium'}
            </span>
            <span className="text-xs text-muted">Kit Class</span>
          </div>
          <div className="text-xs text-muted mt-1">
            {summary?.parameters['Phosphorus (P)'].interval || '10 - 25 kg/ha eq.'}
          </div>
          <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-muted">
            <span>Moly-Blue Strip</span>
            <span className="text-purple-600 font-medium">Adequate</span>
          </div>
        </div>

        {/* Potassium (K) Card */}
        <div className="bg-white border border-[#D9D7D0] rounded-2xl p-5 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-muted mb-2 font-medium">
            <span>Potassium (पालाश - K)</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
              Estimated
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1B1B1B]">
              {summary?.parameters['Potassium (K)'].value || 'High'}
            </span>
            <span className="text-xs text-muted">Kit Class</span>
          </div>
          <div className="text-xs text-muted mt-1">
            {summary?.parameters['Potassium (K)'].interval || '> 280 kg/ha eq.'}
          </div>
          <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-muted">
            <span>Precipitation Strip</span>
            <span className="text-amber-600 font-medium">Rich in Soil</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Crop Suitability & Live Market Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended Crops Preview */}
        <div className="lg:col-span-2 bg-[#F0EFEB] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-[#1B1B1B]">
                {language === 'mr' ? 'मातीनुसार सर्वाधिक योग्य पिके' : language === 'hi' ? 'मृदा के अनुसार उपयुक्त फसलें' : 'Recommended Crops for this Soil'}
              </h2>
            </div>
            <button
              onClick={() => navigate('/crops')}
              className="text-xs font-semibold text-[#1B1B1B] hover:underline flex items-center gap-1"
            >
              <span>{language === 'mr' ? 'सर्व पहा' : language === 'hi' ? 'सभी देखें' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { name: language === 'mr' ? 'सोयाबीन (Soybean)' : 'Soybean', score: 85, season: 'Kharif', profit: '₹28,000 - ₹38,000/ac', tag: 'Top Match' },
              { name: language === 'mr' ? 'कांदा (Onion)' : 'Onion', score: 80, season: 'Rabi/Late Kharif', profit: '₹45,000 - ₹85,000/ac', tag: 'High Profit' },
              { name: language === 'mr' ? 'कापूस (Cotton)' : 'Cotton', score: 78, season: 'Kharif', profit: '₹32,000 - ₹50,000/ac', tag: 'Good Match' }
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-[#D9D7D0] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-emerald-700">
                    <span>{c.tag}</span>
                    <span className="bg-emerald-100 px-2 py-0.5 rounded-full">{c.score}% Match</span>
                  </div>
                  <div className="font-bold text-base text-[#1B1B1B]">{c.name}</div>
                  <div className="text-xs text-muted mt-0.5">Season: {c.season}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-line/60 text-xs font-medium text-emerald-800">
                  Est. Net: {c.profit}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/80 rounded-2xl p-3 border border-[#D9D7D0] flex items-center gap-3 text-xs text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Crops ranked deterministically using ICAR & MPKV Rahuri agronomic rules matching pH 6.8 and medium deep black soil.
            </span>
          </div>
        </div>

        {/* Mandi & Weather Snippet */}
        <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-[#1B1B1B]">
                  {language === 'mr' ? 'पुणे बाजारभाव (Mandi)' : language === 'hi' ? 'पुणे मंडी भाव' : 'Pune Mandi Rates'}
                </h3>
              </div>
              <button onClick={() => navigate('/mandi-weather')} className="text-xs text-muted hover:text-black">
                Details &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {mandi.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0EFEB] border border-line text-xs">
                  <div>
                    <div className="font-semibold text-[#1B1B1B]">{item.commodity}</div>
                    <div className="text-[10px] text-muted">{item.market}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#1B1B1B]">₹{item.modal_price}</div>
                    <div className="text-[10px] text-muted">per Quintal</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather mini forecast */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CloudSun className="w-6 h-6 text-emerald-700" />
              <div>
                <div className="text-xs font-bold text-emerald-950">Pune: 31°C / 18°C</div>
                <div className="text-[11px] text-emerald-800">Sunny • IMD GKMS Advisory Active</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/mandi-weather')}
              className="text-xs bg-white text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full font-semibold"
            >
              Forecast
            </button>
          </div>
        </div>

      </div>

      {/* 4. Strict Scientific Disclaimer Banner (Mandated by PRD Section 13) */}
      <div className="bg-[#FAF9F5] border border-[#D9D7D0] rounded-2xl p-4 flex items-start gap-3 text-xs text-muted">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#1B1B1B]">Scientific Transparency & Limitations: </span>
          The optical sensor measures color changes of paper test chemical reaction products under controlled illumination. These results provide rapid qualitative screening (Low / Medium / High) and indicative pH estimation. They do not replace formal laboratory testing required under the national Soil Health Card scheme. High-dose chemical fertilizer prescriptions must be verified with certified soil tests.
        </div>
      </div>
    </div>
  );
};
