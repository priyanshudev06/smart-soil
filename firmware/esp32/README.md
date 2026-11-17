# ESP32 Soil Reader Firmware

This directory is designated for the ESP32 microcontroller firmware source code (Arduino / ESP-IDF / PlatformIO).

## Expected Components

1. **Optical Acquisition**:
   - I2C driver for **TCS34725** RGB + Clear optical color sensor.
   - Internal controlled LED pulse and integration timing (154ms default).
   - Stray light check (LED off vs LED on).
   - Repeat optical reads (2–3 samples) for stability verification.
2. **Temperature Sensing**:
   - 1-Wire driver for **DS18B20** digital temperature probe.
3. **Data Communication**:
   - **Primary**: Bluetooth Low Energy (BLE) GATT server emitting JSON measurement payloads.
   - **Secondary/Fallback**: Wi-Fi client posting HTTPS requests directly to `/api/v1/device/measurements`.
4. **State Machine & Indication**:
   - Device status notifications (`IDLE`, `MEASURING`, `READY`, `ERROR`).
   - Command acknowledgement handling (`ACK_PAYLOAD`).
