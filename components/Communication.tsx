import React, { useState, useEffect, useRef } from 'react';
import { Project, EmailTemplate } from '../types';
import { Phone, Mail, Send, Check, Plus, Trash2, Edit3, Save, Loader2, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCallLog } from '../context/CallLogContext';
import { sendEmail } from '../services/emailService';

interface CommunicationProps {
  projects: Project[];
  initialProjectId?: string;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  { id: 't1', name: 'Project Update', thumbnail: 'bg-blue-50', subject: 'Weekly Project Update', body: 'Dear Client, Here is the latest progress on your project...' },
  { id: 't2', name: 'Invoice Due', thumbnail: 'bg-green-50', subject: 'Invoice Payment Reminder', body: 'Dear Client, This is a friendly reminder regarding the invoice...' },
  { id: 't3', name: 'Completion', thumbnail: 'bg-purple-50', subject: 'Project Completion Notice', body: 'We are happy to announce that your project has been completed!' },
  { id: 't4', name: 'Meeting Request', thumbnail: 'bg-orange-50', subject: 'Request for Sync Meeting', body: 'Would you be available for a quick sync later this week?' },
];

export const Communication: React.FC<CommunicationProps> = ({ projects, initialProjectId }) => {
  const { user } = useAuth();
  const { addLog } = useCallLog();
  const isAdmin = user?.role === 'admin';

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  // Call Timer State
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Template Management State
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [isManagingTemplates, setIsManagingTemplates] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({ name: '', subject: '', body: '' });

  // Derive unique clients from projects
  const uniqueClients = Array.from(new Set(projects.map(p => p.clientName))).map(name => {
    return projects.find(p => p.clientName === name);
  }).filter(Boolean) as Project[];

  // Handle Initial Selection for Deep Linking
  useEffect(() => {
    if (initialProjectId) {
      const project = projects.find(p => p.id === initialProjectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [initialProjectId, projects]);

  const handleStartCall = () => {
    setCallStartTime(new Date());
    setCallDuration(0);
    setShowCallModal(true);
    
    // Start active timer for UI display
    timerRef.current = window.setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (callStartTime && selectedProject) {
      const endTime = new Date();
      // Calculate final duration based on dates for accuracy
      const durationSeconds = Math.round((endTime.getTime() - callStartTime.getTime()) / 1000);

      addLog({
        clientName: selectedProject.clientName,
        clientPhone: selectedProject.clientPhone,
        callerName: user?.name || 'Unknown User',
        startTime: callStartTime.toISOString(),
        endTime: endTime.toISOString(),
        durationSeconds: durationSeconds,
        notes: 'Call completed via app dashboard'
      });
    }

    setShowCallModal(false);
    setCallStartTime(null);
    setCallDuration(0);
  };

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendEmail = async () => {
    const template = templates.find(t => t.id === selectedTemplate);
    
    if (selectedProject && template) {
        setEmailStatus('sending');
        
        await sendEmail({
          to: selectedProject.clientEmail || 'client@example.com',
          subject: template.subject,
          body: template.body,
          from: user?.email
        });

        setEmailStatus('sent');
        setTimeout(() => {
          setEmailStatus('idle');
          setSelectedTemplate(null);
          setSelectedProject(null);
        }, 2000);
    }
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this template?')) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        if (selectedTemplate === id) setSelectedTemplate(null);
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) return;
    
    const template: EmailTemplate = {
        id: `custom-${Date.now()}`,
        name: newTemplate.name,
        subject: newTemplate.subject,
        body: newTemplate.body,
        isCustom: true,
        thumbnail: 'bg-indigo-50'
    };

    setTemplates([...templates, template]);
    setNewTemplate({ name: '', subject: '', body: '' });
    setIsManagingTemplates(false);
  };

  if (isManagingTemplates && isAdmin) {
      return (
          <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-in fade-in">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800">Template Manager</h2>
                      <p className="text-slate-500">Create and manage email templates for your team.</p>
                  </div>
                  <button 
                      onClick={() => setIsManagingTemplates(false)}
                      className="text-slate-500 hover:text-slate-800 font-medium"
                  >
                      Cancel & Return
                  </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                      <h3 className="font-semibold text-lg text-slate-800">Create New Template</h3>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                              <input 
                                  type="text" 
                                  className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="e.g. Weekly Report"
                                  value={newTemplate.name}
                                  onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Email Subject</label>
                              <input 
                                  type="text" 
                                  className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Subject Line..."
                                  value={newTemplate.subject}
                                  onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Email Body</label>
                              <textarea 
                                  className="w-full h-48 px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                  placeholder="Write your template here..."
                                  value={newTemplate.body}
                                  onChange={e => setNewTemplate({...newTemplate, body: e.target.value})}
                              ></textarea>
                          </div>
                          <button 
                              onClick={handleCreateTemplate}
                              disabled={!newTemplate.name || !newTemplate.subject || !newTemplate.body}
                              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                              <Save size={18} />
                              Save Template
                          </button>
                      </div>
                  </div>

                  <div>
                      <h3 className="font-semibold text-lg text-slate-800 mb-6">Existing Templates</h3>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                          {templates.map(t => (
                              <div key={t.id} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors bg-slate-50 flex justify-between items-center group">
                                  <div>
                                      <div className="font-medium text-slate-900">{t.name}</div>
                                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{t.subject}</div>
                                  </div>
                                  {t.isCustom ? (
                                     <button 
                                        onClick={(e) => handleDeleteTemplate(t.id, e)}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Template"
                                     >
                                         <Trash2 size={16} />
                                     </button>
                                  ) : (
                                     <span className="text-xs text-slate-400 bg-slate-200 px-2 py-1 rounded">Default</span>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Client List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-140px)] flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Clients</h3>
          <p className="text-sm text-slate-500">Select a client to contact</p>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {uniqueClients.length === 0 ? (
             <div className="p-4 text-center text-slate-400 text-sm">No clients found from projects.</div>
          ) : (
            uniqueClients.map((client) => (
              <div 
                key={client.id}
                onClick={() => { setSelectedProject(client); setEmailStatus('idle'); }}
                className={`p-4 rounded-xl cursor-pointer transition-all mb-2 flex items-center justify-between group ${selectedProject?.id === client.id ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-slate-50 border border-transparent'}`}
              >
                <div>
                  <div className="font-semibold text-slate-800">{client.clientName}</div>
                  <div className="text-xs text-slate-500">{client.projectName}</div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(client);
                            handleStartCall();
                        }}
                        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                        title="Call Client"
                    >
                        <Phone size={14} />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Action Area */}
      <div className="lg:col-span-2 space-y-6">
        {selectedProject ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex flex-col gap-6 mb-8">
               <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-800">Compose Message</h2>
                    <p className="text-slate-500">Draft a new email or log a call.</p>
                 </div>
                 <div className="flex gap-2">
                     {isAdmin && (
                         <button 
                            onClick={() => setIsManagingTemplates(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                         >
                           <Edit3 size={16} />
                           <span>Manage Templates</span>
                         </button>
                     )}
                     <button 
                        onClick={handleStartCall}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm"
                     >
                       <Phone size={18} className="text-green-600" />
                       <span>Call Client</span>
                     </button>
                 </div>
               </div>

               {/* Prominent Contact Details Card */}
               <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-indigo-200">
                      {selectedProject.clientName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight">{selectedProject.clientName}</h3>
                      <p className="text-sm text-indigo-600 font-medium">{selectedProject.projectName}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full md:w-auto bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                        <Mail size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Email Address</span>
                        <span className="font-medium text-sm">{selectedProject.clientEmail || 'No email provided'}</span>
                      </div>
                    </div>
                    <div className="w-full h-px bg-slate-100"></div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                        <Phone size={16} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Phone Number</span>
                         <span className="font-medium text-sm">{selectedProject.clientPhone || 'No phone provided'}</span>
                      </div>
                    </div>
                  </div>
               </div>
             </div>

             {/* Template Grid */}
             <div className="mb-6">
               <label className="block text-sm font-medium text-slate-700 mb-3">Choose a Template</label>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {templates.map(t => (
                   <div 
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${selectedTemplate === t.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-100 hover:border-slate-300'}`}
                   >
                     <div className={`h-20 ${t.thumbnail || 'bg-slate-100'} flex items-center justify-center`}>
                        <Mail className="text-slate-400 opacity-50" />
                     </div>
                     <div className="p-3 bg-white">
                        <div className="text-xs font-semibold text-slate-800 truncate">{t.name}</div>
                     </div>
                   </div>
                 ))}
                 
                 {isAdmin && (
                     <div 
                        onClick={() => setIsManagingTemplates(true)}
                        className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center h-[124px] group"
                     >
                        <Plus className="text-slate-400 group-hover:text-indigo-500 mb-2" />
                        <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600">Add New</span>
                     </div>
                 )}
               </div>
             </div>

             {/* Editor Area (Simulated) */}
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                 <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                    value={templates.find(t => t.id === selectedTemplate)?.subject || ''}
                    readOnly={!selectedTemplate}
                    placeholder="Select a template..."
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                 <textarea 
                    className="w-full h-48 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-none"
                    value={templates.find(t => t.id === selectedTemplate)?.body || ''}
                    readOnly={!selectedTemplate}
                    placeholder="Select a template above to start..."
                 ></textarea>
               </div>
             </div>

             <div className="mt-6 flex justify-end">
               <button 
                  onClick={handleSendEmail}
                  disabled={!selectedTemplate || emailStatus === 'sending' || emailStatus === 'sent'}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white transition-all transform active:scale-95
                    ${emailStatus === 'sent' ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200'}
                    ${(!selectedTemplate) && 'opacity-50 cursor-not-allowed'}
                  `}
               >
                 {emailStatus === 'sending' ? (
                   <>
                     <Loader2 size={20} className="animate-spin" />
                     <span>Sending...</span>
                   </>
                 ) : emailStatus === 'sent' ? (
                    <>
                       <Check size={20} />
                       <span>Sent Successfully</span>
                    </>
                 ) : (
                    <>
                       <Send size={20} />
                       <span>Send Email</span>
                    </>
                 )}
               </button>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100/50 rounded-2xl border border-dashed border-slate-300">
             <Mail size={48} className="mb-4 opacity-20" />
             <p>Select a client from the list to start communicating.</p>
             {isAdmin && (
                 <button 
                    onClick={() => setIsManagingTemplates(true)}
                    className="mt-4 text-indigo-600 hover:underline text-sm font-medium"
                 >
                     Manage Templates
                 </button>
             )}
          </div>
        )}
      </div>

      {/* Call Modal Simulation */}
      {showCallModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
              
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse relative">
                <Phone size={32} className="text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">Connected to {selectedProject.clientName}</h3>
              <p className="text-slate-500 font-mono text-lg mb-6">{selectedProject.clientPhone || '+1 (555) 012-3456'}</p>

              <div className="flex items-center justify-center gap-2 mb-8 bg-slate-50 py-2 rounded-lg border border-slate-100">
                <Timer size={16} className="text-slate-400" />
                <span className="font-mono font-medium text-slate-700">{formatTime(callDuration)}</span>
              </div>
              
              <div className="flex gap-3 justify-center">
                 <button 
                    onClick={handleEndCall}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                 >
                   End Call
                 </button>
                 <a 
                    href={`tel:${selectedProject.clientPhone || '5550123456'}`}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                 >
                   Keypad
                 </a>
              </div>
              
              <p className="mt-6 text-xs text-slate-400">Call is being logged for administrative purposes.</p>
           </div>
        </div>
      )}
    </div>
  );
};