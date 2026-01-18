
import React, { useEffect, useState } from 'react';
import { UserRole, View, ThemeSettings, NavItemConfig, UserProfile, ThemeColor } from '../../types';
import { 
  Home, Search, Settings, Wallet, 
  LogOut, CreditCard, Map, FileText,
  TrendingUp, Plus, Boxes, User, Briefcase, ClipboardList, Clock, Command, Users
} from 'lucide-react';
import CommandPalette from './CommandPalette';

interface LayoutProps {
  children: React.ReactNode;
  profile: UserProfile;
  setRole: (role: UserRole) => void;
  currentView: View;
  setView: (view: View) => void;
  onLogout: () => void;
  themeSettings: ThemeSettings;
  navConfig: NavItemConfig[];
}

const THEME_CONFIG: Record<ThemeColor, { primary: string; secondary: string; surface: string }> = {
  blue: { primary: '#2563eb', secondary: '#1e40af', surface: '#f8fafc' },
  emerald: { primary: '#059669', secondary: '#065f46', surface: '#f0fdf4' },
  violet: { primary: '#7c3aed', secondary: '#5b21b6', surface: '#f5f3ff' },
  orange: { primary: '#ea580c', secondary: '#9a3412', surface: '#fff7ed' },
  crimson: { primary: '#e11d48', secondary: '#9f1239', surface: '#fff1f2' },
  industrial: { primary: '#475569', secondary: '#1e293b', surface: '#f8fafc' },
  cozy: { primary: '#d97706', secondary: '#92400e', surface: '#fffbeb' },
  luxury: { primary: '#ca8a04', secondary: '#854d0e', surface: '#fefce8' },
  neon: { primary: '#06b6d4', secondary: '#0891b2', surface: '#ecfeff' },
  slate: { primary: '#64748b', secondary: '#334155', surface: '#f1f5f9' },
  teal: { primary: '#0d9488', secondary: '#115e59', surface: '#f0fdfa' },
  hacker: { primary: '#22c55e', secondary: '#15803d', surface: '#000000' },
};

const Layout: React.FC<LayoutProps> = ({ children, profile, setRole, currentView, setView, onLogout, themeSettings, navConfig }) => {
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  // Keyboard listener for Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCmdOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Apply Theme Variables
  useEffect(() => {
    const root = document.documentElement;
    const theme = THEME_CONFIG[themeSettings.color] || THEME_CONFIG.blue;

    root.style.setProperty('--brand-primary', theme.primary);
    root.style.setProperty('--brand-secondary', theme.secondary);
    root.style.setProperty('--brand-surface', theme.surface);

    // Font Scaling
    const fontScale = themeSettings.fontSize === 'sm' ? '87.5%' : themeSettings.fontSize === 'lg' ? '112.5%' : '100%';
    root.style.fontSize = fontScale;

    // Contrast Mode
    if (themeSettings.contrast === 'high') {
       root.style.setProperty('--contrast-text', '#000000');
       root.style.setProperty('--contrast-border', '#000000');
    } else {
       root.style.removeProperty('--contrast-text');
       root.style.removeProperty('--contrast-border');
    }

    // Glass Strength
    const glassMap = {
      low: { bg: 'rgba(255, 255, 255, 0.3)', darkBg: 'rgba(15, 23, 42, 0.3)', blur: '4px', border: 'rgba(255,255,255,0.2)' },
      medium: { bg: 'rgba(255, 255, 255, 0.7)', darkBg: 'rgba(15, 23, 42, 0.6)', blur: '12px', border: 'rgba(255,255,255,0.5)' },
      high: { bg: 'rgba(255, 255, 255, 0.9)', darkBg: 'rgba(15, 23, 42, 0.8)', blur: '24px', border: 'rgba(255,255,255,0.8)' },
      opaque: { bg: '#ffffff', darkBg: '#0f172a', blur: '0px', border: 'transparent' },
    };
    
    const currentGlass = glassMap[themeSettings.glassStrength || 'medium'];
    root.style.setProperty('--glass-bg', themeSettings.darkMode ? currentGlass.darkBg : currentGlass.bg);
    root.style.setProperty('--glass-blur', currentGlass.blur);
    root.style.setProperty('--glass-border', themeSettings.darkMode ? 'rgba(255,255,255,0.08)' : currentGlass.border);
    
    // Animation Speed
    const speeds = { instant: '0ms', fast: '150ms', normal: '300ms', slow: '700ms' };
    root.style.setProperty('--speed', speeds[themeSettings.animationSpeed || 'normal']);

    // Radius Map (Deep Theming)
    const radiusMap = {
      none: { lg: '0px', xl: '0px', xxl: '0px', xxxl: '0px' },
      sm: { lg: '4px', xl: '6px', xxl: '8px', xxxl: '12px' },
      md: { lg: '8px', xl: '12px', xxl: '16px', xxxl: '24px' }, // Standard
      lg: { lg: '12px', xl: '16px', xxl: '24px', xxxl: '32px' },
      full: { lg: '16px', xl: '24px', xxl: '32px', xxxl: '40px' },
    };
    
    const r = radiusMap[themeSettings.radius || 'lg'];
    root.style.setProperty('--radius-lg', r.lg);
    root.style.setProperty('--radius-xl', r.xl);
    root.style.setProperty('--radius-2xl', r.xxl);
    root.style.setProperty('--radius-3xl', r.xxxl);
    
    // Apply Font
    if (themeSettings.font === 'mono') {
      root.style.setProperty('font-family', '"JetBrains Mono", monospace');
    } else {
      root.style.setProperty('font-family', '"Public Sans", sans-serif');
    }

    if (themeSettings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeSettings]);

  const getIcon = (id: View) => {
    switch (id) {
      case 'DASHBOARD': return <Home size={18} />;
      case 'OPERATIONS': 
        if (profile.role === UserRole.HOMEOWNER) return <Briefcase size={18} />;
        if (profile.role === UserRole.CREW_MEMBER) return <ClipboardList size={18} />;
        return <Boxes size={18} />;
      case 'MARKETPLACE': return profile.role === UserRole.HOMEOWNER ? <Briefcase size={18} /> : <Search size={18} />;
      case 'CRM': return <TrendingUp size={18} />;
      case 'POST_JOB': return <Plus size={18} />;
      case 'WALLET': return <Wallet size={18} />;
      case 'PRICING': return <CreditCard size={18} />;
      case 'SETTINGS': return <Settings size={18} />;
      case 'TERRITORY_MAP': return <Map size={18} />;
      case 'ESTIMATES': return <FileText size={18} />;
      case 'PROFILE': return <User size={18} />;
      case 'CREW_MGMT': return <Users size={18} />;
      default: return <Home size={18} />;
    }
  };

  const getTextureStyle = () => {
    // Increased base opacity for better visibility as requested
    const opacity = themeSettings.darkMode ? '0.08' : '0.05';
    switch (themeSettings.texture) {
      case 'grid': return { backgroundImage: `linear-gradient(rgba(0,0,0,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,${opacity}) 1px, transparent 1px)`, backgroundSize: '20px 20px' };
      case 'dots': return { backgroundImage: `radial-gradient(rgba(0,0,0,${opacity}) 1px, transparent 1px)`, backgroundSize: '20px 20px' };
      case 'noise': return { backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`, opacity: 0.08 };
      default: return {};
    }
  };

  const getPatternClass = () => {
    if (themeSettings.texture.startsWith('camo-')) {
      return themeSettings.texture;
    }
    const patterns = ['blueprint', 'paper', 'circuit', 'topography', 'hex', 'graph'];
    if (patterns.includes(themeSettings.texture)) return `pattern-${themeSettings.texture}`;
    return '';
  };

  const patternClass = getPatternClass();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${patternClass} ${!patternClass ? (themeSettings.darkMode ? 'bg-slate-950 text-slate-50' : 'bg-brand-surface text-slate-900') : 'text-slate-100'} ${themeSettings.font === 'mono' ? 'font-mono' : 'font-sans'}`}>
      
      {/* Texture Layer (Only if not using a heavy pattern class) */}
      {!patternClass && (
        <div className="fixed inset-0 pointer-events-none z-0" style={getTextureStyle()}></div>
      )}

      {/* Main Container */}
      <div className={`relative z-10 flex h-screen ${themeSettings.density === 'compact' ? 'gap-2 p-2' : 'gap-4 p-4'}`}>
        
        {/* Sidebar Navigation */}
        <aside className={`flex flex-col glass-panel ${themeSettings.density === 'compact' ? 'w-56 p-3' : 'w-64 p-6'} rounded-3xl hidden md:flex transition-all duration-300`}>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
               <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <span className="font-black text-lg tracking-tight">FairTrade</span>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-hide">
            {navConfig.filter(item => item.visible).map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all duration-200 group ${
                  currentView === item.id 
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25' 
                    : 'text-slate-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {getIcon(item.id)}
                <span>{item.label}</span>
                {currentView === item.id && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
              </button>
            ))}
          </nav>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
            <button 
              onClick={() => setIsCmdOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-brand-primary transition-all"
            >
              <Command size={14}/> <span>Quick Find</span> <span className="ml-auto bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-[9px]">⌘K</span>
            </button>
            <div className="flex items-center gap-3 px-2 pt-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary text-white flex items-center justify-center font-bold text-xs">
                {profile.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-bold truncate text-slate-900 dark:text-white">{profile.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{profile.role === UserRole.CONTRACTOR ? 'Contractor' : profile.role === UserRole.HOMEOWNER ? 'Homeowner' : profile.role}</div>
              </div>
              <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors"><LogOut size={16}/></button>
            </div>
          </div>
        </aside>

        {/* Mobile Nav Toggle (Simplified) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 z-50 p-4 flex justify-around">
           <button onClick={() => setView('DASHBOARD')} className={`p-2 rounded-xl ${currentView === 'DASHBOARD' ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-400'}`}><Home size={24}/></button>
           <button onClick={() => setView(profile.role === 'HOMEOWNER' ? 'MARKETPLACE' : 'OPERATIONS')} className={`p-2 rounded-xl ${['MARKETPLACE', 'OPERATIONS'].includes(currentView) ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-400'}`}>{profile.role === 'HOMEOWNER' ? <Search size={24}/> : <Briefcase size={24}/>}</button>
           {profile.role === 'CONTRACTOR' && <button onClick={() => setView('VOICE_COMMAND')} className="p-3 -mt-8 bg-brand-primary text-white rounded-full shadow-lg"><Clock size={24}/></button>}
           <button onClick={() => setView('WALLET')} className={`p-2 rounded-xl ${currentView === 'WALLET' ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-400'}`}><Wallet size={24}/></button>
           <button onClick={() => setView('SETTINGS')} className={`p-2 rounded-xl ${currentView === 'SETTINGS' ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-400'}`}><Settings size={24}/></button>
        </div>

        {/* Content Area */}
        <main className={`flex-1 overflow-y-auto relative ${themeSettings.density === 'compact' ? 'rounded-xl' : 'rounded-3xl'} scrollbar-hide`}>
           {children}
        </main>
      </div>

      <CommandPalette 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
        setView={setView} 
        role={profile.role} 
      />
    </div>
  );
};

export default Layout;
