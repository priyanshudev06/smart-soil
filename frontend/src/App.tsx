import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { DashboardPage } from './pages/DashboardPage';
import { SoilTestingPage } from './pages/SoilTestingPage';
import { SoilReportPage } from './pages/SoilReportPage';
import { CropPlannerPage } from './pages/CropPlannerPage';
import { FarmsPage } from './pages/FarmsPage';
import { DevicePage } from './pages/DevicePage';
import { MandiWeatherPage } from './pages/MandiWeatherPage';
import { AssistantPage } from './pages/AssistantPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <CustomCursor />
        <div className="min-h-screen bg-page-bg flex flex-col font-sans">
          <Navigation />
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/test" element={<SoilTestingPage />} />
              <Route path="/report" element={<SoilReportPage />} />
              <Route path="/crops" element={<CropPlannerPage />} />
              <Route path="/farms" element={<FarmsPage />} />
              <Route path="/device" element={<DevicePage />} />
              <Route path="/mandi-weather" element={<MandiWeatherPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
