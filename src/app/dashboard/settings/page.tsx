'use client';

import React from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Users, 
  GitBranch, 
  Lock, 
  Building2, 
  Globe, 
  Mail, 
  Database, 
  Save,
  CheckCircle2,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { LogoUpload } from '@/components/dashboard/LogoUpload';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { organizationId, organizationName, role, loading: profileLoading } = useProfile();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('General');
  
  const [settings, setSettings] = React.useState({
    name: '',
    industry: '',
    subdomain: '',
    language: 'English (UK)',
    timezone: 'London (GMT)',
    logoUrl: null as string | null,
    mandatoryReview: true,
    automatedEscalation: true,
    peerReview: false,
    riskThreshold: 75,
    // Automation Rules
    highRiskAlert: true,
    highRiskThreshold: 80,
    reassignmentInterval: 12,
    escalationSLA: 48
  });

  React.useEffect(() => {
    async function fetchOrgSettings() {
      if (!organizationId) return;
      
      try {
        setLoading(true);
        const { data: org, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationId)
          .single();
        
        if (error) throw error;
        
        if (org) {
          const branding = org.branding || {};
          setSettings({
            name: org.name || '',
            industry: org.industry || '',
            subdomain: org.subdomain || '',
            logoUrl: org.logo_url,
            language: branding.language || 'English (UK)',
            timezone: branding.timezone || 'London (GMT)',
            mandatoryReview: branding.mandatoryReview ?? true,
            automatedEscalation: branding.automatedEscalation ?? true,
            peerReview: branding.peerReview ?? false,
            riskThreshold: branding.riskThreshold ?? 75,
            highRiskAlert: branding.highRiskAlert ?? true,
            highRiskThreshold: branding.highRiskThreshold ?? 80,
            reassignmentInterval: branding.reassignmentInterval ?? 12,
            escalationSLA: branding.escalationSLA ?? 48
          });
        }
      } catch (err) {
        console.error('Error fetching org settings:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!profileLoading) {
      fetchOrgSettings();
    }
  }, [organizationId, profileLoading]);

  const handleSave = async () => {
    if (!organizationId) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('organizations')
        .update({
          name: settings.name,
          industry: settings.industry,
          subdomain: settings.subdomain,
          updated_at: new Date().toISOString(),
          branding: {
            language: settings.language,
            timezone: settings.timezone,
            mandatoryReview: settings.mandatoryReview,
            automatedEscalation: settings.automatedEscalation,
            peerReview: settings.peerReview,
            riskThreshold: settings.riskThreshold,
            highRiskAlert: settings.highRiskAlert,
            highRiskThreshold: settings.highRiskThreshold,
            reassignmentInterval: settings.reassignmentInterval,
            escalationSLA: settings.escalationSLA
          }
        })
        .eq('id', organizationId);

      if (error) throw error;
      alert('Settings updated successfully.');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const isSuperAdmin = role === 'super_admin';

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">{settings.name || organizationName} Settings</h2>
          <p className="text-[14px] text-slate-500 font-medium">Configure Organisation-wide compliance rules, notification preferences, and team permissions.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[14px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <span className="w-4.5 h-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4.5 h-4.5" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <SettingsTab icon={Building2} label="General" active={activeTab === 'General'} onClick={() => setActiveTab('General')} />
          <SettingsTab icon={ShieldCheck} label="Compliance Rules" active={activeTab === 'Compliance Rules'} onClick={() => setActiveTab('Compliance Rules')} />
          <SettingsTab icon={Zap} label="Automation Rules" active={activeTab === 'Automation Rules'} onClick={() => setActiveTab('Automation Rules')} />
          <SettingsTab icon={Bell} label="Notifications" active={activeTab === 'Notifications'} onClick={() => setActiveTab('Notifications')} />
          <SettingsTab icon={Users} label="User Management" active={activeTab === 'User Management'} onClick={() => setActiveTab('User Management')} />
          
          {isSuperAdmin && (
            <>
              <SettingsTab icon={Lock} label="Security & API" active={activeTab === 'Security & API'} onClick={() => setActiveTab('Security & API')} />
              <SettingsTab icon={Database} label="Data & Retention" active={activeTab === 'Data & Retention'} onClick={() => setActiveTab('Data & Retention')} />
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          {activeTab === 'General' && (
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-lg font-bold text-slate-900 mb-6">General Information</h3>
              <div className="space-y-8">
                {organizationId && (
                  <LogoUpload 
                    organizationId={organizationId} 
                    initialLogoUrl={settings.logoUrl}
                    onUploadComplete={(newUrl) => setSettings(s => ({ ...s, logoUrl: newUrl }))}
                  />
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                  <InputGroup 
                    label="Organisation Name" 
                    value={settings.name} 
                    onChange={(e: any) => setSettings(s => ({ ...s, name: e.target.value }))}
                  />
                  <InputGroup 
                    label="Industry" 
                    value={settings.industry} 
                    onChange={(e: any) => setSettings(s => ({ ...s, industry: e.target.value }))}
                    placeholder="e.g. Healthcare, Technology"
                  />
                </div>
                <InputGroup 
                  label="Primary Domain" 
                  value={settings.subdomain} 
                  onChange={(e: any) => setSettings(s => ({ ...s, subdomain: e.target.value }))}
                  placeholder="e.g. techcorp.com"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-1">Language</label>
                    <select 
                      value={settings.language}
                      onChange={(e) => setSettings(s => ({ ...s, language: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option>English (UK)</option>
                      <option>English (US)</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-1">Timezone</label>
                    <select 
                      value={settings.timezone}
                      onChange={(e) => setSettings(s => ({ ...s, timezone: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option>London (GMT)</option>
                      <option>New York (EST)</option>
                      <option>San Francisco (PST)</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'Compliance Rules' && (
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Compliance Defaults</h3>
              <p className="text-[13px] text-slate-400 font-medium mb-8">Set global defaults for assessments and risk thresholds.</p>
              
              <div className="space-y-6">
                <ToggleItem 
                  title="Mandatory Annual Review" 
                  desc="Automatically assign new DSE assessments every 12 months."
                  active={settings.mandatoryReview}
                  onClick={() => setSettings(s => ({ ...s, mandatoryReview: !s.mandatoryReview }))}
                />
                <ToggleItem 
                  title="Automated Escalation" 
                  desc="Escalate high-risk assessments to HR if unresolved after 48h."
                  active={settings.automatedEscalation}
                  onClick={() => setSettings(s => ({ ...s, automatedEscalation: !s.automatedEscalation }))}
                />
                <ToggleItem 
                  title="Employee Peer Review" 
                  desc="Allow team leads to review their department's compliance status."
                  active={settings.peerReview}
                  onClick={() => setSettings(s => ({ ...s, peerReview: !s.peerReview }))}
                />
                
                <div className="pt-6 border-t border-slate-50">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-1">Risk Threshold (%)</label>
                  <div className="flex items-center gap-4 mt-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={settings.riskThreshold}
                      onChange={(e) => setSettings(s => ({ ...s, riskThreshold: parseInt(e.target.value) }))}
                      className="flex-1 accent-blue-600" 
                    />
                    <span className="w-12 text-center font-bold text-slate-900">{settings.riskThreshold}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-2">Scores below this value will trigger a 'High Risk' status.</p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'Automation Rules' && (
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Automation Rules</h3>
              <p className="text-[13px] text-slate-400 font-medium mb-8">Set smart rules to automate compliance actions and alerts.</p>
              
              <div className="space-y-6">
                {/* High Risk Alert Rule */}
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-900">High Risk Notifications</p>
                        <p className="text-[11px] text-slate-500 font-medium">Triggered by assessment score</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSettings(s => ({ ...s, highRiskAlert: !s.highRiskAlert }))}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-all",
                        settings.highRiskAlert ? "bg-blue-600" : "bg-slate-300"
                      )}
                    >
                      <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all", settings.highRiskAlert ? "left-5.5" : "left-0.5")} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Trigger Score (%)</p>
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        value={settings.highRiskThreshold}
                        onChange={(e) => setSettings(s => ({ ...s, highRiskThreshold: parseInt(e.target.value) }))}
                        className="w-full accent-blue-600" 
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">{settings.highRiskThreshold}%</span>
                  </div>
                </div>

                {/* Reassignment Rule */}
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <RefreshCcw className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-900">Auto-Reassignment Cycle</p>
                      <p className="text-[11px] text-slate-500 font-medium">Ensure continuous compliance checks</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interval</label>
                      <select 
                        value={settings.reassignmentInterval}
                        onChange={(e) => setSettings(s => ({ ...s, reassignmentInterval: parseInt(e.target.value) }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none"
                      >
                        <option value={6}>Every 6 Months</option>
                        <option value={12}>Every 12 Months</option>
                        <option value={24}>Every 24 Months</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action</label>
                      <div className="px-4 py-2.5 bg-white/50 border border-slate-100 rounded-xl text-sm text-slate-400 font-medium italic">
                        Re-assign Assessment
                      </div>
                    </div>
                  </div>
                </div>

                {/* Escalation Rule */}
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-900">Escalation SLA</p>
                      <p className="text-[11px] text-slate-500 font-medium">Auto-escalate overdue risks</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[12px] text-slate-600">If a high-risk assessment is not resolved within:</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={settings.escalationSLA}
                        onChange={(e) => setSettings(s => ({ ...s, escalationSLA: parseInt(e.target.value) }))}
                        className="w-20 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none"
                      />
                      <span className="text-sm font-bold text-slate-500">Hours</span>
                      <div className="flex-1 text-right">
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">Action: Escalate to HR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'Notifications' && (
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Organisation Notifications</h3>
              <p className="text-[13px] text-slate-400 font-medium mb-8">Configure system-wide notification defaults.</p>
              <div className="space-y-6">
                <ToggleItem title="Email Reminders" desc="Send automated email reminders for pending assessments." active />
                <ToggleItem title="High Risk Alerts" desc="Notify HR managers instantly when a high-risk score is recorded." active />
                <ToggleItem title="Monthly Digest" desc="Send a summary report of organisation compliance to administrators." />
              </div>
            </section>
          )}

          {activeTab === 'User Management' && (
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">User Management Preferences</h3>
                  <p className="text-[13px] text-slate-400 font-medium">Configure default roles and access levels for new users.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-1">Default Role for New Users</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>Employee</option>
                    <option>Manager</option>
                  </select>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">New users will be assigned this role by default upon invitation.</p>
                </div>
                <ToggleItem title="Allow Self-Registration" desc="Let employees create their own accounts using an organisation email." />
                <ToggleItem title="Department Requirement" desc="Require a department to be assigned before an assessment is started." active />
              </div>
            </section>
          )}

          {/* Danger Zone - Only show on General tab for context */}
          {activeTab === 'General' && (
            <section className="bg-rose-50/50 border border-rose-100 rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <h3 className="text-lg font-bold text-rose-900 mb-2">Danger Zone</h3>
              <p className="text-[13px] text-rose-600/60 font-medium mb-8">Irreversible actions that affect Organisation data.</p>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-white border border-rose-100 rounded-2xl hover:bg-rose-100/50 transition-all group">
                  <div className="text-left">
                    <p className="text-[14px] font-bold text-rose-900">Archive All Data</p>
                    <p className="text-[11px] text-rose-600/60 font-medium mt-1">Export and move all current data to historical storage.</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-rose-300 group-hover:translate-x-1 transition-transform" />
                </button>
                {isSuperAdmin && (
                  <button className="w-full flex items-center justify-between p-4 bg-white border border-rose-100 rounded-2xl hover:bg-rose-100/50 transition-all group">
                    <div className="text-left">
                      <p className="text-[14px] font-bold text-rose-900">Delete Organisation</p>
                      <p className="text-[11px] text-rose-600/60 font-medium mt-1">Permanently remove all data and Organisation settings.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-rose-300 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
        active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
        <span className="text-[14px] font-bold">{label}</span>
      </div>
      <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 transition-all", active && "opacity-100")} />
    </button>
  );
}

function InputGroup({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-1">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      />
    </div>
  );
}

function ToggleItem({ title, desc, active, onClick }: any) {
  return (
    <div className="flex items-start justify-between gap-4 p-1">
      <div className="flex-1">
        <p className="text-[14px] font-bold text-slate-900">{title}</p>
        <p className="text-[12px] text-slate-500 font-medium mt-1">{desc}</p>
      </div>
      <button 
        onClick={onClick}
        className={cn(
          "w-12 h-6 rounded-full relative transition-all duration-300 shrink-0",
          active ? "bg-blue-600" : "bg-slate-200"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
          active ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}
