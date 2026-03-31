import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <AdminHeader />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-3 px-6 flex items-center justify-between bg-gray-950/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">
              Live System Updates
            </span>
          </div>
          <p className="text-gray-700 text-[10px] font-medium uppercase tracking-tighter">
            VersionVault IPC v4.12.0 • © 2024 Secure Systems Inc.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
