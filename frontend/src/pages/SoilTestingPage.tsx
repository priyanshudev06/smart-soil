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
  Cpu,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { Card3D } from '../components/Card3D';
import { PopUpModal } from '../components/PopUpModal';

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

  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [testResultSummary, setTestResultSummary] = useState<any>(null);

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
      for (let p = 40; p <= 90; p += 25) {
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
      setTestResultSummary(result);
      setShowResultModal(true);
      setStep(4);
    } catch {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 pt-6 px-4 sm:px-8">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-10 text-white shadow-xl border border-slate-800 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            Optical Assay Protocol
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {language === 'mr' ? 'माती चाचणी प्रक्रिया' : 'Rapid Soil Testing'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium">
            ESP32 Spectro-Reader • TCS34725 Colorimetric Optical Detection
          </p>
        </div>

        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-2xl text-xs font-black text-white">
          Active Plot: <span className="text-emerald-400">{selectedPlot?.label}</span>
        </div>
      </div>

      {/* 2. Stepper Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { num: 1, title: 'Choose Target', desc: 'Select nutrient parameter' },
          { num: 2, title: 'Incubation', desc: '60s color reaction' },
          { num: 3, title: 'Optical Scan', desc: 'TCS34725 sensor read' },
          { num: 4, title: 'Health Card', desc: 'Instant diagnostic result' }
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`cursor-pointer rounded-2xl p-4 border transition-all ${
              step === s.num
                ? 'bg-slate-900 text-white border-emerald-500 shadow-lg scale-105'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-widest ${step === s.num ? 'text-emerald-400' : 'text-slate-400'}`}>
                Step 0{s.num}
              </span>
              {step > s.num && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
            <div className="text-sm font-black mt-2">{s.title}</div>
            <div className={`text-[11px] font-medium mt-0.5 ${step === s.num ? 'text-slate-400' : 'text-slate-500'}`}>
              {s.desc}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Stage Content */}
      <div className="space-y-6">
        
        {/* STEP 1: PARAMETER SELECTION */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Select Chemical Test Target:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { id: 'pH', label: 'Soil Reaction (pH)', reagent: 'Universal Indicator', glow: 'blue', color: 'from-blue-500 to-cyan-500' },
                { id: 'N', label: 'Available Nitrogen (N)', reagent: 'Greiss Nitrite Reagent', glow: 'emerald', color: 'from-emerald-500 to-teal-500' },
                { id: 'P', label: 'Available Phosphorus (P)', reagent: 'Molybdenum Blue Complex', glow: 'amber', color: 'from-amber-500 to-orange-500' },
                { id: 'K', label: 'Available Potassium (K)', reagent: 'Sodium Cobaltinitrite', glow: 'purple', color: 'from-purple-500 to-pink-500' }
              ].map(item => (
                <Card3D
                  key={item.id}
                  glowColor={item.glow as any}
                  onClick={() => {
                    setParameter(item.id);
                    setStep(2);
                  }}
                  className={`p-6 flex flex-col justify-between ${
                    parameter === item.id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.id} Index</span>
                    <h4 className="text-2xl font-black text-slate-900">{item.label}</h4>
                    <p className="text-xs text-slate-500 font-medium">Reagent: {item.reagent}</p>
                  </div>
                  <button className="btn-3d-dark w-full py-3 text-xs font-black mt-6 flex items-center justify-center gap-2">
                    <span>Select & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Card3D>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: INCUBATION TIMER */}
        {step === 2 && (
          <Card3D glowColor="blue" className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
            <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">Stage 02 &bull; Reaction Incubator</span>
            <h3 className="text-3xl font-black text-slate-900">
              Allow Color Reaction to Stabilize ({parameter})
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
              Place chemical vial inside the light-sealed chamber. Wait for the 60-second kinetic reaction to complete before optical scanning.
            </p>

            <div className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight font-mono py-4">
              00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="btn-3d-emerald px-8 py-4 text-sm font-black flex items-center gap-2"
              >
                {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{timerRunning ? 'Pause' : 'Start 60s Timer'}</span>
              </button>

              <button
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(60);
                }}
                className="btn-3d-dark px-6 py-4 text-sm font-bold flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setStep(3)}
                className="text-xs font-black text-emerald-600 flex items-center gap-1 hover:underline"
              >
                <span>Skip to Optical Scan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card3D>
        )}

        {/* STEP 3: OPTICAL SENSOR SCAN */}
        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Live Sensor Telemetry */}
            <Card3D glowColor="emerald" className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Hardware Telemetry</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">TCS34725 Spectro-Reader</h3>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
              </div>

              {/* Channel Values */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                  <span className="text-xs font-black text-red-600">Red Channel</span>
                  <div className="text-2xl font-black text-red-900 mt-1">{simulatedChannels.r}</div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-black text-emerald-600">Green Channel</span>
                  <div className="text-2xl font-black text-emerald-900 mt-1">{simulatedChannels.g}</div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-xs font-black text-blue-600">Blue Channel</span>
                  <div className="text-2xl font-black text-blue-900 mt-1">{simulatedChannels.b}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                  <span className="text-xs font-black text-slate-600">Clear Intensity</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{simulatedChannels.c}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 flex justify-between">
                <span>Reaction Temperature:</span>
                <strong className="text-slate-900">27.5°C (DS18B20 1-Wire)</strong>
              </div>
            </Card3D>

            {/* Scan Action */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Execute Assay</span>
                <h3 className="text-3xl font-black text-slate-900">
                  Trigger High-Accuracy Scan
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  The ESP32 will pulse the onboard white LED (GPIO 16), read baseline ambient scatter, perform multi-sample averaging, and dispatch calibration telemetry to the local backend.
                </p>

                {isScanning && (
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between text-xs font-black text-emerald-600">
                      <span>Analyzing optical wavelength...</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  disabled={isScanning}
                  onClick={executeMeasurement}
                  className="btn-3d-emerald w-full py-5 text-base font-black flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Zap className="w-5 h-5" />
                  <span>{isScanning ? 'Processing Measurement...' : 'Capture & Analyze Sample'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 4: COMPLETED SUMMARY */}
        {step === 4 && (
          <Card3D glowColor="emerald" className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-3xl font-black text-slate-900">
              Measurement Successfully Processed!
            </h3>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block mb-1">
                Measured Parameter: {parameter}
              </span>
              <div className="text-4xl font-black text-emerald-700">
                pH 6.8 (Neutral)
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/report')}
                className="btn-3d-emerald px-8 py-4 text-sm font-black flex items-center justify-center gap-2"
              >
                <span>View Full Soil Health Card</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setTimerSeconds(60);
                }}
                className="btn-3d-dark px-6 py-4 text-sm font-bold"
              >
                Test Another Parameter
              </button>
            </div>
          </Card3D>
        )}

      </div>

      {/* PopUp Modal for Scan Result */}
      <PopUpModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="Sample Scan Completed"
        subtitle="Calibrated Optical Classification"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block mb-1">
              Result: {parameter}
            </span>
            <div className="text-4xl font-black text-emerald-700">
              {testResultSummary?.value_or_class || 'Optimal Neutral (pH 6.8)'}
            </div>
            <p className="text-xs font-medium text-slate-600 mt-2">
              Optical match confidence: 96.4% • Color Space: RGB Normalized
            </p>
          </div>

          <button
            onClick={() => {
              setShowResultModal(false);
              navigate('/report');
            }}
            className="btn-3d-emerald w-full py-4 text-sm font-black flex items-center justify-center gap-2"
          >
            <span>Proceed to Health Card</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </PopUpModal>

    </div>
  );
};
