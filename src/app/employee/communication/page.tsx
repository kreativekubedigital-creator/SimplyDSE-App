'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MessageSquare, 
  Bell, 
  LifeBuoy, 
  Search, 
  MoreHorizontal, 
  Send, 
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  HelpCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';

export default function CommunicationHubPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'messages' | 'notifications' | 'support' || 'messages';
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications' | 'support'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '2' },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3' },
    { id: 'support', label: 'Help & Support', icon: LifeBuoy },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Communication Hub</h1>
          <p className="text-[13px] text-slate-500 mt-1">Connect with support, review your notifications, and manage system messages.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
            Mark all as read
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95">
            <Send className="w-4 h-4" />
            Contact Advisor
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-bold transition-all relative",
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-lg" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge && (
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-black",
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-rose-500 text-white"
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Chat List */}
          <div className="lg:col-span-4 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-6 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {[
                { name: 'Admin Support', last: 'Your report is now available.', time: '2h ago', unread: true, active: true },
                { name: 'Health Advisor', last: 'Please review your chair setup.', time: '5h ago', unread: true },
                { name: 'IT Helpdesk', last: 'Software update complete.', time: 'Yesterday', unread: false },
              ].map((chat, i) => (
                <div key={i} className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer group",
                  chat.active ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white border-slate-100 hover:bg-slate-50"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={cn("text-[13px] font-bold truncate", chat.active ? "text-white" : "text-slate-900")}>{chat.name}</p>
                    <p className={cn("text-[10px] font-medium shrink-0", chat.active ? "text-blue-100" : "text-slate-400")}>{chat.time}</p>
                  </div>
                  <p className={cn("text-[11px] truncate leading-snug", chat.active ? "text-blue-50" : "text-slate-500 font-medium")}>{chat.last}</p>
                  {chat.unread && !chat.active && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-8 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] shadow-sm flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">AS</div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none">Admin Support</h3>
                  <p className="text-[11px] text-emerald-500 font-bold mt-1 uppercase tracking-widest">Online</p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto space-y-6">
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-widest">Today</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-500">AS</div>
                <div className="max-w-[70%] p-4 bg-slate-100 rounded-2xl rounded-tl-none">
                  <p className="text-[13px] text-slate-800 leading-relaxed font-medium">
                    Hello Olivia, I've reviewed your latest DSE assessment. Your workstation setup looks great, but I noticed you mentioned some wrist strain.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">OB</div>
                <div className="max-w-[70%] p-4 bg-blue-600 rounded-2xl rounded-tr-none text-white shadow-lg shadow-blue-600/20">
                  <p className="text-[13px] leading-relaxed font-medium">
                    Yes, I've been feeling it after long typing sessions. What do you recommend?
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-500">AS</div>
                <div className="max-w-[70%] p-4 bg-slate-100 rounded-2xl rounded-tl-none">
                  <p className="text-[13px] text-slate-800 leading-relaxed font-medium">
                    I've attached a guide on wrist placement and some quick exercises. Let me know if that helps!
                  </p>
                  <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 leading-none">Wrist_Health_Guide.pdf</p>
                      <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">2.4 MB</p>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 ml-auto cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-2 flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] font-medium px-4"
                />
                <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-[1.05] transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Unread" value="3" trend="New today" isPositive={false} icon={Bell} iconColor="blue" />
            <StatCard title="Priority" value="1" trend="Action required" isPositive={false} icon={AlertTriangle} iconColor="rose" />
            <StatCard title="Archived" value="12" trend="Last 30 days" icon={CheckCircle2} iconColor="slate" />
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">All Notifications</h3>
              <select className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none">
                <option>All Types</option>
                <option>System</option>
                <option>Health</option>
                <option>Support</option>
              </select>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { title: 'New Assessment Assigned', body: 'Your quarterly DSE assessment is now available for completion.', time: '2h ago', type: 'system', unread: true },
                { title: 'Risk Level Update', body: 'Your workstation risk level has been updated to LOW after your recent review.', time: '5h ago', type: 'health', unread: true },
                { title: 'Message from Advisor', body: 'Admin Support sent you a message regarding your wrist health inquiry.', time: '1d ago', type: 'support', unread: true },
                { title: 'Documents Verified', body: 'Your workstation setup photos have been reviewed and verified by HR.', time: '3d ago', type: 'system', unread: false },
                { title: 'System Maintenance', body: 'SimplyDSE will be undergoing scheduled maintenance this Sunday.', time: '4d ago', type: 'system', unread: false },
              ].map((notif, i) => (
                <div key={i} className={cn(
                  "p-8 flex items-start gap-6 hover:bg-slate-50/50 transition-colors cursor-pointer group",
                  notif.unread && "bg-blue-50/30"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                    notif.type === 'system' ? "bg-blue-50 text-blue-600" :
                    notif.type === 'health' ? "bg-emerald-50 text-emerald-600" :
                    "bg-purple-50 text-purple-600"
                  )}>
                    {notif.type === 'system' ? <Bell className="w-6 h-6" /> :
                     notif.type === 'health' ? <ShieldCheck className="w-6 h-6" /> :
                     <MessageSquare className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[14px] font-bold text-slate-900">{notif.title}</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{notif.time}</p>
                    </div>
                    <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{notif.body}</p>
                  </div>
                  {notif.unread && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 group-hover:scale-125 transition-transform" />
                  )}
                </div>
              ))}
            </div>
            <div className="p-8 bg-slate-50/50 flex justify-center">
              <button className="text-[12px] font-bold text-blue-600 hover:underline">Load older notifications</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center text-center group hover:border-blue-200 transition-all">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Knowledge Base</h3>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-8">Search our library for instant answers to common DSE questions.</p>
              <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-[12px] font-bold hover:scale-[1.05] transition-all active:scale-95">Browse Articles</button>
            </div>

            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 transition-all">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LifeBuoy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Support Tickets</h3>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-8">Open a ticket for technical issues or detailed health concerns.</p>
              <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-[12px] font-bold hover:scale-[1.05] transition-all active:scale-95">View My Tickets</button>
            </div>

            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center text-center group hover:border-rose-200 transition-all">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Emergency Contact</h3>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-8">If you have severe pain, contact our occupational health team immediately.</p>
              <button className="w-full py-3 bg-rose-600 text-white rounded-xl text-[12px] font-bold hover:scale-[1.05] transition-all active:scale-95 shadow-xl shadow-rose-900/20">Call Now</button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-600/20 transition-all duration-700" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 tracking-tight">Still need help?</h3>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Our team of DSE specialists and ergonomics experts are here to help you stay healthy at work. 
                  Reach out via chat or email anytime.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Email Support</p>
                      <p className="text-[14px] font-bold">support@simplydse.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Live Chat</p>
                      <p className="text-[14px] font-bold">Mon-Fri, 9am-5pm</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <img 
                  src="https://ouch-cdn2.icons8.com/P_V_H_v_o_y_X_u_s_Z_v_o_y_X_u_s.png" 
                  alt="Support Illustration" 
                  className="w-full max-w-sm mx-auto animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
