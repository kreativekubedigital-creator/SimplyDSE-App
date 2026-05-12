'use client';

import React from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Megaphone, 
  Mail, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Calendar,
  Eye,
  BarChart2,
  ChevronRight,
  MessageCircle,
  Target,
  Zap,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const activeCampaigns = [
  { id: 'CAM-01', name: 'Annual Assessment Kick-off', type: 'Broadcast', sent: 'May 10, 2024', reach: '1,248', engagement: '92%', status: 'Completed' },
  { id: 'CAM-02', name: 'Overdue Warning - Engineering', type: 'Targeted', sent: 'Today', reach: '42', engagement: '15%', status: 'Active' },
  { id: 'CAM-03', name: 'New Ergonomic Guidance', type: 'Newsletter', sent: 'May 05, 2024', reach: '1,248', engagement: '64%', status: 'Completed' },
  { id: 'CAM-04', name: 'Desk Setup Workshop Invite', type: 'Broadcast', sent: 'May 12, 2024', reach: '500', engagement: '0%', status: 'Scheduled' },
];

export default function CommunicationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Internal Communications</h2>
          <p className="text-[14px] text-slate-500 font-medium">Manage employee outreach, compliance announcements, and automated reminder campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
            <Calendar className="w-4 h-4" />
            Schedule
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sent</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900">8,422</h4>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Communications this month</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Rate</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900">74.2%</h4>
          <p className="text-[11px] text-emerald-500 font-bold mt-1">+5.2% vs last month</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Response</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900">42.8%</h4>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Action completion rate</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audience</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900">1,248</h4>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Total active reach</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Campaign Management */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Active Campaigns</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search campaigns..." 
                  className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-50">
              {activeCampaigns.map((camp) => (
                <div key={camp.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      camp.type === 'Broadcast' ? "bg-blue-50 text-blue-600" :
                      camp.type === 'Targeted' ? "bg-amber-50 text-amber-600" :
                      "bg-indigo-50 text-indigo-600"
                    )}>
                      {camp.type === 'Broadcast' ? <Megaphone className="w-6 h-6" /> : 
                       camp.type === 'Targeted' ? <Target className="w-6 h-6" /> : 
                       <Mail className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">{camp.name}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{camp.type}</span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                          <Users className="w-3.5 h-3.5" />
                          {camp.reach} Recipients
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                          <BarChart2 className="w-3.5 h-3.5" />
                          {camp.engagement} Engagement
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight",
                      camp.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                      camp.status === 'Active' ? "bg-blue-50 text-blue-600" :
                      "bg-amber-50 text-amber-600"
                    )}>
                      {camp.status}
                    </span>
                    <button className="p-2 text-slate-300 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Messaging */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Direct Outreach</h3>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h4 className="text-[15px] font-bold text-slate-900 mb-6">Active Discussions</h4>
            <div className="space-y-4">
              <ChatItem name="Alice Thompson" msg="Question about ergonomic chair..." time="10m ago" unread />
              <ChatItem name="David Chen" msg="Compliance report for Engineering..." time="2h ago" />
              <ChatItem name="Emma Wilson" msg="Assistance with DSE assessment..." time="5h ago" unread />
              <ChatItem name="Marketing Team" msg="Bulk reminder sent to all leads..." time="1d ago" />
            </div>
            <button className="w-full mt-8 py-3 bg-slate-900 text-white hover:bg-slate-800 text-[13px] font-bold rounded-xl transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Open Message Center
            </button>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">Automated Triggers</h4>
              <p className="text-slate-400 text-[13px] leading-relaxed mb-6">
                Your communication workflow is currently handling <span className="text-blue-400 font-bold">156 automated reminders</span> per day.
              </p>
              <button className="text-[12px] font-bold text-blue-400 flex items-center gap-1 group/btn">
                Edit trigger logic
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-20 h-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatItem({ name, msg, time, unread }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          {unread && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-600 border-2 border-white rounded-full" />}
        </div>
        <div className="min-w-0">
          <p className={cn("text-[13px] leading-none", unread ? "font-bold text-slate-900" : "font-semibold text-slate-700")}>{name}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1.5 truncate max-w-[120px]">{msg}</p>
        </div>
      </div>
      <span className="text-[11px] font-bold text-slate-300">{time}</span>
    </div>
  );
}
