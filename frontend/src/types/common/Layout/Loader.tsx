import { Loader2 } from 'lucide-react';

export const CommonLoader = ({ message }: { message?: string }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <Loader2 className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
    </div>
    {message && <p className="mt-4 text-gray-300 font-medium animate-pulse">{message}</p>}
  </div>
);
