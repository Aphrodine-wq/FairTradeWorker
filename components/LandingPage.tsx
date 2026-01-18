
import React, { useState, useEffect } from 'react';
import { 
  Hexagon, ArrowRight, Zap, Shield, Star, Smartphone, Globe, 
  Code, Wrench, PenTool, Sparkles, Building, Rocket, CreditCard, 
  Lock, Users, Phone, Mic, ChevronRight, CheckCircle, MapPin, 
  Activity, BarChart3, Clock, Play, ShieldCheck, Heart, TrendingUp, Info,
  X, Check, Database, MousePointer2, Hammer
} from 'lucide-react';
import { UserRole, View } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onDemo: (role: UserRole) => void;
  setView: (view: View) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onDemo, setView }) => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-brand-primary/30">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-transform duration-300">
               <Hexagon size={24} strokeWidth={3} />
            </div>
            <div className="flex flex-col">
               <span className="font-black text-lg tracking-tighter uppercase leading-none text-slate-900 dark:text-white">FairTrade</span>
               <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">OS v2.5</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200 dark:border-white/5">
             <NavLink onClick={() => scrollToSection('features')}>Features</NavLink>
             <NavLink onClick={() => scrollToSection('workflow')}>How it Works</NavLink>
             <NavLink onClick={() => scrollToSection('economy')}>Economy</NavLink>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="hidden sm:block text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-colors">Log In</button>
            <button 
              onClick={onGetStarted}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 overflow-x-hidden">
        
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center pt-20 pb-32">
           {/* Background Elements */}
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[120px] -mr-40 -mt-40"></div>
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           </div>

           <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
              <div className="space-y-10">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full shadow-sm animate-fadeIn">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Infrastructure for Pros</span>
                 </div>
                 
                 <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
                    Built for the <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-indigo-600">Job Site.</span>
                 </h1>
                 
                 <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                    The first vertical operating system that combines AI dispatch, automated estimating, and instant banking into one tool.
                 </p>

                 <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => onDemo(UserRole.CONTRACTOR)} className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold text-lg hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/30 flex items-center justify-center gap-3 group">
                       Launch Demo <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={() => setView('LEGAL_TERMS')} className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3">
                       <Play size={20} className="fill-current" /> Watch Video
                    </button>
                 </div>
                 
                 <div className="pt-8 border-t border-slate-200 dark:border-white/10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Explore Roles</p>
                    <div className="flex flex-wrap gap-2">
                       <RoleBadge label="Homeowner" onClick={() => onDemo(UserRole.HOMEOWNER)} />
                       <RoleBadge label="Contractor" onClick={() => onDemo(UserRole.CONTRACTOR)} />
                       <RoleBadge label="Crew" onClick={() => onDemo(UserRole.CREW_MEMBER)} />
                       <RoleBadge label="Franchise" onClick={() => onDemo(UserRole.FRANCHISE_OWNER)} />
                    </div>
                 </div>
              </div>

              {/* Interactive Graphic */}
              <div className="relative hidden lg:block perspective-1000">
                 <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-white/10 rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent rounded-3xl pointer-events-none"></div>
                    
                    {/* Fake UI Header */}
                    <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                             <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100" className="w-full h-full rounded-full object-cover" />
                          </div>
                          <div>
                             <div className="font-bold text-slate-900 dark:text-white">Mike's Plumbing</div>
                             <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1"><Zap size={10} fill="currentColor"/> Elite Pro</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today's Profit</div>
                          <div className="text-2xl font-black text-slate-900 dark:text-white">$1,450.00</div>
                       </div>
                    </div>

                    {/* Fake UI Content */}
                    <div className="p-6 space-y-4">
                       <div className="flex gap-4">
                          <div className="flex-1 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                             <div className="flex items-center gap-2 text-slate-500 mb-2">
                                <Clock size={16} /> <span className="text-xs font-bold uppercase">Next Job</span>
                             </div>
                             <div className="font-bold text-lg text-slate-900 dark:text-white">Water Heater Swap</div>
                             <div className="text-sm text-slate-400 mt-1">123 Oak St • 2:00 PM</div>
                          </div>
                          <div className="w-1/3 bg-brand-primary/10 p-4 rounded-2xl border border-brand-primary/20 flex flex-col items-center justify-center text-brand-primary">
                             <Mic size={24} className="mb-2" />
                             <div className="text-xs font-bold uppercase">Voice Hub</div>
                          </div>
                       </div>
                       
                       <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4">
                          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                             <ShieldCheck size={20} />
                          </div>
                          <div className="flex-1">
                             <div className="font-bold text-sm text-slate-900 dark:text-white">Insurance Active</div>
                             <div className="text-xs text-slate-400">Policy #9942-A covering current job.</div>
                          </div>
                          <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse"></div>
                       </div>

                       <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                             <span className="text-white font-bold uppercase tracking-widest text-sm">View Analytics</span>
                          </div>
                          <TrendingUp size={48} className="text-slate-300 dark:text-slate-700" />
                       </div>
                    </div>
                 </div>

                 {/* Floating Elements */}
                 <div className="absolute -top-10 -right-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="flex items-center gap-3">
                       <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><CheckCircle size={16}/></div>
                       <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">Payment Received</div>
                          <div className="text-xs text-slate-500">$450.00 • Instant Payout</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Stats Strip */}
        <div className="border-y border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 py-12 overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatItem value="14,000+" label="Active Pros" />
              <StatItem value="$42M" label="Processed YTD" />
              <StatItem value="30 sec" label="Avg Payout Time" />
              <StatItem value="99.9%" label="Platform Uptime" />
           </div>
        </div>

        {/* Workforce Command Section (NEW) */}
        <section id="workforce" className="py-24 bg-white dark:bg-slate-950">
           <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                 <div className="order-2 md:order-1 relative">
                    {/* Mock Workforce UI */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border border-slate-800 relative z-10">
                       <div className="flex justify-between items-center mb-6">
                          <h3 className="text-white font-bold text-lg">Live Map</h3>
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> 4 Active</span>
                       </div>
                       <div className="h-64 bg-slate-800 rounded-2xl relative overflow-hidden mb-4">
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-brand-primary rounded-full border-2 border-white shadow-[0_0_20px_#2563eb]"></div>
                          <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_20px_#10b981]"></div>
                       </div>
                       <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">M</div>
                                <div>
                                   <div className="text-white text-xs font-bold">Mike S.</div>
                                   <div className="text-slate-400 text-[10px]">On Site • 2h 15m</div>
                                </div>
                             </div>
                             <div className="text-emerald-400 text-xs font-bold">Active</div>
                          </div>
                       </div>
                    </div>
                    <div className="absolute -bottom-10 -left-10 w-full h-full bg-brand-primary/5 rounded-[3rem] -z-0"></div>
                 </div>
                 
                 <div className="order-1 md:order-2 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-bold uppercase tracking-widest">
                       <Users size={14}/> Workforce Command
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Manage Your Crew.<br/>Track Every Minute.</h2>
                    <p className="text-lg text-slate-500 leading-relaxed">
                       Stop chasing timesheets. Our integrated workforce management suite gives you a God's-eye view of your operation. Real-time GPS tracking, automated clock-ins, and one-click payroll approval.
                    </p>
                    <ul className="space-y-4 pt-4">
                       <li className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300">
                          <CheckCircle className="text-brand-primary" size={20}/> Live GPS Dispatch Map
                       </li>
                       <li className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300">
                          <CheckCircle className="text-brand-primary" size={20}/> Automated Time Sheets & Approval
                       </li>
                       <li className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300">
                          <CheckCircle className="text-brand-primary" size={20}/> Crew Status Monitoring (Idle/Active)
                       </li>
                    </ul>
                 </div>
              </div>
           </div>
        </section>

        {/* Workflow Section (How it Works) */}
        <section id="workflow" className="py-32 max-w-7xl mx-auto px-6">
           <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">The FairTrade Workflow</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">From first contact to final payout in record time.</p>
           </div>

           <div className="relative">
              {/* Connector Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 hidden md:block z-0"></div>
              
              <div className="grid md:grid-cols-4 gap-8 relative z-10">
                 <WorkflowStep 
                    step="01" 
                    title="Lead Capture" 
                    desc="Zephyr AI answers the phone, qualifies the lead, and schedules the visit."
                    icon={Phone}
                 />
                 <WorkflowStep 
                    step="02" 
                    title="AI Estimating" 
                    desc="Take a photo on site. Gemini Vision generates a line-item quote instantly."
                    icon={Sparkles}
                 />
                 <WorkflowStep 
                    step="03" 
                    title="Execution" 
                    desc="Track time, materials, and evidence photos in the app."
                    icon={Hammer}
                 />
                 <WorkflowStep 
                    step="04" 
                    title="Flash Payout" 
                    desc="Funds released from escrow to your card in <30 seconds upon approval."
                    icon={Zap}
                 />
              </div>
           </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-32 bg-white dark:bg-slate-900/50">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20 space-y-4">
                 <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Complete Operating System</h2>
                 <p className="text-xl text-slate-500 max-w-2xl mx-auto">Everything you need to run a modern trade business, consolidated into one powerful app.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
                 {/* Feature 1: AI Estimating */}
                 <div className="md:col-span-2 bg-slate-100 dark:bg-slate-900 rounded-3xl p-10 relative overflow-hidden group border border-slate-200 dark:border-white/5 hover:border-brand-primary/50 transition-all">
                    <div className="relative z-10 max-w-md">
                       <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6 shadow-sm"><Sparkles size={24}/></div>
                       <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Multimodal AI Estimating</h3>
                       <p className="text-slate-500 font-medium leading-relaxed">Simply point your camera at the problem. Our Gemini-powered vision engine identifies issues, counts materials, and drafts a line-item estimate in seconds.</p>
                    </div>
                    <div className="absolute right-0 bottom-0 w-1/3 h-full bg-gradient-to-l from-white/50 to-transparent dark:from-black/50">
                       {/* Abstract UI representation */}
                       <div className="absolute bottom-10 right-10 w-48 h-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl rotate-[-5deg] border border-slate-200 dark:border-white/10 p-4 space-y-2 opacity-80 group-hover:rotate-0 group-hover:opacity-100 transition-all duration-500">
                          <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2"></div>
                          <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="h-2 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between">
                             <div className="h-4 w-12 bg-emerald-100 rounded"></div>
                             <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Feature 2: Voice Hub */}
                 <div className="bg-slate-900 text-white rounded-3xl p-10 relative overflow-hidden group border border-white/10">
                    <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm"><Mic size={24}/></div>
                       <h3 className="text-2xl font-bold mb-4">Zephyr Voice</h3>
                       <p className="text-slate-400 font-medium text-sm leading-relaxed">Hands-free project management. Talk to your business like a partner.</p>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-primary blur-[80px] rounded-full"></div>
                 </div>

                 {/* Feature 3: Territory Map */}
                 <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 relative overflow-hidden group border border-slate-200 dark:border-white/5">
                    <div className="relative z-10">
                       <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-purple-600 mb-6"><MapPin size={24}/></div>
                       <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Territory Defense</h3>
                       <p className="text-slate-500 font-medium text-sm leading-relaxed">Claim exclusive zip codes. Own the digital real estate in your neighborhood.</p>
                    </div>
                 </div>

                 {/* Feature 4: Financial */}
                 <div className="md:col-span-2 bg-emerald-900 text-white rounded-3xl p-10 relative overflow-hidden group border border-white/10">
                    <div className="grid md:grid-cols-2 gap-10 relative z-10">
                       <div>
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 backdrop-blur-sm"><Zap size={24}/></div>
                          <h3 className="text-3xl font-bold mb-4">Instant Liquidity</h3>
                          <p className="text-emerald-100/70 font-medium leading-relaxed">Stop waiting net-30. Funds move from verified escrow to your debit card in under 30 seconds after job completion.</p>
                          <button className="mt-8 px-6 py-3 bg-white text-emerald-900 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-50 transition-colors">See Banking Features</button>
                       </div>
                       <div className="flex items-center justify-center">
                          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 w-full max-w-sm transform group-hover:-translate-y-2 transition-transform duration-500">
                             <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Available Balance</div>
                             <div className="text-4xl font-black mb-6">$12,450.00</div>
                             <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                   <div className="p-2 bg-emerald-500 rounded-lg"><ArrowRight size={14} className="text-white"/></div>
                                   <div className="flex-1 text-sm font-bold">Payout to Visa</div>
                                   <div className="text-sm font-bold opacity-70">-$840</div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                   <div className="p-2 bg-white/10 rounded-lg"><ArrowRight size={14} className="text-white rotate-180"/></div>
                                   <div className="flex-1 text-sm font-bold">Project Deposit</div>
                                   <div className="text-sm font-bold opacity-70 text-emerald-400">+$2,400</div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 px-6">
           <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-12 text-slate-400 uppercase tracking-widest">Built by Pros, For Pros</h2>
              <div className="grid md:grid-cols-3 gap-8">
                 <TestimonialCard 
                    quote="I stopped doing paperwork at night. The AI handles my scheduling and invoices while I'm driving to the next job."
                    name="Mike R."
                    role="Master Plumber"
                    loc="Austin, TX"
                 />
                 <TestimonialCard 
                    quote="The instant payout feature changed my cash flow. I buy materials for tomorrow's job with today's earnings."
                    name="Sarah J."
                    role="Electrician"
                    loc="Seattle, WA"
                 />
                 <TestimonialCard 
                    quote="Territory exclusivity is real. Since claiming my zip code, my lead quality has doubled."
                    name="David C."
                    role="HVAC Tech"
                    loc="Miami, FL"
                 />
              </div>
           </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-6">
           <div className="max-w-5xl mx-auto bg-slate-900 rounded-3xl p-12 md:p-24 text-center relative overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                 <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px]"></div>
                 <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
              </div>
              
              <div className="relative z-10 space-y-8">
                 <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Ready to upgrade?</h2>
                 <p className="text-xl text-slate-400 max-w-2xl mx-auto">Join 12,000+ contractors running their entire operation on FairTrade OS.</p>
                 <button onClick={onGetStarted} className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl">
                    Get Started Free
                 </button>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No credit card required for Essentials plan</p>
              </div>
           </div>
        </section>

      </main>

      <footer className="bg-slate-50 dark:bg-slate-950 py-20 border-t border-slate-200 dark:border-white/5">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-sm text-slate-500">
            <div className="col-span-1 md:col-span-2 space-y-6">
               <div className="flex items-center gap-2">
                  <Hexagon className="text-brand-primary" size={24} strokeWidth={3} />
                  <span className="font-black text-lg text-slate-900 dark:text-white uppercase italic">FairTrade</span>
               </div>
               <p className="max-w-xs">The operating system for the modern tradesperson. Built with precision in Austin, TX.</p>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Platform</h4>
               <ul className="space-y-4">
                  <li><button onClick={() => scrollToSection('features')} className="hover:text-brand-primary">Features</button></li>
                  <li><button onClick={() => scrollToSection('economy')} className="hover:text-brand-primary">Pricing</button></li>
                  <li><button onClick={() => setView('LEGAL_TERMS')} className="hover:text-brand-primary">Terms of Service</button></li>
                  <li><button onClick={() => setView('LEGAL_PRIVACY')} className="hover:text-brand-primary">Privacy Policy</button></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Connect</h4>
               <ul className="space-y-4">
                  <li><a href="#" className="hover:text-brand-primary">Twitter / X</a></li>
                  <li><a href="#" className="hover:text-brand-primary">LinkedIn</a></li>
                  <li><button onClick={() => setView('SUPPORT_HELP')} className="hover:text-brand-primary">Support</button></li>
                  <li><button onClick={() => setView('SAFETY_GUIDELINES')} className="hover:text-brand-primary">Safety</button></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-200 dark:border-white/5 text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
            <span>© 2025 FairTrade Inc.</span>
            <span>All Systems Operational</span>
         </div>
      </footer>
    </div>
  );
};

const NavLink = ({ children, onClick }: { children?: React.ReactNode, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-colors"
  >
    {children}
  </button>
);

const RoleBadge = ({ label, onClick }: { label: string, onClick: () => void }) => (
   <button onClick={onClick} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      {label}
   </button>
);

const StatItem = ({ value, label }: { value: string, label: string }) => (
   <div className="text-center">
      <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{value}</div>
      <div className="text-xs font-bold text-brand-primary uppercase tracking-widest">{label}</div>
   </div>
);

const WorkflowStep = ({ step, title, desc, icon: Icon }: any) => (
   <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-white/5 relative group hover:-translate-y-2 transition-transform duration-300">
      <div className="text-6xl font-black text-slate-100 dark:text-slate-800 absolute top-4 right-6 select-none">{step}</div>
      <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6"><Icon size={24}/></div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">{title}</h3>
      <p className="text-sm text-slate-500 relative z-10 leading-relaxed">{desc}</p>
   </div>
);

const TestimonialCard = ({ quote, name, role, loc }: any) => (
   <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5">
      <div className="flex gap-1 text-amber-400 mb-6">
         <Star size={16} fill="currentColor" />
         <Star size={16} fill="currentColor" />
         <Star size={16} fill="currentColor" />
         <Star size={16} fill="currentColor" />
         <Star size={16} fill="currentColor" />
      </div>
      <p className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-6 leading-relaxed">"{quote}"</p>
      <div>
         <div className="font-bold text-slate-900 dark:text-white">{name}</div>
         <div className="text-xs font-bold text-brand-primary uppercase tracking-widest">{role} • {loc}</div>
      </div>
   </div>
);

export default LandingPage;
