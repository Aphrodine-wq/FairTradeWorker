
import React, { useState, useRef } from 'react';
import { Transaction, UserRole } from '../types';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, History, Plus, DollarSign, PieChart, Landmark, Percent, Zap, Smartphone, FileText, ChevronRight, Check, QrCode, ShieldCheck, TrendingUp, X, Upload, Loader2 } from 'lucide-react';

interface WalletProps {
  role: UserRole;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'PAYOUT', amount: 1250, status: 'COMPLETED', date: 'Nov 1', description: 'Instant Payout to Debit ****4567' },
  { id: 't2', type: 'PAYMENT', amount: 450, status: 'COMPLETED', date: 'Oct 28', description: 'Payment for Sink Repair #1023' },
  { id: 't3', type: 'PAYMENT', amount: 1200, status: 'PENDING', date: 'Oct 25', description: 'Escrow Deposit Kitchen #1024' },
];

const Wallet: React.FC<WalletProps> = ({ role }) => {
  const [balance] = useState(role === UserRole.CONTRACTOR ? 3450.00 : 0);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [uploadState, setUploadState] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS'>('IDLE');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setUploadState('UPLOADING');
        // Simulate network request
        setTimeout(() => {
            setUploadState('SUCCESS');
            // Reset to idle after 3 seconds
            setTimeout(() => setUploadState('IDLE'), 3000);
        }, 1500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter">FINANCIAL HUB</h1>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">Secure Node</div>
           </div>
           <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Verified Escrow & Instant Liquidity OS</p>
        </div>
        {(role === UserRole.CONTRACTOR || role === UserRole.SUBCONTRACTOR) && (
           <div className="flex gap-3">
              <button onClick={() => setIsPayoutOpen(true)} className="bg-brand-primary hover:bg-blue-700 text-white px-8 py-4 rounded-[2rem] font-black text-sm italic tracking-tighter uppercase flex items-center gap-3 shadow-2xl shadow-brand-primary/30 transition-all hover:scale-[1.02]">
                <ArrowUpRight size={20} /> Request Payout
              </button>
           </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Balance Area */}
        <div className="lg:col-span-8 space-y-8">
           <div className="p-12 rounded-[4rem] bg-slate-900 text-white border-0 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-[2000ms]">
                <Landmark size={400} />
              </div>
              <div className="relative z-10 space-y-12">
                 <div className="flex justify-between items-start">
                    <div className="space-y-4">
                       <div className="px-4 py-1.5 bg-white/10 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] inline-block border border-white/5">Portfolio Value</div>
                       <h2 className="text-8xl font-black tracking-tighter italic italic">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
                    </div>
                    <div className="text-right space-y-2">
                       <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center justify-end gap-2"><TrendingUp size={14}/> +12.4%</div>
                       <div className="text-xs font-bold text-slate-400">vs Last Month</div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <BalanceMetric label="Available to Pay" val="$1,250.00" color="text-white" />
                    <BalanceMetric label="Locked in Escrow" val="$2,200.00" color="text-brand-primary" />
                    <BalanceMetric label="Tax Reserve" val="$450.00" color="text-amber-400" />
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                 <h3 className="font-black text-xl italic tracking-tight flex items-center gap-3"><History size={20} className="text-slate-400" /> TRANSACTION HISTORY</h3>
                 <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Download CSV</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                 {MOCK_TRANSACTIONS.map((t) => (
                   <div key={t.id} className="p-8 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all group cursor-pointer">
                      <div className="flex items-center gap-6">
                         <div className={`p-4 rounded-3xl ${t.type === 'PAYOUT' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}>
                            {t.type === 'PAYOUT' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                         </div>
                         <div>
                            <div className="font-black text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-brand-primary transition-colors">{t.description}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.date} • ID: {t.id}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className={`font-black text-2xl italic tracking-tighter ${t.type === 'PAYOUT' ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>
                            {t.type === 'PAYOUT' ? '-' : '+'}${t.amount.toFixed(2)}
                         </div>
                         <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded mt-2 inline-block ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Stripe Connect Card */}
           <div className={`p-8 rounded-[3rem] border transition-all duration-300 ${stripeConnected ? 'bg-slate-900 text-white border-slate-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 shadow-sm'}`}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black text-lg italic tracking-tight uppercase">Payment Processor</h3>
                 <CreditCard size={24} className={stripeConnected ? 'text-emerald-400' : 'text-slate-400'} />
              </div>
              <p className={`text-sm font-medium mb-6 ${stripeConnected ? 'text-slate-400' : 'text-slate-500'}`}>
                 {stripeConnected ? 'Your Stripe account is connected and ready to accept payments.' : 'Connect Stripe to start accepting credit card payments from clients instantly.'}
              </p>
              {stripeConnected ? (
                 <div className="flex items-center gap-3 text-emerald-400 text-sm font-bold">
                    <CheckCircle size={18}/> Active: acct_1Gq4...
                 </div>
              ) : (
                 <button onClick={() => setStripeConnected(true)} className="w-full py-4 bg-[#635BFF] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#534be0] transition-colors shadow-xl flex items-center justify-center gap-2">
                    Connect Stripe
                 </button>
              )}
           </div>

           <div className="p-10 rounded-[3rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform"><QrCode size={200}/></div>
              <div className="relative z-10 space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="font-black text-xl italic tracking-tight uppercase">Quick Collect</h3>
                    <ShieldCheck size={24} className="text-indigo-200" />
                 </div>
                 <p className="text-indigo-100 text-sm font-medium leading-relaxed">Show this code to your customer to accept an instant platform-verified payment.</p>
                 <div className="bg-white p-4 rounded-[2rem] w-fit mx-auto shadow-2xl">
                    <QrCode size={140} className="text-slate-900" />
                 </div>
                 <button className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Generate Link</button>
              </div>
           </div>

           {/* Invoice Upload Card */}
           <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                  <h3 className="font-black text-lg italic tracking-tight uppercase">Invoice Manager</h3>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                    <FileText size={20} />
                  </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Upload supplier invoices or receipts. AI will auto-categorize expenses.
              </p>
              
              {uploadState === 'IDLE' && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-primary hover:bg-brand-primary/5 text-slate-400 hover:text-brand-primary rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
                >
                    <Upload size={16} className="group-hover:scale-110 transition-transform"/> Upload File
                </button>
              )}

              {uploadState === 'UPLOADING' && (
                <div className="w-full py-4 border-2 border-solid border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-wait">
                    <Loader2 size={16} className="animate-spin text-brand-primary"/> Processing...
                </div>
              )}

              {uploadState === 'SUCCESS' && (
                <div className="w-full py-4 border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 animate-fadeIn">
                    <Check size={16} strokeWidth={3} /> Upload Complete
                </div>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf,.png,.jpg,.jpeg"
              />
           </div>

           <div className="p-8 bg-brand-primary/5 dark:bg-white/5 rounded-[3rem] border border-brand-primary/10 space-y-4">
              <div className="flex items-center gap-3 text-brand-primary">
                 <TrendingUp size={24}/>
                 <span className="font-black text-xs uppercase tracking-widest">Tax Assistant</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">We've automatically set aside <span className="font-black text-slate-900 dark:text-white">$450.00</span> for your Q4 estimated taxes. Want to adjust the withholding rate?</p>
              <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Update Settings</button>
           </div>
        </div>
      </div>

      {/* Payout Modal */}
      {isPayoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setIsPayoutOpen(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-950 p-12 rounded-[4rem] shadow-2xl relative border border-slate-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
             <button onClick={() => setIsPayoutOpen(false)} className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white"><X size={20}/></button>
             <h2 className="text-4xl font-black italic tracking-tighter mb-2 uppercase">Fast Payout</h2>
             <p className="text-slate-500 mb-10 text-sm font-medium">Funds move to your bank account instantly.</p>
             
             <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Withdraw Amount</label>
                   <div className="relative">
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 font-black text-4xl italic">$</span>
                      <input type="number" placeholder="0.00" className="w-full pl-16 pr-8 py-8 rounded-[2.5rem] bg-slate-50 dark:bg-black/30 border-2 border-slate-100 dark:border-white/5 font-black text-5xl tracking-tighter italic outline-none focus:border-brand-primary transition-all" />
                   </div>
                   <div className="flex justify-between px-2 pt-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available: $1,250.00</span>
                      <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Max Out</button>
                   </div>
                </div>
                
                <button onClick={() => setIsPayoutOpen(false)} className="w-full py-6 bg-brand-primary text-white rounded-[2.5rem] font-black text-xl italic tracking-tighter uppercase shadow-2xl shadow-brand-primary/40 flex items-center justify-center gap-3 group transition-all hover:scale-[1.02]">
                   Complete Transfer <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BalanceMetric = ({ label, val, color }: any) => (
   <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-2xl font-black tracking-tight ${color}`}>{val}</div>
   </div>
);

const CheckCircle = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default Wallet;
