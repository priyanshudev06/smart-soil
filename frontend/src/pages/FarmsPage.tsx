import React, { useState } from 'react';
import { Plus, MapPin, Layers, Droplets, Sprout, Check, Shield, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { Card3D } from '../components/Card3D';
import { PopUpModal } from '../components/PopUpModal';

export const FarmsPage: React.FC = () => {
  const { language, farmer, plots, refreshPlots, selectedPlot, setSelectedPlotId } = useApp();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newLabel, setNewLabel] = useState<string>('');
  const [newArea, setNewArea] = useState<number>(2.0);
  const [newSoilType, setNewSoilType] = useState<string>('Medium Deep Black Soil');
  const [newIrrigation, setNewIrrigation] = useState<string>('Borewell / Drip Irrigation');
  const [newCurrentCrop, setNewCurrentCrop] = useState<string>('Soybean');
  const [newPreviousCrop, setNewPreviousCrop] = useState<string>('Wheat');

  const handleCreatePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer || !newLabel.trim()) return;

    await api.addPlot(farmer.farmer_id, {
      label: newLabel,
      area: newArea,
      area_unit: 'Acres',
      soil_type: newSoilType,
      irrigation_source: newIrrigation,
      current_crop: newCurrentCrop,
      previous_crop: newPreviousCrop
    });

    await refreshPlots();
    setShowAddModal(false);
    setNewLabel('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 pt-6 px-4 sm:px-8">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-10 text-white shadow-xl border border-slate-800 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-emerald-400" />
            {farmer?.village}, {farmer?.district} ({farmer?.state})
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {language === 'mr' ? 'माझी शेती व प्लॉट व्यवस्थापन' : 'My Farms & Land Plots'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium">
            Manage boundary acreage, soil classification, and historical test sessions
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-3d-emerald px-6 py-4 text-xs font-black flex items-center gap-2 z-10"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'mr' ? 'नवीन प्लॉट जोडा' : 'Add New Plot'}</span>
        </button>
      </div>

      {/* 2. 3D Plot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plots.map((p) => {
          const isSelected = selectedPlot?.plot_id === p.plot_id;
          return (
            <Card3D
              key={p.plot_id}
              glowColor={isSelected ? 'emerald' : 'slate'}
              className={`p-6 sm:p-8 flex flex-col justify-between ${
                isSelected ? 'ring-2 ring-emerald-500 bg-white' : 'bg-slate-50/50'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {p.soil_type}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <span>{p.label}</span>
                    </h3>
                  </div>

                  {isSelected ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                      Active Field
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedPlotId(p.plot_id)}
                      className="text-xs font-bold text-slate-500 hover:text-emerald-700 underline"
                    >
                      Make Active
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Area Size</span>
                    <span className="text-sm font-black text-slate-900">{p.area} {p.area_unit}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Current Crop</span>
                    <span className="text-sm font-black text-slate-900">{p.current_crop}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Irrigation: <strong className="text-slate-800">{p.irrigation_source}</strong>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  Last Tested: pH 6.8 &bull; Optimal
                </span>
                {!isSelected && (
                  <button
                    onClick={() => setSelectedPlotId(p.plot_id)}
                    className="btn-3d-dark px-4 py-2 text-xs font-bold"
                  >
                    Select Field
                  </button>
                )}
              </div>
            </Card3D>
          );
        })}
      </div>

      {/* PopUp Modal for Add Plot */}
      <PopUpModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Land Plot"
        subtitle="Register new field boundaries to link soil sensor tests"
      >
        <form onSubmit={handleCreatePlot} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Plot Name / Label
            </label>
            <input
              type="text"
              required
              placeholder="e.g., East Field (विहीर शेत)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                Area (Acres)
              </label>
              <input
                type="number"
                step="0.5"
                value={newArea}
                onChange={(e) => setNewArea(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                Soil Type
              </label>
              <select
                value={newSoilType}
                onChange={(e) => setNewSoilType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Medium Deep Black Soil">Medium Deep Black (काळी जमीन)</option>
                <option value="Red Laterite Soil">Red Laterite (तांबडी माती)</option>
                <option value="Sandy Loam">Sandy Loam (वालुकामय)</option>
                <option value="Clayey Loam">Clayey Loam (चिकणमाती)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Irrigation Source
            </label>
            <input
              type="text"
              value={newIrrigation}
              onChange={(e) => setNewIrrigation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                Current Crop
              </label>
              <input
                type="text"
                value={newCurrentCrop}
                onChange={(e) => setNewCurrentCrop(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                Previous Crop
              </label>
              <input
                type="text"
                value={newPreviousCrop}
                onChange={(e) => setNewPreviousCrop(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-3d-emerald px-6 py-2.5 text-xs font-black"
            >
              Save Plot
            </button>
          </div>
        </form>
      </PopUpModal>

    </div>
  );
};
