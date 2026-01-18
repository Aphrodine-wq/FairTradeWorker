
import React, { useState } from 'react';
import { Lead } from '../types';
import { Phone, Mail, Plus, User, FileText, Calendar, X, Send, MoreHorizontal, GripVertical, MapPin, Clock, CheckCircle, ArrowRight, Trash } from 'lucide-react';

const MOCK_LEADS: Lead[] = [
  { id: 'l1', customerName: 'Sarah Jenkins', service: 'Plumbing Repair', status: 'NEW', value: 250, date: '2h ago', source: 'ONLINE' },
  { id: 'l2', customerName: 'Mike Ross', service: 'Panel Upgrade', status: 'CONTACTED', value: 2500, date: '1d ago', source: 'ONLINE' },
  { id: 'l3', customerName: 'Jessica Pearson', service: 'Office Lighting', status: 'SCHEDULED', value: 1200, date: '3d ago', source: 'MANUAL_IMPORT', isPlatformInvited: true },
];

const CRM: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState({ name: '', service: '', value: '', email: '' });
  const [inviteUser, setInviteUser] = useState(true);

  // --- Drag and Drop Handlers ---
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.setData("leadId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent, newStatus: any) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
    setDraggedLeadId(null);
  };

  const handleAddLead = () => {
    if (!newLead.name) return;
    const lead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: newLead.name,
      service: newLead.service || 'General Service',
      value: Number(newLead.value) || 0,
      status: 'NEW',
      date: 'Just now',
      source: 'MANUAL_IMPORT',
      isPlatformInvited: inviteUser
    };
    setLeads([lead, ...leads]);
    setIsAddModalOpen(false);
    setNewLead({ name: '', service: '', value: '', email: '' });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col relative pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pipeline Command</h1>
          <p className="text-slate-500 dark:text-slate-400">Drag and drop leads to update status.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary-600/20"
        >
          <Plus size={16} /> Import External Lead
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 w-full">
        <div className="flex gap-6 min-w-[1200px] h-full pb-4">
          <KanbanColumn 
            title="Incoming Leads" 
            status="NEW" 
            leads={leads.filter(l => l.status === 'NEW')} 
            onDrop={onDrop} 
            onDragOver={onDragOver} 
            onDragStart={onDragStart}
            onSelectLead={setSelectedLead}
          />
          <KanbanColumn 
            title="Discovery / Contacted" 
            status="CONTACTED" 
            leads={leads.filter(l => l.status === 'CONTACTED')} 
            onDrop={onDrop} 
            onDragOver={onDragOver} 
            onDragStart={onDragStart}
            onSelectLead={setSelectedLead}
          />
          <KanbanColumn 
            title="Estimate Scheduled" 
            status="SCHEDULED" 
            leads={leads.filter(l => l.status === 'SCHEDULED')} 
            onDrop={onDrop} 
            onDragOver={onDragOver} 
            onDragStart={onDragStart}
            onSelectLead={setSelectedLead}
          />
          <KanbanColumn 
            title="Jobs Won / Active" 
            status="COMPLETED" 
            leads={leads.filter(l => l.status === 'COMPLETED')} 
            onDrop={onDrop} 
            onDragOver={onDragOver} 
            onDragStart={onDragStart}
            onSelectLead={setSelectedLead}
          />
        </div>
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Manual Import</h2>
            <p className="text-sm text-slate-500 mb-6">Add a customer to your pipeline OS.</p>
            <div className="space-y-4">
              <input className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" placeholder="Customer Name" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" placeholder="Service Type" value={newLead.service} onChange={e => setNewLead({...newLead, service: e.target.value})} />
                <input type="number" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" placeholder="Value ($)" value={newLead.value} onChange={e => setNewLead({...newLead, value: e.target.value})} />
              </div>
              <button onClick={handleAddLead} className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl mt-4">Add to Pipeline</button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedLead(null)}>
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl relative border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
             {/* Header */}
             <div className="bg-slate-50 dark:bg-black/40 p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-start">
                <div className="flex gap-6">
                   <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {selectedLead.customerName.charAt(0)}
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{selectedLead.customerName}</h2>
                      <div className="flex items-center gap-3">
                         <span className="text-sm font-bold text-slate-500">{selectedLead.service}</span>
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            selectedLead.status === 'NEW' ? 'bg-blue-100 text-blue-600' : 
                            selectedLead.status === 'CONTACTED' ? 'bg-amber-100 text-amber-600' :
                            selectedLead.status === 'SCHEDULED' ? 'bg-purple-100 text-purple-600' :
                            'bg-emerald-100 text-emerald-600'
                         }`}>{selectedLead.status}</span>
                      </div>
                   </div>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"><X size={20}/></button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="md:col-span-2 space-y-8">
                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-4">
                         <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Value</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white">${selectedLead.value.toLocaleString()}</div>
                         </div>
                         <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Source</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white">{selectedLead.source.replace('_', ' ')}</div>
                         </div>
                         <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white">{selectedLead.date}</div>
                         </div>
                      </div>

                      {/* Mocked Details */}
                      <div>
                         <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-primary-600"/> Request Details
                         </h3>
                         <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            Customer requested <span className="font-bold text-primary-600">{selectedLead.service}</span>. 
                            Potential for upgrade to premium materials. Mentioned availability on weekends. 
                            Requires on-site assessment for accurate quote.
                         </p>
                      </div>

                      <div>
                         <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-primary-600"/> Activity Log
                         </h3>
                         <div className="space-y-4 relative pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                            <div className="relative">
                               <div className="absolute -left-[21px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                               <div className="text-sm font-bold text-slate-900 dark:text-white">Lead Created</div>
                               <div className="text-xs text-slate-500">{selectedLead.date} • System Import</div>
                            </div>
                            <div className="relative">
                               <div className="absolute -left-[21px] top-1 w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-full border-2 border-white dark:border-slate-900"></div>
                               <div className="text-sm font-bold text-slate-900 dark:text-white">Status Updated</div>
                               <div className="text-xs text-slate-500">Today • Moved to {selectedLead.status}</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Sidebar Actions */}
                   <div className="space-y-6">
                      <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-black rounded-lg"><Phone size={18} className="text-slate-700 dark:text-slate-300"/></div>
                            <div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase">Mobile</div>
                               <div className="text-sm font-bold text-slate-900 dark:text-white">(555) 123-4567</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-black rounded-lg"><Mail size={18} className="text-slate-700 dark:text-slate-300"/></div>
                            <div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase">Email</div>
                               <div className="text-sm font-bold text-slate-900 dark:text-white">client@example.com</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-black rounded-lg"><MapPin size={18} className="text-slate-700 dark:text-slate-300"/></div>
                            <div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase">Location</div>
                               <div className="text-sm font-bold text-slate-900 dark:text-white">Austin, TX 78701</div>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <button className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                            <Calendar size={18} /> Schedule Estimate
                         </button>
                         <button className="w-full py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                            <Send size={18} /> Send Message
                         </button>
                         <button className="w-full py-4 bg-white dark:bg-slate-800 text-rose-500 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors flex items-center justify-center gap-2">
                            <Trash size={18} /> Archive Lead
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KanbanColumn = ({ title, status, leads, onDrop, onDragOver, onDragStart, onSelectLead }: any) => {
  const [isOver, setIsOver] = useState(false);
  return (
    <div 
      className={`flex-1 min-w-[300px] flex flex-col bg-slate-100/50 dark:bg-slate-900/30 rounded-3xl p-4 border transition-all ${isOver ? 'border-primary-500 bg-primary-500/5 ring-4 ring-primary-500/10 scale-[1.01]' : 'border-slate-200 dark:border-white/5'}`}
      onDragOver={(e) => { setIsOver(true); onDragOver(e); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { setIsOver(false); onDrop(e, status); }}
    >
      <div className="flex justify-between items-center mb-5 px-2">
        <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">{title}</h3>
        <span className="text-[10px] font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full">{leads.length}</span>
      </div>
      <div className="space-y-3 overflow-y-auto flex-1 scrollbar-hide">
        {leads.map((l: Lead) => (
          <div 
            key={l.id} 
            draggable 
            onDragStart={(e) => onDragStart(e, l.id)}
            onClick={() => onSelectLead(l)}
            className="bg-white dark:bg-black p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:border-primary-600 transition-all group relative"
          >
            <div className="flex justify-between items-start mb-2">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg">
                  {l.source}
               </span>
               <GripVertical size={14} className="text-slate-300 group-hover:text-primary-600" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">{l.customerName}</h4>
            <p className="text-xs text-slate-500 mb-4">{l.service}</p>
            <div className="flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-4">
               <div className="text-lg font-bold text-primary-600">${l.value.toLocaleString()}</div>
               <div className="flex gap-2">
                  <button onClick={(e) => {e.stopPropagation();}} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-500 hover:text-blue-500 transition-colors"><Phone size={14}/></button>
                  <button onClick={(e) => {e.stopPropagation();}} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-500 hover:text-blue-500 transition-colors"><Mail size={14}/></button>
               </div>
            </div>
            <div className="absolute inset-0 bg-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
          </div>
        ))}
        {leads.length === 0 && <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400 italic">Drop leads here</div>}
      </div>
    </div>
  );
};

export default CRM;
