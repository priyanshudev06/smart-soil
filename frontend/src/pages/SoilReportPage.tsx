import React, { useState } from 'react';
import {
  Printer,
  Volume2,
  VolumeX,
  FlaskConical,
  Sprout,
  CheckCircle,
  MapPin,
  Calendar
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
          text = `Soil Report for ${farmer?.name || 'Farmer'}. Soil pH is ${ph}, optimal neutral. Nitrogen is Medium, Phosphorus is Medium, and Potassium is High.`;
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
    <div className="max-w-4xl mx-auto space-y-6 pb-24 pt-6 px-4 print:p-0">
      
      {/* Top Bar with Audio & Print */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border-2 border-[#D9D7D0] rounded-3xl p-5 sm:p-6 shadow-soft print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B1B1B]">
            {language === 'mr' ? 'माती आरोग्य अहवाल' : 'Soil Health Report Card'}
          </h1>
          <p className="text-sm font-semibold text-muted mt-0.5">
            Plot: {selectedPlot?.label} • {farmer?.village}, {farmer?.district}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAudio}
            className={`px-6 py-3.5 rounded-full text-base font-bold flex items-center gap-2.5 transition-all shadow-md ${
              isPlayingAudio
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Report (आवाज)'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-6 py-3.5 rounded-full text-base font-bold bg-[#181818] hover:bg-black text-white flex items-center gap-2 shadow-md hover:scale-105 transition-all"
          >
            <Printer className="w-5 h-5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Certificate Card */}
      <div className="bg-[#FFFDF8] border-2 border-[#D9D7D0] rounded-3xl p-6 sm:p-10 shadow-soft space-y-8">
        
        {/* Certificate Header */}
        <div className="border-b-2 border-line pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1B1B1B] tracking-tight">
                SOIL HEALTH CARD
              </h2>
            </div>
            <div className="text-sm font-bold text-emerald-800 mt-1">
              IoT Spectro-Reader Reading • Device: soil-reader-001
            </div>
          </div>

          <div className="text-left sm:text-right text-sm font-medium space-y-1">
            <div><strong>Farmer:</strong> {farmer?.name}</div>
            <div><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div><strong>Area:</strong> {selectedPlot?.area} {selectedPlot?.area_unit}</div>
          </div>
        </div>

        {/* 4 Nutrient Big Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* pH */}
          <div className="bg-white border-2 border-emerald-400 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-muted uppercase">Soil pH (सामू)</div>
              <div className="text-5xl font-black text-emerald-900 mt-1">
                {lastResult?.parameter === 'pH' ? lastResult.value_or_class : '6.8'}
              </div>
              <div className="text-sm font-bold text-emerald-700 mt-1">
                Optimal Neutral Range [6.5 - 7.1]
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
              ✓
            </div>
          </div>

          {/* Nitrogen */}
          <div className="bg-white border-2 border-blue-400 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-muted uppercase">Nitrogen (नत्र - N)</div>
              <div className="text-4xl font-black text-blue-900 mt-1">
                {lastResult?.parameter.includes('Nitrogen') ? lastResult.value_or_class : 'Medium'}
              </div>
              <div className="text-sm font-bold text-blue-700 mt-1">
                280 - 560 kg/ha equivalent
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              N
            </div>
          </div>

          {/* Phosphorus */}
          <div className="bg-white border-2 border-purple-400 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-muted uppercase">Phosphorus (स्फुरद - P)</div>
              <div className="text-4xl font-black text-purple-900 mt-1">
                {lastResult?.parameter.includes('Phosphorus') ? lastResult.value_or_class : 'Medium'}
              </div>
              <div className="text-sm font-bold text-purple-700 mt-1">
                10 - 25 kg/ha P2O5 equivalent
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl">
              P
            </div>
          </div>

          {/* Potassium */}
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-muted uppercase">Potassium (पालाश - K)</div>
              <div className="text-4xl font-black text-amber-900 mt-1">
                {lastResult?.parameter.includes('Potassium') ? lastResult.value_or_class : 'High'}
              </div>
              <div className="text-sm font-bold text-amber-700 mt-1">
                &gt; 280 kg/ha K2O (Abundant)
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl">
              K
            </div>
          </div>

        </div>

        {/* Practical Field Recommendations */}
        <div className="bg-[#F0EFEB] rounded-3xl p-6 border-2 border-[#D9D7D0] space-y-3">
          <div className="flex items-center gap-2 font-black text-lg text-[#1B1B1B]">
            <Sprout className="w-6 h-6 text-emerald-700" />
            <span>Farming Advice for this Soil:</span>
          </div>
          <ul className="list-disc list-inside space-y-2 text-base text-[#222] font-medium pl-2">
            <li><strong>Organic Care:</strong> Add 2 to 3 tons/acre well-rotted cow manure before sowing.</li>
            <li><strong>Nitrogen:</strong> Split urea into 2 doses (50% at sowing, 50% after 30 days).</li>
            <li><strong>Best Crops:</strong> Soybean, Onion, and Chickpea are highly suited for this soil.</li>
          </ul>
        </div>

        {/* Bottom Verification Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted font-medium">
            Based on optical test kit colorimetry.
          </div>
          <button
            onClick={() => setLabRequested(true)}
            className={`px-6 py-3 rounded-full text-sm font-bold border-2 transition-all ${
              labRequested ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-white hover:bg-gray-100 border-[#D9D7D0]'
            }`}
          >
            {labRequested ? 'Lab Test Requested ✓' : 'Request KVK Lab Soil Test'}
          </button>
        </div>

      </div>

    </div>
  );
};
