import React from 'react';
import { User } from '../../types';
import { LogOut, Smartphone, PlusCircle, ShieldCheck, Menu, X } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMobileView: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  businessDate?: string;
  isDayClosed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  activeTab,
  onSelectTab,
  onOpenMobileView,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
}) => {
  return (
    <header className="no-print bg-[#16382b] text-[#ffffff] border-b border-[#2b5542] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 h-16">
        {/* Zone 1: Distinctive Brand Mark with Tamil & English Identity (No bowl icon) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile hamburger drawer toggle */}
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 -ml-1 text-[#f0eae1] hover:text-[#ffffff] hover:bg-[#2b5542] rounded-lg transition-colors"
              title="Toggle Dispensary Navigation Menu"
              aria-label="Toggle navigation menu"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5 text-[#d6a84f]" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div 
            onClick={() => onSelectTab('dashboard')} 
            className="flex flex-col cursor-pointer group leading-tight"
            title="Return to Dispensary Overview"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-serif-clinical text-sm sm:text-base font-bold tracking-tight text-[#ffffff] group-hover:text-[#d6a84f] transition-colors truncate max-w-[210px] sm:max-w-none">
                Sri Korakkar Siddha & Ayurvedha
              </span>
              <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#2b5542] text-[#d6a84f] border border-[#b88628]/40">
                Clinic POS
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#9bb09f]">
              <span className="font-medium tracking-normal text-[#d6a84f]/90 truncate max-w-[190px] sm:max-w-none">
                ஸ்ரீ கோரக்கர் சித்தா & ஆயுர்வேத கிளினிக்
              </span>
              <span className="hidden md:inline text-[#9bb09f]/60">·</span>
              <span className="hidden md:inline font-mono text-[10px] text-[#9bb09f]">Dispensary & Accounts</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Focused Primary Dispensary Tabs (Desktop only) */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#f0eae1]">
          {[
            { id: 'dashboard', label: 'Overview' },
            { id: 'billing', label: 'Dispensary POS' },
            { id: 'history', label: 'Bill Register' },
            { id: 'patients', label: 'Patients & Rx' },
            { id: 'accounts', label: 'Cash Drawer' },
            { id: 'reports', label: 'Settlement' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`transition-all px-3 py-1.5 rounded-md whitespace-nowrap text-xs font-semibold ${
                  isActive
                    ? 'bg-[#2b5542] text-[#ffffff] shadow-2xs border border-[#4f7358]'
                    : 'text-[#f0eae1]/80 hover:text-[#ffffff] hover:bg-[#0f271e]/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick POS Trigger & User Session Card */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Dispense Action */}
          <button
            onClick={() => onSelectTab('billing')}
            title="Instant New Bill (Hotkey: F2)"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#ffffff] bg-[#b88628] hover:bg-[#94681f] rounded-md shadow-xs transition-colors shrink-0 border border-[#d6a84f]/40"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#ffffff]" />
            <span className="hidden xs:inline sm:inline">New Bill</span>
            <kbd className="hidden md:inline-block px-1 py-0.2 bg-[#0f271e]/40 text-[#ffffff] text-[10px] rounded font-mono">F2</kbd>
          </button>

          {/* Pocket / Mobile Mode */}
          <button
            onClick={onOpenMobileView}
            title="Open Pocket Thermal Lookup Mode"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#f0eae1] bg-[#0f271e] hover:bg-[#2b5542] rounded-md border border-[#2b5542] transition-colors whitespace-nowrap shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#9bb09f]" />
            <span className="text-[11px]">Mobile</span>
          </button>

          {/* Pharmacist / Cashier Identity */}
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-2.5 border-l border-[#2b5542]">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1 text-xs font-bold text-[#ffffff] leading-none">
                  <span>{user.fullName.split(' ')[0]}</span>
                  {user.role === 'ADMIN' && (
                    <span title="Administrator">
                      <ShieldCheck className="w-3 h-3 text-[#d6a84f]" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#9bb09f] block mt-0.5">
                  {user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sign out dispensary session"
                className="p-1.5 text-[#f0eae1]/70 hover:text-[#ab4d38] hover:bg-[#0f271e] rounded-md transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

