import React from 'react';
import { Shield, FileText, HelpCircle, ArrowLeft, ShieldCheck, CheckCircle, Eye, Lock, HardHat, AlertTriangle, Heart } from 'lucide-react';
import { View } from '../types';

interface InfoPageProps {
  type: View;
  onBack: () => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ type, onBack }) => {
  const getContent = () => {
    switch(type) {
      case 'LEGAL_TERMS':
        return {
          title: 'Terms of Service',
          icon: FileText,
          content: (
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="font-medium text-lg">Effective Date: October 24, 2025</p>
                <p>Welcome to FairTradeWorker. By accessing our platform, you agree to these terms which govern the relationship between homeowners, contractors, and the platform.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">1. Service Usage</h3>
                <p>Contractors must maintain active licenses and insurance where required by local law. FairTradeWorker acts as a facilitator for connections and infrastructure management but is not the direct employer of any trade professional.</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">2. Payments & Escrow</h3>
                <p>All project funds are held in secure escrow until milestone completion. Disputes are handled via our neutral arbitration center. We reserve the right to withhold payouts if fraud is detected.</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">3. Territory Rights</h3>
                <p>Leased territories provide priority lead routing but do not guarantee exclusive market dominance. Fair trade practices must be observed; aggressive interference with other contractors is grounds for ban.</p>
              </div>
            </div>
          )
        };
      case 'LEGAL_PRIVACY':
        return {
          title: 'Privacy Policy',
          icon: Shield,
          content: (
            <div className="space-y-8">
              <p className="text-lg font-medium">Your data security is paramount. We utilize end-to-end encryption for all sensitive communications.</p>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">Data Collection</h3>
                <p className="text-sm leading-relaxed">We collect location data to facilitate dispatch and territory management. Job site photos are processed by AI for scoping but are not used for public training without consent.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">Third Parties</h3>
                <p className="text-sm leading-relaxed">We do not sell personal data to lead aggregators. Your information stays within the FairTrade ecosystem. Payment data is processed securely via Stripe.</p>
              </div>
            </div>
          )
        };
      case 'SUPPORT_HELP':
        return {
          title: 'Support Center',
          icon: HelpCircle,
          content: (
            <div className="space-y-8">
              <p className="text-lg">Need assistance? Our team is available 24/7 for Elite members and business hours for Pro members.</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                   <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Contact Methods</h3>
                   <ul className="space-y-3">
                      <li className="flex items-center gap-2 font-medium"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Emergency: 1-800-FAIR-WORK</li>
                      <li className="flex items-center gap-2 font-medium"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Email: support@fairtrade.pro</li>
                      <li className="flex items-center gap-2 font-medium"><span className="w-2 h-2 bg-purple-500 rounded-full"></span> Chat: Use the "Zephyr" Assistant</li>
                   </ul>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                   <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Common Topics</h3>
                   <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <li className="hover:text-brand-primary cursor-pointer">• How do I dispute a charge?</li>
                      <li className="hover:text-brand-primary cursor-pointer">• Verifying my insurance</li>
                      <li className="hover:text-brand-primary cursor-pointer">• Territory pricing tiers</li>
                   </ul>
                </div>
              </div>
            </div>
          )
        };
      case 'SAFETY_GUIDELINES':
        return {
          title: 'Trust & Safety Protocol',
          icon: ShieldCheck,
          content: (
            <div className="space-y-8">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                 <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">The FairTrade Standard</h2>
                 <p className="text-blue-800/80 dark:text-blue-200/80 text-sm leading-relaxed">
                    Our marketplace is built on a foundation of verified craftsmanship and homeowner respect. We enforce a zero-tolerance policy for fraud, harassment, or safety violations.
                 </p>
              </div>

              {/* Section 1: Verification */}
              <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><Shield size={20} /></div>
                  Verified Pro Network
                </h3>
                <p className="text-sm leading-relaxed mb-6 text-slate-600 dark:text-slate-300">
                  Every contractor on FairTradeWorker undergoes a rigorous 4-step verification process before they can bid on projects. This ensures only qualified professionals enter your home.
                </p>
                <ul className="grid md:grid-cols-2 gap-4">
                  <li className="flex items-center gap-3 text-xs font-bold bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0"/> Government ID Check
                  </li>
                  <li className="flex items-center gap-3 text-xs font-bold bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0"/> License Validation
                  </li>
                  <li className="flex items-center gap-3 text-xs font-bold bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0"/> Insurance Audit ($1M min)
                  </li>
                  <li className="flex items-center gap-3 text-xs font-bold bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0"/> Criminal Background Screen
                  </li>
                </ul>
              </div>

              {/* Section 2: AI Safety */}
              <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Eye size={20} /></div>
                  AI Ethics & Privacy
                </h3>
                <p className="text-sm leading-relaxed mb-6 text-slate-600 dark:text-slate-300">
                  Our Gemini-powered tools (Zephyr, Estimator) operate on strict privacy principles. We do not use your private job site data to train public models without explicit consent.
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                   <div className="flex-1 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                      <div className="font-bold text-blue-700 dark:text-blue-300 text-sm mb-1 flex items-center gap-2"><Lock size={14}/> Ephemeral Voice</div>
                      <div className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">Audio streams from the Voice Hub are processed in real-time and are not permanently stored on our servers.</div>
                   </div>
                   <div className="flex-1 p-5 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                      <div className="font-bold text-purple-700 dark:text-purple-300 text-sm mb-1 flex items-center gap-2"><HardHat size={14}/> Data Sovereignty</div>
                      <div className="text-xs text-purple-600/80 dark:text-purple-400/80 leading-relaxed">You own your estimates, client lists, and territory data. We do not sell lead data to competitors.</div>
                   </div>
                </div>
              </div>

              {/* Section 3: Financial Safety */}
              <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl"><AlertTriangle size={20} /></div>
                  FairTrade Shield
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
                  Financial safety is built into the OS. All project payments are held in a neutral, bank-grade escrow account.
                </p>
                <div className="space-y-3">
                   <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Funds are only released when milestones are marked complete by the Pro.</p>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Homeowners must approve the release (or auto-approve after 48h with sufficient photo evidence).</p>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Disputes trigger a hold and assignment to a human arbitrator.</p>
                   </div>
                </div>
              </div>

              <div className="text-center pt-8 border-t border-slate-200 dark:border-white/10">
                 <div className="inline-flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Heart size={14} className="text-rose-500 fill-rose-500" />
                    Built for your safety
                 </div>
              </div>
            </div>
          )
        };
      default:
        return { title: 'Information', icon: FileText, content: <p>Content unavailable.</p> };
    }
  };

  const data = getContent();

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-fadeIn min-h-screen">
       <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-primary font-bold transition-colors">
          <ArrowLeft size={20} /> Back
       </button>
       
       <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200 dark:border-white/10 shadow-xl">
          <div className="flex items-center gap-4 mb-10 border-b border-slate-100 dark:border-white/5 pb-8">
             <div className="p-4 bg-brand-primary/10 text-brand-primary rounded-2xl">
                <data.icon size={32} />
             </div>
             <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{data.title}</h1>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
             {data.content}
          </div>
       </div>
    </div>
  );
};

export default InfoPage;