import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Projects } from './components/Projects';
import { Communication } from './components/Communication';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ImageStudio } from './components/ImageStudio';
import { AiChatbot } from './components/AiChatbot';
import { Login } from './components/Login';
import { AppTab, Project } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CallLogProvider } from './context/CallLogContext';

// Mock initial data so the app isn't empty on load
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    projectName: 'Website Redesign',
    clientName: 'Acme Corp',
    clientEmail: 'contact@acme.com',
    clientPhone: '555-0101',
    startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 20).toISOString(),
    managerEmail: 'pm@flow.com',
    status: 'On Track',
    progress: 35
  },
  {
    id: '2',
    projectName: 'Mobile App Dev',
    clientName: 'TechStart Inc',
    clientEmail: 'ceo@techstart.io',
    clientPhone: '555-0102',
    startDate: new Date(Date.now() - 86400000 * 15).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 5).toISOString(), // Expiring soon
    managerEmail: 'pm@flow.com',
    status: 'At Risk',
    progress: 80
  }
];

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  const handleNavigate = (tab: AppTab, projectId?: string) => {
    setActiveTab(tab);
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <Dashboard projects={projects} onNavigate={handleNavigate} />;
      case AppTab.ADMIN_DASHBOARD:
        // Basic security check: if not admin, fallback to normal dashboard
        return user.role === 'admin' ? <AdminDashboard projects={projects} /> : <Dashboard projects={projects} onNavigate={handleNavigate} />;
      case AppTab.PROJECTS:
        return <Projects projects={projects} setProjects={setProjects} onNavigate={handleNavigate} />;
      case AppTab.COMMUNICATION:
        return <Communication projects={projects} initialProjectId={selectedProjectId} />;
      case AppTab.IMAGE_STUDIO:
        return <ImageStudio />;
      default:
        return <Dashboard projects={projects} onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      <AiChatbot />
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CallLogProvider>
        <MainApp />
      </CallLogProvider>
    </AuthProvider>
  );
};