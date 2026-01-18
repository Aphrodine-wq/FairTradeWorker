
import React, { useState } from 'react';
import { Estimate, EstimateItem } from '../types';
import { Plus, Sparkles, Send, Trash, Printer, FileText, ChevronLeft, Loader2, DollarSign } from 'lucide-react';
import { generateEstimate } from '../services/geminiService';

const MOCK_ESTIMATES: Estimate[] = [
  {
    id: 'est_101',
    clientName: 'Alice Johnson',
    projectName: 'Kitchen Faucet Replacement',
    date: '2023-10-28',
    status: 'SENT',
    items: [
      { id: '1', description: 'Labor - Faucet Removal & Install', quantity: 2, unitPrice: 125, total: 250 },
      { id: '2', description: 'Moen Adler Faucet (Chrome)', quantity: 1, unitPrice: 180, total: 180 },
      { id: '3', description: 'Supply Lines (Pair)', quantity: 1, unitPrice: 25, total: 25 },
    ],
    subtotal: 455,
    tax: 37.54,
    total: 492.54
  },
  {
    id: 'est_102',
    clientName: 'Downtown Co-working',
    projectName: 'Conference Room Lighting',
    date: '2023-10-30',
    status: 'DRAFT',
    items: [
      { id: '1', description: 'Recessed Can Lights (LED)', quantity: 8, unitPrice: 65, total: 520 },
      { id: '2', description: 'Labor - Wiring & Install', quantity: 6, unitPrice: 110, total: 660 },
    ],
    subtotal: 1180,
    tax: 97.35,
    total: 1277.35
  }
];

const Estimates: React.FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>(MOCK_ESTIMATES);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Creation State
  const [newClient, setNewClient] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [items, setItems] = useState<EstimateItem[]>([]);

  const handleCreate = async () => {
    if (!newDesc) return;
    setIsGenerating(true);
    try {
      const generatedItems = await generateEstimate(newDesc);
      const mappedItems = generatedItems.map((item: any, idx: number) => ({
        id: `gen_${idx}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      }));
      setItems(mappedItems);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.0825; // Austin Tax
    const total = subtotal + tax;

    const newEst: Estimate = {
      id: `est_${Math.random().toString(36).substr(2, 5)}`,
      clientName: newClient || 'New Client',
      projectName: newProject || 'New Project',
      date: new Date().toLocaleDateString(),
      status: 'DRAFT',
      items,
      subtotal,
      tax,
      total
    };
    setEstimates([newEst, ...estimates]);
    setIsCreating(false);
    setSelectedEstimate(newEst);
    // Reset form
    setNewClient('');
    setNewProject('');
    setNewDesc('');
    setItems([]);
  };

  if (selectedEstimate) {
     return (
        <div className="max-w-4xl mx-auto h-full flex flex-col pb-20 animate-fadeIn">
           <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setSelectedEstimate(null)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                 <ChevronLeft size={16} /> Back to Estimates
              </button>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center gap-2">
                    <Printer size={16} /> Print
                 </button>
                 <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-colors">
                    <Send size={16} /> Send to Client
                 </button>
              </div>
           </div>

           <div className="glass-panel p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 shadow-xl flex-1 overflow-y-auto">
              {/* Estimate Header */}
              <div className="flex justify-between items-start mb-12 border-b border-slate-100 dark:border-white/10 pb-8">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Estimate</h1>
                       <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${selectedEstimate.status === 'DRAFT' ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-600'}`}>
                          {selectedEstimate.status}
                       </span>
                    </div>
                    <p className="text-slate-500">#{selectedEstimate.id.toUpperCase()}</p>
                 </div>
                 <div className="text-right">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">FairTradeWorker</h3>
                    <p className="text-sm text-slate-500">Austin, TX 78701</p>
                 </div>
              </div>

              {/* Client Info */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                 <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Bill To</h4>
                    <div className="font-bold text-lg text-slate-900 dark:text-white">{selectedEstimate.clientName}</div>
                    <div className="text-sm text-slate-500">Client Address</div>
                 </div>
                 <div className="md:text-right">
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Project Details</h4>
                    <div className="font-bold text-lg text-slate-900 dark:text-white">{selectedEstimate.projectName}</div>
                    <div className="text-sm text-slate-500">Date: {selectedEstimate.date}</div>
                 </div>
              </div>

              {/* Line Items */}
              <table className="w-full mb-12">
                 <thead>
                    <tr className="border-b-2 border-slate-100 dark:border-white/10 text-left">
                       <th className="py-3 font-bold text-xs uppercase text-slate-500 w-1/2">Description</th>
                       <th className="py-3 font-bold text-xs uppercase text-slate-500 text-center">Qty</th>
                       <th className="py-3 font-bold text-xs uppercase text-slate-500 text-right">Unit Price</th>
                       <th className="py-3 font-bold text-xs uppercase text-slate-500 text-right">Amount</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {selectedEstimate.items.map(item => (
                       <tr key={item.id}>
                          <td className="py-4 font-medium text-slate-900 dark:text-white">{item.description}</td>
                          <td className="py-4 text-center text-slate-500">{item.quantity}</td>
                          <td className="py-4 text-right text-slate-500">${item.unitPrice.toFixed(2)}</td>
                          <td className="py-4 text-right font-bold text-slate-900 dark:text-white">${item.total.toFixed(2)}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                 <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Subtotal</span>
                       <span className="font-bold text-slate-900 dark:text-white">${selectedEstimate.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Tax (8.25%)</span>
                       <span className="font-bold text-slate-900 dark:text-white">${selectedEstimate.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl border-t border-slate-200 dark:border-white/10 pt-4">
                       <span className="font-bold text-slate-900 dark:text-white">Total</span>
                       <span className="font-bold text-primary-600">${selectedEstimate.total.toFixed(2)}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Estimates</h1>
           <p className="text-slate-500 dark:text-slate-400">Create and manage project quotes.</p>
        </div>
        <button 
           onClick={() => setIsCreating(true)}
           className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-600/20 transition-all"
        >
           <Plus size={18} /> New Estimate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Create New Card (if creating) */}
         {isCreating && (
            <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-primary-500/50 relative animate-fadeIn col-span-1 md:col-span-2 lg:col-span-1">
               <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">New Estimate</h3>
               <div className="space-y-4">
                  <input 
                     placeholder="Client Name" 
                     className="w-full p-3 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800"
                     value={newClient}
                     onChange={e => setNewClient(e.target.value)}
                  />
                  <input 
                     placeholder="Project Name" 
                     className="w-full p-3 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800"
                     value={newProject}
                     onChange={e => setNewProject(e.target.value)}
                  />
                  <div className="relative">
                     <textarea 
                        placeholder="Describe the job (e.g. Install new toilet and vanity in master bath...)" 
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 h-24 resize-none"
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                     />
                     <button 
                        onClick={handleCreate}
                        disabled={!newDesc || isGenerating}
                        className="absolute bottom-2 right-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-all"
                        title="Auto-generate items with AI"
                     >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                     </button>
                  </div>
                  
                  {items.length > 0 && (
                     <div className="bg-slate-50 dark:bg-black p-3 rounded-xl border border-slate-100 dark:border-white/5">
                        <div className="text-xs font-bold uppercase text-slate-500 mb-2">Generated Items</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                           {items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                 <span className="truncate flex-1 pr-2">{item.description}</span>
                                 <span className="font-mono text-slate-500">${item.total}</span>
                              </div>
                           ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between font-bold text-primary-600">
                           <span>Total Est.</span>
                           <span>${items.reduce((a,b) => a + b.total, 0).toFixed(2)}</span>
                        </div>
                     </div>
                  )}

                  <div className="flex gap-2">
                     <button onClick={() => setIsCreating(false)} className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">Cancel</button>
                     <button onClick={handleSave} disabled={items.length === 0} className="flex-1 py-2 rounded-xl bg-primary-600 text-white font-bold disabled:opacity-50">Save Draft</button>
                  </div>
               </div>
            </div>
         )}

         {/* Existing Estimates */}
         {estimates.map(est => (
            <div 
               key={est.id} 
               onClick={() => setSelectedEstimate(est)}
               className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 hover:border-primary-500/50 transition-all cursor-pointer group"
            >
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/10 group-hover:text-primary-600 transition-colors">
                     <FileText size={24} />
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                     est.status === 'SENT' ? 'bg-blue-100 text-blue-600' :
                     est.status === 'ACCEPTED' ? 'bg-green-100 text-green-600' :
                     'bg-slate-100 text-slate-500'
                  }`}>
                     {est.status}
                  </span>
               </div>
               <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">{est.projectName}</h3>
               <p className="text-sm text-slate-500 mb-4">{est.clientName}</p>
               
               <div className="flex items-end justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                  <div className="text-xs text-slate-400">{est.date}</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">${est.total.toFixed(2)}</div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default Estimates;
