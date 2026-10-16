import React from 'react';
import { Bell, Search, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar() {
  const { logout, switchRole, user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
           
          </div>
        </div>

        <div className="flex items-center space-x-4">
       

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}