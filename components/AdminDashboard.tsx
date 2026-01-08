import React from 'react';
import { Project } from '../types';
import { useCallLog } from '../context/CallLogContext';
import { 
  Users, 
  Server, 
  Activity, 
  Database, 
  ShieldAlert,
  Clock,
  FileText,
  Settings,
  PhoneCall,
  Trash2
} from 'lucide-react';

interface AdminDashboardProps {
  projects: Project[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ projects }) => {
  const { logs, clearLogs } = useCallLog();

  // Mock System Stats
  const stats = {
    totalUsers: 12, // Mocked
    activeSessions: 3, // Mocked
    totalProjects: projects.length,
    systemUptime: '99.98%',
    dbSize: '45.2 MB',
    lastBackup: '2 hours ago'
  };

  const recentLogs = [
    { id: 1, action: 'User Login', user: 'Project Manager', time: '5 mins ago', type: 'info' },
    { id: 2, action: 'Project Created', user: 'Administrator', time: '1 hour ago', type: 'success' },
    { id: 3, action: 'System Backup', user: 'System', time: '2 hours ago', type: 'info' },
    { id: 4, action: 'Failed Login Attempt', user: 'Unknown IP', time: '4 hours ago', type: 'warning' },
    { id: 5, action: 'Email Template Deleted', user: 'Administrator', time: '1 day ago', type: 'warning' },
  ];

  // Helper to format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Administration</h2>
          <p className="text-slate-500">Overview of system performance and usage.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
           <ShieldAlert size={14} />
           <span>Admin Access Only</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users size={64} />
           </div>
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
               <Users size={24} />
             </div>
             <span className="text-sm font-medium text-slate-500">Total Users</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-3xl font-bold text-slate-800">{stats.totalUsers}</span>
             <span className="text-xs text-green-500 font-medium">+2 this week</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FileText size={64} />
           </div>
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
               <Activity size={24} />
             </div>
             <span className="text-sm font-medium text-slate-500">Total Projects</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-3xl font-bold text-slate-800">{stats.totalProjects}</span>
             <span className="text-xs text-slate-400">across system</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Server size={64} />
           </div>
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-green-50 text-green-600 rounded-xl">
               <Server size={24} />
             </div>
             <span className="text-sm font-medium text-slate-500">System Status</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-3xl font-bold text-slate-800">Healthy</span>
             <span className="text-xs text-green-600 font-medium">99.9% Uptime</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Database size={64} />
           </div>
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
               <Database size={24} />
             </div>
             <span className="text-sm font-medium text-slate-500">Database</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-3xl font-bold text-slate-800">{stats.dbSize}</span>
             <span className="text-xs text-slate-400">Last backup: {stats.lastBackup}</span>
           </div>
        </div>
      </div>

      {/* Call Logs Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <PhoneCall size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Call Logs</h3>
            </div>
            {logs.length > 0 && (
                <button 
                  onClick={() => { if(confirm('Clear all call logs?')) clearLogs(); }}
                  className="text-xs flex items-center gap-1 text-red-500 hover:text-red-700 px-3 py-1.5 bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={12} />
                  Clear Logs
                </button>
            )}
        </div>
        <div className="overflow-x-auto">
          {logs.length === 0 ? (
             <div className="p-12 text-center text-slate-400">
                <PhoneCall size={32} className="mx-auto mb-3 opacity-20" />
                <p>No calls have been recorded yet.</p>
             </div>
          ) : (
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                   <tr>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Caller (Staff)</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Notes</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                         <td className="px-6 py-4 text-slate-600">
                            {new Date(log.startTime).toLocaleString()}
                         </td>
                         <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{log.clientName}</div>
                            <div className="text-xs text-slate-500">{log.clientPhone}</div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                  {log.callerName.charAt(0)}
                               </div>
                               <span className="text-slate-700">{log.callerName}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 font-mono text-slate-600">
                            {formatDuration(log.durationSeconds)}
                         </td>
                         <td className="px-6 py-4 text-slate-500 italic">
                            {log.notes || '-'}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Logs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-800">Recent System Logs</h3>
             <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
           </div>
           <div className="divide-y divide-slate-100">
             {recentLogs.map((log) => (
               <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-4">
                   <div className={`w-2 h-2 rounded-full ${
                     log.type === 'success' ? 'bg-green-500' :
                     log.type === 'warning' ? 'bg-amber-500' :
                     'bg-blue-500'
                   }`} />
                   <div>
                     <div className="font-medium text-slate-800">{log.action}</div>
                     <div className="text-xs text-slate-500">by {log.user}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-1 text-xs text-slate-400">
                   <Clock size={12} />
                   <span>{log.time}</span>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
           <div className="space-y-3">
             <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3 group">
                <Users size={18} className="text-slate-400 group-hover:text-indigo-600" />
                <span className="font-medium">Manage Users</span>
             </button>
             <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3 group">
                <Database size={18} className="text-slate-400 group-hover:text-indigo-600" />
                <span className="font-medium">Backup Database</span>
             </button>
             <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3 group">
                <Settings size={18} className="text-slate-400 group-hover:text-indigo-600" />
                <span className="font-medium">System Settings</span>
             </button>
              <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3 group">
                <ShieldAlert size={18} className="text-slate-400 group-hover:text-indigo-600" />
                <span className="font-medium">Security Logs</span>
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};