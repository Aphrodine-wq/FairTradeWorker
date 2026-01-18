
import React, { useEffect, useState } from 'react';
import { Hexagon, Zap, ShieldCheck } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (Math.random() * 15);
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center p-8">
      
      {/* Central Logo */}
      <div className="mb-12 relative">
         <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/20 z-10 relative">
            <Hexagon className="text-white w-12 h-12" strokeWidth={3} />
         </div>
         <div className="absolute -inset-4 border-2 border-slate-800 rounded-[2.5rem] -z-0"></div>
      </div>
      
      {/* Typography */}
      <div className="text-center space-y-4 mb-16">
         <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
            FairTrade<span className="text-blue-600">Worker</span>
         </h1>
         <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.4em]">
            Infrastructure OS v2.5
         </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs space-y-3">
         <div className="flex justify-between text-[10px] font-black uppercase text-slate-600 tracking-widest">
            <span>System Boot</span>
            <span>{Math.round(progress)}%</span>
         </div>
         <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
               className="h-full bg-blue-600 transition-all duration-300 ease-out" 
               style={{ width: `${progress}%` }}
            ></div>
         </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-10 flex gap-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">
         <div className="flex items-center gap-2"><Zap size={10}/> Power Active</div>
         <div className="flex items-center gap-2"><ShieldCheck size={10}/> Secure Node</div>
      </div>
    </div>
  );
};

export default SplashScreen;
