
import React from 'react';
import { Shield, AlertTriangle, Users, DollarSign, Map, Activity } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Platform Administration</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Live Revenue Card */}
         <div className="glass-panel p-6 rounded-2xl bg-slate-900 text-white col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10 flex justify-between items-start">
               <div>
                  <div className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-2">Live GMV (Today)</div>
                  <div className="text-5xl font-bold mb-2">$142,850</div>
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                     <Activity size={16} /> +22% vs last Tuesday
                  </div>
               </div>
               <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                  <DollarSign size={32} />
               </div>
            </div>
            <div className="mt-8 h-32 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                     {name: '00:00', val: 400}, {name: '04:00', val: 200}, {name: '08:00', val: 2400}, 
                     {name: '12:00', val: 4800}, {name: '16:00', val: 3200}, {name: '20:00', val: 1800}
                  ]}>
                     <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Verification Queue */}
         <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg flex items-center gap-2">
                  <Shield size={20} className="text-primary-600" /> Approvals
               </h3>
               <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">12 Pending</span>
            </div>
            <div className="space-y-3">
               {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">JD</div>
                        <div>
                           <div className="font-bold text-xs text-slate-900 dark:text-white">John Doe</div>
                           <div className="text-[10px] text-slate-500">License Verification</div>
                        </div>
                     </div>
                     <button className="text-xs font-bold text-primary-600 hover:underline">Review</button>
                  </div>
               ))}
            </div>
            <button className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm">
               View All
            </button>
         </div>
      </div>

      {/* Grid Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <AdminStatCard title="Active Territories" value="854" sub="68% Utilization" icon={Map} color="text-purple-500" />
         <AdminStatCard title="Total Users" value="12,405" sub="+120 this week" icon={Users} color="text-blue-500" />
         <AdminStatCard title="Disputes" value="3" sub="Needs Attention" icon={AlertTriangle} color="text-red-500" />
         <AdminStatCard title="Recurring Rev" value="$84k" sub="Monthly" icon={DollarSign} color="text-emerald-500" />
      </div>
    </div>
  );
};

const AdminStatCard = ({ title, value, sub, icon: Icon, color }: { title: string, value: string, sub: string, icon: any, color: string }) => (
   <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
      <div className="flex justify-between items-start mb-2">
         <div className={`p-2 bg-slate-50 dark:bg-slate-800 rounded-lg ${color}`}>
            <Icon size={20} />
         </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-500 font-bold uppercase">{title}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
   </div>
);

export default AdminDashboard;
