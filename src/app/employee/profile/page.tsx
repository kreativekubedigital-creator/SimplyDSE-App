'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { 
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
  CheckCircle2
} from 'lucide-react';
import { updateProfileAction } from '@/app/actions/update-profile';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function EmployeeProfilePage() {
  const { fullName, email, roleLabel, designation, organizationName, loading, initials } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(fullName || '');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (fullName) setNewName(fullName);
  }, [fullName]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProfileAction(newName);
    setIsSaving(false);
    if (result.success) {
      setIsEditing(false);
      window.location.reload(); // Refresh to update context
    } else {
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header / Banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute -bottom-12 left-10 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl">
              <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-blue-600 border border-slate-200">
                {initials}
              </div>
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-4 pb-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">{fullName}</h1>
            <p className="text-blue-100 font-medium">{designation || roleLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 pt-8">
        {/* Left Column: Stats & Meta */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Employment Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[13px]">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium leading-none mb-1">Organization</p>
                  <p className="text-slate-900 font-bold">{organizationName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[13px]">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium leading-none mb-1">Designation</p>
                  <p className="text-slate-900 font-bold">{designation || 'Not Set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[13px]">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium leading-none mb-1">Account Role</p>
                  <p className="text-slate-900 font-bold">{roleLabel}</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-rose-600 bg-rose-50 rounded-2xl text-[13px] font-bold hover:bg-rose-600 hover:text-white transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>

          <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-600/20">
            <h4 className="text-sm font-bold opacity-80 uppercase tracking-wider mb-4">Compliance Status</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">Healthy</p>
                <p className="text-[12px] opacity-80 mt-1 font-medium">All assessments completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                <p className="text-[13px] text-slate-500 font-medium mt-1">Manage your basic profile details here.</p>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[12px] font-bold hover:bg-slate-900 hover:text-white transition-all"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className={cn(
                        "w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-[14px] font-medium transition-all outline-none",
                        isEditing ? "focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200" : "opacity-70"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      disabled
                      value={email || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-[14px] font-medium opacity-70 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button 
                    disabled={isSaving}
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[13px] font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setNewName(fullName || '');
                    }}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[13px] font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Calendar className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-2">Upcoming Assessments</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-md">Stay on top of your workplace health requirements. Your next scheduled assessment is due in 3 months.</p>
              <button 
                onClick={() => router.push('/employee/assessments')}
                className="px-6 py-3 bg-white text-slate-900 rounded-2xl text-[13px] font-bold hover:bg-blue-50 transition-all"
              >
                View Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
