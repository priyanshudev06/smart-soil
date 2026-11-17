import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Sprout,
  ArrowRight,
  TrendingUp,
  CloudSun,
  ShieldCheck,
  Sparkles,
  Zap
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
    <div className="space-y-8 pb-24 pt-6 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* 1. Hero Card with Interactive 3D Canvas */}
      <div className="bg-[#FFFDF8] border-2 border-[#D9D7D0] rounded-3xl p-6 sm:p-10 shadow-float relative overflow-hidden">
        
        {/* Background 3D Soil Canvas (Three.js) */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-70 lg:opacity-100 pointer-events-none">
          <Soil3DCanvas height="100%" />
        </div>

        {/* Content on top */}
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-800 text-sm font-bold tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            {deviceConnected ? 'IoT Reader Connected' : 'Ready for Soil Testing'}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1B1B1B] tracking-tight leading-tight">
            {language === 'mr'
              ? `नमस्कार, ${farmer?.name || 'शेतकरी मित्र'}!`
              : language === 'hi'
              ? `नमस्ते, ${farmer?.name || 'किसान भाई'}!`
              : `Hello, ${farmer?.name || 'Farmer'}!`}
          </h1>

          <p className="text-base sm:text-lg text-[#333] font-medium">
            Active Plot: <strong className="text-black">{selectedPlot?.label}</strong> ({selectedPlot?.area} Acres • {selectedPlot?.soil_type})
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/test')}
              className="bg-[#181818] hover:bg-black text-white px-8 py-4 rounded-full text-base sm:text-lg font-bold flex items-center gap-3 shadow-float hover:scale-105 transition-all duration-300"
            >
              <FlaskConical className="w-5 h-5 text-emerald-400" />
              <span>{language === 'mr' ? 'माती चाचणी सुरू करा' : language === 'hi' ? 'मृदा जांच शुरू करें' : 'Start Soil Test'}</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>

            <button
              onClick={() => navigate('/report')}
              className="bg-white hover:bg-gray-100 text-[#1B1B1B] border-2 border-[#D9D7D0] px-6 py-4 rounded-full text-base font-bold shadow-sm transition-all"
            >
              {language === 'mr' ? 'अहवाल पहा' : language === 'hi' ? 'रिपोर्ट देखें' : 'View Soil Card'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Soil Nutrients Grid (High Contrast, Bold Numbers, Minimal Clutter) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#1B1B1B] tracking-tight">
            {language === 'mr' ? 'माती आरोग्य निर्देशांक' : language === 'hi' ? 'मृदा स्वास्थ्य स्तर' : 'Soil Nutrient Levels'}
          </h2>
          <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {summary?.overall_classification || 'Optimal Fertility'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* pH */}
          <div className="bg-white border-2 border-[#D9D7D0] rounded-3xl p-6 shadow-soft hover:border-black transition-all">
            <div className="flex justify-between items-center text-sm font-bold text-muted mb-3">
              <span>Soil pH (सामू)</span>
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-black">
                Optimal
              </span>
            </div>
            <div className="text-5xl font-black text-[#1B1B1B] tracking-tight">
              {summary?.parameters.pH.value || '6.8'}
            </div>
            <div className="text-sm font-bold text-emerald-700 mt-2">
              Neutral • No Lime Needed
            </div>
          </div>

          {/* Nitrogen */}
          <div className="bg-white border-2 border-[#D9D7D0] rounded-3xl p-6 shadow-soft hover:border-black transition-all">
            <div className="flex justify-between items-center text-sm font-bold text-muted mb-3">
              <span>Nitrogen (नत्र - N)</span>
              <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-black">
                Adequate
              </span>
            </div>
            <div className="text-4xl font-black text-blue-900 tracking-tight">
              {summary?.parameters['Nitrogen (N)'].value || 'Medium'}
            </div>
            <div className="text-sm font-bold text-blue-700 mt-2">
              280 - 560 kg/ha eq.
            </div>
          </div>

          {/* Phosphorus */}
          <div className="bg-white border-2 border-[#D9D7D0] rounded-3xl p-6 shadow-soft hover:border-black transition-all">
            <div className="flex justify-between items-center text-sm font-bold text-muted mb-3">
              <span>Phosphorus (स्फुरद - P)</span>
              <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-xs font-black">
                Moderate
              </span>
            </div>
            <div className="text-4xl font-black text-purple-900 tracking-tight">
              {summary?.parameters['Phosphorus (P)'].value || 'Medium'}
            </div>
            <div className="text-sm font-bold text-purple-700 mt-2">
              10 - 25 kg/ha P2O5 eq.
            </div>
          </div>

          {/* Potassium */}
          <div className="bg-white border-2 border-[#D9D7D0] rounded-3xl p-6 shadow-soft hover:border-black transition-all">
            <div className="flex justify-between items-center text-sm font-bold text-muted mb-3">
              <span>Potassium (पालाश - K)</span>
              <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-black">
                Abundant
              </span>
            </div>
            <div className="text-4xl font-black text-amber-900 tracking-tight">
              {summary?.parameters['Potassium (K)'].value || 'High'}
            </div>
            <div className="text-sm font-bold text-amber-700 mt-2">
              &gt; 280 kg/ha K2O eq.
            </div>
          </div>

        </div>
      </div>

      {/* 3. Recommended Crops & Mandi Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Crops */}
        <div className="lg:col-span-2 bg-[#F0EFEB] border-2 border-[#D9D7D0] rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-700" />
              <h2 className="text-xl font-bold text-[#1B1B1B]">
                {language === 'mr' ? 'सर्वाधिक योग्य पिके' : language === 'hi' ? 'सर्वोत्तम उपयुक्त फसलें' : 'Best Recommended Crops'}
              </h2>
            </div>
            <button
              onClick={() => navigate('/crops')}
              className="text-sm font-bold text-[#1B1B1B] hover:underline flex items-center gap-1"
            >
              <span>Explore All &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: language === 'mr' ? 'सोयाबीन' : 'Soybean', match: '85%', profit: '₹28,000 - ₹38,000 /ac' },
              { name: language === 'mr' ? 'कांदा' : 'Onion', match: '80%', profit: '₹45,000 - ₹85,000 /ac' },
              { name: language === 'mr' ? 'कापूस' : 'Cotton', match: '78%', profit: '₹32,000 - ₹50,000 /ac' }
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border-2 border-[#D9D7D0] shadow-sm hover:border-black transition-all">
                <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                  {c.match} Match
                </div>
                <div className="text-xl font-black text-[#1B1B1B] mt-2">{c.name}</div>
                <div className="text-sm font-bold text-emerald-800 mt-2">
                  Net: {c.profit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mandi Rates */}
        <div className="bg-[#FFFDF8] border-2 border-[#D9D7D0] rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-amber-600" />
                <h3 className="font-bold text-lg text-[#1B1B1B]">Pune Mandi Rates</h3>
              </div>
              <button onClick={() => navigate('/mandi-weather')} className="text-xs font-bold text-muted hover:text-black">
                More &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {mandi.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-line">
                  <div>
                    <div className="font-bold text-sm text-[#1B1B1B]">{item.commodity}</div>
                    <div className="text-xs text-muted">{item.market}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-base text-emerald-800">₹{item.modal_price}</div>
                    <div className="text-[11px] text-muted">/ Quintal</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CloudSun className="w-6 h-6 text-emerald-700" />
              <div>
                <div className="text-sm font-bold text-emerald-950">Pune: 31°C / 18°C</div>
                <div className="text-xs text-emerald-800 font-medium">Clear Skies • Ideal for field work</div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
