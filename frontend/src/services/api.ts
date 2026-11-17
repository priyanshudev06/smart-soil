import { SoilSummary, CropRecommendation, MandiItem, WeatherDay, Farmer, FarmPlot, DeviceInfo } from '../types';

const API_BASE = '/api/v1';

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: 'offline', database: 'local_cached' };
    }
  },

  async getFarmers(): Promise<Farmer[]> {
    try {
      const res = await fetch(`${API_BASE}/farmers`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return [{
        farmer_id: 'farmer-001-dnyaneshwar',
        name: 'Dnyaneshwar Shinde',
        phone: '9876543210',
        role: 'farmer',
        preferred_language: 'mr',
        state: 'Maharashtra',
        district: 'Pune',
        village: 'Khadakwasla',
        consent_status: true
      }];
    }
  },

  async getPlots(farmerId: string): Promise<FarmPlot[]> {
    try {
      const res = await fetch(`${API_BASE}/farms/${farmerId}/plots`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return [
        {
          plot_id: 'plot-001-north-field',
          farmer_id: farmerId,
          label: 'North Field (काळी माती - Black Soil)',
          area: 2.5,
          area_unit: 'Acres',
          soil_type: 'Medium Deep Black Soil',
          irrigation_source: 'Borewell / Drip Irrigation',
          current_crop: 'Soybean',
          previous_crop: 'Wheat'
        },
        {
          plot_id: 'plot-002-south-terrace',
          farmer_id: farmerId,
          label: 'South Terrace (तांबडी माती - Reddish Loam)',
          area: 1.8,
          area_unit: 'Acres',
          soil_type: 'Reddish Loamy Soil',
          irrigation_source: 'Well / Canal',
          current_crop: 'Onion',
          previous_crop: 'Gram'
        }
      ];
    }
  },

  async addPlot(farmerId: string, plotData: Partial<FarmPlot>): Promise<FarmPlot> {
    const res = await fetch(`${API_BASE}/farms/${farmerId}/plots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plotData)
    });
    return await res.json();
  },

  async getSoilSummary(plotId: string): Promise<SoilSummary> {
    try {
      const res = await fetch(`${API_BASE}/plots/${plotId}/soil-summary`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        plot_id: plotId,
        plot_label: 'North Field (काळी माती - Black Soil)',
        area: 2.5,
        soil_type: 'Medium Deep Black Soil',
        irrigation_source: 'Borewell / Drip Irrigation',
        parameters: {
          pH: { value: '6.8', interval: '[6.5 - 7.1]', provenance: 'Estimated', updated_at: '2026-11-17' },
          'Nitrogen (N)': { value: 'Medium', interval: '280 - 560 kg/ha eq.', provenance: 'Estimated', updated_at: '2026-11-17' },
          'Phosphorus (P)': { value: 'Medium', interval: '10 - 25 kg/ha eq.', provenance: 'Estimated', updated_at: '2026-11-17' },
          'Potassium (K)': { value: 'High', interval: '> 280 kg/ha eq.', provenance: 'Estimated', updated_at: '2026-11-17' }
        },
        overall_health_index: 84,
        overall_classification: 'Good Fertility / Optimal pH'
      };
    }
  },

  async sendMeasurement(payload: any) {
    const res = await fetch(`${API_BASE}/device/measurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async getCropRecommendations(plotId: string, season: string, water: string): Promise<CropRecommendation[]> {
    try {
      const res = await fetch(`${API_BASE}/recommendations/crops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plot_id: plotId, season, water_availability: water })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.recommendations;
    } catch {
      return [];
    }
  },

  async calculateProfit(params: any) {
    const res = await fetch(`${API_BASE}/calculators/profit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  },

  async getMandiPrices(district: string = 'Pune'): Promise<MandiItem[]> {
    try {
      const res = await fetch(`${API_BASE}/markets/prices?district=${district}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.items;
    } catch {
      return [];
    }
  },

  async getWeather(district: string = 'Pune'): Promise<WeatherDay[]> {
    try {
      const res = await fetch(`${API_BASE}/weather/forecast?district=${district}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.forecast;
    } catch {
      return [];
    }
  },

  async queryAssistant(query: string, language: string, plotId?: string) {
    const res = await fetch(`${API_BASE}/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language, plot_id: plotId })
    });
    return await res.json();
  },

  async getDevice(deviceId: string = 'soil-reader-001'): Promise<DeviceInfo> {
    try {
      const res = await fetch(`${API_BASE}/devices/${deviceId}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        device_id: 'soil-reader-001',
        model: 'SmartSoil ESP32-TCS34725 Spectro-Reader',
        firmware_version: '1.0.0',
        status: 'online',
        battery_level: 94,
        assigned_operator: 'Priyanshu (KVK Field Lead)'
      };
    }
  }
};
