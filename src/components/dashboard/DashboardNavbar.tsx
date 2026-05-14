'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown,
  X,
  Check
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function DashboardNavbar() {
  const { fullName, initials, designation, roleLabel, organizationId, loading } = useProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from database
  useEffect(() => {
    if (!organizationId) return;

    async function fetchNotifications() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    }

    fetchNotifications();

    // Real-time subscription for new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `organization_id=eq.${organizationId}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [organizationId]);

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (!organizationId) return;
    await supabase.from('notifications').update({ is_read: true }).eq('organization_id', organizationId).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Display designation if available, otherwise fall back to role label
  const subtitle = designation || roleLabel;

  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search employees, assessments, departments..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-3 text-[13px] font-medium placeholder:text-text-muted focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifPanel(!showNotifPanel)}
            className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <div className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
              </div>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifPanel && (
            <div className="absolute right-0 top-full mt-2 w-[380px] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/50 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-[14px] font-bold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-[13px] text-text-muted font-medium">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => !notif.is_read && markAsRead(notif.id)}
                      className={cn(
                        "px-5 py-3.5 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50",
                        !notif.is_read && "bg-blue-50/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!notif.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                            <p className={cn("text-[12px] font-semibold truncate", notif.is_read ? "text-slate-600" : "text-slate-900")}>
                              {notif.title}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium flex-shrink-0 mt-0.5">{timeAgo(notif.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200" />

        {/* User Profile */}
        <button className="flex items-center gap-3 pl-2 group">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            {loading ? '...' : initials}
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-[13px] font-bold text-slate-900 leading-none">
              {loading ? 'Loading...' : fullName}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {loading ? '...' : subtitle}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-slate-600 transition-colors ml-1" />
        </button>
      </div>
    </header>
  );
}
