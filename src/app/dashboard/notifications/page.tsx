'use client';

import React from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
  Calendar,
  Settings,
  Mail,
  User,
  Zap,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useProfile } from '@/hooks/useProfile';

const notifications = [
  { id: 1, title: 'Overdue Assessment Escalation', message: 'The assessment for Alice Thompson has been escalated to HR due to 48h non-response.', type: 'critical', time: '2 mins ago', read: false, sender: 'System' },
  { id: 2, title: 'New Risk Report Submitted', message: 'A high-priority risk report was submitted by the Engineering department regarding lumbar support.', type: 'high', time: '45 mins ago', read: false, sender: 'Bob Smith' },
  { id: 3, title: 'Scheduled Report Ready', message: 'Your Quarterly Compliance Audit report for Q1 2024 is now available for download.', type: 'info', time: '2 hours ago', read: true, sender: 'Reports Engine' },
  { id: 4, title: 'Training Milestone Reached', message: '85% of the Operations team has completed the annual Ergonomic Awareness module.', type: 'success', time: '5 hours ago', read: true, sender: 'Training Bot' },
  { id: 5, title: 'Bulk Reminder Sent', message: 'Compliance reminders have been sent to 14 employees with upcoming assessment deadlines.', type: 'info', time: '1 day ago', read: true, sender: 'HR_MANAGER_NAME' },
  { id: 6, title: 'System Maintenance', message: 'The SimplyDSE portal will be offline for scheduled maintenance on Sunday from 02:00 to 04:00 UTC.', type: 'warning', time: '2 days ago', read: true, sender: 'DevOps' },
];

export default function NotificationsPage() {
  const { fullName } = useProfile();
  const hrName = fullName || 'HR Manager';

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Notification Center</h2>
          <p className="text-[14px] text-slate-500 font-medium">Manage and track operational alerts, compliance reminders, and system updates.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
            <Settings className="w-4 h-4" />
            Preferences
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-3xl p-2 flex flex-col md:flex-row items-center gap-2 shadow-sm">
        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-2xl w-full md:w-auto">
          <TabButton label="All" active count={24} />
          <TabButton label="Unread" count={2} />
          <TabButton label="Critical" count={1} />
          <TabButton label="Workflows" count={8} />
        </div>
        <div className="relative flex-1 w-full p-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter notifications..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-[13px] focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-50">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={cn(
                "p-6 flex items-start gap-5 hover:bg-slate-50/50 transition-all group cursor-pointer relative",
                !notif.read && "bg-blue-50/30"
              )}
            >
              {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
              
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                notif.type === 'critical' ? "bg-rose-50 text-rose-600" :
                notif.type === 'high' ? "bg-amber-50 text-amber-600" :
                notif.type === 'success' ? "bg-emerald-50 text-emerald-600" :
                "bg-blue-50 text-blue-600"
              )}>
                {notif.type === 'critical' ? <Zap className="w-6 h-6" /> :
                 notif.type === 'high' ? <AlertTriangle className="w-6 h-6" /> :
                 notif.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
                 <Info className="w-6 h-6" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={cn(
                    "text-[15px] tracking-tight",
                    notif.read ? "text-slate-600 font-semibold" : "text-slate-900 font-bold"
                  )}>{notif.title}</h4>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{notif.time}</span>
                </div>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-2xl">{notif.message}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <User className="w-3.5 h-3.5" />
                    {notif.sender === 'HR_MANAGER_NAME' ? hrName : notif.sender}
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[11px] font-bold text-blue-600 hover:underline">Mark as read</button>
                    <button className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors">Dismiss</button>
                  </div>
                </div>
              </div>

              <button className="p-2 text-slate-300 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
          <button className="text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Load older notifications</button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, active, count }: any) {
  return (
    <button className={cn(
      "px-5 py-2 rounded-xl text-[12px] font-bold transition-all flex items-center gap-2",
      active ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
    )}>
      {label}
      {count !== undefined && (
        <span className={cn(
          "px-1.5 py-0.5 rounded-md text-[9px] font-black leading-none",
          active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
