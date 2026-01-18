
import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Command, X, Home, Settings, Wallet, CreditCard, Map, FileText, Phone, Briefcase } from 'lucide-react';
import { View, UserRole } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: View) => void;
  role: UserRole;
}

interface CommandItem {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  category: 'Navigation' | 'Actions' | 'Tools';
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, setView, role }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  const commands: CommandItem[] = [
    { id: 'home', label: 'Go to Dashboard', icon: Home, category: 'Navigation', action: () => setView('DASHBOARD') },
    { id: 'settings', label: 'Open Settings', icon: Settings, category: 'Navigation', action: () => setView('SETTINGS') },
    { id: 'wallet', label: 'View Wallet', icon: Wallet, category: 'Navigation', action: () => setView('WALLET') },
    { id: 'ops', label: 'Operations & Jobs', icon: Briefcase, category: 'Navigation', action: () => setView('OPERATIONS') },
    { id: 'crm', label: 'CRM Pipeline', icon: ArrowRight, category: 'Tools', action: () => setView('CRM') },
    { id: 'map', label: 'Territory Map', icon: Map, category: 'Tools', action: () => setView('TERRITORY_MAP') },
    { id: 'est', label: 'Create Estimate', icon: FileText, category: 'Actions', action: () => setView('ESTIMATES') },
    { id: 'voice', label: 'Voice Command', icon: Phone, category: 'Actions', action: () => setView('VOICE_COMMAND') },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] px-4 cmd-palette-overlay animate-fadeIn" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[60vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
          <Search size={20} className="text-slate-400" />
          <input 
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500 uppercase">ESC</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          {filteredCommands.length > 0 ? (
            <div className="space-y-1">
              {filteredCommands.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.action(); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                    i === selectedIndex 
                      ? 'bg-brand-primary text-white' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <cmd.icon size={18} className={i === selectedIndex ? 'text-white' : 'text-slate-400'} />
                  <span className="flex-1 font-medium">{cmd.label}</span>
                  {i === selectedIndex && <ArrowRight size={16} className="opacity-50" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No results found for "{query}"
            </div>
          )}
        </div>
        
        <div className="p-2 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between px-4">
           <span>Select <strong className="font-bold">↑↓</strong></span>
           <span>Confirm <strong className="font-bold">↵</strong></span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
