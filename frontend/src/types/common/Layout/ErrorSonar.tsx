import React, { useEffect } from 'react';
import { X } from 'lucide-react'; // Using the X icon instead of Check

interface ErrorSonarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  duration?: number;
}

export const ErrorSonar: React.FC<ErrorSonarProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none select-none">
      <div className="relative group">
        {/* Minimal creative glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500" />

        {/* The Pill */}
        <div className="relative bg-gray-950/60 backdrop-blur-xl border border-white/10 rounded-full pl-1.5 pr-6 py-1.5 flex items-center gap-3 shadow-2xl ring-1 ring-white/5 animate-in slide-in-from-top-2 fade-in duration-500">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            <X className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <div className="flex flex-col py-0.5">
            <span className="text-white font-bold text-sm tracking-tight leading-tight">
              {title}
            </span>
            {subtitle && (
              <span className="text-gray-400 text-[11px] font-medium leading-none mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
