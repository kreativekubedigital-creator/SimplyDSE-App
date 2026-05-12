'use client';

import React from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  MoreHorizontal,
  FolderOpen,
  ShieldCheck,
  FileBadge,
  Archive,
  Download,
  Eye,
  History,
  Trash2,
  FileCode,
  FileImage,
  Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';

const documents = [
  { id: 'DOC-001', name: 'Workplace Safety Policy 2024', category: 'Policies', type: 'PDF', size: '1.2 MB', updated: '2 days ago', version: 'v2.4', status: 'Active' },
  { id: 'DOC-002', name: 'DSE Assessment Template', category: 'Templates', type: 'DOCX', size: '450 KB', updated: '1 week ago', version: 'v1.2', status: 'Active' },
  { id: 'DOC-003', name: 'Employee Health & Safety Evidence', category: 'Evidence', type: 'ZIP', size: '14.8 MB', updated: 'May 10, 2024', version: 'v1.0', status: 'Archived' },
  { id: 'DOC-004', name: 'TechCorp Office Layout Plan', category: 'Infrastructure', type: 'PNG', size: '2.8 MB', updated: 'May 08, 2024', version: 'v3.1', status: 'Active' },
  { id: 'DOC-005', name: 'Compliance Certificate - Q1', category: 'Certificates', type: 'PDF', size: '840 KB', updated: 'May 01, 2024', version: 'v1.0', status: 'Active' },
];

export default function DocumentsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Document Management</h2>
          <p className="text-[14px] text-slate-500 font-medium">Store, manage, and track versions of compliance evidence and organizational policies.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
            <FolderOpen className="w-4 h-4" />
            New Folder
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StorageCard title="Total Storage" value="4.2 GB" usage={65} icon={Archive} color="blue" />
        <StorageCard title="Policies" value="128 Files" usage={42} icon={ShieldCheck} color="emerald" />
        <StorageCard title="Evidence" value="842 Files" usage={88} icon={FileBadge} color="amber" />
        <StorageCard title="Templates" value="45 Files" usage={15} icon={FileText} color="indigo" />
      </div>

      {/* Browser Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search files, categories, or extensions..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 focus:outline-none">
            <option>Category: All</option>
            <option>Policies</option>
            <option>Evidence</option>
            <option>Templates</option>
          </select>
        </div>
      </div>

      {/* Document Table */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Name / ID</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Updated</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Size</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Version</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                        doc.type === 'PDF' ? "bg-rose-50 text-rose-600" :
                        doc.type === 'DOCX' ? "bg-blue-50 text-blue-600" :
                        doc.type === 'PNG' ? "bg-indigo-50 text-indigo-600" :
                        "bg-amber-50 text-amber-600"
                      )}>
                        {doc.type === 'PDF' ? <FileText className="w-5 h-5" /> : 
                         doc.type === 'DOCX' ? <FileCode className="w-5 h-5" /> : 
                         doc.type === 'PNG' ? <FileImage className="w-5 h-5" /> : 
                         <Folder className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-900 leading-none group-hover:text-blue-600 transition-colors cursor-pointer">{doc.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1.5">{doc.id} • {doc.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[13px] font-semibold text-slate-600">{doc.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[13px] font-medium text-slate-500">{doc.updated}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[13px] font-medium text-slate-400">{doc.size}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold text-slate-600">{doc.version}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight",
                      doc.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                    )}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Download">
                        <Download className="w-4.5 h-4.5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="History">
                        <History className="w-4.5 h-4.5" />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StorageCard({ title, value, usage, icon: Icon, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  const progressColors: any = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    indigo: "bg-indigo-500",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">{title}</p>
          <h4 className="text-xl font-bold text-slate-900 mt-1">{value}</h4>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Usage</span>
          <span className="text-[10px] font-bold text-slate-600">{usage}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-1000", progressColors[color])} style={{ width: `${usage}%` }} />
        </div>
      </div>
    </div>
  );
}
