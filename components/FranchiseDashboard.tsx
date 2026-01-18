
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, MapPin, DollarSign, AlertTriangle, ArrowRight, Building } from 'lucide-react';

const REVENUE_DATA = [
  { name: 'Week 1', regionA: 4000, regionB: 2400 },
  { name: 'Week 2', regionA: 3000, regionB: 1398 },
  { name: 'Week 3', regionA: 2000, regionB: 9800 },
  { name: 'Week 4', regionA: 2780, regionB: 3908 },
  { name: 'Week 5', regionA: 1890, regionB: 4800 },
];

const FranchiseDashboard: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Franchise Network</h1>
          <p className="text-slate-500 dark:text-slate-400">Overview of 4 active territories and 12 technicians.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-xl font-bold border border-slate-200 dark:border-white/10 shadow-sm hover:bg-slate-50 transition-colors">
            Download Report
          </button>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-colors">
            Add Location
          </button>
        </div>
      </div>

      {/* Aggregated Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-slate-900">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                  <DollarSign size={20} />
               </div>
               <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">+14%</span>
            </div>
            <div className="text-2xl font-bold mb-1">$482,000</div>
            <div className="text-xs text-slate-500">Total Network Revenue (YTD)</div>
         </div>
         <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-slate-900">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                  <Building size={20} />
               </div>
            </div>
            <div className="text-2xl font-bold mb-1">4 Regions</div>
            <div className="text-xs text-slate-500">100% Territory Utilization</div>
         </div>
         <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-slate-900">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                  <Users size={20} />
               </div>
            </div>
            <div className="text-2xl font-bold mb-1">12 Techs</div>
            <div className="text-xs text-slate-500">8 Active on Job right now</div>
         </div>
         <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-slate-900">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl">
                  <AlertTriangle size={20} />
               </div>
               <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded">Action Req</span>
            </div>
            <div className="text-2xl font-bold mb-1">3 Alerts</div>
            <div className="text-xs text-slate-500">Inventory Low (North Region)</div>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* Main Chart */}
         <div className="lg:col-span-2 glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900">
            <h3 className="font-bold text-lg mb-6">Regional Performance</h3>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA}>
                     <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                     />
                     <Area type="monotone" dataKey="regionA" stackId="1" stroke="#2563eb" fill="#2563eb" name="Austin Central" />
                     <Area type="monotone" dataKey="regionB" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Round Rock" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Territory Status List */}
         <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900">
            <h3 className="font-bold text-lg mb-6">Active Locations</h3>
            <div className="space-y-4">
               {[
                  { name: 'Austin Central (HQ)', status: 'Healthy', revenue: '$124k', manager: 'Sarah J.' },
                  { name: 'Round Rock', status: 'Growing', revenue: '$86k', manager: 'Mike R.' },
                  { name: 'San Marcos', status: 'Warning', revenue: '$42k', manager: 'Pending' },
                  { name: 'Georgetown', status: 'Healthy', revenue: '$68k', manager: 'Tom B.' },
               ].map((loc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary-500 transition-colors cursor-pointer group">
                     <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary-600">{loc.name}</div>
                        <div className="text-xs text-slate-500">{loc.manager}</div>
                     </div>
                     <div className="text-right">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{loc.revenue}</div>
                        <div className={`text-[10px] font-bold uppercase ${
                           loc.status === 'Healthy' ? 'text-emerald-500' : 
                           loc.status === 'Growing' ? 'text-blue-500' : 'text-amber-500'
                        }`}>{loc.status}</div>
                     </div>
                  </div>
               ))}
               <button className="w-full py-3 mt-2 text-sm font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/10 rounded-xl hover:bg-primary-100 transition-colors flex items-center justify-center gap-2">
                  View All Locations <ArrowRight size={16} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FranchiseDashboard;
