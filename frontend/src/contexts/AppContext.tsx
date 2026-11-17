import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, UserRole, Farmer, FarmPlot, DeviceInfo, ProcessedResult } from '../types';
import { api } from '../services/api';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  farmer: Farmer | null;
  plots: FarmPlot[];
  selectedPlot: FarmPlot | null;
  setSelectedPlotId: (id: string) => void;
  device: DeviceInfo | null;
  deviceConnected: boolean;
  setDeviceConnected: (c: boolean) => void;
  lastResult: ProcessedResult | null;
  setLastResult: (res: ProcessedResult | null) => void;
  refreshPlots: () => Promise<void>;
  isOffline: boolean;
  offlineQueueCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('mr');
  const [role, setRole] = useState<UserRole>('farmer');
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [plots, setPlots] = useState<FarmPlot[]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<string>('');
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [deviceConnected, setDeviceConnected] = useState<boolean>(true);
  const [lastResult, setLastResult] = useState<ProcessedResult | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial fetch
    api.getFarmers().then(farmers => {
      if (farmers.length > 0) {
        setFarmer(farmers[0]);
        api.getPlots(farmers[0].farmer_id).then(plotList => {
          setPlots(plotList);
          if (plotList.length > 0) setSelectedPlotId(plotList[0].plot_id);
        });
      }
    });

    api.getDevice().then(dev => setDevice(dev));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshPlots = async () => {
    if (farmer) {
      const p = await api.getPlots(farmer.farmer_id);
      setPlots(p);
    }
  };

  const selectedPlot = plots.find(p => p.plot_id === selectedPlotId) || plots[0] || null;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        role,
        setRole,
        farmer,
        plots,
        selectedPlot,
        setSelectedPlotId,
        device,
        deviceConnected,
        setDeviceConnected,
        lastResult,
        setLastResult,
        refreshPlots,
        isOffline,
        offlineQueueCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
