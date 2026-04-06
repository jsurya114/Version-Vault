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
  duration = 3000, // Show longer for errors so they can read it
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
        {/* Red Sonar Pulses */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-red-500/20 rounded-full animate-ping opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-red-400/10 rounded-full animate-ping opacity-10 [animation-delay:0.5s]" />

        {/* Red Notification Box */}
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-2xl pl-2 pr-8 py-3 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-red-500/10 animate-in zoom-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center shadow-lg shadow-red-500/10">
            <X className="w-7 h-7 text-red-400 stroke-[3]" />
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
