
import React from 'react';
import { View, UserProfile } from '../types';
import { Clock, CheckCircle, Wallet, Calendar, ChevronRight, MapPin, DollarSign, Users } from 'lucide-react';

interface SubcontractorDashboardProps {
  setView: (view: View) => void;
  profile: UserProfile;
}

const SubcontractorDashboard: React.FC<SubcontractorDashboardProps> = ({ setView, profile }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Work Console</h1>
           <p className="text-slate-500 font-medium">Technician: {profile.name}. Your active queue.</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-right">
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Payout</div>
           <div className="text-xl font-bold text-emerald-600">$840.00</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
         <button onClick={() => setView('OPERATIONS')} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 transition-all flex items-center gap-4 group">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Calendar size={24}/></div>
            <div className="text-left">
               <div className="font-bold text-lg">Daily Tasks</div>
               <div className="text-xs text-slate-500">4 jobs today</div>
            </div>
         </button>
         <button onClick={() => setView('CREW_MGMT')} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 transition-all flex items-center gap-4 group">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Users size={24}/></div>
            <div className="text-left">
               <div className="font-bold text-lg">My Crew</div>
               <div className="text-xs text-slate-500">Manage Status</div>
            </div>
         </button>
         <button onClick={() => setView('WALLET')} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 transition-all flex items-center gap-4 group">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Wallet size={24}/></div>
            <div className="text-left">
               <div className="font-bold text-lg">Earnings</div>
               <div className="text-xs text-slate-500">Sub-60s payouts</div>
            </div>
         </button>
      </div>

      <div className="space-y-4">
         <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Next Job</h2>
         <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl space-y-6">
            <div className="flex justify-between items-start">
               <div>
                  <div className="text-blue-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">Starts in 45 min</div>
                  <h3 className="text-2xl font-bold">Kitchen Tile Install</h3>
                  <p className="text-slate-400 text-sm mt-1">Contract: FairTrade Main #1042</p>
               </div>
               <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <MapPin size={24}/>
               </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
               <div className="flex-1">
                  <div className="text-xs text-slate-500 uppercase font-bold">Location</div>
                  <div className="text-sm font-medium">1500 South Congress, Austin</div>
               </div>
               <div className="flex-1">
                  <div className="text-xs text-slate-500 uppercase font-bold">Labor Yield</div>
                  <div className="text-sm font-medium text-emerald-400">$350.00</div>
               </div>
            </div>

            <button onClick={() => setView('OPERATIONS')} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
               Clock In / Start Evidence
            </button>
         </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
         <h3 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-widest">Completed this Week</h3>
         <div className="space-y-3">
            {[1, 2].map(i => (
               <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                     <CheckCircle size={18} className="text-emerald-500" />
                     <span className="text-sm font-bold text-slate-700">Project Alpha-{i}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">+$240.00</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default SubcontractorDashboard;
