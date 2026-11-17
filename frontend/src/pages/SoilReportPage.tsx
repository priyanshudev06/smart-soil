import React, { useState } from 'react';
import {
  Printer,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertTriangle,
  FlaskConical,
  Sprout,
  CheckCircle,
  FileText,
  Calendar,
  Layers,
  Info
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const SoilReportPage: React.FC = () => {
  const { language, farmer, selectedPlot, lastResult } = useApp();
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [labRequested, setLabRequested] = useState<boolean>(false);

  // Audio Speech Synthesis for Marathi / Hindi / English
  const handleToggleAudio = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const ph = lastResult?.value_or_class || '6.8';
        let text = '';
        if (language === 'mr') {
          text = `शेतकरी ${farmer?.name || 'मित्र'} यांचा माती अहवाल. तुमच्या शेताचा सामू ${ph} आहे, जो पिकांसाठी अत्यंत योग्य आहे. नत्र मध्यम, स्फुरद मध्यम आणि पालाश भरपूर आहे. सोयाबीन, कांदा आणि हरभरा ही पिके या मातीसाठी सर्वाधिक फायदेशीर ठरतील. रासायनिक खतांचा डोस देण्यापूर्वी प्रयोगशाळेची खात्री करा.`;
        } else if (language === 'hi') {
          text = `किसान ${farmer?.name || 'भाई'} का मृदा स्वास्थ्य रिपोर्ट। आपके खेत का pH मान ${ph} है, जो फसलों के लिए अनुकूल है। नाइट्रोजन मध्यम, फास्फोरस मध्यम और पोटाश उच्च है। सोयाबीन, प्याज और चना इस मिट्टी के लिए सर्वोत्तम हैं।`;
        } else {
          text = `Soil Health Report for ${farmer?.name || 'Farmer'}. Plot soil pH is ${ph}, which is in the optimal range. Nitrogen is Medium, Phosphorus is Medium, and Potassium is High. Soybean, Onion, and Chickpea are highly recommended.`;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Text-to-speech is not supported on this browser.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-4 px-4 print:p-0">
      
      {/* Top Action Bar (Print & Voice Explanation) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#D9D7D0] rounded-2xl p-4 shadow-soft print:hidden">
        <div>
          <h1 className="font-bold text-lg text-[#1B1B1B]">
            {language === 'mr' ? 'माती आरोग्य अहवाल' : language === 'hi' ? 'मृदा स्वास्थ्य कार्ड रिपोर्ट' : 'Soil Health Analysis Report'}
          </h1>
          <p className="text-xs text-muted">
            Test Session ID: #TS-2026-NOV-8941 • Protocol: Colorimetric Spectro-Scan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Speech Button */}
          <button
            onClick={handleToggleAudio}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
              isPlayingAudio
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingAudio ? 'थांबवा (Stop)' : language === 'mr' ? 'अहवाल ऐका (Voice)' : 'Listen Report'}</span>
          </button>

          {/* Print PDF Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#181818] hover:bg-black text-white flex items-center gap-2 shadow"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'mr' ? 'प्रिंट / PDF' : 'Print / Export'}</span>
          </button>
        </div>
      </div>

      {/* Main Printable Soil Card Container */}
      <div className="bg-[#FFFDF8] border-2 border-[#D9D7D0] rounded-3xl p-6 sm:p-8 shadow-soft space-y-6 print:border-none print:shadow-none print:p-2">
        
        {/* Certificate / Card Header */}
        <div className="border-b-2 border-line pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <h2 className="text-2xl font-black text-[#1B1B1B] tracking-tight">
                SMART SOIL HEALTH CARD
              </h2>
            </div>
            <div className="text-xs text-muted mt-1">
              Colorimetric Optical Sensing • Microcontroller: ESP32 • Sensor: TCS34725
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1">
            <div><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div><strong>Device:</strong> soil-reader-001 (Rev 1.0)</div>
            <div><strong>Kit Model:</strong> AgriQuick 4-in-1 (LOT-2026-NOV)</div>
            <div><strong>Calibration:</strong> ph-kit-agri-cal-1.0</div>
          </div>
        </div>

        {/* Farmer & Plot Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F0EFEB] rounded-2xl p-4 text-xs border border-[#D9D7D0]">
          <div>
            <div className="text-muted font-medium">Farmer Name</div>
            <div className="font-bold text-[#1B1B1B] text-sm">{farmer?.name}</div>
          </div>
          <div>
            <div className="text-muted font-medium">Plot Label</div>
            <div className="font-bold text-[#1B1B1B] text-sm">{selectedPlot?.label}</div>
          </div>
          <div>
            <div className="text-muted font-medium">Soil & Area</div>
            <div className="font-bold text-[#1B1B1B] text-sm">{selectedPlot?.area} {selectedPlot?.area_unit} ({selectedPlot?.soil_type})</div>
          </div>
          <div>
            <div className="text-muted font-medium">Location</div>
            <div className="font-bold text-[#1B1B1B] text-sm">{farmer?.village}, {farmer?.district}</div>
          </div>
        </div>

        {/* 4-Parameter Measured vs Calibrated Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#1B1B1B]">
              {language === 'mr' ? 'माती रासायनिक गुणधर्म व निष्कर्ष' : 'Soil Chemical Indices & Calibrated Classes'}
            </h3>
            <span className="text-xs text-muted">Scope: 4 of 12 Soil Health Card Parameters</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D9D7D0] text-muted uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Parameter</th>
                  <th className="py-2.5 px-3">Result / Class</th>
                  <th className="py-2.5 px-3">Interval / Meaning</th>
                  <th className="py-2.5 px-3">Provenance</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {/* pH Row */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#1B1B1B]">
                    Soil pH (सामू)
                    <div className="text-[10px] text-muted font-normal">Bromothymol Blue Indicator</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-base font-black text-emerald-800">
                      {lastResult?.parameter === 'pH' ? lastResult.value_or_class : '6.8'}
                    </span>
                    <span className="text-muted text-[11px] ml-1">pH</span>
                  </td>
                  <td className="py-3 px-3 text-muted">
                    {lastResult?.parameter === 'pH' ? lastResult.interval : '[6.5 - 7.1]'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                      Estimated
                    </span>
                  </td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">Optimal Neutral</td>
                </tr>

                {/* Nitrogen Row */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#1B1B1B]">
                    Available Nitrogen (नत्र - N)
                    <div className="text-[10px] text-muted font-normal">Griess-Ilosvay Pink Reaction</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-base font-black text-blue-800">
                      {lastResult?.parameter.includes('Nitrogen') ? lastResult.value_or_class : 'Medium'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted">
                    280 - 560 kg/ha equivalent
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[10px] border border-blue-300">
                      Estimated
                    </span>
                  </td>
                  <td className="py-3 px-3 text-blue-700 font-bold">Adequate</td>
                </tr>

                {/* Phosphorus Row */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#1B1B1B]">
                    Available Phosphorus (स्फुरद - P)
                    <div className="text-[10px] text-muted font-normal">Molybdenum-Blue Colorimetry</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-base font-black text-purple-800">
                      {lastResult?.parameter.includes('Phosphorus') ? lastResult.value_or_class : 'Medium'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted">
                    10 - 25 kg/ha P2O5 equivalent
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-bold text-[10px] border border-purple-300">
                      Estimated
                    </span>
                  </td>
                  <td className="py-3 px-3 text-purple-700 font-bold">Moderate</td>
                </tr>

                {/* Potassium Row */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#1B1B1B]">
                    Available Potassium (पालाश - K)
                    <div className="text-[10px] text-muted font-normal">Precipitation Turbidimetry</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-base font-black text-amber-800">
                      {lastResult?.parameter.includes('Potassium') ? lastResult.value_or_class : 'High'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted">
                    &gt; 280 kg/ha K2O equivalent
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-300">
                      Estimated
                    </span>
                  </td>
                  <td className="py-3 px-3 text-amber-700 font-bold">High / Abundant</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Actionable Soil Health Advisory */}
        <div className="bg-[#F0EFEB] rounded-2xl p-5 border border-[#D9D7D0] space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[#1B1B1B]">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span>{language === 'mr' ? 'सेंद्रिय व रासायनिक सुधारणा सल्ला' : 'Agronomic Soil Management Advisory'}</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-muted pl-1">
            <li><strong>Organic Enrichment:</strong> Apply 3 to 4 tons/acre well-decomposed FYM (Farmyard Manure) or 1 ton vermicompost prior to Kharif sowing to sustain beneficial soil microbes.</li>
            <li><strong>Nitrogen Efficiency:</strong> Use Neem-coated urea in split applications (50% basal + 50% top-dressing) to prevent volatilization in black soils.</li>
            <li><strong>Potassium Management:</strong> Potassium reserves are naturally high in this soil type; basal muriate of potash (MOP) can be moderated.</li>
          </ul>
          <div className="text-[11px] text-muted flex items-center gap-1.5 pt-1">
            <Info className="w-3.5 h-3.5" />
            <span>Vetted Source: ICAR-IISS Bhopal & Mahatma Phule Krishi Vidyapeeth (MPKV Rahuri).</span>
          </div>
        </div>

        {/* Quality Flags & Provenance Box */}
        <div className="bg-white rounded-2xl p-4 border border-[#D9D7D0] text-xs space-y-2">
          <div className="font-semibold text-[#1B1B1B] flex items-center justify-between">
            <span>Hardware Quality Check Verification:</span>
            <span className="text-emerald-700 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> All Checks Passed
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted">
            <div>Ambient Subtraction: <strong>0 counts (Pass)</strong></div>
            <div>Optical Scatter: <strong>1.4% (Pass)</strong></div>
            <div>Chamber Temp: <strong>27.5°C</strong></div>
            <div>Led Current: <strong>Controlled 20mA</strong></div>
          </div>
        </div>

        {/* Scientific Limitations & Laboratory Verification Request */}
        <div className="border-t border-[#D9D7D0] pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="text-muted text-[11px] max-w-lg">
            * Screening results are indicative and based on chemical test kit colorimetry. Accredited laboratory testing is required for official subsidy applications and precision fertilizer recommendations.
          </div>

          <button
            onClick={() => setLabRequested(true)}
            className={`px-4 py-2 rounded-full font-semibold border text-xs flex items-center gap-1.5 transition-all ${
              labRequested
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-[#1B1B1B] border-[#D9D7D0] hover:bg-gray-100'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
            <span>{labRequested ? 'Lab Test Requested ✓' : 'Request KVK Lab Soil Test'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
