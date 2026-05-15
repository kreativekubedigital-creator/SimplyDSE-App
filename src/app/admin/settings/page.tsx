'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Globe, Shield, Database, Server, Key, Mail, Bell, Activity,
  Save, RotateCcw, Cloud, Lock, Eye, Trash2, CheckCircle2, User
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { updateProfileAction } from '@/app/actions/update-profile';

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  autoProvisionStorage: boolean;
  subdomainIsolation: boolean;
  multiRegionReplication: boolean;
}

export default function AdminSettingsPage() {
  const profile = useProfile();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile edit state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Platform settings (stored in a simple approach)
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'SimplyDSE',
    supportEmail: 'support@simplydse.online',
    autoProvisionStorage: true,
    subdomainIsolation: true,
    multiRegionReplication: false,
  });

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!profile.loading) {
      setFullName(profile.fullName || '');
      setEmail(profile.email || '');
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile.loading, profile.fullName, profile.email, profile.avatarUrl]);

  async function handleSaveProfile() {
    if (!profile.id) return;
    setProfileSaving(true);
    const result = await updateProfileAction({ fullName });
    
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert('Failed to save: ' + (result.error || 'Unknown error'));
    }
    setProfileSaving(false);
  }

  async function handleChangePassword() {
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 5000);
    }
  }

  function toggleSetting(key: keyof PlatformSettings) {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const tabs = [
    { id: 'general', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security & Password', icon: Lock },
    { id: 'platform', label: 'Platform Identity', icon: Globe },
    { id: 'infrastructure', label: 'Infrastructure', icon: Server },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-[13px] text-slate-500 mt-1">Manage your profile, security, and platform configuration.</p>
        </div>
        
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[13px] font-bold animate-in slide-in-from-top duration-300">
            <CheckCircle2 className="w-4 h-4" />
            Changes saved successfully
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-[13px] font-bold transition-all",
                activeTab === item.id ? "bg-white text-brand-primary shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Settings Panel */}
        <div className="lg:col-span-9 space-y-10">
          
          {/* MY PROFILE */}
          {activeTab === 'general' && (
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900">My Profile</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Update your personal information.</p>
                </div>
              </div>

              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                  {profile.initials}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{profile.fullName || 'Loading...'}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{profile.email}</p>
                  <p className="text-xs text-brand-primary font-bold mt-1 uppercase tracking-wider">{profile.roleLabel}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Email</label>
                  <input type="email" value={email} disabled className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-[14px] text-slate-500 outline-none cursor-not-allowed" />
                  <p className="text-[11px] text-slate-400">Email cannot be changed here.</p>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button onClick={handleSaveProfile} disabled={profileSaving} className="px-8 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50">
                  <Save className="w-4 h-4 inline-block mr-2" />
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </section>
          )}

          {/* SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900">Change Password</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Update your authentication credentials.</p>
                </div>
              </div>

              <div className="space-y-6 max-w-md">
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-type new password" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all" />
                </div>
                
                {passwordError && <p className="text-sm text-rose-600 font-medium">{passwordError}</p>}
                {passwordSuccess && <p className="text-sm text-emerald-600 font-bold">Password updated successfully!</p>}

                <button onClick={handleChangePassword} className="px-8 py-3 bg-slate-900 text-white text-[12px] font-bold rounded-xl shadow-xl hover:scale-[1.02] transition-all">
                  <Lock className="w-4 h-4 inline-block mr-2" />
                  Update Password
                </button>
              </div>
            </section>
          )}

          {/* PLATFORM IDENTITY */}
          {activeTab === 'platform' && (
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900">Platform Identity</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Manage global branding and public appearance.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Platform Name</label>
                  <input type="text" value={settings.platformName} onChange={e => setSettings(s => ({ ...s, platformName: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Global Support Email</label>
                  <input type="email" value={settings.supportEmail} onChange={e => setSettings(s => ({ ...s, supportEmail: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all" />
                </div>
              </div>
            </section>
          )}

          {/* INFRASTRUCTURE */}
          {activeTab === 'infrastructure' && (
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900">Resource Provisioning</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Automatic infrastructure allocation rules for new Workspaces.</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { key: 'autoProvisionStorage' as const, label: 'Auto-Provision Storage', desc: 'Automatically create isolated storage for new orgs' },
                  { key: 'subdomainIsolation' as const, label: 'Subdomain Isolation', desc: 'Enforce workspace-specific entry points (*.simplydse.online)' },
                  { key: 'multiRegionReplication' as const, label: 'Multi-Region Replication', desc: 'Replicate data across EU and US nodes by default' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-[14px] font-bold text-slate-900">{item.label}</p>
                      <p className="text-[12px] text-slate-400 mt-1">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => toggleSetting(item.key)}
                      className={cn("w-12 h-6 rounded-full transition-all relative", settings[item.key] ? "bg-brand-primary" : "bg-slate-200")}
                    >
                      <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", settings[item.key] ? "left-7" : "left-1")} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* DANGER ZONE */}
          {activeTab === 'danger' && (
            <section className="bg-red-50/50 border border-red-100 rounded-[2.5rem] p-10 space-y-8">
              <div className="flex items-center gap-4 text-red-600">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold">Maintenance & Recovery</h3>
                  <p className="text-[13px] text-red-900/50 mt-1">Irreversible platform actions and system resets.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={async () => {
                    if (confirm('This will delete all read notifications. Continue?')) {
                      await supabase.from('notifications').delete().eq('is_read', true);
                      alert('Stale notifications purged.');
                    }
                  }}
                  className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-red-600/20 hover:scale-[1.02] transition-all"
                >
                  Purge Read Notifications
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
