
import React, { useState, useEffect, useMemo } from 'react';
import { Territory } from '../types';
import { 
  TrendingUp, Shield, Check, X, ChevronRight, Loader2, 
  CheckCircle, ArrowLeft, Search, Zap, Globe, Activity, 
  BarChart3, MapPin, Sparkles, ExternalLink, Radar, 
  Crosshair, Target, ShieldCheck, Box
} from 'lucide-react';
import { getTerritoryMarketIntelligence } from '../services/geminiService';

// Detailed US Silhouette Representation
const US_MAP_PATH = "M12.3,16.5 L15,16.2 L25,15.5 L35,14.8 L45,14.5 L55,14.2 L65,14.2 L75,14.8 L85,15.5 L95,12.5 L98,15 L95,25 L92,35 L95,45 L98,65 L95,85 L85,95 L75,92 L65,95 L55,92 L45,95 L35,92 L25,95 L15,92 L5,85 L2,65 L5,45 L8,35 L5,25 L12.3,16.5 Z";

const MOCK_TERRITORIES: (Territory & { leadsLast24h: number })[] = [
  { id: 't1', name: 'Austin', fipsCode: '48453', zipCodes: ['78701'], tier: 'METRO_CORE', status: 'AVAILABLE', x: 48, y: 78, state: 'TX', leadsLast24h: 12, pricing: { baseRate: 450, densityModifier: 1.8, demandIndex: 9.5, currentPrice: { exclusive: 899, preferred: 449, standard: 149 } } },
  { id: 't2', name: 'Manhattan', fipsCode: '36061', zipCodes: ['10001'], tier: 'METRO_CORE', status: 'CLAIMED', x: 88, y: 28, state: 'NY', leadsLast24h: 45, pricing: { baseRate: 900, densityModifier: 2.5, demandIndex: 9.9, currentPrice: { exclusive: 1299, preferred: 649, standard: 249 } } },
  { id: 't3', name: 'San Francisco', fipsCode: '06075', zipCodes: ['94103'], tier: 'URBAN', status: 'CONTESTED', x: 8, y: 42, state: 'CA', leadsLast24h: 22, pricing: { baseRate: 850, densityModifier: 2.2, demandIndex: 9.8, currentPrice: { exclusive: 1150, preferred: 575, standard: 199 } } },
  { id: 't4', name: 'Miami', fipsCode: '12086', zipCodes: ['33139'], tier: 'URBAN', status: 'AVAILABLE', x: 82, y: 92, state: 'FL', leadsLast24h: 18, pricing: { baseRate: 400, densityModifier: 1.6, demandIndex: 8.5, currentPrice: { exclusive: 699, preferred: 349, standard: 119 } } },
  { id: 't5', name: 'Chicago', fipsCode: '17031', zipCodes: ['60601'], tier: 'METRO_CORE', status: 'AVAILABLE', x: 65, y: 35, state: 'IL', leadsLast24h: 31, pricing: { baseRate: 500, densityModifier: 1.9, demandIndex: 9.0, currentPrice: { exclusive: 799, preferred: 399, standard: 139 } } },
  { id: 't6', name: 'Seattle', fipsCode: '53033', zipCodes: ['98101'], tier: 'URBAN', status: 'CLAIMED', x: 12, y: 15, state: 'WA', leadsLast24h: 15, pricing: { baseRate: 480, densityModifier: 1.7, demandIndex: 8.9, currentPrice: { exclusive: 750, preferred: 375, standard: 125 } } },
  { id: 't7', name: 'Denver', fipsCode: '08031', zipCodes: ['80202'], tier: 'SUBURBAN', status: 'AVAILABLE', x: 35, y: 48, state: 'CO', leadsLast24h: 9, pricing: { baseRate: 380, densityModifier: 1.4, demandIndex: 7.8, currentPrice: { exclusive: 599, preferred: 299, standard: 99 } } }
];

const TerritoryMarketplace: React.FC = () => {
  const [selectedTerritory, setSelectedTerritory] = useState<any | null>(null);
  const [isFetchingIntel, setIsFetchingIntel] = useState(false);
  const [areaIntel, setAreaIntel] = useState<{text: string, sources: any[]} | null>(null);
  const [ownedTerritories, setOwnedTerritories] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<'IDLE' | 'SCANNING' | 'LOCKED'>('IDLE');
  const [searchTerm, setSearchTerm] = useState('');
  const [liveLog, setLiveLog] = useState<string[]>([
    "Node initialized: 48453",
    "Lead inbound: NYC-10023",
    "Market fluctuation detected: SF-94101"
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const logs = [
        `Lead surge: Zip ${Math.floor(10000 + Math.random() * 80000)}`,
        `Network Node ${Math.floor(Math.random() * 99)} online`,
        `Registry update in progress...`,
        `Lead match success: Contractor FT-${Math.floor(1000 + Math.random() * 9000)}`
      ];
      setLiveLog(prev => [logs[Math.floor(Math.random() * logs.length)], ...prev].slice(0, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredTerritories = useMemo(() => {
    return MOCK_TERRITORIES.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.zipCodes.some(z => z.includes(searchTerm))
    );
  }, [searchTerm]);

  const handleOpenTerritory = async (t: any) => {
    setSelectedTerritory(t);
    setAreaIntel(null);
    setActiveStep('IDLE');
    setIsFetchingIntel(true);
    try {
      const intel = await getTerritoryMarketIntelligence(t.name, t.zipCodes[0]);
      setAreaIntel(intel);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingIntel(false);
    }
  };

  const handleClaim = () => {
    setActiveStep('SCANNING');
    setTimeout(() => {
      setActiveStep('LOCKED');
      setOwnedTerritories(prev => [...prev, selectedTerritory.id]);
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6 animate-fadeIn pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-lg shadow-brand-primary/10">
                <Radar className="animate-pulse-neon" size={32}/>
             </div>
             <div>
                <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Registry</h1>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Strategic Asset Distribution</p>
             </div>
          </div>
        </div>
        
        <div className="relative group w-full md:w-96">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={20} />
           <input 
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             placeholder="Search by Zip, City, or State..." 
             className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl outline-none focus:border-brand-primary transition-all shadow-sm font-bold" 
           />
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-4 gap-6 overflow-hidden">
        {/* TACTICAL MAP PANEL */}
        <div className="lg:col-span-3 bg-slate-950 rounded-[3rem] border border-slate-800 relative overflow-hidden group shadow-2xl">
           <div className="absolute inset-0 cyber-grid opacity-20"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950"></div>
           
           {/* Vertical Scan Ray */}
           <div className="absolute inset-0 pointer-events-none z-10">
              <div className="h-1 w-full bg-brand-primary/40 shadow-[0_0_30px_#2563eb] animate-scan-vertical"></div>
           </div>

           <div className="absolute inset-0 flex items-center justify-center p-8 md:p-16">
              <svg viewBox="0 0 100 100" className="w-full h-full map-glow max-w-[80%] max-h-[80%]">
                 <path 
                    d={US_MAP_PATH} 
                    fill="rgba(15, 23, 42, 0.8)" 
                    stroke="rgba(37, 99, 235, 0.4)" 
                    strokeWidth="0.4" 
                    className="transition-all duration-1000"
                 />
                 <g className="nodes">
                    {MOCK_TERRITORIES.map((t) => {
                       const isOwned = ownedTerritories.includes(t.id);
                       const statusColor = isOwned ? "#2563eb" : t.status === 'AVAILABLE' ? "#10b981" : "#f59e0b";
                       const isSelected = selectedTerritory?.id === t.id;
                       
                       return (
                          <g key={t.id} onClick={() => handleOpenTerritory(t)} className="cursor-pointer group/node">
                             <circle 
                               cx={t.x} cy={t.y} r={isSelected ? 5 : 3.5} 
                               fill={statusColor} 
                               className="animate-pulse" 
                               opacity="0.15" 
                             />
                             <circle 
                               cx={t.x} cy={t.y} r={isSelected ? 2 : 1.4} 
                               fill={statusColor} 
                               stroke="white" 
                               strokeWidth="0.25" 
                               className="transition-all duration-500 group-hover/node:scale-[2] group-hover/node:filter group-hover/node:brightness-150" 
                             />
                             <text x={t.x + 2.5} y={t.y + 0.5} className="fill-slate-500 text-[1.8px] font-black uppercase tracking-widest pointer-events-none group-hover/node:fill-white transition-colors">{t.name}</text>
                          </g>
                       );
                    })}
                 </g>
              </svg>
           </div>

           <div className="absolute bottom-6 left-6 flex flex-col gap-4 z-20">
              <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex gap-6">
                <LegendItem color="bg-emerald-500" label="Lead Active" />
                <LegendItem color="bg-blue-600" label="Your Hub" />
                <LegendItem color="bg-amber-500" label="Restricted" />
              </div>
           </div>
           
           <div className="absolute top-6 right-6 flex flex-col gap-4 z-20">
              <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-2 w-56 shadow-2xl">
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                    <Activity size={12} className="text-emerald-500" /> Live Feed
                 </div>
                 <div className="space-y-2">
                    {liveLog.map((log, i) => (
                       <div key={i} className={`text-[9px] font-mono leading-tight flex items-start gap-2 ${i === 0 ? 'text-brand-primary' : 'text-slate-400'}`}>
                          <span className="opacity-30">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
                          <span className="truncate">{log}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* SIDE LIST */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 flex flex-col overflow-hidden shadow-sm">
           <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <h2 className="font-black text-xl italic tracking-tighter uppercase flex items-center gap-2">
                <Target className="text-brand-primary" size={20}/> Prime Zones
              </h2>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {filteredTerritories.map(t => (
                 <div key={t.id} onClick={() => handleOpenTerritory(t)} className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-transparent hover:border-brand-primary/40 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer group shadow-sm active:scale-95">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <div className="font-black text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors tracking-tight text-lg">{t.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">{t.state} • {t.leadsLast24h} Leads/day</div>
                       </div>
                       <div className="text-right">
                          <div className="font-black text-emerald-600 dark:text-emerald-400 text-lg tracking-tighter italic">${t.pricing.currentPrice.exclusive}</div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* DETAILED OVERLAY MODAL */}
      {selectedTerritory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedTerritory(null)}>
           <div className="w-full max-w-4xl bg-white dark:bg-slate-950 rounded-[3rem] shadow-2xl overflow-hidden relative border border-slate-200 dark:border-white/10 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedTerritory(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white transition-all z-50"><X size={24}/></button>
              
              <div className="flex-1 overflow-y-auto p-8 md:p-12">
                 <div className="space-y-12">
                     <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-black uppercase tracking-widest border border-brand-primary/20 mb-4">
                           <Crosshair size={14}/> Registry Key: {selectedTerritory.zipCodes[0]}
                        </div>
                        <h2 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none mb-6">{selectedTerritory.name}</h2>
                        
                        <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto border-t border-slate-200 dark:border-white/10 pt-8">
                           <div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Saturation</div>
                              <div className="text-4xl font-black text-slate-900 dark:text-white italic">{selectedTerritory.pricing.demandIndex}<span className="text-lg opacity-20 ml-1">/10</span></div>
                           </div>
                           <div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Yield</div>
                              <div className="text-4xl font-black text-brand-primary italic">$14k<span className="text-lg opacity-40 ml-1">+</span></div>
                           </div>
                        </div>
                     </div>

                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Strategic Privileges</h3>
                            <div className="space-y-4">
                               <BenefitItem icon={ShieldCheck} label="Exclusive Pipeline Access" />
                               <BenefitItem icon={Zap} label="Priority Signal Matching" />
                               <BenefitItem icon={Shield} label="Network Protection Plus" />
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-between">
                              Market Intel {isFetchingIntel && <Loader2 size={12} className="animate-spin text-brand-primary"/>}
                           </h3>
                           <div className="min-h-[160px]">
                              {areaIntel ? (
                                 <div className="space-y-4">
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed border-l-4 border-brand-primary pl-4">
                                       {areaIntel.text}
                                    </p>
                                    <div className="grid gap-2">
                                       {areaIntel.sources.slice(0, 2).map((s, i) => (
                                          <a key={i} href={s.uri} target="_blank" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 truncate">
                                             <ExternalLink size={10}/> {s.title}
                                          </a>
                                       ))}
                                    </div>
                                 </div>
                              ) : (
                                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <MapPin size={40} className="mb-2" />
                                    <span className="text-xs font-bold uppercase">Decrypting Sector Data...</span>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="pt-4">
                        {ownedTerritories.includes(selectedTerritory.id) ? (
                           <div className="w-full py-6 bg-emerald-500 text-white rounded-3xl flex items-center justify-center gap-4 shadow-xl">
                              <ShieldCheck size={32} />
                              <span className="font-black text-2xl italic tracking-tighter uppercase">Registry Locked</span>
                           </div>
                        ) : (
                           <button onClick={handleClaim} disabled={activeStep === 'SCANNING'} className="w-full py-6 bg-brand-primary text-white rounded-3xl font-black text-2xl italic tracking-tighter uppercase shadow-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                              {activeStep === 'SCANNING' ? <Loader2 className="animate-spin" size={32}/> : <><Zap size={32} /> SECURE REGISTRY NODE</>}
                           </button>
                        )}
                     </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const LegendItem = ({ color, label }: any) => (
   <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
   </div>
);

const BenefitItem = ({ icon: Icon, label }: any) => (
   <div className="flex items-center gap-4 group">
      <div className="p-2 bg-white dark:bg-white/10 rounded-xl text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm"><Icon size={20}/></div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
   </div>
);

export default TerritoryMarketplace;
