import { Loader2 } from 'lucide-react';

export const CommonLoader = ({ message }: { message?: string }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
    <div className="bg-gray-900/80 border border-white/10 shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)] backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center animate-in zoom-in-95 duration-500">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        <Loader2 className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      {message && (
        <p className="mt-6 font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent animate-pulse tracking-wide">
          {message}
        </p>
      )}
    </div>
  </div>
);
