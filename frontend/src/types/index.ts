export type Language = 'mr' | 'hi' | 'en';
export type UserRole = 'farmer' | 'operator' | 'agronomist' | 'admin';

export interface Farmer {
  farmer_id: string;
  name: string;
  phone: string;
  role: UserRole;
  preferred_language: Language;
  state: string;
  district: string;
  village: string;
  consent_status: boolean;
}

export interface FarmPlot {
  plot_id: string;
  farmer_id: string;
  label: string;
  area: number;
  area_unit: string;
  soil_type: string;
  irrigation_source: string;
  current_crop: string;
  previous_crop: string;
}

export interface DeviceInfo {
  device_id: string;
  model: string;
  firmware_version: string;
  status: 'online' | 'offline' | 'measuring' | 'paired';
  battery_level: number;
  assigned_operator: string;
  last_seen_at?: string;
}

export interface ProcessedResult {
  result_id?: string;
  parameter: string;
  value_or_class: string;
  unit: string;
  interval: string;
  provenance: 'Measured' | 'Estimated' | 'Retrieved' | 'Generated';
  calibration_version: string;
  validation_status: string;
  is_lab_confirmed?: boolean;
  quality_flags?: string[];
}

export interface SoilSummary {
  plot_id: string;
  plot_label: string;
  area: number;
  soil_type: string;
  irrigation_source: string;
  parameters: {
    pH: { value: string; interval: string; provenance: string; updated_at: string };
    'Nitrogen (N)': { value: string; interval: string; provenance: string; updated_at: string };
    'Phosphorus (P)': { value: string; interval: string; provenance: string; updated_at: string };
    'Potassium (K)': { value: string; interval: string; provenance: string; updated_at: string };
  };
  overall_health_index: number;
  overall_classification: string;
}

export interface CropRecommendation {
  crop_name: string;
  crop_name_mr: string;
  crop_name_hi: string;
  suitability_score: number;
  category: string;
  soil_compatibility: string;
  season_duration: string;
  water_needs: string;
  estimated_yield_per_acre: string;
  estimated_profit_range: string;
  reasons: string[];
  assumptions: string;
  source: string;
}

export interface MandiItem {
  commodity: string;
  commodity_mr: string;
  commodity_hi: string;
  market: string;
  district: string;
  min_price: number;
  modal_price: number;
  max_price: number;
  unit: string;
  observed_date: string;
  source: string;
  freshness: string;
}

export interface WeatherDay {
  day: string;
  date: string;
  temp_max: number;
  temp_min: number;
  humidity: number;
  rainfall_probability: number;
  condition: string;
  condition_local: string;
  advisory: string;
  source: string;
}
