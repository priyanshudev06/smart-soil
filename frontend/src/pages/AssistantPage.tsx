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
        : 'Welcome! I am your Smart Soil AI Agronomic Assistant. Ask any question regarding soil pH management, fertilizer dosing precautions, or crop care.',
      sources: ['ICAR-IISS Bhopal', 'MPKV Rahuri Package of Practices']
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

  // Speech Recognition handler
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  const sampleQuestions = language === 'mr' ? [
    'सामू (pH) कसा सुधारावा?',
    'सोयाबीन पिकासाठी खत नियोजन काय आहे?',
    'नत्राची कमतरता कशी ओळखावी?'
  ] : language === 'hi' ? [
    'मिट्टी का pH कैसे संतुलित करें?',
    'सोयाबीन के लिए उर्वरक प्रबंधन क्या है?',
    'नाइट्रोजन की कमी के लक्षण क्या हैं?'
  ] : [
    'How to balance alkaline soil?',
    'Recommended fertilizer schedule for Soybean?',
    'How to fix nitrogen deficiency?'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-4 px-4">
      {/* Header */}
      <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#181818] text-emerald-400 flex items-center justify-center shadow">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B1B1B]">
              {language === 'mr' ? 'स्मार्ट कृषी AI सल्लागार' : 'Smart Soil AI Agronomic Assistant'}
            </h1>
            <p className="text-xs text-muted">
              Grounded in ICAR Package of Practices • Speaks Marathi, Hindi & English
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Grounded Mode Active
        </span>
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex flex-wrap gap-2 text-xs">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="bg-white border border-[#D9D7D0] hover:border-black text-[#1B1B1B] px-3.5 py-1.5 rounded-full shadow-sm transition-all text-xs font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Container */}
      <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft min-h-[380px] max-h-[520px] overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                m.sender === 'user'
                  ? 'bg-[#181818] text-white rounded-br-none shadow-sm'
                  : 'bg-[#F0EFEB] text-[#1B1B1B] rounded-bl-none border border-[#D9D7D0]'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-line/60 text-[10px] text-muted">
                  <strong>Vetted Sources:</strong> {m.sources.join(', ')}
                </div>
              )}

              {m.sender === 'assistant' && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted">Provenance: Generated (Grounded)</span>
                  <button
                    onClick={() => handleSpeak(m.text)}
                    className="p-1 hover:bg-black/10 rounded-full"
                    title="Speak text"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-muted hover:text-black" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            Consulting agronomic knowledge base...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={language === 'mr' ? 'माती किंवा पिकाबाबत प्रश्न विचारा...' : 'Ask your soil or farming question...'}
          className="flex-1 bg-white border border-[#D9D7D0] rounded-full px-5 py-3.5 text-xs text-[#1B1B1B] focus:outline-none focus:border-black shadow-soft"
        />

        <button
          onClick={handleToggleVoiceInput}
          className={`p-3.5 rounded-full transition-all ${
            isListening
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-white border border-[#D9D7D0] text-[#1B1B1B] hover:bg-gray-100'
          }`}
          title="Voice input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="bg-[#181818] hover:bg-black disabled:opacity-40 text-white p-3.5 rounded-full shadow-float"
        >
          <Send className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

    </div>
  );
};
