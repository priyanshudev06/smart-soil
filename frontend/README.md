# Smart Soil Health - Frontend Application

A mobile-first, offline-ready Progressive Web App (PWA) built with React, TypeScript, Vite, and Tailwind CSS.

## Architecture & Directory Structure

```text
src/
├── assets/                 # Static illustrations, logos, icons
├── components/             # Reusable UI primitives (Buttons, Modals, Cards, Badges)
├── layouts/                # Base layouts (App Shell, Bottom Navigation, Header)
├── pages/                  # Route view components
├── features/               # Modular business domains
│   ├── authentication/     # Farmer login, OTP, and consent flows
│   ├── dashboard/          # Metric cards, recent activity, quick actions
│   ├── farms/              # Farm and plot registration & management
│   ├── soil-testing/       # Step-by-step paper kit guidance and session timer
│   ├── device-connection/  # Web Bluetooth scanner, pairing, and connection status
│   ├── soil-reports/       # Provenance-rich test results, trend charts, PDF generator
│   ├── crop-recommendations/# Crop suitability score and comparison matrix
│   ├── soil-improvement/   # Organic/chemical soil advisory with caution notices
│   ├── weather/            # Sourced local forecast and farm alerts
│   ├── market-prices/      # Mandi market prices and profit calculator
│   └── ai-assistant/       # Audio/text conversational assistant
├── services/               # API clients, Web Bluetooth adapter, IndexedDB sync
├── hooks/                  # Custom React hooks (useBluetooth, useOfflineSync, useAudio)
├── contexts/               # React Context providers (AuthContext, DeviceContext)
├── types/                  # Shared TypeScript models and payload definitions
└── utils/                  # Colorimetry helpers, date formatters, validators
```

## Key Guidelines

1. **Accessibility**: High-contrast controls, large touch targets, multilingual text (Marathi, Hindi, English), and icon + text pairing.
2. **Offline-First**: IndexedDB caches farmer plots and test history. Queued test readings sync idempotently with the backend.
3. **Hardware Connectivity**: Web Bluetooth API for Android Chrome, paired with a reliable manual-entry fallback.
4. **No Premature Implementation**: Components and pages will be authored only after PRD confirmation and architectural alignment.
