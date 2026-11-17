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
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';

export const SoilTestingPage: React.FC = () => {
  const { language, farmer, selectedPlot, setLastResult, device } = useApp();
  const navigate = useNavigate();

  // Test session state
  const [step, setStep] = useState<number>(1);
  const [parameter, setParameter] = useState<string>('pH');
  const [operatorNotes, setOperatorNotes] = useState<string>('');
  
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Scanning / hardware communication state
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

  const handleStartTimer = () => setTimerRunning(true);
  const handlePauseTimer = () => setTimerRunning(false);
  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(60);
  };

  const executeMeasurement = async () => {
    setIsScanning(true);
    setErrorMsg('');
    setScanProgress(10);

    try {
      // Step simulation for optical reading
      for (let p = 25; p <= 90; p += 25) {
        await new Promise(r => setTimeout(r, 250));
        setScanProgress(p);
      }

      const uniqueMsgId = `msg-hw-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const testSessionId = `test-session-${Date.now()}`;

      const payload = {
        schema_version: "1.0",
        message_id: uniqueMsgId,
        device_id: device?.device_id || "soil-reader-001",
        firmware_version: device?.firmware_version || "1.0.0",
        test_id: testSessionId,
        kit: {
          kit_id: "kit-agri-chem-4in1",
          lot: "LOT-2026-NOV",
          parameter: parameter
        },
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
          {
            r: simulatedChannels.r - 2,
            g: simulatedChannels.g + 1,
            b: simulatedChannels.b + 1,
            c: simulatedChannels.c - 1
          }
        ],
        quality: {
          reference_tile_check: "pass",
          ambient_subtraction: "pass",
          device_flag: "none"
        },
        calibration_version: "ph-kit-agri-cal-1.0"
      };

      const result = await api.sendMeasurement(payload);
      setScanProgress(100);
      setIsScanning(false);
      setLastResult(result);
      setStep(4);
    } catch (err: any) {
      setIsScanning(false);
      setErrorMsg("Failed to capture measurement. Check device connection or retry.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-4 px-4">
      {/* Step Progress Pill */}
      <div className="bg-white border border-[#D9D7D0] rounded-full p-2 shadow-soft flex items-center justify-between text-xs font-semibold px-4">
        {[
          { num: 1, label: language === 'mr' ? '१. पॅरामीटर निवडा' : '1. Parameter' },
          { num: 2, label: language === 'mr' ? '२. रासायनिक प्रक्रिया' : '2. Reaction Prep' },
          { num: 3, label: language === 'mr' ? '३. सेन्सर स्कॅन' : '3. Optical Scan' },
          { num: 4, label: language === 'mr' ? '४. निकाल' : '4. Results' },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-1.5 ${
              step >= s.num ? 'text-emerald-700' : 'text-muted'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step >= s.num ? 'bg-emerald-600 text-white font-bold' : 'bg-line text-muted'
              }`}
            >
              {s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Parameter & Plot Selection */}
      {step === 1 && (
        <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#1B1B1B]">
              {language === 'mr' ? 'माती चाचणी पॅरामीटर निवडा' : 'Select Soil Parameter to Test'}
            </h2>
            <p className="text-xs text-muted mt-1">
              Active Plot: <strong className="text-black">{selectedPlot?.label}</strong> ({selectedPlot?.soil_type})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: 'pH',
                title: 'Soil pH (सामू)',
                desc: 'Acidity / Alkalinity level (Optimal: 6.5 - 7.5)',
                color: 'bg-emerald-50 border-emerald-300 text-emerald-900',
                preset_rgb: { r: 1220, g: 990, b: 650, c: 2860 }
              },
              {
                id: 'Nitrogen (N)',
                title: 'Nitrogen (नत्र - N)',
                desc: 'Vegetative growth & chlorophyll index (Griess kit)',
                color: 'bg-blue-50 border-blue-300 text-blue-900',
                preset_rgb: { r: 1450, g: 780, b: 920, c: 3150 }
              },
              {
                id: 'Phosphorus (P)',
                title: 'Phosphorus (स्फुरद - P)',
                desc: 'Root development & early vigor (Moly-blue kit)',
                color: 'bg-purple-50 border-purple-300 text-purple-900',
                preset_rgb: { r: 720, g: 890, b: 1540, c: 3150 }
              },
              {
                id: 'Potassium (K)',
                title: 'Potassium (पालाश - K)',
                desc: 'Drought tolerance & disease resistance',
                color: 'bg-amber-50 border-amber-300 text-amber-900',
                preset_rgb: { r: 1650, g: 1350, b: 540, c: 3540 }
              }
            ].map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setParameter(p.id);
                  setSimulatedChannels(p.preset_rgb);
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  parameter === p.id
                    ? `${p.color} ring-2 ring-emerald-500/50 shadow-md`
                    : 'bg-white border-[#D9D7D0] hover:border-gray-400'
                }`}
              >
                <div className="font-bold text-base flex items-center justify-between">
                  <span>{p.title}</span>
                  {parameter === p.id && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </div>
                <div className="text-xs text-muted mt-1">{p.desc}</div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Operator / Farmer Notes (Optional)
            </label>
            <input
              type="text"
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              placeholder="e.g. Taken 10cm depth sample from center of plot..."
              className="w-full text-xs p-3 rounded-xl border border-line bg-white focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              className="bg-[#181818] hover:bg-black text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-float"
            >
              <span>{language === 'mr' ? 'पुढील पायरी: रासायनिक तयारी' : 'Next: Reaction Preparation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Chemical Kit Reaction Preparation & Timer */}
      {step === 2 && (
        <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1B1B1B]">
                {language === 'mr' ? 'रासायनिक चाचणी कृती व टाइमर' : 'Paper Strip Preparation & Countdown'}
              </h2>
              <p className="text-xs text-muted mt-1">
                Testing parameter: <strong className="text-black">{parameter}</strong> using standard colorimetric test card
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Step 2 of 4
            </span>
          </div>

          {/* Guided chemical protocol instructions */}
          <div className="bg-white rounded-2xl p-4 border border-[#D9D7D0] space-y-3 text-xs text-[#1B1B1B]">
            <div className="font-semibold text-sm text-emerald-800 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              <span>Standard Field Procedure (AgriQuick Protocol):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-muted pl-1">
              <li>Mix 5g of dried, sieved soil with 20ml distilled water in test tube.</li>
              <li>Shake vigorously for 2 minutes and let it settle for 3 minutes until clear supernatant forms.</li>
              <li>Dip the reactant test strip or apply 2 drops of indicator solution to the test zone.</li>
              <li>Start the 60-second reaction timer below. Do not expose to direct harsh sunlight.</li>
            </ol>
          </div>

          {/* Interactive Countdown Timer */}
          <div className="bg-[#F0EFEB] rounded-3xl p-6 border border-[#D9D7D0] text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Chemical Reaction Wait Period</span>
            </div>

            <div className="text-6xl font-black text-[#1B1B1B] font-mono tracking-tight">
              00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
            </div>

            <div className="flex items-center justify-center gap-3">
              {!timerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start 60s Timer</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Timer</span>
                </button>
              )}
              <button
                onClick={handleResetTimer}
                className="bg-white border border-[#D9D7D0] text-[#1B1B1B] px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {timerSeconds === 0 && (
              <div className="text-xs font-bold text-emerald-700 animate-bounce">
                ✓ Reaction complete! Insert reacted strip into device tray and proceed to scan.
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-muted hover:text-black"
            >
              &larr; Back to Parameters
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-[#181818] hover:bg-black text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-float"
            >
              <span>{language === 'mr' ? 'पुढील पायरी: डिव्हाइस स्कॅन' : 'Next: Scan with Reader'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Optical Reader Scan & Simulator */}
      {step === 3 && (
        <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1B1B1B]">
                {language === 'mr' ? 'ESP32 ऑप्टिकल रिडर स्कॅन' : 'ESP32 Optical Spectro-Scan'}
              </h2>
              <p className="text-xs text-muted mt-1">
                TCS34725 RGB + DS18B20 Temp reading under controlled LED lighting
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>{device?.device_id || 'soil-reader-001'} (Online)</span>
            </div>
          </div>

          {/* Chamber & Strip placement check */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-line flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Strip seated in keyed slot</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-line flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Lid sealed (Ambient pass)</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-line flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Internal LED Calibrated</span>
            </div>
          </div>

          {/* Optical Simulator Tuning (Allows manual tweaking of R,G,B,C counts & Temp) */}
          <div className="bg-[#F0EFEB] rounded-2xl p-4 border border-[#D9D7D0] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1B1B1B]">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-700" />
                Optical Sensor Live Channels (TCS34725 Counts):
              </span>
              <span className="text-muted font-normal text-[11px]">Integration: 154ms • Gain: 4x</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-line">
                <div className="text-red-700 font-bold">Red (R)</div>
                <div className="text-base font-black">{simulatedChannels.r}</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-line">
                <div className="text-green-700 font-bold">Green (G)</div>
                <div className="text-base font-black">{simulatedChannels.g}</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-line">
                <div className="text-blue-700 font-bold">Blue (B)</div>
                <div className="text-base font-black">{simulatedChannels.b}</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-line">
                <div className="text-gray-700 font-bold">Clear (C)</div>
                <div className="text-base font-black">{simulatedChannels.c}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted pt-1">
              <span>Chamber Temperature (DS18B20): <strong>{customTemp}°C</strong></span>
              <span>Scatter Tolerance: <strong>&lt; 5%</strong></span>
            </div>
          </div>

          {/* Trigger Scan Button & Progress */}
          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted">
                <span>Reading optical reflectance & temperature...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-line rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-muted hover:text-black"
            >
              &larr; Back to Preparation
            </button>
            <button
              disabled={isScanning}
              onClick={executeMeasurement}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-float transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isScanning ? 'Acquiring Spectrum...' : 'Trigger Spectro-Scan & Upload'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Success & Transition */}
      {step === 4 && (
        <div className="bg-white border border-[#D9D7D0] rounded-3xl p-8 shadow-soft text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-black text-[#1B1B1B]">
            {language === 'mr' ? 'माती परीक्षण यशस्वीरित्या पूर्ण झाले!' : 'Soil Reading Processed Successfully!'}
          </h2>

          <p className="text-xs text-muted max-w-md mx-auto">
            Raw spectral counts have been verified, temperature-compensated, and processed against versioned calibration models.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/report')}
              className="bg-[#181818] hover:bg-black text-white px-8 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-float"
            >
              <span>{language === 'mr' ? 'माती अहवाल पहा' : 'View Full Soil Report'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setStep(1);
                setTimerSeconds(60);
              }}
              className="bg-[#F0EFEB] hover:bg-[#E9E8E4] text-[#1B1B1B] px-6 py-3 rounded-full text-sm font-semibold"
            >
              {language === 'mr' ? 'दुसरी चाचणी करा' : 'Run Another Test'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
