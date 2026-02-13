
import React from 'react';
import { Job, View, UserProfile } from '../types';
import { ChevronRight, Plus, User, Wallet, Search, Home, Activity, Check } from 'lucide-react';

interface HomeownerDashboardProps {
  userJobs: Job[];
  onPostJobClick: () => void;
  setView: (view: View) => void;
  profile: UserProfile;
}

const HomeownerDashboard: React.FC<HomeownerDashboardProps> = ({ userJobs, onPostJobClick, setView, profile }) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24">
      {/* Welcome & Health Header */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col justify-center space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Property Hub
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
             Welcome Home, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{profile.name.split(' ')[0]}</span>.
           </h1>
           <p className="text-slate-500 font-medium">Your property is running smoothly. 3 systems active.</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-blue-500/30 transition-all">
           <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
           <div>
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">84<span className="text-lg text-emerald-500 align-top">+2</span></div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Score</div>
           </div>
           <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                 <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                 <path className="text-emerald-500 drop-shadow-sm" strokeDasharray="84, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                 <Activity size={18} />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <HomeTile icon={Search} label="Find Pro" sub="Verified Experts" onClick={() => setView('MARKETPLACE')} color="bg-blue-500 text-white shadow-blue-500/30" />
         <HomeTile icon={Plus} label="Post Job" sub="Get Estimates" onClick={onPostJobClick} color="bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" />
         <HomeTile icon={Home} label="My Home" sub="System Health" onClick={() => setView('PROFILE')} color="bg-indigo-500 text-white shadow-indigo-500/30" />
         <HomeTile icon={Wallet} label="Payments" sub="Escrow Safe" onClick={() => setView('WALLET')} color="bg-amber-500 text-white shadow-amber-500/30" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                 Active Projects
              </h2>
              <button onClick={() => setView('MARKETPLACE')} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">View All</button>
           </div>
           
           <div className="grid gap-4">
              {userJobs.length > 0 ? userJobs.map(job => (
                <div key={job.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{job.title}</h3>
                         <span className="text-xs font-bold text-slate-400">{job.postedDate} • {job.location}</span>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${job.status === 'Open' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-green-50 text-green-600'}`}>
                         {job.status}
                      </div>
                   </div>
                   
                   {/* Visual Progress Steps */}
                   <div className="mt-6 mb-2 flex items-center justify-between relative px-2">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-0 rounded-full"></div>
                      {['POSTED', 'BIDDING', 'SCHEDULED', 'WORKING', 'COMPLETE'].map((step, i) => {
                         const currentStageIndex = ['POSTED', 'BIDDING', 'SCHEDULED', 'WORKING', 'COMPLETE'].indexOf(job.stage || 'POSTED');
                         const isCompleted = i <= currentStageIndex;
                         const isCurrent = i === currentStageIndex;
                         return (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-2 group/step">
                               <div className={`w-4 h-4 rounded-full border-[3px] transition-all shadow-sm ${isCompleted ? 'bg-white border-blue-600 scale-110' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                                  {isCompleted && <div className="w-full h-full bg-blue-600 rounded-full scale-50"></div>}
                               </div>
                               <span className={`text-[9px] font-bold uppercase absolute top-6 transition-all whitespace-nowrap px-2 py-1 rounded-lg ${isCurrent ? 'bg-slate-900 text-white opacity-100 translate-y-0' : 'text-slate-400 opacity-0 group-hover/step:opacity-100 group-hover/step:translate-y-0 -translate-y-1'}`}>{step}</span>
                            </div>
                         )
                      })}
                   </div>
                </div>
              )) : (
                <button onClick={onPostJobClick} className="py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-all group">
                   <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                      <Plus size={32} />
                   </div>
                   <span className="font-bold text-lg">Start a New Project</span>
                   <span className="text-xs font-medium opacity-70 mt-1">Get estimates in minutes</span>
                </button>
              )}
           </div>
        </div>

        <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                 Insights
            </h2>
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px] -mr-10 -mt-10"></div>
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Activity size={18} className="text-emerald-400" />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-widest text-slate-400">System Alert</span>
                  </div>
                  <div>
                     <h3 className="text-xl font-bold mb-1">HVAC Maintenance</h3>
                     <p className="text-slate-400 text-sm leading-relaxed">System efficiency dropped 12% since last month. Recommended inspection.</p>
                  </div>
                  <button onClick={onPostJobClick} className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg">
                     Find Pro
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
               <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Stats</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Wallet size={16}/></div>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Escrow</span>
                     </div>
                     <span className="font-black text-slate-900 dark:text-white">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Check size={16}/></div>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Completed</span>
                     </div>
                     <span className="font-black text-slate-900 dark:text-white">12</span>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const HomeTile = ({ icon: Icon, label, sub, onClick, color }: any) => (
   <button onClick={onClick} className="group relative p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent transition-all hover:-translate-y-1 hover:shadow-xl text-left overflow-hidden">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${color.split(' ')[0]}`}></div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color}`}>
         <Icon size={24} />
      </div>
      <div>
         <div className="text-lg font-black text-slate-900 dark:text-white mb-1">{label}</div>
         <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{sub}</div>
      </div>
   </button>
);

export default HomeownerDashboard;
