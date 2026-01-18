
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { 
  DollarSign, TrendingUp, Search, 
  FileText, Phone, Map, Briefcase,
  Shield, Layers, ArrowUpRight,
  Target, Clock, CheckCircle2, Trophy, Users
} from 'lucide-react';
import { UserProfile, View } from '../types';
import DailyBriefing from './DailyBriefing';

const REVENUE_DATA = [
  { name: 'Mon', income: 4200 }, { name: 'Tue', income: 3800 }, { name: 'Wed', income: 5500 },
  { name: 'Thu', income: 4100 }, { name: 'Fri', income: 6800 }, { name: 'Sat', income: 8450 }, { name: 'Sun', income: 2400 },
];

interface ContractorDashboardProps {
  onFindLeadsClick: () => void;
  setView: (view: View) => void;
  profile: UserProfile;
}

const ContractorDashboard: React.FC<ContractorDashboardProps> = ({ onFindLeadsClick, setView, profile }) => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                 Elite Tier
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
              </span>
           </div>
           <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Mission Control</h1>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setView('VOICE_COMMAND')} className="flex-1 md:flex-none px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all">
             <Phone size={16} /> Voice Hub
          </button>
          <button onClick={onFindLeadsClick} className="flex-1 md:flex-none px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all">
             <Search size={16} /> Find Work
          </button>
        </div>
      </div>

      {/* Hero Component: Daily Briefing */}
      <DailyBriefing profile={profile} />

      {/* Metrics Grid - Stacked on Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <MetricCard label="Jobs Today" value="4" sub="1 urgent" icon={Briefcase} color="text-amber-600" bg="bg-amber-100 dark:bg-amber-900/20" />
         <MetricCard label="Balance" value="$3,450" sub="Available" icon={DollarSign} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-900/20" />
         <MetricCard label="Revenue" value="$12.4k" sub="+12% WTD" icon={TrendingUp} color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900/20" />
         <MetricCard 
            label="Workforce" 
            value="4/6 Active" 
            sub="2 Idle" 
            icon={Users} 
            color="text-indigo-600" 
            bg="bg-indigo-100 dark:bg-indigo-900/20" 
            onClick={() => setView('CREW_MGMT')}
         />
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIWidget 
          label="Bid Success Rate" 
          value="34%" 
          sub="Top 15% of Pros" 
          icon={Target} 
          trend="+2.4%" 
          trendPositive={true}
        />
        <KPIWidget 
          label="Avg Response Time" 
          value="12m" 
          sub="Goal: <15m" 
          icon={Clock} 
          trend="-3m" 
          trendPositive={true} 
        />
        <KPIWidget 
          label="Completion Rate" 
          value="98%" 
          sub="50 Projects YTD" 
          icon={CheckCircle2} 
          trend="Top Tier" 
          trendPositive={true} 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* Performance Chart */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers size={18} className="text-blue-600"/> Revenue Velocity
               </h3>
               <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase rounded-lg px-2 py-1 outline-none">
                  <option>This Week</option>
                  <option>This Month</option>
               </select>
            </div>
            
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA}>
                     <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                     <XAxis dataKey="name" fontSize={10} fontWeight={700} stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                     />
                     <Area type="monotone" dataKey="income" stroke="#2563eb" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Quick Actions Toolbox */}
         <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex-1">
               <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4">Pro Toolbox</h3>
               <div className="grid grid-cols-2 gap-3">
                  <QuickAction icon={FileText} label="New Quote" onClick={() => setView('ESTIMATES')} />
                  <QuickAction icon={Briefcase} label="Jobs" onClick={() => setView('OPERATIONS')} />
                  <QuickAction icon={Search} label="Leads" onClick={() => setView('MARKETPLACE')} />
                  <QuickAction icon={Users} label="Crew" onClick={() => setView('CREW_MGMT')} />
               </div>
            </div>
            
            <button onClick={() => setView('SETTINGS')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-colors">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                     <Shield size={18} className="text-emerald-500" />
                  </div>
                  <div className="text-left">
                     <div className="text-xs font-black uppercase text-slate-900 dark:text-white">Insurance Status</div>
                     <div className="text-[10px] font-bold text-slate-400">Active • $2M Coverage</div>
                  </div>
               </div>
               <ArrowUpRight size={16} className="text-slate-400 group-hover:text-blue-500" />
            </button>
         </div>
      </div>
    </div>
  );
};

const KPIWidget = ({ label, value, sub, icon: Icon, trend, trendPositive }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:border-blue-500/30 transition-all">
    <div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
        <Icon size={12} className="text-blue-500" /> {label}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
        <div className={`text-[10px] font-bold ${trendPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend}
        </div>
      </div>
      <div className="text-xs font-medium text-slate-500 mt-1">{sub}</div>
    </div>
    <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
      <Icon size={24} strokeWidth={1.5} />
    </div>
  </div>
);

const MetricCard = ({ label, value, sub, icon: Icon, color, bg, onClick }: any) => (
   <div 
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-full ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform hover:border-blue-500/50' : ''}`}
   >
      <div className="flex justify-between items-start mb-3">
         <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
            <Icon size={20} />
         </div>
         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
      </div>
      <div>
         <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
         <div className="text-xs font-medium text-slate-500 mt-1">{sub}</div>
      </div>
   </div>
);

const QuickAction = ({ icon: Icon, label, onClick }: any) => (
   <button onClick={onClick} className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50 transition-all gap-2 group">
      <Icon size={20} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">{label}</span>
   </button>
);

export default ContractorDashboard;
