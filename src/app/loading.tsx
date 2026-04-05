import { Coffee } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in relative z-10">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-coffee-200/50 rounded-full blur-3xl opacity-50 animate-pulse-soft" />
      
      <div className="relative">
        <div className="w-16 h-16 bg-cream-100 rounded-2xl flex items-center justify-center border-2 border-coffee-200 shadow-sm relative overflow-hidden group">
          {/* Coffee fill animation */}
          <div className="absolute bottom-0 left-0 right-0 bg-coffee-700 w-full animate-coffee-fill origin-bottom opacity-80" />
          
          <Coffee size={28} className="text-coffee-800 relative z-10 animate-bounce-slow" />
        </div>
      </div>
      <p className="mt-5 font-display text-coffee-800 font-semibold tracking-wide">
        Menyeduh pesanan...
      </p>
      <div className="flex items-center gap-1 mt-2">
        <div className="w-1.5 h-1.5 bg-coffee-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 bg-coffee-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 bg-coffee-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
