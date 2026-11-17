import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  ArrowRight,
  Zap,
  Sliders
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';

export const SoilTestingPage: React.FC = () => {
  const { language, selectedPlot, setLastResult, device } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [parameter, setParameter] = useState<string>('pH');
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [simulatedChannels, setSimulatedChannels] = useState<{ r: number; g: number; b: number; c: number }>({
    r: 1220,
    g: 990,
    b: 650,
    c: 2860
  });
  const [customTemp, setCustomTemp] = useState<number>(27.5);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const executeMeasurement = async () => {
    setIsScanning(true);
    setErrorMsg('');
    setScanProgress(15);

    try {
      for (let p = 30; p <= 90; p += 30) {
        await new Promise(r => setTimeout(r, 200));
        setScanProgress(p);
      }

      const uniqueMsgId = `msg-hw-${Date.now()}`;
      const testSessionId = `test-session-${Date.now()}`;

      const payload = {
        schema_version: "1.0",
        message_id: uniqueMsgId,
        device_id: device?.device_id || "soil-reader-001",
        firmware_version: device?.firmware_version || "1.0.0",
        test_id: testSessionId,
        kit: { kit_id: "kit-agri-chem-4in1", lot: "LOT-2026-NOV", parameter: parameter },
        captured_at: new Date().toISOString(),
        temperature_c: customTemp,
        sensor: {
          model: "TCS34725",
          r: simulatedChannels.r,
          g: simulatedChannels.g,
          b: simulatedChannels.b,
          c: simulatedChannels.c,
          gain: 4,
          integration_ms: 154,
          led_on: true
        },
        repeat_readings: [
          { r: simulatedChannels.r - 2, g: simulatedChannels.g + 1, b: simulatedChannels.b + 1, c: simulatedChannels.c - 1 }
        ],
        quality: { reference_tile_check: "pass", ambient_subtraction: "pass", device_flag: "none" },
        calibration_version: "ph-kit-agri-cal-1.0"
      };

      const result = await api.sendMeasurement(payload);
      setScanProgress(100);
      setIsScanning(false);
      setLastResult(result);
      setStep(4);
    } catch {
      setIsScanning(false);
      setErrorMsg("Failed to capture reading. Please retry.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 pt-6 px-4">
      
      {/* Step Pills */}
      <div className="bg-white border-2 border-[#D9D7D0] rounded-full p-2.5 shadow-soft flex items-center justify-between text-sm font-black px-6">
        {[
          { num: 1, label: '1. Select Test' },
          { num: 2, label: '2. 60s Reaction' },
          { num: 3, label: '3. Scan' },
          { num: 4, label: '4. Result' },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-2 ${
              step >= s.num ? 'text-emerald-700' : 'text-muted'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                step >= s.num ? 'bg-emerald-600 text-white' : 'bg-line text-muted'
              }`}
            >
              {s.num}
            </span>
            <span className="hidden sm:inline text-sm">{s.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Select Parameter */}
      {step === 1 && (
        <div className="bg-[#FFFDF8] border-2 border-[#D9D7D0] rounded-3xl p-6 sm:p-10 shadow-soft space-y-6">
          <div>
            <h2 className="text-3xl font-black text-[#1B1B1B] tracking-tight">
              {language === 'mr' ? 'कोणती चाचणी करायची आहे?' : 'What do you want to test?'}
            </h2>
            <p className="text-base text-muted font-medium mt-1">
              Field: <strong className="text-black">{selectedPlot?.label}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'pH', title: 'Soil pH (सामू)', tag: 'Soil Acidity / Alkalinity', color: 'border-emerald-500 bg-emerald-50/50', rgb: { r: 1220, g: 990, b: 650, c: 2860 } },
              { id: 'Nitrogen (N)', title: 'Nitrogen (नत्र - N)', tag: 'Growth & Green Foliage', color: 'border-blue-500 bg-blue-50/50', rgb: { r: 1450, g: 780, b: 920, c: 3150 } },
              { id: 'Phosphorus (P)', title: 'Phosphorus (स्फुरद - P)', tag: 'Root Strength & Flowering', color: 'border-purple-500 bg-purple-50/50', rgb: { r: 720, g: 890, b: 1540, c: 3150 } },
              { id: 'Potassium (K)', title: 'Potassium (पालाश - K)', tag: 'Drought & Pest Resistance', color: 'border-amber-500 bg-amber-50/50', rgb: { r: 1650, g: 1350, b: 540, c: 3540 } }
            ].map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setParameter(p.id);
                  setSimulatedChannels(p.rgb);
                }}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  parameter === p.id
                    ? `${p.color} ring-4 ring-emerald-500/20 shadow-md`
                    : 'bg-white border-[#D9D7D0] hover:border-black'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-black text-[#1B1B1B]">{p.title}</div>
                  {parameter === p.id && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                </div>
                <div className="text-sm font-bold text-muted mt-1">{p.tag}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="bg-[#181818] hover:bg-black text-white px-8 py-4 rounded-full text-base font-bold flex items-center gap-2 shadow-float hover:scale-105 transition-all"
            >
              <span>Continue &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Chemical Wait Timer */}
      {step === 2 && (
        <div className="bg-[#FFFDF8] border-2 border-[#D9D7D0] rounded-3xl p-6 sm:p-10 shadow-soft space-y-6 text-center">
          <div>
            <h2 className="text-3xl font-black text-[#1B1B1B]">
              Wait 60 Seconds for Color to React
            </h2>
            <p className="text-base text-muted font-medium mt-1">
              Dip test strip in soil solution, then start the countdown timer.
            </p>
          </div>

          {/* Big Digital Countdown Timer */}
          <div className="bg-[#F0EFEB] rounded-3xl p-8 border-2 border-[#D9D7D0] space-y-4">
            <div className="text-7xl sm:text-8xl font-black text-[#1B1B1B] font-mono tracking-tight">
              00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              {!timerRunning ? (
                <button
                  onClick={() => setTimerRunning(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full text-base font-bold flex items-center gap-2 shadow-float"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start 60s Timer</span>
                </button>
              ) : (
                <button
                  onClick={() => setTimerRunning(false)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full text-base font-bold flex items-center gap-2 shadow-float"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Timer</span>
                </button>
              )}
              <button
                onClick={() => { setTimerRunning(false); setTimerSeconds(60); }}
                className="bg-white border-2 border-[#D9D7D0] text-[#1B1B1B] px-6 py-4 rounded-full text-base font-bold hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button onClick={() => setStep(1)} className="text-sm font-bold text-muted hover:text-black">
              &larr; Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-[#181818] hover:bg-black text-white px-8 py-4 rounded-full text-base font-bold flex items-center gap-2 shadow-float hover:scale-105 transition-all"
            >
              <span>Place Strip in Device &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Scan with Spectro-Reader */}
      {step === 3 && (
        <div className="bg-[#FFFDF8] border-2 border-[#D9D7D0] rounded-3xl p-6 sm:p-10 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-[#1B1B1B]">
                Trigger Optical Spectro-Scan
              </h2>
              <p className="text-base text-muted font-medium mt-1">
                Reading TCS34725 sensor channels under internal calibrated LED
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              Device Online
            </span>
          </div>

          {/* Sensor Channels Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-red-700">Red (R)</div>
              <div className="text-3xl font-black text-red-950 mt-1">{simulatedChannels.r}</div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-green-700">Green (G)</div>
              <div className="text-3xl font-black text-green-950 mt-1">{simulatedChannels.g}</div>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-blue-700">Blue (B)</div>
              <div className="text-3xl font-black text-blue-950 mt-1">{simulatedChannels.b}</div>
            </div>
            <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-4">
              <div className="text-xs font-bold text-gray-700">Clear (C)</div>
              <div className="text-3xl font-black text-gray-950 mt-1">{simulatedChannels.c}</div>
            </div>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-emerald-800">
                <span>Calibrating spectral reflectance...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-line rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <button onClick={() => setStep(2)} className="text-sm font-bold text-muted hover:text-black">
              &larr; Back
            </button>
            <button
              disabled={isScanning}
              onClick={executeMeasurement}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-full text-lg font-black flex items-center gap-2 shadow-float hover:scale-105 transition-all"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{isScanning ? 'Scanning...' : 'Scan Now & Save'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Completed */}
      {step === 4 && (
        <div className="bg-white border-2 border-[#D9D7D0] rounded-3xl p-10 shadow-float text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h2 className="text-4xl font-black text-[#1B1B1B]">
            Measurement Complete!
          </h2>
          <p className="text-base text-muted font-medium">
            Your soil sample has been processed and saved to the database.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/report')}
              className="bg-[#181818] hover:bg-black text-white px-10 py-4 rounded-full text-lg font-bold shadow-float hover:scale-105 transition-all"
            >
              View Soil Report Card &rarr;
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
