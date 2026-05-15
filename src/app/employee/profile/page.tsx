'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { 
  Bell, 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Save, 
  LogOut,
  Camera,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle2,
  Phone,
  Clock,
  UserCheck,
  AlertCircle,
  ChevronRight,
  Settings,
  Info,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { updateProfileAction } from '@/app/actions/update-profile';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function EmployeeProfilePage() {
  const { 
    fullName, 
    email, 
    roleLabel, 
    designation, 
    department,
    organizationName, 
    phoneNumber,
    preferredName,
    startDate,
    employmentType,
    employeeIdOfficial,
    workLocation,
    managerName,
    loading: profileLoading, 
    initials,
    avatarUrl 
  } = useProfile();

  const { stats, loading: statsLoading } = useEmployeeData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    preferredName: '',
    phoneNumber: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (fullName) {
      setFormData({
        fullName: fullName || '',
        preferredName: preferredName || '',
        phoneNumber: phoneNumber || '',
      });
    }
  }, [fullName, preferredName, phoneNumber]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProfileAction(formData);
    setIsSaving(false);
    if (result.success) {
      setIsEditing(false);
      // We don't necessarily need a reload if we update local state or use a provider, 
      // but reload is the simplest way to refresh all hooks for now.
      window.location.reload(); 
    } else {
      alert('Failed to update profile: ' + result.error);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const getRiskColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-emerald-500 bg-emerald-500/10';
      case 'medium': return 'text-amber-500 bg-amber-500/10';
      case 'high': return 'text-rose-500 bg-rose-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Hero Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-xl shadow-slate-200/50">
          {/* Banner Gradient */}
          <div className="h-40 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
          </div>

          <div className="px-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-end gap-8 -mt-16 relative z-10">
              {/* Avatar Section */}
              <div className="relative group/avatar">
                <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl shadow-blue-500/20 ring-4 ring-white">
                  <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center text-4xl font-black text-blue-600 border border-blue-100/50 overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName || ''} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 hover:scale-110 transition-all border-4 border-white">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Identity Info */}
              <div className="flex-1 space-y-2 mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{fullName}</h1>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                    {roleLabel}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span>{designation || 'Specialist'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span>{organizationName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>{workLocation || 'Remote / Hybrid'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Action */}
              <div className="flex items-center gap-3 mb-2">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[13px] font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[13px] font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                      {isSaving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[13px] font-bold hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          {/* Compliance Summary Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-all duration-700" />
            
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Compliance Summary
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">Risk Profile</span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider",
                  getRiskColor(stats?.riskLevel)
                )}>
                  {stats?.riskLevel || 'Unknown'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-500 font-medium">Assessment Health</span>
                  <span className="text-slate-900 font-black">{stats?.compliance || 0}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
                    style={{ width: `${stats?.compliance || 0}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Completed</p>
                  <p className="text-xl font-black text-slate-900">{stats?.completedCount || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Upcoming</p>
                  <p className="text-xl font-black text-slate-900">{stats?.totalCount ? stats.totalCount - stats.completedCount : 0}</p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next Review</span>
                </div>
                <span className="text-slate-900 font-bold">{stats?.nextDue || 'Not Scheduled'}</span>
              </div>
            </div>

            <button 
              onClick={() => router.push('/employee/assessments')}
              className="w-full mt-8 flex items-center justify-center gap-2 py-4 bg-blue-50 text-blue-600 rounded-2xl text-[13px] font-bold hover:bg-blue-600 hover:text-white transition-all group"
            >
              Assessment Hub
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Org Badges */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Building2 className="absolute -right-8 -bottom-8 w-40 h-40 opacity-5 -rotate-12" />
            
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 relative z-10">Organization</h3>
            <p className="text-xl font-bold mb-1 relative z-10">{organizationName}</p>
            <p className="text-sm text-slate-400 font-medium mb-6 relative z-10">Member since {startDate ? new Date(startDate).getFullYear() : '2024'}</p>
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-300">Verified Employee</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-slate-300">Enterprise Access</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 text-rose-500 bg-white border border-rose-100 rounded-2xl text-[13px] font-bold hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all group shadow-sm"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out Securely
          </button>
        </div>

        {/* Main Profile Sections */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section: Personal Information */}
          <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                <p className="text-sm text-slate-500 font-medium">Basic contact and identity details.</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                <User className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className={cn(
                      "w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-[14px] font-semibold transition-all outline-none",
                      isEditing ? "focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200" : "opacity-70 cursor-not-allowed"
                    )}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Name</label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={formData.preferredName}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredName: e.target.value }))}
                    className={cn(
                      "w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-[14px] font-semibold transition-all outline-none",
                      isEditing ? "focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200" : "opacity-70 cursor-not-allowed"
                    )}
                    placeholder="What should we call you?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    disabled
                    value={email || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-[14px] font-semibold opacity-70 cursor-not-allowed outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium ml-1 italic">HR managed field. Contact admin to change.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel" 
                    disabled={!isEditing}
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className={cn(
                      "w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-[14px] font-semibold transition-all outline-none",
                      isEditing ? "focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200" : "opacity-70 cursor-not-allowed"
                    )}
                    placeholder="+44 (0) 000 000 000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Employment Details (Read Only) */}
          <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Employment Details</h2>
                <p className="text-sm text-slate-500 font-medium">Your role and position within the organization.</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Building2 className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Department</p>
                  <p className="text-[15px] font-bold text-slate-900">{department || 'Global Operations'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Line Manager</p>
                  <p className="text-[15px] font-bold text-slate-900">{managerName || 'HR Department'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Employment Type</p>
                  <p className="text-[15px] font-bold text-slate-900">{employmentType || 'Full-time Permanent'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Start Date</p>
                  <p className="text-[15px] font-bold text-slate-900">{startDate ? new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Official Employee ID</p>
                  <p className="text-[15px] font-bold text-slate-900">{employeeIdOfficial || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[15px] font-bold text-emerald-600">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[12px] text-blue-700 leading-relaxed font-medium">
                Employment details are controlled by your organization's HR department. If any information is incorrect, please contact your local HR manager or open a support ticket.
              </p>
            </div>
          </div>

          {/* Account Security (Quick Glance) */}
          <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Security & Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                    <Shield className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Multi-Factor Authentication</p>
                    <p className="text-[11px] text-slate-500 font-medium">Additional layer of account protection.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md text-[9px] font-bold uppercase tracking-wider">Disabled</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                    <Bell className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Notification Settings</p>
                    <p className="text-[11px] text-slate-500 font-medium">Manage email and push alerts.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
