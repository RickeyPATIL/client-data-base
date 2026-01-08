import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  AlertTriangle, 
  FileSpreadsheet,
  AlertCircle,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { Project, AppTab } from '../types';
import { sendEmail } from '../services/emailService';

interface ProjectsProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  onNavigate: (tab: AppTab, projectId?: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ projects, setProjects, onNavigate }) => {
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('gantt');
  const [sentAlerts, setSentAlerts] = useState<Set<string>>(new Set());

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Map Excel data to our Project interface (rough mapping assumption)
      const mappedProjects: Project[] = data.map((row: any, index: number) => ({
        id: `prj-${index}-${Date.now()}`,
        projectName: row['Project Name'] || `Project ${index + 1}`,
        clientName: row['Client Name'] || 'Unknown Client',
        clientEmail: row['Client Email'] || '',
        clientPhone: row['Client Phone'] || '',
        startDate: row['Start Date'] ? new Date(row['Start Date']).toISOString() : new Date().toISOString(),
        endDate: row['End Date'] ? new Date(row['End Date']).toISOString() : new Date(Date.now() + 86400000 * 30).toISOString(),
        managerEmail: row['Manager Email'] || '',
        status: row['Status'] || 'Pending',
        progress: row['Progress'] || 0
      }));

      setProjects(prev => [...prev, ...mappedProjects]);
    };
    reader.readAsBinaryString(file);
  };

  // Helper to check expiry
  const checkExpiry = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Automatic Email Notification for Expiring Projects
  useEffect(() => {
    const checkAndSendAlerts = async () => {
        let hasNewAlerts = false;
        const newSentAlerts = new Set(sentAlerts);

        for (const project of projects) {
            const daysLeft = checkExpiry(project.endDate);
            // Trigger alert if <= 15 days, not expired, and not already sent this session
            if (daysLeft <= 15 && daysLeft > 0 && !sentAlerts.has(project.id)) {
                await sendEmail({
                    to: project.managerEmail || 'manager@flow.com',
                    subject: `⚠️ Action Required: "${project.projectName}" Expires in ${daysLeft} Days`,
                    body: `Hello Project Manager,\n\nThis is an automated alert to inform you that the project "${project.projectName}" for client ${project.clientName} is approaching its deadline on ${new Date(project.endDate).toLocaleDateString()}.\n\nCurrent Status: ${project.status}\nProgress: ${project.progress}%\n\nPlease ensure all deliverables are on track.\n\nBest,\nProjectFlow AI`
                });
                newSentAlerts.add(project.id);
                hasNewAlerts = true;
            }
        }

        if (hasNewAlerts) {
            setSentAlerts(newSentAlerts);
        }
    };

    checkAndSendAlerts();
  }, [projects, sentAlerts]);

  // Gantt Chart Logic
  const ganttData = useMemo(() => {
    if (projects.length === 0) {
        const now = new Date();
        return { minStart: now, maxEnd: now, totalDuration: 0 };
    }
    
    // Find global min start and max end
    const startDates = projects.map(p => new Date(p.startDate).getTime());
    const endDates = projects.map(p => new Date(p.endDate).getTime());
    const minStart = new Date(Math.min(...startDates));
    const maxEnd = new Date(Math.max(...endDates));
    
    // Add buffer
    minStart.setDate(minStart.getDate() - 5);
    maxEnd.setDate(maxEnd.getDate() + 5);

    const totalDuration = maxEnd.getTime() - minStart.getTime();

    return { minStart, maxEnd, totalDuration };
  }, [projects]);

  const getPosition = (dateStr: string) => {
    if (ganttData.totalDuration === 0) return 0;
    const date = new Date(dateStr).getTime();
    const start = ganttData.minStart.getTime();
    const percent = ((date - start) / ganttData.totalDuration) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  const getWidth = (startStr: string, endStr: string) => {
    const s = getPosition(startStr);
    const e = getPosition(endStr);
    return Math.max(1, e - s); // Min width 1%
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Projects & Timeline</h2>
          <p className="text-slate-500">Manage timelines and monitor deadlines.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
            <Upload size={18} className="text-indigo-600" />
            <span className="text-sm font-medium">Import Excel</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'gantt' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              Gantt
            </button>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Projects Yet</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">Upload an Excel file to get started. The file should have columns for Project Name, Client Name, Start Date, and End Date.</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors">
            <Upload size={20} />
            <span>Upload Excel Sheet</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <>
          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-700">Project</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Client</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Timeline</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map((p) => {
                      const daysLeft = checkExpiry(p.endDate);
                      const isExpiring = daysLeft <= 15 && daysLeft > 0;
                      
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{p.projectName}</div>
                            {isExpiring && (
                               <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                 <AlertCircle size={12} />
                                 <span>Expiring in {daysLeft} days</span>
                               </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-600">{p.clientName}</td>
                          <td className="px-6 py-4 text-slate-600">
                             <div className="flex flex-col text-xs">
                               <div className="flex items-center gap-1">
                                  <Calendar size={12} className="text-slate-400"/>
                                  <span>{new Date(p.startDate).toLocaleDateString()}</span>
                               </div>
                               <span className="text-slate-400 pl-4 text-[10px]">to</span>
                               <div className="flex items-center gap-1">
                                  <Calendar size={12} className="text-slate-400"/>
                                  <span>{new Date(p.endDate).toLocaleDateString()}</span>
                               </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${p.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                p.status === 'At Risk' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <a 
                                  href={`tel:${p.clientPhone}`}
                                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                  title={`Call ${p.clientPhone}`}
                                >
                                  <Phone size={16} />
                                </a>
                                <button 
                                  onClick={() => onNavigate(AppTab.COMMUNICATION, p.id)}
                                  className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                  title="Send Email"
                                >
                                  <Mail size={16} />
                                </button>
                                {sentAlerts.has(p.id) && (
                                  <div className="ml-2 text-xs text-slate-400" title="Auto-alert sent to manager">
                                     <AlertCircle size={14} />
                                  </div>
                                )}
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gantt View */}
          {viewMode === 'gantt' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
               {/* Timeline Header - Simplified representation */}
               <div className="mb-4 flex justify-between text-xs text-slate-400 border-b border-slate-100 pb-2">
                 <span>{ganttData.minStart.toLocaleDateString()}</span>
                 <span>{ganttData.maxEnd.toLocaleDateString()}</span>
               </div>
               
               <div className="space-y-6 relative min-h-[400px]">
                  {/* Grid Lines Background */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
                     {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-full w-px bg-slate-900"></div>
                     ))}
                  </div>

                  {projects.map((p) => {
                    const left = getPosition(p.startDate);
                    const width = getWidth(p.startDate, p.endDate);
                    const daysLeft = checkExpiry(p.endDate);
                    const isExpiring = daysLeft <= 15 && daysLeft > 0;
                    const isOverdue = daysLeft < 0 && p.status !== 'Completed';

                    return (
                      <div key={p.id} className="relative z-10 group">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="w-48 flex-shrink-0">
                            <div className="font-medium text-sm text-slate-800 truncate">{p.projectName}</div>
                            <div className="flex items-center gap-2">
                               <div className="text-xs text-slate-500 truncate max-w-[120px]">{p.clientName}</div>
                               <button 
                                  onClick={() => onNavigate(AppTab.COMMUNICATION, p.id)}
                                  className="p-1 rounded-full hover:bg-slate-100 text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                                  title="Contact Client"
                               >
                                  <Mail size={12} />
                               </button>
                            </div>
                          </div>
                          
                          <div className="flex-1 h-8 bg-slate-50 rounded-full relative overflow-hidden border border-slate-100">
                             <div 
                               className={`absolute top-0 bottom-0 rounded-full flex items-center px-3 transition-all duration-500 group-hover:shadow-md cursor-pointer
                                ${isOverdue ? 'bg-red-500' : isExpiring ? 'bg-amber-400' : 'bg-indigo-500'}
                               `}
                               style={{ left: `${left}%`, width: `${width}%` }}
                               title={`${new Date(p.startDate).toLocaleDateString()} - ${new Date(p.endDate).toLocaleDateString()}`}
                             >
                               <span className="text-[10px] text-white font-medium truncate">{p.progress}%</span>
                             </div>
                          </div>
                        </div>
                        {isExpiring && (
                            <div className="ml-48 text-[10px] text-amber-600 flex items-center gap-1">
                                <AlertTriangle size={10} />
                                <span>Expiring soon: Auto-mail sent to manager.</span>
                            </div>
                        )}
                      </div>
                    );
                  })}
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};