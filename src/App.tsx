/**
 * Sri Korakkar Siddha and Ayurvedha Clinic
 * Pharmacy Billing, Accounts & Patient Management System
 * Production Entry Point
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Bill,
  Expense,
  Patient,
  Product,
  Prescription,
  DailyAccounts,
  ClinicInfo,
  AuditLog,
} from './types';
import { storage } from './services/storage';
import { authService } from './services/auth';
import { verifyCoreFormulas } from './services/calculation';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { BillingView } from './components/billing/BillingView';
import { BillHistoryView } from './components/billing/BillHistoryView';
import { PatientManagementView } from './components/patients/PatientManagementView';
import { ProductMasterView } from './components/products/ProductMasterView';
import { AccountsView } from './components/accounts/AccountsView';
import { ExpenseManagementView } from './components/expenses/ExpenseManagementView';
import { ReportsView } from './components/reports/ReportsView';
import { BackupRestoreView } from './components/backup/BackupRestoreView';
import { UserManagementView } from './components/users/UserManagementView';
import { MobileLookupView } from './components/mobile/MobileLookupView';
import { BillPrintModal } from './components/print/BillPrintModal';
import { LoginModal } from './components/auth/LoginModal';
import {
  LayoutDashboard,
  Receipt,
  History,
  Users,
  Wallet,
  Menu,
} from 'lucide-react';

export default function App() {
  // Session & Authentication
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Mobile navigation drawer state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Business date in Asia/Kolkata
  const [businessDate] = useState<string>(() => {
    // Current IST date YYYY-MM-DD
    const now = new Date();
    return now.toISOString().split('T')[0];
  });

  // Core domain state
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(() => storage.getClinicInfo());
  const [bills, setBills] = useState<Bill[]>(() => storage.getBills());
  const [expenses, setExpenses] = useState<Expense[]>(() => storage.getExpenses());
  const [patients, setPatients] = useState<Patient[]>(() => storage.getPatients());
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => storage.getPrescriptions());
  const [dailyAccountsMap, setDailyAccountsMap] = useState<Record<string, DailyAccounts>>(() =>
    storage.getDailyAccounts()
  );
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storage.getAuditLogs());

  // Print modal state
  const [printBill, setPrintBill] = useState<Bill | null>(null);
  const [isPrintDuplicate, setIsPrintDuplicate] = useState<boolean>(false);

  // Mobile mode modal state
  const [showMobileView, setShowMobileView] = useState<boolean>(false);

  // Today's specific bills and expenses
  const todayBills = bills.filter((b) => b.date === businessDate);
  const todayExpenses = expenses.filter((e) => e.date === businessDate);

  // Today's Accounts record (fallback to default if not yet created)
  const accountsToday: DailyAccounts = dailyAccountsMap[businessDate] || {
    date: businessDate,
    openingBalance: 0,
    openingBalanceSet: false,
    cashSales: 0,
    upiSales: 0,
    cardSales: 0,
    transferSales: 0,
    totalSales: 0,
    totalExpenses: 0,
    closingBalance: 0,
    isClosed: false,
  };

  // Self-test assertion at startup
  useEffect(() => {
    const { billTestPassed, accountsTestPassed } = verifyCoreFormulas();
    if (!billTestPassed || !accountsTestPassed) {
      console.error('CRITICAL: Financial formula self-test failed! Discrepancy detected in SRS verification.');
    }
  }, []);

  // Keyboard shortcut listener (e.g. F2 for New Bill)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('billing');
      } else if (e.key === 'Escape') {
        if (printBill) setPrintBill(null);
        if (showMobileView) setShowMobileView(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [printBill, showMobileView]);

  // Auth actions
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Reload state in case modified
    setBills(storage.getBills());
    setExpenses(storage.getExpenses());
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Handlers for bill creation
  const handleBillCreated = (newBill: Bill) => {
    const updatedBills = storage.getBills();
    setBills(updatedBills);
    setAuditLogs(storage.getAuditLogs());

    // Update stock quantity in product master
    const allProds = storage.getProducts();
    const updatedProds = allProds.map((prod) => {
      const billItem = newBill.items.find((item) => item.productId === prod.id);
      if (billItem) {
        return {
          ...prod,
          stockQty: Math.max(0, prod.stockQty - billItem.quantity),
          updatedAt: new Date().toISOString(),
        };
      }
      return prod;
    });
    storage.saveProducts(updatedProds);
    setProducts(updatedProds);
  };

  // Handler for reprint
  const handleReprintBill = (b: Bill, isDuplicate: boolean) => {
    setPrintBill(b);
    setIsPrintDuplicate(isDuplicate);
  };

  // Active pre-fill from patient prescription screen
  const [prefillPatient, setPrefillPatient] = useState<Patient | null>(null);
  const [prefillPrescription, setPrefillPrescription] = useState<Prescription | null>(null);

  // Handler for direct billing a specific patient from patient screen
  const handleDirectBillPatient = (patient: Patient, prescription?: Prescription) => {
    setPrefillPatient(patient);
    setPrefillPrescription(prescription || null);
    setActiveTab('billing');
  };

  // Handler for restore drill
  const handleDataRestored = () => {
    setBills(storage.getBills());
    setExpenses(storage.getExpenses());
    setPatients(storage.getPatients());
    setProducts(storage.getProducts());
    setPrescriptions(storage.getPrescriptions());
    setDailyAccountsMap(storage.getDailyAccounts());
    setUsers(storage.getUsers());
    setAuditLogs(storage.getAuditLogs());
  };

  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col text-[#1f2723]">
      {/* Top Header compliant with Top Bar Contract */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileNavOpen(false);
        }}
        onOpenMobileView={() => setShowMobileView(true)}
        onToggleMobileSidebar={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileSidebarOpen={isMobileNavOpen}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar (Desktop persistent + Mobile slide-over drawer) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileNavOpen(false);
          }}
          userRole={currentUser.role}
          isDayClosed={accountsToday.isClosed}
          businessDate={businessDate}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0 max-w-full overflow-y-auto pb-20 lg:pb-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              todayBills={todayBills}
              todayExpenses={todayExpenses}
              accountsToday={accountsToday}
              allBills={bills}
              allExpenses={expenses}
              userRole={currentUser.role}
              onNavigate={setActiveTab}
              onOpenNewBill={() => setActiveTab('billing')}
              onOpenAddExpense={() => setActiveTab('expenses')}
            />
          )}

          {activeTab === 'billing' && (
            <BillingView
              products={products}
              patients={patients}
              currentUser={currentUser}
              accountsToday={accountsToday}
              prefillPatient={prefillPatient}
              prefillPrescription={prefillPrescription}
              onClearPrefill={() => {
                setPrefillPatient(null);
                setPrefillPrescription(null);
              }}
              onBillCreated={handleBillCreated}
              onOpenPrint={(bill) => {
                setPrintBill(bill);
                setIsPrintDuplicate(false);
              }}
              onAddNewPatientInline={(newPat) => {
                const updated = [newPat, ...patients];
                storage.savePatients(updated);
                setPatients(updated);
              }}
            />
          )}

          {activeTab === 'history' && (
            <BillHistoryView
              bills={bills}
              currentUser={currentUser}
              onReprint={handleReprintBill}
              onBillVoided={(updated) => {
                setBills(updated);
                setAuditLogs(storage.getAuditLogs());
              }}
            />
          )}

          {activeTab === 'patients' && (
            <PatientManagementView
              patients={patients}
              prescriptions={prescriptions}
              bills={bills}
              products={products}
              currentUser={currentUser}
              onPatientUpdated={setPatients}
              onPrescriptionAdded={(newRx) => setPrescriptions([newRx, ...prescriptions])}
              onDirectBillPatient={handleDirectBillPatient}
            />
          )}

          {activeTab === 'products' && (
            <ProductMasterView
              products={products}
              currentUser={currentUser}
              onProductsUpdated={setProducts}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsView
              businessDate={businessDate}
              accountsToday={accountsToday}
              billsToday={todayBills}
              expensesToday={todayExpenses}
              currentUser={currentUser}
              onAccountsUpdated={(updated) => {
                setDailyAccountsMap({ ...dailyAccountsMap, [businessDate]: updated });
              }}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseManagementView
              expenses={expenses}
              accountsToday={accountsToday}
              currentUser={currentUser}
              clinicInfo={clinicInfo}
              onExpenseAdded={(newExp) => setExpenses([newExp, ...expenses])}
              onExpenseDeleted={(id) => setExpenses(expenses.filter((e) => e.id !== id))}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              bills={bills}
              expenses={expenses}
              products={products}
              dailyAccounts={dailyAccountsMap}
            />
          )}

          {activeTab === 'backup' && (
            <BackupRestoreView
              currentUser={currentUser}
              auditLogs={auditLogs}
              onDataRestored={handleDataRestored}
            />
          )}

          {activeTab === 'users' && currentUser.role === 'ADMIN' && (
            <UserManagementView
              currentUser={currentUser}
              users={users}
              onUsersUpdated={setUsers}
            />
          )}

          {activeTab === 'audit' && currentUser.role === 'ADMIN' && (
            <BackupRestoreView
              currentUser={currentUser}
              auditLogs={auditLogs}
              onDataRestored={handleDataRestored}
            />
          )}
        </main>
      </div>

      {/* Bill Print Modal (Thermal 58mm / 80mm / A4) */}
      {printBill && (
        <BillPrintModal
          bill={printBill}
          clinicInfo={clinicInfo}
          isDuplicate={isPrintDuplicate}
          onClose={() => setPrintBill(null)}
          onPrinted={() => {
            // Update reprint count on bill
            const allB = storage.getBills();
            const updated = allB.map((b) =>
              b.id === printBill.id ? { ...b, reprintCount: (b.reprintCount || 0) + 1 } : b
            );
            storage.saveBills(updated);
            setBills(updated);
          }}
        />
      )}

      {/* Mobile Lookup Mode Modal */}
      {showMobileView && (
        <MobileLookupView
          bills={bills}
          clinicInfo={clinicInfo}
          onClose={() => setShowMobileView(false)}
          onPrintBill={(bill, isDuplicate) => {
            setPrintBill(bill);
            setIsPrintDuplicate(isDuplicate);
          }}
        />
      )}

      {/* Mobile Bottom Bar for Quick Counter Access (< lg) */}
      <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#16382b] border-t border-[#2b5542] px-1.5 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'billing', label: 'POS Bill', icon: Receipt },
          { id: 'history', label: 'Register', icon: History },
          { id: 'patients', label: 'Patients', icon: Users },
          { id: 'accounts', label: 'Drawer', icon: Wallet },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileNavOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors text-[10px] font-semibold ${
                isActive ? 'text-[#d6a84f] bg-[#0f271e]' : 'text-[#f0eae1]/75 hover:text-[#ffffff]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors text-[10px] font-semibold ${
            isMobileNavOpen ? 'text-[#d6a84f] bg-[#0f271e]' : 'text-[#f0eae1]/75 hover:text-[#ffffff]'
          }`}
          aria-label="More navigation options"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
