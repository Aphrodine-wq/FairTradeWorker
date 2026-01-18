
import React, { useState } from 'react';
import { CrewMember, TimeSheetEntry, UserRole } from '../types';
import { 
  Users, Clock, MapPin, Battery, BatteryCharging, 
  CheckCircle2, XCircle, AlertTriangle, Play, Pause, 
  TrendingUp, Calendar, FileText, Download, Check, Plus, X,
  Mail, Phone, Shield, UserPlus, Briefcase, Award, ChevronDown,
  MoreVertical, Trash2, Pencil
} from 'lucide-react';

const MOCK_CREW: CrewMember[] = [
  { 
    id: '1', name: 'Alex Johnson', role: 'Foreman', status: 'ACTIVE', 
    currentLocation: '123 Pine St', lastActive: '2m ago', batteryLevel: 85, 
    avatar: 'A', weeklyHours: 32.5, phone: '(555) 123-4567', email: 'alex@crew.com',
    skills: ['OSHA 30', 'Heavy Machinery', 'Leadership']
  },
  { 
    id: '2', name: 'Mike Smith', role: 'Technician', status: 'ACTIVE', 
    currentLocation: '123 Pine St', lastActive: '5m ago', batteryLevel: 42, 
    avatar: 'M', weeklyHours: 30.0, phone: '(555) 234-5678', email: 'mike@crew.com',
    skills: ['Electrical L2', 'Drywall']
  },
  { 
    id: '3', name: 'Sarah Lee', role: 'Apprentice', status: 'BREAK', 
    currentLocation: '123 Pine St', lastActive: '15m ago', batteryLevel: 90, 
    avatar: 'S', weeklyHours: 28.5, phone: '(555) 345-6789', email: 'sarah@crew.com',
    skills: ['Painting', 'Cleanup']
  },
  { 
    id: '4', name: 'David Chen', role: 'Driver', status: 'IDLE', 
    currentLocation: 'HQ - North', lastActive: '1h ago', batteryLevel: 15, 
    avatar: 'D', weeklyHours: 35.0, phone: '(555) 456-7890', email: 'david@crew.com',
    skills: ['CDL Class B', 'Forklift']
  },
];

const MOCK_TIMESHEETS: TimeSheetEntry[] = [
  { id: 'ts1', crewId: '1', date: '2023-11-14', clockIn: '08:00 AM', clockOut: '04:30 PM', totalHours: 8.5, status: 'APPROVED' },
  { id: 'ts2', crewId: '2', date: '2023-11-14', clockIn: '08:15 AM', clockOut: '04:30 PM', totalHours: 8.25, status: 'APPROVED' },
  { id: 'ts3', crewId: '3', date: '2023-11-14', clockIn: '08:00 AM', clockOut: null, totalHours: 0, status: 'PENDING' },
];

interface CrewManagementProps {
  role?: UserRole;
}

const CrewManagement: React.FC<CrewManagementProps> = ({ role = UserRole.CONTRACTOR }) => {
  const [activeTab, setActiveTab] = useState<'STATUS' | 'TIMESHEETS' | 'MAP'>('STATUS');
  const [crew, setCrew] = useState<CrewMember[]>(MOCK_CREW);
  const [sheets, setSheets] = useState<TimeSheetEntry[]>(MOCK_TIMESHEETS);
  
  // Add/Edit Member Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({ name: '', role: 'Technician', phone: '', email: '' });

  const isContractor = role === UserRole.CONTRACTOR;

  const openAddModal = () => {
    setEditingId(null);
    setMemberForm({ name: '', role: 'Technician', phone: '', email: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (member: CrewMember) => {
    setEditingId(member.id);
    setMemberForm({
      name: member.name,
      role: member.role,
      phone: member.phone || '',
      email: member.email || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveMember = () => {
    if (!memberForm.name) return;
    
    if (editingId) {
      // Update existing
      setCrew(crew.map(c => c.id === editingId ? { ...c, ...memberForm } : c));
    } else {
      // Create new
      const member: CrewMember = {
        id: `cm_${Date.now()}`,
        name: memberForm.name,
        role: memberForm.role,
        status: 'OFFLINE',
        currentLocation: 'Unknown',
        lastActive: 'Never',
        batteryLevel: 100,
        avatar: memberForm.name.charAt(0).toUpperCase(),
        weeklyHours: 0,
        phone: memberForm.phone,
        email: memberForm.email,
        skills: ['New Hire']
      };
      setCrew([...crew, member]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Are you sure you want to remove this crew member?')) {
      setCrew(crew.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
             {isContractor ? 'Crew Management' : 'My Team'}
          </h1>
          <p className="text-slate-500 font-medium">
             {isContractor ? 'Real-time crew tracking and labor management.' : 'View your team assignments and status.'}
          </p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <TabButton active={activeTab === 'STATUS'} onClick={() => setActiveTab('STATUS')} label="Live Status" icon={Users} />
              <TabButton active={activeTab === 'MAP'} onClick={() => setActiveTab('MAP')} label="Map View" icon={MapPin} />
              <TabButton active={activeTab === 'TIMESHEETS'} onClick={() => setActiveTab('TIMESHEETS')} label="Time Sheets" icon={Clock} />
           </div>
           {isContractor && (
             <button 
                onClick={openAddModal}
                className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
             >
                <UserPlus size={18} /> <span className="hidden sm:inline">Add Crew</span>
             </button>
           )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <MetricCard label="Active Crew" value={crew.filter(c => c.status === 'ACTIVE').length.toString()} icon={Users} color="text-brand-primary" bg="bg-brand-primary/10" />
         <MetricCard label="On Break" value={crew.filter(c => c.status === 'BREAK').length.toString()} icon={Clock} color="text-amber-500" bg="bg-amber-100 dark:bg-amber-900/20" />
         <MetricCard label="Weekly Hours" value="126.0" icon={TrendingUp} color="text-emerald-500" bg="bg-emerald-100 dark:bg-emerald-900/20" />
         <MetricCard label="Est. Labor Cost" value="$3,420" icon={FileText} color="text-slate-500" bg="bg-slate-100 dark:bg-slate-800" />
      </div>

      {activeTab === 'STATUS' && (
        <div className="grid md:grid-cols-2 gap-6">
           {crew.map(member => (
              <div key={member.id} className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex flex-col gap-4 group hover:border-brand-primary transition-all relative overflow-hidden">
                 <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-2xl text-slate-400">
                          {member.avatar}
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                             <h3 className="font-bold text-slate-900 dark:text-white text-xl">{member.name}</h3>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                member.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' :
                                member.status === 'BREAK' ? 'bg-amber-100 text-amber-600' :
                                'bg-slate-100 text-slate-500'
                             }`}>{member.status}</span>
                          </div>
                          <div className="text-xs text-slate-500 font-bold flex items-center gap-2 mt-1 uppercase tracking-wide">
                             <Briefcase size={12}/> {member.role}
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                       <div className={`flex items-center gap-1 text-xs font-bold ${member.batteryLevel < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {member.batteryLevel < 20 ? <BatteryCharging size={14}/> : <Battery size={14}/>}
                          {member.batteryLevel}%
                       </div>
                       
                       {isContractor && (
                          <div className="flex gap-1 mt-1">
                             <button onClick={() => openEditModal(member)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-primary transition-colors">
                                <Pencil size={14} />
                             </button>
                             <button onClick={() => handleDeleteMember(member.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors">
                                <Trash2 size={14} />
                             </button>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Detailed Info Section */}
                 <div className="pt-4 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                          <Phone size={14} className="text-slate-400"/> {member.phone || 'No Phone'}
                       </div>
                       <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                          <Mail size={14} className="text-slate-400"/> {member.email || 'No Email'}
                       </div>
                       <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                          <MapPin size={14} className="text-slate-400"/> {member.currentLocation}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Award size={12}/> Skills</div>
                       <div className="flex flex-wrap gap-1">
                          {member.skills?.map(skill => (
                             <span key={skill} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-white/5">{skill}</span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           ))}
           
           {isContractor && (
             <button 
                onClick={openAddModal}
                className="p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all group min-h-[200px]"
             >
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-primary/10 flex items-center justify-center transition-colors">
                   <Plus size={32} />
                </div>
                <span className="font-bold text-lg">Add New Employee</span>
                <span className="text-xs font-medium text-slate-400">Invite via email or SMS</span>
             </button>
           )}
        </div>
      )}

      {activeTab === 'MAP' && (
         <div className="h-[500px] w-full bg-slate-900 rounded-3xl relative overflow-hidden border border-slate-800 shadow-2xl group">
            {/* Mock Map UI */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            {crew.map((member, i) => (
               <div 
                  key={member.id}
                  className="absolute flex flex-col items-center gap-2 transition-all duration-1000"
                  style={{ top: `${30 + (i * 15)}%`, left: `${40 + (i * 10)}%` }}
               >
                  <div className="relative group/pin cursor-pointer">
                     <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${member.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                     <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold whitespace-nowrap border border-white/10 opacity-0 group-hover/pin:opacity-100 transition-opacity z-10">
                        <div className="flex items-center gap-2">{member.name} <span className="text-slate-400">|</span> <span className={member.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-400'}>{member.status}</span></div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{member.currentLocation}</div>
                     </div>
                  </div>
               </div>
            ))}

            <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur p-4 rounded-2xl border border-white/10 space-y-2">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Map Legend</div>
               <div className="flex items-center gap-2 text-xs font-bold text-white"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active Job Site</div>
               <div className="flex items-center gap-2 text-xs font-bold text-white"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Idle / Transit</div>
            </div>
         </div>
      )}

      {activeTab === 'TIMESHEETS' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl"><Calendar size={20}/></div>
                  <div>
                     <h3 className="font-bold text-slate-900 dark:text-white">Pay Period: Nov 1 - Nov 15</h3>
                     <p className="text-xs text-slate-500">4 days remaining</p>
                  </div>
               </div>
               <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                  <Download size={14}/> Export CSV
               </button>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="p-6">Employee</th>
                        <th className="p-6">Date</th>
                        <th className="p-6">Clock In</th>
                        <th className="p-6">Clock Out</th>
                        <th className="p-6 text-right">Total Hours</th>
                        <th className="p-6 text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                     {sheets.map(sheet => {
                        const employee = crew.find(c => c.id === sheet.crewId);
                        return (
                           <tr key={sheet.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                              <td className="p-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">{employee?.avatar}</div>
                                 {employee?.name}
                              </td>
                              <td className="p-6 text-sm text-slate-500">{sheet.date}</td>
                              <td className="p-6 text-sm font-mono text-slate-700 dark:text-slate-300">{sheet.clockIn}</td>
                              <td className="p-6 text-sm font-mono text-slate-700 dark:text-slate-300">{sheet.clockOut || '--:--'}</td>
                              <td className="p-6 text-right font-bold text-slate-900 dark:text-white">{sheet.totalHours > 0 ? sheet.totalHours.toFixed(2) : '-'}</td>
                              <td className="p-6 text-right">
                                 {sheet.status === 'APPROVED' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded uppercase tracking-wider">
                                       <Check size={10} strokeWidth={4}/> Approved
                                    </span>
                                 ) : (
                                    isContractor ? (
                                       <button className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-colors">
                                          Review
                                       </button>
                                    ) : (
                                       <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded uppercase tracking-wider">Pending</span>
                                    )
                                 )}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* Add/Edit Crew Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setIsModalOpen(false)}>
            <div className="w-full max-w-md bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
               <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white"><X size={20}/></button>
               
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                     <UserPlus size={24} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{editingId ? 'Edit Member' : 'New Member'}</h2>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{editingId ? 'Update details' : 'Add to payroll & dispatch'}</p>
                  </div>
               </div>

               <div className="space-y-5">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Full Name</label>
                     <input 
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary font-bold"
                        placeholder="e.g. John Doe"
                        value={memberForm.name}
                        onChange={e => setMemberForm({...memberForm, name: e.target.value})}
                        autoFocus
                     />
                  </div>

                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Role</label>
                     <select 
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary font-bold appearance-none"
                        value={memberForm.role}
                        onChange={e => setMemberForm({...memberForm, role: e.target.value})}
                     >
                        <option>Foreman</option>
                        <option>Technician</option>
                        <option>Apprentice</option>
                        <option>Driver</option>
                     </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Phone</label>
                        <div className="relative">
                           <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input 
                              type="tel"
                              className="w-full pl-10 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary font-bold text-sm"
                              placeholder="(555) 000-0000"
                              value={memberForm.phone}
                              onChange={e => setMemberForm({...memberForm, phone: e.target.value})}
                           />
                        </div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Email</label>
                        <div className="relative">
                           <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input 
                              type="email"
                              className="w-full pl-10 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary font-bold text-sm"
                              placeholder="john@work.com"
                              value={memberForm.email}
                              onChange={e => setMemberForm({...memberForm, email: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>

                  {!editingId && (
                     <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-start gap-3">
                        <Shield size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
                           Platform will send an invitation link to the user. Background checks can be requested after onboarding.
                        </p>
                     </div>
                  )}

                  <button 
                     onClick={handleSaveMember}
                     disabled={!memberForm.name}
                     className="w-full py-4 mt-4 bg-brand-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/30 hover:bg-brand-secondary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                     {editingId ? 'Update Member' : 'Send Invite'} <UserPlus size={20} />
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon: Icon }: any) => (
   <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${active ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
   >
      <Icon size={14}/> <span className="hidden sm:inline">{label}</span>
   </button>
);

const MetricCard = ({ label, value, icon: Icon, color, bg }: any) => (
   <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
      <div className="flex justify-between items-start mb-2">
         <div className={`p-2 rounded-xl ${bg} ${color}`}>
            <Icon size={18} />
         </div>
      </div>
      <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
   </div>
);

export default CrewManagement;
