'use client';

import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  ChevronRight,
  MoreVertical,
  Activity,
  Zap,
  Shield
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../components/admin/StatCard';
import { supabase } from '@/lib/supabase';

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  organizations: {
    name: string;
  };
  profiles: {
    full_name: string;
  } | null;
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchTickets() {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            id,
            subject,
            status,
            priority,
            created_at,
            organizations ( name ),
            profiles ( full_name )
          `)
          .order('created_at', { ascending: false });

        if (data) setTickets(data as any);
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();

    // Real-time subscription
    const channel = supabase
      .channel('tickets-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tickets' 
      }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.organizations.name.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    critical: tickets.filter(t => t.priority === 'critical').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Support Queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Global Support Queue</h1>
            <p className="text-[13px] text-slate-500 mt-1">Manage cross-tenant support escalations, mission-critical tickets, and SLA performance.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
              Performance Analytics
            </button>
            <button className="px-6 py-3 bg-slate-900 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all active:scale-95">
              Escalate Ticket
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Open Tickets" 
            value={stats.open.toString()} 
            change="Live" 
            trend="neutral" 
            icon={Ticket} 
          />
          <StatCard 
            label="In Progress" 
            value={stats.inProgress.toString()} 
            change="Active" 
            trend="up" 
            icon={Clock} 
          />
          <StatCard 
            label="Critical Priority" 
            value={stats.critical.toString()} 
            change="Escalated" 
            trend="down" 
            icon={Shield} 
          />
          <StatCard 
            label="Resolution Rate" 
            value={tickets.length > 0 ? Math.round((stats.resolved / tickets.length) * 100) + '%' : '0%'} 
            change="Global" 
            trend="up" 
            icon={CheckCircle2} 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Main Queue */}
          <div className="xl:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-[18px] font-bold text-slate-900">Escalation Queue</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search tickets..."
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] outline-none w-48 focus:ring-2 focus:ring-brand-primary/5 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ticket ID</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subject & Tenant</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-[14px] font-bold text-slate-900">{ticket.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{new Date(ticket.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[14px] font-bold text-slate-900">{ticket.subject}</p>
                        <p className="text-[11px] text-brand-primary font-bold mt-1 uppercase tracking-widest">{ticket.organizations.name}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                          ticket.priority === 'critical' ? "bg-red-50 text-red-600 border-red-100" :
                          ticket.priority === 'high' ? "bg-orange-50 text-orange-600 border-orange-100" :
                          "bg-blue-50 text-blue-600 border-blue-100"
                        )}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 relative group/status">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            ticket.status === 'open' ? "bg-red-500" :
                            ticket.status === 'in_progress' ? "bg-blue-500" :
                            ticket.status === 'resolved' ? "bg-emerald-500" : "bg-slate-300"
                          )} />
                          <select 
                            value={ticket.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                const { error } = await supabase
                                  .from('tickets')
                                  .update({ status: newStatus })
                                  .eq('id', ticket.id);
                                
                                if (error) throw error;
                                
                                // Update local state
                                setTickets(prev => prev.map(t => 
                                  t.id === ticket.id ? { ...t, status: newStatus } : t
                                ));
                              } catch (err) {
                                console.error('Failed to update ticket status:', err);
                              }
                            }}
                            className="text-[13px] font-medium text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-brand-primary transition-colors appearance-none capitalize"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-brand-primary transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                        No tickets matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SLA Performance */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-900/20 space-y-8">
              <h3 className="text-[18px] font-bold">SLA Health</h3>
              <div className="space-y-6">
                {[
                  { label: 'P1 - Critical', val: 100 },
                  { label: 'P2 - High', val: 98 },
                  { label: 'P3 - Medium', val: 94 },
                  { label: 'P4 - Low', val: 82 },
                ].map((sla, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-white/50">{sla.label}</span>
                      <span className="text-emerald-400">{sla.val}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${sla.val}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-6">
              <h3 className="text-[16px] font-bold text-slate-900">Support Team</h3>
              <div className="space-y-5">
                {[
                  { name: 'Alex Rivera', role: 'Level 3 Lead', online: true },
                  { name: 'Sarah Jenkins', role: 'Cloud Engineer', online: true },
                  { name: 'Mike Wilson', role: 'IAM Specialist', online: false },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary/5 group-hover:text-brand-primary transition-all">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900">{member.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{member.role}</p>
                      </div>
                    </div>
                    <div className={cn("w-2 h-2 rounded-full", member.online ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-200")} />
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-slate-50 text-slate-600 text-[12px] font-bold rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all">
                Shift Schedule
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
