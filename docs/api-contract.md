# REST API Contract Specification

**API Version**: v1  
**Protocol**: HTTPS  
**Content-Type**: `application/json`

---

## 1. Authentication & Security

- All authenticated endpoints require `Authorization: Bearer <JWT_TOKEN>`.
- Tenant / Farmer ownership checks are enforced server-side.
- Rate limiting and idempotent request IDs are standard.

---

## 2. Starter Endpoints

### 2.1 Device Ingestion

#### `POST /api/v1/device/measurements`
Receives raw optical sensor readings from the hardware or bridge app. Idempotent based on `message_id`.

- **Request Body**:
  ```json
  {
    "schema_version": "1.0",
    "message_id": "uuid-v4",
    "device_id": "soil-reader-001",
    "test_id": "test-session-uuid",
    "kit": {
      "kit_id": "kit-brand-model",
      "lot": "lot-2026",
      "parameter": "pH"
    },
    "captured_at": "2026-11-17T09:30:00Z",
    "temperature_c": 27.5,
    "sensor": {
      "model": "TCS34725",
      "r": 1200, "g": 980, "b": 650, "c": 2850,
      "gain": 4, "integration_ms": 154, "led_on": true
    },
    "repeat_readings": [
      {"r": 1198, "g": 981, "b": 652, "c": 2848}
    ],
    "quality": {
      "reference_tile_check": "pass",
      "ambient_subtraction": "pass",
      "device_flag": "none"
    },
    "calibration_version": "ph-kit-x-device-cal-0.3"
  }
  ```
- **Responses**:
  - `201 Created`: Successfully ingested and queued for calibration.
  - `200 OK`: Duplicate `message_id` acknowledged (idempotent no-op).
  - `422 Unprocessable Entity`: Schema mismatch or invalid checksum.

---

### 2.2 Tests & Soil Reports

#### `POST /api/v1/tests`
Initializes a new test session before reading is taken.
- **Request**:
  ```json
  {
    "plot_id": "plot-uuid",
    "device_id": "soil-reader-001",
    "kit_id": "kit-brand-model",
    "parameter": "pH"
  }
  ```
- **Response**: `201 Created` with `test_id` and guided timer intervals.

#### `GET /api/v1/tests/{test_id}`
Retrieves test session status, raw optical counts, and calibrated results.
- **Response**:
  ```json
  {
    "test_id": "test-session-uuid",
    "status": "COMPLETED",
    "raw_measurement_id": "uuid-v4",
    "result": {
      "parameter": "pH",
      "value_or_class": "6.5",
      "unit": "pH",
      "interval": "[6.2 - 6.8]",
      "provenance": "Estimated",
      "calibration_version": "ph-kit-x-device-cal-0.3",
      "validation_status": "indicative_only",
      "quality_flags": []
    }
  }
  ```

#### `GET /api/v1/plots/{plot_id}/tests`
Lists chronological historical test sessions for a plot.

#### `GET /api/v1/plots/{plot_id}/soil-summary`
Returns the consolidated soil profile for a plot (combining latest compatible pH, N, P, K tests).

---

### 2.3 Agronomic Guidance & Decision Support

#### `POST /api/v1/recommendations/crops`
Calculates ranked crop suitability scores based on plot soil profile, season, water source, and district.
- **Rule**: Explains factors deterministically. Uses vetted ICAR/KVK references. Labels results as *"often suitable, not guaranteed"*.

#### `POST /api/v1/calculators/profit`
Calculates estimated cost, yield, revenue, break-even point, and profit ranges from farmer inputs and dated mandi prices.

---

### 2.4 External Data & Offline Sync

#### `GET /api/v1/markets/prices?district=Pune&commodity=Soybean`
Returns verified mandi prices with commodity, market name, min/max/modal price, date, and source. Flags stale prices.

#### `GET /api/v1/weather/forecast?lat=18.5204&lon=73.8567`
Returns 5-day weather forecast with issue timestamp and provenance.

#### `POST /api/v1/assistant/query`
Curated RAG assistant query. Grounds responses exclusively in Soil Health Card guidance and vetted agronomic documents.

#### `POST /api/v1/sync/batch`
Synchronizes offline queued test sessions and measurements when connectivity returns.
