from typing import List, Dict, Any
from app.schemas.schemas import (
    CropSuitabilityItem, CropRecommendationResponse,
    ProfitCalculationRequest, ProfitCalculationResponse
)

CROP_DATABASE = [
    {
        "name": "Soybean",
        "name_mr": "सोयाबीन",
        "name_hi": "सोयाबीन",
        "ideal_ph_min": 6.0,
        "ideal_ph_max": 7.5,
        "suitable_seasons": ["Kharif"],
        "water_req": "Medium",
        "duration": "95 - 105 Days",
        "avg_yield_quintal_acre": "8 - 12 Quintals",
        "profit_range": "₹22,000 - ₹38,000 / Acre",
        "n_preference": "Low to Medium (fixes atmospheric N)",
        "source": "ICAR-IISR Indore & MPKV Rahuri Package of Practices"
    },
    {
        "name": "Cotton",
        "name_mr": "कापूस",
        "name_hi": "कपास",
        "ideal_ph_min": 6.2,
        "ideal_ph_max": 8.0,
        "suitable_seasons": ["Kharif"],
        "water_req": "Medium to High",
        "duration": "150 - 180 Days",
        "avg_yield_quintal_acre": "10 - 15 Quintals",
        "profit_range": "₹30,000 - ₹55,000 / Acre",
        "n_preference": "Medium to High",
        "source": "CICR Nagpur & Dr. PDKV Akola Agronomy Guide"
    },
    {
        "name": "Onion",
        "name_mr": "कांदा",
        "name_hi": "प्याज",
        "ideal_ph_min": 6.0,
        "ideal_ph_max": 7.2,
        "suitable_seasons": ["Kharif", "Rabi", "Late Kharif"],
        "water_req": "Medium",
        "duration": "110 - 130 Days",
        "avg_yield_quintal_acre": "100 - 140 Quintals",
        "profit_range": "₹45,000 - ₹90,000 / Acre (Market Volatile)",
        "n_preference": "Medium to High",
        "source": "ICAR-DOGR Rajgurunagar (Pune) & MPKV Rahuri"
    },
    {
        "name": "Wheat",
        "name_mr": "गहू",
        "name_hi": "गेहूं",
        "ideal_ph_min": 6.5,
        "ideal_ph_max": 7.8,
        "suitable_seasons": ["Rabi"],
        "water_req": "Medium",
        "duration": "110 - 120 Days",
        "avg_yield_quintal_acre": "15 - 20 Quintals",
        "profit_range": "₹20,000 - ₹35,000 / Acre",
        "n_preference": "Medium to High",
        "source": "ICAR-IIWBR Karnal & State Agriculture Dept. Maharashtra"
    },
    {
        "name": "Chickpea (Gram)",
        "name_mr": "हरभरा (चना)",
        "name_hi": "चना",
        "ideal_ph_min": 6.0,
        "ideal_ph_max": 7.5,
        "suitable_seasons": ["Rabi"],
        "water_req": "Low / Rainfed",
        "duration": "90 - 110 Days",
        "avg_yield_quintal_acre": "7 - 10 Quintals",
        "profit_range": "₹18,000 - ₹32,000 / Acre",
        "n_preference": "Low (Leguminous bio-fixer)",
        "source": "ICAR-IIPR Kanpur & MPKV Rahuri Pulse Division"
    },
    {
        "name": "Tomato",
        "name_mr": "टोमॅटो",
        "name_hi": "टमाटर",
        "ideal_ph_min": 6.0,
        "ideal_ph_max": 7.0,
        "suitable_seasons": ["Kharif", "Rabi", "Zaid"],
        "water_req": "High (Drip Preferred)",
        "duration": "120 - 140 Days",
        "avg_yield_quintal_acre": "180 - 250 Quintals",
        "profit_range": "₹50,000 - ₹1,20,000 / Acre",
        "n_preference": "High",
        "source": "ICAR-IIHR Bengaluru & KVK Narayangaon"
    }
]

class RecommendationEngine:
    @staticmethod
    def get_crop_recommendations(
        plot_label: str,
        ph_val: float,
        npk: Dict[str, str],
        season: str,
        water_availability: str
    ) -> List[CropSuitabilityItem]:
        results = []

        for crop in CROP_DATABASE:
            score = 70 # baseline
            reasons = []

            # 1. pH compatibility check
            if crop["ideal_ph_min"] <= ph_val <= crop["ideal_ph_max"]:
                score += 15
                reasons.append(f"Soil pH {ph_val} is in the ideal range ({crop['ideal_ph_min']} - {crop['ideal_ph_max']}).")
            else:
                score -= 15
                reasons.append(f"Soil pH {ph_val} is slightly outside optimal ({crop['ideal_ph_min']} - {crop['ideal_ph_max']}).")

            # 2. Season suitability check
            if season in crop["suitable_seasons"]:
                score += 10
                reasons.append(f"Matches targeted planting season: {season}.")
            else:
                score -= 20
                reasons.append(f"Off-season for standard planting (Recommended: {', '.join(crop['suitable_seasons'])}).")

            # 3. Water availability check
            if crop["water_req"] == "Low / Rainfed" and water_availability in ["Low / Rainfed", "Medium"]:
                score += 5
                reasons.append("Tolerates low water; ideal for your irrigation level.")
            elif crop["water_req"] in ["Medium to High", "High (Drip Preferred)"] and water_availability == "Low / Rainfed":
                score -= 15
                reasons.append("Higher moisture demand; supplemental irrigation recommended.")

            score = max(20, min(95, score))

            category = "Highly Suitable" if score >= 80 else ("Moderately Suitable" if score >= 60 else "Marginal / Requires Amendments")

            results.append(CropSuitabilityItem(
                crop_name=crop["name"],
                crop_name_mr=crop["name_mr"],
                crop_name_hi=crop["name_hi"],
                suitability_score=score,
                category=category,
                soil_compatibility=f"Optimal pH {crop['ideal_ph_min']}-{crop['ideal_ph_max']} on Deep Black Soil",
                season_duration=crop["duration"],
                water_needs=crop["water_req"],
                estimated_yield_per_acre=crop["avg_yield_quintal_acre"],
                estimated_profit_range=crop["profit_range"],
                reasons=reasons,
                assumptions="Assumes normal monsoon / regular irrigation and recommended sowing dates.",
                source=crop["source"]
            ))

        # Sort descending by suitability score
        results.sort(key=lambda x: x.suitability_score, reverse=True)
        return results

    @staticmethod
    def calculate_profit(req: ProfitCalculationRequest) -> ProfitCalculationResponse:
        total_yield = req.land_area_acres * req.expected_yield_quintal_per_acre
        gross_revenue = total_yield * req.mandi_modal_price_per_quintal

        per_acre_cost = (
            req.seed_cost_per_acre +
            req.fertilizer_manure_cost_per_acre +
            req.labor_machinery_cost_per_acre +
            req.irrigation_other_cost_per_acre
        )
        total_input_cost = per_acre_cost * req.land_area_acres
        net_profit = gross_revenue - total_input_cost

        break_even_yield = (
            (per_acre_cost / req.mandi_modal_price_per_quintal)
            if req.mandi_modal_price_per_quintal > 0 else 0.0
        )
        
        roi_pct = ((net_profit / total_input_cost) * 100.0) if total_input_cost > 0 else 0.0

        return ProfitCalculationResponse(
            total_yield_quintal=round(total_yield, 2),
            gross_revenue=round(gross_revenue, 2),
            total_input_cost=round(total_input_cost, 2),
            net_profit=round(net_profit, 2),
            break_even_yield_per_acre=round(break_even_yield, 2),
            return_on_investment_pct=round(roi_pct, 1),
            assumptions_note="All financial metrics are estimates based on your entered parameters and current dated mandi rates."
        )
