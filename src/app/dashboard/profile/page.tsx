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
  CheckCircle2,
  Lock,
  Smartphone,
  Globe
} from 'lucide-react';
import { updateProfileAction } from '@/app/actions/update-profile';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function HRProfilePage() {
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Admin Header */}
      <div className="relative h-64 bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="absolute -bottom-16 left-12 flex items-end gap-8">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl">
              <div className="w-full h-full rounded-[2rem] bg-slate-50 flex items-center justify-center text-4xl font-black text-slate-900 border border-slate-100">
                {initials}
              </div>
            </div>
            <button className="absolute bottom-4 right-4 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-8 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-white tracking-tight">{fullName}</h1>
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                {roleLabel}
              </span>
            </div>
            <p className="text-slate-400 font-medium text-lg">{designation || 'Administrator'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-20 pt-8">
        {/* Left: Quick Settings & Security */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Security Settings</h3>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900">Change Password</p>
                    <p className="text-[11px] text-slate-400 font-medium">Updated 3 months ago</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900">2FA Settings</p>
                    <p className="text-[11px] text-emerald-500 font-bold">Enabled</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900">Active Sessions</p>
                    <p className="text-[11px] text-slate-400 font-medium">2 devices connected</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500" />
              </button>
            </div>

            <hr className="border-slate-100" />

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 text-rose-600 bg-rose-50 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all group shadow-sm"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Terminate Session
            </button>
          </div>

          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Shield className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <h4 className="text-xs font-black opacity-60 uppercase tracking-[0.2em] mb-4">Account Tier</h4>
              <p className="text-3xl font-black mb-3 tracking-tighter">Enterprise Admin</p>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">You have full administrative privileges for {organizationName}.</p>
              <button className="flex items-center gap-2 text-blue-400 text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors group/btn">
                View Permissions <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Detailed Info */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Administrative Profile</h2>
                <p className="text-[13px] text-slate-500 font-medium mt-1">Updates here will be reflected across the platform and in audit logs.</p>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[12px] font-bold hover:scale-105 transition-all shadow-xl shadow-slate-900/10"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className={cn(
                        "w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-[15px] font-bold transition-all outline-none",
                        isEditing ? "focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 border-blue-100" : "opacity-70 cursor-not-allowed"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="email" 
                      disabled
                      value={email || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-[15px] font-bold opacity-70 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Organization</label>
                  <div className="relative">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text" 
                      disabled
                      value={organizationName || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-[15px] font-bold opacity-70 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Designation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text" 
                      disabled
                      value={designation || 'Account Administrator'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-[15px] font-bold opacity-70 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-4 pt-8 border-t border-slate-100">
                  <button 
                    disabled={isSaving}
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Commit Changes
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setNewName(fullName || '');
                    }}
                    className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Log Preview */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Recent Activity</h3>
              <button className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline">Full Audit Log</button>
            </div>
            <div className="space-y-6">
              {[
                { action: 'Updated Organization Branding', time: '2 hours ago', icon: Building2 },
                { action: 'Authorized New Employee Access', time: '5 hours ago', icon: User },
                { action: 'Modified Compliance Workflow', time: 'Yesterday', icon: Shield },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">{activity.action}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{activity.time}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-using Lucide components not imported above for the UI
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
