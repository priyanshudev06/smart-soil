import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Sprout,
  ArrowRight,
  TrendingUp,
  CloudSun,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { SoilSummary, MandiItem, WeatherDay } from '../types';
import { Soil3DCanvas } from '../components/Soil3DCanvas';
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
    <div className="space-y-8 pb-24 pt-6 max-w-7xl mx-auto px-4 sm:px-8">
      
      {/* 1. High-Tech 3D Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-8 sm:p-12 text-white shadow-2xl border border-slate-800 overflow-hidden">
        
        {/* Glowing Ambient Mesh in Background */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* 3D Three.js Visualizer in Top Right */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-70 lg:opacity-100 pointer-events-none">
          <Soil3DCanvas height="100%" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            {deviceConnected ? 'IoT Spectro-Reader Online' : 'Device Ready'}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {language === 'mr'
              ? `नमस्कार, ${farmer?.name || 'शेतकरी मित्र'}!`
              : language === 'hi'
              ? `नमस्ते, ${farmer?.name || 'किसान भाई'}!`
              : `Welcome, ${farmer?.name || 'Farmer'}!`}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium">
            Field: <strong className="text-white">{selectedPlot?.label}</strong> ({selectedPlot?.area} Acres • {selectedPlot?.soil_type})
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/test')}
              className="btn-3d-emerald px-8 py-4 text-base sm:text-lg flex items-center gap-3"
            >
              <FlaskConical className="w-5 h-5" />
              <span>{language === 'mr' ? 'माती चाचणी सुरू करा' : 'Start Rapid Soil Test'}</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>

            <button
              onClick={() => navigate('/report')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-4 rounded-full text-base font-bold transition-all shadow-sm"
            >
              {language === 'mr' ? 'अहवाल पहा' : 'View Soil Card'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. 3D Pop-Up Interactive Nutrient Cards (Boxes with Genuine 3D Depth) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Soil Nutrient Health Indices</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
              3D Interactive Boxes
            </span>
          </h2>
          <span className="text-xs text-slate-500 font-bold hidden sm:inline">
            Hover over cards for 3D tilt &bull; Click for pop-up
          </span>
        </div>

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
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
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
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
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
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
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
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
          </Card3D>

        </div>
      </div>

      {/* 3. Crop Yield & Mandi Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended Crops Box */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-float-lg space-y-4">
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
              { name: 'Soybean (सोयाबीन)', score: '85% Match', profit: '₹28,000 - ₹38,000 /ac', bg: 'hover:border-emerald-500' },
              { name: 'Onion (कांदा)', score: '80% Match', profit: '₹45,000 - ₹85,000 /ac', bg: 'hover:border-cyan-500' },
              { name: 'Cotton (कापूस)', score: '78% Match', profit: '₹32,000 - ₹50,000 /ac', bg: 'hover:border-amber-500' }
            ].map((c, i) => (
              <div
                key={i}
                className={`bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 transition-all hover:-translate-y-1.5 shadow-sm ${c.bg}`}
              >
                <div className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                  {c.score}
                </div>
                <div className="text-lg font-black text-slate-900 mt-2">{c.name}</div>
                <div className="text-sm font-bold text-emerald-800 mt-2">
                  Net: {c.profit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Market Rates Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-float-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-lg text-slate-900">Pune Mandi Rates</h3>
              </div>
              <button onClick={() => navigate('/mandi-weather')} className="text-xs font-bold text-slate-500 hover:text-black">
                Details &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {mandi.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{item.commodity}</div>
                    <div className="text-xs text-slate-500">{item.market}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-base text-slate-900">₹{item.modal_price}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">/ Quintal</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
            <div>
              <div className="text-xs font-bold text-emerald-100 uppercase">Pune Weather</div>
              <div className="text-2xl font-black text-white">31°C / 18°C</div>
              <div className="text-xs text-emerald-100">Clear Sky • Optimal for Field Work</div>
            </div>
            <CloudSun className="w-10 h-10 text-white" />
          </div>
        </div>

      </div>

      {/* Pop-Up Modal for Quick Nutrient Insights */}
      {modalMetric && (
        <PopUpModal
          isOpen={showQuickModal}
          onClose={() => setShowQuickModal(false)}
          title={modalMetric.title}
          subtitle={`Current Reading: ${modalMetric.val}`}
        >
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 leading-relaxed">
            {modalMetric.desc}
          </div>
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setShowQuickModal(false);
                navigate('/report');
              }}
              className="btn-3d-emerald px-6 py-2.5 text-xs flex items-center gap-2"
            >
              <span>Open Full Soil Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </PopUpModal>
      )}

    </div>
  );
};
