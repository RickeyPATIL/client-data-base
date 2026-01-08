import React from 'react';
import { Project, AppTab } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onNavigate: (tab: AppTab, projectId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onNavigate }) => {
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'Completed').length,
    atRisk: projects.filter(p => p.status === 'At Risk').length,
    onTrack: projects.filter(p => p.status === 'On Track').length,
  };

  const data = [
    { name: 'Completed', value: stats.completed, color: '#22c55e' },
    { name: 'On Track', value: stats.onTrack, color: '#3b82f6' },
    { name: 'At Risk', value: stats.atRisk, color: '#ef4444' },
    { name: 'Pending', value: stats.total - (stats.completed + stats.atRisk + stats.onTrack), color: '#cbd5e1' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate(AppTab.PROJECTS)}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow group"
        >
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
             <TrendingUp size={24} />
           </div>
           <div>
             <div className="text-slate-500 text-sm font-medium">Total Projects</div>
             <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
           </div>
        </div>
        <div 
          onClick={() => onNavigate(AppTab.PROJECTS)}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow group"
        >
           <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
             <CheckCircle2 size={24} />
           </div>
           <div>
             <div className="text-slate-500 text-sm font-medium">Completed</div>
             <div className="text-2xl font-bold text-slate-800">{stats.completed}</div>
           </div>
        </div>
        <div 
          onClick={() => onNavigate(AppTab.PROJECTS)}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow group"
        >
           <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
             <AlertCircle size={24} />
           </div>
           <div>
             <div className="text-slate-500 text-sm font-medium">At Risk</div>
             <div className="text-2xl font-bold text-slate-800">{stats.atRisk}</div>
           </div>
        </div>
        <div 
          onClick={() => onNavigate(AppTab.COMMUNICATION)}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow group"
        >
           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
             <Users size={24} />
           </div>
           <div>
             <div className="text-slate-500 text-sm font-medium">Active Clients</div>
             <div className="text-2xl font-bold text-slate-800">{new Set(projects.map(p => p.clientName)).size}</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Project Status Distribution</h3>
           {data.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
           )}
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80 overflow-y-auto">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {projects.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 text-sm">
                 <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                 <span className="text-slate-600">New project <strong>{p.projectName}</strong> added for {p.clientName}.</span>
              </div>
            ))}
            {projects.length === 0 && <div className="text-slate-400 text-center mt-10">No recent activity</div>}
          </div>
        </div>
      </div>
    </div>
  );
};