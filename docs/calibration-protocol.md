# Optical Sensor Calibration & Quality Protocol

**Target Sensor**: TCS34725 RGB + Clear Light Sensor  
**Target Chemistry**: Commercial Paper-Based Colorimetric Soil Test Kits (pH, N, P, K)

---

## 1. Principles of Optical Measurement

The TCS34725 does **not** directly measure chemical ion concentrations. Instead, it measures reflected light across four spectral channels:
- **Red (R)**: ~615 nm
- **Green (G)**: ~525 nm
- **Blue (B)**: ~465 nm
- **Clear (C)**: Broad spectrum (unfiltered)

Reflectance is converted into color coordinates (normalized RGB, CIE xyY, or HSV) and compared against an empirical calibration model derived from reference color charts and verified laboratory samples.

---

## 2. Calibration Model Registry & Versioning

1. **Kit-Specific Models**: Every commercial kit has distinct dye chemistry (e.g., Bromothymol Blue for pH, Griess reagent for Nitrate-N). A single universal calibration curve is **strictly prohibited**.
2. **Versioning Format**: `kit-{brand}-{parameter}-cal-{version}` (e.g., `kit-agri1-ph-cal-1.0`).
3. **Approval Status**:
   - `DRAFT`: Laboratory data collection in progress.
   - `APPROVED`: Passed held-out cross-validation against laboratory benchmarks.
   - `DEPRECATED`: Replaced by a refined calibration model.

---

## 3. Data Integrity & Quality Checks

Before computing any estimated pH or nutrient class, the backend runs validation checks:

| Check | Failure Condition | Quality Flag | Action |
|---|---|---|---|
| **Stray Light Check** | LED-off clear channel count exceeds threshold | `high_ambient_light` | Reject; prompt user to close chamber lid securely. |
| **Scatter Check** | Variance across repeat readings > 5% | `optical_scatter_high` | Warn user; suggest re-seating the strip and re-testing. |
| **Gamut / Range Check** | Color coordinates fall outside valid indicator envelope | `out_of_indicator_range` | Flag as out-of-range; recommend retest or lab validation. |
| **Reference Tile Drift** | Reference white tile reading deviates > 10% from baseline | `reference_tile_drift` | Flag device for re-calibration; prevent quantitative estimate. |
| **Temperature Check** | Chamber temperature < 15°C or > 40°C | `temperature_extreme` | Apply temperature kinetic correction or prompt user. |

---

## 4. Provenance & Scientific Guardrails

- **Immutable Raw Data**: Raw counts ($R, G, B, C$) are preserved immutably. Recalibrations create new `ProcessedResult` records linked to the original `RawMeasurement`.
- **Qualitative Nutrient Classes**: Nitrogen, Phosphorus, and Potassium results are displayed only as ordered qualitative classes (**Low**, **Medium**, **High**) with clear statements of kit chemistry.
- **Fertilizer Dose Restrictions**: Automated chemical fertilizer dosing (e.g., kg/acre urea or DAP) is disabled until calibration achieves verified accredited laboratory correlation.
