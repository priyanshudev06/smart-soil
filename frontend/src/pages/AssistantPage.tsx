import React, { useState } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { Card3D } from '../components/Card3D';
import { speakText, stopSpeaking } from '../utils/speech';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  disclaimer?: string;
}

export const AssistantPage: React.FC = () => {
  const { language, selectedPlot } = useApp();

  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: language === 'mr'
        ? 'नमस्कार! मी तुमचा स्मार्ट सॉईल कृषी सहाय्यक आहे. तुमच्या शेताच्या माती परीक्षणानुसार (सामू ६.८) खत व्यवस्थापन, पीक नियोजन किंवा सेंद्रिय उपायांबाबत प्रश्न विचारा.'
        : language === 'hi'
        ? 'नमस्ते! मैं आपका स्मार्ट सॉयल कृषि सहायक हूँ। अपनी मिट्टी जांच (pH 6.8) के आधार पर उर्वरक प्रबंधन या फसल सलाह के बारे में पूछें।'
        : 'Welcome! I am your Smart Soil AI Agronomic Assistant. Ask any question regarding soil pH management, fertilizer precautions, or crop care for your field.',
      sources: ['ICAR-IISS Bhopal Soil Bulletin', 'MPKV Rahuri Package of Practices']
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q) return;

    const userMsg: Message = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.queryAssistant(q, language, selectedPlot?.plot_id);
      const assistantMsg: Message = {
        sender: 'assistant',
        text: res.response,
        sources: res.sources_cited,
        disclaimer: res.disclaimer
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: 'Sorry, could not connect to agronomic advisory engine. Please check network connection.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported on this browser. Please use Chrome on Android or desktop.");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  const handleSpeak = (text: string) => {
    speakText(text, language);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 pt-6 px-4 sm:px-8">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-10 text-white shadow-xl border border-slate-800 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {language === 'mr' ? 'स्मार्ट कृषी सल्लागार' : 'AI Soil Assistant'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium">
            Trained on ICAR research and regional agricultural university practices
          </p>
        </div>

        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-2xl text-xs font-black text-white">
          Context: <span className="text-emerald-400">{selectedPlot?.label}</span> (pH 6.8)
        </div>
      </div>

      {/* 2. Quick Suggestion Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'मातीचा सामू सुधारण्यासाठी काय करावे?', en: 'How to manage soil pH 6.8?' },
          { label: 'सोयाबीनसाठी खतांची मात्रा कशी ठरवावी?', en: 'Balanced fertilizer for Soybean?' },
          { label: 'सेंद्रिय खत व्यवस्थापन कसे करावे?', en: 'Organic manure dosage per acre?' }
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(language === 'mr' ? item.label : item.en)}
            className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all shadow-sm"
          >
            {language === 'mr' ? item.label : item.en}
          </button>
        ))}
      </div>

      {/* 3. Chat Messages Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 min-h-[400px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 text-sm sm:text-base font-medium leading-relaxed ${
                  m.sender === 'user'
                    ? 'btn-3d-emerald text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none shadow-sm'
                }`}
              >
                {m.text}

                {/* Sources & Speech for Assistant */}
                {m.sender === 'assistant' && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{m.sources?.join(', ') || 'ICAR Guidelines'}</span>
                    </div>

                    <button
                      onClick={() => handleSpeak(m.text)}
                      className="text-emerald-700 hover:text-emerald-900 font-black flex items-center gap-1"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Speak</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 p-3">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              <span>Analyzing soil parameters and agronomic guidelines...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              language === 'mr'
                ? 'येथे प्रश्न विचारा किंवा बोला...'
                : 'Ask a soil or crop question...'
            }
            className="flex-1 bg-slate-50 border border-slate-300 rounded-full px-5 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            onClick={handleToggleVoiceInput}
            className={`p-3.5 rounded-full transition-all ${
              isListening
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="btn-3d-emerald px-6 py-3.5 text-xs font-black flex items-center gap-2 disabled:opacity-40"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
