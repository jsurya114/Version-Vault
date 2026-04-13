import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex overflow-hidden relative">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Content Area */}
        <main className="flex-1 p-3 xs:p-4 sm:p-6 overflow-y-auto overflow-x-hidden">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-2 xs:py-3 px-3 xs:px-4 sm:px-6 flex flex-col xs:flex-row items-center justify-between bg-gray-950/50 shrink-0 gap-1">
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
