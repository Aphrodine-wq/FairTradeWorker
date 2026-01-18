
import React, { useState } from 'react';
import { ThemeSettings, UserRole, ThemeColor, BorderRadius, NavItemConfig, InterfaceDensity, AppFont, FontSize, ContrastMode, BusinessVerification, BackgroundPattern } from '../types';
import { Bell, Lock, User, Shield, LogOut, Palette, Check, Layout as LayoutIcon, Eye, EyeOff, Camera, Mail, Type, Maximize2, Monitor, MessageSquare, Map, Briefcase as BriefcaseIcon, Key, Grid, Layers, Zap, Wind, Box, Maximize, Command, Sparkles, Coffee, Cpu, Leaf, Volume2, Smartphone, Scale, Sun, AlertTriangle, ShieldCheck, FileText, CheckCircle2, Target, Moon, Terminal, Anchor, Menu } from 'lucide-react';

interface SettingsProps {
  role: UserRole;
  themeSettings: ThemeSettings;
  setThemeSettings: (settings: ThemeSettings) => void;
  navConfig: NavItemConfig[];
  setNavConfig: (config: NavItemConfig[]) => void;
}

const PRESETS: { id: string; label: string; icon: any; settings: ThemeSettings; description: string }[] = [
  {
    id: 'default',
    label: 'Classic',
    icon: Command,
    description: 'Clean, professional.',
    settings: { color: 'blue', radius: 'lg', density: 'comfortable', font: 'sans', fontSize: 'md', contrast: 'standard', darkMode: false, glassStrength: 'medium', texture: 'none', animationSpeed: 'normal', soundEnabled: true, hapticsEnabled: true }
  },
  {
    id: 'blueprint',
    label: 'Blueprint',
    icon: Map,
    description: 'Architectural precision.',
    settings: { color: 'blue', radius: 'none', density: 'compact', font: 'mono', fontSize: 'sm', contrast: 'high', darkMode: true, glassStrength: 'low', texture: 'blueprint', animationSpeed: 'fast', soundEnabled: true, hapticsEnabled: true }
  },
  {
    id: 'tech',
    label: 'Circuit',
    icon: Cpu,
    description: 'High-tech engineering.',
    settings: { color: 'neon', radius: 'sm', density: 'compact', font: 'mono', fontSize: 'md', contrast: 'high', darkMode: true, glassStrength: 'high', texture: 'circuit', animationSpeed: 'instant', soundEnabled: true, hapticsEnabled: true }
  },
  {
    id: 'field',
    label: 'Topography',
    icon: Map,
    description: 'Field operations map.',
    settings: { color: 'emerald', radius: 'lg', density: 'comfortable', font: 'sans', fontSize: 'md', contrast: 'standard', darkMode: true, glassStrength: 'medium', texture: 'topography', animationSpeed: 'normal', soundEnabled: true, hapticsEnabled: true }
  },
  {
    id: 'coffee',
    label: 'Drafting',
    icon: Coffee,
    description: 'Warm, paper texture.',
    settings: { color: 'cozy', radius: 'full', density: 'comfortable', font: 'sans', fontSize: 'lg', contrast: 'standard', darkMode: false, glassStrength: 'opaque', texture: 'paper', animationSpeed: 'slow', soundEnabled: true, hapticsEnabled: false }
  },
  {
    id: 'terminal',
    label: 'Retro Term',
    icon: Terminal,
    description: 'Hacker green console style.',
    settings: { color: 'hacker', radius: 'none', density: 'compact', font: 'mono', fontSize: 'md', contrast: 'high', darkMode: true, glassStrength: 'opaque', texture: 'graph', animationSpeed: 'instant', soundEnabled: true, hapticsEnabled: true }
  },
  {
    id: 'neptune',
    label: 'Neptune',
    icon: Anchor,
    description: 'Teal and ocean vibes.',
    settings: { color: 'teal', radius: 'lg', density: 'comfortable', font: 'sans', fontSize: 'md', contrast: 'standard', darkMode: false, glassStrength: 'medium', texture: 'dots', animationSpeed: 'slow', soundEnabled: true, hapticsEnabled: true }
  },
  {
    id: 'tactical',
    label: 'Tactical',
    icon: Target,
    description: 'Field-ready camo.',
    settings: { color: 'emerald', radius: 'sm', density: 'compact', font: 'sans', fontSize: 'md', contrast: 'high', darkMode: true, glassStrength: 'high', texture: 'camo-forest', animationSpeed: 'fast', soundEnabled: true, hapticsEnabled: true }
  }
];

const THEMES: { id: ThemeColor; label: string; color: string; ring: string }[] = [
   { id: 'blue', label: 'Default Blue', color: 'bg-blue-600', ring: 'ring-blue-600' },
   { id: 'emerald', label: 'Forest Green', color: 'bg-emerald-600', ring: 'ring-emerald-600' },
   { id: 'violet', label: 'Royal Violet', color: 'bg-violet-600', ring: 'ring-violet-600' },
   { id: 'orange', label: 'Sunset Orange', color: 'bg-orange-600', ring: 'ring-orange-600' },
   { id: 'crimson', label: 'Crimson Red', color: 'bg-rose-600', ring: 'ring-rose-600' },
   { id: 'industrial', label: 'Industrial', color: 'bg-slate-600', ring: 'ring-slate-600' },
   { id: 'cozy', label: 'Cozy Amber', color: 'bg-amber-600', ring: 'ring-amber-600' },
   { id: 'luxury', label: 'Luxury Gold', color: 'bg-yellow-600', ring: 'ring-yellow-600' },
   { id: 'neon', label: 'Neon Teal', color: 'bg-cyan-400', ring: 'ring-cyan-400' },
   { id: 'slate', label: 'Minimal Slate', color: 'bg-slate-500', ring: 'ring-slate-500' },
   { id: 'teal', label: 'Ocean Teal', color: 'bg-teal-600', ring: 'ring-teal-600' },
   { id: 'hacker', label: 'Hacker', color: 'bg-green-500', ring: 'ring-green-500' },
];

const BACKGROUNDS: { id: BackgroundPattern; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'grid', label: 'Grid' },
  { id: 'dots', label: 'Dots' },
  { id: 'noise', label: 'Noise' },
  { id: 'graph', label: 'Graph Paper' },
  { id: 'blueprint', label: 'Blueprint' },
  { id: 'circuit', label: 'Circuit' },
  { id: 'topography', label: 'Topo Map' },
  { id: 'hex', label: 'Hex Mesh' },
  { id: 'paper', label: 'Fiber' },
];

const CAMO_PATTERNS: { id: BackgroundPattern; label: string; class: string }[] = [
  { id: 'camo-forest', label: 'Forest', class: 'camo-forest' },
  { id: 'camo-desert', label: 'Desert', class: 'camo-desert' },
  { id: 'camo-urban', label: 'Urban', class: 'camo-urban' },
  { id: 'camo-midnight', label: 'Midnight', class: 'camo-midnight' },
  { id: 'camo-digital', label: 'Digital', class: 'camo-digital' },
];

const Settings: React.FC<SettingsProps> = ({ role, themeSettings, setThemeSettings, navConfig, setNavConfig }) => {
  const [activeSection, setActiveSection] = useState<'APPEARANCE' | 'NAVIGATION' | 'ACCOUNT' | 'VERIFICATION' | 'NOTIFICATIONS' | 'ADVANCED_THEME'>('APPEARANCE');
  
  // Business Verification State
  const [bizForm, setBizForm] = useState<BusinessVerification>({
    businessName: 'Mike\'s Plumbing Co.',
    ein: '',
    licenseNumber: '',
    licenseState: 'TX',
    insuranceProvider: '',
    policyNumber: '',
    policyExpiration: '',
    isVerified: false
  });
  const [verificationStatus, setVerificationStatus] = useState<'IDLE' | 'PENDING' | 'VERIFIED'>('IDLE');

  const handleVerify = () => {
    setVerificationStatus('PENDING');
    setTimeout(() => {
      setVerificationStatus('VERIFIED');
      setBizForm(prev => ({ ...prev, isVerified: true, verificationDate: new Date().toLocaleDateString() }));
    }, 2000);
  };

  const toggleNavItem = (id: string) => {
    setNavConfig(navConfig.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fadeIn flex flex-col md:flex-row gap-8 h-full">
       
       {/* Settings Sidebar */}
       <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 pl-2">Settings</h1>
          
          <SettingTab active={activeSection === 'APPEARANCE'} onClick={() => setActiveSection('APPEARANCE')} icon={Palette} label="Appearance" />
          <SettingTab active={activeSection === 'ADVANCED_THEME'} onClick={() => setActiveSection('ADVANCED_THEME')} icon={Sparkles} label="Advanced Theme" />
          <SettingTab active={activeSection === 'NAVIGATION'} onClick={() => setActiveSection('NAVIGATION')} icon={Menu} label="Menu & Nav" />
          <SettingTab active={activeSection === 'ACCOUNT'} onClick={() => setActiveSection('ACCOUNT')} icon={User} label="Account" />
          {role === UserRole.CONTRACTOR && (
             <SettingTab active={activeSection === 'VERIFICATION'} onClick={() => setActiveSection('VERIFICATION')} icon={ShieldCheck} label="Verification" />
          )}
          <SettingTab active={activeSection === 'NOTIFICATIONS'} onClick={() => setActiveSection('NOTIFICATIONS')} icon={Bell} label="Notifications" />
          
          <div className="pt-8 pl-2">
             <button className="text-red-500 hover:text-red-600 font-bold flex items-center gap-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2 rounded-lg transition-colors w-full">
               <LogOut size={16} /> Log Out
             </button>
          </div>
       </div>

       {/* Main Content Area */}
       <div className="flex-1 space-y-6">
          
          {activeSection === 'NAVIGATION' && (
             <section className="glass-panel p-8 rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white shadow-sm">
                      <Menu size={24} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sidebar Customization</h2>
                      <p className="text-slate-500 text-sm">Choose which tools appear in your main menu.</p>
                   </div>
                </div>

                <div className="grid gap-3">
                   {navConfig.map(item => (
                      <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${item.visible ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10' : 'bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-60'}`}>
                         <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${item.visible ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                               <Menu size={16}/>
                            </div>
                            <span className={`font-bold ${item.visible ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{item.label}</span>
                            {item.required && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 uppercase font-bold tracking-wider">Required</span>}
                         </div>
                         
                         {!item.required && (
                            <button 
                               onClick={() => toggleNavItem(item.id)}
                               className={`w-12 h-6 rounded-full p-1 transition-colors ${item.visible ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                               <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${item.visible ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                         )}
                      </div>
                   ))}
                </div>
             </section>
          )}

          {activeSection === 'VERIFICATION' && (
             <section className="glass-panel p-8 rounded-[2rem] bg-white dark:bg-slate-900 shadow-lg animate-fadeIn">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <ShieldCheck size={24} className={verificationStatus === 'VERIFIED' ? "text-emerald-500" : "text-brand-primary"} /> 
                        Business Verification
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Required for "Verified Pro" badge and territory access.</p>
                   </div>
                   {verificationStatus === 'VERIFIED' && (
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-emerald-200 dark:border-emerald-500/20">
                         <CheckCircle2 size={16} /> Verified Active
                      </div>
                   )}
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                   <InputGroup label="Legal Business Name" value={bizForm.businessName} onChange={v => setBizForm({...bizForm, businessName: v})} />
                   <InputGroup label="Tax ID (EIN)" value={bizForm.ein} onChange={v => setBizForm({...bizForm, ein: v})} placeholder="XX-XXXXXXX" />
                   <InputGroup label="Trade License Number" value={bizForm.licenseNumber} onChange={v => setBizForm({...bizForm, licenseNumber: v})} />
                   <div>
                      <InputGroup label="Issuing State" value={bizForm.licenseState} onChange={v => setBizForm({...bizForm, licenseState: v})} />
                      <div className="mt-4">
                         <label className="flex items-center gap-3 p-3 border border-dashed border-slate-300 dark:border-white/20 rounded-xl w-full cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                               <FileText size={16} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Upload License</span>
                         </label>
                      </div>
                   </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 pt-8 mb-8">
                   <h3 className="text-sm font-bold uppercase text-slate-500 mb-6 tracking-widest flex items-center gap-2"><FileText size={16}/> Insurance Policy</h3>
                   <div className="grid md:grid-cols-2 gap-6">
                      <InputGroup label="Insurance Carrier" value={bizForm.insuranceProvider} onChange={v => setBizForm({...bizForm, insuranceProvider: v})} />
                      <InputGroup label="Policy Number" value={bizForm.policyNumber} onChange={v => setBizForm({...bizForm, policyNumber: v})} />
                      <InputGroup label="Expiration Date" type="date" value={bizForm.policyExpiration} onChange={v => setBizForm({...bizForm, policyExpiration: v})} />
                      <div className="flex items-end">
                         <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-white/10 rounded-xl w-full cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                               <Camera size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Upload COI (PDF/IMG)</span>
                         </label>
                      </div>
                   </div>
                </div>

                <div className="flex justify-end gap-4">
                   <button className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Save Draft</button>
                   <button 
                      onClick={handleVerify} 
                      disabled={verificationStatus !== 'IDLE'}
                      className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 ${verificationStatus === 'VERIFIED' ? 'bg-emerald-500 cursor-default' : 'bg-brand-primary hover:bg-brand-secondary active:scale-95'}`}
                   >
                      {verificationStatus === 'IDLE' && 'Submit for Verification'}
                      {verificationStatus === 'PENDING' && 'Verifying...'}
                      {verificationStatus === 'VERIFIED' && 'Verified'}
                   </button>
                </div>
             </section>
          )}

          {activeSection === 'ADVANCED_THEME' && (
             <div className="space-y-6 animate-fadeIn">
                <section className="glass-panel p-8 rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm space-y-8">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                         <Sparkles size={24} />
                      </div>
                      <div>
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Advanced Theme Settings</h2>
                         <p className="text-slate-500 text-sm">Fine-tune every aspect of your interface appearance.</p>
                      </div>
                   </div>

                   {/* Border Radius Control */}
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                         <Box size={14}/> Corner Radius
                      </h3>
                      <div className="grid grid-cols-5 gap-3">
                         {['none', 'sm', 'md', 'lg', 'full'].map((r) => (
                            <button
                               key={r}
                               onClick={() => setThemeSettings({ ...themeSettings, radius: r as BorderRadius })}
                               className={`p-4 rounded-lg border transition-all flex flex-col items-center justify-center gap-2 ${themeSettings.radius === r ? 'border-brand-primary bg-brand-primary/10' : 'border-slate-200 dark:border-white/10'}`}
                            >
                               <div className={`w-6 h-6 bg-slate-300 dark:bg-slate-600 ${r === 'none' ? 'rounded-none' : r === 'sm' ? 'rounded-sm' : r === 'md' ? 'rounded-md' : r === 'lg' ? 'rounded-lg' : 'rounded-full'}`}></div>
                               <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase">{r === 'full' ? 'Full' : r || 'None'}</span>
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Density Control */}
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                         <Maximize2 size={14}/> UI Density
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                         <button
                            onClick={() => setThemeSettings({ ...themeSettings, density: 'comfortable' })}
                            className={`p-5 rounded-xl border transition-all ${themeSettings.density === 'comfortable' ? 'border-brand-primary bg-brand-primary/10' : 'border-slate-200 dark:border-white/10'}`}
                         >
                            <div className="text-sm font-bold text-slate-900 dark:text-white mb-2">Comfortable</div>
                            <p className="text-[11px] text-slate-500">Spacious layout with breathing room</p>
                         </button>
                         <button
                            onClick={() => setThemeSettings({ ...themeSettings, density: 'compact' })}
                            className={`p-5 rounded-xl border transition-all ${themeSettings.density === 'compact' ? 'border-brand-primary bg-brand-primary/10' : 'border-slate-200 dark:border-white/10'}`}
                         >
                            <div className="text-sm font-bold text-slate-900 dark:text-white mb-2">Compact</div>
                            <p className="text-[11px] text-slate-500">Minimal padding for power users</p>
                         </button>
                      </div>
                   </div>

                   {/* Font Family Control */}
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                         <Type size={14}/> Font Family
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                         <button
                            onClick={() => setThemeSettings({ ...themeSettings, font: 'sans' })}
                            className={`p-4 rounded-xl border transition-all ${themeSettings.font === 'sans' ? 'border-brand-primary bg-brand-primary/10' : 'border-slate-200 dark:border-white/10'}`}
                         >
                            <div style={{ fontFamily: 'sans-serif' }} className="text-sm font-bold text-slate-900 dark:text-white mb-1">Sans Serif</div>
                            <p className="text-[11px] text-slate-500 font-sans">Clean, modern, readable</p>
                         </button>
                         <button
                            onClick={() => setThemeSettings({ ...themeSettings, font: 'mono' })}
                            className={`p-4 rounded-xl border transition-all ${themeSettings.font === 'mono' ? 'border-brand-primary bg-brand-primary/10' : 'border-slate-200 dark:border-white/10'}`}
                         >
                            <div style={{ fontFamily: 'monospace' }} className="text-sm font-bold text-slate-900 dark:text-white mb-1">Monospace</div>
                            <p className="text-[11px] text-slate-500 font-mono">Technical, data-focused</p>
                         </button>
                      </div>
                   </div>

                   {/* Glass Strength Control */}
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                         <Layers size={14}/> Glass Effect Strength
                      </h3>
                      <div className="grid grid-cols-4 gap-3">
                         {['low', 'medium', 'high', 'opaque'].map((strength) => (
                            <button
                               key={strength}
                               onClick={() => setThemeSettings({ ...themeSettings, glassStrength: strength as any })}
                               className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${themeSettings.glassStrength === strength ? 'border-brand-primary bg-brand-primary/10' : 'border-slate-200 dark:border-white/10'}`}
                            >
                               <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 ${strength === 'low' ? 'opacity-40' : strength === 'medium' ? 'opacity-60' : strength === 'high' ? 'opacity-80' : 'opacity-100'}`}></div>
                               <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase capitalize">{strength}</span>
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Animation Speed Control */}
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                         <Wind size={14}/> Animation Speed
                      </h3>
                      <div className="grid grid-cols-4 gap-3">
                         {['instant', 'fast', 'normal', 'slow'].map((speed) => (
                            <button
                               key={speed}
                               onClick={() => setThemeSettings({ ...themeSettings, animationSpeed: speed as any })}
                               className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${themeSettings.animationSpeed === speed ? 'border-brand-primary bg-brand-primary/10' : 'border-slate-200 dark:border-white/10'}`}
                            >
                               <div className={`w-2 h-6 bg-brand-primary rounded-full animate-pulse`} style={{ animationDuration: speed === 'instant' ? '0s' : speed === 'fast' ? '0.5s' : speed === 'normal' ? '1s' : '2s' }}></div>
                               <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase capitalize">{speed}</span>
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Dark Mode Toggle */}
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                         <Moon size={14}/> Dark Mode
                      </h3>
                      <button
                         onClick={() => setThemeSettings({ ...themeSettings, darkMode: !themeSettings.darkMode })}
                         className={`w-full p-6 rounded-xl border flex items-center justify-between transition-all ${themeSettings.darkMode ? 'border-brand-primary bg-brand-primary/10' : 'border-slate-200 dark:border-white/10'}`}
                      >
                         <div className="flex items-center gap-3">
                            <Moon size={20} className={themeSettings.darkMode ? 'text-brand-primary' : 'text-slate-400'} />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">Enable Dark Mode</span>
                         </div>
                         <div className={`w-12 h-6 rounded-full p-1 transition-colors ${themeSettings.darkMode ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${themeSettings.darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </div>
                      </button>
                   </div>

                   {/* Theme Preview */}
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                         <Monitor size={14}/> Live Preview
                      </h3>
                      <div className={`p-8 rounded-2xl border-2 border-dashed transition-all ${themeSettings.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                         <p className={`text-center text-sm font-bold mb-4 ${themeSettings.darkMode ? 'text-white' : 'text-slate-900'}`}>
                            Preview: {themeSettings.color} + {themeSettings.radius}
                         </p>
                         <div className="flex flex-wrap gap-3 justify-center">
                            <button className={`px-4 py-2 rounded-[${themeSettings.radius}] bg-brand-primary text-white font-bold text-xs transition-all hover:scale-105`}>
                               Sample Button
                            </button>
                            <div className={`px-4 py-2 rounded-[${themeSettings.radius}] border-2 border-brand-primary text-brand-primary font-bold text-xs`}>
                               Sample Card
                            </div>
                         </div>
                      </div>
                   </div>
                </section>
             </div>
          )}

          {activeSection === 'APPEARANCE' && (
             <div className="space-y-6 animate-fadeIn">
                {/* Quick Presets */}
                <section className="glass-panel p-6 rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm">
                   <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                        <Sparkles size={18} className="text-brand-primary" /> Quick Themes
                      </h2>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                      {PRESETS.map((preset) => (
                         <button
                            key={preset.id}
                            onClick={() => setThemeSettings(preset.settings)}
                            className="flex flex-col items-center p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand-primary dark:hover:border-brand-primary hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-center group active:scale-95"
                         >
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg mb-2 text-slate-600 dark:text-slate-300 group-hover:text-brand-primary transition-colors">
                               <preset.icon size={20} />
                            </div>
                            <div className="font-bold text-[10px] text-slate-900 dark:text-white">{preset.label}</div>
                         </button>
                      ))}
                   </div>
                </section>

                <section className="glass-panel p-8 rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm space-y-8">
                   
                   {/* Tactical Appearance / Camo Mode */}
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                         <Target size={14}/> Tactical Appearance
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                         <button
                            onClick={() => setThemeSettings({ ...themeSettings, texture: 'none', darkMode: false })}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${themeSettings.texture === 'none' ? 'border-brand-primary bg-brand-primary/10' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5'}`}
                         >
                            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                            <span className="text-[10px] font-bold text-slate-500">Standard</span>
                         </button>
                         {CAMO_PATTERNS.map((camo) => (
                            <button
                               key={camo.id}
                               onClick={() => setThemeSettings({ ...themeSettings, texture: camo.id, darkMode: true })}
                               className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${themeSettings.texture === camo.id ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-slate-200 dark:border-white/10'}`}
                            >
                               <div className={`w-8 h-8 rounded-full shadow-sm border border-white/20 ${camo.class}`}></div>
                               <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{camo.label}</span>
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* UI Scale & Contrast */}
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                         <Scale size={14}/> Display & Scale
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                         <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 block">Font Size Scale</label>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                               {['sm', 'md', 'lg'].map((s) => (
                                  <button
                                     key={s}
                                     onClick={() => setThemeSettings({ ...themeSettings, fontSize: s as FontSize })}
                                     className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${themeSettings.fontSize === s ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                                  >
                                     {s === 'sm' ? 'Compact' : s === 'md' ? 'Standard' : 'Large'}
                                  </button>
                               ))}
                            </div>
                         </div>
                         <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 block">Contrast Mode</label>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                               <button onClick={() => setThemeSettings({ ...themeSettings, contrast: 'standard' })} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${themeSettings.contrast === 'standard' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-500'}`}>Standard</button>
                               <button onClick={() => setThemeSettings({ ...themeSettings, contrast: 'high' })} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${themeSettings.contrast === 'high' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-500'}`}><Sun size={12}/> High Visibility</button>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Interaction Feedback */}
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                         <Smartphone size={14}/> Interaction
                      </h3>
                      <div className="flex gap-4">
                         <button 
                            onClick={() => setThemeSettings({ ...themeSettings, soundEnabled: !themeSettings.soundEnabled })}
                            className={`flex-1 p-4 rounded-xl border flex items-center justify-between transition-all ${themeSettings.soundEnabled ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 dark:border-white/10'}`}
                         >
                            <div className="flex items-center gap-3">
                               <Volume2 size={18} className={themeSettings.soundEnabled ? 'text-brand-primary' : 'text-slate-400'}/>
                               <span className="text-sm font-bold">UI Sounds</span>
                            </div>
                            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${themeSettings.soundEnabled ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-700'}`}>
                               <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${themeSettings.soundEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                         </button>
                         <button 
                            onClick={() => setThemeSettings({ ...themeSettings, hapticsEnabled: !themeSettings.hapticsEnabled })}
                            className={`flex-1 p-4 rounded-xl border flex items-center justify-between transition-all ${themeSettings.hapticsEnabled ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 dark:border-white/10'}`}
                         >
                            <div className="flex items-center gap-3">
                               <Zap size={18} className={themeSettings.hapticsEnabled ? 'text-brand-primary' : 'text-slate-400'}/>
                               <span className="text-sm font-bold">Haptics</span>
                            </div>
                            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${themeSettings.hapticsEnabled ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-700'}`}>
                               <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${themeSettings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                         </button>
                      </div>
                   </div>

                   {/* Colors & Structure (Existing) */}
                   <div className="grid md:grid-cols-2 gap-8">
                      <div>
                         <label className="text-xs font-bold uppercase text-slate-500 mb-3 block">Accent Color</label>
                         <div className="grid grid-cols-6 gap-2">
                           {THEMES.map((t) => (
                               <button 
                                 key={t.id}
                                 onClick={() => setThemeSettings({ ...themeSettings, color: t.id })}
                                 className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${t.color} ${themeSettings.color === t.id ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ' + t.ring : 'opacity-70 hover:opacity-100'}`}
                               >
                                 {themeSettings.color === t.id && <Check size={14} className="text-white" strokeWidth={4} />}
                               </button>
                           ))}
                         </div>
                      </div>
                      <div>
                         <label className="text-xs font-bold uppercase text-slate-500 mb-3 block">Canvas Texture</label>
                         <div className="grid grid-cols-4 gap-2">
                            {BACKGROUNDS.map((t) => (
                               <button
                                 key={t.id}
                                 onClick={() => setThemeSettings({ ...themeSettings, texture: t.id as any })}
                                 className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${themeSettings.texture === t.id ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-slate-200 dark:border-white/10 text-slate-400'}`}
                               >
                                  <Box size={14}/>
                                  <span className="text-[9px] font-bold uppercase leading-none">{t.label}</span>
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </section>
             </div>
          )}

          {activeSection === 'ACCOUNT' && (
             <section className="glass-panel p-8 rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-6 mb-8">
                   <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-400">
                      {role === UserRole.CONTRACTOR ? 'C' : 'U'}
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Details</h2>
                      <p className="text-slate-500">Manage your identity and login credentials.</p>
                   </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                   <InputGroup label="Full Name" value="John Doe" />
                   <InputGroup label="Email Address" value="john@fairtrade.pro" />
                   <InputGroup label="Phone Number" value="(512) 555-0192" />
                   <InputGroup label="Role" value={role} disabled />
                </div>
             </section>
          )}
       </div>
    </div>
  );
};

const SettingTab = ({ active, onClick, icon: Icon, label }: any) => (
   <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active ? 'bg-brand-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
   >
      <Icon size={18} />
      {label}
   </button>
);

const InputGroup = ({ label, value, onChange, placeholder, disabled, type = 'text' }: any) => (
   <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">{label}</label>
      <input 
         type={type}
         disabled={disabled}
         value={value}
         onChange={e => onChange && onChange(e.target.value)}
         placeholder={placeholder}
         className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:border-brand-primary focus:outline-none transition-colors font-bold text-slate-900 dark:text-white disabled:opacity-50"
      />
   </div>
);

export default Settings;
