import React, { useState, useEffect } from 'react';
import { User, AuditLog, UserRole } from '../../types';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import {
  Users,
  ShieldCheck,
  Plus,
  Lock,
  Key,
  Activity,
  CheckCircle2,
  UserCheck,
  Gauge,
  Clock,
  Calendar,
  Banknote,
  Building,
  Briefcase,
  AlertCircle,
  FileText,
  BadgeAlert,
  Search,
  UserX,
  Phone,
  Mail,
  Award,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  RotateCcw,
  KeyRound,
  Printer,
  Sparkles,
} from 'lucide-react';
import { UserActivityLog } from './UserActivityLog';

interface UsersAndAuditViewProps {
  initialSubTab?:
    | 'dashboard'
    | 'employees'
    | 'attendance'
    | 'schedules'
    | 'leave_requests'
    | 'payroll'
    | 'loans'
    | 'departments'
    | 'job_titles'
    | 'audit_logs';
  currentUser?: User | null;
}

export const UsersAndAuditView: React.FC<UsersAndAuditViewProps> = ({
  initialSubTab = 'employees',
  currentUser,
}) => {
  const isSuperAdmin = !!(currentUser?.isSuperAdmin || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'athronos21@gmail.com');
  const [activeSubTab, setActiveSubTab] = useState<
    | 'dashboard'
    | 'employees'
    | 'attendance'
    | 'schedules'
    | 'leave_requests'
    | 'payroll'
    | 'loans'
    | 'departments'
    | 'job_titles'
    | 'audit_logs'
  >(initialSubTab);

  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Onboarding Credential Slip Modal State
  const [createdSlip, setCreatedSlip] = useState<{
    user: User;
    temporaryPassword: string;
    isReset?: boolean;
  } | null>(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'PHARMACIST' as UserRole,
    department: 'Prescription Dispensary & Clinical POS',
    employeeId: '',
    temporaryPassword: '',
    mustChangePassword: true,
  });

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    fetchUsersAndLogs();
  }, []);

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Kaziniya#${rand}`;
  };

  const handleOpenNewUser = () => {
    const tempPass = generateTempPassword();
    setUserForm({
      name: '',
      email: '',
      phone: '+251 9',
      role: 'PHARMACIST',
      department: 'Prescription Dispensary & Clinical POS',
      employeeId: `KZN-PH-${String(users.length + 1).padStart(3, '0')}`,
      temporaryPassword: tempPass,
      mustChangePassword: true,
    });
    setIsNewUserOpen(true);
  };

  const fetchUsersAndLogs = async () => {
    try {
      const [uRes, aRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/audit-logs'),
      ]);

      const [uData, aData] = await Promise.all([uRes.json(), aRes.json()]);

      if (uData.success) setUsers(uData.data);
      if (aData.success) setAuditLogs(aData.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });

      const data = await res.json();
      if (data.success) {
        setIsNewUserOpen(false);
        fetchUsersAndLogs();
        setCreatedSlip({
          user: data.data,
          temporaryPassword: data.temporaryPassword || userForm.temporaryPassword,
          isReset: false,
        });
      } else {
        alert(data.message);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!window.confirm('Reset this employee credentials to a temporary password? They will be required to set a new password on their next login.')) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        fetchUsersAndLogs();
        setCreatedSlip({
          user: data.data,
          temporaryPassword: data.temporaryPassword,
          isReset: true,
        });
      } else {
        alert(data.message);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCopyCredentials = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAddLogItem = (newLog: AuditLog) => {
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Mock Attendance Data
  const attendanceLogs = [
    { id: 'ATT-101', staffName: 'Dr. Selamawit Alemu', role: 'Chief Pharmacist', clockIn: '07:52 AM', clockOut: '04:10 PM', status: 'ON_TIME', date: '2026-08-12', hours: 8.3 },
    { id: 'ATT-102', staffName: 'Abebe Bikila', role: 'POS Cashier', clockIn: '08:05 AM', clockOut: '04:00 PM', status: 'LATE', date: '2026-08-12', hours: 7.9 },
    { id: 'ATT-103', staffName: 'Worku Tadesse', role: 'Inventory Manager', clockIn: '07:48 AM', clockOut: '04:15 PM', status: 'ON_TIME', date: '2026-08-12', hours: 8.4 },
    { id: 'ATT-104', staffName: 'Dr. Yonas Kassa', role: 'Dispensing Pharmacist', clockIn: '03:50 PM', clockOut: 'Pending', status: 'ON_TIME', date: '2026-08-12', hours: 4.1 },
    { id: 'ATT-105', staffName: 'Tigist Wolde', role: 'Store Accountant', clockIn: '08:00 AM', clockOut: '05:00 PM', status: 'ON_TIME', date: '2026-08-12', hours: 9.0 },
  ];

  // Mock Shift Rosters
  const shiftSchedules = [
    { shift: 'Morning Shift (08:00 AM - 04:00 PM)', lead: 'Dr. Selamawit Alemu (Lead Pharmacist)', cashier: 'Abebe Bikila', storehouse: 'Worku Tadesse', branch: 'Kaziniya Main Store' },
    { shift: 'Evening Shift (04:00 PM - 12:00 AM)', lead: 'Dr. Yonas Kassa (Dispensing Pharmacist)', cashier: 'Hiwot Kebede', storehouse: 'Mulugeta Tesfaye', branch: 'Kaziniya Main Store' },
    { shift: 'Night Duty (12:00 AM - 08:00 AM)', lead: 'Dr. Solomon Haile (On-Call Pharmacist)', cashier: 'Emergency Night Counter', storehouse: 'Central Vault Security', branch: 'Bole Emergency Branch' },
  ];

  // Mock Leave Requests
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 'LV-201', staffName: 'Hiwot Kebede', role: 'Cashier', type: 'Annual Leave', startDate: '2026-08-15', endDate: '2026-08-22', days: 7, status: 'PENDING', reason: 'Family vacation in Hawassa' },
    { id: 'LV-202', staffName: 'Mulugeta Tesfaye', role: 'Store Assistant', type: 'Sick Leave', startDate: '2026-08-10', endDate: '2026-08-12', days: 2, status: 'APPROVED', reason: 'Medical prescription rest' },
    { id: 'LV-203', staffName: 'Tigist Wolde', role: 'Accountant', type: 'Maternity Leave', startDate: '2026-09-01', endDate: '2026-11-30', days: 90, status: 'APPROVED', reason: 'Maternity leave EFDA compliant' },
  ]);

  // Mock Payroll Ledger
  const payrollData = [
    { id: 'PAY-801', staffName: 'Dr. Selamawit Alemu', role: 'Chief Pharmacist', baseSalary: 32000, allowance: 4500, tax: 6800, netPay: 29700, status: 'DISBURSED', bank: 'CBE - 1000293812' },
    { id: 'PAY-802', staffName: 'Abebe Bikila', role: 'POS Cashier', baseSalary: 14500, allowance: 1200, tax: 2100, netPay: 13600, status: 'DISBURSED', bank: 'Telebirr - 0911223344' },
    { id: 'PAY-803', staffName: 'Worku Tadesse', role: 'Inventory Manager', baseSalary: 22000, allowance: 2500, tax: 4100, netPay: 20400, status: 'DISBURSED', bank: 'CBE - 1000882190' },
    { id: 'PAY-804', staffName: 'Dr. Yonas Kassa', role: 'Dispensing Pharmacist', baseSalary: 28000, allowance: 3500, tax: 5600, netPay: 25900, status: 'DISBURSED', bank: 'CBE - 1000551122' },
  ];

  // Mock Loans
  const salaryLoans = [
    { id: 'LN-301', staffName: 'Abebe Bikila', amountRequested: 5000, monthlyDeduction: 1000, remainingBalance: 3000, status: 'ACTIVE', approvedBy: 'Store Manager' },
    { id: 'LN-302', staffName: 'Worku Tadesse', amountRequested: 10000, monthlyDeduction: 2000, remainingBalance: 0, status: 'FULLY_PAID', approvedBy: 'Store Manager' },
  ];

  return (
    <div className="space-y-6">
      {/* HR SUB-TAB NAVIGATION BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'dashboard'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Gauge className="h-4 w-4" />
          <span>HR Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('employees')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'employees'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Staff Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'attendance'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Clock-In Attendance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schedules')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'schedules'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Shift Rosters</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leave_requests')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'leave_requests'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <BadgeAlert className="h-4 w-4" />
          <span>Leave Mgmt ({leaveRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'payroll'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Banknote className="h-4 w-4" />
          <span>Payroll & Compensation</span>
        </button>

        <button
          onClick={() => setActiveSubTab('loans')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'loans'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Salary Advances</span>
        </button>

        <button
          onClick={() => setActiveSubTab('departments')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'departments'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Departments</span>
        </button>

        <button
          onClick={() => setActiveSubTab('job_titles')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'job_titles'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Job Titles</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit_logs')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'audit_logs'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Security Audit Log</span>
        </button>
      </div>

      {/* SUB-VIEW 1: HR DASHBOARD OVERVIEW */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">TOTAL STORE STAFF</span>
                <Users className="h-5 w-5 text-teal-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{users.length || 8}</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> 100% EFDA Compliant
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">ON DUTY TODAY</span>
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">6 Staff</p>
              <p className="text-[11px] text-slate-500 font-medium">Morning & Evening Shifts</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">PENDING LEAVE REQS</span>
                <BadgeAlert className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">1 Request</p>
              <p className="text-[11px] text-amber-600 font-bold">Awaiting Manager Approval</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">MONTHLY PAYROLL</span>
                <Banknote className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(96500)}</p>
              <p className="text-[11px] text-purple-600 font-bold">August Disbursements</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-600" /> Today's On-Call Pharmacy Shift Lead
              </h4>
              <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 text-xs space-y-1">
                <p className="font-bold text-teal-900 text-sm">Dr. Selamawit Alemu (PharmD)</p>
                <p className="text-teal-700">EFDA License #: <span className="font-mono font-bold">EFDA-PH-99201</span></p>
                <p className="text-teal-700">Assigned Branch: <span className="font-semibold">Kaziniya Main Store (Bole Road)</span></p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600" /> EFDA Compliance & Staff Credentials
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl dark:bg-slate-950">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Registered Pharmacists</span>
                  <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">3 Active</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl dark:bg-slate-950">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Certified POS Cashiers</span>
                  <span className="font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-md">3 Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: STAFF DIRECTORY & ACCOUNTS */}
      {activeSubTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-base dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" /> Pharmacy Staff Directory & RBAC Accounts
              </h3>
              <p className="text-xs text-slate-500">
                Manage employee roles, access permissions, EFDA license badges, and contact cards.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
                />
              </div>

              <button
                onClick={handleOpenNewUser}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 shrink-0"
              >
                <Plus className="h-4 w-4" /> Create Staff Account
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 dark:bg-slate-950 dark:border-slate-800 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm dark:text-white flex items-center gap-1.5">
                      <span>{u.name}</span>
                      {u.isSuperAdmin && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[9px] border border-indigo-300">
                          Whole System Admin
                        </span>
                      )}
                      {u.isOwner && !u.isSuperAdmin && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[9px] border border-rose-300">
                          Store Owner Admin
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{u.employeeId || 'KZN-STF'}</span>
                      <span>•</span>
                      <span>{u.email}</span>
                    </p>
                  </div>
                  <span className={`inline-block rounded-lg text-[10px] font-bold px-2.5 py-0.5 border ${
                    u.isSuperAdmin 
                      ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border-indigo-400' 
                      : u.isOwner 
                      ? 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border-rose-300'
                      : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300'
                  }`}>
                    {u.isSuperAdmin ? 'SUPER ADMIN' : u.isOwner ? 'STORE ADMIN (OWNER)' : u.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{u.department || 'Operations'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Login Status:</span>
                    {u.mustChangePassword ? (
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-[10px] bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                        <Key className="h-3 w-3" /> PENDING FIRST LOGIN
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[10px] bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> ACTIVE / PASSWORD SET
                      </span>
                    )}
                  </div>

                  {u.mustChangePassword && u.temporaryPassword && (
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200/60 dark:bg-amber-950/40 dark:border-amber-800 flex items-center justify-between text-[11px]">
                      <span className="text-amber-800 dark:text-amber-300 font-medium">Temp Pass:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-950 dark:text-amber-200">{u.temporaryPassword}</span>
                        <button
                          onClick={() => handleCopyCredentials(u.temporaryPassword!, u.id)}
                          className="p-1 hover:bg-amber-200/60 rounded text-amber-800 dark:text-amber-300"
                          title="Copy temporary password"
                        >
                          {copiedId === u.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/40 dark:border-slate-800/80">
                    <button
                      onClick={() => handleResetPassword(u.id)}
                      className="text-[11px] font-bold text-slate-600 hover:text-amber-700 dark:text-slate-400 dark:hover:text-amber-300 flex items-center gap-1 p-1"
                      title="Reset to temporary password"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset Temp Password
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: CLOCK-IN ATTENDANCE LOG */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-600" />
                <span>Daily Staff Attendance & Biometric Clock-In Log</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track morning/evening shift arrivals, late entries, and total daily duty hours.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">ATTENDANCE ID</th>
                  <th className="px-4 py-3">STAFF MEMBER</th>
                  <th className="px-4 py-3">JOB ROLE</th>
                  <th className="px-4 py-3">CLOCK-IN</th>
                  <th className="px-4 py-3">CLOCK-OUT</th>
                  <th className="px-4 py-3">HOURS WORKED</th>
                  <th className="px-4 py-3">PUNCTUALITY STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceLogs.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{att.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{att.staffName}</td>
                    <td className="px-4 py-3 text-slate-600">{att.role}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">{att.clockIn}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{att.clockOut}</td>
                    <td className="px-4 py-3 font-mono font-bold">{att.hours} hrs</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                          att.status === 'ON_TIME'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {att.status === 'ON_TIME' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: SHIFT ROSTERS */}
      {activeSubTab === 'schedules' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-600" />
                <span>Weekly Pharmacy Shift Duty Rosters</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scheduled lead pharmacists, dispensing cashiers, and central warehouse staff per shift.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {shiftSchedules.map((s, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 dark:bg-slate-950 dark:border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 dark:border-slate-800">
                  <h4 className="font-extrabold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-600" /> {s.shift}
                  </h4>
                  <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-md">
                    {s.branch}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Lead Pharmacist</span>
                    <span className="font-bold text-slate-900 dark:text-white">{s.lead}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">POS Cashier</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{s.cashier}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Store Officer</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{s.storehouse}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: LEAVE MANAGEMENT */}
      {activeSubTab === 'leave_requests' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <BadgeAlert className="h-4 w-4 text-amber-600" />
                <span>Staff Leave Applications & Time-Off Approvals</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review annual leave, medical rest requests, and maternity leave applications.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">LEAVE ID</th>
                  <th className="px-4 py-3">STAFF MEMBER</th>
                  <th className="px-4 py-3">LEAVE TYPE</th>
                  <th className="px-4 py-3">DATES</th>
                  <th className="px-4 py-3">DURATION</th>
                  <th className="px-4 py-3">REASON</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaveRequests.map((lv) => (
                  <tr key={lv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{lv.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{lv.staffName}</td>
                    <td className="px-4 py-3 font-semibold text-teal-700">{lv.type}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{lv.startDate} to {lv.endDate}</td>
                    <td className="px-4 py-3 font-bold">{lv.days} Days</td>
                    <td className="px-4 py-3 text-slate-500 italic max-w-xs">{lv.reason}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          lv.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {lv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {lv.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setLeaveRequests(
                              leaveRequests.map((l) => (l.id === lv.id ? { ...l, status: 'APPROVED' } : l))
                            );
                          }}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[10px]"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: PAYROLL & COMPENSATION */}
      {activeSubTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Banknote className="h-4 w-4 text-purple-600" />
                <span>Monthly Staff Payroll Ledger & Salary Disbursements</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                August 2026 payroll summary including tax withholdings, allowances, and bank accounts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">PAYROLL ID</th>
                  <th className="px-4 py-3">STAFF MEMBER</th>
                  <th className="px-4 py-3">BASE SALARY</th>
                  <th className="px-4 py-3">ALLOWANCE</th>
                  <th className="px-4 py-3">TAX WITHHELD</th>
                  <th className="px-4 py-3">NET PAYABLE</th>
                  <th className="px-4 py-3">PAYMENT ACCOUNT</th>
                  <th className="px-4 py-3">DISBURSEMENT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payrollData.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{p.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{p.staffName}</td>
                    <td className="px-4 py-3 font-mono">{formatCurrency(p.baseSalary)}</td>
                    <td className="px-4 py-3 font-mono text-emerald-700">+{formatCurrency(p.allowance)}</td>
                    <td className="px-4 py-3 font-mono text-rose-600">-{formatCurrency(p.tax)}</td>
                    <td className="px-4 py-3 font-mono font-extrabold text-teal-700">{formatCurrency(p.netPay)}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{p.bank}</td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: SALARY ADVANCES & LOANS */}
      {activeSubTab === 'loans' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>Employee Salary Advance & Emergency Loan Tracker</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitor approved staff salary advances and monthly payroll deductions.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">LOAN ID</th>
                  <th className="px-4 py-3">STAFF MEMBER</th>
                  <th className="px-4 py-3">AMOUNT REQUESTED</th>
                  <th className="px-4 py-3">MONTHLY DEDUCTION</th>
                  <th className="px-4 py-3">REMAINING BALANCE</th>
                  <th className="px-4 py-3">APPROVED BY</th>
                  <th className="px-4 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salaryLoans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{l.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{l.staffName}</td>
                    <td className="px-4 py-3 font-mono font-bold">{formatCurrency(l.amountRequested)}</td>
                    <td className="px-4 py-3 font-mono text-rose-600">{formatCurrency(l.monthlyDeduction)}/mo</td>
                    <td className="px-4 py-3 font-mono font-extrabold text-teal-700">{formatCurrency(l.remainingBalance)}</td>
                    <td className="px-4 py-3 text-slate-600">{l.approvedBy}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          l.status === 'ACTIVE'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 8: DEPARTMENTS */}
      {activeSubTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Building className="h-4 w-4 text-teal-600" />
                <span>Organizational Structure - Pharmacy Departments</span>
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Clinical Pharmacy & Dispensing</h4>
              <p className="text-slate-500">Responsible for prescription checks, OTC consultation, and drug interactions.</p>
              <span className="inline-block bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-md">3 Staff</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Point of Sale & Cashier Counter</h4>
              <p className="text-slate-500">Handles customer payments, Telebirr merchant scans, and printed receipts.</p>
              <span className="inline-block bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-md">3 Staff</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Inventory & Central Storehouse</h4>
              <p className="text-slate-500">Oversees wholesale purchases, EFDA batch receiving, and cold-chain storage.</p>
              <span className="inline-block bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-md">2 Staff</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Accounting & Store Administration</h4>
              <p className="text-slate-500">Manages store financial accounts, general journals, and EFDA licensing compliance.</p>
              <span className="inline-block bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-md">1 Staff</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 9: JOB TITLES */}
      {activeSubTab === 'job_titles' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-teal-600" />
                <span>Official Job Titles & Salary Scales</span>
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">JOB TITLE</th>
                  <th className="px-4 py-3">DEPARTMENT</th>
                  <th className="px-4 py-3">EFDA LICENSE REQ</th>
                  <th className="px-4 py-3">SALARY RANGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Chief Pharmacist</td>
                  <td className="px-4 py-3 text-slate-600">Clinical Pharmacy</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">EFDA Doctor of Pharmacy (PharmD)</td>
                  <td className="px-4 py-3 font-mono font-bold text-teal-700">28,000 - 38,000 ETB</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Dispensing Pharmacist</td>
                  <td className="px-4 py-3 text-slate-600">Clinical Pharmacy</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">EFDA B.Pharm License</td>
                  <td className="px-4 py-3 font-mono font-bold text-teal-700">22,000 - 30,000 ETB</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">POS Cashier</td>
                  <td className="px-4 py-3 text-slate-600">Cashier Counter</td>
                  <td className="px-4 py-3 text-slate-500">Financial Certificate</td>
                  <td className="px-4 py-3 font-mono font-bold text-teal-700">12,000 - 18,000 ETB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 10: SECURITY AUDIT LOG */}
      {activeSubTab === 'audit_logs' && (
        <UserActivityLog
          auditLogs={auditLogs}
          users={users}
          onRefresh={fetchUsersAndLogs}
          onAddLog={handleAddLogItem}
        />
      )}

      {/* MODAL 1: CREATE NEW STAFF USER */}
      {isNewUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base dark:text-white">Create New Staff Account</h3>
                  <p className="text-[11px] text-slate-500">Provision employee account with temporary initial credentials</p>
                </div>
              </div>
              <button onClick={() => setIsNewUserOpen(false)} className="text-slate-400 hover:text-slate-600">
                &#10005;
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tigist Wolde"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Work Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="tigist@kaziniya.et"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Assigned DDS Character / Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      const deptMap: Record<string, string> = {
                        SUPER_ADMIN: 'Whole System Administration & Governance',
                        STORE_OWNER: 'Drug Store Ownership & Business Operations',
                        PHARMACIST: 'Prescription Dispensary & Clinical POS',
                      };
                      setUserForm({
                        ...userForm,
                        role: newRole,
                        department: deptMap[newRole] || 'Prescription Dispensary & Clinical POS',
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 text-xs"
                  >
                    <option value="PHARMACIST">Pharmacist (Clinical Dispensing & POS Counter)</option>
                    <option value="STORE_OWNER">Drug Store Owner (Store Management & Inventory)</option>
                    {isSuperAdmin && (
                      <option value="SUPER_ADMIN">Super Admin (Whole System Governance)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Department</label>
                  <input
                    type="text"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Employee ID Code</label>
                  <input
                    type="text"
                    value={userForm.employeeId}
                    onChange={(e) => setUserForm({ ...userForm, employeeId: e.target.value })}
                    placeholder="e.g. KZN-STF-009"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-amber-600" />
                    <span>Temporary Initial Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, temporaryPassword: generateTempPassword() })}
                    className="text-[10px] font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={userForm.temporaryPassword}
                  onChange={(e) => setUserForm({ ...userForm, temporaryPassword: e.target.value })}
                  className="w-full rounded-lg border border-amber-300 bg-white p-2 dark:bg-slate-900 dark:border-amber-700 text-xs font-mono font-bold text-amber-950 dark:text-amber-200"
                />

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={userForm.mustChangePassword}
                    onChange={(e) => setUserForm({ ...userForm, mustChangePassword: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-amber-950 dark:text-amber-300 font-medium">
                    Force staff member to change password upon their first login (Recommended)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewUserOpen(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-teal-700">
                  Provision Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EMPLOYEE ONBOARDING CREDENTIAL SLIP MODAL */}
      {createdSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base dark:text-white">
                    {createdSlip.isReset ? 'Credentials Reset Slip' : 'Employee Onboarding Slip'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Provide these initial login details to the employee</p>
                </div>
              </div>
              <button onClick={() => setCreatedSlip(null)} className="text-slate-400 hover:text-slate-600">
                &#10005;
              </button>
            </div>

            {/* Slip Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm dark:text-white block">{createdSlip.user.name}</span>
                  <span className="text-[11px] text-slate-500">{createdSlip.user.role} • {createdSlip.user.department || 'Operations'}</span>
                </div>
                <span className="bg-teal-100 text-teal-800 font-mono font-bold text-[11px] px-2.5 py-1 rounded-lg dark:bg-teal-950 dark:text-teal-300">
                  {createdSlip.user.employeeId || 'KZN-STF'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Work Email / ID:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{createdSlip.user.email}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-amber-50 rounded-lg border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800">
                  <div>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block uppercase">
                      Temporary Password
                    </span>
                    <span className="font-mono font-black text-sm text-amber-950 dark:text-amber-200">
                      {createdSlip.temporaryPassword}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyCredentials(
                        `Kaziniya Drug Store Staff Login\nName: ${createdSlip.user.name}\nEmail: ${createdSlip.user.email}\nEmployee ID: ${createdSlip.user.employeeId || 'N/A'}\nTemporary Password: ${createdSlip.temporaryPassword}\nNote: You will be asked to set your own password on first login.`,
                        'slip-copy'
                      )
                    }
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 hover:bg-amber-100 text-amber-900 dark:text-amber-200 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs"
                  >
                    {copiedId === 'slip-copy' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-teal-50 rounded-lg border border-teal-200 dark:bg-teal-950/30 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-300 leading-relaxed">
                <span className="font-bold block">First-Time Login Security Protocol:</span>
                When {createdSlip.user.name} signs in for the first time, the system will immediately prompt them to set their own permanent password and terminal PIN before workstation access is granted.
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreatedSlip(null)}
                className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 font-bold text-xs transition shadow-sm"
              >
                Done & Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
