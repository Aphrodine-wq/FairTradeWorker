
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/ui/Layout';
import HomeownerDashboard from './components/HomeownerDashboard';
import ContractorDashboard from './components/ContractorDashboard';
import SubcontractorDashboard from './components/SubcontractorDashboard';
import CrewDashboard from './components/CrewDashboard';
import JobPoster from './components/JobPoster';
import JobMarketplace from './components/JobMarketplace';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import CRM from './components/CRM';
import Wallet from './components/Wallet';
import Settings from './components/Settings';
import Pricing from './components/Pricing';
import Operations from './components/Operations';
import TerritoryMarketplace from './components/TerritoryMarketplace';
import FranchiseDashboard from './components/FranchiseDashboard';
import AdminDashboard from './components/AdminDashboard';
import HomeProfile from './components/HomeProfile';
import Estimates from './components/Estimates';
import SplashScreen from './components/SplashScreen';
import EliteVoiceHub from './components/EliteVoiceHub';
import InfoPage from './components/InfoPage';
import { UserRole, View, Job, ThemeSettings, NavItemConfig, UserProfile } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    id: 'u-1',
    name: 'John Smith',
    email: 'john@fairtrade.pro',
    role: UserRole.HOMEOWNER,
    tier: 'FREE',
    preferences: {
      aiPersonality: 'PROFESSIONAL',
      verbosity: 'CONCISE',
      theme: 'LIGHT'
    }
  });

  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  // Initialize with density and font defaults
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({ 
    color: 'blue', 
    radius: 'lg', 
    density: 'comfortable',
    font: 'sans',
    fontSize: 'md',
    contrast: 'standard',
    darkMode: false,
    glassStrength: 'medium',
    texture: 'none',
    animationSpeed: 'normal'
  });
  const [userJobs, setUserJobs] = useState<Job[]>([]);

  // We need to manage NavConfig state so users can toggle visibility
  const [customNavConfig, setCustomNavConfig] = useState<NavItemConfig[] | null>(null);

  const roleNavConfig = useMemo((): NavItemConfig[] => {
    // If we have custom config (from settings), merge it or use it
    // For simplicity, we regenerate base on role, then apply overrides if we had a more complex ID-based system.
    // Here we just re-generate defaults if role changes.
    
    const baseNav: NavItemConfig[] = [
      { id: 'DASHBOARD', label: 'Home', visible: true, required: true },
      { id: 'SETTINGS', label: 'Account', visible: true, required: true },
    ];

    let specificNav: NavItemConfig[] = [];

    if (profile.role === UserRole.HOMEOWNER) {
      specificNav = [
        { id: 'POST_JOB', label: 'Post Project', visible: true },
        { id: 'MARKETPLACE', label: 'My Projects', visible: true },
        { id: 'PROFILE', label: 'My Home', visible: true },
      ];
    } else if (profile.role === UserRole.CONTRACTOR) {
      specificNav = [
        { id: 'MARKETPLACE', label: 'Lead Radar', visible: true },
        { id: 'OPERATIONS', label: 'Job Manager', visible: true },
        { id: 'CRM', label: 'Pipeline', visible: true },
        { id: 'ESTIMATES', label: 'Estimates', visible: true },
        { id: 'TERRITORY_MAP', label: 'Territories', visible: true },
        { id: 'WALLET', label: 'Earnings', visible: true },
        { id: 'PRICING', label: 'Pro Plans', visible: true },
      ];
    } else if (profile.role === UserRole.SUBCONTRACTOR) {
      specificNav = [
        { id: 'OPERATIONS', label: 'Assigned Work', visible: true },
        { id: 'WALLET', label: 'Payouts', visible: true },
      ];
    } else if (profile.role === UserRole.CREW_MEMBER) {
      specificNav = [
        { id: 'OPERATIONS', label: 'Daily Tasks', visible: true },
      ];
    } else if (profile.role === UserRole.FRANCHISE_OWNER) {
      specificNav = [
        { id: 'FRANCHISE_MGMT', label: 'Network', visible: true },
        { id: 'TERRITORY_MAP', label: 'Markets', visible: true },
      ];
    } else if (profile.role === UserRole.ADMIN) {
      specificNav = [
        { id: 'ADMIN_PANEL', label: 'Admin Hub', visible: true },
      ];
    }

    const fullDefaults = [...baseNav, ...specificNav];
    
    // If we have a custom config saved that matches length/IDs (simple check), use that for visibility
    if (customNavConfig) {
       return customNavConfig;
    }
    return fullDefaults;
  }, [profile.role, customNavConfig]);

  // Sync custom nav if it's null
  useEffect(() => {
     if (!customNavConfig) setCustomNavConfig(roleNavConfig);
  }, [roleNavConfig]);

  useEffect(() => {
    setCurrentView('DASHBOARD');
  }, [profile.role]);

  const handleJobPosted = (job: Job) => {
    setUserJobs([job, ...userJobs]);
    setCurrentView('DASHBOARD');
  };

  const startBootSequence = (targetRole: UserRole) => {
    setProfile(prev => ({ ...prev, role: targetRole, tier: targetRole === UserRole.CONTRACTOR ? 'PRO' : 'FREE' }));
    setIsBooting(true);
    setTimeout(() => {
      setIsBooting(false);
      setIsAuthenticated(true);
      setCurrentView('DASHBOARD');
    }, 1500);
  };

  const handleLogin = (selectedRole: UserRole) => {
    setShowAuthModal(false);
    startBootSequence(selectedRole);
  };

  const handleDemo = (demoRole: UserRole) => {
    startBootSequence(demoRole);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('DASHBOARD');
  };

  if (isBooting) return <SplashScreen />;

  // Handle Info Pages (Public or Private)
  if (['LEGAL_TERMS', 'LEGAL_PRIVACY', 'SUPPORT_HELP', 'SAFETY_GUIDELINES'].includes(currentView)) {
    return <InfoPage type={currentView} onBack={() => isAuthenticated ? setCurrentView('DASHBOARD') : setCurrentView('LANDING' as View)} />;
  }

  if (!isAuthenticated && currentView !== 'LANDING' as View && !['LEGAL_TERMS', 'LEGAL_PRIVACY', 'SUPPORT_HELP', 'SAFETY_GUIDELINES'].includes(currentView)) {
    return (
      <>
        <LandingPage 
            onGetStarted={() => setShowAuthModal(true)} 
            onLogin={() => setShowAuthModal(true)} 
            onDemo={handleDemo}
            setView={setCurrentView}
        />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />
      </>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        if (profile.role === UserRole.HOMEOWNER) return <HomeownerDashboard userJobs={userJobs} onPostJobClick={() => setCurrentView('POST_JOB')} setView={setCurrentView} profile={profile} />;
        if (profile.role === UserRole.CONTRACTOR) return <ContractorDashboard onFindLeadsClick={() => setCurrentView('MARKETPLACE')} setView={setCurrentView} profile={profile} />;
        if (profile.role === UserRole.SUBCONTRACTOR) return <SubcontractorDashboard setView={setCurrentView} profile={profile} />;
        if (profile.role === UserRole.CREW_MEMBER) return <CrewDashboard setView={setCurrentView} profile={profile} />;
        if (profile.role === UserRole.FRANCHISE_OWNER) return <FranchiseDashboard />;
        if (profile.role === UserRole.ADMIN) return <AdminDashboard />;
        return null;
      case 'MARKETPLACE': return <JobMarketplace role={profile.role} />;
      case 'POST_JOB': return <JobPoster onJobPosted={handleJobPosted} />;
      case 'CRM': return <CRM />;
      case 'OPERATIONS': return <Operations role={profile.role} />;
      case 'ESTIMATES': return <Estimates />;
      case 'VOICE_COMMAND': return <EliteVoiceHub onClose={() => setCurrentView('DASHBOARD')} profile={profile} />;
      case 'TERRITORY_MAP': return <TerritoryMarketplace />;
      case 'WALLET': return <Wallet role={profile.role} />;
      case 'PRICING': return <Pricing currentTier={profile.tier} />;
      case 'SETTINGS': return <Settings role={profile.role} themeSettings={themeSettings} setThemeSettings={setThemeSettings} navConfig={customNavConfig || roleNavConfig} setNavConfig={setCustomNavConfig} />;
      case 'PROFILE': return <HomeProfile role={profile.role} />;
      default: return null;
    }
  };

  return (
    <Layout 
      profile={profile}
      setRole={(r) => setProfile(p => ({ ...p, role: r }))}
      currentView={currentView} 
      setView={setCurrentView} 
      onLogout={handleLogout}
      themeSettings={themeSettings}
      navConfig={customNavConfig || roleNavConfig}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
