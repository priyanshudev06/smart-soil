import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Sprout,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  CloudSun,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  Layers,
  Globe
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { SoilSummary, MandiItem, WeatherDay } from '../types';
import { Card3D } from '../components/Card3D';
import { PopUpModal } from '../components/PopUpModal';

export const DashboardPage: React.FC = () => {
  const { language, farmer, selectedPlot, deviceConnected } = useApp();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<SoilSummary | null>(null);
  const [mandi, setMandi] = useState<MandiItem[]>([]);
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [showQuickModal, setShowQuickModal] = useState<boolean>(false);
  const [modalMetric, setModalMetric] = useState<{ title: string; val: string; desc: string } | null>(null);

  useEffect(() => {
    if (selectedPlot) {
      Promise.all([
        api.getSoilSummary(selectedPlot.plot_id),
        api.getMandiPrices(farmer?.district || 'Pune'),
        api.getWeather(farmer?.district || 'Pune')
      ]).then(([s, m, w]) => {
        setSummary(s);
        setMandi(m.slice(0, 3));
        setWeather(w.slice(0, 2));
      });
    }
  }, [selectedPlot, farmer]);

  const openMetricPopUp = (title: string, val: string, desc: string) => {
    setModalMetric({ title, val, desc });
    setShowQuickModal(true);
  };

  return (
    <div className="space-y-10 pb-24 pt-4 max-w-7xl mx-auto px-4 sm:px-8">
      
      {/* 1. Top Announcement Bar (Matching Reference Design) */}
      <div className="bg-[#D1FAE5] text-emerald-950 text-xs sm:text-sm font-bold py-2.5 px-6 rounded-full text-center shadow-sm flex items-center justify-center gap-2 border border-emerald-200">
        <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>KVK Certified Agricultural Season 2026 &bull; Real-time IoT Soil Spectrometry Online &bull; 4-in-1 NPK & pH Diagnostics</span>
      </div>

      {/* 2. Hero Section (Exact Match to Reference Layout with Rich Farming Background) */}
      <div className="relative rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden min-h-[580px] sm:min-h-[640px] flex flex-col justify-between p-6 sm:p-12 text-white shadow-2xl border border-slate-200/40">
        
        {/* Background Image: High-Resolution Precision Agriculture Photography from Unsplash */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000&q=85')`
          }}
        />

        {/* Cinematic Vignette Overlay for Crisp Contrast and Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/25 pointer-events-none" />

        {/* Bottom Hero Layout: Left Typography + Right Floating Card */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-12">
          
          {/* Left Column: Big Bold Typography & Pill CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.04]">
              {language === 'mr'
                ? 'माती आरोग्य सुधारा, आधुनिक तंत्रज्ञानाने'
                : language === 'hi'
                ? 'मृदा स्वास्थ्य सुधारें, आधुनिक तकनीक से'
                : 'Prevent crop failure the smart way'}
            </h1>

            <p className="text-base sm:text-xl text-slate-200 font-medium max-w-xl leading-relaxed">
              {language === 'mr'
                ? 'अचूक ऑप्टिकल सेन्सर आणि कृषी मार्गदर्शनासह, स्मार्ट सॉईल मंद प्रयोगशाळा चाचण्या आणि अंदाजे खत व्यवस्थापन इतिहासजमा करते.'
                : 'With intelligent optical sensing and real-time agronomic guidance, Smart Soil makes slow laboratory tests and blind fertilizer dosing obsolete.'}
            </p>

            {/* Pill CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/test')}
                className="bg-white hover:bg-slate-100 text-slate-950 font-black px-8 py-4 rounded-full text-base sm:text-lg transition-all flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95"
              >
                <FlaskConical className="w-5 h-5 text-emerald-600" />
                <span>{language === 'mr' ? 'माती चाचणी सुरू करा' : 'Start Rapid Soil Test'}</span>
              </button>

              <button
                onClick={() => navigate('/test')}
                className="w-14 h-14 rounded-full bg-white hover:bg-slate-100 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
                title="Start Instant Scan"
              >
                <ArrowUpRight className="w-6 h-6" />
              </button>

              <button
                onClick={() => navigate('/report')}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-6 py-4 rounded-full text-sm sm:text-base font-bold transition-all shadow-sm"
              >
                {language === 'mr' ? 'अहवाल पहा' : 'View Soil Card'}
              </button>
            </div>
          </div>

          {/* Right Column: 3 Floating White Cards (Matching Reference Layout) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Floating Card 1: Main Feature Promo */}
            <div className="rounded-3xl bg-white/95 backdrop-blur-md p-5 text-slate-900 shadow-2xl border border-white/80 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Rapid IoT Soil Spectrometry
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-snug">
                  TCS34725 optical sensor with 60s reaction kinetic analysis.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/test')}
                    className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-full inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Test Sample</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=260&q=80"
                alt="Soil Test"
                className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-md border border-slate-100"
              />
            </div>

            {/* Field Status & Diagnostics Card */}
            <div className="rounded-3xl bg-white/95 backdrop-blur-md p-5 text-slate-900 shadow-2xl border border-white/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900">24/7 Field Ready</div>
                  <div className="text-xs text-slate-500 font-semibold">Offline-First Sync &bull; KVK Validated</div>
                </div>
              </div>
              <button
                onClick={() => navigate('/report')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold px-4 py-2 rounded-full transition-colors"
              >
                Inspect
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 3. Institutional Partners / "As seen in" Banner (Matching Reference Image) */}
      <div className="py-4 text-center space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
          Institutional agronomy & telemetry partners
        </span>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-80 transition-all duration-300">
          <span className="font-extrabold text-xs sm:text-sm text-slate-600 tracking-wider">🏛️ ICAR-IISS Bhopal</span>
          <span className="font-extrabold text-xs sm:text-sm text-slate-600 tracking-wider">🌾 MPKV Rahuri</span>
          <span className="font-extrabold text-xs sm:text-sm text-slate-600 tracking-wider">📊 AGMARKNET</span>
          <span className="font-extrabold text-xs sm:text-sm text-slate-600 tracking-wider">🌤️ IMD Mausam</span>
          <span className="font-extrabold text-xs sm:text-sm text-slate-600 tracking-wider">📜 Soil Health Card</span>
          <span className="font-extrabold text-xs sm:text-sm text-slate-600 tracking-wider">⚡ Digital India Agri</span>
        </div>
      </div>

      {/* 4. Soil Nutrient Health Indices */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Soil Nutrient Health Indices
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* 3D Box: pH */}
          <Card3D
            glowColor="emerald"
            onClick={() => openMetricPopUp('Soil pH Reaction', summary?.parameters.pH.value || '6.8', 'Optimal neutral range [6.5 - 7.1]. Soil has balanced nutrient availability. No agricultural lime or gypsum required.')}
            className="p-6"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Soil pH (सामू)</span>
              <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-black">
                Optimal
              </span>
            </div>
            <div className="text-5xl font-black text-emerald-600 tracking-tight">
              {summary?.parameters.pH.value || '6.8'}
            </div>
            <div className="text-sm font-bold text-slate-700 mt-2">
              Neutral • [6.5 - 7.1]
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
              <span>View Advice &rarr;</span>
            </div>
          </Card3D>

          {/* 3D Box: Nitrogen */}
          <Card3D
            glowColor="blue"
            onClick={() => openMetricPopUp('Available Nitrogen (N)', summary?.parameters['Nitrogen (N)'].value || 'Medium', 'Equivalent to 280-560 kg/ha. Sufficient for standard vegetative growth. Split urea application recommended.')}
            className="p-6"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Nitrogen (नत्र - N)</span>
              <span className="bg-cyan-500/10 text-cyan-700 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-xs font-black">
                Adequate
              </span>
            </div>
            <div className="text-4xl font-black text-cyan-600 tracking-tight">
              {summary?.parameters['Nitrogen (N)'].value || 'Medium'}
            </div>
            <div className="text-sm font-bold text-slate-700 mt-2">
              280 - 560 kg/ha eq.
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-cyan-600 font-bold">
              <span>View Advice &rarr;</span>
            </div>
          </Card3D>

          {/* 3D Box: Phosphorus */}
          <Card3D
            glowColor="purple"
            onClick={() => openMetricPopUp('Available Phosphorus (P)', summary?.parameters['Phosphorus (P)'].value || 'Medium', 'Equivalent to 10-25 kg/ha P2O5. Promotes early root development. Apply DAP or SSP near root zone.')}
            className="p-6"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Phosphorus (स्फुरद - P)</span>
              <span className="bg-purple-500/10 text-purple-700 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-xs font-black">
                Moderate
              </span>
            </div>
            <div className="text-4xl font-black text-purple-600 tracking-tight">
              {summary?.parameters['Phosphorus (P)'].value || 'Medium'}
            </div>
            <div className="text-sm font-bold text-slate-700 mt-2">
              10 - 25 kg/ha P2O5
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-bold">
              <span>View Advice &rarr;</span>
            </div>
          </Card3D>

          {/* 3D Box: Potassium */}
          <Card3D
            glowColor="amber"
            onClick={() => openMetricPopUp('Available Potassium (K)', summary?.parameters['Potassium (K)'].value || 'High', 'Greater than 280 kg/ha K2O. Soil naturally rich in potassium reserves. Basal potash fertilizer can be saved.')}
            className="p-6"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Potassium (पालाश - K)</span>
              <span className="bg-amber-500/10 text-amber-700 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-black">
                Rich
              </span>
            </div>
            <div className="text-4xl font-black text-amber-600 tracking-tight">
              {summary?.parameters['Potassium (K)'].value || 'High'}
            </div>
            <div className="text-sm font-bold text-slate-700 mt-2">
              &gt; 280 kg/ha K2O
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
              <span>View Advice &rarr;</span>
            </div>
          </Card3D>

        </div>
      </div>

      {/* 5. Crop Yield & Mandi Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended Crops Box */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900">
                Top Suited Crops for this Soil
              </h2>
            </div>
            <button
              onClick={() => navigate('/crops')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Explore All &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Soybean (सोयाबीन)', score: 95, yield: '10–12 Qtl/Acre', glow: 'emerald' },
              { name: 'Onion (कांदा)', score: 90, yield: '120–150 Qtl/Acre', glow: 'blue' },
              { name: 'Gram (हरभरा)', score: 88, yield: '8–10 Qtl/Acre', glow: 'purple' },
            ].map((c) => (
              <Card3D key={c.name} glowColor={c.glow as any} className="p-5" onClick={() => navigate('/crops')}>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">Ranked #1 Match</div>
                <div className="text-lg font-black text-slate-900 mt-1">{c.name}</div>
                <div className="text-xs text-emerald-700 font-bold mt-1">{c.score}% Soil Match</div>
                <div className="text-xs text-slate-500 font-medium mt-3 pt-2 border-t border-slate-100">
                  Est. Yield: {c.yield}
                </div>
              </Card3D>
            ))}
          </div>
        </div>

        {/* Live Mandi Rates Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-lg text-slate-900">
                  Live Mandi Rates
                </h3>
              </div>
              <button
                onClick={() => navigate('/mandi-weather')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                View More &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {mandi.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate('/mandi-weather')}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">
                      {language === 'mr' ? item.commodity_mr : language === 'hi' ? item.commodity_hi : item.commodity}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold">{item.market}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">
                      ₹{item.modal_price.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{item.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Source: AGMARKNET</span>
            <span className="text-emerald-700 font-bold">Daily Updated</span>
          </div>
        </div>

      </div>

      {/* PopUp Modal for Nutrient Detail */}
      <PopUpModal
        isOpen={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        title={modalMetric?.title || 'Nutrient Detail'}
        subtitle="Scientific Calibration & Guidance"
      >
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-widest block mb-1">
              Recorded Test Reading
            </span>
            <div className="text-4xl font-black text-emerald-700">
              {modalMetric?.val}
            </div>
          </div>

          <div className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {modalMetric?.desc}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setShowQuickModal(false);
                navigate('/report');
              }}
              className="btn-3d-emerald w-full py-4 text-sm font-black flex items-center justify-center gap-2"
            >
              <span>View Full Soil Health Card</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </PopUpModal>

    </div>
  );
};
