import math
from typing import Dict, Any, List, Tuple

class CalibrationEngine:
    """
    Colorimetric Calibration & Quality Assurance Engine
    Translates TCS34725 optical spectral channels into versioned pH and NPK classes.
    Strictly follows PRD Section 5.3 & 13.
    """

    @staticmethod
    def check_quality(sensor_data: Dict[str, Any], repeat_readings: List[Dict[str, Any]]) -> List[str]:
        flags = []
        c = sensor_data.get("c", 0)
        
        # 1. Low light / dark chamber obstruction check
        if c < 50:
            flags.append("sensor_underexposed")
        elif c > 60000:
            flags.append("sensor_saturated")

        # 2. Scatter check across repeat readings
        if repeat_readings and len(repeat_readings) >= 1:
            all_c = [r.get("c", c) for r in repeat_readings] + [c]
            mean_c = sum(all_c) / len(all_c)
            variance = sum((x - mean_c) ** 2 for x in all_c) / len(all_c)
            std_dev = math.sqrt(variance)
            cv_pct = (std_dev / mean_c) * 100 if mean_c > 0 else 0
            if cv_pct > 6.0:
                flags.append("optical_scatter_high")

        return flags

    @classmethod
    def process_reading(
        cls,
        parameter: str,
        sensor_data: Dict[str, Any],
        temperature_c: float = 27.5,
        calibration_version: str = "ph-kit-agri-cal-1.0",
        repeat_readings: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        repeat_readings = repeat_readings or []
        quality_flags = cls.check_quality(sensor_data, repeat_readings)

        r = sensor_data.get("r", 1)
        g = sensor_data.get("g", 1)
        b = sensor_data.get("b", 1)
        c = max(sensor_data.get("c", 1), 1)

        # Normalized chromaticity ratios
        nr = r / c
        ng = g / c
        nb = b / c

        param_upper = parameter.upper()

        if "PH" in param_upper:
            return cls._calibrate_ph(nr, ng, nb, temperature_c, calibration_version, quality_flags)
        elif "N" == param_upper or "NITROGEN" in param_upper:
            return cls._calibrate_nitrogen(nr, ng, nb, calibration_version, quality_flags)
        elif "P" == param_upper or "PHOSPHORUS" in param_upper:
            return cls._calibrate_phosphorus(nr, ng, nb, calibration_version, quality_flags)
        elif "K" == param_upper or "POTASSIUM" in param_upper:
            return cls._calibrate_potassium(nr, ng, nb, calibration_version, quality_flags)
        else:
            # Multi-parameter / 4-in-1 fallback: defaults to pH
            return cls._calibrate_ph(nr, ng, nb, temperature_c, calibration_version, quality_flags)

    @staticmethod
    def _calibrate_ph(nr: float, ng: float, nb: float, temp_c: float, cal_ver: str, flags: List[str]) -> Dict[str, Any]:
        # Empirical polynomial mapping calibrated against Bromothymol Blue / Universal Indicator
        # Yellowish (acidic) -> Greenish (neutral) -> Bluish/Purple (alkaline)
        color_ratio = (ng - nb) / (nr + 0.001)
        
        # Base pH estimate
        estimated_ph = 6.8 + (color_ratio * 4.2)
        
        # Temperature kinetic correction factor
        temp_correction = (25.0 - temp_c) * 0.015
        estimated_ph += temp_correction
        
        # Bound to validated indicator working range (5.0 to 8.5)
        if estimated_ph < 5.0:
            estimated_ph = 5.0
            flags.append("below_indicator_range")
        elif estimated_ph > 8.5:
            estimated_ph = 8.5
            flags.append("above_indicator_range")

        rounded_ph = round(estimated_ph, 1)
        lower_bound = max(5.0, round(rounded_ph - 0.3, 1))
        upper_bound = min(8.5, round(rounded_ph + 0.3, 1))

        return {
            "parameter": "pH",
            "value_or_class": str(rounded_ph),
            "unit": "pH",
            "interval": f"[{lower_bound} - {upper_bound}]",
            "provenance": "Estimated",
            "calibration_version": cal_ver,
            "validation_status": "indicative_only",
            "quality_flags": flags,
            "interpretation": "Slightly Acidic" if rounded_ph < 6.5 else ("Neutral / Optimal" if rounded_ph <= 7.5 else "Moderately Alkaline")
        }

    @staticmethod
    def _calibrate_nitrogen(nr: float, ng: float, nb: float, cal_ver: str, flags: List[str]) -> Dict[str, Any]:
        # Griess reaction: Pink / Magenta intensity proportional to Available N
        # Higher redness & blueness relative to green corresponds to Medium/High
        pink_index = (nr + nb) / (2.0 * max(ng, 0.001))
        
        if pink_index > 1.35:
            n_class = "High"
            interval = "High (> 560 kg/ha eq.)"
        elif pink_index >= 1.05:
            n_class = "Medium"
            interval = "Medium (280 - 560 kg/ha eq.)"
        else:
            n_class = "Low"
            interval = "Low (< 280 kg/ha eq.)"

        return {
            "parameter": "Nitrogen (N)",
            "value_or_class": n_class,
            "unit": "qualitative class",
            "interval": interval,
            "provenance": "Estimated",
            "calibration_version": cal_ver,
            "validation_status": "indicative_only",
            "quality_flags": flags,
            "chemistry_note": "Colorimetric diazotization (Griess-Ilosvay) paper strip reaction"
        }

    @staticmethod
    def _calibrate_phosphorus(nr: float, ng: float, nb: float, cal_ver: str, flags: List[str]) -> Dict[str, Any]:
        # Molybdenum Blue reaction: Blue intensity increases with Available P
        blue_index = nb / max(nr, 0.001)

        if blue_index > 0.85:
            p_class = "High"
            interval = "High (> 25 kg/ha eq. P2O5)"
        elif blue_index >= 0.55:
            p_class = "Medium"
            interval = "Medium (10 - 25 kg/ha eq. P2O5)"
        else:
            p_class = "Low"
            interval = "Low (< 10 kg/ha eq. P2O5)"

        return {
            "parameter": "Phosphorus (P)",
            "value_or_class": p_class,
            "unit": "qualitative class",
            "interval": interval,
            "provenance": "Estimated",
            "calibration_version": cal_ver,
            "validation_status": "indicative_only",
            "quality_flags": flags,
            "chemistry_note": "Phosphomolybdate reduction to molybdenum blue"
        }

    @staticmethod
    def _calibrate_potassium(nr: float, ng: float, nb: float, cal_ver: str, flags: List[str]) -> Dict[str, Any]:
        # Sodium cobaltinitrite turbidity / precipitation color shift
        k_index = (nr + ng) / max(nb * 2.0, 0.001)

        if k_index > 1.5:
            k_class = "High"
            interval = "High (> 280 kg/ha eq. K2O)"
        elif k_index >= 1.1:
            k_class = "Medium"
            interval = "Medium (140 - 280 kg/ha eq. K2O)"
        else:
            k_class = "Low"
            interval = "Low (< 140 kg/ha eq. K2O)"

        return {
            "parameter": "Potassium (K)",
            "value_or_class": k_class,
            "unit": "qualitative class",
            "interval": interval,
            "provenance": "Estimated",
            "calibration_version": cal_ver,
            "validation_status": "indicative_only",
            "quality_flags": flags,
            "chemistry_note": "Cobaltinitrite precipitation colorimetry"
        }
