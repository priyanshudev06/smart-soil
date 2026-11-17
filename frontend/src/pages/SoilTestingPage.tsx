import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Zap,
  Sliders,
  Cpu
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
    setScanProgress(20);

    try {
      for (let p = 40; p <= 90; p += 30) {
        await new Promise(r => setTimeout(r, 200));
        setScanProgress(p);
      }

      const payload = {
        schema_version: "1.0",
        message_id: `msg-vertex-${Date.now()}`,
        device_id: device?.device_id || "soil-reader-001",
        firmware_version: device?.firmware_version || "1.0.0",
        test_id: `test-session-${Date.now()}`,
        kit: { kit_id: "kit-agri-chem-4in1", lot: "LOT-2026-NOV", parameter: parameter },
        captured_at: new Date().toISOString(),
        temperature_c: 27.5,
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
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 pt-6 px-4 sm:px-8">
      
      {/* Vertex Stage Indicator */}
      <div className="grid grid-cols-4 gap-2 bg-white border border-[#E5E7EB] rounded-2xl p-3 shadow-sm">
        {[
          { num: '01', title: 'Target Metric' },
          { num: '02', title: '60s Incubation' },
          { num: '03', title: 'Spectro-Scan' },
          { num: '04', title: 'Verified Output' },
        ].map((s, idx) => (
          <div
            key={s.num}
            className={`py-2 px-3 rounded-xl transition-all ${
              step >= idx + 1
                ? 'bg-[#111827] text-white shadow-sm'
                : 'text-muted'
            }`}
          >
            <div className="text-[11px] font-mono tracking-widest">{s.num}</div>
            <div className="text-xs font-bold truncate">{s.title}</div>
          </div>
        ))}
      </div>

      {/* STEP 1: Select Parameter */}
      {step === 1 && (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-[#B02310]">STAGE 01</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#111827] mt-1">
              Select Soil Chemical Index
            </h2>
            <p className="text-sm text-muted mt-1">
              Plot: <strong className="text-black">{selectedPlot?.label}</strong> ({selectedPlot?.area} Acres)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'pH', title: 'Soil pH (सामू)', desc: 'Acidity / Alkalinity level (Optimal: 6.5 - 7.5)', rgb: { r: 1220, g: 990, b: 650, c: 2860 } },
              { id: 'Nitrogen (N)', title: 'Nitrogen (नत्र - N)', desc: 'Vegetative vigor & leaf chlorophyll index', rgb: { r: 1450, g: 780, b: 920, c: 3150 } },
              { id: 'Phosphorus (P)', title: 'Phosphorus (स्फुरद - P)', desc: 'Root development and early establishment', rgb: { r: 720, g: 890, b: 1540, c: 3150 } },
              { id: 'Potassium (K)', title: 'Potassium (पालाश - K)', desc: 'Drought and pest defense resilience', rgb: { r: 1650, g: 1350, b: 540, c: 3540 } },
            ].map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setParameter(p.id);
                  setSimulatedChannels(p.rgb);
                }}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  parameter === p.id
                    ? 'border-[#B02310] bg-[#B02310]/5 shadow-sm'
                    : 'border-[#E5E7EB] bg-[#FBFBFA] hover:border-[#111827]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-serif text-xl font-bold text-[#111827]">{p.title}</div>
                  {parameter === p.id && <CheckCircle2 className="w-5 h-5 text-[#B02310]" />}
                </div>
                <div className="text-xs text-[#6B7280] font-medium mt-1">{p.desc}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
            <button
              onClick={() => setStep(2)}
              className="bg-[#111827] hover:bg-[#B02310] text-white px-8 py-4 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Continue to Incubation &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Chemical Reaction Wait Period */}
      {step === 2 && (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6 text-center">
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-[#B02310]">STAGE 02</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#111827] mt-1">
              60-Second Reaction Timer
            </h2>
            <p className="text-sm text-muted mt-1">
              Dip reacted test strip into the supernatant solution. Wait 60s for full dye development.
            </p>
          </div>

          {/* Large Architectural Digital Countdown Clock */}
          <div className="bg-[#1E0B09] text-white rounded-3xl p-10 max-w-lg mx-auto shadow-md space-y-4">
            <div className="text-xs uppercase tracking-widest text-white/60 font-mono">Elapsed Reaction Time</div>
            <div className="text-7xl sm:text-8xl font-serif font-bold text-white tracking-tight">
              00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              {!timerRunning ? (
                <button
                  onClick={() => setTimerRunning(true)}
                  className="bg-[#B02310] hover:bg-[#8F1A0A] text-white px-8 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start 60s Countdown</span>
                </button>
              ) : (
                <button
                  onClick={() => setTimerRunning(false)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </button>
              )}
              <button
                onClick={() => { setTimerRunning(false); setTimerSeconds(60); }}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-full text-sm font-semibold border border-white/20"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#E5E7EB]">
            <button onClick={() => setStep(1)} className="text-sm font-semibold text-muted hover:text-black">
              &larr; Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-[#111827] hover:bg-[#B02310] text-white px-8 py-4 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Insert in Reader Chamber &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Optical Reader Scan */}
      {step === 3 && (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black tracking-widest uppercase text-[#B02310]">STAGE 03</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#111827] mt-1">
                Trigger Spectro-Scan
              </h2>
              <p className="text-sm text-muted mt-1">
                TCS34725 optical spectral acquisition under controlled white LED
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Chamber Ready
            </span>
          </div>

          {/* Telemetry Channel Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-[#FBFBFA] border border-[#E5E7EB] rounded-2xl p-4">
              <div className="text-xs font-mono font-bold text-[#B02310] uppercase">Red (R)</div>
              <div className="text-3xl font-serif font-black text-[#111827] mt-1">{simulatedChannels.r}</div>
            </div>
            <div className="bg-[#FBFBFA] border border-[#E5E7EB] rounded-2xl p-4">
              <div className="text-xs font-mono font-bold text-[#047857] uppercase">Green (G)</div>
              <div className="text-3xl font-serif font-black text-[#111827] mt-1">{simulatedChannels.g}</div>
            </div>
            <div className="bg-[#FBFBFA] border border-[#E5E7EB] rounded-2xl p-4">
              <div className="text-xs font-mono font-bold text-[#396A94] uppercase">Blue (B)</div>
              <div className="text-3xl font-serif font-black text-[#111827] mt-1">{simulatedChannels.b}</div>
            </div>
            <div className="bg-[#FBFBFA] border border-[#E5E7EB] rounded-2xl p-4">
              <div className="text-xs font-mono font-bold text-[#4B5563] uppercase">Clear (C)</div>
              <div className="text-3xl font-serif font-black text-[#111827] mt-1">{simulatedChannels.c}</div>
            </div>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#B02310]">
                <span>Processing optical spectral reflectance...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#B02310] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-[#E5E7EB]">
            <button onClick={() => setStep(2)} className="text-sm font-semibold text-muted hover:text-black">
              &larr; Back
            </button>
            <button
              disabled={isScanning}
              onClick={executeMeasurement}
              className="bg-[#B02310] hover:bg-[#8F1A0A] text-white px-10 py-4 rounded-full text-base font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isScanning ? 'Acquiring Spectrum...' : 'Scan & Ingest to Database'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Success & Result */}
      {step === 4 && (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-10 sm:p-14 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#111827]">
            Spectro-Analysis Saved
          </h2>
          <p className="text-base text-muted max-w-md mx-auto">
            Raw spectral counts successfully saved to SQLite database with temperature compensation.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => navigate('/report')}
              className="bg-[#111827] hover:bg-[#B02310] text-white px-8 py-4 rounded-full text-base font-bold shadow-sm hover:scale-105 transition-all"
            >
              Open Soil Health Certificate &rarr;
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
