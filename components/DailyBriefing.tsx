
import React, { useState, useEffect } from 'react';
import { RefreshCw, Wind, Droplets, MapPin, Terminal, Clock, ArrowRight, Sun, Calendar, AlertTriangle, CheckCircle, Briefcase, Command, CloudRain, Cloud, CloudLightning, Snowflake } from 'lucide-react';
import { generateDailyBriefing } from '../services/geminiService';
import { UserProfile } from '../types';

interface DailyBriefingProps {
  profile: UserProfile;
}

const DailyBriefing: React.FC<DailyBriefingProps> = ({ profile }) => {
  const [loading, setLoading] = useState(false);
  const [briefingData, setBriefingData] = useState({
    summary: "System ready. Initialize briefing to sync with grid.",
    weather: { temp: "--°", condition: "Offline", precip: "--", wind: "--" },
    tasks: [],
    alerts: [
        { type: "info", text: "Connect to receive daily orders." }
    ]
  });

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const data = await generateDailyBriefing(profile, new Date().toLocaleDateString(), "Austin, TX");
      if (data) {
        setBriefingData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if empty
  useEffect(() => {
    if (briefingData.tasks.length === 0 && !loading) {
      fetchBriefing();
    }
  }, []);

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain size={28} className="text-blue-200" />;
    if (c.includes('cloud')) return <Cloud size={28} className="text-slate-200" />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning size={28} className="text-amber-200" />;
    if (c.includes('snow')) return <Snowflake size={28} className="text-white" />;
    return <Sun size={28} className="text-amber-100" />;
  };

  const getGradient = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return 'from-blue-600 to-slate-700';
    if (c.includes('cloud')) return 'from-slate-500 to-slate-700';
    if (c.includes('storm')) return 'from-slate-700 to-amber-900';
    if (c.includes('snow')) return 'from-blue-400 to-white';
    return 'from-amber-500 to-orange-600'; // Sunny default
  };

  return (
    <div className="w-full glass-panel rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col transition-all">
      {/* Header Bar */}
      <div className="bg-white/50 dark:bg-slate-900/50 px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl shadow-sm">
                <Terminal size={20} />
            </div>
            <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Morning Brief</h3>
                <div className="text-xs font-bold text-slate-400 mt-1">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric'})}</div>
            </div>
        </div>
        <button 
            onClick={fetchBriefing} 
            disabled={loading} 
            className="group flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-brand-primary">Sync</span>
            <RefreshCw size={14} className={`text-slate-400 group-hover:text-brand-primary ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-20 text-center space-y-6">
           <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-ping"></div>
              <div className="relative bg-brand-primary/10 rounded-full w-16 h-16 flex items-center justify-center text-brand-primary">
                 <Command className="animate-pulse" size={32} />
              </div>
           </div>
           <div>
             <h4 className="text-lg font-bold text-slate-900 dark:text-white">Compiling Intel</h4>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Checking Weather • Routing • Inventory</p>
           </div>
        </div>
      ) : (
        <div className="p-8 grid lg:grid-cols-12 gap-8">
          {/* Left Column: Context (Weather & AI Note) */}
          <div className="lg:col-span-4 space-y-6">
              {/* Weather Card */}
              <div className={`p-6 bg-gradient-to-br ${getGradient(briefingData.weather.condition)} rounded-[2rem] text-white shadow-xl relative overflow-hidden group`}>
                  <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">{getWeatherIcon(briefingData.weather.condition)}</div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/10">
                            {getWeatherIcon(briefingData.weather.condition)}
                        </div>
                        <span className="text-[10px] font-black uppercase bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">{briefingData.weather.condition}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-5xl font-black tracking-tighter">{briefingData.weather.temp}</span>
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold text-white/90 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5"><Droplets size={12}/> {briefingData.weather.precip} Precip</span>
                        <span className="flex items-center gap-1.5"><Wind size={12}/> {briefingData.weather.wind} Wind</span>
                    </div>
                  </div>
              </div>

              {/* AI Summary Note */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 relative">
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-white dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-brand-primary border border-slate-100 dark:border-white/5 rounded-full shadow-sm">
                      Strategist Note
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{briefingData.summary}"
                  </p>
              </div>

              {/* System Alerts */}
              <div className="space-y-3">
                  <div className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">System Alerts</div>
                  {briefingData.alerts.map((alert: any, i: number) => (
                      <div key={i} className={`p-4 rounded-2xl border flex gap-4 items-start ${alert.type === 'warning' ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'}`}>
                          {alert.type === 'warning' ? <AlertTriangle size={18} className="text-rose-500 mt-0.5 shrink-0"/> : <CheckCircle size={18} className="text-blue-500 mt-0.5 shrink-0"/>}
                          <div>
                             <span className={`text-xs font-bold leading-tight block ${alert.type === 'warning' ? 'text-rose-700 dark:text-rose-200' : 'text-blue-700 dark:text-blue-200'}`}>{alert.text}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="lg:col-span-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] p-8 border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Clock size={14}/> Today's Flight Plan
                  </h4>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{briefingData.tasks.length} Events</div>
              </div>
              
              <div className="space-y-0 relative min-h-[300px]">
                  {/* Vertical Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                  
                  {briefingData.tasks.length > 0 ? briefingData.tasks.map((task: any, i: number) => (
                      <div key={i} className="relative pl-12 pb-8 group last:pb-0">
                          {/* Timeline Dot */}
                          <div className={`absolute left-[13px] top-0 w-3.5 h-3.5 rounded-full border-[3px] border-white dark:border-slate-900 z-10 transition-all duration-300 group-hover:scale-125 ${i === 0 ? 'bg-brand-primary ring-4 ring-brand-primary/20' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl hover:border-brand-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                              <div className="mb-3 sm:mb-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">{task.time}</span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                      task.type === 'JOB' ? 'bg-emerald-100 text-emerald-600' : 
                                      task.type === 'ESTIMATE' ? 'bg-purple-100 text-purple-600' : 
                                      'bg-slate-100 text-slate-500'
                                    }`}>
                                        {task.type}
                                    </span>
                                  </div>
                                  <div className="font-bold text-slate-900 dark:text-white text-base">{task.title}</div>
                                  <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-2"><MapPin size={12} className="text-slate-400"/> {task.location}</div>
                              </div>
                              <div className="flex items-center justify-end">
                                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-brand-primary group-hover:text-white transition-all">
                                      <ArrowRight size={18}/>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                        <Calendar size={48} className="text-slate-300 mb-4" />
                        <div className="text-sm font-bold text-slate-400">Schedule Clear</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-1">Enjoy the downtime</div>
                    </div>
                  )}
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyBriefing;
