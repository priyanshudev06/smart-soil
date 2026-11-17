# Device Communication Protocol Specification

**Status**: Proposal based on PRD Section 6  
**Hardware Target**: ESP32 + TCS34725 RGB Sensor + DS18B20 Temperature Sensor  
**Primary Transport**: Bluetooth Low Energy (BLE GATT)  
**Fallback Transport**: Wi-Fi (HTTPS POST)

---

## 1. Hardware Architecture

- **ESP32 Microcontroller**: Acts as the reader controller, I2C master for the TCS34725, and 1-Wire master for the DS18B20.
- **TCS34725 RGB + Clear Light Sensor**:
  - Controlled internal LED illumination.
  - Channels: Red (R), Green (G), Blue (B), Clear (C).
  - Integration time: 154ms default (configurable).
  - Gain: 4x default (configurable: 1x, 4x, 16x, 60x).
- **DS18B20 Temperature Probe**:
  - Measures test chamber temperature in Celsius.
  - Temperature compensation is critical for biochemical strip reaction kinetics.
- **Optical Chamber**: Keyed tray holding paper strip, controlled LED lighting, reference white/dark tiles for drift compensation.

---

## 2. BLE GATT Design

The device exposes one primary Custom BLE GATT Service.

### Service UUID
- **Soil Reader Service**: `0000A001-0000-1000-8000-00805F9B34FB` *(suggested standard custom UUID)*

### Characteristics

| Characteristic | UUID | Properties | Description |
|---|---|---|---|
| **Device Info** | `0000A002-0000-1000-8000-00805F9B34FB` | Read | Device serial number, hardware model, firmware version. |
| **Status / State** | `0000A003-0000-1000-8000-00805F9B34FB` | Notify, Read | Current state: `IDLE`, `MEASURING`, `READY`, `ERROR`. |
| **Measurement Payload** | `0000A004-0000-1000-8000-00805F9B34FB` | Notify, Read | Transmits JSON measurement packet (chunked MTU or compact). |
| **Command / Control** | `0000A005-0000-1000-8000-00805F9B34FB` | Write | Commands: `START_SCAN`, `TARE_CALIBRATION`, `ACK_PAYLOAD`. |
| **Battery Level** *(Optional)* | `00002A19-0000-1000-8000-00805F9B34FB` | Read, Notify | Standard BLE Battery Service (0–100%). |

---

## 3. Measurement Payload Specification

The measurement payload is emitted as a structured JSON object:

```json
{
  "schema_version": "1.0",
  "message_id": "urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  "device_id": "soil-reader-001",
  "firmware_version": "0.1.0",
  "test_id": "app-session-uuid-12345",
  "kit": {
    "kit_id": "kit-brand-model",
    "lot": "lot-2026-A",
    "parameter": "pH"
  },
  "captured_at": "2026-11-17T09:30:00Z",
  "temperature_c": 27.5,
  "sensor": {
    "model": "TCS34725",
    "r": 1200,
    "g": 980,
    "b": 650,
    "c": 2850,
    "gain": 4,
    "integration_ms": 154,
    "led_on": true
  },
  "repeat_readings": [
    {"r": 1198, "g": 981, "b": 652, "c": 2848},
    {"r": 1202, "g": 979, "b": 648, "c": 2851}
  ],
  "quality": {
    "reference_tile_check": "pass",
    "ambient_subtraction": "pass",
    "device_flag": "none"
  },
  "calibration_version": "ph-kit-x-device-cal-0.3"
}
```

### Payload Fields Definition

- `schema_version`: Version of the payload schema (`"1.0"`).
- `message_id`: Unique UUID generated per reading for backend deduplication and idempotency.
- `device_id`: Hardware identifier assigned to the reader.
- `temperature_c`: Ambient chamber temperature recorded during scan.
- `sensor`: Raw counts from TCS34725 (Red, Green, Blue, Clear).
- `repeat_readings`: Minimum 2–3 consecutive readings taken to check optical stability and scatter.
- `quality`: Hardware self-check results (reference tile drift, stray ambient light leakage).

---

## 4. Connection & Acknowledgement Workflow

1. **User Discovery**: Web application initiates `navigator.bluetooth.requestDevice` with filter on `Soil Reader Service`.
2. **Pairing & Session Start**: Web app connects GATT server, writes `START_SCAN` command with `test_id` and target `parameter`.
3. **Execution**: ESP32 turns on internal LED, takes repeat readings, samples temperature, validates optical reference tile.
4. **Data Transmission**: Payload transmitted across BLE notification chunks.
5. **App ACK**: Web app validates JSON schema, caches in local IndexedDB, and transmits `ACK` characteristic write with `message_id`.
6. **Backend Ingestion**: Web app sends payload via `POST /api/v1/device/measurements`.
