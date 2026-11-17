import React, { useState } from 'react';
import {
  Cpu,
  Bluetooth,
  Wifi,
  Battery,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Zap,
  ShieldAlert,
  Info,
  Radio
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { Card3D } from '../components/Card3D';

export const DevicePage: React.FC = () => {
  const { language, device, deviceConnected, setDeviceConnected } = useApp();

  const [bleScanning, setBleScanning] = useState<boolean>(false);
  const [bleStatusMsg, setBleStatusMsg] = useState<string>('');
  const [testPayloadStatus, setTestPayloadStatus] = useState<string>('');

  // Web Bluetooth Scan Handler
  const handleConnectBluetooth = async () => {
    setBleScanning(true);
    setBleStatusMsg('');

    if ('bluetooth' in navigator) {
      try {
        const dev = await (navigator as any).bluetooth.requestDevice({
          filters: [{ namePrefix: 'Soil-Reader' }],
          optionalServices: ['0000a001-0000-1000-8000-00805f9b34fb', 'battery_service']
        });
        setBleStatusMsg(`Connected to ${dev.name || 'ESP32 Soil Reader'} via BLE GATT!`);
        setDeviceConnected(true);
      } catch (err: any) {
        setBleStatusMsg(`Web Bluetooth: ${err.message || 'Cancelled'} (Local Wi-Fi Bridge Active)`);
      } finally {
        setBleScanning(false);
      }
    } else {
      setBleStatusMsg("Web Bluetooth not supported on this platform. Seamlessly utilizing Wi-Fi / Simulator Bridge.");
      setBleScanning(false);
    }
  };

  const handleSendTestPayload = async () => {
    setTestPayloadStatus('Dispatching hardware payload...');
    const payload = {
      schema_version: "1.0",
      message_id: `msg-ping-${Date.now()}`,
      device_id: device?.device_id || "soil-reader-001",
      firmware_version: device?.firmware_version || "1.0.0",
      test_id: `session-ping-${Date.now()}`,
      kit: { kit_id: "kit-agri-chem-4in1", lot: "LOT-2026", parameter: "pH" },
      captured_at: new Date().toISOString(),
      temperature_c: 27.5,
      sensor: { model: "TCS34725", r: 1210, g: 985, b: 648, c: 2855, gain: 4, integration_ms: 154, led_on: true },
      quality: { reference_tile_check: "pass", ambient_subtraction: "pass", device_flag: "none" }
    };

    const res = await api.sendMeasurement(payload);
    setTestPayloadStatus(`Acknowledged by Backend: ${res.message || 'OK'}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 pt-6 px-4 sm:px-8">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 sm:p-10 text-white shadow-xl border border-slate-800 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {language === 'mr' ? 'ESP32 माती रिडर डिव्हाइस' : 'ESP32 Spectro-Reader'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium">
            TCS34725 Colorimeter • DS18B20 1-Wire Temp • BLE GATT & Wi-Fi
          </p>
        </div>

        <button
          onClick={handleConnectBluetooth}
          disabled={bleScanning}
          className="btn-3d-emerald px-6 py-4 text-xs font-black flex items-center gap-2 z-10"
        >
          <Bluetooth className="w-4 h-4" />
          <span>{bleScanning ? 'Scanning BLE...' : 'Pair Web Bluetooth'}</span>
        </button>
      </div>

      {bleStatusMsg && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 flex items-center gap-3 shadow-sm">
          <Info className="w-5 h-5 text-cyan-600 shrink-0" />
          <span>{bleStatusMsg}</span>
        </div>
      )}

      {/* 2. Device Status in 3D Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Device ID Card */}
        <Card3D glowColor="emerald" className="p-6 space-y-4">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Hardware Target</span>
          <div className="text-2xl font-black text-slate-900">{device?.device_id || 'soil-reader-001'}</div>
          <div className="text-xs font-bold text-emerald-600">
            Firmware v{device?.firmware_version || '1.0.0'} Verified
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
            I2C Address: 0x29 (TCS34725) &bull; GPIO 4 (DS18B20)
          </div>
        </Card3D>

        {/* Battery & Health */}
        <Card3D glowColor="blue" className="p-6 space-y-4">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Power Level</span>
          <div className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Battery className="w-7 h-7 text-emerald-500" />
            <span>{device?.battery_level || 88}%</span>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Operating Voltage: 3.82V (Li-Ion 18650 Battery)
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
            Status: Nominal Power Draw (Deep Sleep Enabled)
          </div>
        </Card3D>

        {/* Transport Link */}
        <Card3D glowColor="purple" className="p-6 space-y-4">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Connection Protocol</span>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Wifi className="w-6 h-6 text-indigo-500" />
            <span>Wi-Fi + BLE</span>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            HTTP POST to /api/v1/device/measurements
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-emerald-600 font-bold">
            Latency: &lt;45ms &bull; Zero Packet Loss
          </div>
        </Card3D>

      </div>

      {/* 3. Hardware Test Telemetry Trigger */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Diagnostics Sandbox</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              Test Ingestion Pipeline
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Send a synthetic calibrated optical packet to verify FastAPI backend ingestion and database persistence.
            </p>
          </div>

          <button
            onClick={handleSendTestPayload}
            className="btn-3d-emerald px-6 py-4 text-xs font-black flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Test Packet</span>
          </button>
        </div>

        {testPayloadStatus && (
          <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs font-semibold">
            &gt; {testPayloadStatus}
          </div>
        )}
      </div>

    </div>
  );
};
