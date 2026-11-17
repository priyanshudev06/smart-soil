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
  Info
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';

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
        // Request custom Soil Reader GATT service
        const dev = await (navigator as any).bluetooth.requestDevice({
          filters: [{ namePrefix: 'Soil-Reader' }],
          optionalServices: ['0000a001-0000-1000-8000-00805f9b34fb', 'battery_service']
        });
        setBleStatusMsg(`Connected to ${dev.name || 'ESP32 Soil Reader'} via BLE GATT!`);
        setDeviceConnected(true);
      } catch (err: any) {
        setBleStatusMsg(`Web Bluetooth: ${err.message || 'User cancelled pairing.'} (Switched to Simulator/Wi-Fi mode)`);
      } finally {
        setBleScanning(false);
      }
    } else {
      setBleStatusMsg("Web Bluetooth API is not available on this browser/OS. Using local Wi-Fi / Simulator Bridge.");
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-4 px-4">
      {/* Header */}
      <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5" />
            Hardware Diagnostics & Bridge
          </div>
          <h1 className="text-2xl font-black text-[#1B1B1B]">
            {language === 'mr' ? 'ESP32 माती रिडर डिव्हाइस' : 'ESP32 Spectro-Reader Device'}
          </h1>
          <p className="text-xs text-muted mt-1">
            TCS34725 RGB Sensor • DS18B20 Temp Probe • BLE GATT / Wi-Fi Transport
          </p>
        </div>

        <button
          onClick={handleConnectBluetooth}
          disabled={bleScanning}
          className="bg-[#181818] hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-float disabled:opacity-50"
        >
          <Bluetooth className="w-4 h-4 text-emerald-400" />
          <span>{bleScanning ? 'Scanning BLE...' : 'Pair Web Bluetooth'}</span>
        </button>
      </div>

      {bleStatusMsg && (
        <div className="p-3 bg-white border border-[#D9D7D0] rounded-2xl text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{bleStatusMsg}</span>
        </div>
      )}

      {/* Device Specifications Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#D9D7D0] rounded-2xl p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Device Identity</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {deviceConnected ? 'Operational' : 'Disconnected'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Device ID:</span>
              <strong className="font-mono text-[#1B1B1B]">{device?.device_id || 'soil-reader-001'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Model:</span>
              <strong className="text-[#1B1B1B]">{device?.model}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Firmware Version:</span>
              <strong className="text-[#1B1B1B]">v{device?.firmware_version}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Assigned Operator:</span>
              <strong className="text-[#1B1B1B]">{device?.assigned_operator}</strong>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#D9D7D0] rounded-2xl p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Optical Peripherals</span>
            <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
              <Battery className="w-4 h-4" />
              <span>{device?.battery_level || 94}% Battery</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Color Sensor:</span>
              <strong className="text-[#1B1B1B]">TCS34725 (I2C 0x29)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Chamber Temp:</span>
              <strong className="text-[#1B1B1B]">DS18B20 1-Wire (GPIO 4)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Illumination:</span>
              <strong className="text-emerald-700">Internal White LED (Controlled)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Reference Check:</span>
              <strong className="text-emerald-700">White Tile Standard Passed</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Test Packet Verification Tool */}
      <div className="bg-[#F0EFEB] border border-[#D9D7D0] rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B]">Developer Diagnostic Payload Test</h2>
          <p className="text-xs text-muted">
            Send an end-to-end optical reading packet to `/api/v1/device/measurements` to verify database persistence and calibration calculation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendTestPayload}
            className="bg-[#181818] hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>Send Test Optical Packet</span>
          </button>
          {testPayloadStatus && (
            <span className="text-xs font-semibold text-emerald-800">{testPayloadStatus}</span>
          )}
        </div>
      </div>

      {/* Browser Limitation Notice (PRD Section 6.1) */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Browser BLE Compatibility Note:</strong> Web Bluetooth is primarily supported on Chromium browsers on Android and desktop over HTTPS or localhost. If testing on unsupported browsers (like iOS Safari), use Wi-Fi ingestion or the manual entry mode.
        </div>
      </div>
    </div>
  );
};
