import React, { useState } from 'react';
import {
  Printer,
  Volume2,
  VolumeX,
  FlaskConical,
  Sprout,
  CheckCircle,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const SoilReportPage: React.FC = () => {
  const { language, farmer, selectedPlot, lastResult } = useApp();
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [labRequested, setLabRequested] = useState<boolean>(false);

  const handleToggleAudio = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const ph = lastResult?.value_or_class || '6.8';
        let text = '';
        if (language === 'mr') {
          text = `शेतकरी ${farmer?.name || 'मित्र'} यांचा माती अहवाल. तुमच्या शेताचा सामू ${ph} आहे, जो पिकांसाठी अत्यंत योग्य आहे. नत्र मध्यम, स्फुरद मध्यम आणि पालाश भरपूर आहे. सोयाबीन, कांदा आणि हरभरा ही पिके या मातीसाठी सर्वाधिक फायदेशीर ठरतील.`;
        } else if (language === 'hi') {
          text = `किसान ${farmer?.name || 'भाई'} का मृदा रिपोर्ट। आपके खेत का pH मान ${ph} है। नाइट्रोजन मध्यम, फास्फोरस मध्यम और पोटाश उच्च है। सोयाबीन और प्याज सर्वोत्तम हैं।`;
        } else {
          text = `Soil Report for ${farmer?.name || 'Farmer'}. Plot soil pH is ${ph}, in the optimal neutral range. Nitrogen is Medium, Phosphorus is Medium, and Potassium is High.`;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 pt-6 px-4 sm:px-8 print:p-0">
      
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm print:hidden">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#B02310] font-black uppercase">
            CERTIFICATE NO. #TS-2026-NOV-8941
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#111827]">
            Soil Health Certificate
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Plot: {selectedPlot?.label} • {farmer?.village}, {farmer?.district}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAudio}
            className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
              isPlayingAudio
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-[#B02310] hover:bg-[#8F1A0A] text-white hover:scale-105'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingAudio ? 'Stop Voice' : 'Listen Voice (आवाज)'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#111827] hover:bg-black text-white flex items-center gap-2 shadow-sm hover:scale-105 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Certificate Card (Vertex Luxury Specification Style) */}
      <div className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-2">
        
        {/* Certificate Header */}
        <div className="border-b border-[#E5E7EB] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#B02310]"></span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
                VERTEX PRECISION SOIL CARD
              </h2>
            </div>
            <div className="text-xs text-[#6B7280] font-medium mt-1">
              Microcontroller: ESP32 • Optical Engine: TCS34725 • Calibration: ph-kit-agri-cal-1.0
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 text-[#4B5563]">
            <div><strong>Farmer:</strong> {farmer?.name}</div>
            <div><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div><strong>Acreage:</strong> {selectedPlot?.area} {selectedPlot?.area_unit} ({selectedPlot?.soil_type})</div>
          </div>
        </div>

        {/* 4 Nutrient Cards Specification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* pH */}
          <div className="bg-[#FBFBFA] border border-[#E5E7EB] rounded-2xl p-6 relative overflow-hidden">
            <div className="h-1 bg-[#B02310] absolute top-0 left-0 right-0"></div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Reaction (Soil pH)</div>
            <div className="text-5xl font-black text-[#111827] font-serif mt-2">
              {lastResult?.parameter === 'pH' ? lastResult.value_or_class : '6.8'}
            </div>
            <div className="text-xs font-bold text-[#B02310] mt-2">
              Optimal Neutral • Interval: [6.5 - 7.1]
            </div>
          </div>

          {/* Nitrogen */}
          <div className="bg-[#FBFBFA] border border-[#E5E7EB] rounded-2xl p-6 relative overflow-hidden">
            <div className="h-1 bg-[#396A94] absolute top-0 left-0 right-0"></div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Nitrogen (नत्र - N)</div>
            <div className="text-4xl font-black text-[#111827] font-serif mt-2">
              {lastResult?.parameter.includes('Nitrogen') ? lastResult.value_or_class : 'Medium'}
            </div>
            <div className="text-xs font-bold text-[#396A94] mt-2">
              280 - 560 kg/ha equivalent (Adequate)
            </div>
          </div>

          {/* Phosphorus */}
          <div className="bg-[#FBFBFA] border border-[#E5E7EB] rounded-2xl p-6 relative overflow-hidden">
            <div className="h-1 bg-[#047857] absolute top-0 left-0 right-0"></div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Phosphorus (स्फुरद - P)</div>
            <div className="text-4xl font-black text-[#111827] font-serif mt-2">
              {lastResult?.parameter.includes('Phosphorus') ? lastResult.value_or_class : 'Medium'}
            </div>
            <div className="text-xs font-bold text-[#047857] mt-2">
              10 - 25 kg/ha P2O5 equivalent (Moderate)
            </div>
          </div>

          {/* Potassium */}
          <div className="bg-[#FBFBFA] border border-[#E5E7EB] rounded-2xl p-6 relative overflow-hidden">
            <div className="h-1 bg-[#D97706] absolute top-0 left-0 right-0"></div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Potassium (पालाश - K)</div>
            <div className="text-4xl font-black text-[#111827] font-serif mt-2">
              {lastResult?.parameter.includes('Potassium') ? lastResult.value_or_class : 'High'}
            </div>
            <div className="text-xs font-bold text-[#D97706] mt-2">
              &gt; 280 kg/ha K2O (Abundant reserve)
            </div>
          </div>

        </div>

        {/* Actionable Field Management Advice */}
        <div className="bg-[#FBFBFA] border border-[#E5E7EB] rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 font-serif font-bold text-lg text-[#111827]">
            <Sprout className="w-5 h-5 text-[#B02310]" />
            <span>Agronomic Advisory Summary:</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-[#374151] font-medium pl-1">
            <li><strong>Organic Enrichment:</strong> Apply 3 to 4 tons/acre farmyard manure prior to sowing to sustain microbial fertility.</li>
            <li><strong>Fertilizer Efficiency:</strong> Use split doses of nitrogen (50% basal + 50% top-dress at 30 days) to prevent volatilization losses.</li>
            <li><strong>Potassium Management:</strong> Soil reserves are naturally high in this plot; omit basal MOP chemical fertilizer.</li>
          </ul>
        </div>

        {/* Verification Request Action */}
        <div className="border-t border-[#E5E7EB] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-muted max-w-md">
            * Colorimetric optical screening results. Does not replace accredited laboratory certification under the Soil Health Card scheme.
          </div>

          <button
            onClick={() => setLabRequested(true)}
            className={`px-6 py-3 rounded-full text-xs font-bold border transition-all ${
              labRequested
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-[#111827] border-[#D1D5DB] hover:border-black'
            }`}
          >
            {labRequested ? 'Laboratory Verification Requested ✓' : 'Request KVK Lab Soil Test'}
          </button>
        </div>

      </div>

    </div>
  );
};
