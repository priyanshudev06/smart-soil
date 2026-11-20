import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Heart,
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-16 space-y-8">
      
      {/* 1. Pre-Footer Call to Action Card (Matching Reference Design) */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white text-center px-6 py-14 sm:py-20 shadow-2xl border border-slate-800/80 overflow-hidden">
        
        {/* Soft Radial Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/15 via-cyan-500/10 to-transparent pointer-events-none blur-2xl" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to transform your soil health?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Join forward-thinking farmers and agricultural researchers who are testing soil parameters and optimizing crop yields in minutes.
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate('/test')}
              className="bg-white hover:bg-slate-100 text-slate-950 font-black px-8 py-4 rounded-full text-sm sm:text-base transition-all shadow-xl hover:scale-105 active:scale-95 inline-flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              <span>Start Rapid Test for Free</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Card (Matching Reference Layout) */}
      <div className="relative rounded-[2rem] bg-white border border-slate-200/90 p-8 sm:p-14 shadow-sm space-y-12 overflow-hidden">
        
        {/* Top Content: Brand Info on Left + 3 Columns on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Left Column: Brand & Mission */}
          <div className="md:col-span-5 space-y-5">
            <div
              onClick={() => navigate('/')}
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                🌱
              </div>
              <span className="font-black text-xl text-slate-900 tracking-tight">
                Smart Soil
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
              Smart Soil empowers farmers and agronomy technicians with IoT optical spectrometry and AI-driven precision guidance — turning raw chemical sensor data into actionable decisions.
            </p>

            {/* Social & Contact Icons */}
            <div className="flex items-center gap-3 pt-1 text-slate-400">
              <a
                href="https://github.com/priyanshudev06/smart-soil"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:ktpriyanshu261@gmail.com"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-colors"
                title="Email Team"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-colors"
                title="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Columns: Team, Product, Resources */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            
            {/* Column 1: Project Creators / Team Members */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-sm tracking-tight uppercase">
                Project Team
              </h4>
              <ul className="space-y-2.5 text-slate-600 font-semibold">
                <li>
                  <span className="font-black text-slate-900 block">Priyanshu</span>
                  <span className="text-[11px] text-emerald-700 font-bold">Project Lead & Architect</span>
                </li>
                <li>
                  <span className="font-black text-slate-900 block">Rajendra</span>
                  <span className="text-[11px] text-slate-500">Hardware & Firmware</span>
                </li>
                <li>
                  <span className="font-black text-slate-900 block">Satyam</span>
                  <span className="text-[11px] text-slate-500">ML & Data Pipelines</span>
                </li>
                <li>
                  <span className="font-black text-slate-900 block">Kishlay</span>
                  <span className="text-[11px] text-slate-500">Optical Calibration</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Platform Links */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-sm tracking-tight uppercase">
                Platform
              </h4>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li>
                  <button onClick={() => navigate('/test')} className="hover:text-emerald-700 transition-colors">
                    Rapid Soil Testing
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/report')} className="hover:text-emerald-700 transition-colors">
                    Soil Health Card
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/crops')} className="hover:text-emerald-700 transition-colors">
                    Crop Suitability & Profit
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/mandi-weather')} className="hover:text-emerald-700 transition-colors">
                    Mandi Rates & Weather
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/assistant')} className="hover:text-emerald-700 transition-colors">
                    AI Soil Assistant
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Hardware & Science */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-sm tracking-tight uppercase">
                Hardware & Specs
              </h4>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li>
                  <button onClick={() => navigate('/device')} className="hover:text-emerald-700 transition-colors">
                    ESP32 Diagnostics
                  </button>
                </li>
                <li>
                  <span className="text-slate-500">TCS34725 Colorimeter</span>
                </li>
                <li>
                  <span className="text-slate-500">DS18B20 1-Wire Temp</span>
                </li>
                <li>
                  <span className="text-slate-500">ICAR-IISS Standards</span>
                </li>
                <li>
                  <span className="text-slate-500">SQLite & FastAPI Core</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Divider Line */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Smart Soil Health Assistant. Built by{' '}
            <strong className="text-slate-900">Priyanshu, Rajendra, Satyam &amp; Kishlay</strong>.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-800 cursor-pointer">Scientific Disclaimer</span>
          </div>
        </div>

        {/* Faint Background Watermark (Matching 'Graphy' in Reference Image) */}
        <div className="text-[80px] sm:text-[140px] lg:text-[180px] font-black text-slate-900/[0.03] select-none pointer-events-none text-center -mb-16 -mt-8 leading-none tracking-tight">
          Smart Soil
        </div>

      </div>

    </footer>
  );
};
