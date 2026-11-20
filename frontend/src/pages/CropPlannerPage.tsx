import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Calculator,
  TrendingUp,
  Droplets,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { CropRecommendation } from '../types';
import { Card3D } from '../components/Card3D';
import { PopUpModal } from '../components/PopUpModal';

export const CropPlannerPage: React.FC = () => {
  const { language, selectedPlot } = useApp();

  const [season, setSeason] = useState<string>('Kharif');
  const [water, setWater] = useState<string>('Medium');
  const [crops, setCrops] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected Crop Modal
  const [activeModalCrop, setActiveModalCrop] = useState<CropRecommendation | null>(null);

  // Profit Calculator State
  const [calcCrop, setCalcCrop] = useState<string>('Soybean');
  const [calcArea, setCalcArea] = useState<number>(selectedPlot?.area || 2.5);
  const [calcYield, setCalcYield] = useState<number>(10);
  const [calcPrice, setCalcPrice] = useState<number>(4820);
  const [calcSeed, setCalcSeed] = useState<number>(3200);
  const [calcFertilizer, setCalcFertilizer] = useState<number>(4500);
  const [calcLabor, setCalcLabor] = useState<number>(7500);
  const [calcIrrigation, setCalcIrrigation] = useState<number>(2000);

  const [calcResult, setCalcResult] = useState<any>(null);

  useEffect(() => {
    if (selectedPlot) {
      setLoading(true);
      api.getCropRecommendations(selectedPlot.plot_id, season, water).then(res => {
        setCrops(res);
        setLoading(false);
      });
    }
  }, [selectedPlot, season, water]);

  useEffect(() => {
    api.calculateProfit({
      crop_name: calcCrop,
      land_area_acres: calcArea,
      expected_yield_quintal_per_acre: calcYield,
      mandi_modal_price_per_quintal: calcPrice,
      seed_cost_per_acre: calcSeed,
      fertilizer_manure_cost_per_acre: calcFertilizer,
      labor_machinery_cost_per_acre: calcLabor,
      irrigation_other_cost_per_acre: calcIrrigation
    }).then(res => setCalcResult(res));
  }, [calcCrop, calcArea, calcYield, calcPrice, calcSeed, calcFertilizer, calcLabor, calcIrrigation]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 pt-6 px-4 sm:px-8">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-10 text-white shadow-xl border border-slate-800 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {language === 'mr' ? 'पीक निवड व नफा अंदाज' : 'Crop Suitability & Profit'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium">
            Tailored for <strong className="text-white">{selectedPlot?.label}</strong> • pH 6.8 Neutral • Black Soil
          </p>
        </div>

        {/* Season & Water Filters in Glass Pod */}
        <div className="z-10 flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 flex items-center gap-2 text-xs font-bold text-white">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Season:</span>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="bg-slate-900 text-white rounded-lg px-2 py-1 font-bold text-xs focus:outline-none border border-slate-700 cursor-pointer"
            >
              <option value="Kharif">Kharif (पावसाळी)</option>
              <option value="Rabi">Rabi (हिवाळी)</option>
              <option value="Zaid">Summer (उन्हाळी)</option>
            </select>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/10 flex items-center gap-2 text-xs font-bold text-white">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span>Water:</span>
            <select
              value={water}
              onChange={(e) => setWater(e.target.value)}
              className="bg-slate-900 text-white rounded-lg px-2 py-1 font-bold text-xs focus:outline-none border border-slate-700 cursor-pointer"
            >
              <option value="Low">Low (कमी पाणी)</option>
              <option value="Medium">Medium (मध्यम)</option>
              <option value="High">High (मुबलक)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Crop Suitability Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Recommended Crops
        </h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold">Analysing soil compatibility...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {crops.map((crop, idx) => {
              const glow = idx === 0 ? 'emerald' : idx === 1 ? 'blue' : 'purple';
              const displayName = language === 'mr' ? crop.crop_name_mr : language === 'hi' ? crop.crop_name_hi : crop.crop_name;
              return (
                <Card3D
                  key={crop.crop_name}
                  glowColor={glow}
                  onClick={() => setActiveModalCrop(crop)}
                  className="p-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                          {crop.season_duration}
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">
                          {displayName}
                        </h3>
                      </div>
                      <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 text-emerald-700 font-black text-xs border border-emerald-500/20">
                        {crop.suitability_score}% Match
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Expected Yield:</span>
                        <strong className="text-slate-900">{crop.estimated_yield_per_acre}</strong>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Water Need:</span>
                        <strong className="text-slate-900">{crop.water_needs}</strong>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      {crop.soil_compatibility}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Tap for Agronomy Guide
                    </span>
                    <button className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </Card3D>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Interactive Profit & Margin Calculator */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Calculator className="w-7 h-7 text-emerald-600" />
          <span>Interactive Net Farm Profit Calculator</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inputs Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_10px_25px_-5px_rgba(15,23,42,0.08)] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Crop
                </label>
                <select
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Onion">Onion (कांदा)</option>
                  <option value="Chickpea">Chickpea (हरभरा)</option>
                  <option value="Cotton">Cotton (कापूस)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
                  Plot Area (Acres)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={calcArea}
                  onChange={(e) => setCalcArea(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
                  Yield (Quintal / Acre)
                </label>
                <input
                  type="number"
                  value={calcYield}
                  onChange={(e) => setCalcYield(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
                  Mandi Price (₹ / Quintal)
                </label>
                <input
                  type="number"
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">
                Cost Breakdown (₹ / Acre)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Seed:</span>
                  <input
                    type="number"
                    value={calcSeed}
                    onChange={(e) => setCalcSeed(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Fertilizer:</span>
                  <input
                    type="number"
                    value={calcFertilizer}
                    onChange={(e) => setCalcFertilizer(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Labor:</span>
                  <input
                    type="number"
                    value={calcLabor}
                    onChange={(e) => setCalcLabor(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Irrigation:</span>
                  <input
                    type="number"
                    value={calcIrrigation}
                    onChange={(e) => setCalcIrrigation(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3D Profit Projection Display */}
          <div className="lg:col-span-5">
            <Card3D glowColor="emerald" className="p-8 bg-gradient-to-br from-slate-900 to-slate-950 text-white border-slate-800">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                    Projected Financial Output
                  </span>
                  <h3 className="text-xl font-bold text-slate-200 mt-1">
                    {calcCrop} for {calcArea} Acres
                  </h3>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-sm text-slate-300">
                    <span>Total Gross Revenue:</span>
                    <strong className="text-white text-base">₹{calcResult?.total_revenue?.toLocaleString() || '1,20,500'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-300">
                    <span>Total Cultivation Cost:</span>
                    <strong className="text-red-400 text-base">-₹{calcResult?.total_cost?.toLocaleString() || '43,000'}</strong>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
                    <span>Break-Even Price:</span>
                    <strong className="text-emerald-300">₹{calcResult?.break_even_price_per_quintal || '1,720'} / Qtl</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                    Estimated Net Profit
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight mt-1">
                    ₹{calcResult?.net_profit?.toLocaleString() || '77,500'}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-1">
                    ROI: +{calcResult?.roi_percentage || '180'}% on invested capital
                  </div>
                </div>

                <button
                  onClick={() => alert(`Saved profit plan for ${calcCrop} to your farm record.`)}
                  className="btn-3d-emerald w-full py-4 text-sm font-black flex items-center justify-center gap-2 mt-4"
                >
                  <DollarSign className="w-4 h-4" />
                  Save Agronomic Plan
                </button>
              </div>
            </Card3D>
          </div>

        </div>
      </div>

      {/* PopUp Modal for Crop Detail */}
      <PopUpModal
        isOpen={!!activeModalCrop}
        onClose={() => setActiveModalCrop(null)}
        title={activeModalCrop?.crop_name || 'Crop Guide'}
        subtitle={`Scientific Package of Practices • ${activeModalCrop?.season_duration}`}
      >
        {activeModalCrop && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block mb-1">
                Soil Compatibility Match
              </span>
              <p className="text-sm font-bold text-slate-800">
                {activeModalCrop.soil_compatibility}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Expected Yield</span>
                <span className="text-sm font-black text-slate-900">{activeModalCrop.estimated_yield_per_acre}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Water Need</span>
                <span className="text-sm font-black text-slate-900">{activeModalCrop.water_needs}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setCalcCrop(activeModalCrop.crop_name);
                  setActiveModalCrop(null);
                }}
                className="btn-3d-dark w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>Load in Profit Calculator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </PopUpModal>

    </div>
  );
};
