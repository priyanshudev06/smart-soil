import React, { useState } from 'react';
import { Plus, MapPin, Layers, Droplets, Sprout, Check, Shield } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';

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
    <div className="max-w-6xl mx-auto space-y-6 pb-20 pt-4 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft">
        <div>
          <div className="text-xs uppercase tracking-wider text-emerald-800 font-semibold mb-1">
            {farmer?.village}, {farmer?.district} ({farmer?.state})
          </div>
          <h1 className="text-2xl font-black text-[#1B1B1B]">
            {language === 'mr' ? 'माझी शेती व प्लॉट व्यवस्थापन' : 'My Farms & Plot Management'}
          </h1>
          <p className="text-xs text-muted mt-1">
            Associate sensor readings, historical tests, and crop advisories with specific plot boundaries
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#181818] hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-float"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>{language === 'mr' ? 'नवीन प्लॉट जोडा' : 'Add New Plot'}</span>
        </button>
      </div>

      {/* Plot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plots.map((p) => {
          const isSelected = selectedPlot?.plot_id === p.plot_id;
          return (
            <div
              key={p.plot_id}
              className={`rounded-2xl p-5 border-2 transition-all ${
                isSelected
                  ? 'bg-white border-black shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-[#FFFDF8] border-[#D9D7D0] hover:border-gray-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-base text-[#1B1B1B]">{p.label}</h3>
                  </div>
                  <div className="text-xs text-muted mt-0.5">{p.soil_type}</div>
                </div>

                {isSelected ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Active Plot
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedPlotId(p.plot_id)}
                    className="text-xs text-muted hover:text-black font-semibold"
                  >
                    Set as Active
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-line/60 text-xs">
                <div>
                  <span className="text-muted">Land Area:</span>
                  <div className="font-bold text-[#1B1B1B]">{p.area} {p.area_unit}</div>
                </div>
                <div>
                  <span className="text-muted">Irrigation:</span>
                  <div className="font-bold text-[#1B1B1B]">{p.irrigation_source}</div>
                </div>
                <div>
                  <span className="text-muted">Current Crop:</span>
                  <div className="font-bold text-emerald-700">{p.current_crop}</div>
                </div>
                <div>
                  <span className="text-muted">Previous Crop:</span>
                  <div className="font-bold text-muted">{p.previous_crop}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Adding New Plot */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-float border border-line">
            <h2 className="text-xl font-bold text-[#1B1B1B]">Register New Farm Plot</h2>
            <form onSubmit={handleCreatePlot} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted mb-1">Plot Name / Label</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. East Field (विहिरीचे रान)"
                  className="w-full p-2.5 rounded-xl border border-line font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newArea}
                    onChange={(e) => setNewArea(parseFloat(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-line"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted mb-1">Soil Type</label>
                  <select
                    value={newSoilType}
                    onChange={(e) => setNewSoilType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-line"
                  >
                    <option value="Medium Deep Black Soil">Black Soil (काळी माती)</option>
                    <option value="Reddish Loamy Soil">Red Loam (तांबडी माती)</option>
                    <option value="Alluvial / Sandy Loam">Sandy Loam (वाळूमिश्रित)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Irrigation Source</label>
                <select
                  value={newIrrigation}
                  onChange={(e) => setNewIrrigation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line"
                >
                  <option value="Borewell / Drip Irrigation">Borewell + Drip (ठिबक)</option>
                  <option value="Well / Canal">Open Well / Canal (पाटपाणी)</option>
                  <option value="Rainfed (जिरायती)">Rainfed Only (जिरायती)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted mb-1">Current Crop</label>
                  <input
                    type="text"
                    value={newCurrentCrop}
                    onChange={(e) => setNewCurrentCrop(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-line"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted mb-1">Previous Crop</label>
                  <input
                    type="text"
                    value={newPreviousCrop}
                    onChange={(e) => setNewPreviousCrop(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-line"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-line font-semibold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#181818] text-white font-semibold"
                >
                  Save Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
