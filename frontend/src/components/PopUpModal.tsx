import React from 'react';
import { X, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface PopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const PopUpModal: React.FC<PopUpModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* 3D Pop-Up Window */}
      <div
        className="relative z-10 w-full max-w-lg rounded-3xl bg-white border-2 border-slate-100 p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] transform transition-all duration-300 scale-100 animate-in zoom-in-95 duration-200"
      >
        {/* Top Gradient Highlight Bar */}
        <div className="absolute inset-x-8 -top-[2px] h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm font-semibold text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
