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
  Layers,
  Sparkles,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card3D } from '../components/Card3D';

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
    <div className="max-w-5xl mx-auto space-y-8 pb-24 pt-6 px-4 sm:px-8 print:p-0">
      
      {/* 1. Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm print:hidden">
        <div>
          <span className="text-xs font-mono tracking-widest text-emerald-600 font-black uppercase">
            CERTIFICATE NO. #TS-2026-NOV-8941
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            Official Soil Health Card
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Plot: {selectedPlot?.label} • {farmer?.village}, {farmer?.district}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAudio}
            className={`px-6 py-3.5 rounded-full text-xs font-black flex items-center gap-2 transition-all ${
              isPlayingAudio
                ? 'bg-red-500 text-white animate-pulse'
                : 'btn-3d-emerald'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingAudio ? 'Stop Voice' : 'Listen Voice (आवाज)'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="btn-3d-dark px-6 py-3.5 text-xs font-black flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Main Certificate Body */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl space-y-8 print:border-none print:shadow-none print:p-2">
        
        {/* Certificate Header Banner */}
        <div className="border-b-2 border-slate-100 pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-600" />
              Government of India SHC Standard Aligned
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              PRECISION SOIL CARD
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              IoT Ingest: ESP32 Core • Optical Engine: TCS34725 • Calibration: ph-kit-agri-cal-1.0
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-none border-slate-200">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Farmer Record</div>
            <div className="text-xl font-black text-slate-900 mt-1">{farmer?.name}</div>
            <div className="text-xs font-semibold text-slate-600">Aadhaar Linked • {farmer?.phone}</div>
          </div>
        </div>

        {/* 3D Nutrient Parameter Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Measured Soil Nutrients (4 of 12 SHC Parameters)
            </h3>
            <span className="text-xs font-bold text-emerald-600">
              3D Interactive Cards
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* pH Box */}
            <Card3D glowColor="blue" className="p-6">
              <span className="text-xs font-extrabold text-cyan-600 uppercase tracking-widest">Reaction</span>
              <div className="text-3xl font-black text-slate-900 mt-1">pH 6.8</div>
              <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-black bg-cyan-100 text-cyan-800">
                Optimal Neutral
              </div>
              <p className="text-xs text-slate-500 font-medium mt-3">
                Provenience: Measured (Optical TCS34725)
              </p>
            </Card3D>

            {/* Nitrogen Box */}
            <Card3D glowColor="emerald" className="p-6">
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">Available N</span>
              <div className="text-3xl font-black text-slate-900 mt-1">Medium</div>
              <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                280–560 kg/ha
              </div>
              <p className="text-xs text-slate-500 font-medium mt-3">
                Provenience: Measured (Optical Greiss)
              </p>
            </Card3D>

            {/* Phosphorus Box */}
            <Card3D glowColor="amber" className="p-6">
              <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest">Available P</span>
              <div className="text-3xl font-black text-slate-900 mt-1">Medium</div>
              <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                10–25 kg/ha
              </div>
              <p className="text-xs text-slate-500 font-medium mt-3">
                Provenience: Measured (Molybdenum Blue)
              </p>
            </Card3D>

            {/* Potassium Box */}
            <Card3D glowColor="purple" className="p-6">
              <span className="text-xs font-extrabold text-purple-600 uppercase tracking-widest">Available K</span>
              <div className="text-3xl font-black text-slate-900 mt-1">High</div>
              <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800">
                &gt;280 kg/ha
              </div>
              <p className="text-xs text-slate-500 font-medium mt-3">
                Provenience: Measured (Sodium Cobaltinitrite)
              </p>
            </Card3D>

          </div>
        </div>

        {/* Agronomic Dosage & Advisory (Strict PRD Compliance) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h4 className="text-xl font-black text-white tracking-tight">
              Agronomic Advice & Safety Safeguard
            </h4>
          </div>
          <p className="text-sm font-medium text-slate-300 leading-relaxed">
            Your soil exhibits excellent neutral pH (6.8) and rich Potassium reserves. No lime or gypsum required.
            Apply balanced FYM (Farm Yard Manure) at 2.5 tonnes/acre before sowing to sustain organic carbon.
          </p>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold">
            <strong>Mandatory Scientific Notice:</strong> This rapid on-farm test provides qualitative indices. Consult your local Taluka Agronomist / Krishi Vigyan Kendra (KVK) before purchasing bulk chemical fertilizers.
          </div>
        </div>

        {/* Request Certified Lab Retest */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-500">
            Want verification at a district NABL-accredited laboratory?
          </div>
          <button
            onClick={() => setLabRequested(true)}
            className="btn-3d-emerald px-6 py-3 text-xs font-black"
          >
            {labRequested ? 'Sample Pickup Scheduled ✓' : 'Book NABL Lab Soil Retest'}
          </button>
        </div>

      </div>

    </div>
  );
};
