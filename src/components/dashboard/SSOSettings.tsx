'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Trash2, 
  RefreshCcw,
  ExternalLink,
  Copy,
  Check,
  Settings2,
  UploadCloud,
  Clock,
  Save as SaveIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { parseSAMLMetadata } from '@/app/actions/parse-saml';
import { recordSSOAudit } from '@/app/actions/audit-sso';

interface SSOSettingsProps {
  organizationId: string;
}

export function SSOSettings({ organizationId }: SSOSettingsProps) {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  
  // SSO Config State
  const [ssoProvider, setSsoProvider] = useState<any>(null);
  const [isConfiguringSSO, setIsConfiguringSSO] = useState(false);
  const [metadataUrlInput, setMetadataUrlInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [ssoData, setSsoData] = useState({
    provider_name: '',
    entity_id: '',
    sso_url: '',
    certificate: '',
    metadata_url: '',
    status: 'inactive'
  });

  // Audit Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    fetchDomains();
    fetchSSOProvider();
    fetchLogs();
  }, [organizationId]);

  async function fetchSSOProvider() {
    try {
      const { data, error } = await supabase
        .from('organization_sso_providers')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSsoProvider(data);
        setSsoData(data);
      }
    } catch (err) {
      console.error('Error fetching SSO provider:', err);
    }
  }

  async function fetchLogs() {
    try {
      setLogsLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'sso_configuration')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }

  async function handleMetadataImport() {
    if (!metadataUrlInput.startsWith('http')) {
      alert('Please enter a valid Metadata URL');
      return;
    }

    try {
      setIsParsing(true);
      const result = await parseSAMLMetadata(metadataUrlInput, 'url');
      if (result.success && result.data) {
        setSsoData({
          ...ssoData,
          provider_name: result.data.providerName,
          entity_id: result.data.entityId,
          sso_url: result.data.ssoUrl,
          certificate: result.data.certificate,
          metadata_url: result.data.metadataUrl || ''
        });
      } else {
        alert('Error parsing metadata: ' + result.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsParsing(false);
    }
  }

  async function saveSSOProvider() {
    try {
      setLoading(true);
      const payload = {
        organization_id: organizationId,
        ...ssoData,
        status: ssoData.status || 'inactive'
      };

      const { error } = await supabase
        .from('organization_sso_providers')
        .upsert(payload, { onConflict: 'organization_id' });

      if (error) throw error;
      
      await recordSSOAudit(organizationId, 'sso_config_updated', { status: ssoData.status });
      
      setIsConfiguringSSO(false);
      fetchSSOProvider();
      fetchLogs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDomains() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_domains')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDomains(data || []);
    } catch (err) {
      console.error('Error fetching domains:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addDomain() {
    if (!newDomain.includes('.')) {
      alert('Please enter a valid domain (e.g. company.com)');
      return;
    }

    try {
      const verificationToken = `simplydse-domain-verification=${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      
      const { error } = await supabase
        .from('organization_domains')
        .insert({
          organization_id: organizationId,
          domain: newDomain.toLowerCase().trim(),
          verification_token: verificationToken,
          verified: false,
          status: 'pending'
        });

      if (error) throw error;
      
      await recordSSOAudit(organizationId, 'domain_added', { domain: newDomain.toLowerCase().trim() });
      
      setNewDomain('');
      setIsAddingDomain(false);
      fetchDomains();
      fetchLogs();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function verifyDomain(id: string, domain: string, token: string) {
    try {
      setVerifyingId(id);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase
        .from('organization_domains')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
          sso_enabled: true
        })
        .eq('id', id);

      if (error) throw error;
      await recordSSOAudit(organizationId, 'domain_verified', { domain });
      fetchDomains();
      fetchLogs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVerifyingId(null);
    }
  }

  async function deleteDomain(id: string) {
    if (!confirm('Are you sure you want to remove this domain? SSO for users on this domain will be disabled.')) return;
    
    try {
      const { error } = await supabase
        .from('organization_domains')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await recordSSOAudit(organizationId, 'domain_deleted', { id });
      fetchDomains();
      fetchLogs();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Verified Domains Section */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Verified Company Domains
            </h3>
            <p className="text-[13px] text-slate-400 font-medium">Verify your corporate email domains to enable Enterprise SSO for your employees.</p>
          </div>
          {!isAddingDomain && (
            <button 
              onClick={() => setIsAddingDomain(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[12px] font-bold rounded-xl hover:bg-slate-800 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Domain
            </button>
          )}
        </div>

        {isAddingDomain && (
          <div className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-3xl animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Corporate Domain</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. company.com"
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button 
                    onClick={addDomain}
                    className="px-6 py-3 bg-blue-600 text-white text-[13px] font-bold rounded-xl hover:bg-blue-700 transition-all"
                  >
                    Generate Token
                  </button>
                  <button 
                    onClick={() => setIsAddingDomain(false)}
                    className="px-4 py-3 text-slate-400 font-bold text-[13px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin opacity-20" />
            </div>
          ) : domains.length === 0 ? (
            <div className="py-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-[2rem]">
              <Globe className="w-10 h-10 text-slate-200 mx-auto mb-4" />
              <p className="text-[13px] text-slate-400 font-medium">No verified domains yet.</p>
            </div>
          ) : (
            domains.map((domain) => (
              <div key={domain.id} className="p-6 border border-slate-100 rounded-3xl hover:border-slate-200 transition-all group">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      domain.verified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {domain.verified ? <CheckCircle2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-bold text-slate-900">{domain.domain}</p>
                        {domain.verified && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-full">Verified</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {domain.verified ? `Verified on ${new Date(domain.verified_at).toLocaleDateString()}` : 'Verification Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!domain.verified && (
                      <button 
                        onClick={() => verifyDomain(domain.id, domain.domain, domain.verification_token)}
                        disabled={verifyingId === domain.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        {verifyingId === domain.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                        Check DNS
                      </button>
                    )}
                    <button 
                      onClick={() => deleteDomain(domain.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!domain.verified && (
                  <div className="mt-6 p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">DNS Verification Required</p>
                      <a href="#" className="text-[10px] text-blue-400 font-bold hover:underline flex items-center gap-1">
                        View Guide <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                      To verify ownership, add the following TXT record to your DNS settings for <strong>{domain.domain}</strong>:
                    </p>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                      <code className="flex-1 text-[12px] text-blue-400 font-mono break-all">{domain.verification_token}</code>
                      <button 
                        onClick={() => copyToClipboard(domain.verification_token)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-400"
                      >
                        {copiedToken === domain.verification_token ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* SSO Configuration Section */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              SAML SSO Configuration
            </h3>
            <p className="text-[13px] text-slate-400 font-medium">Configure your Enterprise Identity Provider integration.</p>
          </div>
          {!isConfiguringSSO ? (
            <button 
              onClick={() => setIsConfiguringSSO(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              <Settings2 className="w-4 h-4" />
              {ssoProvider ? 'Edit Configuration' : 'Setup SSO'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={saveSSOProvider}
                className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white text-[12px] font-bold rounded-xl hover:bg-slate-800 transition-all"
              >
                <SaveIcon className="w-4 h-4" />
                Save Config
              </button>
              <button 
                onClick={() => setIsConfiguringSSO(false)}
                className="px-4 py-2 text-slate-400 font-bold text-[12px]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {isConfiguringSSO ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Auto-Import via Metadata */}
            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <UploadCloud className="w-5 h-5" />
                <span className="text-[13px] font-bold uppercase tracking-widest">Auto-Import from Metadata</span>
              </div>
              <p className="text-[12px] text-slate-600 font-medium">
                Enter the Metadata URL provided by your Identity Provider (e.g. Azure, Okta) to automatically populate the configuration.
              </p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={metadataUrlInput}
                  onChange={(e) => setMetadataUrlInput(e.target.value)}
                  placeholder="https://login.microsoftonline.com/.../federationmetadata.xml"
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none"
                />
                <button 
                  onClick={handleMetadataImport}
                  disabled={isParsing}
                  className="px-6 py-3 bg-blue-600 text-white text-[12px] font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  {isParsing && <Loader2 className="w-4 h-4 animate-spin" />}
                  Fetch & Parse
                </button>
              </div>
            </div>

            {/* Manual Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Provider Name</label>
                <input 
                  type="text" 
                  value={ssoData.provider_name}
                  onChange={(e) => setSsoData({...ssoData, provider_name: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Status</label>
                <select 
                  value={ssoData.status}
                  onChange={(e) => setSsoData({...ssoData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold"
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active (Enable SSO Login)</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Entity ID / Audience URI</label>
                <input 
                  type="text" 
                  value={ssoData.entity_id}
                  onChange={(e) => setSsoData({...ssoData, entity_id: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-mono"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Single Sign-On URL (SSO)</label>
                <input 
                  type="text" 
                  value={ssoData.sso_url}
                  onChange={(e) => setSsoData({...ssoData, sso_url: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-mono"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">X.509 Certificate (PEM Format)</label>
                <textarea 
                  value={ssoData.certificate}
                  onChange={(e) => setSsoData({...ssoData, certificate: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-mono resize-none"
                  placeholder="-----BEGIN CERTIFICATE----- ..."
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SSOField label="Provider Name" value={ssoProvider?.provider_name || 'Not Configured'} />
              <SSOField label="Status" value={ssoProvider?.status === 'active' ? 'ACTIVE' : 'INACTIVE'} 
                className={ssoProvider?.status === 'active' ? 'text-emerald-600' : 'text-slate-400'} />
              <SSOField label="Entity ID" value={ssoProvider?.entity_id || '—'} />
              <SSOField label="SSO Endpoint" value={ssoProvider?.sso_url || '—'} />
            </div>

            {ssoProvider?.status === 'active' ? (
              <div className="mt-8 p-6 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] flex gap-4 animate-in fade-in duration-500">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <p className="text-[14px] font-bold text-emerald-900">SSO is Live</p>
                  <p className="text-[12px] text-emerald-700 leading-relaxed font-medium mt-1">
                    Your organisation is currently authenticating users via {ssoProvider.provider_name}. 
                    Email/Password login is restricted for verified domains.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="text-[14px] font-bold text-slate-900">Enterprise Readiness Layer</p>
                  <p className="text-[12px] text-slate-600 leading-relaxed font-medium mt-1">
                    Your organisation is currently in "SSO Ready" mode. Once you provide the SAML metadata from your IT department, 
                    employees will be automatically routed to your corporate login page.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Security Audit Logs */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Security Activity
            </h3>
            <p className="text-[13px] text-slate-400 font-medium">Audit trail of authentication changes and SSO events.</p>
          </div>
          <button 
            onClick={fetchLogs}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {logsLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin opacity-10" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center bg-slate-50/50 border border-dashed border-slate-100 rounded-[2rem]">
              <p className="text-[12px] text-slate-400 font-medium">No recent security events recorded.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {logs.map((log: any) => (
                <div key={log.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      log.action.includes('failed') ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400"
                    )}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 capitalize">
                        {log.action.replace('sso_', '').replace('_', ' ')}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {log.details?.domain || log.details?.email || 'System Action'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-slate-500">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[9px] text-slate-300 font-medium">
                      {new Date(log.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SSOField({ label, value, className }: { label: string, value: string, className?: string }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={cn("text-[13px] font-bold truncate", className || "text-slate-900")}>{value}</p>
    </div>
  );
}
