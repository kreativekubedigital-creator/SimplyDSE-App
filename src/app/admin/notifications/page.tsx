'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, Megaphone, Search, Mail, MessageSquare, Zap, Globe,
  MoreVertical, CheckCircle2, Plus, X, Trash2, Eye, EyeOff
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../components/admin/StatCard';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  organization_id?: string;
  organizations?: { name: string } | null;
}

export default function PlatformNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState('system');

  async function fetchNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, organizations(name)')
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
    setLoading(false);
  }

  useEffect(() => { fetchNotifications(); }, []);

  const filtered = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'unread' && !n.is_read) || (filter === 'read' && n.is_read);
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  async function handleMarkRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function handleMarkAllRead() {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  async function handleDelete(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  async function handleCreate() {
    if (!newTitle.trim() || !newMessage.trim()) return;
    setCreateLoading(true);
    const { error } = await supabase.from('notifications').insert({
      title: newTitle,
      message: newMessage,
      type: newType,
      is_read: false,
    });
    if (!error) {
      setNewTitle('');
      setNewMessage('');
      setNewType('system');
      setShowCreate(false);
      fetchNotifications();
    }
    setCreateLoading(false);
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'maintenance': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'update': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return Zap;
      case 'maintenance': return Globe;
      case 'update': return CheckCircle2;
      default: return Megaphone;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Broadcasts</h1>
          <p className="text-[13px] text-slate-500 mt-1">Manage global system announcements, automated notifications, and alert routing.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Notifications" value={notifications.length.toString()} change="All Time" trend="neutral" icon={Megaphone} />
        <StatCard label="Unread" value={unreadCount.toString()} change={unreadCount > 0 ? "Pending" : "All Clear"} trend={unreadCount > 0 ? "down" : "up"} icon={Bell} />
        <StatCard label="System Alerts" value={notifications.filter(n => n.type === 'alert').length.toString()} change="Active" trend="neutral" icon={Zap} />
        <StatCard label="Read Rate" value={notifications.length > 0 ? `${(((notifications.length - unreadCount) / notifications.length) * 100).toFixed(0)}%` : '0%'} change="Engagement" trend="up" icon={CheckCircle2} />
      </div>

      {/* Main Feed */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-[18px] font-bold text-slate-900">All Notifications</h3>
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {(['all', 'unread', 'read'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all capitalize", filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] outline-none w-48 focus:ring-2 focus:ring-brand-primary/5 transition-all" />
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="px-4 py-2 bg-brand-primary/5 text-brand-primary text-[11px] font-bold rounded-lg hover:bg-brand-primary/10 transition-all">
                Mark All Read
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.length > 0 ? filtered.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <div key={item.id} className={cn("p-8 hover:bg-slate-50 transition-colors group", !item.is_read && "bg-blue-50/20 border-l-4 border-l-brand-primary")}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5 flex-1 min-w-0">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 shrink-0", getTypeStyles(item.type))}>
                      <TypeIcon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-[15px] truncate">{item.title}</p>
                      <p className="text-[13px] text-slate-500 mt-1 line-clamp-2">{item.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border", getTypeStyles(item.type))}>{item.type}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {item.organizations?.name && <span className="text-[11px] text-slate-400">• {item.organizations.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!item.is_read && (
                      <button onClick={() => handleMarkRead(item.id)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all" title="Mark as read">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="p-20 text-center">
              <Bell className="w-10 h-10 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">No notifications found</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Create Announcement</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Notification title..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Message</label>
                  <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={4} placeholder="Notification message..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                  <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all appearance-none">
                    <option value="system">System</option>
                    <option value="alert">Alert</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="update">Update</option>
                  </select>
                </div>
              </div>
              <div className="p-8 border-t border-slate-100 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={handleCreate} disabled={createLoading || !newTitle.trim()} className="flex-1 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                  {createLoading ? 'Creating...' : 'Publish Notification'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
