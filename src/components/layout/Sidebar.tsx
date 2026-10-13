import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  History,
  Users,
  Package,
  Wallet,
  ReceiptText,
  BarChart3,
  Database,
  UserCog,
  FileCheck2,
  Calendar,
  Shield,
  X,
} from 'lucide-react';
import { Role } from '../../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole: Role;
  isDayClosed: boolean;
  businessDate: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hotkey?: string;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  isDayClosed,
  businessDate,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const dispensaryGroups: NavGroup[] = [
    {
      title: 'Dispensary Counter',
      items: [
        { id: 'dashboard', label: 'Clinical Overview', icon: LayoutDashboard },
        { id: 'billing', label: 'POS Billing Counter', icon: Receipt, hotkey: 'F2' },
        { id: 'history', label: 'Bill Register & Voids', icon: History },
        { id: 'patients', label: 'Patients & Doctor Rx', icon: Users },
      ],
    },
    {
      title: 'Apothecary & Accounts',
      items: [
        { id: 'products', label: 'Formulary Master', icon: Package },
        {
          id: 'accounts',
          label: 'Daily Cash Drawer',
          icon: Wallet,
          badge: isDayClosed ? 'Locked' : 'Open',
          badgeColor: isDayClosed ? 'border-[#ab4d38] text-[#ab4d38] bg-[#ab4d38]/10' : 'border-[#2b5542] text-[#16382b] bg-[#2b5542]/10',
        },
        { id: 'expenses', label: 'Disbursement Vouchers', icon: ReceiptText },
        { id: 'reports', label: 'Settlement & Reports', icon: BarChart3 },
      ],
    },
    {
      title: 'Administration & Safety',
      items: [
        { id: 'backup', label: 'Disaster Recovery', icon: Database },
        ...(userRole === 'ADMIN'
          ? [
              { id: 'users', label: 'Staff Roles (RBAC)', icon: UserCog },
              { id: 'audit', label: 'Security Audit Trail', icon: FileCheck2 },
            ]
          : []),
      ],
    },
  ];

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <>
      {/* Clinic Operating Date Status Block */}
      <div className="p-3.5 mx-3 mt-3.5 rounded-lg bg-[#ffffff] border border-[#ded8cb] shadow-2xs">
        <div className="flex items-center justify-between text-xs text-[#697067] mb-1.5">
          <span className="flex items-center gap-1.5 font-semibold text-[#16382b]">
            <Calendar className="w-3.5 h-3.5 text-[#b88628]" />
            <span>Dispensary Date</span>
          </span>
          <span className="font-mono text-[#1f2723] font-bold tracking-tight text-[11px] bg-[#f0eae1] px-1.5 py-0.5 rounded border border-[#ded8cb]">
            {businessDate}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#ded8cb]">
          <span className="text-[#697067] text-[11px]">Ledger Status:</span>
          <span
            className={`font-bold text-[11px] px-1.5 py-0.5 rounded border ${
              isDayClosed
                ? 'text-[#ab4d38] bg-[#ab4d38]/10 border-[#ab4d38]/30'
                : 'text-[#16382b] bg-[#2b5542]/10 border-[#2b5542]/30'
            }`}
          >
            {isDayClosed ? '● Locked / Finalized' : '● Open / Active'}
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {dispensaryGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-[#6b5239]/80 font-mono">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors text-left font-medium ${
                    isActive
                      ? 'bg-[#16382b] text-[#ffffff] font-semibold shadow-2xs'
                      : 'text-[#1f2723] hover:bg-[#ded8cb]/60 hover:text-[#16382b]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#d6a84f]' : 'text-[#4f7358]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    {item.hotkey && (
                      <kbd
                        className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
                          isActive
                            ? 'bg-[#0f271e] text-[#d6a84f] border-[#2b5542]'
                            : 'bg-[#ffffff] text-[#697067] border-[#ded8cb]'
                        }`}
                      >
                        {item.hotkey}
                      </kbd>
                    )}
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          isActive
                            ? 'bg-[#2b5542] text-[#ffffff] border-[#4f7358]'
                            : item.badgeColor || 'bg-[#ffffff] text-[#16382b] border-[#ded8cb]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Security & Clinic Footnote */}
      <div className="p-3 m-3 bg-[#ffffff] rounded-lg border border-[#ded8cb] text-[11px] text-[#697067]">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1.5 font-bold text-[#16382b]">
            <Shield className="w-3.5 h-3.5 text-[#b88628]" />
            <span>Role: {userRole}</span>
          </span>
          <span className="text-[10px] font-mono text-[#9bb09f]">v1.0-PROD</span>
        </div>
        <p className="text-[10px] text-[#697067] leading-tight">
          Dr. Korakkar Traditional Lineage · Accurate Accounts & Secure Dispensary
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Hidden on mobile/tablet) */}
      <aside className="no-print hidden lg:flex w-64 bg-[#f0eae1] border-r border-[#ded8cb] flex-col shrink-0 min-h-[calc(100vh-4rem)] select-none">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Menu Panel */}
          <div className="relative w-72 max-w-[85vw] bg-[#f0eae1] h-full shadow-2xl flex flex-col border-r border-[#ded8cb] z-10 select-none animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-[#16382b] text-[#ffffff] flex items-center justify-between border-b border-[#2b5542]">
              <div>
                <span className="font-serif-clinical text-sm font-bold text-[#d6a84f] block">
                  Sri Korakkar Dispensary
                </span>
                <span className="text-[10px] text-[#9bb09f]">Navigation & Functions</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-md text-[#f0eae1] hover:text-[#ffffff] hover:bg-[#2b5542] transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reusable Nav Content inside drawer */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

