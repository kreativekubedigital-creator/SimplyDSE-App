'use client';

import React, { useState, useEffect } from 'react';
import { useWorkforceData } from '@/hooks/useWorkforceData';
import { supabase } from '@/lib/supabase';
import { getTenantContext } from '@/lib/tenant-context';
import { 
  Users,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Phone,
  Building2,
  Calendar,
  ExternalLink,
  Loader2,
  GraduationCap,
  PlayCircle,
  Award,
  BookOpen,
  ChevronRight,
  MoreVertical,
  Plus,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  MoreHorizontal,
  X,
  CheckCircle,
  AlertCircle,
  Send,
  Lock,
  UserX,
  Archive,
  UserCheck,
  FileText,
  ChevronDown,
  MapPin,
  RefreshCw,
  History,
  Edit,
  Eye,
  User,
  Key,
  BookOpenCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';
import { AddEmployeeModal } from '@/components/dashboard/AddEmployeeModal';
import { UploadEmployeesModal } from '@/components/dashboard/UploadEmployeesModal';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Import our server-side HR actions
import {
  hrUpdateEmployee,
  hrArchiveEmployee,
  hrSuspendEmployee,
  hrActivateEmployee,
  hrAssignAssessment,
  hrRequestReassessment,
  hrAddNote,
  hrTransferDepartment,
  hrResetLoginAccess,
  hrSendReminder
} from '@/app/actions/hr-employee-actions';

function StaffDirectoryContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'directory' | 'training'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced filters state
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [filterAccountStatus, setFilterAccountStatus] = useState('active'); // Defaults to 'active' active staff
  const [filterAssessmentStatus, setFilterAssessmentStatus] = useState('All');
  const [filterRiskLevel, setFilterRiskLevel] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { employees, loading, stats, refetch } = useWorkforceData();
  const [organizationSlug, setOrganizationSlug] = useState('workspace');

  // Dropdown & Modal State
  const [activeMenuEmployeeId, setActiveMenuEmployeeId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [activeModal, setActiveModal] = useState<'view_profile' | 'edit_employee' | 'assign_assessment' | 'view_assessments' | 'view_reports' | 'compliance_history' | 'add_note' | 'send_reminder' | 'transfer_department' | 'archive_employee' | 'suspend_employee' | null>(null);

  // Modal-specific form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    jobTitle: '',
    role: 'employee',
    status: 'active',
    loginMethod: 'SSO',
    employmentType: 'Full-time',
    workLocation: 'Office',
    phone: ''
  });

  const [assignForm, setAssignForm] = useState({
    templateId: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [reassignForm, setReassignForm] = useState({
    templateId: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: ''
  });

  const [noteText, setNoteText] = useState('');
  const [transferDept, setTransferDept] = useState('');
  const [reminderType, setReminderType] = useState<'incomplete_assessment' | 'overdue_assessment' | 'training' | 'reassessment'>('incomplete_assessment');

  // Loaded database details
  const [templates, setTemplates] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [completedReports, setCompletedReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingModalData, setLoadingModalData] = useState(false);

  // Dynamic Toast Alerts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'training') setActiveTab('training');
    
    // Fetch templates & org context
    async function loadContext() {
      const context = await getTenantContext();
      if (context.organizationSlug) {
        setOrganizationSlug(context.organizationSlug);
      }
      
      const { data: tmps } = await supabase
        .from('assessment_templates')
        .select('*')
        .eq('is_active', true);
      if (tmps) setTemplates(tmps);
    }
    loadContext();
  }, [searchParams]);

  // Load employee specific data when viewing details/history
  useEffect(() => {
    if (!selectedEmployee) return;
    
    async function loadEmployeeRecords() {
      setLoadingModalData(true);
      try {
        // Fetch assignments
        const { data: assignData } = await supabase
          .from('assessment_assignments')
          .select('*, assessment_templates(name)')
          .eq('employee_id', selectedEmployee.id)
          .order('assigned_at', { ascending: false });
        if (assignData) setAssignments(assignData);

        // Fetch completed reports
        const { data: reportData } = await supabase
          .from('assessment_reports')
          .select('*')
          .eq('employee_id', selectedEmployee.id)
          .order('generated_at', { ascending: false });
        if (reportData) setCompletedReports(reportData);

        // Fetch audit logs
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('entity_id', selectedEmployee.id)
          .order('created_at', { ascending: false });
        if (logs) setAuditLogs(logs);

      } catch (err) {
        console.error('Error loading employee specific details:', err);
      } finally {
        setLoadingModalData(false);
      }
    }
    
    loadEmployeeRecords();
  }, [selectedEmployee, activeModal]);

  // Handle outside click for action menu
  useEffect(() => {
    function handleOutsideClick() {
      setActiveMenuEmployeeId(null);
    }
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filter Employees dynamically
  const filteredEmployees = employees.filter((emp: any) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.idShort.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = filterDepartment === 'All' || emp.department === filterDepartment;
    const matchesRole = filterRole === 'All' || emp.role === filterRole;
    
    // Account Status filter
    const matchesAccountStatus = filterAccountStatus === 'All' || emp.accountStatus === filterAccountStatus;
    
    // Assessment status
    const matchesAssessmentStatus = filterAssessmentStatus === 'All' || emp.assessmentStatus === filterAssessmentStatus;
    
    // Risk level filter
    const matchesRisk = filterRiskLevel === 'All' || emp.riskLevel === filterRiskLevel;

    return matchesSearch && matchesDept && matchesRole && matchesAccountStatus && matchesAssessmentStatus && matchesRisk;
  });

  // Extract unique departments dynamically
  const departmentsList = Array.from(new Set(employees.map(e => e.department || 'General')));

  // Trigger modal actions
  const openEmployeeModal = (emp: any, modalName: typeof activeModal) => {
    setSelectedEmployee(emp);
    setActiveModal(modalName);
    setActiveMenuEmployeeId(null);

    if (modalName === 'edit_employee') {
      const names = emp.name.split(' ');
      setEditForm({
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: emp.email,
        department: emp.department,
        jobTitle: emp.jobTitle,
        role: emp.role,
        status: emp.accountStatus,
        loginMethod: emp.loginMethod || 'SSO',
        employmentType: emp.employmentType || 'Full-time',
        workLocation: emp.workLocation || 'Office',
        phone: emp.phone || ''
      });
    }

    if (modalName === 'transfer_department') {
      setTransferDept(emp.department);
    }
  };

  // Submit Edit Employee
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const res = await hrUpdateEmployee(selectedEmployee.id, editForm);
    if (res.success) {
      triggerToast('Employee record updated successfully!');
      setActiveModal(null);
      refetch();
    } else {
      triggerToast(res.error || 'Failed to update employee record.', 'error');
    }
  };

  // Submit Assign Assessment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !assignForm.templateId) {
      triggerToast('Please select an assessment template.', 'error');
      return;
    }

    const res = await hrAssignAssessment(selectedEmployee.id, assignForm.templateId, assignForm.dueDate);
    if (res.success) {
      triggerToast('Assessment assigned successfully and employee notified.');
      setActiveModal(null);
      refetch();
    } else {
      triggerToast(res.error || 'Failed to assign assessment.', 'error');
    }
  };

  // Submit Request Reassessment
  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !reassignForm.templateId) {
      triggerToast('Please select an assessment template.', 'error');
      return;
    }

    const res = await hrRequestReassessment(selectedEmployee.id, reassignForm.templateId, reassignForm.dueDate, reassignForm.reason);
    if (res.success) {
      triggerToast('Reassessment successfully requested.');
      setActiveModal(null);
      refetch();
    } else {
      triggerToast(res.error || 'Failed to request reassessment.', 'error');
    }
  };

  // Submit HR Note
  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !noteText.trim()) return;

    const res = await hrAddNote(selectedEmployee.id, noteText);
    if (res.success) {
      triggerToast('HR note successfully added.');
      setNoteText('');
      // Force reload specific records
      setSelectedEmployee({ ...selectedEmployee });
    } else {
      triggerToast(res.error || 'Failed to add HR note.', 'error');
    }
  };

  // Submit Department Transfer
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !transferDept.trim()) return;

    const res = await hrTransferDepartment(selectedEmployee.id, transferDept);
    if (res.success) {
      triggerToast(`Successfully transferred to ${transferDept}`);
      setActiveModal(null);
      refetch();
    } else {
      triggerToast(res.error || 'Transfer failed.', 'error');
    }
  };

  // Trigger Suspend
  const handleSuspendConfirm = async () => {
    if (!selectedEmployee) return;
    const res = await hrSuspendEmployee(selectedEmployee.id);
    if (res.success) {
      triggerToast('Employee login access has been suspended.');
      setActiveModal(null);
      refetch();
    } else {
      triggerToast(res.error || 'Failed to suspend employee.', 'error');
    }
  };

  // Trigger Activate/Restore
  const handleActivateConfirm = async (empId: string) => {
    const res = await hrActivateEmployee(empId);
    if (res.success) {
      triggerToast('Employee account restored and activated successfully.');
      setActiveModal(null);
      refetch();
    } else {
      triggerToast(res.error || 'Failed to activate employee.', 'error');
    }
  };

  // Trigger Archive
  const handleArchiveConfirm = async () => {
    if (!selectedEmployee) return;
    const res = await hrArchiveEmployee(selectedEmployee.id);
    if (res.success) {
      triggerToast('Employee archived safely. Active access is revoked.');
      setActiveModal(null);
      refetch();
    } else {
      triggerToast(res.error || 'Failed to archive employee.', 'error');
    }
  };

  // Trigger Reset Recovery Access
  const handleResetAccess = async (emp: any) => {
    const res = await hrResetLoginAccess(emp.id, emp.email);
    if (res.success) {
      triggerToast(`Invite/Password Reset Link successfully emailed to ${emp.email}`);
    } else {
      triggerToast(res.error || 'Failed to reset access.', 'error');
    }
  };

  // Send Notification Reminder
  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const res = await hrSendReminder(selectedEmployee.id, reminderType);
    if (res.success) {
      triggerToast('Notification reminder dispatched successfully.');
      setActiveModal(null);
    } else {
      triggerToast(res.error || 'Failed to dispatch reminder.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={cn(
          "fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl animate-in slide-in-from-top duration-300",
          toast.type === 'success' 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        )}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span className="text-[13px] font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-[13px] text-slate-500 mt-1">Configure compliance rules, monitor active employee assessments, and manage workspace access controls.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => {
              const headers = ['ID', 'Name', 'Email', 'Department', 'Role', 'Compliance', 'Risk Level', 'Account Status', 'Last Assessment'];
              const rows = employees.map(e => [e.idShort, e.name, e.email, e.department, e.role, `${e.complianceScore}%`, e.riskLevel, e.accountStatus, e.lastAssessment]);
              const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `staff_compliance_directory_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Staff
          </button>
          
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Import CSV
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Onboard Member
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Workforce" 
          value={stats.total} 
          trend="+2%" 
          icon={Users}
          iconColor="blue"
        />
        <StatCard 
          title="DSE Fully Compliant" 
          value={stats.compliant} 
          trend="Strong" 
          icon={ShieldCheck}
          iconColor="emerald"
        />
        <StatCard 
          title="Active Assessment Tasks" 
          value={employees.filter(e => e.assessmentStatus === 'Pending').length} 
          trend="Outstanding" 
          icon={GraduationCap}
          iconColor="indigo"
        />
        <StatCard 
          title="Critical Escalations" 
          value={stats.highRisk} 
          trend={stats.highRisk > 0 ? "Requires Review" : "Healthy"} 
          isPositive={stats.highRisk === 0}
          icon={AlertTriangle}
          iconColor="rose"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-8 border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('directory')}
          className={cn(
            "pb-4 text-[13px] font-bold transition-all relative",
            activeTab === 'directory' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Staff Directory
          {activeTab === 'directory' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('training')}
          className={cn(
            "pb-4 text-[13px] font-bold transition-all relative",
            activeTab === 'training' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Training Modules
          {activeTab === 'training' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-[1.5rem] shadow-sm overflow-hidden">
        {/* Advanced Filters */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search staff by name, email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-[12px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600 uppercase mr-1">Quick Toggle:</span>
              <button 
                onClick={() => setFilterAccountStatus('active')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
                  filterAccountStatus === 'active' ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                Active Staff
              </button>
              <button 
                onClick={() => setFilterAccountStatus('archived')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
                  filterAccountStatus === 'archived' ? "bg-slate-100 border-slate-300 text-slate-800 font-bold" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                Archived Records
              </button>
            </div>
          </div>

          {/* Detailed Filters row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Department</label>
              <select 
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none hover:bg-slate-50/50"
              >
                <option value="All">All Departments</option>
                {departmentsList.map((d, i) => <option key={i} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">System Role</label>
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none hover:bg-slate-50/50"
              >
                <option value="All">All Roles</option>
                <option value="employee">Employee</option>
                <option value="hr_manager">HR Manager</option>
                <option value="compliance_manager">Compliance Manager</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Assessment Status</label>
              <select 
                value={filterAssessmentStatus}
                onChange={(e) => setFilterAssessmentStatus(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none hover:bg-slate-50/50"
              >
                <option value="All">All Statuses</option>
                <option value="Up To Date">Up To Date</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Requires Review">Requires Review</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Risk Level</label>
              <select 
                value={filterRiskLevel}
                onChange={(e) => setFilterRiskLevel(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none hover:bg-slate-50/50"
              >
                <option value="All">All Risks</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Account State</label>
              <select 
                value={filterAccountStatus}
                onChange={(e) => setFilterAccountStatus(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none hover:bg-slate-50/50"
              >
                <option value="All">All Accounts</option>
                <option value="active">Active</option>
                <option value="pending_setup">Pending Setup</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {activeTab === 'directory' ? (
          <div className="overflow-x-auto relative scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[900px] lg:min-w-0">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-4 py-3.5 text-[10.5px] font-semibold text-slate-600 uppercase tracking-wider">Staff Member</th>
                  <th className="px-4 py-3.5 text-[10.5px] font-semibold text-slate-600 uppercase tracking-wider">Role / Dept</th>
                  <th className="px-4 py-3.5 text-[10.5px] font-semibold text-slate-600 uppercase tracking-wider">Compliance</th>
                  <th className="px-4 py-3.5 text-[10.5px] font-semibold text-slate-600 uppercase tracking-wider">Risk</th>
                  <th className="px-4 py-3.5 text-[10.5px] font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-[10.5px] font-semibold text-slate-600 uppercase tracking-wider">Last Assessment</th>
                  <th className="px-4 py-3.5 text-[10.5px] font-semibold text-slate-600 uppercase tracking-wider">Account</th>
                  <th className="px-4 py-3.5 text-[10.5px] font-semibold text-slate-600 uppercase tracking-wider text-right sticky right-0 bg-slate-50/95 z-20 shadow-[-8px_0_8px_-6px_rgba(0,0,0,0.05)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                        <p className="text-[12px] text-slate-500 font-medium">Hydrating Staff compliance records...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500 text-[12px] font-medium">No matching records found. Try modifying filters.</td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp: any) => (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[12px] font-semibold text-slate-700 border border-slate-200/50 shadow-sm shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-semibold text-slate-900 leading-tight truncate">{emp.name}</p>
                            <p className="text-[10.5px] text-slate-600 font-normal mt-0.5 leading-tight truncate">{emp.email}</p>
                            <p className="text-[9.5px] text-slate-500 font-semibold tracking-wider mt-0.5 uppercase leading-tight truncate">ID: {emp.idShort}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 min-w-[130px]">
                        <p className="text-[12px] font-medium text-slate-900 leading-tight">{emp.jobTitle}</p>
                        <p className="text-[9.5px] font-medium text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">{emp.department}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                emp.complianceScore > 80 ? "bg-emerald-500" : emp.complianceScore > 50 ? "bg-amber-500" : "bg-rose-500"
                              )} 
                              style={{ width: `${emp.complianceScore}%` }} 
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-900">{emp.complianceScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider border",
                          emp.riskLevel === 'Low' 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                            : emp.riskLevel === 'Medium' 
                              ? "bg-amber-50 text-amber-800 border-amber-300" 
                              : "bg-rose-50 text-rose-800 border-rose-300"
                        )}>
                          {emp.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold border",
                          emp.assessmentStatus === 'Up To Date' 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                            : emp.assessmentStatus === 'Pending' 
                              ? "bg-indigo-50 text-indigo-800 border-indigo-250" 
                              : "bg-rose-50 text-rose-800 border-rose-250"
                        )}>
                          {emp.assessmentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-medium text-slate-700">
                        {emp.lastAssessment}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border",
                          emp.accountStatus === 'active' 
                            ? "bg-emerald-50 text-emerald-850 border-emerald-300" 
                            : emp.accountStatus === 'suspended' 
                              ? "bg-amber-50 text-amber-900 border-amber-300" 
                              : emp.accountStatus === 'archived' 
                                ? "bg-slate-100 text-slate-800 border-slate-350" 
                                : "bg-indigo-50 text-indigo-850 border-indigo-300"
                        )}>
                          {emp.accountStatus}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 text-right sticky right-0 bg-white/95 group-hover:bg-slate-50/95 transition-colors z-20 shadow-[-8px_0_8px_-6px_rgba(0,0,0,0.05)] min-w-[60px]">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuEmployeeId(activeMenuEmployeeId === emp.id ? null : emp.id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Rich Action Dropdown Menu */}
                        {activeMenuEmployeeId === emp.id && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-4 top-11 z-40 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 text-left animate-in fade-in zoom-in-95 duration-150"
                          >
                            {/* PROFILE */}
                            <div className="px-3 py-1 text-[9px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-100">Profile</div>
                            <button onClick={() => openEmployeeModal(emp, 'view_profile')} className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <Eye className="w-3.5 h-3.5 text-blue-500" /> View Profile
                            </button>
                            <button onClick={() => openEmployeeModal(emp, 'edit_employee')} className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <Edit className="w-3.5 h-3.5 text-blue-500" /> Edit Employee
                            </button>
                            <a href={`/dashboard/employees?employee=${emp.id}`} className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <ExternalLink className="w-3.5 h-3.5 text-blue-500" /> View Workspace
                            </a>

                            {/* ASSESSMENTS */}
                            <div className="px-3 py-1 text-[9px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-100 mt-1.5">Assessments</div>
                            <button onClick={() => openEmployeeModal(emp, 'assign_assessment')} className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <Plus className="w-3.5 h-3.5 text-indigo-500" /> Assign Assessment
                            </button>
                            <button onClick={() => openEmployeeModal(emp, 'view_assessments')} className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <History className="w-3.5 h-3.5 text-indigo-500" /> View Assignments
                            </button>
                            <button onClick={() => openEmployeeModal(emp, 'view_reports')} className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-indigo-500" /> View Reports
                            </button>

                            {/* COMPLIANCE */}
                            <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mt-2">Compliance</div>
                            <button onClick={() => openEmployeeModal(emp, 'compliance_history')} className="w-full text-left px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> History & Timeline
                            </button>
                            <button onClick={() => openEmployeeModal(emp, 'add_note')} className="w-full text-left px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <BookOpenCheck className="w-3.5 h-3.5 text-emerald-500" /> Add HR Notes
                            </button>

                            {/* COMMUNICATION */}
                            <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mt-2">Communication</div>
                            <button onClick={() => openEmployeeModal(emp, 'send_reminder')} className="w-full text-left px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <Send className="w-3.5 h-3.5 text-violet-500" /> Send Reminder
                            </button>
                            <a href={`mailto:${emp.email}`} className="w-full text-left px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-violet-500" /> Email Employee
                            </a>

                            {/* ACCESS MANAGEMENT */}
                            <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mt-2">Access Management</div>
                            {emp.accountStatus === 'suspended' ? (
                              <button onClick={() => handleActivateConfirm(emp.id)} className="w-full text-left px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                                <UserCheck className="w-3.5 h-3.5 text-amber-500" /> Reactivate
                              </button>
                            ) : (
                              <button onClick={() => openEmployeeModal(emp, 'suspend_employee')} className="w-full text-left px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                                <UserX className="w-3.5 h-3.5 text-amber-500" /> Suspend Employee
                              </button>
                            )}
                            <button onClick={() => handleResetAccess(emp)} className="w-full text-left px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <Key className="w-3.5 h-3.5 text-amber-500" /> Reset Login Access
                            </button>
                            <button onClick={() => openEmployeeModal(emp, 'transfer_department')} className="w-full text-left px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-amber-500" /> Transfer Department
                            </button>

                            {/* OFFBOARDING */}
                            <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mt-2">Offboarding</div>
                            {emp.accountStatus === 'archived' ? (
                              <button onClick={() => handleActivateConfirm(emp.id)} className="w-full text-left px-3 py-2 text-[12px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-2">
                                <UserCheck className="w-3.5 h-3.5" /> Restore Account
                              </button>
                            ) : (
                              <button onClick={() => openEmployeeModal(emp, 'archive_employee')} className="w-full text-left px-3 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2">
                                <Archive className="w-3.5 h-3.5" /> Archive Employee
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'DSE Fundamentals', duration: '45m', icon: PlayCircle, status: 'Active' },
                { title: 'Workplace Ergonomics', duration: '1h 20m', icon: BookOpen, status: 'Active' },
                { title: 'Safety Certification', duration: '30m', icon: Award, status: 'Mandatory' },
              ].map((course, idx) => (
                <div key={idx} className="p-6 bg-slate-50/50 border border-slate-200 rounded-3xl hover:border-blue-200 transition-all group cursor-pointer">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                      <course.icon className="w-6 h-6" />
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[9px] font-black uppercase rounded-lg tracking-wider">
                      {course.status}
                    </span>
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 mb-2">{course.title}</h4>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/50">
                    <span className="text-[11px] text-slate-400 font-bold">{course.duration}</span>
                    <button className="text-[11px] font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Manage Module <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==================== HIGH-FIDELITY INTERACTIVE MODALS ==================== */}

      {/* 1. VIEW PROFILE MODAL */}
      {activeModal === 'view_profile' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Card Summary */}
              <div className="w-full md:w-1/3 bg-slate-50/50 border border-slate-150 rounded-3xl p-6 text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-white">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-slate-900">{selectedEmployee.name}</h3>
                  <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">{selectedEmployee.jobTitle}</p>
                </div>
                <div className="flex justify-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border",
                    selectedEmployee.accountStatus === 'active' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-250 text-amber-700"
                  )}>
                    {selectedEmployee.accountStatus}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-600 border border-slate-200 uppercase">
                    {selectedEmployee.loginMethod}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2 text-left text-[12px] text-slate-600">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {selectedEmployee.email}</div>
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> {selectedEmployee.department}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {selectedEmployee.workLocation || 'Office'}</div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> {selectedEmployee.employmentType || 'Full-time'}</div>
                </div>
              </div>

              {/* Extended Tabs / Details Panel */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Compliance Snapshot</h2>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{selectedEmployee.complianceScore}%</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{selectedEmployee.riskLevel}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{selectedEmployee.assessmentStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Live loaded details */}
                <div className="space-y-4">
                  {/* Assigned Assessments */}
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Assigned & Outstanding Tasks</h4>
                    {loadingModalData ? (
                      <div className="text-slate-400 text-[12px] flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading tasks...</div>
                    ) : assignments.length === 0 ? (
                      <p className="text-slate-400 text-[12px]">No outstanding or past assignments found.</p>
                    ) : (
                      <div className="space-y-2">
                        {assignments.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-150 rounded-xl text-[12px]">
                            <div>
                              <p className="font-bold text-slate-800">{item.assessment_templates?.name || 'Assigned Assessment'}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Assigned: {new Date(item.assigned_at).toLocaleDateString()}</p>
                            </div>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold",
                              item.status === 'completed' ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                            )}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Completed Assessment Reports */}
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Recent Assessment Reports</h4>
                    {loadingModalData ? (
                      <div className="text-slate-400 text-[12px] flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading reports...</div>
                    ) : completedReports.length === 0 ? (
                      <p className="text-slate-400 text-[12px]">No generated compliance reports exist yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {completedReports.map((report) => (
                          <div key={report.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-150 rounded-xl text-[12px]">
                            <div>
                              <p className="font-bold text-slate-800">{report.report_title || 'DSE Health Report'}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Score: {report.overall_score}% | Risk: {report.risk_level}</p>
                            </div>
                            <a 
                              href={`/dashboard/risk-compliance/reports/${report.id}`}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
                            >
                              <FileText className="w-3 h-3" /> View Report
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT EMPLOYEE MODAL */}
      {activeModal === 'edit_employee' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Staff Record</h2>
            <p className="text-[12px] text-slate-400 mt-1">Configure profile details, role hierarchies and account lifecycle state.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">First Name</label>
                  <input 
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Last Name</label>
                  <input 
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input 
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department</label>
                  <input 
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Job Title</label>
                  <input 
                    type="text"
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">System Role</label>
                  <select 
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="hr_manager">HR Manager</option>
                    <option value="compliance_manager">Compliance Manager</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Login Method</label>
                  <select 
                    value={editForm.loginMethod}
                    onChange={(e) => setEditForm({ ...editForm, loginMethod: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                  >
                    <option value="SSO">Enterprise SSO</option>
                    <option value="Password">Password Recovery</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-3 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ASSIGN ASSESSMENT MODAL */}
      {activeModal === 'assign_assessment' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assign Assessment</h2>
            <p className="text-[12px] text-slate-400 mt-1">Select an active workstation template to deploy to <strong>{selectedEmployee.name}</strong>.</p>

            <form onSubmit={handleAssignSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Workplace Template</label>
                <select 
                  value={assignForm.templateId}
                  onChange={(e) => setAssignForm({ ...assignForm, templateId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                  required
                >
                  <option value="">Select Template...</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.version})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Due Date</label>
                <input 
                  type="date"
                  required
                  value={assignForm.dueDate}
                  onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-3 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:bg-blue-700">Assign Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. VIEW OUTSTANDING ASSIGNMENTS MODAL */}
      {activeModal === 'view_assessments' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-lg w-full p-8 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assigned Tasks</h2>
            <p className="text-[12px] text-slate-400 mt-1">Timeline of allocated DSE health audits for <strong>{selectedEmployee.name}</strong>.</p>

            <div className="space-y-3 mt-6 max-h-60 overflow-y-auto">
              {loadingModalData ? (
                <div className="text-center py-6 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading records...</div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-6 text-slate-400">No workstation assignments exist for this user.</div>
              ) : (
                assignments.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-[12px]">
                    <div>
                      <p className="font-bold text-slate-800">{item.assessment_templates?.name || 'DSE Audit'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Assigned: {new Date(item.assigned_at).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-400">Due Date: {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      item.status === 'completed' ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                    )}>
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW COMPLETED REPORTS MODAL */}
      {activeModal === 'view_reports' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-xl w-full p-8 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Compliance Reports</h2>
            <p className="text-[12px] text-slate-400 mt-1">Securely view or download generated DSE compliance assessment results.</p>

            <div className="space-y-3 mt-6 max-h-80 overflow-y-auto">
              {loadingModalData ? (
                <div className="text-center py-6 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading reports...</div>
              ) : completedReports.length === 0 ? (
                <div className="text-center py-6 text-slate-400">No compliance reports exist yet for this staff member.</div>
              ) : (
                completedReports.map((report) => (
                  <div key={report.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-[12px]">
                    <div>
                      <p className="font-bold text-slate-800">{report.report_title || 'Workplace Ergonomic Review'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Overall Score: {report.overall_score}% | Risk: {report.risk_level}</p>
                      <p className="text-[10px] text-slate-400">Generated: {new Date(report.generated_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={`/dashboard/risk-compliance/reports/${report.id}`}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] transition-all flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. VIEW COMPLIANCE HISTORY & RISK TIMELINE */}
      {activeModal === 'compliance_history' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-2xl w-full p-8 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Compliance & Risk Timeline</h2>
            <p className="text-[12px] text-slate-400 mt-1">Audit log and risk trends captured for <strong>{selectedEmployee.name}</strong>.</p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Risk Trend Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Risk Trendline</h4>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Current Risk Rating</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">{selectedEmployee.riskLevel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Latest Score</span>
                    <span className="font-black text-slate-800">{selectedEmployee.complianceScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Audit Status</span>
                    <span className="font-semibold text-slate-800">{selectedEmployee.assessmentStatus}</span>
                  </div>
                </div>
              </div>

              {/* HR Notes Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Recent Action Logs</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto text-[11px] text-slate-500">
                  {loadingModalData ? (
                    <div>Loading logs...</div>
                  ) : auditLogs.length === 0 ? (
                    <div>No action history logged yet.</div>
                  ) : (
                    auditLogs.slice(0, 3).map((log) => (
                      <div key={log.id} className="border-b border-slate-200 pb-1.5">
                        <p className="font-bold text-slate-800 uppercase">{log.action.replace('_', ' ')}</p>
                        <p className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Note addition */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Internal Compliance Note</h4>
              {selectedEmployee.accessibilityPrefs?.hr_notes?.map((n: any, idx: number) => (
                <div key={idx} className="bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-[12px] text-slate-700 mb-2">
                  <div className="flex justify-between font-bold text-slate-950 text-[10px] mb-1">
                    <span>{n.author}</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p>{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. ADD HR NOTES MODAL */}
      {activeModal === 'add_note' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add HR Compliance Note</h2>
            <p className="text-[12px] text-slate-400 mt-1">This internal note will only be visible to HR Administrators.</p>

            <form onSubmit={handleNoteSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Note Details</label>
                <textarea 
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record post-assessment reviews, equipment provisions or ergonomic adjustments..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-3 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:bg-blue-700">Add Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. SEND REMINDER MODAL */}
      {activeModal === 'send_reminder' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Send Reminder</h2>
            <p className="text-[12px] text-slate-400 mt-1">Dispatches an active platform alert to <strong>{selectedEmployee.name}</strong>.</p>

            <form onSubmit={handleReminderSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reminder Type</label>
                <select 
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                >
                  <option value="incomplete_assessment">Outstanding Assessment Reminder</option>
                  <option value="overdue_assessment">URGENT: Overdue Assessment Notice</option>
                  <option value="training">Safety Training Module Reminder</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-3 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:bg-blue-700">Send Notification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. TRANSFER DEPARTMENT MODAL */}
      {activeModal === 'transfer_department' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transfer Department</h2>
            <p className="text-[12px] text-slate-400 mt-1">Reassign department mappings for <strong>{selectedEmployee.name}</strong>.</p>

            <form onSubmit={handleTransferSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">New Department</label>
                <input 
                  type="text"
                  required
                  value={transferDept}
                  onChange={(e) => setTransferDept(e.target.value)}
                  placeholder="e.g. Engineering, Sales, HR..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-3 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:bg-blue-700">Confirm Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. SUSPEND EMPLOYEE MODAL */}
      {activeModal === 'suspend_employee' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-[16px] font-black text-slate-900">Suspend login Access</h3>
            <p className="text-[12px] text-slate-500 mt-2">
              Are you sure you want to suspend access for <strong>{selectedEmployee.name}</strong>? 
              They will not be able to log in to the employee dashboard until reactivated. All reports and histories will remain untouched.
            </p>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-[12px] border border-slate-200 rounded-lg text-slate-500 font-bold hover:bg-slate-50">Cancel</button>
              <button onClick={handleSuspendConfirm} className="px-4 py-2 text-[12px] bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700">Suspend Access</button>
            </div>
          </div>
        </div>
      )}

      {/* 11. ARCHIVE EMPLOYEE MODAL */}
      {activeModal === 'archive_employee' && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-[16px] font-black text-rose-600">Archive Employee Record</h3>
            <p className="text-[12px] text-slate-500 mt-2">
              Are you sure you want to archive <strong>{selectedEmployee.name}</strong>? 
              This will revoke login permissions and safely remove them from the active list. 
              <strong>All compliance statistics, past reports, and timelines are fully preserved.</strong>
            </p>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-[12px] border border-slate-200 rounded-lg text-slate-500 font-bold hover:bg-slate-50">Cancel</button>
              <button onClick={handleArchiveConfirm} className="px-4 py-2 text-[12px] bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700">Archive Record</button>
            </div>
          </div>
        </div>
      )}

      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => refetch()}
      />

      <UploadEmployeesModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <StaffDirectoryContent />
    </Suspense>
  );
}
