
import React from 'react';
import { View, UserProfile } from '../types';
import { Clock, CheckCircle, Calendar, Wrench, Navigation } from 'lucide-react';

interface CrewDashboardProps {
  setView: (view: View) => void;
  profile: UserProfile;
}

const CrewDashboard: React.FC<CrewDashboardProps> = ({ setView, profile }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Task Console</h1>
           <p className="text-slate-500 font-medium">Crew Member: {profile.name}. Your schedule today.</p>
        </div>
        <div className="p-4 bg-blue-600 text-white rounded-xl shadow-md text-right">
           <div className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Shift Status</div>
           <div className="text-xl font-bold">On Deck</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <button onClick={() => setView('OPERATIONS')} className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:scale-[1.02] transition-all duration-300 flex items-center gap-4 group">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Calendar size={24}/></div>
            <div className="text-left">
               <div className="font-bold text-lg text-slate-900 dark:text-white">My Assignments</div>
               <div className="text-xs text-slate-500">3 tasks remaining</div>
            </div>
         </button>
         <button className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:scale-[1.02] transition-all duration-300 flex items-center gap-4 group">
            <div className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors"><Clock size={24}/></div>
            <div className="text-left">
               <div className="font-bold text-lg text-slate-900 dark:text-white">Time Sheet</div>
               <div className="text-xs text-slate-500">6.5 hours this week</div>
            </div>
         </button>
      </div>

      <div className="space-y-4">
         <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Current Job</h2>
         <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl space-y-6">
            <div className="flex justify-between items-start">
               <div>
                  <div className="text-blue-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">Arrival Expected: 08:30 AM</div>
                  <h3 className="text-2xl font-bold">HVAC Filter & Coil Clean</h3>
                  <p className="text-slate-400 text-sm mt-1">Lead Tech: Mike Robertson</p>
               </div>
               <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <Navigation size={24}/>
               </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
               <div className="flex-1">
                  <div className="text-xs text-slate-500 uppercase font-bold">Address</div>
                  <div className="text-sm font-medium">2401 E 6th St, Austin</div>
               </div>
               <div className="flex-1">
                  <div className="text-xs text-slate-500 uppercase font-bold">Job Type</div>
                  <div className="text-sm font-medium">Maintenance</div>
               </div>
            </div>

            <button onClick={() => setView('OPERATIONS')} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
               <Clock size={20} /> Clock In at Location
            </button>
         </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
         <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Equipment Check</h3>
         <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
               <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Safety Gear (PPE)</span>
               </div>
               <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Verified</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
               <div className="flex items-center gap-3">
                  <Wrench size={18} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Standard Tool Kit</span>
               </div>
               <span className="text-[10px] font-bold text-slate-400 uppercase">Pending</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CrewDashboard;
