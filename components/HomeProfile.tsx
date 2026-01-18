
import React, { useState } from 'react';
import { Home, Wrench, Thermometer, Droplets, Zap, AlertCircle, CheckCircle, Clock, Plus, X, Save, Image, Star, Briefcase, MapPin, Globe, PenTool, Sparkles, Brain } from 'lucide-react';
import { UserRole } from '../types';
import { analyzeHomeHealth } from '../services/geminiService';

interface HomeProfileProps {
   role?: UserRole; // Added role prop
}

interface HomeSystem {
   name: string;
   age: string;
   status: string;
   nextService: string;
   icon: any;
}

interface MaintenanceTask {
   title: string;
   due: string;
   urgent: boolean;
}

const INITIAL_SYSTEMS = [
   { name: 'HVAC Unit', age: '8 years', status: 'GOOD', nextService: 'Nov 2025', icon: Thermometer },
   { name: 'Water Heater', age: '12 years', status: 'REPLACE_SOON', nextService: 'Overdue', icon: Droplets },
   { name: 'Main Panel', age: '2 years', status: 'EXCELLENT', nextService: '2028', icon: Zap },
   { name: 'Roof', age: '15 years', status: 'FAIR', nextService: 'Inspect 2024', icon: Home },
];

const INITIAL_TASKS = [
   { title: 'Change Air Filter', due: 'In 2 days', urgent: false },
   { title: 'Flush Water Heater', due: 'Overdue by 3 mo', urgent: true },
   { title: 'Clean Gutters', due: 'Next month', urgent: false },
];

const HomeProfile: React.FC<HomeProfileProps> = ({ role }) => {
  // Homeowner State
  const [systems, setSystems] = useState<HomeSystem[]>(INITIAL_SYSTEMS);
  const [tasks, setTasks] = useState<MaintenanceTask[]>(INITIAL_TASKS);
  const [showAddSystem, setShowAddSystem] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newSystem, setNewSystem] = useState({ name: '', age: '', status: 'GOOD', nextService: '' });
  const [newTask, setNewTask] = useState({ title: '', due: '', urgent: false });

  // Contractor State
  const [bizBio, setBizBio] = useState("We are a family-owned plumbing business serving Austin for over 20 years. Certified experts in leak detection and pipe repair.");
  const [tags, setTags] = useState(['Plumbing', 'Emergency', 'Residential', 'Commercial']);
  const [portfolio, setPortfolio] = useState([
     'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
     'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=400'
  ]);

  // --- CONTRACTOR VIEW (Business Profile) ---
  if (role === UserRole.CONTRACTOR) {
     return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fadeIn">
           <div className="flex justify-between items-end mb-6">
              <div>
                 <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Public Business Profile</h1>
                 <p className="text-slate-500">This is how homeowners see you in the marketplace.</p>
              </div>
              <button className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all active:scale-95 flex items-center gap-2">
                 <Save size={18}/> Save Changes
              </button>
           </div>

           {/* Profile Header Card */}
           <div className="glass-panel rounded-[3rem] bg-white dark:bg-slate-900 overflow-hidden shadow-xl border border-slate-200 dark:border-white/5 relative">
              <div className="h-48 bg-slate-200 dark:bg-slate-800 relative group cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                    <button className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Image size={14}/> Change Cover</button>
                 </div>
              </div>
              <div className="px-10 pb-10 relative">
                 <div className="flex justify-between items-end -mt-12 mb-6">
                    <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-2xl relative group cursor-pointer">
                       <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300" className="w-full h-full rounded-2xl object-cover" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded-3xl transition-opacity">
                          <PenTool className="text-white" size={24}/>
                       </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                       <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500">
                          ID: #8842
                       </div>
                       <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle size={14}/> Verified Pro
                       </div>
                    </div>
                 </div>
                 
                 <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <div>
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Mike's Plumbing Co.</h2>
                          <div className="flex items-center gap-4 text-slate-500 text-sm font-bold">
                             <span className="flex items-center gap-1"><MapPin size={14}/> Austin, TX</span>
                             <span className="flex items-center gap-1"><Globe size={14}/> mikesplumbing.com</span>
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">About Us</label>
                          <textarea 
                             value={bizBio} 
                             onChange={(e) => setBizBio(e.target.value)}
                             className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-primary transition-colors h-32 resize-none"
                          />
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 flex justify-between items-center">
                          <div>
                             <div className="text-xs font-bold uppercase text-slate-400 mb-1">Reputation Score</div>
                             <div className="flex items-center gap-2">
                                <span className="text-3xl font-black text-slate-900 dark:text-white">4.9</span>
                                <div className="flex text-amber-400"><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/></div>
                             </div>
                             <span className="text-xs font-bold text-slate-500">Based on 142 Verified Jobs</span>
                          </div>
                          <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                             <Briefcase className="text-brand-primary" size={24}/>
                          </div>
                       </div>

                       <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Service Tags</label>
                          <div className="flex flex-wrap gap-2">
                             {tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                   {tag} <button onClick={() => setTags(tags.filter(t => t !== tag))}><X size={12} className="hover:text-red-500"/></button>
                                </span>
                             ))}
                             <button className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold hover:bg-brand-primary hover:text-white transition-colors flex items-center gap-1">
                                <Plus size={12}/> Add
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Portfolio Grid */}
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Project Portfolio</h3>
                 <button className="text-xs font-bold text-brand-primary uppercase tracking-widest hover:underline flex items-center gap-1"><Plus size={14}/> Add Project</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {portfolio.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer">
                       <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40"><PenTool size={16}/></button>
                          <button onClick={() => setPortfolio(portfolio.filter((_, idx) => idx !== i))} className="p-2 bg-rose-500/80 backdrop-blur rounded-full text-white hover:bg-rose-600"><X size={16}/></button>
                       </div>
                    </div>
                 ))}
                 <button className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all gap-2">
                    <Image size={32}/>
                    <span className="text-xs font-bold uppercase">Upload</span>
                 </button>
              </div>
           </div>
        </div>
     );
  }

  // --- HOMEOWNER VIEW (Existing) ---
  const handleAddSystem = () => {
     if(!newSystem.name) return;
     setSystems([...systems, { ...newSystem, icon: Wrench }]);
     setShowAddSystem(false);
     setNewSystem({ name: '', age: '', status: 'GOOD', nextService: '' });
  };

  const handleAddTask = () => {
     if(!newTask.title) return;
     setTasks([...tasks, newTask]);
     setShowAddTask(false);
     setNewTask({ title: '', due: '', urgent: false });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fadeIn">
      <div className="glass-panel p-10 rounded-[3rem] bg-white dark:bg-slate-900 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
         <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="w-28 h-28 bg-brand-surface dark:bg-slate-800 rounded-3xl flex items-center justify-center text-brand-primary border-4 border-white dark:border-white/5 shadow-xl">
               <Home size={56} />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
               <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Property</h1>
               <p className="text-slate-500 text-lg font-medium">1500 South Congress Ave, Austin TX</p>
               <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                  <Badge label="2,400 sqft" />
                  <Badge label="Built 1984" />
                  <Badge label="3 Bed / 2 Bath" />
                  <div className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full text-sm flex items-center gap-2 border border-emerald-100 dark:border-emerald-500/20">
                     <TrendingUpIcon /> Est. Value: $1.2M
                  </div>
               </div>
            </div>
            <div className="text-center p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
               <div className="text-5xl font-black text-brand-primary">{predictions?.overallHealthScore || 84}</div>
               <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Health Score</div>
               {isAnalyzing && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center"><Sparkles className="animate-spin text-brand-primary"/></div>}
            </div>
         </div>
      </div>

      {/* AI Predictions Section */}
      {predictions && (
        <div className="animate-fadeIn">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Brain className="text-brand-primary"/> AI Predictive Diagnostics
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {predictions.predictions.map((pred: any, i: number) => (
              <div key={i} className="glass-panel p-6 rounded-3xl border-l-4 border-l-brand-primary">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{pred.systemName}</h3>
                  <span className={`text-xs font-black px-2 py-1 rounded uppercase ${
                    pred.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 
                    pred.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>{pred.riskLevel} Risk</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{pred.reasoning}</p>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex gap-2 items-center">
                  <Wrench size={14} className="text-brand-primary"/>
                  {pred.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Systems Grid */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-2">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Home Systems</h2>
               <div className="flex gap-2">
                 <button onClick={handleRunDiagnostics} disabled={isAnalyzing} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-brand-secondary hover:bg-brand-primary px-4 py-2 rounded-xl transition-colors shadow-lg shadow-brand-primary/20">
                    {isAnalyzing ? <Sparkles className="animate-spin" size={16}/> : <Brain size={16}/>}
                    {isAnalyzing ? 'Analyzing...' : 'Run Diagnostics'}
                 </button>
                 <button onClick={() => setShowAddSystem(true)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-primary hover:text-brand-secondary bg-brand-primary/10 px-4 py-2 rounded-xl transition-colors">
                    <Plus size={16} /> Add System
                 </button>
               </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-5">
               {systems.map((sys, i) => (
                  <div key={i} className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-brand-primary transition-all cursor-pointer group hover:shadow-xl">
                     <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-brand-surface dark:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-300 group-hover:bg-brand-primary group-hover:text-white transition-colors shadow-sm">
                           <sys.icon size={24} />
                        </div>
                        <StatusBadge status={sys.status} />
                     </div>
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{sys.name}</h3>
                     <div className="flex justify-between text-xs font-bold text-slate-400 mt-3 border-t border-slate-100 dark:border-white/5 pt-3">
                        <span>Age: {sys.age}</span>
                        <span>Service: {sys.nextService}</span>
                     </div>
                  </div>
               ))}
               
               {showAddSystem && (
                  <div className="glass-panel p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col gap-3 animate-fadeIn">
                     <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm">New System</span>
                        <button onClick={() => setShowAddSystem(false)}><X size={16} className="text-slate-400"/></button>
                     </div>
                     <input className="w-full p-2 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-sm" placeholder="Name (e.g. Sump Pump)" value={newSystem.name} onChange={e => setNewSystem({...newSystem, name: e.target.value})} />
                     <input className="w-full p-2 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-sm" placeholder="Age (e.g. 2 years)" value={newSystem.age} onChange={e => setNewSystem({...newSystem, age: e.target.value})} />
                     <select className="w-full p-2 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-sm" value={newSystem.status} onChange={e => setNewSystem({...newSystem, status: e.target.value})}>
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="REPLACE_SOON">Replace Soon</option>
                     </select>
                     <button onClick={handleAddSystem} className="mt-2 w-full py-2 bg-brand-primary text-white rounded-lg font-bold text-sm">Save</button>
                  </div>
               )}
            </div>
         </div>

         {/* Maintenance Checklist */}
         <div>
            <div className="flex justify-between items-center px-2 mb-6">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance</h2>
               <button onClick={() => setShowAddTask(true)} className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary/20"><Plus size={20}/></button>
            </div>
            
            <div className="glass-panel p-8 rounded-[2rem] bg-white dark:bg-slate-900 space-y-6 shadow-xl">
               {tasks.map((task, i) => (
                  <div key={i} className="flex gap-4 items-start pb-5 border-b border-slate-100 dark:border-white/5 last:border-0 group">
                     <div className="mt-1">
                        {task.urgent ? <AlertCircle size={20} className="text-rose-500 animate-pulse" /> : <Clock size={20} className="text-slate-300" />}
                     </div>
                     <div className="flex-1">
                        <div className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">{task.title}</div>
                        <div className={`text-xs font-bold mt-1 ${task.urgent ? 'text-rose-500' : 'text-slate-400'}`}>{task.due}</div>
                     </div>
                     <button className="text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-full transition-all">
                        <CheckCircle size={24} />
                     </button>
                  </div>
               ))}

               {showAddTask && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl animate-fadeIn space-y-3 border border-slate-200 dark:border-white/10">
                     <input className="w-full p-2 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-sm" placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                     <div className="flex gap-2">
                        <input className="flex-1 p-2 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-sm" placeholder="Due Date" value={newTask.due} onChange={e => setNewTask({...newTask, due: e.target.value})} />
                        <button onClick={() => setNewTask({...newTask, urgent: !newTask.urgent})} className={`px-3 rounded-lg border text-xs font-bold ${newTask.urgent ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-white text-slate-400 border-slate-200'}`}>Urgent</button>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => setShowAddTask(false)} className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold">Cancel</button>
                        <button onClick={handleAddTask} className="flex-1 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold">Add Task</button>
                     </div>
                  </div>
               )}

               <button className="w-full py-4 bg-brand-surface dark:bg-slate-800 text-brand-secondary dark:text-slate-300 font-bold rounded-2xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest">
                  View Full Schedule
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

const Badge = ({ label }: { label: string }) => (
   <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-full text-sm font-bold border border-slate-200 dark:border-white/5">
      {label}
   </span>
);

const TrendingUpIcon = () => (
   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
   </svg>
);

const StatusBadge = ({ status }: { status: string }) => {
   const config = 
      status === 'GOOD' || status === 'EXCELLENT' ? { color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-500/20', label: status } :
      status === 'FAIR' ? { color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-500/20', label: status } :
      { color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-500/20', label: 'ATTENTION' };
      
   return (
      <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase border ${config.color}`}>
         {config.label.replace('_', ' ')}
      </span>
   );
}

export default HomeProfile;
