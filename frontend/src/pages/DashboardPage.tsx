import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Sprout,
  ArrowUpRight,
  TrendingUp,
  CloudSun,
  ShieldCheck,
  MapPin,
  Sparkles,
  Layers
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { SoilSummary, MandiItem, WeatherDay } from '../types';
import { Soil3DCanvas } from '../components/Soil3DCanvas';

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
    <div className="space-y-10 pb-24 pt-6 max-w-7xl mx-auto px-4 sm:px-8">
      
      {/* 1. Vertex Architectural Split Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Editorial Text Column */}
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B02310]/10 text-[#B02310] text-xs font-black tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#B02310]"></span>
              {deviceConnected ? 'IoT Reader Paired & Active' : 'Precision Spectrometry Mode'}
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#111827] tracking-tight leading-[1.1]">
              Soil Health <br />
              <span className="italic font-normal text-[#B02310]">&amp; Yield Intelligence.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#4B5563] font-normal leading-relaxed max-w-xl">
              Real-time colorimetric chemical diagnostics for <strong className="text-[#111827]">{selectedPlot?.label}</strong> ({selectedPlot?.area} Acres, {selectedPlot?.soil_type}). Grounded in validated agronomic algorithms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#E5E7EB]">
            <button
              onClick={() => navigate('/test')}
              className="bg-[#111827] hover:bg-[#B02310] text-white px-8 py-4 rounded-full text-base font-bold flex items-center gap-2 shadow-sm hover:scale-105 transition-all duration-300"
            >
              <FlaskConical className="w-5 h-5" />
              <span>{language === 'mr' ? 'नवीन चाचणी सुरू करा' : 'Start Soil Analysis'}</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => navigate('/report')}
              className="bg-transparent hover:bg-gray-100 text-[#111827] border border-[#D1D5DB] px-6 py-4 rounded-full text-base font-bold transition-all"
            >
              {language === 'mr' ? 'अहवाल पहा' : 'View Health Card'}
            </button>
          </div>
        </div>

        {/* Right 3D Interactive Canvas Column (Vertex Showcase Style) */}
        <div className="lg:col-span-5 bg-[#1E0B09] rounded-3xl p-6 shadow-sm border border-[#3A1814] flex flex-col justify-between relative overflow-hidden min-h-[360px]">
          {/* Top Label */}
          <div className="relative z-10 flex items-center justify-between text-xs text-white/70 font-semibold tracking-wider uppercase">
            <span>3D Spectro-Terrain Visualizer</span>
            <span className="bg-[#B02310] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">Live</span>
          </div>

          {/* Three.js Canvas */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Soil3DCanvas height="100%" />
          </div>

          {/* Bottom Coordinates & Peripherals Bar */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
            <div>Sensor: <strong>TCS34725 (RGB+Clear)</strong></div>
            <div>Temp: <strong>27.5°C (1-Wire)</strong></div>
          </div>
        </div>

      </div>

      {/* 2. Vertex Architectural Nutrient Spec Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#111827]">
              Current Soil Profile
            </h2>
            <p className="text-sm text-muted font-medium">Calibrated chemical indices for {selectedPlot?.label}</p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {summary?.overall_classification || 'Optimal Neutral'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* pH */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-vertex hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="h-1 bg-[#B02310] absolute top-0 left-0 right-0"></div>
            <div className="flex justify-between items-center text-xs font-bold text-muted uppercase tracking-wider mb-2">
              <span>Reaction (pH)</span>
              <span className="text-[#B02310] font-black text-[11px]">Bromothymol</span>
            </div>
            <div className="text-5xl font-black text-[#111827] tracking-tight font-serif">
              {summary?.parameters.pH.value || '6.8'}
            </div>
            <div className="text-sm font-bold text-[#B02310] mt-2">
              Optimal Neutral [6.5 - 7.1]
            </div>
          </div>

          {/* Nitrogen */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-vertex hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="h-1 bg-[#396A94] absolute top-0 left-0 right-0"></div>
            <div className="flex justify-between items-center text-xs font-bold text-muted uppercase tracking-wider mb-2">
              <span>Nitrogen (N)</span>
              <span className="text-[#396A94] font-black text-[11px]">Griess Kit</span>
            </div>
            <div className="text-4xl font-black text-[#111827] tracking-tight font-serif">
              {summary?.parameters['Nitrogen (N)'].value || 'Medium'}
            </div>
            <div className="text-sm font-bold text-[#396A94] mt-2">
              280 - 560 kg/ha eq.
            </div>
          </div>

          {/* Phosphorus */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-vertex hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="h-1 bg-[#047857] absolute top-0 left-0 right-0"></div>
            <div className="flex justify-between items-center text-xs font-bold text-muted uppercase tracking-wider mb-2">
              <span>Phosphorus (P)</span>
              <span className="text-[#047857] font-black text-[11px]">Moly-Blue</span>
            </div>
            <div className="text-4xl font-black text-[#111827] tracking-tight font-serif">
              {summary?.parameters['Phosphorus (P)'].value || 'Medium'}
            </div>
            <div className="text-sm font-bold text-[#047857] mt-2">
              10 - 25 kg/ha P2O5 eq.
            </div>
          </div>

          {/* Potassium */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-vertex hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="h-1 bg-[#D97706] absolute top-0 left-0 right-0"></div>
            <div className="flex justify-between items-center text-xs font-bold text-muted uppercase tracking-wider mb-2">
              <span>Potassium (K)</span>
              <span className="text-[#D97706] font-black text-[11px]">Turbidimetric</span>
            </div>
            <div className="text-4xl font-black text-[#111827] tracking-tight font-serif">
              {summary?.parameters['Potassium (K)'].value || 'High'}
            </div>
            <div className="text-sm font-bold text-[#D97706] mt-2">
              &gt; 280 kg/ha K2O (Rich)
            </div>
          </div>

        </div>
      </div>

      {/* 3. Crop Yield Opportunities & Mandi Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recommended Crops Portfolio */}
        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-3xl p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#111827]">
                Top Agronomic Matches
              </h3>
              <p className="text-sm text-muted">Ranked based on pH 6.8 &amp; Black Soil characteristics</p>
            </div>
            <button
              onClick={() => navigate('/crops')}
              className="text-sm font-bold text-[#B02310] hover:underline flex items-center gap-1"
            >
              <span>View Portfolio</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Soybean (सोयाबीन)', score: '85% Match', season: 'Kharif', profit: '₹28,000 - ₹38,000 /ac' },
              { name: 'Onion (कांदा)', score: '80% Match', season: 'Rabi/Late Kharif', profit: '₹45,000 - ₹85,000 /ac' },
              { name: 'Cotton (कापूस)', score: '78% Match', season: 'Kharif', profit: '₹32,000 - ₹50,000 /ac' }
            ].map((c, i) => (
              <div
                key={i}
                className="bg-[#FBFBFA] border border-[#E5E7EB] rounded-2xl p-5 hover:border-[#111827] transition-all duration-200"
              >
                <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#B02310]/10 text-[#B02310]">
                  {c.score}
                </span>
                <div className="font-serif font-bold text-xl text-[#111827] mt-3">
                  {c.name}
                </div>
                <div className="text-xs text-muted mt-1">Season: {c.season}</div>
                <div className="mt-4 pt-3 border-t border-[#E5E7EB] text-sm font-extrabold text-[#111827]">
                  {c.profit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mandi Rates & Weather Column */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Mandi Price Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-lg text-[#111827]">Pune Mandi Rates</h4>
              <span className="text-xs text-muted">AGMARKNET</span>
            </div>

            <div className="space-y-2.5">
              {mandi.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#FBFBFA] border border-[#E5E7EB]">
                  <div>
                    <div className="font-bold text-sm text-[#111827]">{item.commodity}</div>
                    <div className="text-[11px] text-muted">{item.market}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif font-bold text-base text-[#111827]">₹{item.modal_price}</div>
                    <div className="text-[10px] text-muted">per Quintal</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Widget */}
          <div className="bg-[#354B62] text-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white/70 uppercase tracking-wider">Pune Weather Forecast</div>
              <div className="font-serif text-3xl font-bold text-white mt-1">31°C / 18°C</div>
              <div className="text-xs text-white/80 mt-0.5">Clear Skies • IMD GKMS Advisory Active</div>
            </div>
            <CloudSun className="w-10 h-10 text-white/80" />
          </div>

        </div>

      </div>

    </div>
  );
};
