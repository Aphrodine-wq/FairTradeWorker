
import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Package, FileText, Plus, Search, MoreHorizontal, Clock, MapPin, Download, Upload, Users, Map, ShieldCheck, Mic, Sparkles, AlertCircle, X, Check, ArrowRight, Briefcase, Layout, GripVertical, CheckCircle2, Link, Zap } from 'lucide-react';
import { InventoryItem, ScheduleItem, UserRole, Job, JobStatus } from '../types';
import AIReceptionist from './AIReceptionist';

const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Copper Pipe 1/2"', quantity: 450, unit: 'ft', status: 'IN_STOCK' },
  { id: '2', name: 'PVC Elbow 90deg', quantity: 12, unit: 'pcs', status: 'LOW' },
  { id: '3', name: 'Flux Paste', quantity: 0, unit: 'tubs', status: 'OUT' },
  { id: '4', name: 'Recessed Light Cans', quantity: 24, unit: 'pcs', status: 'IN_STOCK' },
];

const INITIAL_SCHEDULE: ScheduleItem[] = [
  { id: '1', title: 'Water Heater Install @ Smith Res', time: '08:00', date: '2023-11-14', type: 'JOB', location: '123 Pine St' },
  { id: '2', title: 'Estimate: Kitchen Remodel', time: '14:00', date: '2023-11-14', type: 'ESTIMATE', location: '456 Oak Ave' },
];

const MOCK_PROJECTS: Job[] = [
   { id: 'p1', title: 'Smith Kitchen Reno', status: JobStatus.IN_PROGRESS, stage: 'WORKING', budgetRange: '$12,500', location: '123 Pine St', postedDate: '2d ago', description: 'Full cabinet and fixture swap', images: [], assignedCrew: 'Team Alpha', isUrgent: false },
   { id: 'p2', title: 'Downtown Office Lighting', status: JobStatus.OPEN, stage: 'SCHEDULED', budgetRange: '$4,200', location: '800 Congress', postedDate: '1w ago', description: 'LED retrofit', images: [], assignedCrew: 'Team Beta', isUrgent: true },
   { id: 'p3', title: 'Emergency Leak Repair', status: JobStatus.COMPLETED, stage: 'COMPLETE', budgetRange: '$850', location: '442 Elm St', postedDate: '3d ago', description: 'Main line burst', images: [], assignedCrew: 'Mike R.', isUrgent: true },
   { id: 'p4', title: 'Deck Resurfacing', status: JobStatus.OPEN, stage: 'BIDDING', budgetRange: '$3,200', location: 'West Lake', postedDate: '5h ago', description: 'Sand and stain 500sqft deck', images: [], assignedCrew: 'Unassigned', isUrgent: false },
];

type Tab = 'PROJECTS' | 'SCHEDULE' | 'INVENTORY' | 'VAULT' | 'CREW' | 'MAP' | 'RECEPTIONIST';

interface OperationsProps {
  role?: UserRole;
}

const Operations: React.FC<OperationsProps> = ({ role }) => {
  const [activeTab, setActiveTab] = useState<Tab>('SCHEDULE');
  const [schedule, setSchedule] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);
  const [projects, setProjects] = useState<Job[]>(MOCK_PROJECTS);
  const [isTrelloSynced, setIsTrelloSynced] = useState(false);
  
  // Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Job | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<ScheduleItem>>({
    type: 'JOB',
    date: new Date().toISOString().split('T')[0],
    time: '09:00'
  });

  // Filter tabs based on role to reduce cognitive load
  const tabs = useMemo(() => {
    if (role === UserRole.CREW_MEMBER) {
      return [
        { id: 'SCHEDULE', icon: Calendar, label: 'My Tasks' }
      ];
    }
    if (role === UserRole.SUBCONTRACTOR) {
      return [
        { id: 'SCHEDULE', icon: Calendar, label: 'Schedule' },
        { id: 'INVENTORY', icon: Package, label: 'Parts' }
      ];
    }
    // Contractor / Admin sees everything
    return [
      { id: 'PROJECTS', icon: Layout, label: 'Projects' },
      { id: 'SCHEDULE', icon: Calendar, label: 'Schedule' },
      { id: 'RECEPTIONIST', icon: Mic, label: 'Receptionist' },
      { id: 'MAP', icon: Map, label: 'Dispatch' },
      { id: 'INVENTORY', icon: Package, label: 'Inventory' },
      { id: 'VAULT', icon: FileText, label: 'Vault' }
    ];
  }, [role]);

  // Ensure active tab is valid for the current role
  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id as Tab);
    }
  }, [tabs, activeTab]);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    const event: ScheduleItem = {
      id: `evt_${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      type: newEvent.type as 'JOB' | 'ESTIMATE',
      location: newEvent.location || 'Remote/TBD'
    };

    // Sort schedule by time after adding
    const updatedSchedule = [...schedule, event].sort((a, b) => {
       return a.time.localeCompare(b.time);
    });

    setSchedule(updatedSchedule);
    setIsEventModalOpen(false);
    setNewEvent({ type: 'JOB', date: new Date().toISOString().split('T')[0], time: '09:00', title: '', location: '' });
  };

  // Drag and Drop for Kanban
  const onDragStart = (e: React.DragEvent, id: string) => {
     e.dataTransfer.setData("projectId", id);
  };

  const onDrop = (e: React.DragEvent, stage: string) => {
     const id = e.dataTransfer.getData("projectId");
     setProjects(prev => prev.map(p => p.id === id ? { ...p, stage: stage as any } : p));
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {role === UserRole.CREW_MEMBER ? 'Daily Tasks' : 'Business OS'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {role === UserRole.CREW_MEMBER ? 'View your assignments and clock in.' : 'Manage logs, dispatch, and physical assets.'}
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl overflow-x-auto max-w-full">
          {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as Tab)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap group relative ${
                 activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
               }`}
             >
               <tab.icon size={16} />
               <span className="hidden md:inline">{tab.label}</span>
             </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto glass-panel rounded-3xl p-8 bg-white dark:bg-slate-900 shadow-xl relative">
        
        {activeTab === 'RECEPTIONIST' && <AIReceptionist />}

        {activeTab === 'PROJECTS' && (
           <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layout size={20} className="text-brand-primary"/> Kanban Board
                 </h2>
                 <button 
                    onClick={() => setIsTrelloSynced(!isTrelloSynced)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${isTrelloSynced ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                 >
                    {isTrelloSynced ? <Check size={14}/> : <Link size={14}/>} {isTrelloSynced ? 'Trello Synced' : 'Sync Trello'}
                 </button>
              </div>
              <div className="h-full overflow-x-auto pb-4">
                 <div className="flex gap-6 min-w-[1200px] h-full">
                    <KanbanColumn 
                       title="New Leads" 
                       stage="BIDDING" 
                       projects={projects.filter(p => p.stage === 'BIDDING' || p.stage === 'POSTED')} 
                       onDrop={onDrop} onDragOver={onDragOver} onDragStart={onDragStart} onClick={setSelectedProject}
                    />
                    <KanbanColumn 
                       title="Planning" 
                       stage="SCHEDULED" 
                       projects={projects.filter(p => p.stage === 'SCHEDULED')} 
                       onDrop={onDrop} onDragOver={onDragOver} onDragStart={onDragStart} onClick={setSelectedProject}
                    />
                    <KanbanColumn 
                       title="In Progress" 
                       stage="WORKING" 
                       projects={projects.filter(p => p.stage === 'WORKING')} 
                       onDrop={onDrop} onDragOver={onDragOver} onDragStart={onDragStart} onClick={setSelectedProject}
                    />
                    <KanbanColumn 
                       title="Review" 
                       stage="REVIEW" 
                       projects={projects.filter(p => p.stage === 'REVIEW')} 
                       onDrop={onDrop} onDragOver={onDragOver} onDragStart={onDragStart} onClick={setSelectedProject}
                    />
                    <KanbanColumn 
                       title="Complete" 
                       stage="COMPLETE" 
                       projects={projects.filter(p => p.stage === 'COMPLETE')} 
                       onDrop={onDrop} onDragOver={onDragOver} onDragStart={onDragStart} onClick={setSelectedProject}
                    />
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'SCHEDULE' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {role === UserRole.CREW_MEMBER ? 'My Assignments' : 'Daily Agenda'}
               </h3>
               {role !== UserRole.CREW_MEMBER && (
                 <button 
                    onClick={() => setIsEventModalOpen(true)}
                    className="px-4 py-2 bg-brand-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-colors"
                 >
                    <Plus size={18} /> New Event
                 </button>
               )}
            </div>
            <div className="grid gap-4">
               {schedule.map(item => (
                 <div key={item.id} className="p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/20 flex gap-6 hover:border-brand-primary transition-all group">
                    <div className="w-16 flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-700 pr-6">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</span>
                       <span className="text-2xl font-black text-slate-900 dark:text-white">{item.time}</span>
                    </div>
                    <div className="flex-1 py-1">
                       <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">{item.title}</h4>
                       <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><MapPin size={14}/> {item.location}</span>
                       </div>
                    </div>
                    <div className="flex items-center">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.type === 'JOB' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                       }`}>
                          {item.type}
                       </span>
                    </div>
                 </div>
               ))}
               {schedule.length === 0 && (
                 <div className="py-20 text-center flex flex-col items-center justify-center opacity-50">
                    <Calendar size={48} className="text-slate-300 mb-4" />
                    <div className="text-sm font-bold text-slate-400">Schedule Clear</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-1">No active jobs for this range</div>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'MAP' && (
           <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Active Dispatch</h3>
              </div>
              <div className="flex-1 rounded-3xl bg-[#0B0F17] relative border border-white/5 overflow-hidden shadow-inner">
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '25px 25px' }}></div>
                 <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-brand-primary rounded-full border-2 border-white animate-pulse shadow-[0_0_15px_#2563eb]">
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/10 text-[10px] text-white px-2 py-1 rounded whitespace-nowrap">Van #04 (Alex)</div>
                 </div>
                 <div className="absolute top-[20%] right-[30%] w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse shadow-[0_0_15px_#10b981]">
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/10 text-[10px] text-white px-2 py-1 rounded whitespace-nowrap">Van #02 (Mike)</div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'INVENTORY' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Material Stocks</h3>
                <div className="flex gap-2">
                   <div className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold border border-rose-500/20 flex items-center gap-2"><AlertCircle size={14}/> 2 Low Stock Items</div>
                   {role !== UserRole.SUBCONTRACTOR && (
                     <button className="px-4 py-2 bg-brand-primary text-white rounded-xl font-bold text-sm"><Plus size={18}/></button>
                   )}
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_INVENTORY.map(item => (
                   <div key={item.id} className="p-6 rounded-2xl bg-white dark:bg-slate-800/20 border border-slate-100 dark:border-white/5 hover:border-brand-primary transition-all group">
                      <div className="flex justify-between items-start mb-4">
                         <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-colors"><Package size={20}/></div>
                         <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${item.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{item.status.replace('_', ' ')}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{item.name}</h4>
                      <div className="mt-4 flex justify-between items-end">
                         <div><div className="text-[10px] text-slate-500 uppercase font-bold">Quantity</div><div className="text-2xl font-bold text-slate-900 dark:text-white">{item.quantity} {item.unit}</div></div>
                         <button className="text-xs font-bold text-brand-primary hover:underline">Update</button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'VAULT' && (
           <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Secure Documentation</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                 {[1,2,3,4,5].map(i => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center group cursor-pointer hover:border-brand-primary transition-all">
                       <FileText size={32} className="text-slate-400 mb-3 group-hover:text-brand-primary transition-colors" />
                       <div className="text-[10px] font-bold text-slate-900 dark:text-white text-center line-clamp-1">Contract_A_{i}.pdf</div>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>

      {/* New Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setIsEventModalOpen(false)}>
           <div className="w-full max-w-lg bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsEventModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white"><X size={20}/></button>
              
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-primary-100 dark:bg-primary-900/20 text-brand-primary rounded-2xl">
                    <Calendar size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Schedule Job</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add to dispatch queue</p>
                 </div>
              </div>

              <div className="space-y-5">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Job Title</label>
                    <input 
                       className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary font-bold"
                       placeholder="e.g. Water Heater Install"
                       value={newEvent.title}
                       onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                       autoFocus
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Date</label>
                       <input 
                          type="date"
                          className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary font-bold"
                          value={newEvent.date}
                          onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Time</label>
                       <input 
                          type="time"
                          className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary font-bold"
                          value={newEvent.time}
                          onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Location</label>
                    <div className="relative">
                       <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary font-bold"
                          placeholder="Street Address"
                          value={newEvent.location}
                          onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                       />
                    </div>
                 </div>

                 <button 
                    onClick={handleAddEvent}
                    disabled={!newEvent.title || !newEvent.date}
                    className="w-full py-4 mt-4 bg-brand-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/30 hover:bg-brand-secondary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                    Confirm Schedule <ArrowRight size={20} />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedProject(null)}>
            <div className="w-full max-w-2xl bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
               <button onClick={() => setSelectedProject(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white"><X size={20}/></button>
               
               <div className="flex flex-col gap-1 mb-6 border-b border-slate-100 dark:border-white/5 pb-6">
                  <div className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-widest mb-1">
                     <Briefcase size={14}/> {selectedProject.stage}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{selectedProject.title}</h2>
                  <p className="text-slate-500 font-medium mt-1">{selectedProject.description}</p>
               </div>

               <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</div>
                     <div className="font-bold flex items-center gap-2 text-slate-900 dark:text-white"><MapPin size={16}/> {selectedProject.location}</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assigned Crew</div>
                     <div className="font-bold flex items-center gap-2 text-slate-900 dark:text-white"><Users size={16}/> {selectedProject.assignedCrew || 'Unassigned'}</div>
                  </div>
               </div>

               <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                     <h3 className="font-bold text-slate-900 dark:text-white">Daily Logs</h3>
                     <button className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1"><Plus size={12}/> Add Log</button>
                  </div>
                  <div className="space-y-3">
                     <div className="flex gap-4 items-start p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                        <div>
                           <div className="text-xs font-bold text-slate-400">Today, 09:12 AM</div>
                           <div className="text-sm text-slate-600 dark:text-slate-300">Crew arrived on site. Materials verified.</div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 mt-auto pt-4">
                  <button className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Log Issue</button>
                  <button className="flex-[2] py-4 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-colors flex items-center justify-center gap-2 shadow-lg">
                     <CheckCircle2 size={18}/> Mark Stage Complete
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

const KanbanColumn = ({ title, stage, projects, onDrop, onDragOver, onDragStart, onClick }: any) => {
   return (
      <div 
         className="flex-1 min-w-[280px] bg-slate-100/50 dark:bg-slate-900/30 rounded-3xl p-4 flex flex-col border border-slate-200 dark:border-white/5 h-full backdrop-blur-sm"
         onDragOver={onDragOver}
         onDrop={(e) => onDrop(e, stage)}
      >
         <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">{title}</h3>
            <span className="bg-white dark:bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">{projects.length}</span>
         </div>
         <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide">
            {projects.map((p: any) => (
               <div 
                  key={p.id} 
                  draggable 
                  onDragStart={(e) => onDragStart(e, p.id)}
                  onClick={() => onClick(p)}
                  className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 cursor-grab active:cursor-grabbing hover:border-brand-primary hover:shadow-md transition-all group relative"
               >
                  {/* Card Labels */}
                  <div className="flex flex-wrap gap-2 mb-2">
                     {p.isUrgent && <div className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><Zap size={8}/> Urgent</div>}
                     <div className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md text-[9px] font-bold">{p.budgetRange}</div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 leading-snug group-hover:text-brand-primary transition-colors">{p.title}</h4>
                  
                  {/* Footer Info */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-white/5">
                     <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <MapPin size={10}/> {p.location}
                     </div>
                     {p.assignedCrew && (
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-200" title={`Assigned: ${p.assignedCrew}`}>
                           {p.assignedCrew.charAt(0)}
                        </div>
                     )}
                  </div>
               </div>
            ))}
            {projects.length === 0 && (
               <div className="h-24 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center text-xs text-slate-400 italic">
                  Drop Item Here
               </div>
            )}
         </div>
      </div>
   )
}

export default Operations;
