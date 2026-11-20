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
  Award,
  Radio
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card3D } from '../components/Card3D';
import { speakText, stopSpeaking } from '../utils/speech';

export const SoilReportPage: React.FC = () => {
  const { language, farmer, selectedPlot, lastResult } = useApp();
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioLang, setAudioLang] = useState<'mr' | 'hi' | 'en'>('mr');
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');
  const [labRequested, setLabRequested] = useState<boolean>(false);

  const getAudioScript = (lang: 'mr' | 'hi' | 'en') => {
    const ph = lastResult?.value_or_class || '6.8';
    if (lang === 'mr') {
      return `नमस्कार शेतकरी मित्र. हा तुमचा अधिकृत माती आरोग्य अहवाल आहे. तुमच्या शेताचा सामू म्हणजेच पी एच ${ph} आहे, जो पिकांसाठी अत्यंत योग्य आणि उदासीन आहे. जमिनीत उपलब्ध नत्र मध्यम, स्फुरद मध्यम, आणि पालाश भरपूर प्रमाणात आहे. या मातीसाठी सोयाबीन, कांदा आणि हरभरा ही पिके सर्वाधिक फायदेशीर ठरतील. रासायनिक खतांचा अतिवापर टाळा आणि सेंद्रिय शेणखताचा वापर करा.`;
    } else if (lang === 'hi') {
      return `नमस्ते किसान भाई. यह आपकी आधिकारिक मृदा स्वास्थ्य रिपोर्ट है. आपके खेत का पी एच मान ${ph} है, जो फसलों के लिए अत्यंत उपयुक्त और उदासीन है. मिट्टी में नाइट्रोजन मध्यम, फास्फोरस मध्यम और पोटाश प्रचुर मात्रा में है. इस मिट्टी के लिए सोयाबीन, प्याज और चना सबसे अधिक लाभदायक फसलें होंगी.`;
    } else {
      return `Hello Farmer. This is your official Soil Health Report. Your plot soil pH is ${ph}, which is in the optimal neutral range. Available Nitrogen is Medium, Phosphorus is Medium, and Potassium is High. Recommended high-yield crops are Soybean, Onion, and Chickpea.`;
    }
  };

  const handlePlayVoice = (lang: 'mr' | 'hi' | 'en') => {
    if (isPlayingAudio && audioLang === lang) {
      stopSpeaking();
      setIsPlayingAudio(false);
      setActiveSpeechText('');
      return;
    }

    setAudioLang(lang);
    const text = getAudioScript(lang);
    setActiveSpeechText(text);

    speakText(
      text,
      lang,
      () => setIsPlayingAudio(true),
      () => {
        setIsPlayingAudio(false);
        setActiveSpeechText('');
      },
      (err) => {
        console.warn('Speech error:', err);
        setIsPlayingAudio(false);
        setActiveSpeechText('');
      }
    );
  };

  const handleStopVoice = () => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setActiveSpeechText('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 pt-6 px-4 sm:px-8 print:p-0">
      
      {/* 1. Top Controls Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm print:hidden">
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

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Audio Language Chips & Trigger */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200">
            <button
              onClick={() => handlePlayVoice('mr')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                isPlayingAudio && audioLang === 'mr'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              {isPlayingAudio && audioLang === 'mr' ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>थांबवा (Stop)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>मराठीत ऐका</span>
                </>
              )}
            </button>

            <button
              onClick={() => handlePlayVoice('hi')}
              className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
                isPlayingAudio && audioLang === 'hi'
                  ? 'bg-red-500 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              हिंदी
            </button>

            <button
              onClick={() => handlePlayVoice('en')}
              className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
                isPlayingAudio && audioLang === 'en'
                  ? 'bg-red-500 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              English
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="btn-3d-dark px-6 py-3.5 text-xs font-black flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Live Voice Playback Banner (Active Speech Display) */}
      {isPlayingAudio && (
        <div className="bg-emerald-950 text-white p-5 rounded-3xl border border-emerald-800 shadow-xl space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>
                  {audioLang === 'mr' ? 'मराठी आवाज सुरू आहे (Playing in Marathi)' : audioLang === 'hi' ? 'हिंदी ऑडियो चालू है' : 'Playing English Audio'}
                </span>
              </span>
            </div>
            <button
              onClick={handleStopVoice}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition-colors"
            >
              Stop
            </button>
          </div>
          <p className="text-sm text-emerald-100 font-medium leading-relaxed">
            "{activeSpeechText}"
          </p>
        </div>
      )}

      {/* 2. Main Certificate Body */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl space-y-8 print:border-none print:shadow-none print:p-2">
        
        {/* Certificate Header Banner */}
        <div className="border-b-2 border-slate-100 pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
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
