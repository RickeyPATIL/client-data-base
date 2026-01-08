import React from 'react';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Mail, 
  Wand2, 
  Settings, 
  LogOut,
  Menu,
  X,
  UserCircle,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { AppTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { logout, user } = useAuth();

  const navItems = [
    { id: AppTab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppTab.PROJECTS, label: 'Projects & Gantt', icon: KanbanSquare },
    { id: AppTab.COMMUNICATION, label: 'Client Comms', icon: Mail },
    { id: AppTab.IMAGE_STUDIO, label: 'Image Studio', icon: Wand2 },
  ];

  if (user?.role === 'admin') {
    navItems.unshift({ id: AppTab.ADMIN_DASHBOARD, label: 'Admin Console', icon: ShieldCheck });
  }

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <span className="text-xl font-bold text-slate-800">ProjectFlow</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-4">
        <div className="px-4">
           <a 
             href="https://projectflow.ai" 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors group"
           >
             <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-50">
               <Globe size={18} />
             </div>
             <span className="text-sm font-medium">Company Website</span>
           </a>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
           {user?.avatar ? (
             <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full" />
           ) : (
             <UserCircle size={32} className="text-slate-400" />
           )}
           <div className="overflow-hidden">
             <div className="text-sm font-semibold text-slate-800 truncate">{user?.name}</div>
             <div className="text-xs text-slate-500 truncate capitalize">{user?.role}</div>
           </div>
        </div>

        <div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-800 transition-colors">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 fixed h-full z-20 overflow-y-auto">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-lg font-bold text-slate-800">ProjectFlow</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-20 pt-16 flex flex-col overflow-y-auto">
          <NavContent />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};