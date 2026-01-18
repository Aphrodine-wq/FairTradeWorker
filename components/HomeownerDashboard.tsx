
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
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      {/* Welcome & Health Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Welcome Back</div>
           <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Property Hub</h1>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm w-full md:w-auto">
           <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                 <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                 <path className="text-emerald-500" strokeDasharray="84, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
              <div className="absolute font-black text-sm text-slate-900 dark:text-white">84</div>
           </div>
           <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Home Health</div>
              <div className="text-xs text-slate-500 font-medium">3 Tasks Pending</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
         <HomeTile icon={Search} label="Find Pro" sub="Hire verified" onClick={() => setView('MARKETPLACE')} color="text-blue-600" />
         <HomeTile icon={Plus} label="Post Job" sub="Get estimates" onClick={onPostJobClick} color="text-emerald-600" />
         <HomeTile icon={Home} label="My Home" sub="Systems & age" onClick={() => setView('PROFILE')} color="text-purple-600" />
         <HomeTile icon={Wallet} label="Payments" sub="Escrow status" onClick={() => setView('WALLET')} color="text-amber-600" />
      </div>

      <div className="bg-brand-primary rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
               <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-blue-200">System Alert</span>
               </div>
               <h3 className="text-2xl font-bold">Seasonal Maintenance</h3>
               <p className="text-blue-100 text-sm font-medium max-w-md">HVAC inspection due. Warranties expire in 30 days without record.</p>
            </div>
            <button onClick={onPostJobClick} className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg active:scale-95 w-full md:w-auto">
               Find an HVAC Pro
            </button>
         </div>
      </div>

      <div className="space-y-4">
         <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Requests</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userJobs.length > 0 ? userJobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full hover:border-brand-primary transition-colors cursor-pointer group">
                 <div className="flex justify-between items-start mb-4">
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${job.status === 'Open' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-green-50 text-green-600'}`}>
                       {job.status}
                    </div>
                    <span className="text-xs font-bold text-slate-400">{job.postedDate}</span>
                 </div>
                 <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{job.title}</h3>
                 <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">{job.description}</p>
                 
                 {/* Visual Progress Steps */}
                 <div className="mt-auto mb-4 flex items-center justify-between relative px-2">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-0"></div>
                    {['POSTED', 'BIDDING', 'SCHEDULED', 'WORKING', 'COMPLETE'].map((step, i) => {
                       const currentStageIndex = ['POSTED', 'BIDDING', 'SCHEDULED', 'WORKING', 'COMPLETE'].indexOf(job.stage || 'POSTED');
                       const isCompleted = i <= currentStageIndex;
                       return (
                          <div key={step} className="relative z-10 flex flex-col items-center gap-1 group/step">
                             <div className={`w-3 h-3 rounded-full border-2 transition-all ${isCompleted ? 'bg-brand-primary border-brand-primary' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'}`}></div>
                             <span className={`text-[8px] font-bold uppercase absolute top-4 opacity-0 group-hover/step:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white px-1.5 py-0.5 rounded ${isCompleted ? 'text-brand-primary' : 'text-slate-400'}`}>{step}</span>
                          </div>
                       )
                    })}
                 </div>

                 <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-brand-primary dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                    View Details <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
            )) : (
              <button onClick={onPostJobClick} className="col-span-full py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-slate-800/50 transition-all group">
                 <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus size={24} />
                 </div>
                 <span className="font-bold text-sm">Post your first project</span>
              </button>
            )}
         </div>
      </div>
    </div>
  );
};

const HomeTile = ({ icon: Icon, label, sub, onClick, color }: any) => (
   <button onClick={onClick} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary/50 hover:shadow-md transition-all flex flex-col items-center text-center gap-3">
      <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${color}`}>
         <Icon size={20} />
      </div>
      <div>
         <div className="text-sm font-bold text-slate-900 dark:text-white">{label}</div>
         <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden md:block">{sub}</div>
      </div>
   </button>
);

export default HomeownerDashboard;
