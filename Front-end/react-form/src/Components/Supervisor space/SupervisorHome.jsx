import React, { useState } from 'react';
import { LogOut, Search, Layout, Users, FolderKanban } from 'lucide-react';

export default function SupervisorHome() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/logOut.php', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowConfirm(false);
    }
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6">
            {/* Search Bar */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex items-center w-64 px-3 py-2 bg-white border rounded hover:border-indigo-400 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-colors">
                <Search className="h-4 w-4 text-slate-400" />
                <input 
                  className="bg-transparent outline-none text-sm w-full ml-2" 
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-500 p-4 rounded-lg text-white">
                <div className="text-xs text-emerald-100 mb-1">MY PROJECTS</div>
                <div className="text-2xl">5</div>
              </div>
              <div className="bg-blue-500 p-4 rounded-lg text-white">
                <div className="text-xs text-blue-100 mb-1">ACTIVE TEAMS</div>
                <div className="text-2xl">3</div>
              </div>
              <div className="bg-violet-500 p-4 rounded-lg text-white">
                <div className="text-xs text-violet-100 mb-1">TOTAL STUDENTS</div>
                <div className="text-2xl">12</div>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Projects</h2>
            {/* Projects content will go here */}
          </div>
        );
      case 'teams':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Teams</h2>
            {/* Teams content will go here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="text-lg text-white">SUPERVISOR SPACE</div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white bg-red-800 rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="h-full bg-white border-r w-48">
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  activeTab === 'dashboard'
                    ? 'text-white bg-indigo-500'
                    : 'text-slate-600 hover:bg-indigo-50'
                }`}
              >
                <Layout size={18} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  activeTab === 'projects'
                    ? 'text-white bg-indigo-500'
                    : 'text-slate-600 hover:bg-indigo-50'
                }`}
              >
                <FolderKanban size={18} />
                Projects
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  activeTab === 'teams'
                    ? 'text-white bg-indigo-500'
                    : 'text-slate-600 hover:bg-indigo-50'
                }`}
              >
                <Users size={18} />
                Teams
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {renderContent()}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4">Are you sure you want to logout?</h3>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelLogout}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}