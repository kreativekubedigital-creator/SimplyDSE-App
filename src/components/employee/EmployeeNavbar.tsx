'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  HelpCircle, 
  ChevronDown,
  Search,
  Zap
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function EmployeeNavbar() {
  const { fullName, initials, roleLabel, loading, organizationId, id: userId } = useProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId || !organizationId) return;

    async function fetchNotifications() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    }

    fetchNotifications();

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, organizationId]);

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

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const firstName = fullName?.split(' ')[0] || 'User';

  return (
    <header className="h-[80px] bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-10 sticky top-0 z-40">
      {/* Welcome Message */}
      <div className="flex flex-col">
        <h2 className="text-[20px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Welcome back, {loading ? '...' : firstName} 👋
        </h2>
        <p className="text-[13px] text-text-muted font-medium">Here's an overview of your assessments and workplace health.</p>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-text-muted hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
          
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="p-2.5 text-text-muted hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative group"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-[8px] font-bold text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </div>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifPanel && (
              <div className="absolute right-0 top-full mt-2 w-[320px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-[13px] font-bold text-slate-900">Notifications</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-[12px] text-text-muted">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                        className={cn(
                          "px-5 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors",
                          !notif.is_read && "bg-blue-50/30"
                        )}
                      >
                        <p className={cn("text-[12px] font-bold", notif.is_read ? "text-slate-600" : "text-slate-900")}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <span className="text-[9px] text-text-muted mt-1 block font-medium">{timeAgo(notif.created_at)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200/60" />

        <button className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              {loading ? '...' : initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-[13px] font-bold text-slate-900 leading-none">
              {loading ? 'Loading...' : fullName}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {loading ? '...' : roleLabel}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-slate-600 transition-colors ml-1" />
        </button>
      </div>
    </header>
  );
}
