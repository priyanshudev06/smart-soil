import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Droplets,
  Calendar,
  Layers,
  Check,
  Info
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { CropRecommendation } from '../types';

export const CropPlannerPage: React.FC = () => {
  const { language, selectedPlot } = useApp();

  const [season, setSeason] = useState<string>('Kharif');
  const [water, setWater] = useState<string>('Medium');
  const [crops, setCrops] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-4 px-4">
      
      {/* Header */}
      <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sprout className="w-3.5 h-3.5" />
            {language === 'mr' ? 'शास्त्रीय पीक नियोजन' : 'Grounded Agronomic Planning'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1B1B] tracking-tight">
            {language === 'mr' ? 'माती सुसंगत पिके व नफा अंदाज' : 'Crop Suitability & Profit Optimization'}
          </h1>
          <p className="text-xs text-muted mt-1">
            Matched for {selectedPlot?.label} • pH 6.8 • Medium Deep Black Soil
          </p>
        </div>

        {/* Season & Water Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white border border-[#D9D7D0] rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted" />
            <span className="text-muted font-medium">Season:</span>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="bg-transparent font-bold text-[#1B1B1B] focus:outline-none cursor-pointer"
            >
              <option value="Kharif">Kharif (पावसाळी)</option>
              <option value="Rabi">Rabi (हिवाळी)</option>
              <option value="Zaid">Summer (उन्हाळी)</option>
            </select>
          </div>

          <div className="bg-white border border-[#D9D7D0] rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-muted font-medium">Water:</span>
            <select
              value={water}
              onChange={(e) => setWater(e.target.value)}
              className="bg-transparent font-bold text-[#1B1B1B] focus:outline-none cursor-pointer"
            >
              <option value="High">High (Drip/Canal)</option>
              <option value="Medium">Medium (Borewell)</option>
              <option value="Low / Rainfed">Low / Rainfed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ranked Crop Suitability Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1B1B1B] flex items-center gap-2">
          <span>Ranked Crops for Selected Season & Soil:</span>
          <span className="text-xs font-normal text-muted">({crops.length} options evaluated)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((c, i) => (
            <div
              key={i}
              className="bg-white border border-[#D9D7D0] rounded-2xl p-5 shadow-soft flex flex-col justify-between hover:border-black transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    c.suitability_score >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : c.suitability_score >= 60
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.suitability_score}% Match
                  </span>
                  <span className="text-xs text-muted">{c.season_duration}</span>
                </div>

                <div className="text-lg font-extrabold text-[#1B1B1B]">
                  {language === 'mr' ? c.crop_name_mr : language === 'hi' ? c.crop_name_hi : c.crop_name}
                </div>
                <div className="text-xs text-emerald-700 font-medium mt-0.5">{c.category}</div>

                <div className="mt-3 space-y-1.5 text-xs text-muted border-t border-line/60 pt-3">
                  <div className="flex justify-between">
                    <span>Avg. Yield:</span>
                    <strong className="text-[#1B1B1B]">{c.estimated_yield_per_acre}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Profit:</span>
                    <strong className="text-emerald-700">{c.estimated_profit_range}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Water Demand:</span>
                    <strong className="text-[#1B1B1B]">{c.water_needs}</strong>
                  </div>
                </div>

                {/* Reasons bullet */}
                <div className="mt-3 bg-[#F0EFEB] rounded-xl p-2.5 text-[11px] text-[#1B1B1B] space-y-1">
                  {c.reasons.map((r, ri) => (
                    <div key={ri} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-[10px] text-muted">
                <span className="truncate max-w-[200px]" title={c.source}>Source: {c.source}</span>
                <button
                  onClick={() => {
                    setCalcCrop(c.crop_name);
                    const avgY = parseFloat(c.estimated_yield_per_acre.split('-')[0]) || 10;
                    setCalcYield(avgY);
                  }}
                  className="font-bold text-[#1B1B1B] hover:underline shrink-0"
                >
                  Calculate ROI &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Profit & Break-even Calculator */}
      <div className="bg-[#FFFDF8] border-2 border-[#D9D7D0] rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-700" />
          <div>
            <h2 className="text-xl font-bold text-[#1B1B1B]">
              {language === 'mr' ? 'खर्च, नफा व ब्रेक-इव्हन कॅल्क्युलेटर' : 'Crop Economics & Break-Even Calculator'}
            </h2>
            <p className="text-xs text-muted">
              Adjust parameters below to estimate financial return and minimum break-even yield
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Inputs Form */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-muted mb-1">Selected Crop</label>
              <select
                value={calcCrop}
                onChange={(e) => setCalcCrop(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-line bg-white font-bold"
              >
                <option value="Soybean">Soybean (सोयाबीन)</option>
                <option value="Onion">Onion (कांदा)</option>
                <option value="Cotton">Cotton (कापूस)</option>
                <option value="Wheat">Wheat (गहू)</option>
                <option value="Chickpea">Chickpea (हरभरा)</option>
                <option value="Tomato">Tomato (टोमॅटो)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-muted mb-1">Land Area (Acres)</label>
              <input
                type="number"
                step="0.5"
                value={calcArea}
                onChange={(e) => setCalcArea(parseFloat(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border border-line bg-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted mb-1">Expected Yield (Quintals / Acre)</label>
              <input
                type="number"
                value={calcYield}
                onChange={(e) => setCalcYield(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-line bg-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted mb-1">Mandi Modal Price (₹ / Quintal)</label>
              <input
                type="number"
                value={calcPrice}
                onChange={(e) => setCalcPrice(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-line bg-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted mb-1">Seed Cost (₹ / Acre)</label>
              <input
                type="number"
                value={calcSeed}
                onChange={(e) => setCalcSeed(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-line bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted mb-1">Fertilizer & Manure (₹ / Acre)</label>
              <input
                type="number"
                value={calcFertilizer}
                onChange={(e) => setCalcFertilizer(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-line bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted mb-1">Labor & Machinery (₹ / Acre)</label>
              <input
                type="number"
                value={calcLabor}
                onChange={(e) => setCalcLabor(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-line bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted mb-1">Irrigation & Protection (₹ / Acre)</label>
              <input
                type="number"
                value={calcIrrigation}
                onChange={(e) => setCalcIrrigation(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-line bg-white"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="bg-[#181818] text-white rounded-2xl p-6 flex flex-col justify-between shadow-float">
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                Estimated Net Profit
              </div>
              <div className="text-4xl font-black text-emerald-400">
                ₹{calcResult?.net_profit ? calcResult.net_profit.toLocaleString('en-IN') : '0'}
              </div>
              <div className="text-xs text-white/70 mt-1">
                ROI: <strong className="text-white">{calcResult?.return_on_investment_pct || 0}%</strong>
              </div>

              <div className="mt-6 space-y-2.5 text-xs text-white/80 border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <span>Gross Output:</span>
                  <strong className="text-white">{calcResult?.total_yield_quintal || 0} Quintals</strong>
                </div>
                <div className="flex justify-between">
                  <span>Gross Revenue:</span>
                  <strong className="text-white">₹{calcResult?.gross_revenue ? calcResult.gross_revenue.toLocaleString('en-IN') : '0'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Input Costs:</span>
                  <strong className="text-white">₹{calcResult?.total_input_cost ? calcResult.total_input_cost.toLocaleString('en-IN') : '0'}</strong>
                </div>
                <div className="flex justify-between text-amber-300 font-semibold pt-1 border-t border-white/10">
                  <span>Break-Even Yield:</span>
                  <span>{calcResult?.break_even_yield_per_acre || 0} Q/Acre</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[10px] text-white/50 leading-relaxed">
              * Break-even indicates the minimum yield needed per acre to cover all input costs at current mandi prices.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
