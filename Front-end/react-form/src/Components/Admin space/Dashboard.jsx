import React, { useState, useEffect } from 'react';
import { Users, Settings, Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import SideBar from './SideBar';
import Header from './Header';

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(null);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const response = await fetch('http://localhost/PFE/Back-end/totaleUsers.php', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTotalUsers(data.total_users);
      } catch (err) {
        console.error('Failed to fetch total users:', err);
        setTotalUsers(0);
      }
    };

    fetchTotalUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Navigation */}
      <Header/>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Sidebar */}
        <SideBar/>

        {/* Main Content */}
        <div className="flex-1 p-6">
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
              <div className="text-2xl ">
                {totalUsers !== null ? totalUsers.toLocaleString() : '...'}
              </div>
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

          {/* Content Area */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
