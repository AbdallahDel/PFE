import React from 'react';
import { Users, Settings, Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import SideBar from './SideBar';
import Header from './Header';

const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation */}
      <Header/>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideBar/>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
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
              <div className="text-xs text-emerald-100 mb-1">TOTAL USERS</div>
              <div className="text-2xl">1,234</div>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg text-white">
              <div className="text-xs text-blue-100 mb-1">ACTIVE SESSIONS</div>
              <div className="text-2xl">56</div>
            </div>
            <div className="bg-violet-500 p-4 rounded-lg text-white">
              <div className="text-xs text-violet-100 mb-1">SYSTEM STATUS</div>
              <div className="text-2xl">OK</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;