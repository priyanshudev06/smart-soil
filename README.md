# Smart Soil Health & Farming Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status: Prototype Design](https://img.shields.io/badge/Status-Prototype%20Planning-blue.svg)](#)

A farmer-facing digital platform and IoT colorimetric reader system that converts paper-based soil test kit reactions into understandable, provenance-tracked soil health reports and practical agricultural decision support.

---

## 1. Problem Statement

Smallholder farmers often lack access to timely, affordable soil testing. Centralized laboratory testing under programs like the Soil Health Card can take weeks or months to return results, while commercial rapid chemical test kits require manual visual color matching that is subjective, prone to lighting errors, and rarely coupled with actionable, location-specific agronomic advice.

The **Smart Soil Health & Farming Assistant** bridges this gap:
1. **Objective Colorimetry**: Utilizes an enclosed optical reader (ESP32 + TCS34725 sensor) to measure reflected light from reacted paper test strips under controlled illumination.
2. **Provenance & Scientific Integrity**: Tracks raw sensor counts, device calibration versions, ambient subtraction, and uncertainty—strictly reporting screening nutrient classes (Low / Medium / High) rather than unvalidated laboratory claims.
3. **Actionable Farm Advisory**: Connects soil results with localized crop suitability, soil health improvement methods, weather forecasts, and mandi price transparency.
4. **Accessible Experience**: Designed offline-first for low-connectivity rural environments, featuring multilingual audio assistance and clear visual indicators.

---

## 2. Proposed Technology Stack

### Frontend Application
- **Framework**: React 18+ with TypeScript
- **Bundler & Tooling**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Offline & Persistence**: IndexedDB (idb/Dexie) + Service Workers (PWA)
- **Device Connectivity**: Web Bluetooth API (Chromium / Android Chrome) with manual/Wi-Fi fallbacks

### Backend Services
- **Runtime & Framework**: Python 3.11+ / FastAPI
- **Data Validation**: Pydantic v2
- **ORM & Database**: SQLAlchemy 2.0 with SQLite (local development prototype, structured for PostgreSQL migration)
- **Task Execution**: FastAPI BackgroundTasks
- **Config & Security**: `python-dotenv`, JWT token verification, salted hashes

### Hardware & IoT Integration
- **Microcontroller**: ESP32 (Bluetooth Low Energy GATT & Wi-Fi support)
- **Optical Sensor**: TCS34725 RGB + Clear light sensor with IR blocking filter
- **Temperature Sensor**: DS18B20 digital temperature probe
- **Communication Protocol**: BLE Custom GATT Service with JSON-formatted measurement payloads

---

## 3. Repository Structure

```text
smart-soil-health/
│
├── frontend/                     # React + Vite + TypeScript PWA
│   ├── public/                   # Static assets, icons, manifest
│   ├── src/
│   │   ├── assets/               # Images, SVG illustrations
│   │   ├── components/           # Reusable atomic UI components
│   │   ├── layouts/              # App shells, navigation bars
│   │   ├── pages/                # Route entry views
│   │   ├── features/             # Domain modules
│   │   │   ├── authentication/   # Login, onboarding, consent
│   │   │   ├── dashboard/        # Farmer overview & summary cards
│   │   │   ├── farms/            # Farm & plot management
│   │   │   ├── soil-testing/     # Guided test workflow & timer
│   │   │   ├── device-connection/# BLE scanner, status, calibration
│   │   │   ├── soil-reports/     # Reports, provenance, PDF export
│   │   │   ├── crop-recommendations/ # Suitability matrix
│   │   │   ├── soil-improvement/ # Organic & chemical soil care
│   │   │   ├── weather/          # Sourced weather forecasts
│   │   │   ├── market-prices/    # Mandi price tracking
│   │   │   └── ai-assistant/     # Multilingual voice/chat support
│   │   ├── services/             # API client, BLE adapter, offline sync
│   │   ├── hooks/                # Custom React hooks
│   │   ├── contexts/             # Global states (Auth, Sync, Device)
│   │   ├── types/                # TypeScript interface definitions
│   │   └── utils/                # Formatters, math, color calculations
│   ├── .env.example
│   └── README.md
│
├── backend/                      # Python FastAPI REST API
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/               # Versioned REST endpoints
│   │   ├── core/                 # App configuration, security, auth
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic input/output schemas
│   │   ├── services/             # Core business & processing logic
│   │   │   ├── device_ingestion/ # Device payload parsing & validation
│   │   │   ├── calibration/      # Versioned calibration curves
│   │   │   ├── soil_analysis/    # pH and nutrient classification
│   │   │   ├── recommendations/  # Deterministic agronomic rules
│   │   │   ├── external_data/    # Weather & mandi market adapters
│   │   │   └── ai_assistant/     # Curated RAG explanation service
│   │   ├── database/             # Engine, session, migrations
│   │   └── utils/                # Logging, date helpers, converters
│   ├── tests/                    # Unit, integration, and API tests
│   ├── .env.example
│   └── requirements.txt
│
├── firmware/                     # ESP32 firmware source code
│   └── esp32/
│
├── docs/                         # Engineering documentation & contracts
│   ├── PRD/                      # Original Product Requirements Document
│   ├── device-protocol.md        # BLE GATT & JSON payload specification
│   ├── api-contract.md           # Backend REST API specification
│   └── calibration-protocol.md   # Optical sensor calibration & quality checks
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 4. Hardware Overview & Optical Sensing Architecture

```text
+-------------------------------------------------------+
|                 ENCLOSED TEST CHAMBER                 |
|                                                       |
|  [Controlled LED] ----> [Reacted Test Strip/Card]     |
|                                  |                    |
|                         [Reflected Light]             |
|                                  v                    |
|                           [TCS34725 RGB]              |
|                         + [DS18B20 Temp]              |
+-------------------------------------------------------+
                           |  I2C / 1-Wire
                           v
                +----------------------+
                |    ESP32 Firmware    |
                +----------------------+
                           |
            +--------------+--------------+
            | (Primary)                   | (Fallback)
         BLE GATT                      Local Wi-Fi
            v                             v
+------------------------+      +------------------------+
| Android Chrome PWA     |      | FastAPI Backend API    |
| (Web Bluetooth Bridge) |      | (Direct Ingestion)     |
+------------------------+      +------------------------+
            |                             |
            +------------ HTTPS ----------+
```

### Safety and Scientific Validity Rules
1. **Indicative Screening Only**: Sensor values reflect chemical colorimetric paper reactions under controlled lighting; they do **not** replace accredited laboratory Soil Health Card determinations.
2. **Nutrient Classification**: Nitrogen (N), Phosphorus (P), and Potassium (K) outputs are reported as ordered qualitative classes (e.g., *Low*, *Medium*, *High*), not quantitative concentration values, until formal held-out validation is completed.
3. **No Autonomous Fertilizer Dosing**: The system strictly prohibits automated fertilizer dosage calculations from uncalibrated test strips.
4. **Data Provenance**: Every metric displayed in the UI is badged with its origin:
   - `Measured` (raw optical reading)
   - `Estimated` (calibrated kit output)
   - `Retrieved` (verified external agricultural source)
   - `Generated` (AI explanation of vetted results)

---

## 5. Development Roadmap & Setup Instructions

*Note: Initial setup and requirements analysis are currently underway. Full development instructions will be added as implementation phases commence.*

- **Phase 1**: Project Documentation, PRD Analysis & Architectural Planning *(Active)*
- **Phase 2**: Monorepo Foundation & Protocol Contracts *(Active)*
- **Phase 3**: Backend Architecture & SQLite Database Setup *(Pending approval)*
- **Phase 4**: Frontend Foundation, Routing & Offline Storage *(Pending approval)*
- **Phase 5**: Device Ingestion & Calibration Pipeline *(Pending approval)*
- **Phase 6**: Agronomic Rules, External Data & RAG Assistant *(Pending approval)*

---

## 6. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
