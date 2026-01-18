
import React from 'react';
import { Check, Zap, Shield, Briefcase, Bot, Layout, Sparkles, Rocket, Phone, Heart, HardHat, FileText, Lock, Building, ChevronRight } from 'lucide-react';
import { UserTier } from '../types';

interface PricingProps {
  currentTier: UserTier;
}

const Pricing: React.FC<PricingProps> = ({ currentTier }) => {
  return (
    <div className="max-w-7xl mx-auto py-10 space-y-16 animate-fadeIn pb-24">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-200 dark:border-blue-900/30">
          Fair Trade Pricing
        </div>
        <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
          Scale with <span className="text-primary-600">Pure ROI.</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Zero commissions. No lead fees. We provide the infrastructure, you provide the craftsmanship. Simple monthly tiers designed for the modern contractor.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {/* Essentials */}
        <div className={`glass-panel p-8 rounded-[2rem] border ${currentTier === 'FREE' ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-white/5'} flex flex-col hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900/50`}>
          <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 w-fit rounded-2xl text-slate-600 dark:text-slate-300">
             <Layout size={28} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Essentials</h3>
          <div className="flex items-baseline gap-1 mt-2 mb-2">
             <span className="text-5xl font-black text-slate-900 dark:text-white">$0</span>
             <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">/mo</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            Standard business tools to get you off paper and into the cloud.
          </p>
          <div className="flex-1">
             <ul className="space-y-4 mb-8">
                <Feature text="Unlimited Estimates" />
                <Feature text="Basic Scheduling" />
                <Feature text="0% Marketplace Fees" highlighted />
                <Feature text="Customer Invoicing" />
                <Feature text="Accept Card Payments" />
             </ul>
          </div>
          <button className="w-full py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95">
            {currentTier === 'FREE' ? 'Current Plan' : 'Start Free'}
          </button>
        </div>

        {/* Pro Growth */}
        <div className={`glass-panel p-8 rounded-[2rem] border ${currentTier === 'STARTER' ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-white/5'} flex flex-col hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900/50`}>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-600/10 w-fit rounded-2xl text-blue-600">
             <Rocket size={28} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pro Growth</h3>
          <div className="flex items-baseline gap-1 mt-2 mb-2">
             <span className="text-5xl font-black text-slate-900 dark:text-white">$79</span>
             <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">/mo</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            Automate your busywork and claim your first local zip code.
          </p>
          <div className="flex-1">
             <ul className="space-y-4 mb-8">
                <Feature text="AI Estimate Assistant" highlighted />
                <Feature text="1 Exclusive Territory" />
                <Feature text="Route Optimization" />
                <Feature text="Automated Lead Flow" />
                <Feature text="Custom Branding" />
             </ul>
          </div>
          <button className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg">
            {currentTier === 'STARTER' ? 'Current Plan' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Elite OS - The "Top Tier" */}
        <div className={`glass-panel p-8 rounded-[2.5rem] border-4 ${currentTier === 'PRO' || currentTier === 'ELITE' ? 'border-emerald-500 shadow-[0_32px_64px_-12px_rgba(16,185,129,0.25)]' : 'border-primary-600 shadow-[0_32px_64px_-12px_rgba(37,99,235,0.25)]'} flex flex-col relative scale-105 z-10 bg-slate-900 text-white`}>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-2">
             <Sparkles size={12} /> Premium Office AI
          </div>
          <div className="mb-6 p-4 bg-gradient-to-tr from-primary-600 to-indigo-600 w-fit rounded-2xl text-white shadow-lg">
             <Phone size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Elite OS</h3>
          <div className="flex items-baseline gap-1 mt-2 mb-2">
             <span className="text-5xl font-black">$299</span>
             <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">/mo</span>
          </div>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            The full Virtual Office. AI staff that talks to customers 24/7.
          </p>
          <div className="flex-1">
             <ul className="space-y-4 mb-8">
                <Feature text="Zephyr AI Receptionist" highlighted isDark />
                <Feature text="AI Marketing Autopilot" isDark />
                <Feature text="3 Exclusive Territories" isDark />
                <Feature text="Legal & Tax Vault" isDark />
                <Feature text="Priority Flash Payouts" isDark />
             </ul>
          </div>
          <button className="w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all active:scale-95 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)]">
            {currentTier === 'PRO' || currentTier === 'ELITE' ? 'Current Plan' : 'Go Elite'}
          </button>
        </div>

        {/* Franchise */}
        <div className={`glass-panel p-8 rounded-[2rem] border ${currentTier === 'ENTERPRISE' ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-white/5'} flex flex-col hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900/50`}>
          <div className="mb-6 p-4 bg-purple-100 dark:bg-purple-900/30 w-fit rounded-2xl text-purple-600">
             <Building size={28} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Franchise</h3>
          <div className="flex items-baseline gap-1 mt-2 mb-2">
             <span className="text-5xl font-black text-slate-900 dark:text-white">$999</span>
             <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">/mo</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            For multi-location networks and large enterprises.
          </p>
          <div className="flex-1">
             <ul className="space-y-4 mb-8">
                <Feature text="Centralized Command" />
                <Feature text="Brand Governance" />
                <Feature text="Unlimited Territories" highlighted />
                <Feature text="Custom API Access" />
                <Feature text="Dedicated Manager" />
             </ul>
          </div>
          <button className="w-full py-4 rounded-2xl border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all active:scale-95">
            {currentTier === 'ENTERPRISE' ? 'Current Plan' : 'Contact Sales'}
          </button>
        </div>
      </div>

      {/* New Revenue Streams (The "Platform Value" Section) */}
      <div className="space-y-8 pt-12 border-t border-slate-200 dark:border-white/10">
         <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Value-Added Infrastructure</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Select individual power-ups to bolster your business on demand.</p>
         </div>

         <div className="grid md:grid-cols-3 gap-6">
            <ValueAddCard 
               title="FairTrade Shield" 
               cost="1.5% of Job"
               desc="Offer your customers a 1-year platform-backed warranty. We handle claims, you keep the reputation."
               icon={<Shield className="text-emerald-500" />}
            />
            <ValueAddCard 
               title="Flash Payouts" 
               cost="1% Fixed"
               desc="Skip the 3-day bank settlement. Funds moved from escrow to your wallet in under 30 seconds."
               icon={<Zap className="text-yellow-500" />}
            />
            <ValueAddCard 
               title="Legal Assistant" 
               cost="$29/mo"
               desc="AI-powered contract review and automated late-payment collection letters."
               icon={<FileText className="text-indigo-500" />}
            />
         </div>
      </div>

      {/* FAQ Placeholder */}
      <div className="max-w-3xl mx-auto pt-20">
         <h3 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h3>
         <div className="space-y-4">
            <FaqItem q="What does 0% commission mean?" a="Unlike traditional lead apps that take 20-30% of your total project value, we charge a flat monthly fee for software. Every dollar of your hard work stays in your pocket." />
            <FaqItem q="How do exclusive territories work?" a="Once you claim a zip code, you are the priority pro for that zone. Homeowners in that area will see you as the 'Verified Local Pro' before any others." />
            <FaqItem q="Is the AI Receptionist really voice-based?" a="Yes! Using Gemini 2.5 Native Audio, Zephyr can actually talk to customers, ask them for photos of their leak/damage, and schedule them into your open slots." />
         </div>
      </div>
    </div>
  );
};

const Feature = ({ text, highlighted = false, isDark = false }: { text: string, highlighted?: boolean, isDark?: boolean }) => (
  <li className="flex items-center gap-3">
    <div className={`p-1 rounded-full flex-shrink-0 ${highlighted ? (isDark ? 'bg-primary-400 text-slate-900' : 'bg-primary-600 text-white') : (isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400')}`}>
      <Check size={10} strokeWidth={4} />
    </div>
    <span className={`text-xs font-bold ${highlighted ? (isDark ? 'text-white' : 'text-slate-900 dark:text-white') : (isDark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400')}`}>
      {text}
    </span>
  </li>
);

const ValueAddCard = ({ title, cost, desc, icon }: { title: string, cost: string, desc: string, icon: React.ReactNode }) => (
   <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 flex flex-col group hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
         <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
            {icon}
         </div>
         <span className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">{cost}</span>
      </div>
      <h4 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
   </div>
);

const FaqItem = ({ q, a }: { q: string, a: string }) => (
   <div className="p-6 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors cursor-pointer group">
      <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex justify-between items-center group-hover:text-primary-600 transition-colors">
         {q}
         <ChevronRight size={16} className="text-slate-400" />
      </h4>
      <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
   </div>
);

export default Pricing;
