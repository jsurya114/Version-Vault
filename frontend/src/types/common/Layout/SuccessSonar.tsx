import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

interface SuccessSonarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  duration?: number;
}

export const SuccessSonar: React.FC<SuccessSonarProps> = ({
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
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-none select-none">
      <div className="relative flex flex-col items-center">
        {/* Elegant sonar pulses */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-green-500/20 rounded-full animate-ping opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-green-400/10 rounded-full animate-ping opacity-10 [animation-delay:0.5s]" />

        {/* Prominent, elegant notification */}
        <div className="bg-gray-900/80 backdrop-blur-2xl border border-green-500/30 rounded-2xl pl-2 pr-8 py-3 flex items-center gap-4 shadow-[0_0_40px_-10px_rgba(34,197,94,0.4)] ring-1 ring-white/5 animate-in zoom-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 bg-green-500/20 border border-green-400/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <Check className="w-7 h-7 text-green-400 stroke-[3]" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-tight leading-tight">
              {title}
            </span>
            {subtitle && (
              <span className="text-gray-400 text-sm font-medium leading-none mt-1.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
